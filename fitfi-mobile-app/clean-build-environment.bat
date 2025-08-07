@echo off
echo 🧹 FitFi Android Build - Clean Build Environment
echo =================================================

echo.
echo 🛑 Stopping all Gradle daemons...
cd android
call gradlew.bat --stop
cd..

echo.
echo 🗑️ Clearing Gradle cache...
rmdir /s /q "%USERPROFILE%\.gradle\caches" 2>nul

echo.
echo 🗑️ Clearing node_modules...
rmdir /s /q node_modules 2>nul

echo.
echo 📦 Reinstalling dependencies...
call npm install

echo.
echo ✅ Clean complete! Ready for build with JDK 21
echo.
echo Next steps:
echo 1. Ensure JAVA_HOME points to JDK 21
echo 2. Run: npx expo run:android --variant release
echo.

pause
