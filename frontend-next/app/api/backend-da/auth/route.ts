/**
 * BFF API Route: Authentication
 * 
 * NOTE: This route is not actively used because Clerk handles all authentication.
 * 
 * Clerk provides:
 * - Sign-in/Sign-up pages (handled by Clerk components)
 * - JWT token generation and validation
 * - Session management
 * - User profile management
 * 
 * All other BFF routes use Clerk's `auth()` function to validate sessions.
 * 
 * If you need to add custom auth logic (e.g., for admin routes, special permissions),
 * you can implement endpoints here.
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

interface ErrorResponse {
  error: string;
  detail?: string;
}

interface AuthStatusResponse {
  authenticated: boolean;
  userId?: string;
  message: string;
}

/**
 * GET /api/backend-da/auth
 * 
 * Check authentication status (for debugging/testing).
 * 
 * Response:
 * - 200: AuthStatusResponse
 */
export async function GET(): Promise<NextResponse<AuthStatusResponse | ErrorResponse>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        {
          authenticated: false,
          message: 'No active Clerk session',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        userId,
        message: 'User is authenticated',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('BFF error in GET /api/backend-da/auth:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        detail: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
