# FitFi Application - Setup and Testing Guide

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (running locally or remote connection)
- **Redis** (running locally or remote connection)
- **Android Studio** with Android SDK (for Android testing)
- **Expo CLI** (`npm install -g @expo/cli`)
- **Android device** with Health Connect app installed (for real testing)

## 📁 Project Structure

```
FitFi/
├── backend/          # Node.js/Express backend
├── fitfi-mobile-app/ # React Native/Expo mobile app
├── contracts/        # Solidity smart contracts (already working)
└── README.md
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create/update `.env` file:

```bash
# Backend Environment Variables
PORT=3000
NODE_ENV=development
MONGOOSE_URI=mongodb://localhost:27017/fitfi
REDIS_URI=redis://localhost:6378
REDIS_PASS=pass
JWT_SECRET=your-jwt-secret-key
JWT_TTL=7d

# Core Testnet Configuration (contracts already deployed)
CORE_RPC_URL=https://rpc.test.btcs.network
DUEL_STAKING_CONTRACT_ADDRESS=0x1234...
DEFAULT_STAKE_AMOUNT=1000000000000000000
```

### 4. Start Required Services

#### MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name fitfi-mongo mongo:latest

# Or use existing MongoDB installation
mongod
```

#### Redis

```bash
# Using Docker
docker run -d -p 6378:6379 --name fitfi-redis redis:latest

# Or use existing Redis installation
redis-server --port 6378
```

### 5. Start Backend Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

Backend will be available at: `http://localhost:3000`

## 📱 Mobile App Setup

### 1. Navigate to Mobile App Directory

```bash
cd fitfi-mobile-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

#### Development Environment (`.env`)

```bash
# Environment
NODE_ENV=development
EXPO_PUBLIC_NODE_ENV=development

# Backend API (adjust IP based on your setup)
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1  # Android emulator
# EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api/v1  # Real device (use your computer's IP)
EXPO_PUBLIC_WS_URL=ws://10.0.2.2:3000

# Features
EXPO_PUBLIC_HEALTH_CONNECT_ENABLED=true
EXPO_PUBLIC_SHOW_DEV_COMPONENTS=true
EXPO_PUBLIC_DEBUG_MODE=true
```

#### Production Environment (`.env.production`)

```bash
# Environment
NODE_ENV=production
EXPO_PUBLIC_NODE_ENV=production

# Backend API (update with your production URLs)
EXPO_PUBLIC_API_URL=https://your-production-api.com/api/v1
EXPO_PUBLIC_WS_URL=wss://your-production-api.com

# Features (development features disabled)
EXPO_PUBLIC_HEALTH_CONNECT_ENABLED=true
EXPO_PUBLIC_SHOW_DEV_COMPONENTS=false
EXPO_PUBLIC_DEBUG_MODE=false
```

### 4. Find Your Computer's IP Address

#### Windows

```bash
ipconfig
# Look for IPv4 Address under your network adapter
```

#### macOS/Linux

```bash
ifconfig | grep inet
# Or
ip addr show
```

#### Update API URL for Real Device Testing

Replace `10.0.2.2` with your computer's IP address in `.env`:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api/v1
EXPO_PUBLIC_WS_URL=ws://192.168.1.100:3000
```

### 5. Start Mobile App

#### Development Mode

```bash
# Start Expo development server
npm run start:dev

# Or start with specific platform
npm run android:dev   # Android
npm run ios:dev       # iOS
```

#### Production Mode

```bash
npm run start:prod
npm run android:prod
```

## 🧪 Testing Guide

### 📱 Health Connect Testing

#### 1. Setup Android Device

- Install **Health Connect** app from Google Play Store
- Install **Google Fit** or **Samsung Health** for generating test data
- Grant Health Connect permissions to these apps

#### 2. Generate Test Data

- Walk around or use treadmill to generate real steps
- Or use Google Fit to manually add exercise data
- Ensure data appears in Health Connect app

#### 3. Test FitFi Health Integration

1. Open FitFi app
2. Navigate to **Active Duels**
3. Start a duel
4. Go to **Health Monitor** screen
5. Verify real-time data collection from Health Connect

### 🔍 Backend API Testing

#### 1. Health Data Endpoints

```bash
# Submit health data
curl -X POST http://localhost:3000/api/v1/health-data/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "duelId": "duel_id_here",
    "dataType": "steps",
    "value": 1000,
    "timestamp": "2025-01-01T12:00:00Z"
  }'

# Get duel health data
curl -X GET http://localhost:3000/api/v1/health-data/duel/DUEL_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Start health monitoring
curl -X POST http://localhost:3000/api/v1/health-data/start-monitoring \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "duelId": "duel_id_here",
    "durationMinutes": 60
  }'
```

#### 2. Duel Endpoints

```bash
# Get active duels
curl -X GET http://localhost:3000/api/v1/duels/active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search for opponent
curl -X POST http://localhost:3000/api/v1/duels/search-opponent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "challenegeId": "challenge_id_here",
    "socketId": "socket_id_here"
  }'
```

### 🎮 Complete Duel Testing Flow

#### 1. Setup Two Test Users

- Create two user accounts
- Connect wallets for both users
- Ensure both have Core Testnet tokens

#### 2. Start a Duel

1. **User 1**: Search for opponent
2. **User 2**: Join the duel
3. **Both**: Stake tokens
4. **System**: Automatically starts health monitoring

#### 3. Health Competition

1. **Both users**: Generate fitness data (walk, run, exercise)
2. **App**: Automatically collects Health Connect data every 30 seconds
3. **Backend**: Validates and stores health data
4. **Real-time**: Watch scores update live in Health Monitor screen

#### 4. Duel Completion

1. **Timer expires** (default 60 minutes)
2. **Backend**: Calculates final scores
3. **Smart Contract**: Automatically distributes rewards
4. **Winner**: Receives 85% of stake pool
5. **Platform**: Receives 10% fee
6. **Loser**: Receives 5% participation reward

### 🔧 Development Tools

#### Environment Switching

```bash
# Switch to development mode
cp .env .env.backup
# Edit .env to set EXPO_PUBLIC_NODE_ENV=development

# Switch to production mode
cp .env.production .env
```

#### Debug Features (Development Only)

- **Debug Panel**: Visible on Home screen in development mode
- **Console Logging**: Enhanced logging when `EXPO_PUBLIC_DEBUG_MODE=true`
- **API Inspection**: All API calls logged with request/response data

#### Backend Monitoring

```bash
# View logs
tail -f backend/logs/app.log

# MongoDB operations
mongo mongodb://localhost:27017/fitfi

# Redis operations
redis-cli -p 6378
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Cannot connect to API"

```bash
# Check if backend is running
curl http://localhost:3000/health

# Verify IP address in mobile .env
# For emulator: use 10.0.2.2
# For real device: use your computer's IP
```

#### 2. "Health Connect not available"

- Ensure Android device has Health Connect app installed
- Check app permissions in device settings
- Verify `EXPO_PUBLIC_HEALTH_CONNECT_ENABLED=true`

#### 3. "MongoDB connection failed"

```bash
# Check MongoDB status
mongo --eval "db.adminCommand('ismaster')"

# Restart MongoDB
sudo systemctl restart mongod
```

#### 4. "Redis connection failed"

```bash
# Check Redis status
redis-cli -p 6378 ping

# Restart Redis
sudo systemctl restart redis
```

#### 5. "WebSocket connection failed"

- Verify WebSocket URL in `.env`
- Check firewall settings
- Ensure port 3000 is accessible

### Performance Optimization

#### Mobile App

```bash
# Clear Expo cache
npx expo start --clear

# Reset project
npm run reset-project
```

#### Backend

```bash
# Clear logs
rm -rf logs/*.log

# Restart with fresh state
npm run dev
```

## 📊 Testing Metrics

### Success Criteria

- ✅ Health Connect data collection every 30 seconds
- ✅ Real-time score updates in mobile app
- ✅ Automatic duel completion and settlement
- ✅ Smart contract integration working
- ✅ WebSocket real-time communication
- ✅ Anti-cheating validation
- ✅ Production-ready environment switching

### Performance Targets

- **API Response Time**: < 500ms
- **Health Data Collection**: Every 30 seconds
- **Real-time Updates**: < 1 second delay
- **Duel Settlement**: < 10 seconds
- **Mobile App Load**: < 3 seconds

## 🚀 Deployment

### Production Deployment Checklist

1. Update `.env.production` with production API URLs
2. Set `NODE_ENV=production` on both backend and mobile
3. Disable debug components with `EXPO_PUBLIC_SHOW_DEV_COMPONENTS=false`
4. Build production mobile app with `expo build`
5. Deploy backend to production server
6. Update smart contract addresses if needed
7. Test complete flow on production environment

### Build Commands

```bash
# Mobile app production build
npm run build:android
npm run build:ios

# Backend production deployment
npm run build  # If applicable
npm start      # Production mode
```

## 💡 Tips for Best Results

1. **Use Real Device**: Health Connect works best on real Android devices
2. **Generate Real Data**: Walk around or exercise for authentic testing
3. **Monitor Logs**: Keep backend logs open during testing
4. **Network Stability**: Ensure stable internet for WebSocket connections
5. **Token Balance**: Maintain sufficient Core Testnet tokens for staking
6. **Health Permissions**: Grant all requested Health Connect permissions

## 📞 Support

For issues or questions:

1. Check console logs on both mobile and backend
2. Verify environment variables are correctly set
3. Ensure all services (MongoDB, Redis, backend) are running
4. Test with Health Connect app directly first
5. Use development debug panel for troubleshooting

Happy testing! 🏃‍♂️💪
