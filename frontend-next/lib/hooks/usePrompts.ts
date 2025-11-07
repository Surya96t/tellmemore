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
    staleTime: Infinity, // Never consider data stale (prevents auto-refetch)
    gcTime: 300_000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    // NOTE: refetchOnMount defaults to true, but staleTime:Infinity prevents actual network request
    // This ensures query stays "active" and observes manual cache updates via setQueryData
    refetchOnReconnect: false, // Don't refetch on network reconnect
    // CRITICAL: Enable placeholderData to show cache immediately on mount
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Save a prompt and LLM responses to history
 * 
 * Note: Optimistic updates are handled manually in DualChatView.tsx
 * to avoid duplicate messages. This mutation only saves to backend
 * and triggers cache invalidation.
 */
export function useSavePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromptRequest) => apiClient.prompts.create(data),
    // onMutate disabled - optimistic updates handled manually in DualChatView
    onError: (_err: Error) => {
      console.error('❌ Failed to save prompt:', _err);
    },
    onSuccess: (data: Prompt, variables: CreatePromptRequest) => {
      console.log('✅ Prompt saved successfully', {
        promptId: data.prompt_id,
        responsesCount: data.llm_responses?.length,
        responses: data.llm_responses,
      });
      
      // Update cache with real backend data (replace temp ID with real ID)
      const queryKey = promptKeys.list(variables.session_id);
      const updatedData = queryClient.setQueryData<Prompt[]>(queryKey, (old: Prompt[] | undefined) => {
        if (!old || old.length === 0) {
          console.log('📝 Cache empty, adding backend data');
          return [data];
        }
        
        // Find the optimistic message by prompt_text (since temp ID will differ)
        const tempIndex = old.findIndex(msg => 
          msg.prompt_text === variables.prompt_text && msg.prompt_id.startsWith('temp-')
        );
        
        if (tempIndex !== -1) {
          const tempMessage = old[tempIndex];
          console.log('🔄 Replacing temp message with backend data:', {
            tempId: tempMessage.prompt_id,
            realId: data.prompt_id,
            tempResponses: tempMessage.llm_responses?.length || 0,
            backendResponses: data.llm_responses?.length || 0,
          });
          
          // CRITICAL FIX: Always use backend data for responses (it's the source of truth)
          // The streaming updates were just optimistic - backend has the final, complete responses
          const finalMessage: Prompt = {
            ...data, // Use complete backend data (ID, timestamp, responses)
          };
          
          console.log('✅ Final message to cache:', {
            promptId: finalMessage.prompt_id,
            responsesCount: finalMessage.llm_responses?.length,
            responses: finalMessage.llm_responses,
          });
          
          // Replace temp message with final message
          return [
            ...old.slice(0, tempIndex),
            finalMessage,
            ...old.slice(tempIndex + 1),
          ];
        }
        
        // If no temp message found, just append (shouldn't happen)
        console.warn('⚠️ No temp message found, appending backend data');
        return [...old, data];
      });
      
      console.log('🔍 Cache after update:', {
        queryKey,
        dataCount: updatedData?.length,
        lastMessage: updatedData?.[updatedData.length - 1],
      });
      
      // CRITICAL: Invalidate quota cache so QuotaCard refetches updated quota
      // Backend-da auto-updates quota when saving prompts with tokens_used
      queryClient.invalidateQueries({ queryKey: ['quota'] });
    },
  });
}
