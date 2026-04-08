const DRAFT_STORAGE_KEY = 'wasel.admin.system-settings.draft';
const APPLIED_STORAGE_KEY = 'wasel.admin.system-settings.applied';

const DEFAULT_ENV = {
  JWT_EXPIRES_IN: '1h',
  JWT_REFRESH_EXPIRES_IN: '7d',
  MIN_PASSWORD_LENGTH: '8',
  WEATHER_API_KEY: '',
  WEATHER_FALLBACK_COORDS: '32.1744,35.2856',
  ROUTING_API_URL: 'https://router.project-osrm.org/route/v1',
  ROUTING_API_TIMEOUT: '10s',
  ROUTING_API_CACHE_TTL: '15m',
  WEATHER_API_URL: 'https://api.weatherapi.com/v1',
  WEATHER_API_TIMEOUT: '5s',
  WEATHER_API_CACHE_TTL: '30m',
};

const WEATHER_API_FALLBACK_KEY = '51e8b6c810274f0296602528261803';

let cachedEnv = null;

function readJsonStorage(key) {
  try {
    const rawValue = window.localStorage?.getItem(key);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    console.warn(`Could not read storage value for ${key}.`, error);
    return null;
  }
}

function writeJsonStorage(key, value) {
  window.localStorage?.setItem(key, JSON.stringify(value));
  return value;
}

function mapTimezoneToOptionLabel(timezone) {
  const normalizedTimezone = String(timezone || '').trim();

  if (normalizedTimezone === 'Asia/Hebron' || normalizedTimezone === 'Asia/Jerusalem') {
    return 'Asia/Jerusalem (GMT+03:00)';
  }

  if (normalizedTimezone === 'Europe/London') {
    return 'Europe/London (GMT+01:00)';
  }

  if (normalizedTimezone === 'America/New_York') {
    return 'America/New_York (GMT-04:00)';
  }

  return 'Asia/Jerusalem (GMT+03:00)';
}

function inferEnvironment(apiBaseUrl) {
  const normalizedUrl = String(apiBaseUrl || '').toLowerCase();

  if (!normalizedUrl) {
    return 'Unknown';
  }

  if (normalizedUrl.includes('localhost') || normalizedUrl.includes('127.0.0.1')) {
    return 'Local';
  }

  if (normalizedUrl.includes('staging') || normalizedUrl.includes('test')) {
    return 'Staging';
  }

  return 'Production';
}

async function loadEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = { ...DEFAULT_ENV };

  try {
    const response = await fetch('/.env', { cache: 'no-cache' });

    if (response.ok) {
      const text = await response.text();
      text.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (match?.[1]) {
          cachedEnv[match[1]] = match[2];
        }
      });
    }
  } catch (error) {
    console.warn('Could not load .env for system settings defaults.', error);
  }

  if (!cachedEnv.WEATHER_API_KEY) {
    cachedEnv.WEATHER_API_KEY = WEATHER_API_FALLBACK_KEY;
  }

  return cachedEnv;
}

function buildDefaults(env) {
  const apiBaseUrl = window.AppConfig?.API_BASE_URL || '';

  return {
    platformName: 'Wasel Palestine',
    primaryLanguage: 'English',
    timezone: mapTimezoneToOptionLabel(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    ),
    accessTokenExpiry: env.JWT_EXPIRES_IN || DEFAULT_ENV.JWT_EXPIRES_IN,
    refreshTokenExpiry:
      env.JWT_REFRESH_EXPIRES_IN || DEFAULT_ENV.JWT_REFRESH_EXPIRES_IN,
    minPasswordLength:
      env.MIN_PASSWORD_LENGTH || DEFAULT_ENV.MIN_PASSWORD_LENGTH,
    requireMixedCase: true,
    requireNumeric: true,
    requireSpecialCharacters: true,
    apiBaseUrl,
    environment: inferEnvironment(apiBaseUrl),
    configSource: 'App Defaults',
    routingEndpointUrl: env.ROUTING_API_URL || DEFAULT_ENV.ROUTING_API_URL,
    routingApiKey: env.ROUTING_API_KEY || '',
    routingTimeout: env.ROUTING_API_TIMEOUT || DEFAULT_ENV.ROUTING_API_TIMEOUT,
    routingCacheTtl:
      env.ROUTING_API_CACHE_TTL || DEFAULT_ENV.ROUTING_API_CACHE_TTL,
    weatherEndpointUrl: env.WEATHER_API_URL || DEFAULT_ENV.WEATHER_API_URL,
    weatherApiKey: env.WEATHER_API_KEY || '',
    weatherTimeout: env.WEATHER_API_TIMEOUT || DEFAULT_ENV.WEATHER_API_TIMEOUT,
    weatherCacheTtl:
      env.WEATHER_API_CACHE_TTL || DEFAULT_ENV.WEATHER_API_CACHE_TTL,
    weatherFallbackCoords:
      env.WEATHER_FALLBACK_COORDS || DEFAULT_ENV.WEATHER_FALLBACK_COORDS,
    linkedApis: [
      {
        name: 'Platform API',
        url: apiBaseUrl,
      },
      {
        name: 'Routing API',
        url: env.ROUTING_API_URL || DEFAULT_ENV.ROUTING_API_URL,
      },
      {
        name: 'Weather API',
        url: env.WEATHER_API_URL || DEFAULT_ENV.WEATHER_API_URL,
      },
    ],
  };
}

function applyApiBaseUrl(apiBaseUrl) {
  const normalizedUrl = String(apiBaseUrl || '').trim();
  if (!normalizedUrl) {
    return;
  }

  if (!window.AppConfig) {
    window.AppConfig = {};
  }

  window.AppConfig.API_BASE_URL = normalizedUrl;

  if (window.authApi?.defaults) {
    window.authApi.defaults.baseURL = normalizedUrl;
  }

  if (window.appApiClient?.defaults) {
    window.appApiClient.defaults.baseURL = normalizedUrl;
  }

  window.dispatchEvent(
    new CustomEvent('app:config-updated', {
      detail: {
        apiBaseUrl: normalizedUrl,
      },
    }),
  );
}

export async function loadSystemSettingsSnapshot() {
  const env = await loadEnv();
  const defaults = buildDefaults(env);
  const appliedConfig = readJsonStorage(APPLIED_STORAGE_KEY);
  const draft = readJsonStorage(DRAFT_STORAGE_KEY);

  const baseSnapshot = appliedConfig
    ? {
      ...defaults,
      ...appliedConfig,
      configSource: 'Saved Runtime Override',
      environment: inferEnvironment(appliedConfig.apiBaseUrl || defaults.apiBaseUrl),
    }
    : defaults;

  return draft
    ? {
      ...baseSnapshot,
      ...draft,
      configSource: appliedConfig ? 'Saved Runtime Override + Draft' : 'Draft',
      environment: inferEnvironment(draft.apiBaseUrl || baseSnapshot.apiBaseUrl),
    }
    : baseSnapshot;
}

export function saveSystemSettingsDraft(draft) {
  return writeJsonStorage(DRAFT_STORAGE_KEY, draft);
}

export function applySystemSettings(snapshot) {
  const appliedSnapshot = {
    ...snapshot,
    environment: inferEnvironment(snapshot.apiBaseUrl),
    configSource: 'Saved Runtime Override',
    linkedApis: [
      {
        name: 'Platform API',
        url: snapshot.apiBaseUrl,
      },
      {
        name: 'Routing API',
        url: snapshot.routingEndpointUrl,
      },
      {
        name: 'Weather API',
        url: snapshot.weatherEndpointUrl,
      },
    ],
  };

  applyApiBaseUrl(appliedSnapshot.apiBaseUrl);
  writeJsonStorage(APPLIED_STORAGE_KEY, appliedSnapshot);
  window.localStorage?.removeItem(DRAFT_STORAGE_KEY);

  return appliedSnapshot;
}

export async function resetSystemSettingsDraft() {
  window.localStorage?.removeItem(DRAFT_STORAGE_KEY);
  return loadSystemSettingsSnapshot();
}
