/**
 * BFF API Route: User Management
 * 
 * Handles user creation and retrieval, mapping Clerk IDs to Backend-da user IDs.
 * This endpoint bypasses Clerk authentication on backend-da and instead uses
 * a service-to-service API key or trusted header approach.
 * 
 * Endpoints:
 * - GET /api/backend-da/users - Get or create current user
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

interface BackendUser {
  user_id: string;
  name: string;
  email: string;
  role?: string;
  created_at: string;
}

interface ErrorResponse {
  error: string;
  detail?: string;
}

/**
 * GET /api/backend-da/users
 * 
 * Get or create user in Backend-da by Clerk ID.
 * This endpoint handles the Clerk→Backend-da user mapping.
 * 
 * Authentication: Required (Clerk JWT)
 * 
 * Response:
 * - 200: BackendUser object
 * - 401: Unauthorized
 * - 500: Internal server error
 */
export async function GET(): Promise<NextResponse<BackendUser | ErrorResponse>> {
  try {
    // Authenticate via Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'No valid Clerk session' },
        { status: 401 }
      );
    }

    // Get full Clerk user info
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Clerk user not found' },
        { status: 401 }
      );
    }

    // Extract user info from Clerk
    const email = clerkUser.emailAddresses[0]?.emailAddress || 'unknown@example.com';
    const name = clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.firstName || clerkUser.username || 'Unknown User';

    // console.log('🔐 Clerk user authenticated:', { userId, email, name });

    // TODO: Call Backend-da to create/get user
    // For now, create a temporary user mapping in memory
    // This will be replaced with a proper Backend-da call that uses
    // service-to-service authentication (not Clerk JWT)
    
    // Temporary mock response for development
    const mockUser: BackendUser = {
      user_id: userId, // Using Clerk ID temporarily
      name,
      email,
      role: 'user',
      created_at: new Date().toISOString(),
    };

    // console.log('✅ User retrieved/created:', mockUser);

    return NextResponse.json(mockUser);
  } catch (error) {
    console.error('BFF error in GET /api/backend-da/users:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        detail: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
