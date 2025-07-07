import { useState, useCallback, useRef } from 'react';
import { RateLimitHandler } from '../api/rateLimitHandler';

interface RetryState {
  count: number;
  lastRetryAt: number;
}

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
  const retryStateRef = useRef<RetryState>({ count: 0, lastRetryAt: 0 });

  // Inicjalizacja rate limit handler
  if (!rateLimitHandlerRef.current) {
    rateLimitHandlerRef.current = new RateLimitHandler(
      (info) => {
        setRateLimitInfo(info);
        setIsRateLimited(true);
      }
    );
  }

  // Calculate exponential backoff delay with jitter
  const calculateRetryDelay = useCallback((retryCount: number, serverRetryAfter?: number): number => {
    if (serverRetryAfter) {
      return serverRetryAfter * 1000;
    }
    
    // Exponential backoff: 2^retryCount * baseDelay + jitter
    const exponentialDelay = Math.pow(2, retryCount) * baseRetryDelayMs;
    const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }, [baseRetryDelayMs]);

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

      // Reset retry state on success
      retryStateRef.current = { count: 0, lastRetryAt: 0 };
      return result;
    } catch (err: any) {
      if (err.response?.status === 429 && retryOnRateLimit) {
        // Check if we've exceeded max retries
        if (retryStateRef.current.count >= maxRetries) {
          setError(new Error(`Maximum retry attempts (${maxRetries}) exceeded for rate limited request`));
          setIsRateLimited(false);
          retryStateRef.current = { count: 0, lastRetryAt: 0 };
          throw new Error(`Rate limit exceeded after ${maxRetries} retries`);
        }

        // Circuit breaker: prevent retry storms
        const now = Date.now();
        const timeSinceLastRetry = now - retryStateRef.current.lastRetryAt;
        if (timeSinceLastRetry < 1000) { // Minimum 1 second between retries
          setError(new Error('Rate limit retry prevented due to circuit breaker'));
          throw new Error('Rate limit retry circuit breaker activated');
        }

        setIsRateLimited(true);
        setRateLimitInfo(err.response.data);
        retryStateRef.current.count++;
        retryStateRef.current.lastRetryAt = now;
        
        // Calculate retry delay with exponential backoff
        const retryDelay = calculateRetryDelay(
          retryStateRef.current.count - 1, 
          err.response.data?.retryAfterSeconds
        );
        
        // Schedule retry with proper safeguards
        setTimeout(() => {
          setIsRateLimited(false);
          mutate(variables).catch(() => {
            // Silently handle errors from automatic retries
            // The error will already be set in the catch block above
          });
        }, retryDelay);
        
        return null;
      } else {
        retryStateRef.current = { count: 0, lastRetryAt: 0 };
        setError(err);
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, optimisticUpdate, queryKey, retryOnRateLimit, maxRetries, calculateRetryDelay]);

  return {
    mutate,
    isLoading,
    error,
    isRateLimited,
    rateLimitInfo
  };
} 