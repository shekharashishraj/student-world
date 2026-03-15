const { MODULE_TWO_OBJECTIVE_TAGS } = require('./constants');

const MODULE_ID = 'module-2';
const SCENARIO_KEY = 'module-2-boardroom-001';
const MODULE_XP = 125;

const INITIAL_METERS = { trust: 0, performance: 0, inclusion: 0, ethics: 0 };

const SCENARIO_STEPS = [
  {
    key: 'opening_style',
    round: 1,
    title: 'Round 1: Open the meeting',
    prompt:
      'A product launch is behind schedule. Three teammates bring competing priorities into the boardroom, and everyone expects you to set the tone.',
    npcLines: [
      'Mina: We need a clear decision now or we will miss the deadline.',
      'Jordan: If people feel steamrolled, they will stop contributing.',
      'Alex: I would rather not make this worse by forcing a fight.',
    ],
    options: [
      {
        key: 'directive_open',
        label: 'Set a strict agenda and assign speaking turns immediately.',
        description: 'Signals control and speed, but limits voice early.',
        styleTag: 'authoritarian',
        deltas: { trust: -1, performance: 2, inclusion: -1, ethics: 0 },
      },
      {
        key: 'collaborative_open',
        label: 'Ask each teammate for the key risk they want the team to understand.',
        description: 'Slower opening, but it raises buy-in and surfaces perspective.',
        styleTag: 'democratic',
        deltas: { trust: 2, performance: 1, inclusion: 2, ethics: 1 },
      },
      {
        key: 'hands_off_open',
        label: 'Let the team sort it out while you observe from the side.',
        description: 'Minimizes friction in the moment, but creates weak direction.',
        styleTag: 'laissez_faire',
        deltas: { trust: -1, performance: -2, inclusion: 0, ethics: -1 },
      },
    ],
  },
  {
    key: 'conflict_response',
    round: 2,
    title: 'Round 2: Respond to dissent',
    prompt:
      'The conversation sharpens. Mina pushes for a top-down decision, Jordan accuses the team of ignoring quieter contributors, and Alex withdraws.',
    npcLines: [
      'Mina: We do not have time to workshop every opinion.',
      'Jordan: If Alex stays unheard, we are reinforcing an out-group dynamic.',
      'Alex: I am not sure my concern matters here.',
    ],
    options: [
      {
        key: 'reassert_authority',
        label: 'Cut off the disagreement and issue the next action yourself.',
        description: 'Fast and decisive, but it narrows participation.',
        styleTag: 'authoritarian',
        deltas: { trust: -1, performance: 2, inclusion: -2, ethics: -1 },
      },
      {
        key: 'surface_dissent',
        label: 'Pause the debate, name the tension, and invite Alex in directly.',
        description: 'Balances task focus with relationship repair.',
        styleTag: 'democratic',
        deltas: { trust: 2, performance: 0, inclusion: 2, ethics: 1 },
      },
      {
        key: 'avoid_escalation',
        label: 'Move on without resolving the tension and hope it cools down.',
        description: 'Reduces pressure now, but conflict stays unresolved.',
        styleTag: 'laissez_faire',
        deltas: { trust: -2, performance: -1, inclusion: -1, ethics: -1 },
      },
    ],
  },
  {
    key: 'final_decision',
    round: 3,
    title: 'Round 3: Final decision and communication',
    prompt:
      'You need to close the meeting with a concrete plan. The team must know what happens next and why your process was fair.',
    npcLines: [
      'Mina: Just tell us the path and lock it in.',
      'Jordan: The decision needs legitimacy, not only speed.',
      'Alex: I will support the plan if I know how my concerns were included.',
    ],
    options: [
      {
        key: 'top_down_close',
        label: 'Choose the fastest plan yourself and expect immediate compliance.',
        description: 'Maximizes speed, but can weaken trust and inclusion.',
        styleTag: 'authoritarian',
        deltas: { trust: -1, performance: 2, inclusion: -1, ethics: -1 },
      },
      {
        key: 'shared_commitment_close',
        label: 'Summarize the evidence, explain the decision, and assign roles with team consent.',
        description: 'Builds legitimacy and commitment with a modest time cost.',
        styleTag: 'democratic',
        deltas: { trust: 2, performance: 1, inclusion: 1, ethics: 2 },
      },
      {
        key: 'defer_close',
        label: 'Delay the decision and ask the team to figure it out asynchronously.',
        description: 'Avoids direct ownership and weakens follow-through.',
        styleTag: 'laissez_faire',
        deltas: { trust: -1, performance: -2, inclusion: 0, ethics: -1 },
      },
    ],
  },
];

function addMeters(currentMeters, deltas) {
  return {
    trust: currentMeters.trust + deltas.trust,
    performance: currentMeters.performance + deltas.performance,
    inclusion: currentMeters.inclusion + deltas.inclusion,
    ethics: currentMeters.ethics + deltas.ethics,
  };
}

function getStep(stepKey) {
  return SCENARIO_STEPS.find((step) => step.key === stepKey) || null;
}

function getNextStepKey(stepKey) {
  const currentIndex = SCENARIO_STEPS.findIndex((step) => step.key === stepKey);
  if (currentIndex === -1 || currentIndex === SCENARIO_STEPS.length - 1) return null;
  return SCENARIO_STEPS[currentIndex + 1].key;
}

function deriveStyleCounts(choices) {
  return choices.reduce(
    (accumulator, choice) => {
      const key = choice.styleTag || 'unknown';
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    },
    {},
  );
}

function deriveDominantStyle(choices) {
  const counts = deriveStyleCounts(choices);
  const sorted = Object.entries(counts).sort((left, right) => right[1] - left[1]);
  return sorted[0]?.[0] || 'mixed';
}

function deriveOutcomeBand(meters) {
  const total = meters.trust + meters.performance + meters.inclusion + meters.ethics;
  if (total >= 9) return 'strong';
  if (total >= 4) return 'balanced';
  if (total >= 0) return 'mixed';
  return 'fragile';
}

function buildResultSummary(meters, choices) {
  const dominantStyle = deriveDominantStyle(choices);
  const outcomeBand = deriveOutcomeBand(meters);

  const dominantStyleLabel = {
    authoritarian: 'authoritarian',
    democratic: 'democratic',
    laissez_faire: 'laissez-faire',
    mixed: 'mixed',
  }[dominantStyle] || 'mixed';

  const headlineByBand = {
    strong: 'The team leaves with clarity, trust, and visible buy-in.',
    balanced: 'The team has a workable plan, but the tradeoffs are noticeable.',
    mixed: 'The meeting resolves the immediate issue, but some cracks remain.',
    fragile: 'The plan moves forward with weak alignment and damaged trust.',
  };

  return {
    dominantStyle,
    dominantStyleLabel,
    outcomeBand,
    headline: headlineByBand[outcomeBand],
    moduleObjectiveTags: MODULE_TWO_OBJECTIVE_TAGS,
    meters,
    xpEarned: MODULE_XP,
  };
}

async function recordScenarioEvent(models, payload) {
  await models.ScenarioEventLog.create(payload);
}

async function loadScenarioSession(models, sessionId) {
  const session = await models.ScenarioSession.findByPk(sessionId, {
    include: [{ model: models.ScenarioChoice, as: 'choices' }],
  });
  if (!session) return null;
  session.choices.sort((left, right) => left.choiceOrder - right.choiceOrder);
  return session;
}

function serializeStep(step) {
  return {
    key: step.key,
    round: step.round,
    title: step.title,
    prompt: step.prompt,
    npcLines: step.npcLines,
    options: step.options.map((option) => ({
      key: option.key,
      label: option.label,
      description: option.description,
    })),
  };
}

function serializeScenarioState(session) {
  const state = {
    sessionId: session.id,
    moduleId: session.moduleId,
    scenarioKey: session.scenarioKey,
    status: session.status,
    currentStep: null,
    meters: session.meters || INITIAL_METERS,
    choices: session.choices.map((choice) => ({
      stepKey: choice.stepKey,
      choiceKey: choice.choiceKey,
      styleTag: choice.styleTag,
      deltas: {
        trust: choice.trustDelta,
        performance: choice.performanceDelta,
        inclusion: choice.inclusionDelta,
        ethics: choice.ethicsDelta,
      },
    })),
    resultSummary: session.resultSummary,
    debrief: session.debrief,
  };

  if (session.status === 'in_progress' && session.currentStepKey) {
    const step = getStep(session.currentStepKey);
    if (step) state.currentStep = serializeStep(step);
  }

  return state;
}

async function startOrResumeScenario({ models, userId, requestId }) {
  let session = await models.ScenarioSession.findOne({
    where: {
      userId,
      moduleId: MODULE_ID,
      scenarioKey: SCENARIO_KEY,
      status: 'in_progress',
    },
    include: [{ model: models.ScenarioChoice, as: 'choices' }],
  });

  if (!session) {
    session = await models.ScenarioSession.create({
      userId,
      moduleId: MODULE_ID,
      scenarioKey: SCENARIO_KEY,
      currentStepKey: SCENARIO_STEPS[0].key,
      meters: INITIAL_METERS,
    });

    await recordScenarioEvent(models, {
      scenarioSessionId: session.id,
      eventType: 'scenario_started',
      stepKey: session.currentStepKey,
      meterSnapshot: INITIAL_METERS,
      requestId,
    });

    session = await loadScenarioSession(models, session.id);
  }

  return serializeScenarioState(session);
}

async function applyScenarioChoice({ models, sessionId, choiceKey, requestId }) {
  const session = await loadScenarioSession(models, sessionId);
  if (!session) {
    const error = new Error('Scenario session not found.');
    error.statusCode = 404;
    throw error;
  }
  if (session.status !== 'in_progress') {
    const error = new Error('Scenario session is not active.');
    error.statusCode = 400;
    throw error;
  }

  const step = getStep(session.currentStepKey);
  if (!step) {
    const error = new Error('Scenario step is invalid.');
    error.statusCode = 500;
    throw error;
  }

  const selectedOption = step.options.find((option) => option.key === choiceKey);
  if (!selectedOption) {
    const error = new Error('Choice is not valid for the current step.');
    error.statusCode = 400;
    throw error;
  }

  const nextMeters = addMeters(session.meters || INITIAL_METERS, selectedOption.deltas);
  const choiceOrder = session.choices.length + 1;

  await models.ScenarioChoice.create({
    scenarioSessionId: session.id,
    stepKey: step.key,
    choiceKey: selectedOption.key,
    choiceOrder,
    choicePayload: {
      label: selectedOption.label,
      description: selectedOption.description,
    },
    trustDelta: selectedOption.deltas.trust,
    performanceDelta: selectedOption.deltas.performance,
    inclusionDelta: selectedOption.deltas.inclusion,
    ethicsDelta: selectedOption.deltas.ethics,
    styleTag: selectedOption.styleTag,
  });

  await recordScenarioEvent(models, {
    scenarioSessionId: session.id,
    eventType: 'choice_applied',
    stepKey: step.key,
    choiceKey: selectedOption.key,
    meterSnapshot: nextMeters,
    requestId,
  });

  const nextStepKey = getNextStepKey(step.key);
  const updates = {
    meters: nextMeters,
    currentStepKey: nextStepKey,
  };

  if (!nextStepKey) {
    const choices = [...session.choices, {
      stepKey: step.key,
      choiceKey: selectedOption.key,
      styleTag: selectedOption.styleTag,
    }];
    updates.status = 'completed';
    updates.completedAt = new Date();
    updates.currentStepKey = null;
    updates.derivedTags = choices.map((choice) => choice.styleTag);
    updates.resultSummary = buildResultSummary(nextMeters, choices);
  }

  await session.update(updates);

  if (!nextStepKey) {
    await recordScenarioEvent(models, {
      scenarioSessionId: session.id,
      eventType: 'scenario_completed',
      stepKey: step.key,
      choiceKey: selectedOption.key,
      meterSnapshot: nextMeters,
      requestId,
    });
  }

  return serializeScenarioState(await loadScenarioSession(models, session.id));
}

module.exports = {
  MODULE_ID,
  MODULE_XP,
  SCENARIO_KEY,
  SCENARIO_STEPS,
  applyScenarioChoice,
  startOrResumeScenario,
};
