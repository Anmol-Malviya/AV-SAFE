import { authenticateClerkRequest } from '../services/clerkAuthService.js';
import { verifyAdminAuth as verifyLegacyAdminKey } from './requireAdmin.js';
import { hasPermission, SUPER_ADMIN_EMAIL } from '../security/permissions.js';
import { recordAuditEvent } from '../services/auditService.js';

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
 */
export async function requireRole(request, minimumRole = 'USER') {
  // 1. Machine-to-machine / SecOps Admin key
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

  // 2. Clerk authentication
  const auth = await authenticateClerkRequest(request);

  if (auth.authenticated) {
    // If the authenticated user is the designated super admin email, grant full SUPER_ADMIN access immediately
    if (auth.user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return {
        ...auth,
        role: 'SUPER_ADMIN',
        authorized: true
      };
    }

    const userWeight = ROLE_HIERARCHY[auth.role] ?? 0;
    const requiredWeight = ROLE_HIERARCHY[minimumRole] ?? 10;

    if (userWeight >= requiredWeight) {
      return {
        ...auth,
        authorized: true
      };
    }

    recordAuditEvent({
      actorId: auth.userId,
      actorEmail: auth.user?.email || '',
      actorRole: auth.role,
      action: 'AUTHORIZATION_DENIED',
      resourceType: 'API_ENDPOINT',
      result: 'DENIED',
      severity: 'WARNING',
      details: { requiredRole: minimumRole, userRole: auth.role }
    }).catch(() => {});

    return {
      authenticated: true,
      authorized: false,
      userId: auth.userId,
      role: auth.role,
      error: `Forbidden: Requires ${minimumRole} privileges`,
      status: 403
    };
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
 * Enforce specific permission for the endpoint
 */
export async function requirePermission(request, permission) {
  const auth = await requireRole(request, 'USER');
  if (!auth.authorized && !auth.authenticated) return auth;

  const role = auth.role || 'GUEST';
  if (hasPermission(role, permission)) {
    return {
      ...auth,
      authorized: true
    };
  }

  recordAuditEvent({
    actorId: auth.userId || 'anonymous',
    actorEmail: auth.user?.email || '',
    actorRole: role,
    action: 'PERMISSION_DENIED',
    resourceType: 'PERMISSION',
    resourceId: permission,
    result: 'DENIED',
    severity: 'WARNING',
    details: { requiredPermission: permission, userRole: role }
  }).catch(() => {});

  return {
    ...auth,
    authorized: false,
    error: `Forbidden: Missing required permission [${permission}]`,
    status: 403
  };
}

/**
 * Strict Admin guard: requires at least ADMIN role or valid M2M admin token.
 */
export async function requireAdmin(request) {
  return requireRole(request, 'ADMIN');
}

