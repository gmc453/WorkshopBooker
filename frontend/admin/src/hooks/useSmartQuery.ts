import { useState, useEffect, useRef, useCallback } from 'react';
import { RateLimitHandler } from '../api/rateLimitHandler';

interface UseSmartQueryOptions<T> {
  queryFn: () => Promise<T>;
  deduplication?: boolean;
  debounceMs?: number;
  enabled?: boolean;
  retryOnRateLimit?: boolean;
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
    retryOnRateLimit = true
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
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Ignoruj anulowane żądania
      }

      if (err.response?.status === 429 && retryOnRateLimit) {
        setIsRateLimited(true);
        setRateLimitInfo(err.response.data);
        
        // Automatyczny retry po czasie
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setIsRateLimited(false);
          executeQuery();
        }, err.response.data.retryAfterSeconds * 1000);
      } else {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, enabled, deduplication, retryOnRateLimit]);

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