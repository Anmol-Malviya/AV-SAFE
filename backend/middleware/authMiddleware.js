import { authenticateClerkRequest } from '../services/clerkAuthService.js';
import { verifyAdminAuth as verifyLegacyAdminKey } from './requireAdmin.js';

export const ROLE_HIERARCHY = {
  GUEST: 0,
  USER: 10,
  ANALYST: 20,
  ADMIN: 30,
  SUPER_ADMIN: 40
};

/**
 * Universal authentication middleware for API routes.
 * Extracts authenticated Clerk identity or allows guest mode when optional.
 */
export async function requireAuth(request, { optional = false } = {}) {
  const auth = await authenticateClerkRequest(request);

  if (!auth.authenticated) {
    if (optional) {
      return {
        authenticated: false,
        userId: null,
        role: 'GUEST',
        user: null,
        error: null,
        status: 200
      };
    }
    return auth;
  }

  return auth;
}

/**
 * Authorizes requests requiring a specific minimum role.
 * Supports emergency machine-to-machine admin key via fallback if configured.
 */
export async function requireRole(request, minimumRole = 'USER') {
  // 1. First check Clerk authentication
  const auth = await authenticateClerkRequest(request);

  if (auth.authenticated) {
    const userWeight = ROLE_HIERARCHY[auth.role] ?? 0;
    const requiredWeight = ROLE_HIERARCHY[minimumRole] ?? 10;

    if (userWeight >= requiredWeight) {
      return {
        ...auth,
        authorized: true
      };
    }

    return {
      authenticated: true,
      authorized: false,
      userId: auth.userId,
      role: auth.role,
      error: `Forbidden: Requires ${minimumRole} privileges`,
      status: 403
    };
  }

  // 2. Machine-to-machine / SecOps Admin fallback (for automated workers / emergency CLI)
  if (minimumRole === 'ADMIN' || minimumRole === 'SUPER_ADMIN') {
    const legacyAdmin = verifyLegacyAdminKey(request);
    if (legacyAdmin.authenticated && legacyAdmin.authorized) {
      return {
        authenticated: true,
        authorized: true,
        userId: legacyAdmin.adminId || 'm2m-admin-key',
        role: 'SUPER_ADMIN',
        user: null,
        error: null,
        status: 200,
        isM2M: true
      };
    }
  }

  return {
    authenticated: false,
    authorized: false,
    userId: null,
    role: 'GUEST',
    error: auth.error || 'Authentication required',
    status: auth.status || 401
  };
}

/**
 * Strict Admin guard: requires at least ADMIN role or valid M2M admin token.
 */
export async function requireAdmin(request) {
  return requireRole(request, 'ADMIN');
}
