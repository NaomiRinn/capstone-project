import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Polyfill for Web Crypto if running in JSDOM which might lack some SubtleCrypto features
// @ts-expect-error: node:crypto might not be recognized by all TypeScript configurations for browser-focused tests
import { crypto } from 'node:crypto';
if (!globalThis.crypto.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: crypto.webcrypto,
  });
}
