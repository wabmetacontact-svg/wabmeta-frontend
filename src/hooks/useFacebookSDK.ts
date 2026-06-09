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
  const [isReady, setIsReady] = useState(
    !!(window.FB && window.__FB_INITIALIZED__)
  );
  const [isLoading, setIsLoading] = useState(
    !(window.FB && window.__FB_INITIALIZED__)
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Already initialized
    if (window.FB && window.__FB_INITIALIZED__) {
      console.log('✅ SDK already ready');
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    // ✅ Listen for SDK ready event from HTML
    const handleSDKReady = () => {
      console.log('✅ Received fb-sdk-ready event');
      setIsReady(true);
      setIsLoading(false);
      setError(null);
    };

    window.addEventListener('fb-sdk-ready', handleSDKReady);

    // ✅ Polling fallback (check every 200ms)
    const pollInterval = setInterval(() => {
      if (window.FB && window.__FB_INITIALIZED__) {
        console.log('✅ SDK detected via polling');
        setIsReady(true);
        setIsLoading(false);
        clearInterval(pollInterval);
      }
    }, 200);

    // ✅ Timeout after 20 seconds
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (!window.__FB_INITIALIZED__) {
        console.error('❌ SDK initialization timeout');
        setError('Facebook SDK failed to load. Please refresh the page.');
        setIsLoading(false);
      }
    }, 20000);

    return () => {
      window.removeEventListener('fb-sdk-ready', handleSDKReady);
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, []);

  return {
    isReady,
    isLoading,
    error,
    FB: window.FB,
  };
};