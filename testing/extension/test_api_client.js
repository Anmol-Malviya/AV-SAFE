/**
 * Chromium Extension API Client and Clerk Auth Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SERVER_URL, getServerUrl, setServerUrl } from '../../extension/apiClient.js';
import { CLERK_CONFIG, getAuthToken, getAuthUser } from '../../extension/clerkAuth.js';

test('Extension API Client: DEFAULT_SERVER_URL default value', () => {
  assert.equal(DEFAULT_SERVER_URL, 'http://localhost:3000');
});

test('Extension API Client: Fallback without chrome.storage', async () => {
  // When global chrome is undefined
  const originalChrome = globalThis.chrome;
  delete globalThis.chrome;

  const url = await getServerUrl();
  assert.equal(url, 'http://localhost:3000');

  // setServerUrl returns formatted url without trailing slash
  const cleanUrl = await setServerUrl('https://example.com/api///');
  assert.equal(cleanUrl, 'https://example.com/api');

  // Automatic protocol prefixing if missing
  const prefixed = await setServerUrl('my-server.local:8080');
  assert.equal(prefixed, 'http://my-server.local:8080');

  globalThis.chrome = originalChrome;
});

test('Extension API Client: Chrome storage integration mock', async () => {
  const mockStorage = {
    serverUrl: 'https://security-api.example.org/'
  };

  globalThis.chrome = {
    storage: {
      local: {
        get: (keys, cb) => cb({ serverUrl: mockStorage.serverUrl }),
        set: (obj, cb) => {
          Object.assign(mockStorage, obj);
          if (cb) cb();
        }
      }
    }
  };

  const retrieved = await getServerUrl();
  assert.equal(retrieved, 'https://security-api.example.org');

  await setServerUrl('https://new-endpoint.dev/');
  assert.equal(mockStorage.serverUrl, 'https://new-endpoint.dev');

  delete globalThis.chrome;
});

test('Extension Clerk Auth: Configuration and credentials check', () => {
  assert.ok(CLERK_CONFIG.publishableKey.startsWith('pk_'));
  assert.ok(CLERK_CONFIG.frontendApi.includes('clerk.accounts.dev'));
  assert.ok(CLERK_CONFIG.dashboardUrl.startsWith('https://'));
});

test('Extension Clerk Auth: Session token and User storage resolution', async () => {
  // Fallback when chrome not present
  delete globalThis.chrome;
  assert.equal(await getAuthToken(), null);
  const nullUser = await getAuthUser();
  assert.equal(nullUser.userId, null);
  assert.equal(nullUser.email, null);

  // Mock chrome storage
  globalThis.chrome = {
    storage: {
      local: {
        get: (keys, cb) => {
          cb({
            clerk_session_token: 'test_token_xyz_123',
            clerk_user_id: 'user_2abcdef123456',
            clerk_user_email: 'secops@phishguard.internal',
            clerk_user_name: 'SecOps Officer'
          });
        }
      }
    }
  };

  const token = await getAuthToken();
  assert.equal(token, 'test_token_xyz_123');

  const user = await getAuthUser();
  assert.equal(user.userId, 'user_2abcdef123456');
  assert.equal(user.email, 'secops@phishguard.internal');
  assert.equal(user.name, 'SecOps Officer');

  delete globalThis.chrome;
});
