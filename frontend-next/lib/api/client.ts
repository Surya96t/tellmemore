/**
 * Type-safe API client for all BFF endpoints
 * 
 * This client provides methods for all backend operations.
 * All requests go through the BFF layer (Next.js API routes).
 * 
 * Usage:
 * ```ts
 * import { apiClient } from '@/lib/api/client';
 * 
 * const sessions = await apiClient.sessions.list();
 * const newSession = await apiClient.sessions.create({ title: 'My Chat' });
 * ```
 */

import type {
  ChatSession,
  CreateSessionRequest,
  Prompt,
  CreatePromptRequest,
  ChatRequest,
  ChatResponse,
  Quota,
  UserPrompt,
  CreateUserPromptRequest,
  SystemPrompt,
  AuthStatus,
  ApiError,
} from './types';

/**
 * Base fetch wrapper with error handling
 */
async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: 'Request failed',
      detail: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.detail || error.error);
  }

  return response.json();
}

/**
 * Chat Sessions API
 */
export const sessionsApi = {
  /**
   * Get all sessions for the current user
   */
  list: async (): Promise<ChatSession[]> => {
    return fetchApi<ChatSession[]>('/api/backend-da/sessions');
  },

  /**
   * Create a new chat session
   */
  create: async (data: CreateSessionRequest): Promise<ChatSession> => {
    return fetchApi<ChatSession>('/api/backend-da/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get a specific session by ID (future)
   */
  get: async (sessionId: string): Promise<ChatSession> => {
    return fetchApi<ChatSession>(`/api/backend-da/sessions/${sessionId}`);
  },

  /**
   * Update a session (future)
   */
  update: async (sessionId: string, data: Partial<CreateSessionRequest>): Promise<ChatSession> => {
    return fetchApi<ChatSession>(`/api/backend-da/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a session (future)
   */
  delete: async (sessionId: string): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/api/backend-da/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Prompts (Chat History) API
 */
export const promptsApi = {
  /**
   * Get all prompts for a session (chat history)
   */
  list: async (sessionId: string): Promise<Prompt[]> => {
    return fetchApi<Prompt[]>(`/api/backend-da/prompts?session_id=${sessionId}`);
  },

  /**
   * Save a new prompt and LLM responses
   */
  create: async (data: CreatePromptRequest): Promise<Prompt> => {
    return fetchApi<Prompt>('/api/backend-da/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * LLM Chat API
 */
export const chatApi = {
  /**
   * Send a chat message to an LLM
   */
  send: async (data: ChatRequest): Promise<ChatResponse> => {
    return fetchApi<ChatResponse>('/api/backend-llm/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * User Quota API
 */
export const quotaApi = {
  /**
   * Get current user's quota
   */
  get: async (): Promise<Quota> => {
    return fetchApi<Quota>('/api/backend-da/quota');
  },
};

/**
 * User Prompts (Custom Prompt Library) API
 */
export const userPromptsApi = {
  /**
   * Get all custom prompts for the current user
   */
  list: async (): Promise<UserPrompt[]> => {
    return fetchApi<UserPrompt[]>('/api/backend-da/user-prompts');
  },

  /**
   * Create a new custom prompt
   */
  create: async (data: CreateUserPromptRequest): Promise<UserPrompt> => {
    return fetchApi<UserPrompt>('/api/backend-da/user-prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a custom prompt
   */
  delete: async (promptId: string): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/api/backend-da/user-prompts?id=${promptId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * System Prompts API
 */
export const systemPromptsApi = {
  /**
   * Get all system prompts
   */
  list: async (): Promise<SystemPrompt[]> => {
    return fetchApi<SystemPrompt[]>('/api/backend-da/system-prompts');
  },
};

/**
 * Auth API
 */
export const authApi = {
  /**
   * Check authentication status
   */
  status: async (): Promise<AuthStatus> => {
    return fetchApi<AuthStatus>('/api/backend-da/auth');
  },
};

/**
 * Combined API client
 */
export const apiClient = {
  sessions: sessionsApi,
  prompts: promptsApi,
  chat: chatApi,
  quota: quotaApi,
  userPrompts: userPromptsApi,
  systemPrompts: systemPromptsApi,
  auth: authApi,
};
