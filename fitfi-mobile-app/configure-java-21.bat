@echo off
echo 🔧 FitFi Android Build - Java 21 Configuration
echo ================================================

echo.
echo 📋 Checking current Java installation...
java -version

echo.
echo 🔍 Current JAVA_HOME: %JAVA_HOME%

echo.
echo 📝 Instructions for Java 21 setup:
echo.
echo 1. Download Java 21 from: https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-21
echo 2. Install with default settings
echo 3. Set JAVA_HOME environment variable to:
echo    C:\Program Files\Microsoft\jdk-21.0.xx.x-hotspot
echo.
echo 4. Add to PATH:
echo    %%JAVA_HOME%%\bin
echo.
echo 5. Restart this terminal and run this script again to verify

echo.
echo 🔧 Project gradle.properties has been configured for JDK 21 with 12GB memory allocation
echo.

pause
