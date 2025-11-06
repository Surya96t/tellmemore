/**
 * BFF API Route: Single Chat Session
 * 
 * Proxies requests to Backend-da for individual session management.
 * All requests are authenticated via Clerk JWT.
 * 
 * Endpoints:
 * - GET    /api/backend-da/sessions/:sessionId - Get session by ID
 * - PUT    /api/backend-da/sessions/:sessionId - Update session (title, etc.)
 * - DELETE /api/backend-da/sessions/:sessionId - Delete session
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

interface ErrorResponse {
  error: string;
  detail?: string;
}

/**
 * Helper: Get or create user in Backend-da by Clerk ID
 */
async function getOrCreateBackendUser(): Promise<{ user_id: string }> {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) {
    throw new Error('No Clerk user ID found');
  }

  try {
    // Import clerkClient to fetch full user profile
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);

    if (!clerkUser) {
      throw new Error('Clerk user profile not found');
    }

    // Extract real user data from Clerk profile
    const email = clerkUser.emailAddresses[0]?.emailAddress || 'unknown@example.com';
    const name = clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.firstName || clerkUser.username || 'Unknown User';

    // Call Backend-da internal endpoint with GET and query params
    const url = new URL(`${env.server.backendDaUrl}/api/v1/internal/users/by-clerk-id/${clerkUserId}`);
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
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Failed to get/create Backend-da user:', errorData);
      throw new Error('Failed to authenticate with Backend-da');
    }

    const userData = await response.json();
    return { user_id: userData.user_id };
  } catch (error) {
    console.error('Error in getOrCreateBackendUser:', error);
    throw new Error(`Failed to get or create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * GET /api/backend-da/sessions/:sessionId
 * 
 * Fetch a specific chat session by ID.
 * 
 * Authentication: Required (Clerk JWT)
 * 
 * Response:
 * - 200: ChatSessionResponse
 * - 401: Unauthorized
 * - 404: Session not found
 * - 500: Internal server error
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
): Promise<NextResponse<ChatSessionResponse | ErrorResponse>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'No valid Clerk session found' },
        { status: 401 }
      );
    }

    const { sessionId } = await params;

    // Get Backend-da user
    const backendUser = await getOrCreateBackendUser();

    // Fetch session from Backend-da
    const response = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/sessions/${sessionId}`,
      {
        method: 'GET',
        headers: {
          'X-Internal-API-Key': env.server.internalApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Not found', detail: 'Session not found' },
          { status: 404 }
        );
      }

      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Backend-da error fetching session:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to fetch session', detail: errorData.detail },
        { status: response.status }
      );
    }

    const session: ChatSessionResponse = await response.json();

    // Verify the session belongs to the authenticated user
    if (session.user_id !== backendUser.user_id) {
      return NextResponse.json(
        { error: 'Forbidden', detail: 'You do not have access to this session' },
        { status: 403 }
      );
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error('BFF error in GET /api/backend-da/sessions/:sessionId:', error);
    
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
 * PUT /api/backend-da/sessions/:sessionId
 * 
 * Update a chat session (e.g., change title).
 * 
 * Authentication: Required (Clerk JWT)
 * 
 * Request Body:
 * - title: string (required, 3-255 characters)
 * 
 * Response:
 * - 200: ChatSessionResponse (updated session)
 * - 400: Bad request (invalid title)
 * - 401: Unauthorized
 * - 403: Forbidden (session belongs to another user)
 * - 404: Session not found
 * - 500: Internal server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
): Promise<NextResponse<ChatSessionResponse | ErrorResponse>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'No valid Clerk session found' },
        { status: 401 }
      );
    }

    const { sessionId } = await params;

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
    
    if (title.length < 1) {
      return NextResponse.json(
        { error: 'Bad request', detail: 'Title cannot be empty' },
        { status: 400 }
      );
    }

    if (title.length > 255) {
      return NextResponse.json(
        { error: 'Bad request', detail: 'Title must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Get Backend-da user
    const backendUser = await getOrCreateBackendUser();

    // First, verify the session exists and belongs to the user
    const getResponse = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/sessions/${sessionId}`,
      {
        method: 'GET',
        headers: {
          'X-Internal-API-Key': env.server.internalApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!getResponse.ok) {
      if (getResponse.status === 404) {
        return NextResponse.json(
          { error: 'Not found', detail: 'Session not found' },
          { status: 404 }
        );
      }

      const errorData = await getResponse.json().catch(() => ({ detail: 'Unknown error' }));
      return NextResponse.json(
        { error: 'Failed to verify session', detail: errorData.detail },
        { status: getResponse.status }
      );
    }

    const existingSession: ChatSessionResponse = await getResponse.json();

    // Verify ownership
    if (existingSession.user_id !== backendUser.user_id) {
      return NextResponse.json(
        { error: 'Forbidden', detail: 'You do not have access to this session' },
        { status: 403 }
      );
    }

    // Update session via Backend-da
    const updateResponse = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/sessions/${sessionId}`,
      {
        method: 'PUT',
        headers: {
          'X-Internal-API-Key': env.server.internalApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Backend-da error updating session:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to update session', detail: errorData.detail },
        { status: updateResponse.status }
      );
    }

    const updatedSession: ChatSessionResponse = await updateResponse.json();

    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    console.error('BFF error in PUT /api/backend-da/sessions/:sessionId:', error);
    
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
 * DELETE /api/backend-da/sessions/:sessionId
 * 
 * Delete a chat session and all associated prompts.
 * 
 * Authentication: Required (Clerk JWT)
 * 
 * Response:
 * - 200: Success message
 * - 401: Unauthorized
 * - 403: Forbidden (session belongs to another user)
 * - 404: Session not found
 * - 500: Internal server error
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
): Promise<NextResponse<{ message: string } | ErrorResponse>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'No valid Clerk session found' },
        { status: 401 }
      );
    }

    const { sessionId } = await params;

    // Get Backend-da user
    const backendUser = await getOrCreateBackendUser();

    // First, verify the session exists and belongs to the user
    const getResponse = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/sessions/${sessionId}`,
      {
        method: 'GET',
        headers: {
          'X-Internal-API-Key': env.server.internalApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!getResponse.ok) {
      if (getResponse.status === 404) {
        return NextResponse.json(
          { error: 'Not found', detail: 'Session not found' },
          { status: 404 }
        );
      }

      const errorData = await getResponse.json().catch(() => ({ detail: 'Unknown error' }));
      return NextResponse.json(
        { error: 'Failed to verify session', detail: errorData.detail },
        { status: getResponse.status }
      );
    }

    const existingSession: ChatSessionResponse = await getResponse.json();

    // Verify ownership
    if (existingSession.user_id !== backendUser.user_id) {
      return NextResponse.json(
        { error: 'Forbidden', detail: 'You do not have access to this session' },
        { status: 403 }
      );
    }

    // Delete session via Backend-da
    const deleteResponse = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/sessions/${sessionId}`,
      {
        method: 'DELETE',
        headers: {
          'X-Internal-API-Key': env.server.internalApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Backend-da error deleting session:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to delete session', detail: errorData.detail },
        { status: deleteResponse.status }
      );
    }

    return NextResponse.json(
      { message: 'Session deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('BFF error in DELETE /api/backend-da/sessions/:sessionId:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        detail: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
