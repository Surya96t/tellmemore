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

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { ChatRequest } from '../api/types';

/**
 * Send a chat message to an LLM
 * 
 * Note: This ONLY sends the message to the LLM.
 * It does NOT update chat history or quota.
 * 
 * Cache updates are handled manually in DualChatView.tsx to avoid flicker.
 */
export function useSendChat() {
  return useMutation({
    mutationFn: (data: ChatRequest) => apiClient.chat.send(data),
    // No onSuccess - cache updates handled manually in DualChatView
    // to prevent flicker from unnecessary refetches
  });
}
