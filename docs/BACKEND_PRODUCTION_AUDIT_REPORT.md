# STRICT PRODUCTION-GRADE BACKEND QUALITY AUDIT REPORT

**Project:** AV-SAFE (Phish-Guard Backend Infrastructure)  
**Audit Date:** 2026-11-26  
**Auditor:** Principal Backend Engineer & Senior DevSecOps / AppSec Auditor  
**Repository Working Directory:** `/Users/hritikjaiswal/Desktop/rd/AV-SAFE`  
**Execution Environment:** macOS Apple Silicon (`aarch64`), Node v22.23.4, npm 10.9.9, Python 3.12 (uv)  

---

## A. EXECUTIVE SUMMARY

### Overall Backend Quality
AV-SAFE is an asynchronous security telemetry and phishing detection backend built natively on Next.js 16 (App Router) with Node.js and MongoDB (via Mongoose 9). The application serves multiple clients including an Android application (`com.phishguard`), a Chromium Manifest V3 browser extension, and a Next.js web application.

The codebase exhibits thoughtful, defense-in-depth engineering principles in several security domains:
- **SSRF Mitigation**: Custom IPv4/IPv6 private/reserved IP filtering (`isPrivateOrReservedIP`) preventing request forgery to cloud metadata (`169.254.169.254`, `metadata.google.internal`) and RFC 1918 subnets.
- **Resource Exhaustion Defense**: Strict streaming body limits (512 KB payload cutoff), `AbortController` timeouts (4000ms), and `redirect: 'manual'` to prevent redirect hops into internal networks.
- **Input Sanitization**: Extensive validation rules on incoming reports with schema bounded lengths and regex escaping for search queries.

However, the backend currently possesses **several critical, blocking production failure points** that prevent any live deployment in its current state.

### Production Readiness Verdict
**CRITICAL SECURITY / RELIABILITY RISKS — NOT PRODUCTION READY**

### Most Critical Risks & Blocking Failures
1. **P0 / Blocker — Production Build & Test Failure (Broken Dependency Import):**
   In commit `313618e7` (`chore: move backend/ml to root ml-service`), `backend/ml` was relocated to `ml-service/`. However, `backend/services/phishingEngine.js` line 1 imports `import modelWeights from '../ml/weights/phishing_model_weights.json' with { type: 'json' };`. This file path no longer exists under `backend/`. As a direct consequence, `npm run build` fails immediately with `Module not found: Can't resolve '../ml/weights/phishing_model_weights.json'`, and integration test suites (`test_integration.js`, `test_pipeline_e2e.js`) crash with `ERR_MODULE_NOT_FOUND`.
2. **P0 / High Security Risk — Hardcoded Default Admin Secret & Predictable Key:**
   `backend/middleware/requireAdmin.js` sets a fallback key: `DEFAULT_DEV_ADMIN_KEY = 'phishguard-secops-admin-key-2026'`. If `ADMIN_SECRET_KEY` is omitted in any environment, this public secret is active. Furthermore, key comparison is performed via plain string equality (`providedKey !== configuredAdminKey`) rather than a constant-time comparison (`crypto.timingSafeEqual`), exposing the admin auth gate to timing attacks.
3. **P1 / High Security Risk — Wildcard Permissive CORS on Admin Endpoints:**
   `web-app/next.config.mjs` configures global API headers: `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`, and `Access-Control-Allow-Headers: X-Requested-With, Content-Type, Authorization, x-admin-key`. This allows cross-origin requests from any untrusted website to probe `/api/admin/complaints` and submit arbitrary requests.
4. **P1 / Data Integrity & Reliability — In-Memory Rate Limiting in Serverless Architecture:**
   The rate limiter (`backend/middleware/rateLimit.js`) uses an in-memory `Map` (`ipHits`). In production (Vercel, AWS Lambda, Kubernetes multi-replica containers), instances do not share memory. Each serverless invocation or replica spins up an empty map, allowing malicious actors to bypass rate limits completely.
5. **P1 / Data Integrity & Race Conditions in Duplicate Handling:**
   In `/api/history` and `/api/complaints`, duplicate URL replacement is implemented via non-atomic sequences: `await UrlScan.deleteMany(...)` followed by `await UrlScan.create(...)`. Under concurrent requests, this creates race conditions, temporary empty reads, and duplicate entries.
6. **P1 / Unauthenticated Bulk Scan Deletion:**
   The `DELETE /api/history` route connects to MongoDB and executes `await UrlScan.deleteMany({})` with **zero authentication or authorization**. Anyone on the public internet can wipe the entire URL scan database with a single HTTP `DELETE` call.

---

## B. TECHNOLOGY STACK ANALYSIS

| Component | Identified Version | Production Viability Assessment |
| :--- | :--- | :--- |
| **Runtime Environment** | Node.js v22.23.4 (macOS Darwin aarch64) | Production viable; Node 22 LTS supported. |
| **Framework** | Next.js 16.2.10 (App Router, Turbopack) | Latest Next.js release; Turbopack build engine. |
| **UI Engine** | React 19.2.4 & React-DOM 19.2.4 | Modern React server components architecture. |
| **Database Driver / ODM** | Mongoose 9.7.3 / MongoDB Atlas | Modern Mongoose v9; handles document schemas and query casting. |
| **Network & Security** | Built-in Node `dns`, `https`, `net`, `fetch` | Zero external network dependencies, minimizing supply-chain attack surface. |
| **Styling & Icons** | Tailwind CSS v4, Lucide React 1.23.0 | Modern utility CSS and vector icons. |
| **Machine Learning** | Python 3.12, scikit-learn, LightGBM, XGBoost | Standalone Python training service exporting JSON weights for JS inference. |

---

## C. ARCHITECTURE ASSESSMENT

### Current Architecture Overview
The repository follows a multi-service structure:
- `backend/`: Core domain logic (`controllers/`, `services/`, `models/`, `middleware/`, `validators/`, `config/`, `security/`).
- `web-app/`: Next.js 16 frontend and API endpoints (`src/app/api/`). `web-app/src/lib/` re-exports modules from `@backend/`.
- `ml-service/`: Python training and evaluation pipeline for offline heuristic and tree model weight generation.
- `extension/`: Chromium Manifest V3 browser extension communicating with `/api/analyze` and `/api/complaints`.
- `android-app/`: Native Android application interacting with backend endpoints.
- `testing/`: Unit and integration test suites.

### Architectural Strengths
1. **Clean Re-export Layer**: `web-app/src/lib/` maps cleanly to `@backend/*` via jsconfig and Next.js Turbopack aliases.
2. **Offline Zero-Latency Phishing Engine**: Model weights are packaged as static JSON, allowing sub-millisecond heuristic scoring without expensive external inference calls.
3. **Decoupled Anti-SSRF Architecture**: Network probes perform DNS resolution first, inspect IP octets against reserved CIDRs, and abort connection prior to TLS/HTTP handshakes.

### Architectural Weaknesses & Flaws
1. **Dual / Disconnected Logic Paths (Controllers vs Route Handlers)**:
   There is architectural divergence between `backend/controllers/` and `web-app/src/app/api/`. For example:
   - `web-app/src/app/api/complaints/route.js` directly implements complaint creation and idempotency logic rather than calling `backend/controllers/complaintsController.js`.
   - `backend/controllers/complaintsController.js` has its own `createComplaint()` and `listComplaints()` implementations which are **dead code / unused by Next.js routes**.
   - `backend/controllers/analyticsController.js` has a syntax import error (`import Complaint from '../models/Complaint';` lacking `.js` extension required by ESM `"type": "module"`).
2. **Missing Backend ML Weights Directory**:
   After the reorganization to `ml-service/`, `backend/services/phishingEngine.js` was not updated to reference the new weight path (`../../ml-service/weights/...` or internal asset path).
3. **DNS Hardcoding in Application Code**:
   `backend/config/mongodb.js` executes `dns.setServers(['8.8.8.8', '1.1.1.1'])`. In enterprise environments or behind corporate proxies, overriding DNS servers will fail or violate network egress policies.

---

## D. COMPLETE API QUALITY AUDIT

Below is the verified audit of every API endpoint in the backend:

| Endpoint | Method | Auth Required | Rate Limited | Input Validation | Status Codes | Findings & Production Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `/api/analyze` | `POST` | None (Public) | ❌ No | ✅ Comprehensive URL validation | `200, 400, 403, 500` | **PASS WITH CONCERNS:** Excellent anti-SSRF defenses. However, lacks IP rate limiting, enabling attackers to trigger unbounded external DNS and TLS handshakes (DDoS amplification/resource exhaustion). |
| `/api/history` | `GET` | None (Public) | ❌ No | N/A | `200, 500` | **PASS WITH CONCERNS:** Hard-limited to 100 entries. Missing pagination parameters (`page`, `limit`). |
| `/api/history` | `POST` | None (Public) | ❌ No | ✅ URL & rating validation | `200, 400, 500` | **MEDIUM RISK:** Allows unauthenticated callers to write arbitrary scan history entries and delete existing ones (`deleteMany({ url })`). Non-atomic race condition. |
| `/api/history` | `DELETE` | ❌ None | ❌ No | N/A | `200, 500` | **CRITICAL FLAW (P0):** Zero authentication required. Public unauthenticated users can purge the entire `UrlScan` collection. |
| `/api/complaints` | `POST` | None (Guest) | ✅ (15 req/5m) | ✅ Schema validator | `200, 201, 400, 429, 500` | **PASS WITH CONCERNS:** Validates categories, handles idempotency, limits IP submissions. Uses in-memory map which resets on serverless cold starts. |
| `/api/complaints` | `GET` | ❌ None (query param `id`) | ❌ No | ✅ ID check | `200, 401, 404, 500` | **PASS:** Returns single public complaint status while stripping `adminNotes` and `clientIp`. Rejects list queries with 401. |
| `/api/admin/complaints` | `GET` | ✅ Admin Secret | ❌ No | ✅ Regex sanitized query | `200, 401, 403, 500` | **PASS WITH CONDITIONS:** Pagination supported (`page`, `limit` capped at 100). Sensitive to default hardcoded key if env unset. |
| `/api/admin/complaints` | `PATCH` | ✅ Admin Secret | ❌ No | ✅ Status & notes validation | `200, 400, 401, 403, 404, 500` | **PASS WITH CONDITIONS:** Validates status enums and notes length. String comparison vulnerable to timing attacks. |
| `/api/admin/complaints/[complaintId]` | `GET` | ✅ Admin Secret | ❌ No | ✅ Parameter check | `200, 400, 401, 403, 404, 500` | **PASS:** Clean detail query for administrative review. |
| `/api/admin/complaints/[complaintId]` | `PATCH` | ✅ Admin Secret | ❌ No | ✅ Status & notes validation | `200, 400, 401, 403, 404, 500` | **PASS:** Updates review status and triage notes. |
| `/api/analytics` | `GET` | None (Public) | ❌ No | N/A | `200, 500` | **PASS WITH CONCERNS:** Capped at 500 scans and 500 complaints. Computes metrics in memory. CPU intensive on high volumes. |

---

## E. SECURITY AUDIT (OWASP API TOP 10 & APPSEC)

### Finding SEC-01: Hardcoded Default Admin Secret Fallback
- **Severity:** High (CVSS: 7.5 - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`)
- **Affected File:** `backend/middleware/requireAdmin.js` (Lines 14-18)
- **Technical Explanation:**
  ```javascript
  const DEFAULT_DEV_ADMIN_KEY = 'phishguard-secops-admin-key-2026';
  export function getAdminKey() {
    return process.env.ADMIN_SECRET_KEY || DEFAULT_DEV_ADMIN_KEY;
  }
  ```
  If `ADMIN_SECRET_KEY` is not explicitly set in the production environment, the server silently falls back to a publicly known constant.
- **Exploitation Scenario:**
  An attacker inspects GitHub or documentation, identifies `phishguard-secops-admin-key-2026`, and sends:
  ```http
  GET /api/admin/complaints HTTP/1.1
  Host: target.domain
  Authorization: Bearer phishguard-secops-admin-key-2026
  ```
  The server grants full administrative access to all reports, internal notes, and client IPs.
- **Remediation:**
  In production, abort startup or throw an explicit error if `process.env.ADMIN_SECRET_KEY` is undefined. Never fall back to a hardcoded constant in production:
  ```javascript
  export function getAdminKey() {
    if (!process.env.ADMIN_SECRET_KEY) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: ADMIN_SECRET_KEY environment variable is not set.');
      }
      return DEFAULT_DEV_ADMIN_KEY;
    }
    return process.env.ADMIN_SECRET_KEY;
  }
  ```
- **Verification Method:** Send an admin request without setting `ADMIN_SECRET_KEY` in environment; verify the endpoint returns 500/unauthorized instead of 200.

---

### Finding SEC-02: Public Unauthenticated Database Truncation Endpoint
- **Severity:** Critical (CVSS: 8.6 - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:H`)
- **Affected File:** `web-app/src/app/api/history/route.js` (Lines 87-95)
- **Technical Explanation:**
  ```javascript
  export async function DELETE() {
    try {
      await dbConnect();
      await UrlScan.deleteMany({});
      return NextResponse.json({ success: true, message: 'Scan history cleared successfully from database' });
    } catch (err) { ... }
  }
  ```
  The endpoint performs an unconditional database wipe without checking any credentials or authorization tokens.
- **Exploitation Scenario:**
  Any script kid or competitor executes `curl -X DELETE https://target.domain/api/history`, immediately destroying all historical threat intelligence and scan records.
- **Remediation:**
  Require administrative authentication using `verifyAdminAuth(request)` or disable the `DELETE` handler entirely.

---

### Finding SEC-03: Permissive Wildcard CORS on Sensitive Endpoints
- **Severity:** Medium (CVSS: 6.5)
- **Affected File:** `web-app/next.config.mjs` (Lines 29-38)
- **Technical Explanation:**
  ```javascript
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization, x-admin-key' },
        ],
      },
    ];
  }
  ```
  Setting `Access-Control-Allow-Origin: *` across all `/api/:path*` including `/api/admin/*` allows any webpage visited by an admin to issue cross-origin requests.
- **Remediation:**
  Restrict CORS origins to authorized frontend domains, or segregate admin routes away from public wildcard CORS headers.

---

### Finding SEC-04: Non-Constant-Time Secret Comparison (Timing Attack Vulnerability)
- **Severity:** Low (CVSS: 3.7)
- **Affected File:** `backend/middleware/requireAdmin.js` (Line 51)
- **Technical Explanation:**
  ```javascript
  if (providedKey !== configuredAdminKey) { ... }
  ```
  Standard JavaScript `!==` operator performs early-exit string comparisons. Attackers can analyze round-trip response times with high sample counts to deduce characters of the secret key.
- **Remediation:**
  Use `crypto.timingSafeEqual`:
  ```javascript
  import crypto from 'crypto';

  function safeCompare(a, b) {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) {
      crypto.timingSafeEqual(bufA, bufA); // dummy timing normalization
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }
  ```

---

### Finding SEC-05: Missing Rate Limiting on Deep Scanning Endpoint (`/api/analyze`)
- **Severity:** Medium (CVSS: 5.3)
- **Affected File:** `web-app/src/app/api/analyze/route.js`
- **Technical Explanation:**
  `/api/analyze` performs DNS lookups, TLS socket connections, and outbound HTTP requests. Unlike `/api/complaints`, `/api/analyze` has no rate limiter. Attackers can spam `/api/analyze` with thousands of random hostnames, exhausting the server's socket pool, DNS resolver bandwidth, and worker threads.
- **Remediation:**
  Apply `checkRateLimit(clientIp, 30, 60000)` at the start of `POST /api/analyze`.

---

## F. DATABASE & DATA INTEGRITY AUDIT

### 1. Schema Constraints & Indexes
- **`Complaint` Model (`backend/models/Complaint.js`)**:
  - `complaintId`: Indexed, unique.
  - `status, createdAt`: Compound index defined (`{ status: 1, createdAt: -1 }`).
  - `hostname, createdAt`: Compound index defined (`{ hostname: 1, createdAt: -1 }`).
  - **Integrity Concern**: `idempotencyKey` has an index (`index: true`) but is **not set to `unique: true`**. Under heavy concurrency, two identical requests can simultaneously pass the `findOne({ idempotencyKey })` check and create duplicate documents.
- **`UrlScan` Model (`backend/models/UrlScan.js`)**:
  - Contains fields: `url`, `rating`, `score`, `source`, `detectionReasons`, `date`, `createdAt`.
  - **Missing Indexes**: `url` has no index despite frequently being queried with `findOne` and `deleteMany`.
  - `createdAt` has no index in `UrlScan.js`, yet `UrlScan.find({}).sort({ createdAt: -1 })` runs on every history and analytics fetch. On large datasets, this causes full collection scans and in-memory sorting failures (MongoDB 32MB sort memory limit exceeded).

### 2. Race Conditions & Non-Atomic Operations
In both `web-app/src/app/api/history/route.js` (Line 72) and `web-app/src/app/api/complaints/route.js` (Line 95):
```javascript
await UrlScan.deleteMany({ url: targetUrl });
await UrlScan.create({ ... });
```
This is a classic non-atomic delete-then-insert pattern:
1. Between the delete and the insert, a concurrent reader sees no record for `targetUrl`.
2. Two concurrent requests for the same URL can delete, then both create, leaving duplicates.
**Recommended Fix:** Replace with an atomic `findOneAndUpdate`:
```javascript
await UrlScan.findOneAndUpdate(
  { url: targetUrl },
  { $set: { rating, score, source, detectionReasons, date: new Date().toLocaleDateString(), createdAt: new Date() } },
  { upsert: true, new: true }
);
```

### 3. Connection Pooling & DNS Resiliency
In `backend/config/mongodb.js`:
- `bufferCommands: false` is appropriately configured to prevent indefinite buffering during disconnections.
- Global connection caching (`global.mongoose = { conn, promise }`) prevents socket leaks across serverless warm reloads.
- Calling `dns.setServers(['8.8.8.8', '1.1.1.1'])` globally inside the Node process can conflict with container environments (e.g. Docker network DNS `127.0.0.11` or Kubernetes CoreDNS `10.96.0.10`).

---

## G. BUSINESS LOGIC AUDIT

### 1. Phishing Detection Engine Evaluation
The heuristic phishing engine (`backend/services/phishingEngine.js`) inspects:
- URL length, entropy, special characters (`@`, `-`, `_`, `~`, `%`).
- IP address hostnames.
- Brand name typosquatting using memoized Levenshtein distance against known targets (PayPal, Google, Apple, Microsoft, Amazon, etc.).
- Punycode / IDN homograph attacks (`xn--`).
- Multi-level subdomains and suspicious Top-Level Domains (`.top`, `.xyz`, `.cyou`, `.work`, etc.).
- Suspicious keyword combinations in path and query.
- Machine learning feature extraction matching the exported JSON model weights.

**Business Logic Flaw**:
In `backend/controllers/analyticsController.js` (Line 3):
```javascript
import Complaint from '../models/Complaint';
```
In Node.js ECMAScript Module (`"type": "module"`), omitting `.js` causes a fatal runtime `ERR_MODULE_NOT_FOUND` when invoked.

### 2. Inconsistent Logic between Controllers and Routes
- `backend/controllers/complaintsController.js` creates complaint IDs formatted `PG-YYYY-XXXXXX` using a simple `Math.random()`.
- `web-app/src/app/api/complaints/route.js` includes a 5-attempt retry loop to handle collisions, which is omitted in the backend controller.
- The controller accepts `validation.sanitized`, while `validators/complaint.js` returns `{ valid: true, data: { ... } }`, meaning `complaintsController.js` passes `undefined` fields to Mongoose.

---

## H. PERFORMANCE & SCALABILITY AUDIT

1. **Unbounded In-Memory Data Aggregation in `/api/analytics`**:
   The `/api/analytics` route loads up to 500 `UrlScan` documents and 500 `Complaint` documents using `.lean()`, and then performs nested JavaScript array iterations, regular expressions, and brand string matches on every single GET request.
   - **Scalability Limit**: As database volume grows, this operation blocks the Node.js single-threaded event loop and spikes CPU.
   - **Remediation**: Use MongoDB Aggregation Pipelines (`$group`, `$facet`, `$project`) to compute totals, status counts, and distributions inside the database engine.
2. **Missing Caching for Analytics Summary**:
   `/api/analytics` is marked `export const dynamic = 'force-dynamic'`. Every visitor to the dashboard triggers full collection counts and aggregation. It should be cached with Next.js revalidation (e.g. `revalidate = 60`) or Redis.
3. **Levenshtein Distance Memoization Cache**:
   `levenshteinCache` in `phishingEngine.js` is an unbounded in-memory object (`{}`). Over millions of unique URL evaluations, this object will cause memory growth and potential heap exhaustion. It should use an LRU cache with a fixed capacity (e.g., 5,000 entries).

---

## I. TESTING & CODE RELIABILITY

### Test Suite Execution Evidence

Safe test commands were executed directly in the project environment:

#### 1. Root Test Suite (`npm test`)
```bash
> node --test testing/**/*.js

--- Testing Backend Security and Validators ---
✓ All Backend domain tests passed successfully.
✔ testing/backend/test_backend.js (46.89ms)

Running backend security & validation tests...
All backend security & validation unit tests passed successfully!
✔ testing/backend/test_models.js (45.36ms)

--- Testing Chromium MV3 Extension ---
✓ Manifest V3 and extension file integrity validated.
✔ testing/extension/test_extension.js (42.97ms)

Running Chromium Extension Manifest & Asset Validation tests...
Extension Manifest V3 and referenced assets verified successfully!
✔ testing/extension/test_manifest.js (43.23ms)

node:internal/modules/esm/resolve:275
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/hritikjaiswal/Desktop/rd/AV-SAFE/backend/ml/weights/phishing_model_weights.json' imported from /Users/hritikjaiswal/Desktop/rd/AV-SAFE/backend/services/phishingEngine.js
✖ testing/integration/test_integration.js (45.31ms) [FAILED]

Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/hritikjaiswal/Desktop/rd/AV-SAFE/backend/ml/weights/phishing_model_weights.json' imported from /Users/hritikjaiswal/Desktop/rd/AV-SAFE/backend/services/phishingEngine.js
✖ testing/integration/test_pipeline_e2e.js (27.75ms) [FAILED]

Running Web App Route and File Discovery Tests...
All Web App routes discovered and validated!
✔ testing/web/test_routes.js (26.95ms)

Summary: 5 PASSED, 2 FAILED.
```

#### 2. Production Build Execution (`npm run build`)
```bash
> next build
▲ Next.js 16.2.10 (Turbopack)
  Creating an optimized production build ...
Error: Turbopack build failed with 1 errors:
./backend/services/phishingEngine.js:1:1
Module not found: Can't resolve '../ml/weights/phishing_model_weights.json'
```
**Evidence:** The production build fails completely. The system cannot be deployed or started with `next start`.

#### 3. Python ML Test Suite
Executing `python3 -m unittest discover -s testing/ml` failed due to missing `pytest` and `numpy` in the default global interpreter. The virtual environment dependencies for `ml-service` have not been initialized or locked in the repository root.

---

## J. CONFIGURATION & DEPLOYMENT READINESS

| Check | Status | Verification & Evidence |
| :--- | :---: | :--- |
| **Production Build** | ❌ FAILED | Next.js build fails due to missing weights JSON import in `phishingEngine.js`. |
| **CI / CD Pipeline** | ❌ MISSING | No `.github/workflows` or CI configuration exists in the repository. |
| **Docker / Containerization** | ❌ MISSING | No `Dockerfile` or `docker-compose.yml` present for reproducible deployment. |
| **Process Management** | ❌ MISSING | No PM2 configuration, systemd service, or container orchestration manifests. |
| **Health Check Endpoint** | ❌ MISSING | No dedicated `/api/health` or `/api/ready` endpoint verifying database and memory status. |
| **Graceful Shutdown** | ❌ MISSING | Process does not handle `SIGTERM` or `SIGINT` to gracefully disconnect Mongoose. |
| **Structured Logging** | ⚠️ PARTIAL | Standard `console.error` and `console.log` statements; no structured JSON (e.g. Pino / Winston) or request correlation IDs. |
| **Secrets Exposure Check** | ✅ PASSED | No `.env` files committed. No secret strings exposed in git tracking. |

---

## K. TECHNICAL DEBT

1. **Dead Code in `backend/controllers/`**:
   `complaintsController.js`, `historyController.js`, and `analyticsController.js` are largely bypassed because Next.js route handlers in `web-app/src/app/api/` re-implemented the query logic directly. This leads to drift and confusion over which implementation is authoritative.
2. **Duplicated Code between `web-app/src/lib` and `backend/`**:
   Several files in `web-app/src/lib/` only contain 2 lines re-exporting from `@backend/`, while others contain standalone logic.
3. **Missing TypeScript Typing**:
   The entire backend is written in vanilla JavaScript without JSDoc type contracts or TypeScript definitions, making schema refactoring error-prone.

---

## L. PRIORITIZED REMEDIATION PLAN

### Priority 0 — Critical (Must Fix Immediately)

#### Issue SEC-02 / BLK-01: Protect or Remove `DELETE /api/history`
- **Severity:** Critical
- **Location:** `web-app/src/app/api/history/route.js:87-95`
- **Impact:** Unauthenticated full database wipe of threat history.
- **Recommended Fix:** Require admin authentication:
  ```javascript
  import { verifyAdminAuth } from '@/lib/auth/requireAdmin';

  export async function DELETE(request) {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    await dbConnect();
    await UrlScan.deleteMany({});
    return NextResponse.json({ success: true, message: 'Scan history cleared successfully' });
  }
  ```
- **Verification:** Execute `curl -X DELETE http://localhost:3000/api/history` without auth headers; must return `401 Unauthorized`.

#### Issue BUILD-01: Fix Phishing Engine Model Weights Import
- **Severity:** Critical
- **Location:** `backend/services/phishingEngine.js:1`
- **Impact:** Production build completely blocked; integration tests failing.
- **Recommended Fix:** Update the import path to reference the active weights file in `ml-service/weights/phishing_model_weights.json` (or maintain a synchronized copy in `backend/assets/`):
  ```javascript
  import modelWeights from '../../ml-service/weights/phishing_model_weights.json' with { type: 'json' };
  ```
- **Verification:** Run `npm test` and `npm run build` and ensure both exit with code 0.

---

### Priority 1 — High (Must Resolve Before Production Deployment)

#### Issue SEC-01: Eliminate Fallback Secret in Production
- **Location:** `backend/middleware/requireAdmin.js:14-18`
- **Impact:** Administrative bypass if `ADMIN_SECRET_KEY` is not defined in environment.
- **Recommended Fix:** Throw an error in production if `process.env.ADMIN_SECRET_KEY` is missing.

#### Issue SEC-03: Restrict CORS Headers
- **Location:** `web-app/next.config.mjs:29-38`
- **Impact:** Unrestricted cross-origin access to administrative APIs.
- **Recommended Fix:** Configure CORS to reflect authorized domains or remove wildcard access on `/api/admin/*`.

#### Issue DATA-01: Atomic URL Scan Deduplication
- **Location:** `web-app/src/app/api/history/route.js:72-84` and `web-app/src/app/api/complaints/route.js:95-108`
- **Impact:** Race conditions, duplicate records, and inconsistent reads during concurrent requests.
- **Recommended Fix:** Replace `deleteMany()` followed by `create()` with an atomic `findOneAndUpdate({ url }, update, { upsert: true })`.

#### Issue DATA-02: Missing Indexes on `UrlScan`
- **Location:** `backend/models/UrlScan.js`
- **Impact:** Unindexed sort on `createdAt` causes high CPU and slow queries as database grows.
- **Recommended Fix:** Add indexes on `url: 1` and `createdAt: -1`.

---

### Priority 2 — Medium (Reliability, Scalability & Performance)

#### Issue PERF-01: Distributed Rate Limiting via Redis / Upstash
- **Location:** `backend/middleware/rateLimit.js`
- **Impact:** In-memory map fails in multi-container / serverless deployments.
- **Recommended Fix:** Connect to Redis or Upstash for distributed token bucket tracking.

#### Issue PERF-02: MongoDB Aggregations in `/api/analytics`
- **Location:** `web-app/src/app/api/analytics/route.js`
- **Impact:** Event loop blocked by in-memory array manipulation over 1,000 documents.
- **Recommended Fix:** Convert into MongoDB aggregation pipelines with cached response intervals.

---

### Priority 3 — Low (Code Cleanup & Maintainability)

#### Issue CLEAN-01: Reconcile Controller vs Route Handler Duplication
- **Location:** `backend/controllers/`
- **Impact:** Technical debt and dead code.
- **Recommended Fix:** Refactor route handlers to invoke backend controllers directly as single sources of truth.

---

## M. FINAL PRODUCTION READINESS SCORECARD

| Category | Score (0–10) | Weighted Weight | Weighted Score | Evaluation Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Architecture** | 5.5 / 10 | 10% | 0.55 | Good modularity, but disconnected controllers, dead code, and broken path resolution. |
| **API Design** | 6.0 / 10 | 10% | 0.60 | Clean REST conventions, but inconsistent error formats and missing pagination on history. |
| **Security** | 4.0 / 10 | 25% | 1.00 | Strong anti-SSRF; undermined by unauthenticated history deletion, default admin key, and wildcard CORS. |
| **Database & Integrity** | 5.0 / 10 | 15% | 0.75 | Proper Mongoose models; undermined by missing indexes and non-atomic delete-create race conditions. |
| **Business Logic** | 6.5 / 10 | 10% | 0.65 | Sophisticated phishing heuristics and brand spoofing algorithms. |
| **Error Handling** | 6.0 / 10 | 5% | 0.30 | Try-catch blocks in place; lacks centralized error middleware and request IDs. |
| **Performance** | 5.5 / 10 | 10% | 0.55 | In-memory aggregations and unbounded memory caches under heavy load. |
| **Testing** | 4.0 / 10 | 10% | 0.40 | Unit tests pass, but integration test suites crash on import error; missing CI pipeline. |
| **Deployment Readiness** | 2.0 / 10 | 5% | 0.10 | Build fails completely; no Dockerfile, no health check, no process management. |

### Overall Weighted Score: **5.05 / 10.0**

---

## N. FINAL PRODUCTION VERDICT

### **CRITICAL SECURITY / RELIABILITY RISKS — NOT PRODUCTION READY**

**Mandatory Conditions to Clear Before Re-evaluation:**
1. Fix the `phishing_model_weights.json` module import in `backend/services/phishingEngine.js` so that `npm test` and `npm run build` pass without error.
2. Require authentication on `DELETE /api/history` to eliminate the public data-wipe vulnerability.
3. Remove the fallback default administrative key in production.
4. Replace non-atomic `deleteMany` + `create` calls with atomic upsert operations.
5. Add compound indexes on `UrlScan` (`createdAt: -1`, `url: 1`).
6. Restrict CORS headers to authorized production origins.
