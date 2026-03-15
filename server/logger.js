const { randomUUID } = require('crypto');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { config } = require('./config');

const transport = config.isProduction
  ? undefined
  : pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    });

const logger = pino(
  {
    level: config.logLevel,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);

function requestLogger() {
  return pinoHttp({
    logger,
    genReqId(req, res) {
      const headerId = req.headers['x-request-id'];
      const requestId = typeof headerId === 'string' && headerId.trim() ? headerId : randomUUID();
      res.setHeader('x-request-id', requestId);
      return requestId;
    },
    customProps(req) {
      return {
        request_id: req.id,
        route: req.route?.path || req.path,
      };
    },
    customSuccessMessage(req, res) {
      return `${req.method} ${req.url} completed with ${res.statusCode}`;
    },
    customErrorMessage(req, res, error) {
      return `${req.method} ${req.url} failed with ${res.statusCode}: ${error.message}`;
    },
  });
}

function getLogContext(req, extra = {}) {
  return {
    request_id: req?.id,
    session_id: req?.sessionId,
    user_id: req?.currentUser?.id,
    lti_user_id: req?.currentUser?.ltiUserId || req?.authContext?.ltiUserId,
    avatar_id: req?.playerProfile?.avatarId,
    route: req?.route?.path || req?.path,
    ...extra,
  };
}

module.exports = { logger, requestLogger, getLogContext };
