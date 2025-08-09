/**
 * Environment configuration helper
 * Provides easy access to environment variables and development settings
 */

export const ENV = {
  // Environment detection
  NODE_ENV: process.env.EXPO_PUBLIC_NODE_ENV || 'development',
  IS_DEV: process.env.EXPO_PUBLIC_NODE_ENV === 'development',
  IS_PROD: process.env.EXPO_PUBLIC_NODE_ENV === 'production',

  // API Configuration
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api/v1',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'ws://10.0.2.2:3000',

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
