@echo off
echo 🚀 FitFi Android Local Build Script
echo ===================================

cd /d "%~dp0"

echo.
echo 📱 Step 1: Cleaning previous builds...
call npx expo export:clear

echo.
echo 📦 Step 2: Installing dependencies...
call npm install

echo.
echo 🔧 Step 3: Generating Android bundle...
call npx expo export --platform android

echo.
echo 🏗️ Step 4: Prebuild Android project...
call npx expo prebuild --platform android --clear

echo.
echo 🔨 Step 5: Building release APK...
echo ⚠️  Note: Make sure Android Studio is installed and Android SDK is configured
echo ⚠️  Connect your Android device or start an emulator before running this step

pause
echo Building APK...
call npx expo run:android --variant release --no-install

echo.
echo ✅ Build completed!
echo 📍 APK Location: android\app\build\outputs\apk\release\
echo 📲 Transfer the APK to your phone and install it!
echo.
pause
