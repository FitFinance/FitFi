// React Native polyfills for crypto libraries
import 'react-native-url-polyfill/auto';
import * as Crypto from 'expo-crypto';

// Global Buffer polyfill if needed
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Global process polyfill if needed
if (typeof global.process === 'undefined') {
  global.process = require('process');
}

// Handle crypto for ethers.js
// Define crypto globals that ethers.js expects
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (array) => {
      const randomBytes = Crypto.getRandomBytes(array.length);
      for (let i = 0; i < array.length; i++) {
        array[i] = randomBytes[i];
      }
      return array;
    },
    subtle: null, // Not implemented but prevents errors
  };
}

// Define window if it doesn't exist (for React Native)
if (typeof global.window === 'undefined') {
  global.window = global;
}

console.log('✅ Polyfills loaded for crypto libraries');
