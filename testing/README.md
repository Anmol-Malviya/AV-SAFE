# AV-SAFE Comprehensive Testing Suites

Consolidated automated test discovery, unit tests, integration verification, and security compliance tests for all AV-SAFE components.

## Suites & Directories

- `testing/web/`: Web application component, route discovery, and enterprise SecOps API tests (`test_routes.js`, `test_api_endpoints.js`).
- `testing/android/`: Android app manifest, security permissions, native architecture, and rule engine tests (`test_android_architecture.js`).
- `testing/extension/`: Chromium Manifest V3 background service worker, popup, API client, and Clerk authentication tests (`test_manifest.js`, `test_extension.js`, `test_api_client.js`).
- `testing/backend/`: Backend models, controllers, anti-SSRF security, QR security, audit log hashing, and RBAC tests (`test_backend.js`, `test_clerk_auth.js`, `test_secops_modules.js`, `test_models.js`, `test_services_controllers.js`).
- `testing/ml/`: Feature extraction, data pipelines, model export, adversarial cases, and training evaluation tests (`test_features.py`, `test_dataset.py`, `test_adversarial.py`, `test_training.py`, `test_export.py`, `test_evaluation.py`).
- `testing/integration/`: End-to-end integration and telemetry sync verification (`test_integration.js`, `test_pipeline_e2e.js`).

## Running Tests

- **All JavaScript & Node Suites (Extension, Web, Backend, Integration, Android Architecture)**:
  ```bash
  npm test
  ```
- **ML Pipeline (Adversarial & Feature Suites)**:
  ```bash
  ml-service/.venv/bin/pytest -q testing/ml
  ```
- **Android Native Test Suite**:
  ```bash
  cd android-app && ./gradlew test
  ```
