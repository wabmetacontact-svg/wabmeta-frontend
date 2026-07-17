// src/hooks/useFacebookSDK.ts
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit?: (() => void) | undefined;
    __FB_INITIALIZED__?: boolean;
  }
}

export const useFacebookSDK = () => {
  const checkReady = () => !!(window.FB && window.__FB_INITIALIZED__);
  
  const [isReady, setIsReady] = useState(checkReady);
  const [isLoading, setIsLoading] = useState(!checkReady());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Re-check on mount (sync state with current reality)
    if (checkReady()) {
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    let mounted = true; // ✅ Prevent state updates after unmount

    const handleSDKReady = () => {
      if (!mounted) return;
      setIsReady(true);
      setIsLoading(false);
      setError(null);
    };

    window.addEventListener('fb-sdk-ready', handleSDKReady);

    const pollInterval = setInterval(() => {
      if (!mounted) return;
      if (checkReady()) {
        setIsReady(true);
        setIsLoading(false);
        clearInterval(pollInterval);
      }
    }, 200);

    const timeout = setTimeout(() => {
      if (!mounted) return;
      clearInterval(pollInterval);
      if (!checkReady()) {
        setError('Facebook SDK failed to load. Please refresh the page.');
        setIsLoading(false);
      }
    }, 20000);

    return () => {
      mounted = false; // ✅ Cleanup
      window.removeEventListener('fb-sdk-ready', handleSDKReady);
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, []); // ✅ Only on mount

  return { isReady, isLoading, error, FB: window.FB };
};