/**
 * AV-SAFE Centralized Permissions & Role Matrix
 */

export const PERMISSIONS = {
  // Users namespace
  USERS_READ: 'users.read',
  USERS_MANAGE: 'users.manage',
  USERS_ROLES: 'users.roles',

  // Audit namespace
  AUDIT_READ: 'audit.read',
  AUDIT_EXPORT: 'audit.export',

  // Incidents namespace
  INCIDENTS_READ: 'incidents.read',
  INCIDENTS_MANAGE: 'incidents.manage',
  INCIDENTS_ASSIGN: 'incidents.assign',
  INCIDENTS_ESCALATE: 'incidents.escalate',

  // Threat Intel namespace
  THREAT_INTEL_READ: 'threat_intel.read',
  THREAT_INTEL_MANAGE: 'threat_intel.manage',
  THREAT_INTEL_FEEDS: 'threat_intel.feeds',

  // QR Lab namespace
  QR_LAB_SCAN: 'qr_lab.scan',
  QR_LAB_ANALYZE: 'qr_lab.analyze',

  // Diagnostics namespace
  DIAGNOSTICS_READ: 'diagnostics.read',
  DIAGNOSTICS_EXECUTE: 'diagnostics.execute',

  // ML Governance namespace
  ML_READ: 'ml.read',
  ML_MANAGE: 'ml.manage',
  ML_APPROVE: 'ml.approve',

  // Integrations namespace
  INTEGRATIONS_READ: 'integrations.read',
  INTEGRATIONS_MANAGE: 'integrations.manage',

  // Threat Map namespace
  THREAT_MAP_READ: 'threat_map.read',

  // Security Config namespace
  SECURITY_CONFIG_READ: 'security.config.read',
  SECURITY_CONFIG_MANAGE: 'security.config.manage',
  BREAK_GLASS: 'security.break_glass'
};

export const ROLE_PERMISSIONS = {
  USER: [
    PERMISSIONS.QR_LAB_SCAN
  ],
  ANALYST: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.INCIDENTS_READ,
    PERMISSIONS.INCIDENTS_MANAGE,
    PERMISSIONS.THREAT_INTEL_READ,
    PERMISSIONS.THREAT_INTEL_MANAGE,
    PERMISSIONS.QR_LAB_SCAN,
    PERMISSIONS.QR_LAB_ANALYZE,
    PERMISSIONS.DIAGNOSTICS_READ,
    PERMISSIONS.ML_READ,
    PERMISSIONS.THREAT_MAP_READ
  ],
  ADMIN: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.AUDIT_EXPORT,
    PERMISSIONS.INCIDENTS_READ,
    PERMISSIONS.INCIDENTS_MANAGE,
    PERMISSIONS.INCIDENTS_ASSIGN,
    PERMISSIONS.INCIDENTS_ESCALATE,
    PERMISSIONS.THREAT_INTEL_READ,
    PERMISSIONS.THREAT_INTEL_MANAGE,
    PERMISSIONS.THREAT_INTEL_FEEDS,
    PERMISSIONS.QR_LAB_SCAN,
    PERMISSIONS.QR_LAB_ANALYZE,
    PERMISSIONS.DIAGNOSTICS_READ,
    PERMISSIONS.DIAGNOSTICS_EXECUTE,
    PERMISSIONS.ML_READ,
    PERMISSIONS.ML_MANAGE,
    PERMISSIONS.INTEGRATIONS_READ,
    PERMISSIONS.INTEGRATIONS_MANAGE,
    PERMISSIONS.THREAT_MAP_READ,
    PERMISSIONS.SECURITY_CONFIG_READ
  ],
  SUPER_ADMIN: Object.values(PERMISSIONS)
};

export const SUPER_ADMIN_EMAIL = 'anmoldiscord4328@gmail.com';

/**
 * Check if a role possesses a given permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  if (role === 'SUPER_ADMIN') return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
