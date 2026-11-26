# Backend API Specifications & Endpoints

AV-SAFE REST API route handlers execute via Next.js server route handlers at `src/app/api/`:

| Endpoint | Method | Responsibility | Backend Module |
| :--- | :---: | :--- | :--- |
| `/api/analyze` | `POST` | Active deep inspection (DNS resolution, TLS validation, DOM inspection with anti-SSRF guards) | `backend/middleware/urlValidation.js` |
| `/api/history` | `GET`, `POST` | Scan telemetry ingestion and retrieval | `backend/models/UrlScan.js` |
| `/api/complaints` | `GET`, `POST` | Idempotent threat reporting and user complaints | `backend/validators/complaint.js`, `backend/middleware/rateLimit.js`, `backend/models/Complaint.js` |
| `/api/admin/complaints` | `GET` | Administrative complaint triage | `backend/middleware/requireAdmin.js`, `backend/models/Complaint.js` |
| `/api/admin/complaints/[id]` | `PATCH` | Update complaint review status | `backend/middleware/requireAdmin.js`, `backend/models/Complaint.js` |
| `/api/analytics` | `GET` | Aggregate security and scan telemetry statistics | `backend/models/UrlScan.js`, `backend/models/Complaint.js` |

For detailed architectural and security specifications, see [BACKEND_SPECIFICATION.md](../../docs/api/BACKEND_SPECIFICATION.md).
