import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { analyzeURL } from '../../backend/services/phishingEngine.js';

console.log('Running End-to-End Threat Intelligence Pipeline Tests...');

// Verify offline inference weights
const webWeightsPath = path.resolve('web-app/src/lib/phishing_model_weights.json');
const backendWeightsPath = path.resolve('backend/ml/weights/phishing_model_weights.json');

assert.ok(fs.existsSync(webWeightsPath), 'Web-app weights JSON must exist');
assert.ok(fs.existsSync(backendWeightsPath), 'Backend ML weights JSON must exist');

// Test Phishing Engine detection
const safeUrl = 'https://google.com';
const safeResult = analyzeURL(safeUrl);
assert.ok(safeResult.score !== undefined);
assert.ok(['SAFE', 'SUSPICIOUS', 'DANGEROUS'].includes(safeResult.rating));

const phishingUrl = 'http://paypa1-security-verification-login.com.account-update.xyz/login';
const phishResult = analyzeURL(phishingUrl);
assert.strictEqual(phishResult.rating, 'DANGEROUS', 'High-threat URL must be classified DANGEROUS');

console.log('End-to-End detection pipeline tests passed successfully!');
