import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('Running Web App Route and File Discovery Tests...');

const requiredRoutes = [
  'web-app/src/app/page.js',
  'web-app/src/app/system/page.js',
  'web-app/src/app/api/analyze/route.js',
  'web-app/src/app/api/history/route.js',
  'web-app/src/app/api/complaints/route.js',
  'web-app/src/app/api/admin/complaints/route.js',
  'web-app/src/app/api/analytics/route.js'
];

for (const route of requiredRoutes) {
  assert.ok(fs.existsSync(path.resolve(route)), `Route file ${route} must exist`);
}

console.log('All Web App routes discovered and validated!');
