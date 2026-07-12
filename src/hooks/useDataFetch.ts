// src/hooks/useDataFetch.ts - Universal data fetching helper

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * ✅ Universal hook for data fetching with auto-refresh support
 * 
 * Usage:
 * const { data, loading, refresh } = useDataFetch(
 *   () => api.contacts.getAll(),
 *   [dependency1, dependency2]
 * );
 */
export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    refresh();

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refresh };
}

/**
 * ✅ Delayed refresh helper - waits for backend to complete
 * Use when you want to ensure server has processed the change
 */
export function useDelayedRefresh(refreshFn: () => void | Promise<void>, delayMs = 300) {
  return useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    await refreshFn();
  }, [refreshFn, delayMs]);
}
