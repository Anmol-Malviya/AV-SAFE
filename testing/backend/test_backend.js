/**
 * Backend Domain Unit Tests
 */
import assert from 'node:assert';
import { validateComplaintInput } from '../../backend/validators/complaint.js';
import { checkRateLimit } from '../../backend/middleware/rateLimit.js';
import { validateAndNormalizeUrl, isPrivateOrReservedIP } from '../../backend/middleware/urlValidation.js';
import { verifyAdminAuth } from '../../backend/middleware/requireAdmin.js';

console.log('--- Testing Backend Security and Validators ---');

// 1. SSRF and URL validation
const localCheck = isPrivateOrReservedIP('127.0.0.1');
assert.strictEqual(localCheck, true, '127.0.0.1 should be recognized as private/loopback');

const rfc1918 = isPrivateOrReservedIP('192.168.1.1');
assert.strictEqual(rfc1918, true, '192.168.1.1 should be recognized as private');

const publicCheck = isPrivateOrReservedIP('8.8.8.8');
assert.strictEqual(publicCheck, false, '8.8.8.8 is a public IP');

const validUrlRes = validateAndNormalizeUrl('https://example.com/login');
assert.strictEqual(validUrlRes.valid, true);
assert.strictEqual(validUrlRes.hostname, 'example.com');

const invalidUrlRes = validateAndNormalizeUrl('javascript:alert(1)');
assert.strictEqual(invalidUrlRes.valid, false, 'javascript protocol must be rejected');

const localhostRes = validateAndNormalizeUrl('http://localhost:3000');
assert.strictEqual(localhostRes.valid, false, 'localhost must be rejected');

// 2. Rate limiter
const ip = '10.0.0.99';
const r1 = checkRateLimit(ip, 2, 60000);
assert.strictEqual(r1.allowed, true);
const r2 = checkRateLimit(ip, 2, 60000);
assert.strictEqual(r2.allowed, true);
const r3 = checkRateLimit(ip, 2, 60000);
assert.strictEqual(r3.allowed, false, 'Should block beyond max limit');

// 3. Complaint validation
const validComplaint = validateComplaintInput({
  originalUrl: 'https://malicious-site.xyz/login',
  hostname: 'malicious-site.xyz',
  category: 'PHISHING',
  detectionVerdict: 'DANGEROUS',
  safetyScore: 12,
  confirmed: true,
  userConfirmedAt: new Date().toISOString()
});
assert.strictEqual(validComplaint.valid, true);

const invalidComplaint = validateComplaintInput({
  originalUrl: 'invalid-url',
  safetyScore: 150 // invalid range
});
assert.strictEqual(invalidComplaint.valid, false);

console.log('✓ All Backend domain tests passed successfully.');
