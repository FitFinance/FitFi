// Adds Android 11+ package visibility queries for wallet deep-link schemes
// This makes Linking.canOpenURL('metamask://...') etc. reliable.

const { withAndroidManifest } = require('@expo/config-plugins');

/** @type {import('@expo/config-plugins').ConfigPlugin} */
module.exports = function withWalletDeepLinkQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Ensure <queries> exists
    manifest.queries = manifest.queries || [];

    const schemes = ['metamask', 'trust', 'rainbow', 'zerion'];

    // Helper to check if a scheme is already present
    const hasScheme = (scheme) => {
      const queries = manifest.queries || [];
      for (const q of queries) {
        const intents = q.intent || [];
        for (const intent of intents) {
          const datas = intent.data || [];
          for (const d of datas) {
            if (d.$ && d.$['android:scheme'] === scheme) {
              return true;
            }
          }
        }
      }
      return false;
    };

    const createIntentQuery = (scheme) => ({
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': scheme } }],
        },
      ],
    });

    schemes.forEach((scheme) => {
      if (!hasScheme(scheme)) {
        manifest.queries.push(createIntentQuery(scheme));
      }
    });

    return config;
  });
};
