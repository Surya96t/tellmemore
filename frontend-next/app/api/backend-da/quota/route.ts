/**
 * BFF API Route: User Quota
 * 
 * Proxies quota requests to Backend-da INTERNAL endpoints.
 * Uses Clerk for authentication but calls Backend-da with internal API key.
 * 
 * Endpoints:
 * - GET /api/backend-da/quota - Get current user's quota
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * TypeScript types matching Backend-da schemas
 */
interface QuotaResponse {
  user_id: string;
  daily_limit: number;
  used_today: number;
  last_reset: string | null;
  quota_remaining?: number; // Computed field
  reset_at?: string; // Computed field
}

interface ErrorResponse {
  error: string;
  detail?: string;
}

/**
 * GET /api/backend-da/quota
 * 
 * Fetch current user's quota information.
 * 
 * Authentication: Required (Clerk JWT)
 * 
 * Response:
 * - 200: QuotaResponse (quota details)
 * - 401: Unauthorized (no valid Clerk session)
 * - 404: Quota not found (user doesn't have quota record)
 * - 500: Internal server error
 */
export async function GET(): Promise<NextResponse<QuotaResponse | ErrorResponse>> {
  try {
    // Authenticate user via Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'No valid Clerk session found' },
        { status: 401 }
      );
    }

    // Get or create user in Backend-da using helper
    const backendUser = await getOrCreateBackendUser();

    // Fetch quota from Backend-da internal endpoint
    const response = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/users/${backendUser.user_id}/quota`,
      {
        method: 'GET',
        headers: {
          'X-Internal-API-Key': env.server.internalApiKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh quota data
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Backend-da error fetching quota:', errorData);
      
      // Handle 404 specifically (user doesn't have quota record yet)
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Quota not found', detail: 'User quota record not found. It will be created on first chat.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch quota', detail: errorData.detail },
        { status: response.status }
      );
    }

    const quota: QuotaResponse = await response.json();

    // Add computed fields for convenience
    const quotaWithComputed = {
      ...quota,
      quota_remaining: quota.daily_limit - quota.used_today,
      reset_at: quota.last_reset || new Date().toISOString(),
    };

    return NextResponse.json(quotaWithComputed, { status: 200 });
  } catch (error) {
    console.error('BFF error in GET /api/backend-da/quota:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        detail: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get or create user in Backend-da by Clerk ID
 * 
 * @returns Backend-da user object with user_id
 */
async function getOrCreateBackendUser(): Promise<{ user_id: string; email: string }> {
  try {
    // Get Clerk user ID
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('No Clerk user ID available');
    }

    // Import currentUser to get full Clerk profile
    const { currentUser } = await import('@clerk/nextjs/server');
    const clerkUser = await currentUser();

    if (!clerkUser) {
      throw new Error('Clerk user profile not found');
    }

    // Extract real user data from Clerk profile
    const email = clerkUser.emailAddresses[0]?.emailAddress || 'unknown@example.com';
    const name = clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.firstName || clerkUser.username || 'Unknown User';

    // Call Backend-da internal endpoint with API key and Clerk profile data
    const url = new URL(`${env.server.backendDaUrl}/api/v1/internal/users/by-clerk-id/${userId}`);
    url.searchParams.append('clerk_email', email);
    url.searchParams.append('clerk_name', name);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-Internal-API-Key': env.server.internalApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend-da returned ${response.status}: ${errorText}`);
    }

    const user = await response.json();
    return { user_id: user.user_id, email: user.email };
  } catch (error) {
    console.error('Error in getOrCreateBackendUser:', error);
    throw new Error(`Failed to get or create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
