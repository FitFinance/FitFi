# 🛠️ Network Error Troubleshooting Guide

## 🎯 **Problem**: Network error when signing in on Android

### ✅ **Fixes Applied**:

1. **✅ Network Security Configuration Added**
   - Created `android/app/src/main/res/xml/network_security_config.xml`
   - Updated `AndroidManifest.xml` to allow HTTP traffic
   - Configured for IP: `192.168.29.122`

2. **✅ Enhanced Debugging**
   - Added comprehensive network diagnostics
   - Enhanced error logging in ApiService
   - Added network test button in login screen (dev mode)

3. **✅ Environment Configuration Fixed**
   - Corrected NODE_ENV in .env file
   - Enabled debug mode for better visibility

## 🚀 **Immediate Actions To Take**

### 1. **Use the Network Test Button**
After rebuilding, on the login screen you'll see a red "🔧 Network Test" button (in development mode). Tap it to:
- Test internet connectivity
- Test backend reachability  
- Test API endpoints
- Get detailed error information

### 2. **Check Your Backend Server**
Make sure your backend is running and accessible:

```powershell
# Verify your backend is running on the correct IP
netstat -an | Select-String ":3000"

# Test from your computer
Invoke-RestMethod -Uri "http://192.168.29.122:3000/api/v1/auth/get-nonce" -Method POST -ContentType "application/json" -Body '{"walletAddress":"0x1234567890123456789012345678901234567890"}'
```

### 3. **Common Issues & Solutions**

#### ❌ **"Network request failed"**
**Cause**: Android blocking HTTP traffic
**Solution**: ✅ Fixed with network security config

#### ❌ **"Cannot connect to server"**  
**Possible Causes**:
- Backend not running on your computer
- Wrong IP address in configuration
- Computer firewall blocking connections
- WiFi network changed

**Check**:
```powershell
# Get your current IP address
ipconfig | Select-String "IPv4"
```
If your IP changed, update `.env` file with new IP.

#### ❌ **"Connection timeout"**
**Possible Causes**:
- Network connectivity issues
- Backend server overloaded
- Firewall causing delays

#### ❌ **"CORS errors"**
**Cause**: Backend not configured for mobile requests
**Solution**: Configure your backend CORS to allow requests from your mobile device

### 4. **If IP Address Changed**

If your computer's IP changed from `192.168.29.122`, you need to:

1. **Find new IP**:
   ```powershell
   ipconfig | Select-String "IPv4"
   ```

2. **Update .env file**:
   ```properties
   EXPO_PUBLIC_API_URL=http://[NEW_IP]:3000/api/v1
   EXPO_PUBLIC_WS_URL=ws://[NEW_IP]:3000
   ```

3. **Update network security config** in `android/app/src/main/res/xml/network_security_config.xml`:
   ```xml
   <domain includeSubdomains="true">[NEW_IP]</domain>
   ```

4. **Rebuild app**:
   ```powershell
   npx expo run:android --variant release
   ```

### 5. **Alternative Testing Methods**

If release build still has issues:

```powershell
# Try debug build instead
npx expo run:android

# Or use Expo Go for testing
npx expo start
```

### 6. **Backend Server Configuration**

Make sure your backend server:
- Listens on `0.0.0.0:3000` (not just `localhost:3000`)
- Has CORS configured properly
- Returns JSON responses with proper headers

Example backend CORS config:
```javascript
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));
```

## 📋 **Expected Outcome**

After these fixes:
1. ✅ HTTP requests should work from your Android app
2. ✅ Better error messages help identify remaining issues  
3. ✅ Network test button provides detailed diagnostics
4. ✅ Sign-in process should complete successfully

## 🆘 **If Issues Persist**

1. **Use the Network Test button** to get detailed diagnostics
2. **Check Metro bundler console** for error details
3. **Verify your computer's IP** hasn't changed
4. **Test with debug build**: `npx expo run:android` 
5. **Check backend logs** to see if requests are reaching your server

The network test button will show exactly which step is failing and help pinpoint the issue!

## 🎯 Problem Summary

Network error when signing in on Android device - likely caused by Android's Network Security Policy blocking HTTP traffic.

## 🔧 Implemented Fixes

### 1. Network Security Configuration

- ✅ Created `android/app/src/main/res/xml/network_security_config.xml`
- ✅ Updated `AndroidManifest.xml` to reference the network security config
- ✅ Allows HTTP traffic for development IPs: 192.168.29.122, localhost, 10.0.2.2

### 2. Environment Configuration

- ✅ Fixed NODE_ENV mismatch in `.env` file
- ✅ Enabled debug mode for better error visibility

### 3. Enhanced Error Logging

- ✅ Added detailed network error logging to ApiService
- ✅ Better error messages for network issues

## 🔍 Additional Debugging Steps

### Check if Backend is Running

```powershell
# Test if your backend server is accessible
Invoke-RestMethod -Uri "http://192.168.29.122:3000/api/v1/auth/get-nonce" -Method POST -ContentType "application/json" -Body '{"walletAddress":"0x1234567890123456789012345678901234567890"}'
```

### Monitor Network Traffic

1. Open React Native Debugger or Chrome DevTools
2. Watch the Network tab during sign-in attempts
3. Look for failed requests or CORS errors

### Check Android Logs

```powershell
# View Android device logs
adb logcat | Select-String "FitFi|Network|HTTP"
```

## 🚨 Common Issues & Solutions

### Issue 1: "Network request failed"

**Cause**: Android blocking HTTP traffic
**Solution**: ✅ Fixed with network security config

### Issue 2: "Connection refused"

**Causes**:

- Backend server not running
- Wrong IP address
- Firewall blocking connections
  **Check**:

```powershell
# Find your current IP
ipconfig | Select-String "IPv4"
```

### Issue 3: "CORS errors"

**Cause**: Backend not configured for mobile requests
**Solution**: Configure backend CORS for your IP

### Issue 4: "Timeout errors"

**Causes**:

- Slow network
- Backend server overloaded
- Firewall delays
  **Solution**: Check network connectivity

## 📱 Testing Steps

1. **Rebuild app** with network security config:

   ```powershell
   npx expo run:android --variant release
   ```

2. **Install on device** and test sign-in

3. **Check logs** in Metro bundler for detailed error messages

4. **Verify backend connectivity** from your computer

5. **Test with demo login** if available (development mode only)

## 🔧 Fallback Solutions

### If HTTP is still blocked:

1. **Use HTTPS**: Set up SSL certificate for development
2. **Use Android Debug Build**: Run `npx expo run:android` (debug variant)
3. **Use Expo Go**: Test with `npx expo start` and Expo Go app
4. **Tunnel Mode**: Use `npx expo start --tunnel` for external access

### Alternative Network Configuration:

```xml
<!-- More permissive config for development -->
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>
```

## 📋 Verification Checklist

- [ ] Network security config file created
- [ ] AndroidManifest.xml updated
- [ ] App rebuilt with changes
- [ ] Backend server running on correct IP
- [ ] Debug mode enabled
- [ ] Error logs checked
- [ ] Network connectivity verified

## 🎯 Expected Outcome

After implementing these fixes:

1. HTTP requests to your development server should work
2. Better error messages will help identify remaining issues
3. Sign-in process should complete successfully
4. Debug logs will show detailed network information

## 📞 If Issues Persist

1. Check the Metro bundler logs for detailed error messages
2. Verify your computer's IP address hasn't changed
3. Test with Android debug build instead of release
4. Consider using HTTPS for production-like testing
