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
  (async () => {
    try {
      const mod = await import('text-encoding');
      // @ts-ignore
      global.TextEncoder = mod.TextEncoder;
      // @ts-ignore
      global.TextDecoder = mod.TextDecoder;
    } catch {}
  })();
}

// Ensure URL / URLSearchParams exist (MetaMask SDK dependency in some runtimes)
if (typeof global.URL === 'undefined') {
  (async () => {
    try {
      const mod = await import('whatwg-url');
      // @ts-ignore
      global.URL = mod.URL;
      // @ts-ignore
      global.URLSearchParams = mod.URLSearchParams;
    } catch {}
  })();
}
