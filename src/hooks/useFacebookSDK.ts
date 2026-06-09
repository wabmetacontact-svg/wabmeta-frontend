// src/hooks/useFacebookSDK.ts
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit?: (() => void) | undefined;
    __FB_INITIALIZED__?: boolean; // ✅ Track init status
  }
}

let sdkLoadingPromise: Promise<void> | null = null;

const loadFacebookSDK = (): Promise<void> => {
  if (sdkLoadingPromise) return sdkLoadingPromise;

  sdkLoadingPromise = new Promise((resolve, reject) => {
    // ✅ Already initialized?
    if (window.FB && window.__FB_INITIALIZED__) {
      console.log('✅ Facebook SDK already initialized');
      resolve();
      return;
    }

    const appId = import.meta.env.VITE_META_APP_ID;
    if (!appId) {
      console.error('❌ VITE_META_APP_ID not set in .env');
      reject(new Error('Facebook App ID not configured'));
      return;
    }

    // ✅ Setup async init callback BEFORE loading script
    window.fbAsyncInit = function () {
      try {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v23.0',
        });
        window.__FB_INITIALIZED__ = true; // ✅ Mark as initialized
        console.log('✅ Facebook SDK initialized with appId:', appId);
        resolve();
      } catch (err: any) {
        console.error('❌ FB.init failed:', err);
        reject(err);
      }
    };

    // Inject script if not already present
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onerror = () => {
        console.error('❌ Failed to load Facebook SDK');
        reject(new Error('Failed to load Facebook SDK'));
      };
      document.body.appendChild(script);
    } else if (window.FB && !window.__FB_INITIALIZED__) {
      // Script loaded but init didn't run - trigger manually
      window.fbAsyncInit();
    }

    // Timeout after 15 seconds
    setTimeout(() => {
      if (!window.__FB_INITIALIZED__) {
        reject(new Error('Facebook SDK initialization timeout'));
      }
    }, 15000);
  });

  return sdkLoadingPromise;
};

export const useFacebookSDK = () => {
  // ✅ Check BOTH FB object AND initialization flag
  const [isReady, setIsReady] = useState(
    !!(window.FB && window.__FB_INITIALIZED__)
  );
  const [isLoading, setIsLoading] = useState(
    !(window.FB && window.__FB_INITIALIZED__)
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Already initialized
    if (window.FB && window.__FB_INITIALIZED__) {
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    loadFacebookSDK()
      .then(() => {
        setIsReady(true);
        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error('SDK load error:', err);
        setError(err.message);
        setIsLoading(false);
        setIsReady(false);
      });
  }, []);

  return {
    isReady,
    isLoading,
    error,
    FB: window.FB,
  };
};