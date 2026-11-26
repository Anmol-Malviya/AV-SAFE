# Development Guide — AV-SAFE

## Prerequisites
- Node.js >= 18.18.0 (Recommended: Node 22.x)
- Python 3.12+ (managed with `uv`)
- Java JDK 17+ and Android SDK (for native Android app build)

## Local Development Setup

### 1. Web & Backend Application
Install dependencies and run the Next.js Turbopack development server:
```bash
npm install
npm run dev
```
Access the application at [http://localhost:3000](http://localhost:3000).

### 2. Machine Learning Pipeline
Navigate to `ml/` and activate the virtual environment:
```bash
cd ml
uv venv .venv --python python3
source .venv/bin/activate
uv pip install -r requirements.txt pytest pyyaml
```
Run tests:
```bash
pytest -q tests
```

### 3. Chromium Extension
1. Open Chrome/Chromium and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select the `extension` folder.

### 4. Native Android Application
To build and install via USB debugging:
```bash
# On Windows:
scripts\build-and-install-usb.bat

# Or using Gradle directly:
cd android-app
./gradlew assembleDebug
```
