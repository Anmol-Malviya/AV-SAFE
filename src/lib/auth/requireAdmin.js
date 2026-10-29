/**
 * Authentication and Admin Authorization Helper
 * In this project, there is no pre-existing User database or session cookie table.
 * Administrators access the admin endpoints via:
 * 1. Admin API Key in Authorization header: `Bearer <ADMIN_SECRET>`
 * 2. Or custom header `x-admin-key: <ADMIN_SECRET>`
 * 3. Or session cookie `phishguard_admin_token`
 *
 * The secret defaults to process.env.ADMIN_SECRET_KEY, with a fallback for development.
 * Never trust a caller-supplied 'isAdmin: true' in request bodies or query params.
 */

const DEFAULT_DEV_ADMIN_KEY = 'phishguard-secops-admin-key-2026';

export function getAdminKey() {
  return process.env.ADMIN_SECRET_KEY || DEFAULT_DEV_ADMIN_KEY;
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
  const configuredAdminKey = getAdminKey();

  if (!providedKey) {
    return {
      authenticated: false,
      authorized: false,
      error: 'Authentication required. Missing admin credentials.',
      status: 401
    };
  }

  if (providedKey !== configuredAdminKey) {
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

