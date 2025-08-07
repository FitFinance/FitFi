# 🪟 **Windows Android Build Guide for FitFi**

## ⚠️ **Key Information**

- **EAS Local builds require macOS/Linux** (not Windows)
- **Windows users have 3 options** for building Android APKs

---

## 🚀 **Option 1: Direct Expo Development Build (RECOMMENDED)**

### **What you need:**

1. Android Studio installed
2. Android SDK configured
3. Your Android device connected via USB

### **Steps:**

#### **1. Install Android Studio**

- Download: https://developer.android.com/studio
- Install with default settings
- Install Android SDK (API 31+)

#### **2. Install Java 11 JDK**

Android development requires Java 11. Download and install:

- **Microsoft OpenJDK 11**: https://learn.microsoft.com/en-us/java/openjdk/download
- Or **Eclipse Temurin 11**: https://adoptium.net/

#### **3. Setup Environment Variables**

Add these to your Windows PATH and environment variables:

**Environment Variables:**

```
JAVA_HOME=C:\Program Files\Microsoft\jdk-11.0.xx.x-hotspot
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\YourName\AppData\Local\Android\Sdk
```

**PATH additions:**

```
C:\Users\arnav\AppData\Local\Android\Sdk\platform-tools
C:\Users\arnav\AppData\Local\Android\Sdk\cmdline-tools\latest\bin
%JAVA_HOME%\bin
```

#### **3. Enable USB Debugging on Phone**

- Settings → About Phone → Tap "Build Number" 7 times
- Settings → Developer Options → Enable "USB Debugging"
- Connect phone to PC via USB

#### **4. Build Commands**

```powershell
cd "d:\Projects\Complete Projects\FitFi\fitfi-mobile-app"

# Check if device is connected
adb devices

# Build development APK
npx expo run:android

# Build release APK (for production)
npx expo run:android --variant release
```

#### **5. Find Your APK**

After successful build:

```
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🌩️ **Option 2: EAS Cloud Build (EASIEST)**

### **Why Cloud Build Failed Before:**

- Build transformation errors due to dependencies
- **We fixed this** by removing problematic packages

### **Try Cloud Build Again:**

```powershell
cd "d:\Projects\Complete Projects\FitFi\fitfi-mobile-app"

# Clear any issues
npm install
npx expo install --fix

# Try cloud build again
eas build --platform android --profile preview
```

**Benefits:**

- No local Android setup required
- Builds on Expo's servers
- Downloads APK when ready

---

## 💻 **Option 3: React Native CLI Build**

### **For Full Control:**

```powershell
# Install React Native CLI
npm install -g @react-native-community/cli

cd "d:\Projects\Complete Projects\FitFi\fitfi-mobile-app"

# Generate Android project
npx expo eject

# Build with React Native CLI
cd android
./gradlew assembleRelease
```

**APK Location:**

```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📱 **Quick Build Script (Option 1 - Direct)**

### **Run this script: `build-android-local.bat`**

```batch
@echo off
cd "d:\Projects\Complete Projects\FitFi\fitfi-mobile-app"

echo 🔍 Checking Android setup...
adb devices

echo 📦 Installing dependencies...
npm install

echo 🏗️ Building Android APK...
npx expo run:android --variant release

echo ✅ Build complete! Check android/app/build/outputs/apk/
pause
```

---

## 📲 **Transfer APK to Phone**

### **Method 1: USB File Transfer**

1. Keep phone connected to PC
2. Copy APK to phone's Downloads folder
3. On phone: Open file manager → Downloads → Tap APK → Install

### **Method 2: Cloud Upload**

1. Upload APK to Google Drive/Dropbox
2. Download on phone and install

### **Method 3: ADB Direct Install**

```powershell
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔧 **Troubleshooting Common Issues**

### **"adb not found"**

```powershell
# Add to PATH:
C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools
```

### **"Android SDK not found"**

Set environment variables:

- `ANDROID_HOME`: `C:\Users\YourName\AppData\Local\Android\Sdk`
- `ANDROID_SDK_ROOT`: `C:\Users\YourName\AppData\Local\Android\Sdk`

### **"Device not detected"**

1. Enable USB Debugging on phone
2. Install phone's USB drivers
3. Try different USB cable/port

### **"Build failed"**

```powershell
# Clean and rebuild
npx expo export:clear
rm -rf node_modules
npm install
npx expo run:android --clear
```

---

## ⚡ **Recommended Approach for Windows Users**

### **🎯 Best for beginners: EAS Cloud Build**

```powershell
eas build --platform android --profile preview
```

### **🎯 Best for developers: Direct Expo Build**

```powershell
npx expo run:android --variant release
```

### **🎯 Best for full control: React Native CLI**

```powershell
npx expo eject
cd android && ./gradlew assembleRelease
```

---

## 🎉 **What You'll Get**

After any successful build:

- ✅ **Production APK** with real WalletConnect integration
- ✅ **Deep linking** to MetaMask/Trust Wallet works
- ✅ **Your Project ID** configured: `3a48a1389fee89b77191ca5754fc252d`
- ✅ **Real wallet signing** on Android device

The APK will work perfectly with wallet apps on your Android phone! 🚀
