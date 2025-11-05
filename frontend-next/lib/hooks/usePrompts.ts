/**
 * React Query hooks for Chat History (Prompts)
 * 
 * Provides hooks for fetching and mutating chat history within sessions.
 * 
 * Usage:
 * ```tsx
 * const { data: history, isLoading } = useChatHistory(sessionId);
 * const savePrompt = useSavePrompt();
 * 
 * const handleSave = async () => {
 *   await savePrompt.mutateAsync({
 *     session_id: sessionId,
 *     prompt_text: 'Hello',
 *     llm_responses: ['Hi there!']
 *   });
 * };
 * ```
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Prompt, CreatePromptRequest } from '../api/types';

/**
 * Query keys for prompts/chat history
 */
export const promptKeys = {
  all: ['prompts'] as const,
  lists: () => [...promptKeys.all, 'list'] as const,
  list: (sessionId: string) => [...promptKeys.lists(), sessionId] as const,
};

/**
 * Fetch chat history for a session
 */
export function useChatHistory(sessionId: string | null) {
  return useQuery({
    queryKey: promptKeys.list(sessionId!),
    queryFn: () => apiClient.prompts.list(sessionId!),
    enabled: !!sessionId, // Only fetch if sessionId provided
    staleTime: 30_000, // Fresh for 30 seconds
    gcTime: 300_000, // Keep in cache for 5 minutes
  });
}

/**
 * Save a prompt and LLM responses to history
 */
export function useSavePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromptRequest) => apiClient.prompts.create(data),
    onMutate: async (newPrompt: CreatePromptRequest) => {
      const queryKey = promptKeys.list(newPrompt.session_id);
      
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousHistory = queryClient.getQueryData<Prompt[]>(queryKey);

      // Optimistically add to history
      queryClient.setQueryData<Prompt[]>(queryKey, (old: Prompt[] | undefined) => [
        ...(old || []),
        {
          prompt_id: 'temp-' + Date.now(),
          user_id: 'temp',
          session_id: newPrompt.session_id,
          prompt_text: newPrompt.prompt_text,
          llm_responses: newPrompt.llm_responses,
          timestamp: new Date().toISOString(),
        },
      ]);

      return { previousHistory, sessionId: newPrompt.session_id };
    },
    onError: (
      _err: Error,
      _variables: CreatePromptRequest,
      context?: { previousHistory?: Prompt[]; sessionId?: string }
    ) => {
      // Rollback on error
      if (context?.previousHistory && context?.sessionId) {
        queryClient.setQueryData(promptKeys.list(context.sessionId), context.previousHistory);
      }
    },
    onSuccess: (_data: Prompt, variables: CreatePromptRequest) => {
      // Refetch chat history to get real data
      queryClient.invalidateQueries({ queryKey: promptKeys.list(variables.session_id) });
      
      // CRITICAL: Invalidate quota cache so QuotaCard refetches updated quota
      // Backend-da auto-updates quota when saving prompts with tokens_used
      queryClient.invalidateQueries({ queryKey: ['quota'] });
    },
  });
}
