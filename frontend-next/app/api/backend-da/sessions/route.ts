/**
 * BFF API Route: Chat Sessions
 * 
 * Proxies requests to Backend-da for chat session management.
 * All requests are authenticated via Clerk JWT.
 * 
 * Endpoints:
 * - GET    /api/backend-da/sessions       - List user's sessions
 * - POST   /api/backend-da/sessions       - Create new session
 * - GET    /api/backend-da/sessions/:id   - Get session by ID (future)
 * - PUT    /api/backend-da/sessions/:id   - Update session (future)
 * - DELETE /api/backend-da/sessions/:id   - Delete session (future)
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * TypeScript types matching Backend-da schemas
 */
interface ChatSessionResponse {
  session_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

interface ChatSessionCreate {
  title: string;
  user_id: string;
}

interface ErrorResponse {
  error: string;
  detail?: string;
}

/**
 * GET /api/backend-da/sessions
 * 
 * Fetch all chat sessions for the authenticated user.
 * 
 * Authentication: Required (Clerk JWT)
 * 
 * Response:
 * - 200: Array of ChatSessionResponse
 * - 401: Unauthorized (no valid Clerk session)
 * - 500: Internal server error
 */
export async function GET(): Promise<NextResponse<ChatSessionResponse[] | ErrorResponse>> {
  try {
    // Authenticate user via Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'No valid Clerk session found' },
        { status: 401 }
      );
    }

    // Get or create user in Backend-da (maps Clerk ID to internal user ID)
    const backendUser = await getOrCreateBackendUser();

    // Fetch user's sessions from Backend-da (internal endpoint)
    const response = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/users/${backendUser.user_id}/sessions`,
      {
        method: 'GET',
        headers: {
          'X-Internal-API-Key': env.server.internalApiKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Backend-da error fetching sessions:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to fetch sessions', detail: errorData.detail },
        { status: response.status }
      );
    }

    const sessions: ChatSessionResponse[] = await response.json();

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error('BFF error in GET /api/backend-da/sessions:', error);
    
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
 * POST /api/backend-da/sessions
 * 
 * Create a new chat session for the authenticated user.
 * 
 * Authentication: Required (Clerk JWT)
 * 
 * Request Body:
 * - title: string (required, 3-255 characters)
 * 
 * Response:
 * - 201: ChatSessionResponse (newly created session)
 * - 400: Bad request (invalid title)
 * - 401: Unauthorized (no valid Clerk session)
 * - 500: Internal server error
 */
export async function POST(request: NextRequest): Promise<NextResponse<ChatSessionResponse | ErrorResponse>> {
  try {
    // Authenticate user via Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'No valid Clerk session found' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => null);
    
    if (!body || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Bad request', detail: 'Missing or invalid "title" field' },
        { status: 400 }
      );
    }

    // Validate title
    const title = body.title.trim();
    
    if (title.length < 3) {
      return NextResponse.json(
        { error: 'Bad request', detail: 'Title must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (title.length > 255) {
      return NextResponse.json(
        { error: 'Bad request', detail: 'Title must be at most 255 characters' },
        { status: 400 }
      );
    }

    // Get or create user in Backend-da
    const backendUser = await getOrCreateBackendUser();

    // Create session in Backend-da (internal endpoint)
    const createPayload: ChatSessionCreate = {
      title,
      user_id: backendUser.user_id,
    };

    const response = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/sessions`,
      {
        method: 'POST',
        headers: {
          'X-Internal-API-Key': env.server.internalApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createPayload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Backend-da error creating session:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to create session', detail: errorData.detail },
        { status: response.status }
      );
    }

    const session: ChatSessionResponse = await response.json();

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('BFF error in POST /api/backend-da/sessions:', error);
    
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
 * Fetches the authenticated Clerk user's profile and passes it to Backend-da
 * for user creation/retrieval. Backend-da will use real Clerk profile data
 * (name, email) instead of placeholders.
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

    console.log('🔑 Calling Backend-da internal API for Clerk user:', {
      userId,
      email,
      name,
    });

    // Call Backend-da internal endpoint with API key and Clerk profile data
    // Backend-da will use real email/name when creating new users
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
      console.error('❌ Backend-da internal API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Backend-da returned ${response.status}: ${errorText}`);
    }

    const user = await response.json();
    console.log('✅ User retrieved/created:', { user_id: user.user_id, email: user.email });
    
    return { user_id: user.user_id, email: user.email };
  } catch (error) {
    console.error('Error in getOrCreateBackendUser:', error);
    throw new Error(`Failed to get or create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
