import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('Running Chromium Extension Manifest & Asset Validation tests...');

const manifestPath = path.resolve('extension/manifest.json');
assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist in extension/');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.strictEqual(manifest.manifest_version, 3, 'Must be Manifest V3');

// Check background script
if (manifest.background && manifest.background.service_worker) {
  const swPath = path.resolve('extension', manifest.background.service_worker);
  assert.ok(fs.existsSync(swPath), `Service worker ${manifest.background.service_worker} must exist`);
}

// Check popup html
if (manifest.action && manifest.action.default_popup) {
  const popupPath = path.resolve('extension', manifest.action.default_popup);
  assert.ok(fs.existsSync(popupPath), `Popup HTML ${manifest.action.default_popup} must exist`);
}

// Check icons
if (manifest.icons) {
  for (const [size, iconFile] of Object.entries(manifest.icons)) {
    const iconPath = path.resolve('extension', iconFile);
    assert.ok(fs.existsSync(iconPath), `Icon (${size}px) ${iconFile} must exist`);
  }
}

console.log('Extension Manifest V3 and referenced assets verified successfully!');
