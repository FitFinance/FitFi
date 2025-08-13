# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Wallet Connectivity

This app supports two wallet connection strategies:

1. MetaMask SDK (direct) for a streamlined MetaMask-only flow (falls back to WalletConnect if direct fails).
2. WalletConnect v2 Universal Provider for any supported wallet (MetaMask, Trust, Rainbow, Coinbase Wallet, etc.).

Selection logic:

- Connect Wallet screen: choosing MetaMask attempts MetaMask SDK direct; automatic fallback to WalletConnect if SDK init or connection fails.
- Connect Wallet (generic) button uses WalletConnect multi-wallet flow.

Configuration:

- Create a WalletConnect Cloud project and set `EXPO_PUBLIC_WC_PROJECT_ID`.
- Set `EXPO_PUBLIC_API_BASE_URL` (defaults to `http://localhost:3000/api`).
- Optional: `EXPO_PUBLIC_LOG_LEVEL`, `EXPO_PUBLIC_APP_ENV`.

Peer dependency conflicts are relaxed via `.npmrc` (`legacy-peer-deps=true`).

Troubleshooting:

- MetaMask direct fails / unresolved module: clear Metro cache and ensure polyfills in `polyfills.ts` are imported at the top of `app/_layout.tsx`.
- Android release build fails with `Inconsistent JVM-target` for MetaMask SDK: we force jvmTarget=17 for all Kotlin modules in `android/build.gradle` and set `kotlinOptions { jvmTarget = '17' }` plus `compileOptions` in `android/app/build.gradle`.
- MetaMask SDK Kotlin compilation error around nullable ReadableMap: a patch is applied via patch-package (`patches/@metamask+sdk-react-native+0.3.12.patch`) making the initialize parameter nullable-safe.
- If MetaMask app does not open: open it manually once, then retry. Ensure device has MetaMask installed.
- WalletConnect timeouts: confirm `EXPO_PUBLIC_WC_PROJECT_ID` validity and network connectivity.
- Android emulator + localhost API: automatically rewritten to `10.0.2.2` (verify `EnvironmentConfig`).

Two-step flow (optional): the service exposes `connectSession()` then `signAndAuthenticate()` for UX that separates connection from signing (e.g., show address first, ask user to confirm sign). The context now exports `connectSession` and `signAndAuthenticate`.

After adding or reinstalling dependencies run:
`npm install` (postinstall will re-apply the MetaMask patch automatically).

## Windows Native Build Environment

To keep Gradle cache on the same drive (avoid hard link fallbacks & speed builds):

1. Run one-time per session:
   ```powershell
   npm run setup:windows-env
   ```
   (Creates `D:\GradleCache` and sets `GRADLE_USER_HOME` for the session.)
2. Then build:
   ```powershell
   npx expo run:android
   ```
3. To persist across sessions add a user environment variable:
   - `GRADLE_USER_HOME=D:\GradleCache`

Optional: set `ANDROID_SDK_ROOT` if you relocate the Android SDK.

### Cleaning Old Gradle Cache (Windows)

Use the helper script to archive (or delete) the old default cache on C: and free space:

Dry run to see what would happen:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/clean-gradle-cache.ps1 -DryRun
```

Move cache to backup (default) or delete on failure (with -Force via npm script):

```powershell
npm run clean:gradle-cache
```

Extra options:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/clean-gradle-cache.ps1 -Force -PurgeNodeModules
```

`-PurgeNodeModules` also removes the local node_modules to allow a pristine install.
