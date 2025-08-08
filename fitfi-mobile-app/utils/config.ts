/**
 * Environment configuration helper
 * Provides easy access to environment variables and development settings
 */

// Prefer LAN IP fallback for physical Android devices when no env is injected
const DEFAULT_LAN_API = 'http://192.168.29.122:3000/api/v1';
const DEFAULT_LAN_WS = 'ws://192.168.29.122:3000';

export const ENV = {
  // Environment detection
  NODE_ENV: process.env.EXPO_PUBLIC_NODE_ENV || 'development',
  IS_DEV: process.env.EXPO_PUBLIC_NODE_ENV === 'development',
  IS_PROD: process.env.EXPO_PUBLIC_NODE_ENV === 'production',

  // API Configuration
  // In many local release builds, env variables aren’t embedded. Using 10.0.2.2 only works on the emulator.
  // To work on a physical device by default, fall back to your LAN IP. Override with EXPO_PUBLIC_API_URL when set.
  API_URL: process.env.EXPO_PUBLIC_API_URL || DEFAULT_LAN_API,
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || DEFAULT_LAN_WS,

  // Feature flags
  HEALTH_CONNECT_ENABLED:
    process.env.EXPO_PUBLIC_HEALTH_CONNECT_ENABLED === 'true',
  SHOW_DEV_COMPONENTS: process.env.EXPO_PUBLIC_SHOW_DEV_COMPONENTS === 'true',
  DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
};

/**
 * Debug logger that only logs in development mode
 */
export const debugLog = (...args: any[]) => {
  if (ENV.DEBUG_MODE) {
    console.log('[FitFi Debug]:', ...args);
  }
};

export default ENV;
