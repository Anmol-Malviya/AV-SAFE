/**
 * Cross-module Integration Test
 */
import assert from 'node:assert';
import { analyzeURL } from '../../backend/services/phishingEngine.js';

console.log('--- Running Cross-Module Integration Tests ---');

const testUrl = 'http://secure-login.paypal.com.verify-account-security.xyz/update';
const scanResult = analyzeURL(testUrl);

assert.ok(scanResult.score !== undefined, 'Scan result must contain score');
assert.ok(scanResult.rating !== undefined, 'Scan result must contain rating');
assert.ok(scanResult.features !== undefined, 'Scan result must contain features');
assert.ok(Array.isArray(scanResult.detectionReasons), 'Must contain detection reasons');
assert.ok(scanResult.score < 50, 'Threat URL should receive low safety score');
assert.strictEqual(scanResult.rating, 'DANGEROUS', 'Spoofed domain must receive DANGEROUS rating');

console.log(`✓ Integrated phishing engine scan verified (URL score: ${scanResult.score}, rating: ${scanResult.rating}).`);
