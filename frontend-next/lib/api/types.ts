/**
 * TypeScript type definitions for all BFF API endpoints
 * 
 * These types match the schemas from Backend-da and Backend-llm.
 * They are used throughout the application for type safety.
 */

/**
 * Chat Sessions
 */
export interface ChatSession {
  session_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface CreateSessionRequest {
  title: string;
}

/**
 * Chat Messages & History
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Prompt {
  prompt_id: string;
  user_id: string;
  session_id: string;
  prompt_text: string;
  llm_responses: string[];
  tokens_used?: number;
  timestamp: string;
}

export interface CreatePromptRequest {
  session_id: string;
  prompt_text: string;
  llm_responses: string[];
  tokens_used?: number;
}

/**
 * LLM Chat
 */
export type ModelProvider = 'openai' | 'google' | 'groq';

export type ModelName =
  // OpenAI
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'o1-preview'
  | 'o1-mini'
  // Google Gemini
  | 'gemini-2.0-flash-exp'
  | 'gemini-exp-1206'
  | 'gemini-2.0-flash-thinking-exp-1219'
  | 'gemini-1.5-pro-latest'
  | 'gemini-1.5-flash-latest'
  // Groq LLaMA
  | 'llama-3.3-70b-versatile'
  | 'llama-3.1-70b-versatile'
  | 'llama-3.1-8b-instant';

export interface ChatRequest {
  question: string;
  model: ModelName;
  session_id?: string;
  chat_history?: ChatMessage[];
  system_prompts?: string[];
}

export interface ChatResponse {
  answer: string | null;
  raw_response?: unknown;
  error_message?: string | null;
  session_id: string;
  model: string;
  provider: string;
  request_timestamp: string;
  response_timestamp: string;
  latency_ms: number;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    // Gemini uses different names
    prompt_token_count?: number;
    candidates_token_count?: number;
    total_token_count?: number;
  };
}

/**
 * User Quota
 */
export interface Quota {
  user_id: string;
  daily_limit: number;
  used_today: number;
  last_reset: string | null;
  quota_remaining?: number; // Computed field
  reset_at?: string; // Computed field
}

/**
 * User Prompts (Custom Prompt Library)
 */
export interface UserPrompt {
  prompt_id: string;
  user_id: string;
  prompt_text: string;
}

export interface CreateUserPromptRequest {
  prompt_text: string;
}

/**
 * System Prompts
 */
export interface SystemPrompt {
  prompt_id: string;
  prompt_text: string;
}

/**
 * Auth Status
 */
export interface AuthStatus {
  authenticated: boolean;
  userId?: string;
  message: string;
}

/**
 * Error Response
 */
export interface ApiError {
  error: string;
  detail?: string;
}

/**
 * API Response wrapper for better error handling
 */
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError };
