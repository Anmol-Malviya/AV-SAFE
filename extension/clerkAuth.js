/**
 * Clerk Extension Authentication Helper for MV3
 * Manages sign-in sessions, JWT tokens, and identity persistence across popup and service worker.
 */

export const CLERK_CONFIG = {
  publishableKey: 'pk_test_YW1wbGUtZWZ0LTk4MjIuY2xlcmsuYWNjb3VudHMuZGV2JA',
  frontendApi: 'https://ample-eft-9822.clerk.accounts.dev',
  dashboardUrl: 'https://av-safe.vercel.app'
};

/**
 * Retrieves the current authenticated session token from chrome storage.
 * @returns {Promise<string|null>}
 */
export async function getAuthToken() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['clerk_session_token'], (res) => {
        resolve(res.clerk_session_token || null);
      });
    } else {
      resolve(null);
    }
  });
}

/**
 * Retrieves the active user profile information from extension storage.
 * @returns {Promise<{ userId: string|null, email: string|null, name: string|null }>}
 */
export async function getAuthUser() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['clerk_user_id', 'clerk_user_email', 'clerk_user_name'], (res) => {
        resolve({
          userId: res.clerk_user_id || null,
          email: res.clerk_user_email || null,
          name: res.clerk_user_name || null
        });
      });
    } else {
      resolve({ userId: null, email: null, name: null });
    }
  });
}

/**
 * Sets active session credentials in extension storage.
 */
export async function setAuthSession({ token, userId, email, name }) {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        clerk_session_token: token,
        clerk_user_id: userId,
        clerk_user_email: email,
        clerk_user_name: name
      }, () => resolve(true));
    } else {
      resolve(false);
    }
  });
}

/**
 * Clears extension authentication session (Sign Out).
 */
export async function clearAuthSession() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove([
        'clerk_session_token',
        'clerk_user_id',
        'clerk_user_email',
        'clerk_user_name'
      ], () => resolve(true));
    } else {
      resolve(false);
    }
  });
}

/**
 * Signs in via Clerk Frontend API using identifier and password.
 */
export async function signInClerk(identifier, password) {
  try {
    const res = await fetch(`${CLERK_CONFIG.frontendApi}/v1/client/sign_ins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Clerk-API-Version': '2024-10-01'
      },
      body: JSON.stringify({
        identifier,
        password,
        strategy: 'password'
      })
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data.errors?.[0]?.message || `Login failed (HTTP ${res.status})`;
      return { success: false, error: msg };
    }

    let token = '';
    let userId = '';

    const sessions = data.client?.sessions || [];
    if (sessions.length > 0) {
      token = sessions[0].last_active_token || sessions[0].id;
      userId = sessions[0].user?.id || '';
    } else if (data.created_session_id) {
      token = data.created_session_id;
      userId = data.user_id || '';
    }

    await setAuthSession({
      token,
      userId,
      email: identifier,
      name: identifier.split('@')[0]
    });

    return { success: true, userId, token };
  } catch (err) {
    return { success: false, error: err.message || 'Network error connecting to Clerk' };
  }
}
