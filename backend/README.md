# AV-SAFE Backend Domain Architecture

Modular backend services, data models, validators, controllers, and security middleware.

## Structure

```text
backend/
├── api/             # API routing specifications and OpenAPI schemas
├── controllers/     # Request handlers & domain business logic
│   ├── analyticsController.js
│   ├── complaintsController.js
│   └── historyController.js
├── services/        # Core threat detection engines & business rules
│   └── phishingEngine.js
├── models/          # Mongoose database models
│   ├── Complaint.js
│   └── UrlScan.js
├── middleware/      # Anti-SSRF, rate-limiting, and admin auth guards
│   ├── rateLimit.js
│   ├── requireAdmin.js
│   └── urlValidation.js
├── config/          # MongoDB Atlas cached connection pool
│   └── mongodb.js
├── validators/      # Payload sanitizers & schema validators
│   └── complaint.js
├── security/        # Security layer bridges
│   ├── adminAuth.js
│   ├── antiSSRF.js
│   └── rateLimiter.js
└── ml/              # Machine learning pipelines, features & training scripts
```

## Environment Variables

All database connections and credentials are strictly loaded via environment variables:
- `MONGODB_URI`: MongoDB Atlas or local connection URI.
- `ADMIN_SECRET_KEY`: High-entropy key for SecOps administrative endpoints.
