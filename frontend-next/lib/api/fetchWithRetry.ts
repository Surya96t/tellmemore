/**
 * API Client with Retry Logic
 * 
 * Enhanced fetch wrapper with:
 * - Automatic retries for network errors
 * - Exponential backoff
 * - Request timeout
 * - Error handling with user-friendly messages
 */

import { toast } from "sonner";

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  showErrorToast?: boolean;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 30000, // 30 seconds
  showErrorToast: true,
};

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable (network errors, 5xx server errors)
 */
function isRetryableError(error: unknown, status?: number): boolean {
  // Network errors (no response)
  if (!status) return true;

  // Server errors (5xx)
  if (status >= 500) return true;

  // Rate limiting (429)
  if (status === 429) return true;

  return false;
}

/**
 * Get user-friendly error message based on status code
 */
function getErrorMessage(status?: number): string {
  if (!status) {
    return "Network error. Please check your connection.";
  }

  switch (status) {
    case 400:
      return "Invalid request. Please try again.";
    case 401:
      return "Unauthorized. Please sign in again.";
    case 403:
      return "Access denied.";
    case 404:
      return "Resource not found.";
    case 429:
      return "Too many requests. Please wait a moment.";
    case 500:
      return "Server error. Our team has been notified.";
    case 503:
      return "Service unavailable. Please try again later.";
    default:
      return `Request failed (${status}). Please try again.`;
  }
}

/**
 * Enhanced fetch with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  const opts = { ...DEFAULT_OPTIONS, ...retryOptions };
  let lastError: Error | null = null;
  let lastStatus: number | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries!; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout!);

      // Make request
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If successful, return response
      if (response.ok) {
        return response;
      }

      // Store status for error message
      lastStatus = response.status;

      // If not retryable, throw immediately
      if (!isRetryableError(null, response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // If this was the last attempt, throw
      if (attempt === opts.maxRetries) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Wait before retry (exponential backoff)
      const delayMs = opts.retryDelay! * Math.pow(2, attempt);
      // console.log(
      //   `Request failed (${response.status}), retrying in ${delayMs}ms... (Attempt ${attempt + 1}/${opts.maxRetries})`
      // );
      await delay(delayMs);
    } catch (error: unknown) {
      lastError = error as Error;
      lastStatus = undefined;

      // If AbortError (timeout), retry
      if (error instanceof Error && error.name === "AbortError") {
        // console.log(
        //   `Request timeout, retrying... (Attempt ${attempt + 1}/${opts.maxRetries})`
        // );

        if (attempt < opts.maxRetries!) {
          const delayMs = opts.retryDelay! * Math.pow(2, attempt);
          await delay(delayMs);
          continue;
        }
      }

      // If network error, retry
      if (
        error instanceof Error &&
        (error.name === "TypeError" || error.message.includes("fetch"))
      ) {
        // console.log(
        //   `Network error, retrying... (Attempt ${attempt + 1}/${opts.maxRetries})`
        // );

        if (attempt < opts.maxRetries!) {
          const delayMs = opts.retryDelay! * Math.pow(2, attempt);
          await delay(delayMs);
          continue;
        }
      }

      // If this was the last attempt, throw
      if (attempt === opts.maxRetries) {
        break;
      }
    }
  }

  // All retries failed - show toast and throw
  const errorMessage = getErrorMessage(lastStatus);

  if (opts.showErrorToast) {
    toast.error("Request failed", {
      description: errorMessage,
    });
  }

  throw lastError || new Error(errorMessage);
}

/**
 * Wrapper for GET requests
 */
export async function get<T>(
  url: string,
  retryOptions?: RetryOptions
): Promise<T> {
  const response = await fetchWithRetry(url, { method: "GET" }, retryOptions);
  return response.json();
}

/**
 * Wrapper for POST requests
 */
export async function post<T>(
  url: string,
  data?: Record<string, unknown>,
  retryOptions?: RetryOptions
): Promise<T> {
  const response = await fetchWithRetry(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    retryOptions
  );
  return response.json();
}

/**
 * Wrapper for PUT requests
 */
export async function put<T>(
  url: string,
  data?: Record<string, unknown>,
  retryOptions?: RetryOptions
): Promise<T> {
  const response = await fetchWithRetry(
    url,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    retryOptions
  );
  return response.json();
}

/**
 * Wrapper for DELETE requests
 */
export async function del<T>(
  url: string,
  retryOptions?: RetryOptions
): Promise<T> {
  const response = await fetchWithRetry(
    url,
    { method: "DELETE" },
    retryOptions
  );
  return response.json();
}
