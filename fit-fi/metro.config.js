// Expo-based Metro config: extends @expo/metro-config defaults.
// Removes explicit transformer override that caused 'metro-react-native-babel-transformer' not found.
// Adds: limited workers (Windows EPERM mitigation) + package exports support.
const { getDefaultConfig } = require('@expo/metro-config');
const os = require('os');

const config = getDefaultConfig(__dirname);

// Enable modern exports resolution (silences multiformats / noble hashes warnings in many cases)
config.resolver.unstable_enablePackageExports = true;

// Cap workers to reduce jest-worker EPERM crashes on Windows
config.maxWorkers = Math.min(2, Math.max(1, os.cpus().length - 1));

module.exports = config;
