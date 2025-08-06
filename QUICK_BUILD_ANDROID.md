# 🚀 Quick Start: Building FitFi for Android

## 📋 Prerequisites

1. **Node.js** (v18+) installed
2. **Expo CLI** installed: `npm install -g @expo/cli`
3. **EAS CLI** installed: `npm install -g eas-cli`
4. **Expo account** (free): [expo.dev](https://expo.dev)

## ⚡ Fastest Way to Build (Recommended)

### 1. Run the Build Script

```bash
# Windows
build-android.bat

# Linux/macOS
./build-android.sh
```

### 2. Choose Option 1 (EAS Build)

- Select "1" for EAS Build (Cloud)
- Login to your Expo account when prompted
- Choose "1" for Preview APK (for testing)

### 3. Wait for Build

- Build happens in the cloud (5-10 minutes)
- Download APK when ready
- Install on your Android device

## 🛠️ Manual Build Process

### Step 1: Setup EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Navigate to mobile app
cd fitfi-mobile-app

# Configure EAS
eas build:configure
```

### Step 2: Switch to Production

```bash
# Switch to production environment
switch-env.bat prod    # Windows
./switch-env.sh prod   # Linux/macOS
```

### Step 3: Build APK

```bash
# Build for testing (APK)
eas build --profile preview --platform android

# Or build for Play Store (AAB)
eas build --profile production --platform android
```

## 📱 Install and Test

### 1. Download APK

- Check your EAS build dashboard
- Download the APK when build completes

### 2. Install on Android Device

```bash
# Enable Developer Options and USB Debugging
# Connect device via USB
adb install your-app.apk

# Or transfer APK to device and install manually
```

### 3. Test Health Connect

1. Install **Health Connect** from Play Store
2. Install **Google Fit** or **Samsung Health**
3. Generate some steps/fitness data
4. Open FitFi app
5. Test duel creation and health monitoring

## 🔧 Alternative: Local Build

### Prerequisites

- **Android Studio** with Android SDK
- **ANDROID_HOME** environment variable set

### Build Commands

```bash
cd fitfi-mobile-app

# Switch to production
switch-env.bat prod

# Install dependencies
npm install

# Build APK locally
npx expo run:android --variant release
```

## 🎯 Build Types

| Build Type      | Purpose | Output | Use Case                                |
| --------------- | ------- | ------ | --------------------------------------- |
| **Preview**     | Testing | APK    | Internal testing, sharing with testers  |
| **Production**  | Store   | AAB    | Google Play Store submission            |
| **Development** | Debug   | APK    | Development testing with debug features |

## 📊 Build Configuration

Your app is configured with:

- **Package**: `com.fitfi.app`
- **Version**: `1.0.0`
- **Target SDK**: 34 (Android 14)
- **Health Connect permissions** included
- **Production API URLs** (when using prod environment)

## 🚨 Troubleshooting

### "Build failed"

```bash
# Clear cache and retry
cd fitfi-mobile-app
npx expo start --clear
npm install
eas build --profile preview --platform android
```

### "Health Connect not working"

- Ensure target SDK is 34+
- Check Health Connect app is installed
- Grant all health permissions
- Test with Google Fit first

### "Can't connect to API"

- Verify production API URLs in `.env.production`
- Check backend server is running
- Test API endpoints manually

## 🎉 Success Checklist

After building and installing:

- [ ] App opens without crashes
- [ ] Health Connect permissions granted
- [ ] Can create user account
- [ ] Can search for opponents
- [ ] Health data collection works
- [ ] Real-time updates working
- [ ] Debug components hidden (production build)

## 💡 Pro Tips

1. **Use EAS Build** - Easiest and most reliable
2. **Test on real device** - Health Connect needs real Android device
3. **Generate test data** - Walk around or use Google Fit
4. **Check permissions** - Grant all Health Connect permissions
5. **Monitor build logs** - Check EAS dashboard for build progress

## 📞 Need Help?

1. **Check build logs** on EAS dashboard
2. **Review error messages** in terminal
3. **Test backend API** separately
4. **Verify Health Connect** app setup
5. **Check environment variables** are correct

Your FitFi Android app will be ready in 10-15 minutes! 🚀📱
