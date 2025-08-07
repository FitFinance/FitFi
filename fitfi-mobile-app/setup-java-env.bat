@echo off
echo 🔧 Setting up Java Environment for Android Build...
echo.

echo 📋 Current Java version:
java -version
echo.

echo 📋 Current JAVA_HOME:
echo %JAVA_HOME%
echo.

echo 🔍 Looking for Java 11 installations...

REM Check common Java 11 installation paths
if exist "C:\Program Files\Microsoft\jdk-11.*" (
    echo ✅ Found Microsoft OpenJDK 11
    for /d %%i in ("C:\Program Files\Microsoft\jdk-11.*") do (
        echo Setting JAVA_HOME to: %%i
        setx JAVA_HOME "%%i"
        set JAVA_HOME=%%i
    )
    goto :found
)

if exist "C:\Program Files\Eclipse Adoptium\jdk-11.*" (
    echo ✅ Found Eclipse Adoptium JDK 11
    for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-11.*") do (
        echo Setting JAVA_HOME to: %%i
        setx JAVA_HOME "%%i"
        set JAVA_HOME=%%i
    )
    goto :found
)

if exist "C:\Program Files\Java\jdk-11.*" (
    echo ✅ Found Oracle JDK 11
    for /d %%i in ("C:\Program Files\Java\jdk-11.*") do (
        echo Setting JAVA_HOME to: %%i
        setx JAVA_HOME "%%i"
        set JAVA_HOME=%%i
    )
    goto :found
)

echo ❌ Java 11 not found!
echo.
echo Please download and install Java 11 from:
echo 1. Microsoft OpenJDK: https://learn.microsoft.com/en-us/java/openjdk/download
echo 2. Eclipse Adoptium: https://adoptium.net/
echo.
pause
exit /b 1

:found
echo.
echo 🎉 Java 11 environment configured!
echo.
echo 📋 New JAVA_HOME: %JAVA_HOME%
echo.
echo ⚠️  Please restart your terminal or VS Code for changes to take effect.
echo.
echo 🚀 Then try: npx expo run:android
echo.
pause
