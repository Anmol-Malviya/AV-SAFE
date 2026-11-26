# Web Application (Next.js 16)

The web application runs from the repository root using Next.js 16 (App Router) and React 19:
- **Pages & Routes**: `src/app/`
- **UI Components**: `src/app/components/`
- **Static Assets**: `public/`
- **API Endpoints**: `src/app/api/` (backed by `@backend/*` domain modules in `backend/`)
- **Offline ML Engine**: `backend/services/phishingEngine.js` using weights in `ml/weights/`

## Running the Web App
```bash
npm install
npm run dev
```
Production build:
```bash
npm run build
```
