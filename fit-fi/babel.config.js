module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Needed for packages (e.g. valtio) that use import.meta in Hermes
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      // Reanimated plugin must be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
