const { Sequelize, DataTypes, Op } = require('sequelize');
const { config } = require('./config');
const { AVATAR_SEEDS, MODULES } = require('./constants');

const sequelize = new Sequelize(
  config.postgres.database,
  config.postgres.username,
  config.postgres.password,
  {
    host: config.postgres.host,
    port: config.postgres.port,
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
    },
  },
);

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  ltiUserId: { type: DataTypes.STRING, allowNull: false, unique: true },
  displayName: { type: DataTypes.STRING, allowNull: false },
  locale: { type: DataTypes.STRING },
  countryHint: { type: DataTypes.STRING },
});

const Avatar = sequelize.define('Avatar', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  displayName: { type: DataTypes.STRING, allowNull: false },
  glbUrl: { type: DataTypes.STRING },
  thumbnailUrl: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'placeholder' },
  usage: { type: DataTypes.STRING, allowNull: false, defaultValue: 'shared' },
  clipNames: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: { idle: 'idle', walk: 'walk', run: 'run', talk: 'talk' },
  },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  previewConfig: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
});

const PlayerProfile = sequelize.define('PlayerProfile', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  country: { type: DataTypes.STRING },
  locationLabel: { type: DataTypes.STRING },
  lat: { type: DataTypes.FLOAT },
  lng: { type: DataTypes.FLOAT },
  archetype: { type: DataTypes.STRING },
  topTraits: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  preferredStyle: { type: DataTypes.STRING },
  taskRelationshipBalance: { type: DataTypes.INTEGER },
  strongestSkill: { type: DataTypes.STRING },
  conflictStyle: { type: DataTypes.STRING },
  powerBase: { type: DataTypes.STRING },
  leadershipGoal: { type: DataTypes.TEXT },
  onboardingCompleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
});

const ModuleProgress = sequelize.define('ModuleProgress', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  moduleId: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'locked' },
  xp: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  completedAt: { type: DataTypes.DATE },
});

const ScenarioSession = sequelize.define('ScenarioSession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  moduleId: { type: DataTypes.STRING, allowNull: false },
  scenarioKey: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'in_progress' },
  currentStepKey: { type: DataTypes.STRING },
  meters: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: { trust: 0, performance: 0, inclusion: 0, ethics: 0 },
  },
  derivedTags: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  resultSummary: { type: DataTypes.JSONB },
  debrief: { type: DataTypes.JSONB },
  startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  completedAt: { type: DataTypes.DATE },
});

const ScenarioChoice = sequelize.define('ScenarioChoice', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  stepKey: { type: DataTypes.STRING, allowNull: false },
  choiceKey: { type: DataTypes.STRING, allowNull: false },
  choiceOrder: { type: DataTypes.INTEGER, allowNull: false },
  choicePayload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  trustDelta: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  performanceDelta: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  inclusionDelta: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  ethicsDelta: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  styleTag: { type: DataTypes.STRING, allowNull: false },
});

const Journal = sequelize.define('Journal', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  moduleId: { type: DataTypes.STRING, allowNull: false },
  reflectionText: { type: DataTypes.TEXT, allowNull: false },
  aiSummary: { type: DataTypes.TEXT },
  nextFocusArea: { type: DataTypes.TEXT },
});

const Badge = sequelize.define('Badge', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  badgeKey: { type: DataTypes.STRING, allowNull: false },
  awardedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});

const ScenarioEventLog = sequelize.define('ScenarioEventLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  eventType: { type: DataTypes.STRING, allowNull: false },
  stepKey: { type: DataTypes.STRING },
  choiceKey: { type: DataTypes.STRING },
  meterSnapshot: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  requestId: { type: DataTypes.STRING },
});

User.hasOne(PlayerProfile, { foreignKey: 'userId', as: 'profile' });
PlayerProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Avatar.hasMany(PlayerProfile, { foreignKey: 'avatarId', as: 'profiles' });
PlayerProfile.belongsTo(Avatar, { foreignKey: 'avatarId', as: 'avatar' });

User.hasMany(ModuleProgress, { foreignKey: 'userId', as: 'moduleProgress' });
ModuleProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(ScenarioSession, { foreignKey: 'userId', as: 'scenarioSessions' });
ScenarioSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ScenarioSession.hasMany(ScenarioChoice, { foreignKey: 'scenarioSessionId', as: 'choices' });
ScenarioChoice.belongsTo(ScenarioSession, { foreignKey: 'scenarioSessionId', as: 'session' });
ScenarioSession.hasMany(ScenarioEventLog, { foreignKey: 'scenarioSessionId', as: 'eventLogs' });
ScenarioEventLog.belongsTo(ScenarioSession, { foreignKey: 'scenarioSessionId', as: 'session' });

User.hasMany(Journal, { foreignKey: 'userId', as: 'journals' });
Journal.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ScenarioSession.hasOne(Journal, { foreignKey: 'scenarioSessionId', as: 'journal' });
Journal.belongsTo(ScenarioSession, { foreignKey: 'scenarioSessionId', as: 'session' });

User.hasMany(Badge, { foreignKey: 'userId', as: 'badges' });
Badge.belongsTo(User, { foreignKey: 'userId', as: 'user' });

async function syncAppDb(logger) {
  await sequelize.authenticate();
  logger.info({ event: 'postgres.connected', status: 'ok' }, 'Connected to Postgres.');

  const syncOptions = config.isProduction ? {} : { alter: true };
  await sequelize.sync(syncOptions);
  logger.info(
    {
      event: 'database.synced',
      status: 'ok',
      alter_applied: Boolean(syncOptions.alter),
    },
    'App database synced.',
  );

  await seedAvatars();
  await seedModuleProgressDefaults();
}

async function seedAvatars() {
  const activeSlugs = AVATAR_SEEDS.map((avatar) => avatar.slug);
  await Avatar.update(
    { isActive: false },
    {
      where: {
        slug: { [Op.notIn]: activeSlugs },
      },
    },
  );

  for (const avatar of AVATAR_SEEDS) {
    await Avatar.upsert({
      ...avatar,
      isActive: true,
    });
  }
}

async function seedModuleProgressDefaults() {
  if (MODULES.length === 0) return;
}

async function ensureUserRecord({ ltiUserId, displayName, locale, countryHint }) {
  const [user] = await User.findOrCreate({
    where: { ltiUserId },
    defaults: {
      displayName: displayName || 'Student',
      locale: locale || null,
      countryHint: countryHint || null,
    },
  });

  const updates = {};
  if (displayName && user.displayName !== displayName) updates.displayName = displayName;
  if (locale && user.locale !== locale) updates.locale = locale;
  if (countryHint && user.countryHint !== countryHint) updates.countryHint = countryHint;
  if (Object.keys(updates).length > 0) await user.update(updates);

  return user;
}

async function getOrCreatePlayerProfile(userId) {
  const [profile] = await PlayerProfile.findOrCreate({
    where: { userId },
    defaults: { userId },
  });
  return profile;
}

async function getProfileWithAvatar(userId) {
  return PlayerProfile.findOne({
    where: { userId },
    include: [{ model: Avatar, as: 'avatar' }],
  });
}

function computeOnboardingStatus(profile) {
  const avatarSelected = Boolean(
    profile?.avatar
      ? profile.avatar.isActive && profile.avatar.status === 'active'
      : profile?.avatarId,
  );
  const locationSaved = Boolean(profile?.country && Number.isFinite(profile?.lat) && Number.isFinite(profile?.lng));
  const archetypeSelected = Boolean(profile?.archetype);

  return {
    avatarSelected,
    locationSaved,
    archetypeSelected,
    leadershipCompleted: archetypeSelected,
    complete: avatarSelected && locationSaved && archetypeSelected,
  };
}

module.exports = {
  sequelize,
  models: {
    Avatar,
    Badge,
    Journal,
    ModuleProgress,
    PlayerProfile,
    ScenarioChoice,
    ScenarioEventLog,
    ScenarioSession,
    User,
  },
  computeOnboardingStatus,
  ensureUserRecord,
  getOrCreatePlayerProfile,
  getProfileWithAvatar,
  syncAppDb,
};
