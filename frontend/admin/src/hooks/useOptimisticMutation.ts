import { useState, useCallback, useRef, useEffect } from 'react';
import { RateLimitHandler } from '../api/rateLimitHandler';

interface UseOptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey?: string;
  optimisticUpdate?: (oldData: any, newData: TVariables) => any;
  priority?: 'low' | 'normal' | 'high';
  retryOnRateLimit?: boolean;
  maxRetries?: number;
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
    retryOnRateLimit = true,
    maxRetries = 3
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);

  const rateLimitHandlerRef = useRef<RateLimitHandler | null>(null);
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<number | null>(null);

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

      // Reset retry count on success
      retryCountRef.current = 0;
      return result;
    } catch (err: any) {
      if (err.response?.status === 429 && retryOnRateLimit && retryCountRef.current < maxRetries) {
        setIsRateLimited(true);
        setRateLimitInfo(err.response.data);
        
        // Calculate exponential backoff delay
        const baseDelay = err.response.data.retryAfterSeconds * 1000;
        const backoffDelay = Math.min(baseDelay * Math.pow(2, retryCountRef.current), 30000); // Max 30 seconds
        
        retryCountRef.current++;
        
        // Clear any existing timeout
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        
        // Automatyczny retry po czasie z exponential backoff
        retryTimeoutRef.current = setTimeout(() => {
          setIsRateLimited(false);
          mutate(variables);
        }, backoffDelay);
        
        return null;
      } else {
        // Reset retry count on non-rate-limit error or max retries exceeded
        retryCountRef.current = 0;
        
        if (err.response?.status === 429 && retryCountRef.current >= maxRetries) {
          const maxRetriesError = new Error(`Rate limit exceeded. Max retries (${maxRetries}) reached.`);
          setError(maxRetriesError);
          throw maxRetriesError;
        }
        
        setError(err);
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, optimisticUpdate, queryKey, retryOnRateLimit, maxRetries, rateLimitHandlerRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    mutate,
    isLoading,
    error,
    isRateLimited,
    rateLimitInfo
  };
} 