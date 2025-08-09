// Custom entry to apply polyfills then load expo-router
import 'react-native-gesture-handler';
import { Platform } from 'react-native';
// Crypto & encoding polyfills for wallet libs
import 'react-native-get-random-values';
import { decode, encode } from 'base-64';

if (!global.btoa) global.btoa = encode;
if (!global.atob) global.atob = decode;

// Buffer & process polyfills
import { Buffer } from 'buffer';
if (!global.Buffer) global.Buffer = Buffer;

import process from 'process';
if (!global.process) global.process = process;

// TextEncoder/TextDecoder polyfill (Hermes lacks them sometimes)
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('text-encoding');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Finally import expo-router entry
import 'expo-router/entry';
