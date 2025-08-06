#!/bin/bash

# FitFi Android Build Script for Linux/macOS
# This script helps you build your FitFi Android app

echo "🏗️ FitFi Android Build Assistant"
echo "================================"
echo ""

echo "Choose your build method:"
echo "1. EAS Build (Cloud) - Recommended"
echo "2. Local Build" 
echo "3. Development Build"
echo "4. Setup EAS only"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting EAS Cloud Build..."
        echo "==============================="

        # Check if EAS CLI is installed
        if ! command -v eas &> /dev/null; then
            echo "❌ EAS CLI not found. Installing..."
            npm install -g eas-cli
        fi

        echo "✅ EAS CLI ready"

        # Switch to production environment
        echo "📱 Switching to production environment..."
        ./switch-env.sh prod

        echo ""
        echo "Choose build type:"
        echo "1. Preview APK (for testing)"
        echo "2. Production AAB (for Play Store)"
        echo "3. Development build"
        echo ""
        read -p "Enter build type (1-3): " build_type

        cd fitfi-mobile-app

        case $build_type in
            1)
                echo "🔨 Building Preview APK..."
                eas build --profile preview --platform android
                ;;
            2)
                echo "🔨 Building Production AAB..."
                eas build --profile production --platform android
                ;;
            3)
                echo "🔨 Building Development build..."
                eas build --profile development --platform android
                ;;
            *)
                echo "❌ Invalid choice"
                exit 1
                ;;
        esac

        echo ""
        echo "✅ Build started! Check EAS dashboard for progress."
        echo "📱 Build will be available for download when complete."
        ;;

    2)
        echo ""
        echo "🔧 Starting Local Android Build..."
        echo "=================================="

        # Check Android SDK
        if [ -z "$ANDROID_HOME" ]; then
            echo "❌ ANDROID_HOME not set. Please install Android Studio and set ANDROID_HOME."
            echo "📖 See ANDROID_BUILD_GUIDE.md for setup instructions."
            exit 1
        fi

        echo "✅ Android SDK found"

        # Switch to production environment
        echo "📱 Switching to production environment..."
        ./switch-env.sh prod

        cd fitfi-mobile-app

        echo "📦 Installing dependencies..."
        npm install

        echo "🔨 Building Android APK..."
        npx expo run:android --variant release

        echo ""
        echo "✅ Local build complete!"
        echo "📱 APK should be available in android/app/build/outputs/apk/release/"
        ;;

    3)
        echo ""
        echo "🛠️ Starting Development Build..."
        echo "================================"

        # Switch to development environment
        echo "📱 Switching to development environment..."
        ./switch-env.sh dev

        cd fitfi-mobile-app

        echo "📦 Installing dependencies..."
        npm install

        echo "🔨 Building development version..."
        npx expo run:android

        echo ""
        echo "✅ Development build complete!"
        echo "📱 App installed on connected device/emulator."
        ;;

    4)
        echo ""
        echo "⚙️ Setting up EAS Build..."
        echo "========================="

        # Install EAS CLI
        echo "📦 Installing EAS CLI..."
        npm install -g eas-cli

        echo "🔐 Please login to your Expo account:"
        eas login

        cd fitfi-mobile-app

        echo "🛠️ Configuring EAS Build..."
        eas build:configure

        echo ""
        echo "✅ EAS setup complete!"
        echo "🚀 You can now run builds with 'eas build --platform android'"
        ;;

    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎯 Build process complete!"
echo ""
echo "📚 For detailed instructions, see ANDROID_BUILD_GUIDE.md"
echo "🔧 For troubleshooting, check the build logs"
echo ""
