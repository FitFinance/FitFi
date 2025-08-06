# 🚀 FitFi Mobile App Testing Guide

## 📱 Frontend Mobile App Setup

### 1. **Environment Configuration**

Your mobile app is now configured for development testing:

**Current Settings:**

- **API URL**: `http://192.168.164.117:3000/api/v1`
- **WebSocket**: `ws://192.168.164.117:3000`
- **Environment**: Development mode
- **Health Connect**: Disabled (using mock data)
- **Debug Panel**: Enabled

### 2. **Testing via Expo Go**

#### **Install Expo Go on your mobile device:**

- **Android**: Download from Google Play Store
- **iOS**: Download from App Store

#### **Start the development server:**

```bash
cd "d:\Projects\Complete Projects\FitFi\fitfi-mobile-app"
npx expo start
```

#### **Connect your mobile device:**

1. Make sure your mobile device and computer are on the same WiFi network
2. Scan the QR code with Expo Go app
3. The app will load with development features enabled

### 3. **Features You Can Test**

✅ **Working Features:**

- Environment switching (debug panel shows current config)
- Theme switching (light/dark mode)
- Navigation between screens
- Mock health data generation
- Mock fitness statistics

🔧 **Mock Data Features:**

- Steps tracking (generates realistic mock data)
- Calories burned calculation
- Distance tracking
- Active time monitoring
- Duel monitoring simulation

⚠️ **Placeholder Data (commented as "Mock"):**

- User challenges
- Recent duels
- Real-time duel data
- User statistics

## 🖥️ Backend Setup (Optional for Advanced Testing)

### Current Status:

❌ **Backend has compilation errors** - needs fixes before running
✅ **API service is ready** - will fallback to mock data if backend is unavailable

### To fix backend (if you want real API integration):

1. **Fix TypeScript errors** in the backend codebase
2. **Install missing dependencies**
3. **Configure MongoDB and Redis**
4. **Update blockchain configuration**

## 📲 Testing Instructions

### **1. Basic App Testing**

1. Launch the app via Expo Go
2. Check the debug panel (only visible in development)
3. Navigate through different screens
4. Test theme switching
5. Verify mock health data generation

### **2. Health Connect Testing**

- Currently using **mock data** for build compatibility
- Mock data includes realistic fitness metrics
- Health Connect integration will be re-added after testing

### **3. API Testing**

- App will attempt to connect to your backend
- If backend is unavailable, it falls back to placeholder data
- Check console logs for connection status

## 🔧 Development Features

### **Debug Panel** (Development Mode Only)

Shows current configuration:

- Environment variables
- API endpoints
- Health Connect status
- Quick debug actions

### **Mock Data Generation**

Realistic fitness data:

- **Steps**: 50-250 per 15-minute interval
- **Calories**: 10-30 per 15-minute interval
- **Distance**: 0.1-0.3 km per 15-minute interval
- **Timestamps**: Real-time generation

## 📋 Next Steps

### **Immediate Testing:**

1. ✅ Test mobile app with Expo Go
2. ✅ Verify all screens work correctly
3. ✅ Check mock data generation
4. ✅ Test navigation and themes

### **Backend Integration (Advanced):**

1. Fix backend TypeScript compilation errors
2. Set up MongoDB database
3. Configure Redis for real-time features
4. Test real API endpoints

### **Production Deployment:**

1. Switch to `.env.production` for production API URLs
2. Build APK with real backend integration
3. Re-add Health Connect package with proper configuration
4. Deploy backend to production server

## 📝 Environment Files

### **`.env` (Current - Development)**

```env
NODE_ENV=development
EXPO_PUBLIC_API_URL=http://192.168.164.117:3000/api/v1
EXPO_PUBLIC_WS_URL=ws://192.168.164.117:3000
EXPO_PUBLIC_SHOW_DEV_COMPONENTS=true
```

### **`.env.production` (For Production)**

```env
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://your-production-api.com/api/v1
EXPO_PUBLIC_WS_URL=wss://your-production-api.com
EXPO_PUBLIC_SHOW_DEV_COMPONENTS=false
```

## 🐛 Troubleshooting

### **If Expo Go doesn't connect:**

1. Verify both devices are on same WiFi
2. Check firewall settings
3. Try using the IP address manually in Expo Go

### **If API calls fail:**

- App will use placeholder data automatically
- Check console logs for connection errors
- Verify backend is running (if testing with real API)

### **If build fails:**

- We have a working APK ready for download
- Use the provided download link for testing

---

**🎯 You can now test the complete mobile app with mock data and all UI features working perfectly!**
