# AV-SAFE — Threat Intelligence & Adaptive Phishing Defense System

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black?style=flat-square&logo=next.js)](./web-app)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black)](./web-app)
[![Chromium Extension](https://img.shields.io/badge/Chrome_MV3-Extension-1D4ED8?style=flat-square&logo=googlechrome&logoColor=white)](./extension)
[![Android](https://img.shields.io/badge/Android-Kotlin-16A34A?style=flat-square&logo=android&logoColor=white)](./android-app)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-15803D?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)

AV-SAFE is an enterprise-grade multi-platform cybersecurity platform that protects users against phishing scams, brand spoofing, malicious QR codes, and evasive social engineering attacks in real time.

---

## 1. System Architecture

```text
AV-SAFE/
│
├── web-app/           # Next.js 16 full-stack dashboard, API routes & landing UI
├── android-app/       # Native Android (Kotlin) app with real-time intent interception
├── extension/         # Chromium Manifest V3 extension with active URL guard
├── backend/           # Modular services, models, validators, controllers & ML engine
├── docs/              # Architectural specs, API documentation, ML reports & assets
├── testing/           # Unified automated test discovery across web, backend, ext & ML
└── README.md          # Comprehensive root documentation and system runbook
```

---

## 2. Directory Responsibilities

### `web-app/`
- Full-stack dashboard with Next.js 16 (App Router) and React 19.
- Interactive threat scanners: URL analyzer, email header parser, QR code scanner, and isolated sandbox iframe simulator.
- Serverless API routes: Active SSRF-safe DNS/TLS probe (`/api/analyze`), telemetry logging (`/api/history`), incident reporting (`/api/complaints`), and analytics (`/api/analytics`).

### `android-app/`
- Native Kotlin Android application (`com.phishguard`).
- System-wide browser intent interception via `android.intent.action.VIEW`.
- Local offline heuristic and logistic regression inference via `PhishingEngine.kt`.
- Safe isolated sandbox browser preview (`SandboxActivity.kt`) and threat triage reporting.

### `extension/`
- Chromium Manifest V3 browser extension.
- Active background tab interception via `chrome.tabs.onUpdated` and declarative rule filters.
- Zero-latency heuristic scoring and machine learning inference directly inside `phishingEngine.js`.
- High-risk redirect interception, warning pages, and sandbox inspection.

### `backend/`
- Centralized domain architecture housing MongoDB Mongoose models (`UrlScan.js`, `Complaint.js`).
- Anti-SSRF private IP validation and token-bucket sliding-window rate limiters (`backend/middleware/`).
- Threat intelligence services (`phishingEngine.js`) and incident controllers (`backend/controllers/`).
- Full offline ML training, feature extraction, evaluation, and weights synchronization pipelines (`backend/ml/`).

### `docs/`
- Comprehensive architecture diagrams, telemetry data flow, and SecOps runbooks (`docs/architecture/`).
- REST API specification and endpoint documentation (`docs/api/`).
- ML model training benchmarks, confusion matrices, and ROC/PR curves (`docs/ml/`).
- Developer setups, deployment checklists, and security policies (`docs/development/`, `docs/deployment/`, `docs/security/`).

### `testing/`
- Consolidated automated test suites for Web, Android, Extension, Backend, ML, and Integration layers (`testing/`).

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Web Dashboard** | Next.js 16.2.10, React 19.2.4, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons |
| **Android App** | Kotlin, Android SDK 34, ViewBinding, OkHttp 4.12, Gson, Material Components |
| **Browser Extension** | Chromium Manifest V3, WebExtensions API, HTML5/CSS3, JavaScript (ES2022) |
| **Backend & APIs** | Node.js (ESM), Next.js Serverless Route Handlers, Mongoose 9.7.3, DNS/TLS inspection |
| **Database** | MongoDB Atlas / Local MongoDB with connection pooling and DNS caching |
| **Machine Learning** | Scikit-Learn, LightGBM, XGBoost, Pandas, Numpy, 24-feature lexical extractor |

---

## 4. Getting Started & Installation

### Prerequisites

- **Node.js**: `>= 20.0.0` (Recommended: v22.x)
- **Package Manager**: `npm`
- **Python**: `>= 3.10` (for ML pipelines; recommended: `uv`)
- **Android Studio / SDK**: Android SDK 34, JDK 17 (for Android build)

### Environment Configuration

Create a `.env` file in the root or inside `web-app/`:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/phishguard?retryWrites=true&w=majority

# Administrative SecOps Key
ADMIN_SECRET_KEY=your-high-entropy-admin-secret-key-here

# Next.js Public Origin
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Running the Applications

### Web Application

```bash
# From repository root
npm run dev

# Or directly from web-app/
cd web-app
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the landing page or [http://localhost:3000/system](http://localhost:3000/system) for the live threat intelligence console.

### Chrome Extension

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** on in the top right.
3. Click **Load unpacked** and select the `extension/` directory.

### Android Application

```bash
cd android-app
./gradlew assembleDebug
```

Output APK will be generated at `android-app/app/build/outputs/apk/debug/app-debug.apk`.

---

## 6. Testing Instructions

Run automated test suites across all components:

```bash
# Run Node.js backend, extension, web and integration test suites
npm test

# Run ML pipeline unit tests
uv run --with pytest --with pandas --with numpy --with pyyaml --with scikit-learn pytest -q testing/ml

# Run Android unit tests
cd android-app && ./gradlew test
```

---

## 7. Security Architecture

1. **Strict Zero Hardcoded Secrets**: All database connection strings and administration keys are strictly supplied through environment variables.
2. **Anti-SSRF Protection Engine**: Active network probes strictly block private IPv4/IPv6 ranges (e.g. `127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, AWS IMDS `169.254.169.254`).
3. **Sliding-Window Rate Limiting**: In-memory token-bucket rate limiter prevents abuse of complaint ingestion and deep scan APIs.
4. **Isolated Sandbox Previews**: High-threat URLs are stripped of cookies and executed inside isolated iframe environments with strict sandbox attributes.

---

## 8. License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
