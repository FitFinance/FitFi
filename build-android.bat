@echo off
REM FitFi Android Build Script for Windows
REM This script helps you build your FitFi Android app

echo 🏗️ FitFi Android Build Assistant
echo ================================

echo.
echo Choose your build method:
echo 1. EAS Build (Cloud) - Recommended
echo 2. Local Build
echo 3. Development Build
echo 4. Setup EAS only
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto eas_build
if "%choice%"=="2" goto local_build
if "%choice%"=="3" goto dev_build
if "%choice%"=="4" goto setup_eas
goto invalid

:eas_build
echo.
echo 🚀 Starting EAS Cloud Build...
echo ===============================

REM Check if EAS CLI is installed
eas --version >nul 2>&1
if errorlevel 1 (
    echo ❌ EAS CLI not found. Installing...
    npm install -g eas-cli
)

echo ✅ EAS CLI ready

REM Switch to production environment
echo 📱 Switching to production environment...
call switch-env.bat prod

echo.
echo Choose build type:
echo 1. Preview APK (for testing)
echo 2. Production AAB (for Play Store)
echo 3. Development build
echo.
set /p build_type="Enter build type (1-3): "

cd fitfi-mobile-app

if "%build_type%"=="1" (
    echo 🔨 Building Preview APK...
    eas build --profile preview --platform android
) else if "%build_type%"=="2" (
    echo 🔨 Building Production AAB...
    eas build --profile production --platform android
) else if "%build_type%"=="3" (
    echo 🔨 Building Development build...
    eas build --profile development --platform android
) else (
    echo ❌ Invalid choice
    goto end
)

echo.
echo ✅ Build started! Check EAS dashboard for progress.
echo 📱 Build will be available for download when complete.
goto end

:local_build
echo.
echo 🔧 Starting Local Android Build...
echo ==================================

REM Check Android SDK
if not defined ANDROID_HOME (
    echo ❌ ANDROID_HOME not set. Please install Android Studio and set ANDROID_HOME.
    echo 📖 See ANDROID_BUILD_GUIDE.md for setup instructions.
    goto end
)

echo ✅ Android SDK found

REM Switch to production environment
echo 📱 Switching to production environment...
call switch-env.bat prod

cd fitfi-mobile-app

echo 📦 Installing dependencies...
npm install

echo 🔨 Building Android APK...
npx expo run:android --variant release

echo.
echo ✅ Local build complete!
echo 📱 APK should be available in android/app/build/outputs/apk/release/
goto end

:dev_build
echo.
echo 🛠️ Starting Development Build...
echo ================================

REM Switch to development environment
echo 📱 Switching to development environment...
call switch-env.bat dev

cd fitfi-mobile-app

echo 📦 Installing dependencies...
npm install

echo 🔨 Building development version...
npx expo run:android

echo.
echo ✅ Development build complete!
echo 📱 App installed on connected device/emulator.
goto end

:setup_eas
echo.
echo ⚙️ Setting up EAS Build...
echo =========================

REM Install EAS CLI
echo 📦 Installing EAS CLI...
npm install -g eas-cli

echo 🔐 Please login to your Expo account:
eas login

cd fitfi-mobile-app

echo 🛠️ Configuring EAS Build...
eas build:configure

echo.
echo ✅ EAS setup complete!
echo 🚀 You can now run builds with 'eas build --platform android'
goto end

:invalid
echo ❌ Invalid choice. Please run the script again.
goto end

:end
echo.
echo 🎯 Build process complete!
echo.
echo 📚 For detailed instructions, see ANDROID_BUILD_GUIDE.md
echo 🔧 For troubleshooting, check the build logs
echo.
pause
