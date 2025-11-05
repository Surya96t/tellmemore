/**
 * React Query hooks for Authentication
 * 
 * Provides hooks for checking auth status.
 * 
 * Usage:
 * ```tsx
 * const { data: authStatus, isLoading } = useAuthStatus();
 * 
 * if (authStatus?.authenticated) {
 *   console.log('User ID:', authStatus.userId);
 * }
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

/**
 * Query keys for auth
 */
export const authKeys = {
  all: ['auth'] as const,
  status: () => [...authKeys.all, 'status'] as const,
};

/**
 * Check authentication status
 * 
 * Note: This is primarily used for debugging/testing.
 * Clerk handles actual authentication in production.
 */
export function useAuthStatus() {
  return useQuery({
    queryKey: authKeys.status(),
    queryFn: () => apiClient.auth.status(),
    staleTime: 60_000, // Fresh for 1 minute
    gcTime: 300_000, // Keep in cache for 5 minutes
    retry: 1, // Only retry once for auth checks
  });
}
