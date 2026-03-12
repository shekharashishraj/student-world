const { Provider } = require('ltijs');
const Database = require('ltijs-sequelize');

// ─── SQLite database (in-memory for demo; swap storage path for persistence) ──
const db = new Database('sqlite', null, null, {
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'production'
    ? './student-world.db'
    : ':memory:',          // in-memory is fine for demos
  logging: false,
});

// ─── Locale → Country fallback map ───────────────────────────────────────────
const LOCALE_TO_COUNTRY = {
  'en-US': 'USA', 'en-GB': 'United Kingdom', 'en-AU': 'Australia',
  'en-NZ': 'New Zealand', 'en-CA': 'Canada', 'en-IN': 'India',
  'en-ZA': 'South Africa', 'en-NG': 'Nigeria', 'en-KE': 'Kenya',
  'en-GH': 'Ghana', 'en-UG': 'Uganda', 'en-ZW': 'Zimbabwe',
  'ja': 'Japan', 'zh': 'China', 'zh-CN': 'China', 'zh-TW': 'Taiwan',
  'de': 'Germany', 'de-AT': 'Austria', 'de-CH': 'Switzerland',
  'fr': 'France', 'fr-BE': 'Belgium',
  'hi': 'India', 'pt-BR': 'Brazil', 'pt': 'Portugal',
  'ar': 'Egypt', 'ar-JO': 'Jordan', 'ar-SA': 'Saudi Arabia',
  'ko': 'South Korea', 'ru': 'Russia', 'uk': 'Ukraine',
  'es': 'Spain', 'es-MX': 'Mexico', 'es-CO': 'Colombia',
  'es-PE': 'Peru', 'es-VE': 'Venezuela', 'es-CL': 'Chile',
  'nl': 'Netherlands', 'pl': 'Poland', 'it': 'Italy',
  'sv': 'Sweden', 'no': 'Norway', 'fi': 'Finland', 'da': 'Denmark',
  'cs': 'Czech Republic', 'ro': 'Romania', 'hu': 'Hungary',
  'el': 'Greece', 'tr': 'Turkey', 'he': 'Israel',
  'id': 'Indonesia', 'ms': 'Malaysia', 'th': 'Thailand',
  'vi': 'Vietnam', 'bn': 'Bangladesh', 'ur': 'Pakistan',
  'fa': 'Iran', 'si': 'Sri Lanka', 'am': 'Ethiopia',
  'sw': 'Tanzania', 'tl': 'Philippines',
};

// ─── LTI 1.3 Provider Setup ───────────────────────────────────────────────────
Provider.setup(
  process.env.LTI_KEY || 'STUDENT_WORLD_DEV_KEY_MIN32CHARSLONG!!',
  { plugin: db },
  {
    cookies: { secure: false, sameSite: '' },
    devMode: process.env.NODE_ENV !== 'production',
  }
);

// ─── Called on successful LTI launch ─────────────────────────────────────────
Provider.onConnect(async (token, req, res) => {
  const name = token.userInfo?.name
    || token.userInfo?.given_name
    || 'Student';

  const locale = token.platformContext?.locale || '';
  const customCountry = token.platformContext?.custom?.country || '';
  const country = customCountry || LOCALE_TO_COUNTRY[locale] || '';

  const params = new URLSearchParams({ name, lti: '1' });
  if (country) params.set('country', country);

  return res.redirect(`/?${params.toString()}`);
});

// ─── Register Canvas as LTI platform (called once at startup) ─────────────────
async function registerPlatform() {
  const canvasUrl = process.env.CANVAS_URL || 'https://canvas.instructure.com';
  const clientId = process.env.LTI_CLIENT_ID;

  if (!clientId) {
    console.log('⚠  LTI_CLIENT_ID not set — skipping Canvas platform registration.');
    console.log('   Set LTI_CLIENT_ID in .env after configuring the tool in Canvas.');
    return;
  }

  try {
    await Provider.registerPlatform({
      url: canvasUrl,
      name: 'ASU Canvas',
      clientId,
      authenticationEndpoint: `${canvasUrl}/api/lti/authorize_redirect`,
      accesstokenEndpoint: `${canvasUrl}/login/oauth2/token`,
      authConfig: {
        method: 'JWK_SET',
        key: `${canvasUrl}/api/lti/security/jwks`,
      },
    });
    console.log(`✅ Canvas LTI platform registered: ${canvasUrl}`);
  } catch (err) {
    console.error('LTI platform registration failed:', err.message);
  }
}

module.exports = { Provider, registerPlatform };
