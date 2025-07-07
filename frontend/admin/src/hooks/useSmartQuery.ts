import { useState, useEffect, useRef, useCallback } from 'react';
import { RateLimitHandler } from '../api/rateLimitHandler';

interface RetryState {
  count: number;
  lastRetryAt: number;
}

interface UseSmartQueryOptions<T> {
  queryFn: () => Promise<T>;
  deduplication?: boolean;
  debounceMs?: number;
  enabled?: boolean;
  retryOnRateLimit?: boolean;
  maxRetries?: number;
  baseRetryDelayMs?: number;
}

interface UseSmartQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isRateLimited: boolean;
  rateLimitInfo: any;
  refetch: () => Promise<void>;
}

export function useSmartQuery<T>(options: UseSmartQueryOptions<T>): UseSmartQueryResult<T> {
  const {
    queryFn,
    deduplication = true,
    debounceMs = 300,
    enabled = true,
    retryOnRateLimit = true,
    maxRetries = 3,
    baseRetryDelayMs = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingRequestRef = useRef<Promise<T> | null>(null);
  const rateLimitHandlerRef = useRef<RateLimitHandler | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const retryStateRef = useRef<RetryState>({ count: 0, lastRetryAt: 0 });

  // Inicjalizacja rate limit handler
  useEffect(() => {
    if (!rateLimitHandlerRef.current) {
      rateLimitHandlerRef.current = new RateLimitHandler(
        (info) => {
          setRateLimitInfo(info);
          setIsRateLimited(true);
        }
      );
    }
  }, []);

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

  // Query function
  const executeQuery = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);
    setIsRateLimited(false);

    try {
      // Anuluj poprzednie żądanie
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      let result: T;
      
      if (deduplication && pendingRequestRef.current) {
        // Użyj istniejącego żądania
        result = await pendingRequestRef.current;
      } else {
        // Utwórz nowe żądanie
        const promise = queryFn();
        pendingRequestRef.current = promise;
        
        try {
          result = await promise;
        } finally {
          pendingRequestRef.current = null;
        }
      }

      // Reset retry state on success
      retryStateRef.current = { count: 0, lastRetryAt: 0 };
      setData(result);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Ignoruj anulowane żądania
      }

      if (err.response?.status === 429 && retryOnRateLimit) {
        // Check if we've exceeded max retries
        if (retryStateRef.current.count >= maxRetries) {
          setError(new Error(`Maximum retry attempts (${maxRetries}) exceeded for rate limited query`));
          setIsRateLimited(false);
          retryStateRef.current = { count: 0, lastRetryAt: 0 };
          return;
        }

        // Circuit breaker: prevent retry storms
        const now = Date.now();
        const timeSinceLastRetry = now - retryStateRef.current.lastRetryAt;
        if (timeSinceLastRetry < 1000) { // Minimum 1 second between retries
          setError(new Error('Rate limit retry prevented due to circuit breaker'));
          return;
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
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setIsRateLimited(false);
          executeQuery().catch(() => {
            // Silently handle errors from automatic retries
            // The error will already be set in the catch block above
          });
        }, retryDelay);
      } else {
        retryStateRef.current = { count: 0, lastRetryAt: 0 };
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, enabled, deduplication, retryOnRateLimit, maxRetries, calculateRetryDelay]);

  // Debounced query function
  const debouncedQuery = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      executeQuery();
    }, debounceMs);
  }, [executeQuery, debounceMs]);

  // Wykonaj zapytanie przy montowaniu i zmianie enabled
  useEffect(() => {
    if (enabled) {
      debouncedQuery();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, debouncedQuery, queryFn]);

  // Cleanup przy odmontowaniu
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const refetch = useCallback(async () => {
    setIsRateLimited(false);
    setRateLimitInfo(null);
    setError(null);
    retryStateRef.current = { count: 0, lastRetryAt: 0 };
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await executeQuery();
  }, [executeQuery]);

  return {
    data,
    isLoading,
    error,
    isRateLimited,
    rateLimitInfo,
    refetch
  };
} 