// Environment configuration and helpers
export interface EnvConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  mockWalletAddress: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  appEnv: 'development' | 'staging' | 'production' | string;
  walletConnectProjectId?: string;
}

// Load from process.env (Expo constants / app.config.js can inject) with fallbacks
// Merge sources: process.env (Metro in dev / inline in build) + Expo Constants extra (release)
let mergedEnv: Record<string, any> = {};
try {
  // Lazy require to avoid adding import overhead if not available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Constants = require('expo-constants').default;
  const extra =
    (Constants?.expoConfig?.extra || Constants?.manifest2?.extra) ?? {};
  mergedEnv = {
    ...(typeof process !== 'undefined' ? process.env || {} : {}),
    ...extra,
  };
} catch {
  mergedEnv = { ...(typeof process !== 'undefined' ? process.env || {} : {}) };
}

// Convenience accessor (maintain original name for existing code)
// @ts-ignore
const env: Record<string, string | undefined> = mergedEnv;

let resolvedBaseUrl =
  env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
// Android emulator / device fallbacks if someone accidentally leaves localhost
if (/localhost|127\.0\.0\.1/.test(resolvedBaseUrl)) {
  // If running on Android, attempt typical emulator host mapping
  // @ts-ignore
  const isAndroid =
    typeof navigator !== 'undefined' &&
    /Android/i.test(navigator.userAgent || '');
  if (isAndroid) {
    resolvedBaseUrl = resolvedBaseUrl
      .replace('localhost', '10.0.2.2')
      .replace('127.0.0.1', '10.0.2.2');
  }
}

export const ENV_CONFIG: EnvConfig = {
  apiBaseUrl: resolvedBaseUrl,
  apiTimeout: Number(env.EXPO_PUBLIC_API_TIMEOUT || 10000),
  mockWalletAddress:
    env.EXPO_PUBLIC_MOCK_WALLET || '0xDEMO000000000000000000000000000000000000',
  logLevel: (env.EXPO_PUBLIC_LOG_LEVEL as EnvConfig['logLevel']) || 'debug',
  appEnv:
    (env.EXPO_PUBLIC_APP_ENV as any) || (env.NODE_ENV as any) || 'development',
  walletConnectProjectId: env.EXPO_PUBLIC_WC_PROJECT_ID,
};

export const getApiUrl = (path: string) => {
  const base = ENV_CONFIG.apiBaseUrl.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export function envLog(
  level: EnvConfig['logLevel'],
  message: string,
  meta?: any
) {
  const order: EnvConfig['logLevel'][] = ['debug', 'info', 'warn', 'error'];
  if (ENV_CONFIG.logLevel === 'silent') return;
  if (order.indexOf(level) < order.indexOf(ENV_CONFIG.logLevel)) return;
  // eslint-disable-next-line no-console
  console[level === 'debug' ? 'log' : level](`[ENV] ${message}`, meta ?? '');
}

// Validate required environment variables
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!ENV_CONFIG.apiBaseUrl) errors.push('EXPO_PUBLIC_API_BASE_URL missing');
  if (!/^https?:\/\//.test(ENV_CONFIG.apiBaseUrl))
    errors.push('apiBaseUrl must start with http/https');
  if (ENV_CONFIG.apiTimeout < 1000) errors.push('apiTimeout too low (<1000ms)');
  return { valid: errors.length === 0, errors };
}

export default ENV_CONFIG;
