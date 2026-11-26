# AV-SAFE — Clerk Authentication Architecture & Security Integration Report

**Date:** 2026-11-26  
**Document Version:** 1.0.0  
**Security Classification:** Confidential / Production SecOps  
**Author:** Principal Full-Stack & Authentication Architect  
**Repository:** [https://github.com/Anmol-Malviya/AV-SAFE](https://github.com/Anmol-Malviya/AV-SAFE)  

---

## Executive Summary

This engineering report documents the production-grade integration of **Clerk Authentication** across the entire AV-SAFE threat defense ecosystem. Prior to this integration, AV-SAFE relied on an unauthenticated client telemetry model paired with a static `ADMIN_SECRET_KEY` credential for administrative complaint reviews. Scan telemetry in `/api/history` lacked tenancy boundaries, enabling arbitrary clients to view system-wide URLs.

Through this implementation, a unified, cross-platform identity system has been established spanning the **Next.js 16 Web Dashboard**, the **Android Native Application**, the **Chromium Manifest V3 Browser Extension**, and the **SecOps Backend APIs**. Core threat intelligence, offline heuristics, machine learning inference, anti-SSRF protections, and public guest complaint triage remain fully intact and operational.

---

## 1. Initial Authentication Audit & Discovered Vulnerabilities

Prior to modification, a comprehensive audit of all repository modules revealed the following architectural risks:

1. **Global Scan History Exposure (`/api/history` GET):**
   - The endpoint retrieved all recent records from `UrlScan` across all devices without filtering by ownership.
   - Any guest or unprivileged browser extension could inspect links scanned by other users.
2. **Global URL Upsert Collision (`/api/history` POST):**
   - `UrlScan.findOneAndUpdate` keyed strictly on `{ url: validUrl.originalUrl }`. If two separate users scanned the same URL, the record was overwritten rather than tracking isolated scan events.
3. **Static Secret Key Dependency (`ADMIN_SECRET_KEY`):**
   - SecOps administration depended on an API key header (`x-admin-key` or `Bearer <ADMIN_SECRET_KEY>`). While functional for emergency machine-to-machine integrations, it lacked user accountability, identity federation, audit logging, and session revocation.
4. **Client-Controlled User Identity (`/api/complaints` POST):**
   - Request payloads could theoretically submit arbitrary `userId` and `reporterType` attributes, introducing identity impersonation risks.
5. **Permissive CORS Header Configuration:**
   - Public APIs utilized `Access-Control-Allow-Origin: *` without declaring allowed headers for `Authorization`, `x-admin-key`, or `PATCH`/`DELETE` methods.

---

## 2. Target Architecture & Identity Model

### 2.1 Unified Identity Flow

```mermaid
flowchart TD
    subgraph Clients
        Web["Web Dashboard (Next.js 16 App Router)"]
        Android["Android Native Browser (Kotlin)"]
        Extension["Chromium Extension (MV3)"]
        Guest["Anonymous / Offline Users"]
    end

    subgraph IdentityProvider["Clerk Identity Provider (app_3MeHezNBB0HluK4cE0oamyUC4hh)"]
        ClerkFAPI["Clerk Frontend API / OAuth / Sessions"]
        ClerkJWT["Cryptographic JWT Minting & JWKS"]
    end

    subgraph BackendGateway["AV-SAFE Next.js 16 Gateway & Backend Middleware"]
        Proxy["proxy.ts (clerkMiddleware)"]
        AuthMiddleware["authMiddleware.js (requireAuth / requireRole)"]
        ClerkService["clerkAuthService.js (@clerk/backend)"]
    end

    subgraph Storage["MongoDB Application Database"]
        UserModel[("Users (clerkUserId, role, status)")]
        ScanModel[("UrlScans (userId, ownerUserId, isolated indexes)")]
        ComplaintModel[("Complaints (verified userId, reporterType)")]
    end

    Web -->|Next.js Session Cookie| Proxy
    Android -->|Bearer Token (FAPI session)| AuthMiddleware
    Extension -->|Bearer Token (Storage session)| AuthMiddleware
    Guest -->|Public Scans & Complaints| AuthMiddleware

    Proxy --> AuthMiddleware
    AuthMiddleware --> ClerkService
    ClerkService --> ClerkJWT
    AuthMiddleware --> UserModel
    AuthMiddleware --> ScanModel
    AuthMiddleware --> ComplaintModel
```

### 2.2 Cross-Platform Session Flow

1. **Web Dashboard:**
   - Protected routes (`/system`, `/system/settings`, `/system/profile`) are safeguarded at the edge via `web-app/src/proxy.ts` using Next.js 16 `clerkMiddleware()`.
   - `<ClerkProvider>` is mounted inside `<body>` with custom SecOps dark theming.
   - Dynamic user state rendered via Clerk Core 3 `<Show when="signed-in">` and `<Show when="signed-out">`.
2. **Android Application:**
   - Managed via `ClerkAuthManager.kt` using secure private `SharedPreferences` and Clerk Frontend API (FAPI).
   - `AppSyncManager.kt` and `ComplaintApiClient.kt` attach `Authorization: Bearer <token>` automatically when an active session exists.
   - Offline detection and threat warnings function uninterrupted even when network or Clerk is unreachable.
3. **Chrome Extension (MV3):**
   - Managed via `extension/clerkAuth.js` and `apiClient.js` with `chrome.storage.local`.
   - Manifest V3 permissions updated to include `cookies` and host permissions for `*.clerk.accounts.dev` and `*.clerk.com`.
   - Real-time heuristic detection and local sandbox warning flows remain operational in guest mode.

---

## 3. Database Schema & Data Ownership Migration

### 3.1 New `User` Collection (`backend/models/User.js`)
- `clerkUserId`: String, unique, indexed. Primary foreign identifier.
- `email`: String, indexed, lowercase.
- `firstName`, `lastName`, `imageUrl`: Profile attributes.
- `role`: Enum `['USER', 'ANALYST', 'ADMIN', 'SUPER_ADMIN']`, default `'USER'`.
- `status`: Enum `['ACTIVE', 'SUSPENDED']`, default `'ACTIVE'`.
- `lastLoginAt`: Date.

### 3.2 Updated `UrlScan` Collection (`backend/models/UrlScan.js`)
- Added `userId`: String, default `null`, indexed.
- Added `ownerUserId`: String, default `null`, indexed.
- Added compound indexes: `{ userId: 1, createdAt: -1 }` and `{ userId: 1, url: 1 }`.
- **Query Isolation:** Authenticated users only receive records matching their verified `userId`. Guest queries only retrieve anonymous records (`userId: null`).

### 3.3 Updated `Complaint` Collection (`backend/models/Complaint.js`)
- Added compound index: `{ userId: 1, createdAt: -1 }`.
- `reporterType`: Strictly computed on the server (`'AUTHENTICATED'` if valid token provided; `'GUEST'` otherwise). Client-supplied claims are ignored.
- Public lookup (`/api/complaints?id=PG-...`) sanitizes administrative notes and client IP addresses while returning legitimate tracking status.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Endpoint | Method | Required Access | Policy Enforcement |
|:---|:---|:---|:---|
| `/api/analyze` | POST | GUEST or USER+ | Heuristic, ML inference, and anti-SSRF inspection. |
| `/api/history` | GET | GUEST (isolated null) / USER (own records) / ANALYST+ (all via ?scope=all) | Scoped database query based on verified identity. |
| `/api/history` | POST | GUEST or USER+ | Scoped upsert keyed by `{ url, userId }`. |
| `/api/history` | DELETE | ADMIN / SUPER_ADMIN | Purges historical telemetry. Denied for ordinary users. |
| `/api/complaints` | POST | GUEST or USER+ | Validated and rate-limited. Server computes `reporterType`. |
| `/api/complaints?id=...` | GET | Public | Sanitized single-incident status lookup. |
| `/api/complaints` | GET | USER (own reports) / ANALYST+ (all via admin) | Scoped personal triage. |
| `/api/analytics` | GET | ANALYST / ADMIN / SUPER_ADMIN | Aggregated attack vectors and intelligence statistics. |
| `/api/admin/complaints` | GET | ANALYST / ADMIN / SUPER_ADMIN | Full administrative triage queue with pagination. |
| `/api/admin/complaints` | PATCH | ANALYST / ADMIN / SUPER_ADMIN | SecOps verdict status updates and analyst notes. |
| `/api/admin/complaints/[id]` | GET/PATCH | ANALYST / ADMIN / SUPER_ADMIN | Incident detail management and review. |

---

## 5. Security Hardening & Edge Verifications

1. **Token Forgery Prevention:**
   - Cryptographic JWT verification via `@clerk/backend` `authenticateRequest()`.
   - Verified claims extracted directly from `requestState.toAuth()`.
2. **IDOR & Cross-Tenant Protection:**
   - Every read and write to `/api/history` and `/api/complaints` binds directly to `auth.userId`.
3. **Emergency M2M Access Preservation:**
   - In `backend/middleware/authMiddleware.js`, `requireRole` supports fallback verification against `ADMIN_SECRET_KEY` using timing-safe comparisons (`crypto.timingSafeEqual`) for automated CLI tools or emergency break-glass procedures.
4. **CORS Hardening:**
   - `web-app/next.config.mjs` configures allowed methods (`GET, POST, PATCH, DELETE, OPTIONS`) and headers (`Authorization, Content-Type, X-Requested-With, x-admin-key`).

---

## 6. Verification and Build Results

### 6.1 Unit & Integration Test Suite
```bash
> node --test testing/**/*.js

✔ testing/backend/test_backend.js (51ms)
✔ Clerk Auth Middleware: Role Hierarchy Verification (0.34ms)
✔ Database Schema: User Model Schema Validation (0.08ms)
✔ Database Schema: UrlScan Ownership Isolation Verification (0.04ms)
✔ Database Schema: Complaint Ownership & Reporter Types (0.04ms)
✔ testing/backend/test_models.js (45ms)
✔ testing/extension/test_extension.js (52ms)
✔ testing/extension/test_manifest.js (44ms)
✔ testing/integration/test_integration.js (62ms)
✔ testing/integration/test_pipeline_e2e.js (45ms)
✔ testing/web/test_routes.js (52ms)
ℹ tests 11, suites 0, pass 11, fail 0
```

### 6.2 Next.js 16 Production Build (Turbopack)
```bash
▲ Next.js 16.2.10 (Turbopack)
✓ Compiled successfully in 5.7s
✓ Generating static pages using 5 workers (8/8) in 204ms
Route (app)
├ ○ /
├ ƒ /api/admin/complaints
├ ƒ /api/admin/complaints/[complaintId]
├ ƒ /api/analytics
├ ƒ /api/analyze
├ ƒ /api/complaints
├ ƒ /api/history
├ ƒ /sign-in/[[...sign-in]]
├ ƒ /sign-up/[[...sign-up]]
├ ○ /system
└ ○ /system/profile
ƒ Proxy (Middleware)
```

---

## 7. Environment Variables & Deployment Guide

Configure the following environment variables across deployment environments (e.g. Vercel Project Settings, Docker, or Kubernetes secrets):

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YW1wbGUtZWZ0LTk4MjIuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_Jp6hAMzu7QqtBjflMrgRK9YZKWRkUDjfeBakBJrbDI

# Optional Networkless JWT Verification
# CLERK_JWT_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8...

# Database Connection
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/phishguard?retryWrites=true&w=majority

# App & Allowed Origins for Extension / Web
NEXT_PUBLIC_APP_URL=https://av-safe.vercel.app
APP_ALLOWED_ORIGINS=https://av-safe.vercel.app,http://localhost:3000,chrome-extension://*

# Emergency / Machine-to-Machine Secret Key
ADMIN_SECRET_KEY=your-high-entropy-secops-admin-secret
```

---

## 8. Remaining Manual Clerk Dashboard Configuration

To complete external identity linking in production:
1. Navigate to [Clerk Dashboard](https://dashboard.clerk.com/) for application `app_3MeHezNBB0HluK4cE0oamyUC4hh`.
2. Under **Configure > User & Authentication > Native Applications**, verify that Native API access is enabled for Android.
3. Under **Configure > Domains & Allowed Origins**, add the Chrome Extension ID URL format:
   ```
   chrome-extension://<EXTENSION_ID>
   ```
4. Assign SecOps staff the `ANALYST` or `ADMIN` role under user **Public Metadata**:
   ```json
   {
     "role": "ADMIN"
   }
   ```

---

## 9. Rollback Plan

If a catastrophic upstream identity provider outage occurs:
1. Revert `web-app/src/proxy.ts` to pass requests through unconditionally.
2. In `backend/middleware/authMiddleware.js`, set `{ optional: true }` as the default for `requireAuth`.
3. Fallback to `ADMIN_SECRET_KEY` via `x-admin-key` header to ensure administrative operations remain accessible during emergencies.
