/**
 * Chromium MV3 Extension Validation Test
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('--- Testing Chromium MV3 Extension ---');

const extDir = path.resolve('extension');
const manifestPath = path.join(extDir, 'manifest.json');
assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.strictEqual(manifest.manifest_version, 3, 'Must be Manifest V3');
assert.ok(manifest.name, 'Extension must have name');
assert.ok(manifest.version, 'Extension must have version');

// Check background service worker
assert.ok(manifest.background && manifest.background.service_worker, 'Background worker defined');
assert.ok(fs.existsSync(path.join(extDir, manifest.background.service_worker)), 'Background script exists');

// Check action popup
assert.ok(manifest.action && manifest.action.default_popup, 'Action popup defined');
assert.ok(fs.existsSync(path.join(extDir, manifest.action.default_popup)), 'Popup HTML exists');

// Check icons
for (const [size, iconFile] of Object.entries(manifest.icons || {})) {
  assert.ok(fs.existsSync(path.join(extDir, iconFile)), `Icon ${size} exists: ${iconFile}`);
}

console.log('✓ Manifest V3 and extension file integrity validated.');
