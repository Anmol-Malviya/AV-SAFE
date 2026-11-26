# Deployment Guide — AV-SAFE

## 1. Web & API (Vercel / Docker)

### Vercel Deployment
1. Connect the repository to Vercel.
2. Configure the environment variables:
   - `MONGODB_URI`: Production MongoDB Atlas connection string.
   - `ADMIN_SECRET_KEY`: High-entropy key for administrative triage endpoints.
   - `NEXT_PUBLIC_APP_URL`: Production URL (e.g. `https://av-safe.vercel.app`).
3. Build command: `npm run build`
4. Output directory: Next.js default (`.next`)

### Containerized Node.js Deployment
If deploying to a VPS, Kubernetes, or AWS ECS:
```bash
docker build -t av-safe-web .
docker run -p 3000:3000 --env-file .env av-safe-web
```

## 2. Chromium Extension Distribution
1. Ensure all icons and manifests are synced:
   ```bash
   python scripts/generate_extension_icons.py
   ```
2. In Chrome Developer Dashboard, zip the contents of `apps/extension/` and upload as Manifest V3 package.

## 3. Android APK Release
1. Build release APK:
   ```bash
   cd apps/android
   ./gradlew assembleRelease
   ```
2. The generated release artifact is located at:
   `apps/android/app/build/outputs/apk/release/app-release.apk`
