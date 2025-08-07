const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add polyfills for crypto modules
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: require.resolve('expo-crypto'),
  stream: require.resolve('readable-stream'),
};

// Add node module extensions
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'js',
  'json',
  'ts',
  'tsx',
  'mjs', // Add mjs support for ES modules
];

// Configure module resolution for React Native
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Configure transformer for better module handling
config.transformer.minifierConfig = {
  keep_classnames: true,
  mangle: {
    keep_classnames: true,
  },
};

// Add support for import.meta transformations
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
