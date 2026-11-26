import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes that do not require authentication:
// - Landing pages and public info: /, /about, /privacy, /terms
// - Public auth routes: /sign-in(.*), /sign-up(.*)
// - Public APIs: /api/analyze (guest scanning), /api/complaints (public complaint creation & sanitized lookup)
// - Static assets and favicons
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/analyze',
  '/api/complaints(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
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
