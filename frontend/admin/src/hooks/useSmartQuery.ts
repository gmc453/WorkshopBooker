import { useState, useEffect, useRef, useCallback } from 'react';
import { RateLimitHandler } from '../api/rateLimitHandler';

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
    debounceMs = 100, // Zmniejszamy domyślny debounce
    enabled = true,
    retryOnRateLimit = true,
    maxRetries = 1, // Zmniejszamy z 3 na 1
    baseRetryDelayMs = 500 // Zmniejszamy z 1000 na 500
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
  const retryTimeoutRef = useRef<number | null>(null);
  const isRetryingRef = useRef<boolean>(false);
  const queryFnRef = useRef(queryFn);

  // Aktualizuj queryFn ref gdy się zmieni
  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

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

  // Query function - usunięto queryFn z dependency array
  const executeQuery = useCallback(async () => {
    if (!enabled) return;

    // Reset retry count for new query attempts
    retryCountRef.current = 0;
    isRetryingRef.current = false;
    
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    return await performQueryWithRetry();
  }, [enabled, deduplication, retryOnRateLimit, maxRetries, baseRetryDelayMs]);

  const performQueryWithRetry = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    // Only set loading to true if we're not already in a retry cycle
    if (!isRetryingRef.current) {
      setIsLoading(true);
    }
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
        // Utwórz nowe żądanie używając ref
        const promise = queryFnRef.current();
        pendingRequestRef.current = promise;
        
        try {
          result = await promise;
        } finally {
          pendingRequestRef.current = null;
        }
      }

      // Reset retry count on success
      retryCountRef.current = 0;
      isRetryingRef.current = false;
      setData(result);
      setError(null); // Reset error on success
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Ignoruj anulowane żądania
      }

      // Sprawdź czy to nie jest już ostatni retry
      if (err.response?.status === 429 && retryOnRateLimit && retryCountRef.current < maxRetries) {
        setIsRateLimited(true);
        setRateLimitInfo(err.response.data);
        
        // Increment retry count
        retryCountRef.current += 1;
        
        // Calculate delay with exponential backoff and jitter
        const retryAfterMs = err.response.data?.retryAfterSeconds 
          ? err.response.data.retryAfterSeconds * 1000 
          : baseRetryDelayMs * Math.pow(2, retryCountRef.current - 1);
        
        // Add jitter (±10% of delay) - zmniejszamy z 25% na 10%
        const jitter = retryAfterMs * 0.2 * (Math.random() - 0.5);
        const finalDelay = Math.max(500, retryAfterMs + jitter); // Minimum 500ms delay
        
        console.log(`Rate limited. Retrying in ${finalDelay}ms (attempt ${retryCountRef.current}/${maxRetries})`);
        
        // Clear existing retry timeout (not debounce timeout)
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        
        // Mark as retrying to maintain loading state
        isRetryingRef.current = true;
        
        // Schedule retry
        retryTimeoutRef.current = setTimeout(async () => {
          setIsRateLimited(false);
          try {
            await performQueryWithRetry();
          } catch (retryErr) {
            // Error already handled in performQueryWithRetry
          }
        }, finalDelay);
        
        // Don't set isLoading to false here - keep it true during retry delay
        return;
      } else {
        // Max retries exceeded or non-rate-limit error
        if (err.response?.status === 429 && retryCountRef.current >= maxRetries) {
          const exhaustedError = new Error(`Maximum retry attempts (${maxRetries}) exceeded for rate-limited request`);
          exhaustedError.name = 'RetryExhaustedError';
          setError(exhaustedError);
        } else {
          setError(err);
        }
        isRetryingRef.current = false;
        setIsRateLimited(false); // Reset rate limit state on final error
      }
    } finally {
      // Only set loading to false if we're not in a retry cycle
      if (!isRetryingRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled, deduplication, retryOnRateLimit, maxRetries, baseRetryDelayMs]);

  // Debounced query function - usunięto executeQuery z dependency array
  const debouncedQuery = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      executeQuery();
    }, debounceMs);
  }, [debounceMs]);

  // Wykonaj zapytanie przy montowaniu i zmianie enabled - usunięto debouncedQuery i queryFn z dependency array
  useEffect(() => {
    if (enabled) {
      debouncedQuery();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled]);

  // Cleanup przy odmontowaniu
  useEffect(() => {
    return () => {
      // ✅ POPRAWKA: Bezpieczne cleanup z null check
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (error) {
          console.warn('Error during abort controller cleanup:', error);
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      // Reset refs
      pendingRequestRef.current = null;
      retryCountRef.current = 0;
      isRetryingRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    setIsRateLimited(false);
    setRateLimitInfo(null);
    retryCountRef.current = 0;
    isRetryingRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
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