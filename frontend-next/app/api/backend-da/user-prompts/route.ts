/**
 * BFF API Route: User Prompts
 * 
 * Proxies user prompt library requests to Backend-da.
 * All requests are authenticated via Clerk JWT.
 * 
 * Endpoints:
 * - GET    /api/backend-da/user-prompts - Get all user prompts
 * - POST   /api/backend-da/user-prompts - Create new user prompt
 * - DELETE /api/backend-da/user-prompts?id=xxx - Delete user prompt
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * TypeScript types matching Backend-da schemas
 */
interface UserPromptResponse {
  prompt_id: string;
  user_id: string;
  prompt_text: string;
}

interface UserPromptCreate {
  user_id: string;
  prompt_text: string;
}

interface ErrorResponse {
  error: string;
  detail?: string;
}

/**
 * GET /api/backend-da/user-prompts
 * 
 * Fetch all custom prompts for the authenticated user.
 * 
 * Authentication: Required (Clerk JWT)
 * 
 * Response:
 * - 200: Array of UserPromptResponse
 * - 401: Unauthorized (no valid Clerk session)
 * - 500: Internal server error
 */
export async function GET(): Promise<NextResponse<UserPromptResponse[] | ErrorResponse>> {
  try {
    // Authenticate user via Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'No valid Clerk session found' },
        { status: 401 }
      );
    }

    // Get or create user in Backend-da
    const backendUser = await getOrCreateBackendUser();

    // Fetch user prompts from Backend-da internal endpoint
    const response = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/users/${backendUser.user_id}/user-prompts`,
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
      console.error('Backend-da error fetching user prompts:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to fetch user prompts', detail: errorData.detail },
        { status: response.status }
      );
    }

    const prompts: UserPromptResponse[] = await response.json();

    return NextResponse.json(prompts, { status: 200 });
  } catch (error) {
    console.error('BFF error in GET /api/backend-da/user-prompts:', error);
    
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
 * POST /api/backend-da/user-prompts
 * 
 * Create a new custom prompt for the authenticated user.
 * 
 * Authentication: Required (Clerk JWT)
 * 
 * Request Body:
 * - prompt_text: string (required, non-empty)
 * 
 * Response:
 * - 201: UserPromptResponse (newly created prompt)
 * - 400: Bad request (invalid prompt_text)
 * - 401: Unauthorized (no valid Clerk session)
 * - 500: Internal server error
 */
export async function POST(request: NextRequest): Promise<NextResponse<UserPromptResponse | ErrorResponse>> {
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
    
    if (!body) {
      return NextResponse.json(
        { error: 'Bad request', detail: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate prompt_text
    const { prompt_text } = body;

    if (!prompt_text || typeof prompt_text !== 'string' || prompt_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad request', detail: 'Missing or empty "prompt_text" field' },
        { status: 400 }
      );
    }

    // Get or create user in Backend-da
    const backendUser = await getOrCreateBackendUser();

    // Prepare payload
    const createPayload: UserPromptCreate = {
      user_id: backendUser.user_id,
      prompt_text: prompt_text.trim(),
    };

    // Create user prompt in Backend-da internal endpoint
    const response = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/user-prompts`,
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
      console.error('Backend-da error creating user prompt:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to create user prompt', detail: errorData.detail },
        { status: response.status }
      );
    }

    const prompt: UserPromptResponse = await response.json();

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error('BFF error in POST /api/backend-da/user-prompts:', error);
    
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
 * DELETE /api/backend-da/user-prompts?id=xxx
 * 
 * Delete a user prompt by ID.
 * 
 * Authentication: Required (Clerk JWT)
 * 
 * Query Parameters:
 * - id: string (required) - The prompt_id to delete
 * 
 * Response:
 * - 200: Success message
 * - 400: Bad request (missing id)
 * - 401: Unauthorized (no valid Clerk session)
 * - 404: Prompt not found
 * - 500: Internal server error
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<{ message: string } | ErrorResponse>> {
  try {
    // Authenticate user via Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'No valid Clerk session found' },
        { status: 401 }
      );
    }

    // Get prompt_id from query parameters
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('id');

    if (!promptId) {
      return NextResponse.json(
        { error: 'Bad request', detail: 'Missing required query parameter: id' },
        { status: 400 }
      );
    }

    // Delete prompt from Backend-da internal endpoint
    const response = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/user-prompts/${promptId}`,
      {
        method: 'DELETE',
        headers: {
          'X-Internal-API-Key': env.server.internalApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Backend-da error deleting user prompt:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to delete user prompt', detail: errorData.detail },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('BFF error in DELETE /api/backend-da/user-prompts:', error);
    
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
