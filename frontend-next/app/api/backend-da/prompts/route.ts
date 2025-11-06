/**
 * BFF API Route: Prompts (Chat History)
 * 
 * Proxies prompt/chat history requests to Backend-da INTERNAL endpoints.
 * Uses Clerk for authentication but calls Backend-da with internal API key.
 * 
 * Endpoints:
 * - GET  /api/backend-da/prompts?session_id=xxx - Get prompts for a session
 * - POST /api/backend-da/prompts                - Save new prompt & LLM responses
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * TypeScript types matching Backend-da schemas
 */
interface PromptResponse {
  prompt_id: string;
  user_id: string;
  session_id: string;
  prompt_text: string;
  llm_responses: string[];
  timestamp: string;
}

interface PromptCreate {
  user_id: string;
  session_id: string;
  prompt_text: string;
  llm_responses: string[];
  tokens_used?: number; // Total tokens used by LLM requests
}

interface ErrorResponse {
  error: string;
  detail?: string;
}

/**
 * GET /api/backend-da/prompts?session_id=xxx
 * 
 * Fetch all prompts (chat history) for a specific session.
 * 
 * Authentication: Required (Clerk JWT)
 * 
 * Query Parameters:
 * - session_id: string (required) - The session ID to fetch history for
 * 
 * Response:
 * - 200: Array of PromptResponse (chat history)
 * - 400: Bad request (missing session_id)
 * - 401: Unauthorized (no valid Clerk session)
 * - 404: Session not found
 * - 500: Internal server error
 */
export async function GET(request: NextRequest): Promise<NextResponse<PromptResponse[] | ErrorResponse>> {
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

    // Get session_id from query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Bad request', detail: 'Missing required query parameter: session_id' },
        { status: 400 }
      );
    }

    // Fetch prompts from Backend-da internal endpoint
    const response = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/sessions/${sessionId}/prompts`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-API-Key': env.server.internalApiKey,
        },
        cache: 'no-store', // Always fetch fresh chat history
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Backend-da error fetching prompts:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to fetch prompts', detail: errorData.detail },
        { status: response.status }
      );
    }

    const prompts: PromptResponse[] = await response.json();

    return NextResponse.json(prompts, { status: 200 });
  } catch (error) {
    console.error('BFF error in GET /api/backend-da/prompts:', error);
    
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
 * POST /api/backend-da/prompts
 * 
 * Save a new prompt and LLM responses to a session.
 * 
 * Authentication: Required (Clerk JWT)
 * 
 * Request Body:
 * - session_id: string (required) - Session to add prompt to
 * - prompt_text: string (required) - User's prompt/question
 * - llm_responses: string[] (required) - Array of LLM responses
 * 
 * Response:
 * - 201: PromptResponse (saved prompt)
 * - 400: Bad request (invalid payload)
 * - 401: Unauthorized (no valid Clerk session)
 * - 500: Internal server error
 */
export async function POST(request: NextRequest): Promise<NextResponse<PromptResponse | ErrorResponse>> {
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

    // Parse request body
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { error: 'Bad request', detail: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { session_id, prompt_text, llm_responses, tokens_used } = body;

    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json(
        { error: 'Bad request', detail: 'Missing or invalid "session_id" field' },
        { status: 400 }
      );
    }

    if (!prompt_text || typeof prompt_text !== 'string' || prompt_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad request', detail: 'Missing or empty "prompt_text" field' },
        { status: 400 }
      );
    }

    if (!Array.isArray(llm_responses)) {
      return NextResponse.json(
        { error: 'Bad request', detail: '"llm_responses" must be an array' },
        { status: 400 }
      );
    }

    // Prepare payload for Backend-da internal endpoint
    const createPayload: PromptCreate = {
      user_id: backendUser.user_id,
      session_id,
      prompt_text: prompt_text.trim(),
      llm_responses,
      tokens_used: typeof tokens_used === 'number' ? tokens_used : undefined,
    };

    // DEBUG: Log payload being sent to Backend-da
    console.log('💾 Saving prompt to Backend-da:', {
      session_id,
      prompt_text: prompt_text.slice(0, 50),
      llm_responses_count: llm_responses.length,
      llm_responses: llm_responses.map((r: string) => r.slice(0, 50)),
      tokens_used: createPayload.tokens_used,
    });

    // Save prompt to Backend-da internal endpoint
    const response = await fetch(
      `${env.server.backendDaUrl}/api/v1/internal/prompts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-API-Key': env.server.internalApiKey,
        },
        body: JSON.stringify(createPayload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Backend-da error saving prompt:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to save prompt', detail: errorData.detail },
        { status: response.status }
      );
    }

    const prompt: PromptResponse = await response.json();

    // DEBUG: Log saved prompt
    console.log('✅ Prompt saved to Backend-da:', {
      prompt_id: prompt.prompt_id,
      llm_responses_count: prompt.llm_responses?.length || 0,
      llm_responses: prompt.llm_responses,
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error('BFF error in POST /api/backend-da/prompts:', error);
    
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
