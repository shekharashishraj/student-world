require('dotenv').config();

const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const WEB_DEV_ORIGIN = process.env.WEB_DEV_ORIGIN || 'http://localhost:5173';

const config = {
  env: NODE_ENV,
  isProduction: NODE_ENV === 'production',
  port: PORT,
  appUrl: APP_URL,
  webDevOrigin: WEB_DEV_ORIGIN,
  logLevel: process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug'),
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || 'student_world',
    username: process.env.POSTGRES_USER || 'student_world',
    password: process.env.POSTGRES_PASSWORD || 'student_world',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-5.1-2025-11-13',
    reasoningEffort: process.env.OPENAI_REASONING_EFFORT || 'none',
  },
  lti: {
    key: process.env.LTI_KEY || 'STUDENT_WORLD_DEV_KEY_MIN32CHARSLONG!!',
    canvasUrl: process.env.CANVAS_URL || 'https://canvas.instructure.com',
    clientId: process.env.LTI_CLIENT_ID || '',
  },
};

function validateConfig(logger) {
  const issues = [];

  ['host', 'database', 'username', 'password'].forEach((key) => {
    if (!config.postgres[key]) issues.push(`postgres.${key}`);
  });

  if (!Number.isInteger(config.port) || config.port <= 0) issues.push('port');

  if (issues.length > 0) {
    logger.error({ event: 'config.validation_failed', issues }, 'Runtime configuration is invalid.');
    throw new Error(`Invalid runtime configuration: ${issues.join(', ')}`);
  }

  logger.info(
    {
      event: 'config.validated',
      env: config.env,
      postgres_host: config.postgres.host,
      postgres_database: config.postgres.database,
      openai_enabled: Boolean(config.openai.apiKey),
      lti_client_id_present: Boolean(config.lti.clientId),
    },
    'Runtime configuration validated.',
  );
}

module.exports = { config, validateConfig };
