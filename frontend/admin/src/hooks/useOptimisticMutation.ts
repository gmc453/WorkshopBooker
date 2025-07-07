import { useState, useCallback, useRef } from 'react';
import { RateLimitHandler } from '../api/rateLimitHandler';

interface UseOptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey?: string;
  optimisticUpdate?: (oldData: any, newData: TVariables) => any;
  priority?: 'low' | 'normal' | 'high';
  retryOnRateLimit?: boolean;
  maxRetries?: number;
  baseRetryDelayMs?: number;
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
    maxRetries = 3,
    baseRetryDelayMs = 1000
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
    // Reset retry count for new mutation attempts
    retryCountRef.current = 0;
    
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    return await performMutationWithRetry(variables);
  }, [mutationFn, optimisticUpdate, queryKey, retryOnRateLimit, maxRetries, baseRetryDelayMs]);

  const performMutationWithRetry = useCallback(async (variables: TVariables): Promise<TData | null> => {
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
        
        // Increment retry count
        retryCountRef.current += 1;
        
        // Calculate delay with exponential backoff and jitter
        const retryAfterMs = err.response.data?.retryAfterSeconds 
          ? err.response.data.retryAfterSeconds * 1000 
          : baseRetryDelayMs * Math.pow(2, retryCountRef.current - 1);
        
        // Add jitter (±25% of delay)
        const jitter = retryAfterMs * 0.25 * (Math.random() - 0.5);
        const finalDelay = Math.max(1000, retryAfterMs + jitter); // Minimum 1s delay
        
        console.log(`Rate limited. Retrying in ${finalDelay}ms (attempt ${retryCountRef.current}/${maxRetries})`);
        
        // Schedule retry
        return new Promise((resolve) => {
          retryTimeoutRef.current = setTimeout(async () => {
            setIsRateLimited(false);
            try {
              const result = await performMutationWithRetry(variables);
              resolve(result);
            } catch (retryErr) {
              resolve(null);
            }
          }, finalDelay);
        });
      } else {
        // Max retries exceeded or non-rate-limit error
        if (err.response?.status === 429 && retryCountRef.current >= maxRetries) {
          const exhaustedError = new Error(`Maximum retry attempts (${maxRetries}) exceeded for rate-limited request`);
          exhaustedError.name = 'RetryExhaustedError';
          setError(exhaustedError);
        } else {
          setError(err);
        }
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, optimisticUpdate, queryKey, retryOnRateLimit, maxRetries, baseRetryDelayMs]);

  return {
    mutate,
    isLoading,
    error,
    isRateLimited,
    rateLimitInfo
  };
} 