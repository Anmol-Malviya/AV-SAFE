import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Match protected routes (page routes like /system/profile or /system when authenticated)
// Note: API routes enforce their own granular authentication via authMiddleware/requireAuth/requireRole
// so that API clients (Mobile, Extension, Fetch) always receive clean JSON responses instead of HTML redirects.
const isProtectedRoute = createRouteMatcher([
  '/system/profile(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
