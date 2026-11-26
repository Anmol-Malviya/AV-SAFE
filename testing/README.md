# AV-SAFE Comprehensive Testing Suites

Consolidated automated test discovery and execution for all components:

## Suites & Directories

- `testing/web/`: Web application component, UI, and API route tests.
- `testing/android/`: Android instrumentation, unit, and rule engine tests.
- `testing/extension/`: Chromium Manifest V3 background service and popup tests.
- `testing/backend/`: Backend models, controllers, and anti-SSRF security tests.
- `testing/ml/`: Feature extraction, data pipelines, model export, and training evaluation tests.
- `testing/integration/`: End-to-end integration and telemetry sync verification.

## Running Tests

- **ML Pipeline**: `pytest -q testing/ml`
- **Web App**: `npm --prefix web-app run test` or `npm --prefix web-app run lint`
- **Android**: `cd android-app && ./gradlew test`
