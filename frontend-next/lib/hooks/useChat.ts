/**
 * React Query hooks for LLM Chat
 * 
 * Provides hooks for sending chat messages to LLMs.
 * 
 * Usage:
 * ```tsx
 * const sendChat = useSendChat();
 * 
 * const handleSend = async () => {
 *   const response = await sendChat.mutateAsync({
 *     question: 'Hello, AI!',
 *     model: 'gpt-4o',
 *     session_id: sessionId,
 *   });
 *   console.log(response.answer);
 * };
 * ```
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { ChatRequest, ChatResponse } from '../api/types';
import { promptKeys } from './usePrompts';
import { quotaKeys } from './useQuota';

/**
 * Send a chat message to an LLM
 * 
 * This automatically:
 * - Sends the message to the selected model
 * - Saves the prompt and response to chat history
 * - Updates the user's quota
 * - Invalidates relevant queries
 */
export function useSendChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChatRequest) => apiClient.chat.send(data),
    onSuccess: (
      _data: ChatResponse,
      variables: ChatRequest
    ) => {
      // Invalidate chat history for this session
      if (variables.session_id) {
        queryClient.invalidateQueries({
          queryKey: promptKeys.list(variables.session_id),
        });
      }

      // Invalidate quota (it was updated by the backend)
      queryClient.invalidateQueries({
        queryKey: quotaKeys.all,
      });
    },
  });
}
