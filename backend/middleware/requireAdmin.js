import crypto from 'crypto';

/**
 * Authentication and Admin Authorization Helper
 * In this project, there is no pre-existing User database or session cookie table.
 * Administrators access the admin endpoints via:
 * 1. Admin API Key in Authorization header: `Bearer <ADMIN_SECRET>`
 * 2. Or custom header `x-admin-key: <ADMIN_SECRET>`
 * 3. Or session cookie `phishguard_admin_token`
 *
 * The secret must be set via process.env.ADMIN_SECRET_KEY.
 * In development mode only, a development fallback key is accepted if unset.
 */

const DEFAULT_DEV_ADMIN_KEY = 'phishguard-secops-admin-key-2026';

export function getAdminKey() {
  if (process.env.ADMIN_SECRET_KEY) {
    return process.env.ADMIN_SECRET_KEY;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: ADMIN_SECRET_KEY must be configured in production environments.');
  }
  return DEFAULT_DEV_ADMIN_KEY;
}

function timingSafeMatch(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string') return false;
  const bufA = Buffer.from(provided);
  const bufB = Buffer.from(expected);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminAuth(request) {
  const authHeader = request.headers.get('authorization') || '';
  const customHeader = request.headers.get('x-admin-key') || '';
  
  let bearerToken = '';
  if (authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.substring(7).trim();
  }

  // Also check cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
  const cookieToken = cookies['phishguard_admin_token'];

  const providedKey = bearerToken || customHeader || cookieToken;

  let configuredAdminKey;
  try {
    configuredAdminKey = getAdminKey();
  } catch (err) {
    console.error('Admin Auth Configuration Error:', err.message);
    return {
      authenticated: false,
      authorized: false,
      error: 'Authentication configuration error',
      status: 500
    };
  }

  if (!providedKey) {
    return {
      authenticated: false,
      authorized: false,
      error: 'Authentication required. Missing admin credentials.',
      status: 401
    };
  }

  if (!timingSafeMatch(providedKey, configuredAdminKey)) {
    return {
      authenticated: true,
      authorized: false,
      error: 'Forbidden. Invalid administrator credentials.',
      status: 403
    };
  }

  return {
    authenticated: true,
    authorized: true,
    role: 'ADMIN',
    adminId: 'secops-admin-1'
  };
}

