# FitFi Android Build Guide

## 🏗️ Android Build Options

There are several ways to build your FitFi Android app:

### 1. **EAS Build (Recommended)** - Cloud-based building

### 2. **Local Development Build** - For testing with development features

### 3. **APK Build** - For direct installation

### 4. **Android Studio Build** - For advanced customization

---

## 🚀 Option 1: EAS Build (Recommended for Production)

EAS (Expo Application Services) is the modern way to build Expo apps for production.

### Prerequisites

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login
```

### 1. Initialize EAS Build

```bash
cd fitfi-mobile-app
eas build:configure
```

### 2. Create EAS Build Configuration

Create `eas.json` in the mobile app directory:

```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "env": {
          "NODE_ENV": "development"
        }
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "env": {
          "NODE_ENV": "production"
        }
      }
    },
    "production": {
      "android": {
        "buildType": "aab",
        "env": {
          "NODE_ENV": "production"
        }
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 3. Build Commands

#### Development Build (for testing with Expo Go)

```bash
eas build --profile development --platform android
```

#### Preview Build (APK for internal testing)

```bash
eas build --profile preview --platform android
```

#### Production Build (AAB for Google Play Store)

```bash
eas build --profile production --platform android
```

### 4. Build Process

- EAS will build your app in the cloud
- Download the APK/AAB when build completes
- Install APK directly on Android devices
- Upload AAB to Google Play Store

---

## 🔧 Option 2: Local Development Build

### Prerequisites

```bash
# Install Android SDK and tools
# Download Android Studio: https://developer.android.com/studio

# Set environment variables (add to your shell profile)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

### 1. Create Development Build

```bash
cd fitfi-mobile-app

# Install dependencies
npm install

# Create development build
npx expo run:android
```

### 2. Build APK for Testing

```bash
# Switch to production environment
./switch-env.bat prod  # Windows
./switch-env.sh prod   # Linux/Mac

# Create production build
npx expo run:android --variant release
```

---

## 📦 Option 3: Direct APK Build

### Using Expo CLI (Legacy)

```bash
# Install legacy Expo CLI
npm install -g @expo/cli

# Build APK
expo build:android -t apk

# Build AAB (for Play Store)
expo build:android -t app-bundle
```

---

## 🛠️ Option 4: Android Studio Build

### 1. Eject to Bare Workflow (if needed)

```bash
npx expo eject
```

### 2. Open in Android Studio

- Open Android Studio
- Select "Open an existing project"
- Navigate to `fitfi-mobile-app/android`
- Wait for Gradle sync

### 3. Build in Android Studio

- Select Build → Generate Signed Bundle/APK
- Choose APK or Android App Bundle
- Create/select signing key
- Build release version

---

## 🔐 Code Signing Setup

### Generate Keystore

```bash
# Generate keystore file
keytool -genkeypair -v -keystore fitfi-release-key.keystore -alias fitfi-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Store keystore securely and note the passwords
```

### Configure Signing (for EAS)

```bash
# Upload keystore to EAS
eas credentials
```

---

## ⚙️ Build Configuration

### Update app.json for Production

```json
{
  "expo": {
    "name": "FitFi - Move to Earn",
    "slug": "fitfi-app",
    "version": "1.0.0",
    "android": {
      "package": "com.fitfi.app",
      "versionCode": 1,
      "compileSdkVersion": 34,
      "targetSdkVersion": 34,
      "buildToolsVersion": "34.0.0",
      "permissions": [
        "android.permission.health.READ_STEPS",
        "android.permission.health.READ_DISTANCE",
        "android.permission.health.READ_TOTAL_CALORIES_BURNED",
        "android.permission.health.READ_EXERCISE",
        "android.permission.ACTIVITY_RECOGNITION",
        "android.permission.BODY_SENSORS"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#667eea"
      }
    }
  }
}
```

---

## 🚀 Step-by-Step Production Build

### Method 1: EAS Build (Easiest)

```bash
# 1. Setup EAS
npm install -g eas-cli
eas login

# 2. Navigate to project
cd fitfi-mobile-app

# 3. Switch to production environment
switch-env.bat prod  # Windows

# 4. Initialize EAS (if not done)
eas build:configure

# 5. Build production APK
eas build --profile preview --platform android

# 6. Build production AAB (for Play Store)
eas build --profile production --platform android
```

### Method 2: Local Build

```bash
# 1. Setup Android environment
# Install Android Studio and SDK

# 2. Navigate to project
cd fitfi-mobile-app

# 3. Switch to production
switch-env.bat prod

# 4. Install dependencies
npm install

# 5. Build APK
npx expo run:android --variant release
```

---

## 📱 Testing Your Build

### Install APK on Device

```bash
# Enable Developer Options and USB Debugging on your Android device
# Connect device via USB

# Install APK
adb install path/to/your-app.apk

# Or drag and drop APK file to device
```

### Test Health Connect Integration

1. Install Health Connect app from Play Store
2. Install Google Fit or Samsung Health
3. Generate some fitness data
4. Open FitFi app and test duel creation
5. Verify real-time health data collection

---

## 🔍 Build Troubleshooting

### Common Issues

#### "Health Connect permissions not working"

```bash
# Ensure targetSdkVersion is 34 or higher
# Add to app.json:
"android": {
  "compileSdkVersion": 34,
  "targetSdkVersion": 34
}
```

#### "API connection failed"

```bash
# Update .env with production API URLs
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api/v1
EXPO_PUBLIC_WS_URL=wss://your-api-domain.com
```

#### "Build failed - gradle error"

```bash
# Clear cache and rebuild
cd fitfi-mobile-app
npx expo start --clear
rm -rf node_modules
npm install
```

#### "Keystore issues"

```bash
# Generate new keystore
keytool -genkeypair -v -keystore fitfi-release.keystore -alias fitfi -keyalg RSA -keysize 2048 -validity 10000
```

---

## 📊 Build Optimization

### Reduce APK Size

```json
// app.json
{
  "expo": {
    "android": {
      "enableProguardInReleaseBuilds": true,
      "enableSeparateBuildPerCPUArchitecture": true
    }
  }
}
```

### Performance Optimization

```bash
# Enable Hermes JavaScript engine
npx expo install react-native-hermes

# Optimize images
npx expo optimize
```

---

## 🎯 Build Checklist

### Pre-Build Checklist

- [ ] Switch to production environment (`switch-env.bat prod`)
- [ ] Update API URLs in `.env.production`
- [ ] Test app functionality locally
- [ ] Verify Health Connect permissions
- [ ] Update app version in `app.json`
- [ ] Generate/prepare signing keystore

### Post-Build Checklist

- [ ] Install APK on test device
- [ ] Test Health Connect integration
- [ ] Verify API connectivity
- [ ] Test complete duel flow
- [ ] Check app performance
- [ ] Verify debug features are hidden

---

## 🚀 Deployment Options

### Internal Testing (APK)

```bash
# Build preview APK
eas build --profile preview --platform android

# Share APK file directly with testers
```

### Google Play Store (AAB)

```bash
# Build production AAB
eas build --profile production --platform android

# Upload AAB to Google Play Console
# Follow Google Play publishing guidelines
```

### Enterprise Distribution

```bash
# Build signed APK for enterprise
eas build --profile production --platform android --format apk
```

---

## 💡 Pro Tips

1. **Use EAS Build** for easiest setup and cloud building
2. **Test thoroughly** on real Android devices with Health Connect
3. **Keep keystores secure** and backed up
4. **Use different build profiles** for dev/staging/production
5. **Monitor build logs** for optimization opportunities
6. **Test offline functionality** for better user experience

Your FitFi Android app will be ready for distribution! 📱🚀
