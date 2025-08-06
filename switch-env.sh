#!/bin/bash

# FitFi Environment Switcher
# Usage: ./switch-env.sh [dev|prod]

ENV_TYPE=${1:-dev}

echo "🔧 FitFi Environment Switcher"
echo "==============================="

case $ENV_TYPE in
  "dev"|"development")
    echo "📱 Switching to DEVELOPMENT mode..."
    
    # Mobile app
    cd fitfi-mobile-app
    if [ -f ".env.backup" ]; then
      cp .env.backup .env
      echo "✅ Restored development .env from backup"
    else
      echo "⚠️  No .env.backup found, using current .env"
    fi
    
    # Update environment variable
    sed -i 's/EXPO_PUBLIC_NODE_ENV=production/EXPO_PUBLIC_NODE_ENV=development/g' .env
    sed -i 's/EXPO_PUBLIC_SHOW_DEV_COMPONENTS=false/EXPO_PUBLIC_SHOW_DEV_COMPONENTS=true/g' .env
    sed -i 's/EXPO_PUBLIC_DEBUG_MODE=false/EXPO_PUBLIC_DEBUG_MODE=true/g' .env
    
    cd ..
    
    # Backend
    cd backend
    sed -i 's/NODE_ENV=production/NODE_ENV=development/g' .env
    cd ..
    
    echo "✅ Development environment activated"
    echo "📝 Debug components: ENABLED"
    echo "🔍 Debug logging: ENABLED"
    echo "🌐 API URL: http://10.0.2.2:3000/api/v1"
    ;;
    
  "prod"|"production")
    echo "🚀 Switching to PRODUCTION mode..."
    
    # Mobile app
    cd fitfi-mobile-app
    
    # Backup current .env
    cp .env .env.backup
    echo "💾 Backed up current .env to .env.backup"
    
    # Use production environment
    if [ -f ".env.production" ]; then
      cp .env.production .env
      echo "✅ Copied .env.production to .env"
    else
      echo "❌ .env.production not found!"
      exit 1
    fi
    
    cd ..
    
    # Backend
    cd backend
    sed -i 's/NODE_ENV=development/NODE_ENV=production/g' .env
    cd ..
    
    echo "✅ Production environment activated"
    echo "📝 Debug components: DISABLED"
    echo "🔍 Debug logging: DISABLED"
    echo "🌐 API URL: Set to production URL"
    echo "⚠️  Remember to update production API URLs!"
    ;;
    
  *)
    echo "❌ Invalid environment type: $ENV_TYPE"
    echo "Usage: ./switch-env.sh [dev|prod]"
    echo ""
    echo "Available options:"
    echo "  dev, development  - Switch to development mode"
    echo "  prod, production  - Switch to production mode"
    exit 1
    ;;
esac

echo ""
echo "🔄 Next steps:"
echo "1. Restart Expo development server"
echo "2. Restart backend server if running"
echo "3. Clear cache if needed: npx expo start --clear"
echo ""
echo "📊 Current configuration:"
echo "================================"

# Show current mobile app config
echo "📱 Mobile App (.env):"
cd fitfi-mobile-app
grep "EXPO_PUBLIC_NODE_ENV\|EXPO_PUBLIC_API_URL\|EXPO_PUBLIC_SHOW_DEV_COMPONENTS" .env
cd ..

echo ""
echo "🖥️  Backend (.env):"
cd backend
grep "NODE_ENV\|PORT" .env
cd ..

echo ""
echo "✨ Environment switch complete!"
