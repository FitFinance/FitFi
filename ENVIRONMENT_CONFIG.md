# Environment Configuration Examples

## Backend (.env)

### Development Environment

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGOOSE_URI=mongodb://localhost:27017/fitfi

# Redis Configuration
REDIS_URI=redis://localhost:6378
REDIS_PASS=pass

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_TTL=7d

# Core Testnet Blockchain Configuration
CORE_RPC_URL=https://rpc.test.btcs.network
DUEL_STAKING_CONTRACT_ADDRESS=0x1234567890abcdef...
DEFAULT_STAKE_AMOUNT=1000000000000000000

# Health Monitoring Configuration
HEALTH_DATA_COLLECTION_INTERVAL=30000  # 30 seconds
MAX_DUEL_DURATION=3600000              # 60 minutes
ANTI_CHEAT_VALIDATION=true

# WebSocket Configuration
SOCKET_CORS_ORIGIN=http://localhost:3000,http://10.0.2.2:3000
```

### Production Environment

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration (use your production MongoDB)
MONGOOSE_URI=mongodb://your-production-mongo-url/fitfi

# Redis Configuration (use your production Redis)
REDIS_URI=redis://your-production-redis-url:6379
REDIS_PASS=your-redis-password

# JWT Configuration (use strong secret in production)
JWT_SECRET=your-super-strong-production-jwt-secret
JWT_TTL=7d

# Core Mainnet Blockchain Configuration (when ready for mainnet)
CORE_RPC_URL=https://rpc.coredao.org
DUEL_STAKING_CONTRACT_ADDRESS=0xYourMainnetContractAddress
DEFAULT_STAKE_AMOUNT=1000000000000000000

# Production Security
HEALTH_DATA_COLLECTION_INTERVAL=30000
MAX_DUEL_DURATION=3600000
ANTI_CHEAT_VALIDATION=true
RATE_LIMIT_ENABLED=true
LOG_LEVEL=warn

# WebSocket Configuration
SOCKET_CORS_ORIGIN=https://your-production-domain.com
```

## Mobile App Environment Variables

### Development (.env)

```bash
# Environment
NODE_ENV=development
EXPO_PUBLIC_NODE_ENV=development

# Backend API Configuration
# For Android Emulator (default)
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1
EXPO_PUBLIC_WS_URL=ws://10.0.2.2:3000

# For Real Android Device (replace with your computer's IP)
# EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api/v1
# EXPO_PUBLIC_WS_URL=ws://192.168.1.100:3000

# For iOS Simulator
# EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
# EXPO_PUBLIC_WS_URL=ws://localhost:3000

# Health Connect Configuration
EXPO_PUBLIC_HEALTH_CONNECT_ENABLED=true

# Development Features
EXPO_PUBLIC_SHOW_DEV_COMPONENTS=true
EXPO_PUBLIC_DEBUG_MODE=true

# Optional Development Settings
EXPO_PUBLIC_MOCK_HEALTH_DATA=false
EXPO_PUBLIC_SKIP_HEALTH_PERMISSIONS=false
```

### Production (.env.production)

```bash
# Environment
NODE_ENV=production
EXPO_PUBLIC_NODE_ENV=production

# Backend API Configuration (update with your production URLs)
EXPO_PUBLIC_API_URL=https://api.fitfi.app/api/v1
EXPO_PUBLIC_WS_URL=wss://api.fitfi.app

# Health Connect Configuration
EXPO_PUBLIC_HEALTH_CONNECT_ENABLED=true

# Production Features (development features disabled)
EXPO_PUBLIC_SHOW_DEV_COMPONENTS=false
EXPO_PUBLIC_DEBUG_MODE=false

# Production Settings
EXPO_PUBLIC_MOCK_HEALTH_DATA=false
EXPO_PUBLIC_SKIP_HEALTH_PERMISSIONS=false
EXPO_PUBLIC_ANALYTICS_ENABLED=true
```

## Quick Setup Commands

### Backend Setup

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Mobile App Setup

```bash
cd fitfi-mobile-app
npm install

# For development
npm run start:dev

# For production testing
cp .env.production .env
npm run start:prod
```

### Database Setup

```bash
# Start MongoDB with Docker
docker run -d -p 27017:27017 --name fitfi-mongo mongo:latest

# Start Redis with Docker
docker run -d -p 6378:6379 --name fitfi-redis redis:latest
```

## IP Address Configuration

### Find Your Computer's IP Address

#### Windows

```cmd
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

#### macOS

```bash
ifconfig en0 | grep inet
# or
ipconfig getifaddr en0
```

#### Linux

```bash
hostname -I
# or
ip route get 1.1.1.1 | awk '{print $7}'
```

### Update Mobile App Configuration

Replace the IP address in your mobile app `.env`:

```bash
# Replace 192.168.1.100 with your actual IP
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api/v1
EXPO_PUBLIC_WS_URL=ws://192.168.1.100:3000
```

## Environment Switching

### Switch to Development

```bash
# Mobile app
cd fitfi-mobile-app
cp .env.example .env
# Edit .env for development settings

# Backend
cd backend
# Ensure NODE_ENV=development in .env
```

### Switch to Production

```bash
# Mobile app
cd fitfi-mobile-app
cp .env.production .env

# Backend
cd backend
# Update .env with production settings
```

## Verification Commands

### Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# API documentation
curl http://localhost:3000/api/v1/docs
```

### Test Mobile App Environment

```bash
# Check Expo environment
npx expo config

# View resolved environment variables
npx expo config --type public
```

### Test Database Connections

```bash
# MongoDB
mongo mongodb://localhost:27017/fitfi

# Redis
redis-cli -p 6378 ping
```
