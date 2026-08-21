// src/hooks/useDataFetch.ts
import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * ✅ Universal hook for data fetching with complete safe-closure updates
 * Resolved infinite loops, stale scopes, and unmounted state warnings.
 */
export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // ✅ Latest Ref Pattern - ensures we always execute the fresh dynamic fetch scope without recreating refresh()
  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  });

  const refresh = useCallback(async (isMounted = { current: true }) => {
    if (isMounted.current) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await fetchFnRef.current();
      if (isMounted.current) {
        setData(result);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(err?.message || 'Data fetch failed'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const isMounted = { current: true };
    refresh(isMounted);

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refresh: () => refresh() };
}

/**
 * ✅ Delayed refresh helper - waits for backend queue to process state
 */
export function useDelayedRefresh(refreshFn: () => void | Promise<void>, delayMs = 300) {
  const refreshFnRef = useRef(refreshFn);
  useEffect(() => {
    refreshFnRef.current = refreshFn;
  });

  return useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    await refreshFnRef.current();
  }, [delayMs]);
}