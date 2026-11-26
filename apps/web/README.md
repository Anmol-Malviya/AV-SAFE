# Web Application (Next.js 16)

The web application is located in `apps/web/` using Next.js 16 (App Router) and React 19:
- **Pages & Routes**: `apps/web/src/app/`
- **UI Components**: `apps/web/src/app/components/`
- **Static Assets**: `apps/web/public/`
- **API Endpoints**: `apps/web/src/app/api/` (backed by `@backend/*` domain modules in `backend/`)
- **Offline ML Engine**: `backend/services/phishingEngine.js` using weights in `ml/weights/`

## Running the Web App
From repository root:
```bash
npm run dev
npm run build
npm run lint
```
Or directly from `apps/web/`:
```bash
cd apps/web
npm run dev
npm run build
```
