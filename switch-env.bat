@echo off
REM FitFi Environment Switcher for Windows
REM Usage: switch-env.bat [dev|prod]

set ENV_TYPE=%1
if "%ENV_TYPE%"=="" set ENV_TYPE=dev

echo 🔧 FitFi Environment Switcher
echo ===============================

if "%ENV_TYPE%"=="dev" goto development
if "%ENV_TYPE%"=="development" goto development
if "%ENV_TYPE%"=="prod" goto production
if "%ENV_TYPE%"=="production" goto production
goto invalid

:development
echo 📱 Switching to DEVELOPMENT mode...

cd fitfi-mobile-app
if exist .env.backup (
    copy .env.backup .env > nul
    echo ✅ Restored development .env from backup
) else (
    echo ⚠️  No .env.backup found, using current .env
)

REM Update environment variables using PowerShell
powershell -Command "(Get-Content .env) -replace 'EXPO_PUBLIC_NODE_ENV=production', 'EXPO_PUBLIC_NODE_ENV=development' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'EXPO_PUBLIC_SHOW_DEV_COMPONENTS=false', 'EXPO_PUBLIC_SHOW_DEV_COMPONENTS=true' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'EXPO_PUBLIC_DEBUG_MODE=false', 'EXPO_PUBLIC_DEBUG_MODE=true' | Set-Content .env"

cd ..

cd backend
powershell -Command "(Get-Content .env) -replace 'NODE_ENV=production', 'NODE_ENV=development' | Set-Content .env"
cd ..

echo ✅ Development environment activated
echo 📝 Debug components: ENABLED
echo 🔍 Debug logging: ENABLED
echo 🌐 API URL: http://10.0.2.2:3000/api/v1
goto end

:production
echo 🚀 Switching to PRODUCTION mode...

cd fitfi-mobile-app

REM Backup current .env
copy .env .env.backup > nul
echo 💾 Backed up current .env to .env.backup

REM Use production environment
if exist .env.production (
    copy .env.production .env > nul
    echo ✅ Copied .env.production to .env
) else (
    echo ❌ .env.production not found!
    cd ..
    exit /b 1
)

cd ..

cd backend
powershell -Command "(Get-Content .env) -replace 'NODE_ENV=development', 'NODE_ENV=production' | Set-Content .env"
cd ..

echo ✅ Production environment activated
echo 📝 Debug components: DISABLED
echo 🔍 Debug logging: DISABLED
echo 🌐 API URL: Set to production URL
echo ⚠️  Remember to update production API URLs!
goto end

:invalid
echo ❌ Invalid environment type: %ENV_TYPE%
echo Usage: switch-env.bat [dev^|prod]
echo.
echo Available options:
echo   dev, development  - Switch to development mode
echo   prod, production  - Switch to production mode
exit /b 1

:end
echo.
echo 🔄 Next steps:
echo 1. Restart Expo development server
echo 2. Restart backend server if running
echo 3. Clear cache if needed: npx expo start --clear
echo.
echo 📊 Current configuration:
echo ================================

echo 📱 Mobile App (.env):
cd fitfi-mobile-app
findstr "EXPO_PUBLIC_NODE_ENV EXPO_PUBLIC_API_URL EXPO_PUBLIC_SHOW_DEV_COMPONENTS" .env
cd ..

echo.
echo 🖥️  Backend (.env):
cd backend
findstr "NODE_ENV PORT" .env
cd ..

echo.
echo ✨ Environment switch complete!
