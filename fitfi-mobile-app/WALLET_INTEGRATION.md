# FitFi Mobile Wallet Integration Guide

## Overview

The FitFi mobile app supports crypto wallet connections with different approaches for web and mobile platforms.

## Current Implementation Status

### ✅ Web Platform (Browser)

- **Fully Supported**: MetaMask and other Web3 browser extensions
- **Features**: Real wallet connection, message signing, network switching
- **Requirements**: MetaMask or compatible Web3 wallet extension

### 🚧 Mobile Platform (React Native/Expo)

- **Status**: Partial implementation with development fallback
- **Production**: Requires MetaMask mobile app or WalletConnect integration
- **Development**: Demo login available for testing

## Mobile Wallet Connection Options

### Option 1: MetaMask Mobile App (Recommended)

1. **Install MetaMask Mobile**:
   - iOS: [App Store](https://apps.apple.com/app/metamask/id1438144202)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=io.metamask)

2. **Connection Method**: Deep linking (partially implemented)
   - App attempts to open MetaMask via deep links
   - Currently shows informative error with installation links

### Option 2: WalletConnect Integration (Future Enhancement)

- **Status**: Not yet implemented
- **Benefits**: Universal wallet compatibility
- **Packages Ready**: react-native-url-polyfill, ethers.js

### Option 3: Email Login (Alternative)

- **Status**: Fully implemented
- **Use Case**: Users without crypto wallets
- **Features**: Standard email/password authentication

## User Experience Flow

### Production Mode

1. User clicks "Connect Wallet (Mobile)"
2. App checks for Web3 environment:
   - **Web**: Direct MetaMask connection
   - **Mobile**: Shows installation/alternatives dialog
3. Mobile users get options:
   - Install MetaMask app
   - Switch to email login
   - Use web browser

### Development Mode

1. Same as production, plus:
2. Demo login option available
3. Mock signature generation for testing
4. Warning messages about production requirements

## Technical Implementation

### Files Modified

- `utils/WalletService.ts`: Platform-specific wallet handling
- `screens/LoginScreen.tsx`: Mobile-friendly error messages
- `polyfills.js`: Crypto library compatibility
- `app/_layout.tsx`: Polyfill imports

### Key Features

- Platform detection (`Platform.OS`)
- Deep link integration (`expo-linking`)
- Polyfills for crypto libraries
- Graceful fallbacks for mobile

### Error Handling

- Clear messages for unsupported scenarios
- App store links for wallet installation
- Alternative login method suggestions
- Development vs production mode awareness

## Testing Instructions

### Web Testing

1. Install MetaMask browser extension
2. Navigate to app in web browser
3. Click "Connect Wallet"
4. Follow standard Web3 connection flow

### Mobile Testing (Development)

1. Run app in Expo Go
2. Click "Connect Wallet (Mobile)"
3. Select "Use Demo Login" in development
4. Test authentication flow

### Mobile Testing (Production)

1. Set `NODE_ENV=production`
2. Install MetaMask mobile app
3. Test deep link integration
4. Verify email login alternative

## Future Enhancements

### Planned Improvements

1. **WalletConnect Integration**:
   - Universal wallet support
   - QR code scanning
   - Session management

2. **Enhanced Deep Linking**:
   - Better MetaMask integration
   - Multiple wallet support
   - Improved error handling

3. **Biometric Authentication**:
   - Face ID/Touch ID support
   - Secure key storage
   - Local authentication

### Package Dependencies

```json
{
  "ethers": "^6.13.2",
  "react-native-url-polyfill": "latest",
  "expo-crypto": "latest",
  "buffer": "latest",
  "process": "latest"
}
```

## Troubleshooting

### Common Issues

#### "This application requires a real crypto wallet connection"

- **Cause**: Production mode without proper wallet setup
- **Solution**: Install MetaMask mobile or use email login

#### "Mobile wallet connection is not fully implemented"

- **Cause**: WalletConnect not yet integrated
- **Solution**: Use demo login (dev) or email login (prod)

#### Polyfill errors

- **Cause**: Missing crypto library dependencies
- **Solution**: Ensure polyfills.js is loaded in \_layout.tsx

### Support

- Use email login as primary authentication method
- Web browser + MetaMask for full crypto features
- Demo login available in development mode

## Security Notes

- Demo signatures are blocked in production
- Real wallet signatures required for production
- Secure token storage with AsyncStorage
- Environment-based feature flags
