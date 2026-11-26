import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasPermission, PERMISSIONS } from '../../backend/security/permissions.js';
import { inspectQrUrl } from '../../backend/services/qrSecurityService.js';
import { recordAuditEvent, verifyAuditChainIntegrity } from '../../backend/services/auditService.js';

test('RBAC: SuperAdmin possesses all enterprise permissions', () => {
  assert.equal(hasPermission('SUPER_ADMIN', PERMISSIONS.USERS_MANAGE), true);
  assert.equal(hasPermission('SUPER_ADMIN', PERMISSIONS.ML_APPROVE), true);
  assert.equal(hasPermission('SUPER_ADMIN', PERMISSIONS.BREAK_GLASS), true);
});

test('RBAC: Analyst role cannot manage users or approve ML models', () => {
  assert.equal(hasPermission('ANALYST', PERMISSIONS.USERS_MANAGE), false);
  assert.equal(hasPermission('ANALYST', PERMISSIONS.ML_APPROVE), false);
  assert.equal(hasPermission('ANALYST', PERMISSIONS.THREAT_INTEL_READ), true);
  assert.equal(hasPermission('ANALYST', PERMISSIONS.QR_LAB_ANALYZE), true);
});

test('RBAC: Standard user cannot read audit logs or incidents', () => {
  assert.equal(hasPermission('USER', PERMISSIONS.AUDIT_READ), false);
  assert.equal(hasPermission('USER', PERMISSIONS.INCIDENTS_READ), false);
});

test('QR Security Lab: Anti-SSRF Blocks loopback and private IP targets', async () => {
  const loopbackResult = await inspectQrUrl('http://127.0.0.1/admin/secrets');
  assert.equal(loopbackResult.isSsrfRisk, true);
  assert.equal(loopbackResult.verdict, 'BLOCKED_SSRF');

  const privateResult = await inspectQrUrl('http://192.168.1.1/router/config');
  assert.equal(privateResult.isSsrfRisk, true);
  assert.equal(privateResult.verdict, 'BLOCKED_SSRF');
});

test('QR Security Lab: Blocks dangerous non-http schemes', async () => {
  const jsResult = await inspectQrUrl('javascript:alert(document.cookie)');
  assert.equal(jsResult.verdict, 'DANGEROUS');
  assert.equal(jsResult.threatScore >= 90, true);
});

test('Audit Logging: Cryptographic hash chain preserves integrity', async () => {
  await recordAuditEvent({
    actorId: 'test_user_1',
    actorRole: 'SUPER_ADMIN',
    action: 'TEST_OPERATION',
    resourceType: 'TEST_RESOURCE'
  });

  const check = await verifyAuditChainIntegrity();
  assert.equal(check.verified, true);
});
