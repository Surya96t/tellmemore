/**
 * React Query hooks for User Quota
 * 
 * Provides hooks for fetching user quota information.
 * 
 * Usage:
 * ```tsx
 * const { data: quota, isLoading } = useQuota();
 * 
 * if (quota) {
 *   console.log(`Quota: ${quota.used_today}/${quota.daily_limit}`);
 *   console.log(`Remaining: ${quota.quota_remaining}`);
 * }
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

/**
 * Query keys for quota
 */
export const quotaKeys = {
  all: ['quota'] as const,
  current: () => [...quotaKeys.all, 'current'] as const,
};

/**
 * Fetch current user quota
 * 
 * Note: Quota is updated automatically by the backend after each chat.
 * This hook will refetch when invalidated by useSendChat.
 */
export function useQuota() {
  return useQuery({
    queryKey: quotaKeys.current(),
    queryFn: () => apiClient.quota.get(),
    staleTime: 300_000, // Fresh for 5 minutes (private cache)
    gcTime: 600_000, // Keep in cache for 10 minutes
    refetchInterval: 600_000, // Refetch every 10 minutes to stay fresh
  });
}
