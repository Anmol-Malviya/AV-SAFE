# AV-SAFE Web Application

Full-stack real-time threat intelligence dashboard and landing experience built with Next.js 16 (App Router) and React 19.

## Architecture

- **App Router**: `src/app/` (`/` landing page, `/system` active dashboard, `/api` serverless threat route handlers).
- **Modular Components**: `src/components/` (Landing sections, URL checker, Email analyzer, QR scanner, Analytics, Threat reports, Safe sandbox).
- **Services & Hooks**: `src/services/` and `src/hooks/` for network telemetry and client-side API integrations.
- **Backend Domain Integration**: Connects to `@backend/*` modules via lightweight re-exports in `src/lib/`.
- **Offline ML Inference**: Client-side heuristic and logistic regression inference via `src/lib/phishingEngine.js` with weights in `src/lib/phishing_model_weights.json`.

## Development & Build

```bash
# Run development server
npm run dev

# Run linting
npm run lint

# Production build
npm run build
```
