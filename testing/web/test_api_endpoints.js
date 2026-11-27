/**
 * Web App API Endpoints and Admin Handlers Unit Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Web App: Core application route structure completeness', () => {
  const routes = [
    'web-app/src/app/page.js',
    'web-app/src/app/admin/page.js',
    'web-app/src/app/system/page.js',
    'web-app/src/app/system/profile/page.js',
    'web-app/src/app/sign-in/[[...sign-in]]/page.js',
    'web-app/src/app/sign-up/[[...sign-up]]/page.js',
    'web-app/src/app/api/analyze/route.js',
    'web-app/src/app/api/history/route.js',
    'web-app/src/app/api/complaints/route.js',
    'web-app/src/app/api/analytics/route.js'
  ];

  for (const r of routes) {
    const fullPath = path.resolve(r);
    assert.ok(fs.existsSync(fullPath), `Target route must exist: ${r}`);
  }
});

test('Web App: Enterprise SecOps admin endpoints completeness', () => {
  const adminEndpoints = [
    'web-app/src/app/api/admin/complaints/route.js',
    'web-app/src/app/api/admin/audit/route.js',
    'web-app/src/app/api/admin/diagnostics/route.js',
    'web-app/src/app/api/admin/incidents/route.js',
    'web-app/src/app/api/admin/integrations/route.js',
    'web-app/src/app/api/admin/ml-governance/route.js',
    'web-app/src/app/api/admin/qr-lab/route.js',
    'web-app/src/app/api/admin/threat-intel/route.js',
    'web-app/src/app/api/admin/threat-map/route.js',
    'web-app/src/app/api/admin/users/route.js'
  ];

  for (const ep of adminEndpoints) {
    const epPath = path.resolve(ep);
    assert.ok(fs.existsSync(epPath), `Admin endpoint file must exist: ${ep}`);
    const content = fs.readFileSync(epPath, 'utf8');
    assert.ok(content.includes('export async function GET') || content.includes('export async function POST'),
      `Admin endpoint ${ep} must export GET or POST handler`);
  }
});

test('Web App: Offline inference weights synchronization', () => {
  const weightsFile = path.resolve('web-app/src/lib/phishing_model_weights.json');
  assert.ok(fs.existsSync(weightsFile), 'phishing_model_weights.json must exist in web-app');

  const content = JSON.parse(fs.readFileSync(weightsFile, 'utf8'));
  assert.ok(content.features && Array.isArray(content.features), 'Model weights must declare features list');
  assert.ok(content.weights && Array.isArray(content.weights), 'Model weights must declare feature weights');
  assert.ok(typeof content.bias === 'number', 'Model bias must be defined as number');
  assert.equal(content.features.length, content.weights.length, 'Weight count must match feature count');
  assert.equal(content.features.length, 24, 'Model weights must have exactly 24 features');
});
