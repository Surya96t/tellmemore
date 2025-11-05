/**
 * React Query hooks for Chat Sessions
 * 
 * Provides type-safe hooks for fetching and mutating chat sessions.
 * 
 * Usage:
 * ```tsx
 * const { data: sessions, isLoading } = useSessions();
 * const createSession = useCreateSession();
 * 
 * const handleCreate = async () => {
 *   await createSession.mutateAsync({ title: 'New Chat' });
 * };
 * ```
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { ChatSession, CreateSessionRequest } from '../api/types';

/**
 * Query keys for sessions
 */
export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...sessionKeys.lists(), filters] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
};

/**
 * Fetch all sessions for the current user
 */
export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.lists(),
    queryFn: () => apiClient.sessions.list(),
    staleTime: 60_000, // Fresh for 1 minute
    gcTime: 300_000, // Keep in cache for 5 minutes (formerly cacheTime)
  });
}

/**
 * Fetch a single session by ID (future)
 */
export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId!),
    queryFn: () => apiClient.sessions.get(sessionId!),
    enabled: !!sessionId, // Only fetch if sessionId is provided
    staleTime: 60_000,
  });
}

/**
 * Create a new chat session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionRequest) => apiClient.sessions.create(data),
    onSuccess: () => {
      // Refetch to get real data (no optimistic update to avoid temporary IDs)
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
  });
}

/**
 * Update a session (future)
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: Partial<CreateSessionRequest> }) =>
      apiClient.sessions.update(sessionId, data),
    onSuccess: (_data, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(variables.sessionId) });
    },
  });
}

/**
 * Delete a session (future)
 */
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.sessions.delete(sessionId),
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: sessionKeys.lists() });

      const previousSessions = queryClient.getQueryData<ChatSession[]>(sessionKeys.lists());

      // Optimistically remove from list
      queryClient.setQueryData<ChatSession[]>(sessionKeys.lists(), (old) =>
        old?.filter((session) => session.session_id !== sessionId) || []
      );

      return { previousSessions };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(sessionKeys.lists(), context.previousSessions);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
  });
}
