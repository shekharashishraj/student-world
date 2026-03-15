const { createHash } = require('crypto');
const OpenAI = require('openai');
const { config } = require('./config');

const DEBRIEF_PROMPT_VERSION = 'ogl200-module-2-debrief-v1';
const REFLECTION_PROMPT_VERSION = 'ogl200-reflection-v1';
const NPC_CHAT_PROMPT_VERSION = 'nexus-demo-npc-chat-v1';
const SUPPORTED_REASONING_EFFORTS = new Set(['none', 'low', 'medium', 'high']);

const DEBRIEF_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary_text',
    'style_interpretation',
    'strength_observation',
    'blind_spot_observation',
    'reflection_prompt',
    'tone_tag',
  ],
  properties: {
    summary_text: { type: 'string' },
    style_interpretation: { type: 'string' },
    strength_observation: { type: 'string' },
    blind_spot_observation: { type: 'string' },
    reflection_prompt: { type: 'string' },
    tone_tag: { type: 'string', enum: ['supportive', 'challenging', 'balanced'] },
  },
};

const REFLECTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['journal_summary', 'next_focus_area'],
  properties: {
    journal_summary: { type: 'string' },
    next_focus_area: { type: 'string' },
  },
};

function buildFallbackDebrief(input) {
  const dominantStyle = input.resultSummary?.dominantStyleLabel || 'mixed';
  const outcomeBand = input.resultSummary?.outcomeBand || 'mixed';
  return {
    summary_text:
      outcomeBand === 'strong'
        ? 'You created momentum while keeping the team aligned around a shared course of action.'
        : 'You moved the meeting forward, but your leadership tradeoffs remained visible in how the team responded.',
    style_interpretation: `Your choices leaned ${dominantStyle}, which shaped how much control, participation, and accountability the group experienced.`,
    strength_observation: 'Your decisions showed an awareness that leadership style changes both the speed of a meeting and the quality of team commitment.',
    blind_spot_observation:
      'A useful next step is to notice when urgency starts crowding out voice, especially for quieter or dissenting teammates.',
    reflection_prompt:
      'If you replayed this meeting, what would you change to better balance task completion with relationship-centered leadership?',
    tone_tag: 'balanced',
  };
}

function buildFallbackReflection() {
  return {
    journal_summary: 'Your reflection captures what worked, what felt difficult, and where your leadership instincts showed up under pressure.',
    next_focus_area: 'Practice naming dissent early and then connecting the final decision back to team trust and inclusion.',
  };
}

function buildFallbackNpcReply(input) {
  const latestMessage = input.messages[input.messages.length - 1]?.content || '';
  const playerName = input.playerProfile?.playerName || 'traveler';
  const archetype = input.playerProfile?.archetypeLabel || 'leader';

  if (input.npc.interactionMode === 'deep') {
    return `${input.npc.introLine} ${playerName}, as a ${archetype}, consider this: ${latestMessage ? 'what assumption is guiding your last point?' : 'what kind of leader do you want to become in this zone?'}`;
  }

  return `${input.npc.introLine} Share one concrete example from your own experience, and I will help you interpret it through this zone's lens.`;
}

function validateStructuredText(payload, schema) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  if (schema.additionalProperties === false) {
    const allowed = new Set(Object.keys(schema.properties));
    const keys = Object.keys(payload);
    if (keys.some((key) => !allowed.has(key))) return false;
  }

  return schema.required.every((key) => typeof payload[key] === 'string' && payload[key].trim().length > 0);
}

function getReasoningEffort() {
  const candidate = String(config.openai.reasoningEffort || 'none').toLowerCase();
  return SUPPORTED_REASONING_EFFORTS.has(candidate) ? candidate : 'none';
}

class AIService {
  constructor(logger) {
    this.logger = logger;
    this.client = config.openai.apiKey ? new OpenAI({ apiKey: config.openai.apiKey }) : null;
  }

  get enabled() {
    return Boolean(this.client);
  }

  async generateDebrief(input, context) {
    if (!this.client) {
      this.logger.warn(
        {
          event: 'ai.debrief.fallback_used',
          request_id: context.requestId,
          scenario_key: input.scenarioKey,
          prompt_version: DEBRIEF_PROMPT_VERSION,
          fallback_used: true,
        },
        'OpenAI is not configured. Using fallback debrief.',
      );
      return buildFallbackDebrief(input);
    }

    const startedAt = Date.now();
    this.logger.info(
      {
        event: 'ai.debrief.started',
        request_id: context.requestId,
        scenario_key: input.scenarioKey,
        model: config.openai.model,
        prompt_version: DEBRIEF_PROMPT_VERSION,
      },
      'Requesting structured scenario debrief.',
    );

    try {
      const response = await this.client.responses.create(
        {
          model: config.openai.model,
          store: false,
          reasoning: { effort: getReasoningEffort() },
          instructions: [
            'You are a leadership course debrief assistant for OGL 200.',
            'Use only the structured input provided by the application.',
            'Do not invent scores, rewards, unlocks, or additional gameplay state.',
            'Write concise educational feedback tied to leadership style, task/relationship balance, inclusion, and decision quality.',
          ].join(' '),
          input: JSON.stringify(input),
          text: {
            verbosity: 'low',
            format: {
              type: 'json_schema',
              name: 'ogl200_module2_debrief',
              strict: true,
              schema: DEBRIEF_SCHEMA,
            },
          },
        },
        { timeout: 15000 },
      );

      const parsed = JSON.parse(response.output_text);
      if (!validateStructuredText(parsed, DEBRIEF_SCHEMA)) {
        this.logger.error(
          {
            event: 'ai.debrief.schema_validation_failed',
            request_id: context.requestId,
            scenario_key: input.scenarioKey,
            prompt_version: DEBRIEF_PROMPT_VERSION,
            latency_ms: Date.now() - startedAt,
            fallback_used: true,
          },
          'Debrief response failed schema validation.',
        );
        return buildFallbackDebrief(input);
      }

      this.logger.info(
        {
          event: 'ai.debrief.completed',
          request_id: context.requestId,
          scenario_key: input.scenarioKey,
          model: config.openai.model,
          prompt_version: DEBRIEF_PROMPT_VERSION,
          latency_ms: Date.now() - startedAt,
          token_usage: response.usage?.total_tokens,
          fallback_used: false,
        },
        'Structured scenario debrief generated.',
      );

      return parsed;
    } catch (error) {
      this.logger.error(
        {
          event: 'ai.debrief.provider_error',
          request_id: context.requestId,
          scenario_key: input.scenarioKey,
          model: config.openai.model,
          prompt_version: DEBRIEF_PROMPT_VERSION,
          latency_ms: Date.now() - startedAt,
          error_name: error.name,
          error_message: error.message,
          fallback_used: true,
        },
        'OpenAI debrief request failed.',
      );
      return buildFallbackDebrief(input);
    }
  }

  async summarizeReflection(input, context) {
    if (!this.client) return buildFallbackReflection();

    const startedAt = Date.now();

    try {
      const response = await this.client.responses.create(
        {
          model: config.openai.model,
          store: false,
          reasoning: { effort: getReasoningEffort() },
          instructions: [
            'Summarize a student leadership reflection for OGL 200.',
            'Do not mention grades, rewards, or hidden system state.',
            'Return only structured JSON that fits the schema.',
          ].join(' '),
          input: JSON.stringify({
            profile: input.playerProfile,
            resultSummary: input.resultSummary,
            reflectionText: input.reflectionText,
          }),
          text: {
            verbosity: 'low',
            format: {
              type: 'json_schema',
              name: 'ogl200_reflection_summary',
              strict: true,
              schema: REFLECTION_SCHEMA,
            },
          },
        },
        { timeout: 15000 },
      );

      const parsed = JSON.parse(response.output_text);
      if (!validateStructuredText(parsed, REFLECTION_SCHEMA)) {
        this.logger.warn(
          {
            event: 'ai.reflection.schema_validation_failed',
            request_id: context.requestId,
            prompt_version: REFLECTION_PROMPT_VERSION,
            latency_ms: Date.now() - startedAt,
          },
          'Reflection summary schema validation failed. Using fallback.',
        );
        return buildFallbackReflection();
      }

      this.logger.info(
        {
          event: 'ai.reflection.completed',
          request_id: context.requestId,
          prompt_version: REFLECTION_PROMPT_VERSION,
          latency_ms: Date.now() - startedAt,
          token_usage: response.usage?.total_tokens,
        },
        'Reflection summary generated.',
      );

      return parsed;
    } catch (error) {
      this.logger.error(
        {
          event: 'ai.reflection.provider_error',
          request_id: context.requestId,
          prompt_version: REFLECTION_PROMPT_VERSION,
          latency_ms: Date.now() - startedAt,
          error_name: error.name,
          error_message: error.message,
        },
        'Reflection summary request failed.',
      );
      return buildFallbackReflection();
    }
  }

  async generateNpcReply(input, context) {
    if (!this.client) {
      this.logger.warn(
        {
          event: 'ai.npc_chat.fallback_used',
          request_id: context.requestId,
          npc_id: input.npc.id,
          prompt_version: NPC_CHAT_PROMPT_VERSION,
          fallback_used: true,
        },
        'OpenAI is not configured. Using fallback NPC reply.',
      );
      return buildFallbackNpcReply(input);
    }

    const transcript = input.messages
      .map((message) => `${message.role}: ${String(message.content || '').trim()}`)
      .join('\n')
      .slice(0, 4000);
    const startedAt = Date.now();

    try {
      const response = await this.client.responses.create(
        {
          model: config.openai.model,
          store: false,
          reasoning: { effort: getReasoningEffort() },
          instructions: [
            input.npc.prompt,
            `Player name: ${input.playerProfile.playerName || 'Student'}.`,
            `Player archetype: ${input.playerProfile.archetypeLabel || 'Not selected'}.`,
            `Player location: ${input.playerProfile.locationLabel || input.playerProfile.country || 'Unknown'}.`,
            'Keep the answer concise, educational, and in character.',
            'Do not mention hidden systems, scores, moderation, or backend logic.',
          ].join(' '),
          input: transcript,
          text: {
            verbosity: 'low',
          },
        },
        { timeout: 15000 },
      );

      const reply = response.output_text?.trim();
      if (!reply) return buildFallbackNpcReply(input);

      this.logger.info(
        {
          event: 'ai.npc_chat.completed',
          request_id: context.requestId,
          npc_id: input.npc.id,
          prompt_version: NPC_CHAT_PROMPT_VERSION,
          latency_ms: Date.now() - startedAt,
          token_usage: response.usage?.total_tokens,
          fallback_used: false,
        },
        'NPC chat reply generated.',
      );

      return reply;
    } catch (error) {
      this.logger.error(
        {
          event: 'ai.npc_chat.provider_error',
          request_id: context.requestId,
          npc_id: input.npc.id,
          prompt_version: NPC_CHAT_PROMPT_VERSION,
          latency_ms: Date.now() - startedAt,
          error_name: error.name,
          error_message: error.message,
          fallback_used: true,
        },
        'NPC chat request failed.',
      );
      return buildFallbackNpcReply(input);
    }
  }

  buildSafetyIdentifier(ltiUserId) {
    return createHash('sha256').update(ltiUserId).digest('hex').slice(0, 64);
  }
}

module.exports = { AIService, buildFallbackDebrief };
