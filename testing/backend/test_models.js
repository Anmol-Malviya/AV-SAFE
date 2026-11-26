import assert from 'node:assert';
import { validateComplaintInput } from '../../backend/validators/complaint.js';
import { isPrivateOrReservedIP, validateAndNormalizeUrl } from '../../backend/middleware/urlValidation.js';
import { checkRateLimit } from '../../backend/middleware/rateLimit.js';

console.log('Running backend security & validation tests...');

// 1. SSRF IP Checks
assert.strictEqual(isPrivateOrReservedIP('127.0.0.1'), true, 'Loopback must be flagged private');
assert.strictEqual(isPrivateOrReservedIP('10.0.0.1'), true, 'Private class A must be flagged private');
assert.strictEqual(isPrivateOrReservedIP('192.168.1.1'), true, 'Private class C must be flagged private');
assert.strictEqual(isPrivateOrReservedIP('169.254.169.254'), true, 'AWS metadata IP must be flagged private');
assert.strictEqual(isPrivateOrReservedIP('8.8.8.8'), false, 'Public DNS should not be flagged private');

// 2. URL Normalization
const validNorm = validateAndNormalizeUrl('https://example.com/test');
assert.strictEqual(validNorm.valid, true);
assert.strictEqual(validNorm.hostname, 'example.com');

const invalidLocal = validateAndNormalizeUrl('http://localhost:3000/api');
assert.strictEqual(invalidLocal.valid, false, 'Localhost URL must be rejected by anti-SSRF');

const invalidProtocol = validateAndNormalizeUrl('javascript:alert(1)');
assert.strictEqual(invalidProtocol.valid, false, 'Javascript protocol must be rejected');

// 3. Complaint Validation
const badComplaint = validateComplaintInput({});
assert.strictEqual(badComplaint.valid, false);

// 4. Rate Limiter
const r1 = checkRateLimit('test-client-ip', 2, 1000);
assert.strictEqual(r1.allowed, true);
const r2 = checkRateLimit('test-client-ip', 2, 1000);
assert.strictEqual(r2.allowed, true);
const r3 = checkRateLimit('test-client-ip', 2, 1000);
assert.strictEqual(r3.allowed, false);

console.log('All backend security & validation unit tests passed successfully!');
