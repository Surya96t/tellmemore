/**
 * useModels Hook
 * 
 * Provides access to available LLM models.
 * Currently returns static models list.
 * 
 * TODO: Migrate to dynamic fetching from GET /api/backend-llm/models
 */

import { MODELS, type Model } from '@/lib/constants/models';

interface UseModelsResult {
  data: Model[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to get available LLM models
 * 
 * For now, returns hardcoded models from lib/constants/models.ts
 * Later: Will be replaced with React Query fetch from backend
 * 
 * @example
 * ```tsx
 * const { data: models, isLoading } = useModels();
 * ```
 */
export function useModels(): UseModelsResult {
  // TODO: Replace with React Query when backend endpoint is ready
  // const { data, isLoading, error } = useQuery({
  //   queryKey: ['models'],
  //   queryFn: () => fetch('/api/backend-llm/models').then(r => r.json()),
  //   staleTime: 3600000, // 1 hour (models don't change often)
  // });

  return {
    data: MODELS,
    isLoading: false,
    error: null,
  };
}
