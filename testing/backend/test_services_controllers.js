/**
 * Backend Services, Controllers, and Security Unit Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeURL, extractModelFeatures } from '../../backend/services/phishingEngine.js';
import { inspectQrUrl } from '../../backend/services/qrSecurityService.js';
import { recordAuditEvent, verifyAuditChainIntegrity } from '../../backend/services/auditService.js';
import { getClerkClient, authenticateClerkRequest } from '../../backend/services/clerkAuthService.js';
import { hasPermission, PERMISSIONS, ROLE_PERMISSIONS } from '../../backend/security/permissions.js';

test('Phishing Engine: URL feature extractor returns complete feature set', () => {
  const url = 'http://login.secure-bank.phish-account.com/verify?token=123';
  const feats = extractModelFeatures(url);

  assert.ok(feats !== null && typeof feats === 'object');
  assert.equal(feats.is_https, 0);
  assert.ok(feats.subdomain_count >= 2);
  assert.ok(feats.has_sensitive_words === 1 || feats.sensitive_words_count >= 1);
  assert.equal(feats.is_ip, 0);
});

test('Phishing Engine: Brand protection & spoofing heuristics', () => {
  const legitGoogle = analyzeURL('https://www.google.com/search?q=cybersecurity');
  assert.equal(legitGoogle.rating, 'SAFE');
  assert.ok(legitGoogle.score >= 80);

  const spoofedGoogle = analyzeURL('http://google.com.verify-login.xyz/auth');
  assert.equal(spoofedGoogle.rating, 'DANGEROUS');
  assert.ok(spoofedGoogle.score < 50);
  assert.ok(spoofedGoogle.warnings.length > 0);
});

test('Phishing Engine: Homograph & Punycode detection', () => {
  const punyUrl = 'http://xn--appl-wqa.com/login';
  const res = analyzeURL(punyUrl);
  assert.equal(res.rating, 'DANGEROUS');
  assert.ok(
    res.warnings.some(w => {
      const text = typeof w === 'string' ? w : (w.message || w.rule || JSON.stringify(w));
      return text.toLowerCase().includes('punycode') || text.toLowerCase().includes('homograph');
    })
  );
});

test('QR Security Service: Rejects invalid or dangerous schemes', async () => {
  const fileScheme = await inspectQrUrl('file:///etc/passwd');
  assert.equal(fileScheme.verdict, 'DANGEROUS');
  assert.ok(fileScheme.heuristicChecks.some(c => c.includes('Prohibited URL scheme')));

  const jsScheme = await inspectQrUrl('javascript:alert(document.cookie)');
  assert.equal(jsScheme.verdict, 'DANGEROUS');
  assert.ok(jsScheme.heuristicChecks.some(c => c.includes('Prohibited URL scheme')));
});

test('QR Security Service: Loopback and Private IP SSRF protection', async () => {
  const loopback = await inspectQrUrl('http://127.0.0.1:8080/admin');
  assert.equal(loopback.isSsrfRisk, true);
  assert.equal(loopback.verdict, 'BLOCKED_SSRF');

  const awsMetadata = await inspectQrUrl('http://169.254.169.254/latest/meta-data/');
  assert.equal(awsMetadata.isSsrfRisk, true);
  assert.equal(awsMetadata.verdict, 'BLOCKED_SSRF');

  const privateClassC = await inspectQrUrl('http://192.168.1.50/setup');
  assert.equal(privateClassC.isSsrfRisk, true);
  assert.equal(privateClassC.verdict, 'BLOCKED_SSRF');
});

test('QR Security Service: Normalizes legitimate secure URL', async () => {
  const legitimate = await inspectQrUrl('https://example.com/menu');
  assert.equal(legitimate.isValidUrl, true);
  assert.equal(legitimate.isSsrfRisk, false);
  assert.equal(legitimate.hostname, 'example.com');
  assert.equal(legitimate.scheme, 'https:');
});

test('Audit Service: Cryptographic hash chain validation', async () => {
  const event1 = await recordAuditEvent({
    eventType: 'USER_LOGIN',
    actorEmail: 'admin@phishguard.test',
    action: 'LOGIN_SUCCESS'
  });

  const event2 = await recordAuditEvent({
    eventType: 'MODEL_DEPLOY',
    actorEmail: 'secops@phishguard.test',
    action: 'DEPLOY_MODEL_V2'
  });

  assert.ok(event1.eventHash);
  assert.ok(event2.eventHash);
  assert.ok(event2.previousHash);

  const validation = await verifyAuditChainIntegrity();
  assert.equal(validation.verified, true);
});

test('Clerk Auth Service: Instance initialization & unauthenticated request fallback', async () => {
  const client = getClerkClient();
  assert.ok(client !== null && typeof client === 'object');

  const mockReq = {
    headers: new Headers()
  };

  const result = await authenticateClerkRequest(mockReq);
  assert.equal(result.authenticated, false);
  assert.equal(result.role, 'GUEST');
  assert.equal(result.userId, null);
});

test('RBAC Permissions: Matrix and least privilege compliance', () => {
  // USER permissions check
  assert.equal(hasPermission('USER', PERMISSIONS.QR_LAB_SCAN), true);
  assert.equal(hasPermission('USER', PERMISSIONS.USERS_MANAGE), false);

  // ANALYST permissions check
  assert.equal(hasPermission('ANALYST', PERMISSIONS.AUDIT_READ), true);
  assert.equal(hasPermission('ANALYST', PERMISSIONS.THREAT_INTEL_MANAGE), true);
  assert.equal(hasPermission('ANALYST', PERMISSIONS.BREAK_GLASS), false);

  // SUPER_ADMIN permissions check
  assert.equal(hasPermission('SUPER_ADMIN', PERMISSIONS.BREAK_GLASS), true);
  assert.equal(hasPermission('SUPER_ADMIN', PERMISSIONS.USERS_MANAGE), true);
});
