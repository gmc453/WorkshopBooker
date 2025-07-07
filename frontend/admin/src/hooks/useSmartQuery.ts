import { useState, useEffect, useRef, useCallback } from 'react';
import { RateLimitHandler } from '../api/rateLimitHandler';

interface UseSmartQueryOptions<T> {
  queryFn: () => Promise<T>;
  deduplication?: boolean;
  debounceMs?: number;
  enabled?: boolean;
  retryOnRateLimit?: boolean;
  maxRetries?: number;
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
    maxRetries = 3
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
  const retryCountRef = useRef<number>(0);

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

      setData(result);
      // Reset retry count on success
      retryCountRef.current = 0;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Ignoruj anulowane żądania
      }

      if (err.response?.status === 429 && retryOnRateLimit && retryCountRef.current < maxRetries) {
        setIsRateLimited(true);
        setRateLimitInfo(err.response.data);
        
        // Calculate exponential backoff delay
        const baseDelay = err.response.data.retryAfterSeconds * 1000;
        const backoffDelay = Math.min(baseDelay * Math.pow(2, retryCountRef.current), 30000); // Max 30 seconds
        
        retryCountRef.current++;
        
        // Automatyczny retry po czasie z exponential backoff
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setIsRateLimited(false);
          executeQuery();
        }, backoffDelay);
      } else {
        // Reset retry count on non-rate-limit error or max retries exceeded
        retryCountRef.current = 0;
        
        if (err.response?.status === 429 && retryCountRef.current >= maxRetries) {
          const maxRetriesError = new Error(`Rate limit exceeded. Max retries (${maxRetries}) reached.`);
          setError(maxRetriesError);
        } else {
          setError(err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, enabled, deduplication, retryOnRateLimit, maxRetries]);

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
    retryCountRef.current = 0;  // Reset retry count on manual refetch
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