/**
 * React Query hooks for User Prompts (Custom Prompt Library)
 * 
 * Provides hooks for managing the user's custom prompt library.
 * 
 * Usage:
 * ```tsx
 * const { data: prompts, isLoading } = useUserPrompts();
 * const createPrompt = useCreateUserPrompt();
 * const deletePrompt = useDeleteUserPrompt();
 * 
 * const handleCreate = async () => {
 *   await createPrompt.mutateAsync({ prompt_text: 'My custom prompt' });
 * };
 * ```
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { UserPrompt, CreateUserPromptRequest } from '../api/types';

/**
 * Query keys for user prompts
 */
export const userPromptKeys = {
  all: ['user-prompts'] as const,
  lists: () => [...userPromptKeys.all, 'list'] as const,
};

/**
 * Fetch all user prompts
 */
export function useUserPrompts() {
  return useQuery({
    queryKey: userPromptKeys.lists(),
    queryFn: () => apiClient.userPrompts.list(),
    staleTime: 120_000, // Fresh for 2 minutes
    gcTime: 600_000, // Keep in cache for 10 minutes
  });
}

/**
 * Create a new user prompt
 */
export function useCreateUserPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPromptRequest) => apiClient.userPrompts.create(data),
    onMutate: async (newPrompt: CreateUserPromptRequest) => {
      await queryClient.cancelQueries({ queryKey: userPromptKeys.lists() });

      const previousPrompts = queryClient.getQueryData<UserPrompt[]>(userPromptKeys.lists());

      // Optimistically add new prompt
      queryClient.setQueryData<UserPrompt[]>(userPromptKeys.lists(), (old: UserPrompt[] | undefined) => [
        ...(old || []),
        {
          prompt_id: 'temp-' + Date.now(),
          user_id: 'temp',
          prompt_text: newPrompt.prompt_text,
        },
      ]);

      return { previousPrompts };
    },
    onError: (
      _err: Error,
      _variables: CreateUserPromptRequest,
      context?: { previousPrompts?: UserPrompt[] }
    ) => {
      if (context?.previousPrompts) {
        queryClient.setQueryData(userPromptKeys.lists(), context.previousPrompts);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPromptKeys.lists() });
    },
  });
}

/**
 * Delete a user prompt
 */
export function useDeleteUserPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promptId: string) => apiClient.userPrompts.delete(promptId),
    onMutate: async (promptId: string) => {
      await queryClient.cancelQueries({ queryKey: userPromptKeys.lists() });

      const previousPrompts = queryClient.getQueryData<UserPrompt[]>(userPromptKeys.lists());

      // Optimistically remove from list
      queryClient.setQueryData<UserPrompt[]>(userPromptKeys.lists(), (old: UserPrompt[] | undefined) =>
        old?.filter((prompt) => prompt.prompt_id !== promptId) || []
      );

      return { previousPrompts };
    },
    onError: (
      _err: Error,
      _variables: string,
      context?: { previousPrompts?: UserPrompt[] }
    ) => {
      if (context?.previousPrompts) {
        queryClient.setQueryData(userPromptKeys.lists(), context.previousPrompts);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPromptKeys.lists() });
    },
  });
}
