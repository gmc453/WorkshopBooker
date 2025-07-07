import { useState, useCallback, useRef } from 'react';
import { RateLimitHandler } from '../api/rateLimitHandler';

interface UseOptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey?: string;
  optimisticUpdate?: (oldData: any, newData: TVariables) => any;
  priority?: 'low' | 'normal' | 'high';
  retryOnRateLimit?: boolean;
}

interface UseOptimisticMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  isLoading: boolean;
  error: Error | null;
  isRateLimited: boolean;
  rateLimitInfo: any;
}

export function useOptimisticMutation<TData, TVariables>(
  options: UseOptimisticMutationOptions<TData, TVariables>
): UseOptimisticMutationResult<TData, TVariables> {
  const {
    mutationFn,
    queryKey,
    optimisticUpdate,
    retryOnRateLimit = true
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);

  const rateLimitHandlerRef = useRef<RateLimitHandler | null>(null);

  // Inicjalizacja rate limit handler
  if (!rateLimitHandlerRef.current) {
    rateLimitHandlerRef.current = new RateLimitHandler(
      (info) => {
        setRateLimitInfo(info);
        setIsRateLimited(true);
      }
    );
  }

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    setIsLoading(true);
    setError(null);
    setIsRateLimited(false);

    try {
      // Optymistyczna aktualizacja
      if (optimisticUpdate && queryKey) {
        // Tutaj możesz dodać logikę do aktualizacji cache
        console.log('Optimistic update for:', queryKey);
      }

      // Wykonaj mutację z retry logic
      const result = await rateLimitHandlerRef.current!.createDeduplicatedRequest(
        () => mutationFn(variables),
        `${queryKey || 'mutation'}:${JSON.stringify(variables)}`
      )();

      return result;
    } catch (err: any) {
      if (err.response?.status === 429 && retryOnRateLimit) {
        setIsRateLimited(true);
        setRateLimitInfo(err.response.data);
        
        // Automatyczny retry po czasie
        setTimeout(() => {
          setIsRateLimited(false);
          mutate(variables);
        }, err.response.data.retryAfterSeconds * 1000);
        
        return null;
      } else {
        setError(err);
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, optimisticUpdate, queryKey, retryOnRateLimit, rateLimitHandlerRef]);

  return {
    mutate,
    isLoading,
    error,
    isRateLimited,
    rateLimitInfo
  };
} 