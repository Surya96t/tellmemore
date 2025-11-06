/**
 * System Prompts React Query Hooks
 * 
 * Hooks for fetching system prompts (read-only).
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { SystemPrompt } from '@/lib/api/types';

/**
 * Query keys for system prompts
 */
export const systemPromptKeys = {
  all: ['system-prompts'] as const,
  lists: () => [...systemPromptKeys.all, 'list'] as const,
};

/**
 * Hook to fetch all system prompts
 * 
 * @example
 * ```tsx
 * const { data: prompts, isLoading, error } = useSystemPrompts();
 * ```
 */
export function useSystemPrompts() {
  return useQuery<SystemPrompt[], Error>({
    queryKey: systemPromptKeys.lists(),
    queryFn: () => apiClient.systemPrompts.list(),
    staleTime: 60_000, // Fresh for 1 minute
    gcTime: 300_000, // Keep in cache for 5 minutes
  });
}
