@echo off
echo 🔧 Auto-configuring Java 11 JDK for Android Build...
echo.

REM Set JAVA_HOME to the most common Java 11 installation paths
if exist "C:\Program Files\Microsoft\jdk-11.0.24.7-hotspot" (
    echo ✅ Found Microsoft JDK 11.0.24
    setx JAVA_HOME "C:\Program Files\Microsoft\jdk-11.0.24.7-hotspot"
    set JAVA_HOME=C:\Program Files\Microsoft\jdk-11.0.24.7-hotspot
    goto :success
)

if exist "C:\Program Files\Microsoft\jdk-11.0.25.9-hotspot" (
    echo ✅ Found Microsoft JDK 11.0.25
    setx JAVA_HOME "C:\Program Files\Microsoft\jdk-11.0.25.9-hotspot"
    set JAVA_HOME=C:\Program Files\Microsoft\jdk-11.0.25.9-hotspot
    goto :success
)

REM Auto-detect any Microsoft JDK 11 installation
for /d %%i in ("C:\Program Files\Microsoft\jdk-11.*") do (
    echo ✅ Found Microsoft JDK: %%i
    setx JAVA_HOME "%%i"
    set JAVA_HOME=%%i
    goto :success
)

REM Check Eclipse Adoptium
for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-11.*") do (
    echo ✅ Found Eclipse Adoptium JDK: %%i
    setx JAVA_HOME "%%i"
    set JAVA_HOME=%%i
    goto :success
)

echo ❌ Java 11 JDK not found!
echo Please install Java 11 JDK first.
pause
exit /b 1

:success
echo.
echo 🎉 Java environment configured!
echo JAVA_HOME: %JAVA_HOME%
echo.
echo 🔍 Testing Java installation...
"%JAVA_HOME%\bin\java" -version
echo.
echo 🔍 Testing Java compiler...
"%JAVA_HOME%\bin\javac" -version
echo.
echo ✅ Ready for Android build!
echo.
echo 🚀 Now run: npx expo run:android
echo.
pause
