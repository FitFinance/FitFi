# 📱 **Local Android Build Guide for FitFi**

## 🚀 **Option 1: Direct Expo Build (Recommended)**

### Prerequisites:

1. Install Android Studio
2. Set up Android SDK
3. Enable Developer Options on your Android device

### Steps:

#### **Step 1: Install Android Build Tools**

```powershell
# Install EAS CLI if not already installed
npm install -g @expo/cli eas-cli

# Navigate to your project
cd "d:\Projects\Complete Projects\FitFi\fitfi-mobile-app"
```

#### **Step 2: Configure EAS for Local Builds**

```powershell
# Initialize EAS (if not done)
eas build:configure

# Build locally for Android
eas build --platform android --local
```

#### **Step 3: Alternative - Expo Development Build**

```powershell
# Create development build
npx expo run:android --variant debug

# Or for release build
npx expo run:android --variant release
```

## 🛠️ **Option 2: Manual APK Generation**

### **Step 1: Install Required Tools**

1. **Install Android Studio**:
   - Download from https://developer.android.com/studio
   - Install Android SDK (API 31+)
   - Add to PATH: `ANDROID_HOME` and `ANDROID_SDK_ROOT`

2. **Install Java JDK 11**:
   - Download from https://adoptium.net/
   - Set `JAVA_HOME` environment variable

### **Step 2: Setup Environment Variables**

```powershell
# Add to your system PATH:
# C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools
# C:\Users\YourName\AppData\Local\Android\Sdk\tools
# C:\Program Files\Java\jdk-11\bin
```

### **Step 3: Build Commands**

#### **Development APK (for testing)**

```powershell
cd "d:\Projects\Complete Projects\FitFi\fitfi-mobile-app"

# Generate development APK
npx expo export --platform android
npx expo run:android --variant debug
```

#### **Release APK (production)**

```powershell
cd "d:\Projects\Complete Projects\FitFi\fitfi-mobile-app"

# Generate release APK
npx expo export --platform android --dev false
npx expo run:android --variant release
```

### **Step 4: Find Your APK**

After successful build, APK will be located at:

```
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/apk/release/app-release.apk
```

## 📲 **Transfer to Mobile Device**

### **Method 1: USB Transfer**

1. Connect phone to computer via USB
2. Copy APK file to phone's Downloads folder
3. Install APK on phone (enable "Install unknown apps")

### **Method 2: Cloud Transfer**

1. Upload APK to Google Drive/Dropbox
2. Download on phone and install

### **Method 3: ADB Install (Direct)**

```powershell
# Enable USB Debugging on phone
# Connect phone via USB
adb install app-release.apk
```

## 🔧 **Troubleshooting Build Issues**

### **Common Issues & Fixes:**

1. **Metro Transform Error:**

   ```powershell
   npx expo start --clear
   ```

2. **Module Resolution Issues:**

   ```powershell
   npm install
   npx expo install --fix
   ```

3. **Android SDK Issues:**

   ```powershell
   # Check SDK installation
   npx expo doctor
   ```

4. **Clean Build:**
   ```powershell
   npm run clean
   npx expo run:android --clear
   ```

## ⚡ **Quick Build Commands Summary**

```powershell
# Quick development build
cd "d:\Projects\Complete Projects\FitFi\fitfi-mobile-app"
npx expo run:android

# Quick release build
npx expo run:android --variant release

# Local EAS build
eas build --platform android --local
```

## 📱 **Install on Phone**

1. **Enable Developer Options** on Android device
2. **Enable "Install unknown apps"** for your file manager
3. **Transfer APK** using any method above
4. **Install APK** by tapping on it
5. **Open FitFi app** and test wallet connection!

---

**Note**: Local builds avoid cloud build issues and give you full control over the build process. The APK will work with real wallet apps on your Android device! 🚀
