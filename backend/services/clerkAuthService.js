import { createClerkClient } from '@clerk/backend';
import dbConnect from '../config/mongodb.js';
import User from '../models/User.js';

let clerkInstance = null;

export function getClerkClient() {
  if (clerkInstance) return clerkInstance;

  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;

  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: CLERK_SECRET_KEY must be configured in production environments.');
    }
  }

  clerkInstance = createClerkClient({
    secretKey: secretKey || 'sk_test_placeholder_dev',
    publishableKey: publishableKey || 'pk_test_placeholder_dev'
  });

  return clerkInstance;
}

/**
 * Authenticates request using Clerk backend SDK (@clerk/backend).
 * Supports both Next.js Request and standard Web Request objects.
 * Inspects Authorization Bearer tokens and Clerk session cookies.
 *
 * @param {Request} request
 * @returns {Promise<{
 *   authenticated: boolean,
 *   userId: string | null,
 *   role: string,
 *   user: any | null,
 *   error: string | null,
 *   status: number
 * }>}
 */
export async function authenticateClerkRequest(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const cookieHeader = request.headers.get('cookie') || '';

    // If no credentials supplied at all
    if (!authHeader && !cookieHeader.includes('__session') && !cookieHeader.includes('__clerk')) {
      return {
        authenticated: false,
        userId: null,
        role: 'GUEST',
        user: null,
        error: 'No authentication credentials provided',
        status: 401
      };
    }

    const clerk = getClerkClient();
    
    // Authenticate request using official Clerk backend SDK
    const requestState = await clerk.authenticateRequest(request, {
      jwtKey: process.env.CLERK_JWT_KEY || undefined,
      authorizedParties: process.env.APP_ALLOWED_ORIGINS 
        ? process.env.APP_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
        : undefined
    });

    if (!requestState || !requestState.isSignedIn) {
      return {
        authenticated: false,
        userId: null,
        role: 'GUEST',
        user: null,
        error: requestState?.message || 'Invalid or expired session token',
        status: 401
      };
    }

    const authData = requestState.toAuth();
    const clerkUserId = authData.userId;

    if (!clerkUserId) {
      return {
        authenticated: false,
        userId: null,
        role: 'GUEST',
        user: null,
        error: 'Authenticated session has no associated userId',
        status: 401
      };
    }

    // Resolve or sync user identity in MongoDB
    let role = 'USER';
    let localUser = null;

    try {
      await dbConnect();
      localUser = await User.findOne({ clerkUserId }).lean();

      if (localUser) {
        if (localUser.status === 'SUSPENDED') {
          return {
            authenticated: false,
            userId: clerkUserId,
            role: 'SUSPENDED',
            user: null,
            error: 'Account has been suspended by SecOps administrator',
            status: 403
          };
        }
        role = localUser.role || 'USER';
      } else {
        // First login / JIT provisioning
        try {
          const clerkUser = await clerk.users.getUser(clerkUserId).catch(() => null);
          const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
          const firstName = clerkUser?.firstName || '';
          const lastName = clerkUser?.lastName || '';
          const imageUrl = clerkUser?.imageUrl || '';

          // Check if metadata specifies role
          const metadataRole = clerkUser?.publicMetadata?.role;
          if (['USER', 'ANALYST', 'ADMIN', 'SUPER_ADMIN'].includes(metadataRole)) {
            role = metadataRole;
          }

          const created = await User.create({
            clerkUserId,
            email,
            firstName,
            lastName,
            imageUrl,
            role,
            status: 'ACTIVE',
            lastLoginAt: new Date()
          });
          localUser = created.toObject();
        } catch (provisionErr) {
          console.warn('JIT user provisioning note:', provisionErr.message);
        }
      }
    } catch (dbErr) {
      console.warn('Database user sync check failed; using token identity:', dbErr.message);
    }

    return {
      authenticated: true,
      userId: clerkUserId,
      role,
      user: localUser,
      error: null,
      status: 200
    };
  } catch (err) {
    console.error('Clerk authenticateRequest error:', err);
    return {
      authenticated: false,
      userId: null,
      role: 'GUEST',
      user: null,
      error: 'Authentication failed due to internal error',
      status: 500
    };
  }
}
