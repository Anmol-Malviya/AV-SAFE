// Authorized Super-Admin Email
export const SUPER_ADMIN_EMAIL = 'anmoldiscord4328@gmail.com';

export function isSuperAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Validates either the admin API key or super admin identity
 */
export async function requireAdminOrApiKey(request) {
  const adminKey = request.headers.get('x-admin-key');
  const configuredKey = process.env.ADMIN_API_KEY || 'phishguard-secops-admin-key-2026';

  if (adminKey && adminKey === configuredKey) {
    return { authorized: true, role: 'SUPER_ADMIN', email: SUPER_ADMIN_EMAIL };
  }

  // Check auth header or return 401
  return { authorized: false, error: 'Unauthorized: Admin privileges required', status: 401 };
}
