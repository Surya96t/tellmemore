/**
 * System Prompts BFF API Route
 * 
 * Proxies requests to Backend-da internal API for system prompts
 */

import { NextResponse } from 'next/server';

const BACKEND_DA_URL = process.env.BACKEND_DA_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

if (!BACKEND_DA_URL) {
  throw new Error('BACKEND_DA_URL environment variable is not set');
}

if (!INTERNAL_API_KEY) {
  throw new Error('INTERNAL_API_KEY environment variable is not set');
}

/**
 * GET /api/backend-da/system-prompts
 * Get all system prompts
 */
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_DA_URL}/api/v1/internal/system-prompts`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': INTERNAL_API_KEY as string,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch system prompts' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('BFF Error (system-prompts GET):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
