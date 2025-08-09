module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Expo Router Babel plugin
      require.resolve('expo-router/babel'),
      // Reanimated plugin must be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
