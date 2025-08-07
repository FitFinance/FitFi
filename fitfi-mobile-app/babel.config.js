module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      // Removed module-resolver to prevent build conflicts
      // The metro config handles module resolution
    ],
  };
};
