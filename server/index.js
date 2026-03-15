const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Op } = require('sequelize');
const { config, validateConfig } = require('./config');
const { logger, requestLogger, getLogContext } = require('./logger');
const { ARCHETYPES, PROFILE_OPTIONS, MODULES } = require('./constants');
const {
  models,
  computeOnboardingStatus,
  ensureUserRecord,
  getOrCreatePlayerProfile,
  getProfileWithAvatar,
  sequelize,
  syncAppDb,
} = require('./appDb');
const { AIService } = require('./aiService');
const { GEOCODE_FALLBACKS, NPC_CONFIG } = require('./nexusNpcConfig');
const { Provider, configureLtiHooks, registerPlatform } = require('./lti');
const {
  MODULE_ID,
  MODULE_XP,
  SCENARIO_KEY,
  applyScenarioChoice,
  startOrResumeScenario,
} = require('./scenarioEngine');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [config.webDevOrigin, config.appUrl],
    credentials: true,
  },
});

const aiService = new AIService(logger);
const hubPresence = new Map();

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function makeHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateLeadershipPayload(payload) {
  if (!Array.isArray(payload.topTraits) || payload.topTraits.length !== 2) {
    throw makeHttpError(400, 'topTraits must contain exactly 2 values.');
  }
  if (!payload.topTraits.every((trait) => PROFILE_OPTIONS.topTraits.includes(trait))) {
    throw makeHttpError(400, 'topTraits contains an invalid value.');
  }
  if (!PROFILE_OPTIONS.preferredStyles.includes(payload.preferredStyle)) {
    throw makeHttpError(400, 'preferredStyle is invalid.');
  }
  if (!Number.isInteger(payload.taskRelationshipBalance) || payload.taskRelationshipBalance < 1 || payload.taskRelationshipBalance > 5) {
    throw makeHttpError(400, 'taskRelationshipBalance must be an integer from 1 to 5.');
  }
  if (!PROFILE_OPTIONS.strongestSkills.includes(payload.strongestSkill)) {
    throw makeHttpError(400, 'strongestSkill is invalid.');
  }
  if (!PROFILE_OPTIONS.conflictStyles.includes(payload.conflictStyle)) {
    throw makeHttpError(400, 'conflictStyle is invalid.');
  }
  if (!PROFILE_OPTIONS.powerBases.includes(payload.powerBase)) {
    throw makeHttpError(400, 'powerBase is invalid.');
  }
}

function validateArchetype(archetype) {
  return ARCHETYPES.some((item) => item.id === archetype);
}

function serializeAvatar(avatar) {
  return {
    id: avatar.id,
    slug: avatar.slug,
    displayName: avatar.displayName,
    glbUrl: avatar.glbUrl,
    runtimeGlbUrl: avatar.glbUrl,
    thumbnailUrl: avatar.thumbnailUrl,
    previewImageUrl: avatar.thumbnailUrl,
    status: avatar.status,
    usage: avatar.usage,
    clipNames: avatar.clipNames || { idle: 'idle', walk: 'walk', run: 'run', talk: 'talk' },
    sortOrder: avatar.sortOrder,
    isActive: avatar.isActive,
    previewConfig: avatar.previewConfig,
  };
}

function serializeProfile(user, profile) {
  const activeAvatar = profile?.avatar?.isActive && profile.avatar.status === 'active' ? profile.avatar : null;
  const onboarding = computeOnboardingStatus(profile);
  return {
    user: {
      id: user.id,
      ltiUserId: user.ltiUserId,
      displayName: user.displayName,
      locale: user.locale,
      countryHint: user.countryHint,
    },
    profile: {
      avatarId: activeAvatar ? profile.avatarId : null,
      avatar: activeAvatar ? serializeAvatar(activeAvatar) : null,
      archetype: profile?.archetype || '',
      country: profile?.country || '',
      locationLabel: profile?.locationLabel || '',
      lat: Number.isFinite(profile?.lat) ? profile.lat : null,
      lng: Number.isFinite(profile?.lng) ? profile.lng : null,
      topTraits: profile?.topTraits || [],
      preferredStyle: profile?.preferredStyle || '',
      taskRelationshipBalance: profile?.taskRelationshipBalance || null,
      strongestSkill: profile?.strongestSkill || '',
      conflictStyle: profile?.conflictStyle || '',
      powerBase: profile?.powerBase || '',
      leadershipGoal: profile?.leadershipGoal || '',
      onboardingCompleted: onboarding.complete,
    },
    onboarding,
  };
}

async function ensureModuleProgress(userId, moduleId) {
  const [progress] = await models.ModuleProgress.findOrCreate({
    where: { userId, moduleId },
    defaults: {
      userId,
      moduleId,
      status: moduleId === MODULE_ID ? 'available' : 'locked',
      xp: 0,
    },
  });
  return progress;
}

async function buildModulesResponse(userId, onboardingComplete) {
  const existingProgress = await models.ModuleProgress.findAll({ where: { userId } });
  const progressByModule = new Map(existingProgress.map((item) => [item.moduleId, item]));

  const modulesResponse = [];
  for (const module of MODULES) {
    const progress = progressByModule.get(module.id) || (await ensureModuleProgress(userId, module.id));
    const unlocked = onboardingComplete && (module.id === MODULE_ID || progress.status === 'completed');
    const status = progress.status === 'completed' ? 'completed' : unlocked ? 'available' : 'locked';
    if (progress.status !== status) await progress.update({ status });

    modulesResponse.push({
      id: module.id,
      title: module.title,
      releaseState: module.status,
      unlocked,
      status,
      xp: progress.xp,
      completedAt: progress.completedAt,
    });
  }

  return modulesResponse;
}

function getAuthContext(req) {
  const ltiUserId =
    req.headers['x-lti-user-id'] ||
    req.query.ltiUserId ||
    req.body?.ltiUserId ||
    (!config.isProduction ? 'dev-student' : null);

  if (!ltiUserId) throw makeHttpError(401, 'Missing LTI user identity.');

  return {
    ltiUserId: String(ltiUserId),
    displayName:
      String(req.headers['x-display-name'] || req.query.name || req.body?.displayName || 'Student'),
    locale: String(req.headers['x-lti-locale'] || req.query.locale || req.body?.locale || ''),
    countryHint: String(req.headers['x-country-hint'] || req.query.country || req.body?.countryHint || ''),
  };
}

async function geocodeQuery(query) {
  const trimmed = String(query || '').trim();
  if (!trimmed) throw makeHttpError(400, 'query is required.');

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(trimmed)}`,
      {
        headers: {
          'User-Agent': 'student-world-demo/1.0',
          Accept: 'application/json',
        },
      },
    );
    if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);

    const results = await response.json();
    const hit = Array.isArray(results) ? results[0] : null;
    if (hit) {
      return {
        label: hit.display_name,
        country: hit.address?.country || trimmed,
        lat: Number(hit.lat),
        lng: Number(hit.lon),
      };
    }
  } catch (_error) {
    // Fall through to static fallback map.
  }

  const fallbackKey = trimmed.toLowerCase();
  const fallback = GEOCODE_FALLBACKS[fallbackKey];
  if (fallback) return fallback;

  throw makeHttpError(404, 'Unable to geocode the provided location.');
}

async function attachCurrentUser(req, res, next) {
  try {
    req.authContext = getAuthContext(req);
    req.currentUser = await ensureUserRecord(req.authContext);
    req.playerProfile = await getOrCreatePlayerProfile(req.currentUser.id);
    next();
  } catch (error) {
    next(error);
  }
}

function optionalClientLogContext(req, res, next) {
  try {
    req.authContext = getAuthContext(req);
  } catch (_error) {
    req.authContext = null;
  }
  next();
}

async function awardCompletion(userId, sessionId) {
  const progress = await ensureModuleProgress(userId, MODULE_ID);
  if (progress.status !== 'completed') {
    await progress.update({
      status: 'completed',
      xp: MODULE_XP,
      completedAt: new Date(),
    });
  }

  await models.Badge.findOrCreate({
    where: { userId, badgeKey: `${MODULE_ID}-boardroom-complete` },
    defaults: { userId, badgeKey: `${MODULE_ID}-boardroom-complete` },
  });

  return progress;
}

async function resetGameState(userId) {
  await sequelize.transaction(async (transaction) => {
    const sessions = await models.ScenarioSession.findAll({
      where: { userId },
      attributes: ['id'],
      transaction,
    });
    const sessionIds = sessions.map((session) => session.id);

    if (sessionIds.length > 0) {
      await models.ScenarioEventLog.destroy({
        where: { scenarioSessionId: { [Op.in]: sessionIds } },
        transaction,
      });
      await models.ScenarioChoice.destroy({
        where: { scenarioSessionId: { [Op.in]: sessionIds } },
        transaction,
      });
      await models.Journal.destroy({
        where: { scenarioSessionId: { [Op.in]: sessionIds } },
        transaction,
      });
      await models.ScenarioSession.destroy({
        where: { id: { [Op.in]: sessionIds } },
        transaction,
      });
    }

    await models.Badge.destroy({ where: { userId }, transaction });
    await models.ModuleProgress.destroy({ where: { userId }, transaction });

    const profile = await getOrCreatePlayerProfile(userId);
    await profile.update(
      {
        avatarId: null,
        archetype: '',
        country: '',
        locationLabel: '',
        lat: null,
        lng: null,
        topTraits: [],
        preferredStyle: '',
        taskRelationshipBalance: null,
        strongestSkill: '',
        conflictStyle: '',
        powerBase: '',
        leadershipGoal: '',
        onboardingCompleted: false,
      },
      { transaction },
    );
  });
}

async function buildHubState(user, profile) {
  const onboarding = computeOnboardingStatus(profile);
  const modulesResponse = await buildModulesResponse(user.id, onboarding.complete);
  const leaderboard = await models.ModuleProgress.findAll({
    where: {
      xp: { [Op.gt]: 0 },
    },
    include: [{ model: models.User, as: 'user' }],
    order: [['xp', 'DESC']],
    limit: 5,
  });

  return {
    profile: serializeProfile(user, profile),
    modules: modulesResponse,
    leaderboard: leaderboard.map((entry, index) => ({
      rank: index + 1,
      name: entry.user.displayName,
      moduleId: entry.moduleId,
      xp: entry.xp,
    })),
    hubPresenceCount: hubPresence.size,
  };
}

async function createApiServer() {
  validateConfig(logger);
  await syncAppDb(logger);
  configureLtiHooks(logger);

  app.disable('x-powered-by');
  app.use(requestLogger());
  app.use((req, res, next) => {
    req.log = req.log || logger;
    next();
  });
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        const allowed = [config.webDevOrigin, config.appUrl];
        if (allowed.includes(origin)) return callback(null, true);
        return callback(new Error('Origin not allowed by CORS.'));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', async (_req, res) => {
    res.json({
      ok: true,
      env: config.env,
      openaiEnabled: aiService.enabled,
    });
  });

  app.post('/api/client-log', optionalClientLogContext, async (req, res) => {
    const payload = req.body || {};
    logger[payload.level === 'error' ? 'error' : 'warn'](
      {
        event: payload.event || 'client.log',
        request_id: payload.request_id || req.id,
        lti_user_id: req.authContext?.ltiUserId,
        scene: payload.scene,
        module_id: payload.module_id,
        scenario_session_id: payload.scenario_session_id,
        metadata: typeof payload.metadata === 'object' ? payload.metadata : {},
      },
      payload.message || 'Client reported an error.',
    );
    res.status(204).end();
  });

  app.use('/api', attachCurrentUser);

  app.get('/api/avatars', async (req, res, next) => {
    try {
      const avatars = await models.Avatar.findAll({
        where: { isActive: true },
        order: [['sortOrder', 'ASC']],
      });
      res.json({ avatars: avatars.map(serializeAvatar) });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/profile/me', async (req, res, next) => {
    try {
      const profile = await getProfileWithAvatar(req.currentUser.id);
      req.playerProfile = profile;
      res.json(serializeProfile(req.currentUser, profile));
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/profile/avatar', async (req, res, next) => {
    try {
      const { avatarId, archetype } = req.body || {};
      if (!avatarId) throw makeHttpError(400, 'avatarId is required.');
      if (!archetype || !validateArchetype(archetype)) throw makeHttpError(400, 'archetype is required.');

      const avatar = await models.Avatar.findByPk(avatarId);
      if (!avatar || !avatar.isActive) throw makeHttpError(404, 'Avatar not found.');

      const profile = await getOrCreatePlayerProfile(req.currentUser.id);
      await profile.update({ avatarId, archetype });
      const profileWithAvatar = await getProfileWithAvatar(req.currentUser.id);
      const onboarding = computeOnboardingStatus(profileWithAvatar);
      await profileWithAvatar.update({ onboardingCompleted: onboarding.complete });

      req.log.info(
        getLogContext(req, {
          event: 'profile.avatar_selected',
          avatar_id: avatarId,
          archetype,
          status: 'ok',
        }),
        'Avatar selected.',
      );

      res.json(serializeProfile(req.currentUser, profileWithAvatar));
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/profile/location', async (req, res, next) => {
    try {
      const { country, locationLabel, lat, lng } = req.body || {};
      if (!country || typeof country !== 'string') throw makeHttpError(400, 'country is required.');
      if (!isFiniteNumber(lat) || !isFiniteNumber(lng)) throw makeHttpError(400, 'lat and lng must be numbers.');

      const profile = await getOrCreatePlayerProfile(req.currentUser.id);
      await profile.update({ country, locationLabel: locationLabel || '', lat, lng });
      const profileWithAvatar = await getProfileWithAvatar(req.currentUser.id);
      const onboarding = computeOnboardingStatus(profileWithAvatar);
      await profileWithAvatar.update({ onboardingCompleted: onboarding.complete });

      req.log.info(
        getLogContext(req, {
          event: 'profile.location_saved',
          status: 'ok',
          country,
        }),
        'Location saved.',
      );

      res.json(serializeProfile(req.currentUser, profileWithAvatar));
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/geocode', async (req, res, next) => {
    try {
      const result = await geocodeQuery(req.body?.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/npc-chat', async (req, res, next) => {
    try {
      const { npcId, messages } = req.body || {};
      if (!npcId || !NPC_CONFIG[npcId]) throw makeHttpError(404, 'NPC not found.');
      if (!Array.isArray(messages) || messages.length === 0) throw makeHttpError(400, 'messages is required.');

      const sanitizedMessages = messages
        .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
        .map((message) => ({
          role: message.role,
          content: String(message.content || '').trim().slice(0, 2000),
        }))
        .filter((message) => message.content.length > 0)
        .slice(-8);
      if (sanitizedMessages.length === 0) throw makeHttpError(400, 'messages is required.');

      const profile = await getProfileWithAvatar(req.currentUser.id);
      const playerProfile = serializeProfile(req.currentUser, profile).profile;
      const npc = NPC_CONFIG[npcId];
      const reply = await aiService.generateNpcReply(
        {
          npc,
          messages: sanitizedMessages,
          playerProfile: {
            playerName: req.currentUser.displayName,
            archetypeLabel: ARCHETYPES.find((item) => item.id === playerProfile.archetype)?.label || '',
            country: playerProfile.country,
            locationLabel: playerProfile.locationLabel,
          },
        },
        { requestId: req.id },
      );

      req.log.info(
        getLogContext(req, {
          event: 'npc.chat_completed',
          npc_id: npcId,
          status: 'ok',
        }),
        'NPC chat completed.',
      );

      res.json({
        npc: {
          id: npc.id,
          name: npc.name,
          zoneId: npc.zoneId,
          interactionMode: npc.interactionMode,
        },
        reply,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/profile/leadership', async (req, res, next) => {
    try {
      validateLeadershipPayload(req.body || {});
      const profile = await getOrCreatePlayerProfile(req.currentUser.id);
      await profile.update({
        topTraits: req.body.topTraits,
        preferredStyle: req.body.preferredStyle,
        taskRelationshipBalance: req.body.taskRelationshipBalance,
        strongestSkill: req.body.strongestSkill,
        conflictStyle: req.body.conflictStyle,
        powerBase: req.body.powerBase,
        leadershipGoal: req.body.leadershipGoal || '',
      });
      const profileWithAvatar = await getProfileWithAvatar(req.currentUser.id);
      const onboarding = computeOnboardingStatus(profileWithAvatar);
      await profileWithAvatar.update({ onboardingCompleted: onboarding.complete });

      req.log.info(
        getLogContext(req, {
          event: onboarding.complete ? 'profile.onboarding_completed' : 'profile.leadership_saved',
          status: 'ok',
        }),
        'Leadership profile saved.',
      );

      res.json(serializeProfile(req.currentUser, profileWithAvatar));
    } catch (error) {
      req.log.warn(
        getLogContext(req, {
          event: 'profile.validation_failed',
          status: 'invalid',
          error_message: error.message,
        }),
        'Leadership profile validation failed.',
      );
      next(error);
    }
  });

  app.get('/api/modules', async (req, res, next) => {
    try {
      const profile = await getProfileWithAvatar(req.currentUser.id);
      const onboarding = computeOnboardingStatus(profile);
      const modulesResponse = await buildModulesResponse(req.currentUser.id, onboarding.complete);
      res.json({ modules: modulesResponse });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/game/reset', async (req, res, next) => {
    try {
      await resetGameState(req.currentUser.id);
      const profile = await getProfileWithAvatar(req.currentUser.id);

      req.log.info(
        getLogContext(req, {
          event: 'game.reset',
          status: 'ok',
          user_id: req.currentUser.id,
        }),
        'Game state reset for current user.',
      );

      res.json(serializeProfile(req.currentUser, profile));
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/hub/state', async (req, res, next) => {
    try {
      const profile = await getProfileWithAvatar(req.currentUser.id);
      res.json(await buildHubState(req.currentUser, profile));
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/scenarios/start', async (req, res, next) => {
    try {
      const moduleId = req.body?.moduleId || MODULE_ID;
      if (moduleId !== MODULE_ID) throw makeHttpError(400, 'Only Module 2 is active in this MVP.');

      const profile = await getProfileWithAvatar(req.currentUser.id);
      const onboarding = computeOnboardingStatus(profile);
      if (!onboarding.complete) throw makeHttpError(403, 'Finish onboarding before entering the hub.');

      const state = await startOrResumeScenario({
        models,
        userId: req.currentUser.id,
        requestId: req.id,
      });

      req.log.info(
        getLogContext(req, {
          event: 'scenario.started',
          scenario_key: SCENARIO_KEY,
          scenario_session_id: state.sessionId,
          module_id: MODULE_ID,
          status: state.status,
        }),
        'Scenario started or resumed.',
      );

      res.json(state);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/scenarios/:sessionId/choice', async (req, res, next) => {
    try {
      const { choiceKey } = req.body || {};
      if (!choiceKey) throw makeHttpError(400, 'choiceKey is required.');

      const state = await applyScenarioChoice({
        models,
        sessionId: req.params.sessionId,
        choiceKey,
        requestId: req.id,
      });

      req.log.info(
        getLogContext(req, {
          event: 'scenario.choice_applied',
          scenario_key: state.scenarioKey,
          scenario_session_id: state.sessionId,
          module_id: state.moduleId,
          status: state.status,
        }),
        'Scenario choice applied.',
      );

      if (state.status === 'completed') {
        const profile = await getProfileWithAvatar(req.currentUser.id);
        const debrief = await aiService.generateDebrief(
          {
            moduleId: state.moduleId,
            scenarioKey: state.scenarioKey,
            playerProfile: serializeProfile(req.currentUser, profile).profile,
            choices: state.choices,
            resultSummary: state.resultSummary,
          },
          { requestId: req.id },
        );

        await models.ScenarioSession.update(
          { debrief },
          { where: { id: state.sessionId } },
        );
        state.debrief = debrief;
        await awardCompletion(req.currentUser.id, state.sessionId);

        req.log.info(
          getLogContext(req, {
            event: 'scenario.completed',
            scenario_key: state.scenarioKey,
            scenario_session_id: state.sessionId,
            module_id: state.moduleId,
            status: 'completed',
          }),
          'Scenario completed.',
        );
      }

      res.json(state);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/journal/:sessionId', async (req, res, next) => {
    try {
      const { reflectionText } = req.body || {};
      if (!reflectionText || typeof reflectionText !== 'string' || reflectionText.trim().length < 10) {
        throw makeHttpError(400, 'reflectionText must be at least 10 characters.');
      }

      const session = await models.ScenarioSession.findByPk(req.params.sessionId);
      if (!session || session.userId !== req.currentUser.id) throw makeHttpError(404, 'Scenario session not found.');
      if (session.status !== 'completed') throw makeHttpError(400, 'Scenario must be completed before journaling.');

      const profile = await getProfileWithAvatar(req.currentUser.id);
      const reflectionSummary = await aiService.summarizeReflection(
        {
          playerProfile: serializeProfile(req.currentUser, profile).profile,
          resultSummary: session.resultSummary,
          reflectionText,
        },
        { requestId: req.id },
      );

      const [journal] = await models.Journal.findOrCreate({
        where: { scenarioSessionId: session.id },
        defaults: {
          userId: req.currentUser.id,
          moduleId: MODULE_ID,
          scenarioSessionId: session.id,
          reflectionText,
          aiSummary: reflectionSummary.journal_summary,
          nextFocusArea: reflectionSummary.next_focus_area,
        },
      });

      await journal.update({
        reflectionText,
        aiSummary: reflectionSummary.journal_summary,
        nextFocusArea: reflectionSummary.next_focus_area,
      });

      req.log.info(
        getLogContext(req, {
          event: 'journal.saved',
          scenario_session_id: session.id,
          module_id: MODULE_ID,
          status: 'ok',
        }),
        'Journal saved.',
      );

      res.json({
        journal: {
          id: journal.id,
          reflectionText: journal.reflectionText,
          aiSummary: journal.aiSummary,
          nextFocusArea: journal.nextFocusArea,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  const webDistPath = path.join(__dirname, '../web/dist');
  if (fs.existsSync(webDistPath)) {
    app.use(express.static(webDistPath));
  }

  await Provider.deploy({ serverless: true });
  app.use(Provider.app);

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/login') || req.path.startsWith('/keys') || req.path.startsWith('/lti')) {
      return next();
    }

    if (fs.existsSync(path.join(webDistPath, 'index.html'))) {
      return res.sendFile(path.join(webDistPath, 'index.html'));
    }

    return res.status(200).send(
      [
        '<!doctype html>',
        '<html><body style="font-family: Georgia, serif; background: #10212b; color: #f4f1e8; padding: 32px;">',
        '<h1>OGL 200 Web Client Not Built</h1>',
        '<p>Run <code>npm run web:dev</code> for development or <code>npm run web:build</code> before starting the backend-only server.</p>',
        '</body></html>',
      ].join(''),
    );
  });

  app.use((error, req, res, _next) => {
    const statusCode = error.statusCode || 500;
    req.log.error(
      getLogContext(req, {
        event: 'request.failed',
        status: statusCode,
        error_name: error.name,
        error_message: error.message,
      }),
      config.isProduction ? 'Request failed.' : error.stack || error.message,
    );

    res.status(statusCode).json({
      error: {
        code: statusCode,
        message: statusCode >= 500 ? 'Internal server error.' : error.message,
        requestId: req.id,
      },
    });
  });

  io.on('connection', (socket) => {
    logger.info({ event: 'socket.connected', session_id: socket.id }, 'Socket connected.');

    socket.on('hub:presence', (payload = {}) => {
      const requestId = payload.requestId || randomUUID();
      hubPresence.set(socket.id, {
        socketId: socket.id,
        requestId,
        displayName: payload.displayName || 'Student',
      });
      io.emit('hub:player_joined', {
        displayName: payload.displayName || 'Student',
        hubPresenceCount: hubPresence.size,
      });
      logger.info(
        {
          event: 'hub.presence_joined',
          request_id: requestId,
          session_id: socket.id,
          status: 'ok',
        },
        'Hub presence updated.',
      );
    });

    socket.on('scenario:join', (payload = {}) => {
      logger.info(
        {
          event: 'scenario.joined',
          request_id: payload.requestId || randomUUID(),
          session_id: socket.id,
          scenario_session_id: payload.sessionId,
          module_id: payload.moduleId || MODULE_ID,
        },
        'Scenario socket channel joined.',
      );
      socket.emit('scenario:state', { ok: true });
    });

    socket.on('disconnect', () => {
      const presence = hubPresence.get(socket.id);
      hubPresence.delete(socket.id);
      io.emit('hub:player_left', { hubPresenceCount: hubPresence.size });
      logger.info(
        {
          event: 'socket.disconnected',
          session_id: socket.id,
          request_id: presence?.requestId,
          status: 'ok',
        },
        'Socket disconnected.',
      );
    });
  });

  await registerPlatform(logger);

  httpServer.listen(config.port, () => {
    logger.info(
      {
        event: 'server.started',
        port: config.port,
        app_url: config.appUrl,
        web_dev_origin: config.webDevOrigin,
      },
      'OGL 200 server started.',
    );
  });
}

createApiServer().catch((error) => {
  logger.error(
    {
      event: 'server.startup_failed',
      error_name: error.name,
      error_message: error.message,
    },
    error.stack || error.message,
  );
  process.exit(1);
});
