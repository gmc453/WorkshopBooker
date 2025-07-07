import { useState, useCallback, useRef } from 'react';
import { RateLimitHandler } from '../api/rateLimitHandler';

interface UseOptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey?: string;
  optimisticUpdate?: (oldData: any, newData: TVariables) => any;
  priority?: 'low' | 'normal' | 'high';
  retryOnRateLimit?: boolean;
  maxRetries?: number;
  initialRetryDelayMs?: number;
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
    maxRetries = 5,
    initialRetryDelayMs = 1000
  } = options as UseOptimisticMutationOptions<TData, TVariables> & { maxRetries?: number; initialRetryDelayMs?: number };

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
    // Helper sleep util
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const attemptMutation = async (attempt: number): Promise<TData | null> => {
      setIsLoading(true);
      setError(null);
      setIsRateLimited(false);

      try {
        // Optymistyczna aktualizacja – tylko przy pierwszej próbie
        if (attempt === 1 && optimisticUpdate && queryKey) {
          console.log('Optimistic update for:', queryKey);
        }

        // Wykonaj mutację z deduplikacją
        const result = await rateLimitHandlerRef.current!
          .createDeduplicatedRequest(() => mutationFn(variables), `${queryKey || 'mutation'}:${JSON.stringify(variables)}`)();

        return result;
      } catch (err: any) {
        if (err.response?.status === 429 && retryOnRateLimit && attempt <= maxRetries) {
          const serverDelaySec = err.response?.data?.retryAfterSeconds ?? 1;
          // exponential back-off: baseDelay * 2^(attempt-1)
          const delayMs = Math.max(initialRetryDelayMs, serverDelaySec * 1000) * Math.pow(2, attempt - 1);

          setIsRateLimited(true);
          setRateLimitInfo(err.response.data);

          await sleep(delayMs);
          // Po upływie czasu – spróbuj ponownie
          return attemptMutation(attempt + 1);
        }

        // Either not a rate-limit error or max retries exceeded
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    return attemptMutation(1);
  }, [mutationFn, optimisticUpdate, queryKey, retryOnRateLimit, maxRetries, initialRetryDelayMs, rateLimitHandlerRef]);

  return {
    mutate,
    isLoading,
    error,
    isRateLimited,
    rateLimitInfo
  };
} 