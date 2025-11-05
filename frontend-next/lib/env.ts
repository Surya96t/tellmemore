/**
 * Type-safe environment variable validation and access.
 * 
 * This file validates all required environment variables on app startup
 * and provides type-safe access throughout the application.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
 */

/**
 * Server-side environment variables (not exposed to client).
 * Only accessible in Server Components, API Routes, and Server Actions.
 */
const serverEnv = {
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  backendDaUrl: process.env.BACKEND_DA_URL,
  backendLlmUrl: process.env.BACKEND_LLM_URL,
  internalApiKey: process.env.INTERNAL_API_KEY,
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

/**
 * Client-side environment variables (exposed to browser).
 * Must be prefixed with NEXT_PUBLIC_.
 */
const clientEnv = {
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  clerkSignInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
  clerkSignUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
  clerkAfterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/dashboard',
  clerkAfterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/dashboard',
  clerkAfterSignOutUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL || '/sign-in',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

/**
 * Validate required environment variables on startup.
 * Throws error if any required variables are missing.
 */
function validateEnv(): void {
  const requiredServerVars = [
    { key: 'CLERK_SECRET_KEY', value: serverEnv.clerkSecretKey },
    { key: 'BACKEND_DA_URL', value: serverEnv.backendDaUrl },
    { key: 'BACKEND_LLM_URL', value: serverEnv.backendLlmUrl },
    { key: 'INTERNAL_API_KEY', value: serverEnv.internalApiKey },
  ];

  const requiredClientVars = [
    { key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', value: clientEnv.clerkPublishableKey },
  ];

  const missing: string[] = [];

  // Check server variables (only on server)
  if (typeof window === 'undefined') {
    for (const { key, value } of requiredServerVars) {
      if (!value) {
        missing.push(key);
      }
    }
  }

  // Check client variables (always)
  for (const { key, value } of requiredClientVars) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing
        .map((key) => `  - ${key}`)
        .join('\n')}\n\nPlease check your .env.local file.`
    );
  }

  // Validate URL formats
  if (typeof window === 'undefined') {
    try {
      new URL(serverEnv.backendDaUrl!);
    } catch {
      throw new Error(`Invalid BACKEND_DA_URL: ${serverEnv.backendDaUrl}`);
    }

    try {
      new URL(serverEnv.backendLlmUrl!);
    } catch {
      throw new Error(`Invalid BACKEND_LLM_URL: ${serverEnv.backendLlmUrl}`);
    }
  }
}

// Validate environment on module load (startup)
validateEnv();

/**
 * Type-safe environment configuration.
 * 
 * Usage:
 * ```ts
 * import { env } from '@/lib/env';
 * 
 * // Server-side only (API routes, Server Components, Server Actions)
 * const backendUrl = env.server.backendDaUrl;
 * 
 * // Client-side (can be used anywhere)
 * const clerkKey = env.client.clerkPublishableKey;
 * ```
 */
export const env = {
  /**
   * Server-side environment variables.
   * 
   * ⚠️ WARNING: These are NOT available in the browser.
   * Only use in Server Components, API Routes, and Server Actions.
   */
  server: {
    clerkSecretKey: serverEnv.clerkSecretKey!,
    backendDaUrl: serverEnv.backendDaUrl!,
    backendLlmUrl: serverEnv.backendLlmUrl!,
    internalApiKey: serverEnv.internalApiKey!,
    nodeEnv: serverEnv.nodeEnv as 'development' | 'production' | 'test',
    isDevelopment: serverEnv.nodeEnv === 'development',
    isProduction: serverEnv.nodeEnv === 'production',
  },

  /**
   * Client-side environment variables.
   * 
   * ✅ Safe to use anywhere (Server Components, Client Components, API Routes).
   */
  client: {
    clerkPublishableKey: clientEnv.clerkPublishableKey!,
    clerkSignInUrl: clientEnv.clerkSignInUrl,
    clerkSignUpUrl: clientEnv.clerkSignUpUrl,
    clerkAfterSignInUrl: clientEnv.clerkAfterSignInUrl,
    clerkAfterSignUpUrl: clientEnv.clerkAfterSignUpUrl,
    clerkAfterSignOutUrl: clientEnv.clerkAfterSignOutUrl,
    appUrl: clientEnv.appUrl,
  },
} as const;

/**
 * Helper to check if we're running on the server.
 */
export const isServer = typeof window === 'undefined';

/**
 * Helper to check if we're running on the client.
 */
export const isClient = typeof window !== 'undefined';
