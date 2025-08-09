// Central polyfills loaded early in _layout
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { decode, encode } from 'base-64';
import { Buffer } from 'buffer';
import process from 'process';

if (!global.btoa) global.btoa = encode;
if (!global.atob) global.atob = decode;
if (!global.Buffer) global.Buffer = Buffer;
if (!global.process) global.process = process;

if (typeof global.TextEncoder === 'undefined') {
  try {
    const { TextEncoder, TextDecoder } = require('text-encoding');
    // @ts-ignore
    global.TextEncoder = TextEncoder;
    // @ts-ignore
    global.TextDecoder = TextDecoder;
  } catch {}
}
