/**
 * Android Architecture and Native Interface Tests
 * Validates Android app structure, Manifest security permissions, and native rules.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Android App: Manifest structure and security configuration', () => {
  const manifestPath = path.resolve('android-app/app/src/main/AndroidManifest.xml');
  assert.ok(fs.existsSync(manifestPath), 'AndroidManifest.xml must exist');

  const content = fs.readFileSync(manifestPath, 'utf8');
  assert.ok(content.includes('android.permission.INTERNET'), 'Must declare INTERNET permission');
  assert.ok(content.includes('.MainActivity'), 'Must declare MainActivity');
  assert.ok(content.includes('.WarningActivity'), 'Must declare WarningActivity');
  assert.ok(content.includes('.SandboxActivity'), 'Must declare SandboxActivity');
});

test('Android App: Gradle build and dependency configuration', () => {
  const buildGradlePath = path.resolve('android-app/app/build.gradle');
  assert.ok(fs.existsSync(buildGradlePath), 'app/build.gradle must exist');

  const content = fs.readFileSync(buildGradlePath, 'utf8');
  assert.ok(content.includes('com.phishguard'), 'Application ID namespace must be com.phishguard');
  assert.ok(content.includes('play-services-code-scanner'), 'Must include Google Play Services code scanner');
  assert.ok(content.includes('junit'), 'Must include JUnit test dependency');
});

test('Android App: Core Kotlin security source files exist', () => {
  const coreFiles = [
    'android-app/app/src/main/java/com/phishguard/MainActivity.kt',
    'android-app/app/src/main/java/com/phishguard/PhishingEngine.kt',
    'android-app/app/src/main/java/com/phishguard/WarningActivity.kt',
    'android-app/app/src/main/java/com/phishguard/ClerkAuthManager.kt',
    'android-app/app/src/main/java/com/phishguard/AppSyncManager.kt',
    'android-app/app/src/main/java/com/phishguard/ComplaintApiClient.kt',
    'android-app/app/src/main/java/com/phishguard/SandboxActivity.kt',
    'android-app/app/src/test/java/com/phishguard/PhishingEngineTest.kt'
  ];

  for (const f of coreFiles) {
    const full = path.resolve(f);
    assert.ok(fs.existsSync(full), `Android file ${f} must exist`);
  }
});

test('Android App: PhishingEngine heuristic rules coverage in Kotlin', () => {
  const enginePath = path.resolve('android-app/app/src/main/java/com/phishguard/PhishingEngine.kt');
  const code = fs.readFileSync(enginePath, 'utf8');

  // Verify essential detection rules are present in native Kotlin implementation
  assert.ok(code.includes('isSafe'), 'PhishingEngine must calculate isSafe');
  assert.ok(code.includes('score'), 'PhishingEngine must compute score');
  assert.ok(code.includes('rating'), 'PhishingEngine must evaluate rating');
  assert.ok(code.includes('DANGEROUS'), 'PhishingEngine must support DANGEROUS status');
  assert.ok(code.includes('SAFE'), 'PhishingEngine must support SAFE status');
});
