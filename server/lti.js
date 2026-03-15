const { Provider } = require('ltijs');
const Database = require('ltijs-sequelize');
const { config } = require('./config');

const db = new Database(
  config.postgres.database,
  config.postgres.username,
  config.postgres.password,
  {
    host: config.postgres.host,
    port: config.postgres.port,
    dialect: 'postgres',
    logging: false,
  },
);

const LOCALE_TO_COUNTRY = {
  'en-US': 'USA',
  'en-GB': 'United Kingdom',
  'en-AU': 'Australia',
  'en-NZ': 'New Zealand',
  'en-CA': 'Canada',
  'en-IN': 'India',
  ja: 'Japan',
  'zh-CN': 'China',
  fr: 'France',
  de: 'Germany',
  es: 'Spain',
  'es-MX': 'Mexico',
  pt: 'Portugal',
  'pt-BR': 'Brazil',
};

Provider.setup(config.lti.key, { plugin: db }, {
  cookies: { secure: false, sameSite: '' },
  devMode: !config.isProduction,
});

function configureLtiHooks(logger) {
  Provider.onConnect(async (token, req, res) => {
    const displayName =
      token.userInfo?.name ||
      token.userInfo?.given_name ||
      token.user ||
      'Student';
    const locale = token.platformContext?.locale || '';
    const ltiUserId = token.user;
    const country =
      token.platformContext?.custom?.country ||
      LOCALE_TO_COUNTRY[locale] ||
      '';

    const baseUrl = config.isProduction ? config.appUrl : config.webDevOrigin;
    const redirectUrl = new URL(baseUrl);

    redirectUrl.searchParams.set('ltiUserId', ltiUserId);
    redirectUrl.searchParams.set('name', displayName);
    if (country) redirectUrl.searchParams.set('country', country);
    if (locale) redirectUrl.searchParams.set('locale', locale);
    redirectUrl.searchParams.set('lti', '1');

    logger.info(
      {
        event: 'lti.launch.success',
        lti_user_id: ltiUserId,
        route: req.path,
        status: 302,
      },
      'LTI launch completed and redirected to the web client.',
    );

    return res.redirect(redirectUrl.toString());
  });
}

async function registerPlatform(logger) {
  if (!config.lti.clientId) {
    logger.warn(
      {
        event: 'lti.platform.skipped',
        reason: 'missing_client_id',
      },
      'LTI_CLIENT_ID not set. Skipping Canvas platform registration.',
    );
    return;
  }

  try {
    await Provider.registerPlatform({
      url: config.lti.canvasUrl,
      name: 'ASU Canvas',
      clientId: config.lti.clientId,
      authenticationEndpoint: `${config.lti.canvasUrl}/api/lti/authorize_redirect`,
      accesstokenEndpoint: `${config.lti.canvasUrl}/login/oauth2/token`,
      authConfig: {
        method: 'JWK_SET',
        key: `${config.lti.canvasUrl}/api/lti/security/jwks`,
      },
    });

    logger.info(
      {
        event: 'lti.platform.registered',
        canvas_url: config.lti.canvasUrl,
      },
      'Canvas LTI platform registered.',
    );
  } catch (error) {
    logger.error(
      {
        event: 'lti.platform.registration_failed',
        canvas_url: config.lti.canvasUrl,
        error_name: error.name,
        error_message: error.message,
      },
      'Canvas LTI platform registration failed.',
    );
  }
}

module.exports = { Provider, configureLtiHooks, registerPlatform };
