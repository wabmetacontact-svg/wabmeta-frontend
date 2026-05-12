// src/hooks/useFacebookSDK.ts
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit?: (() => void) | undefined;
  }
}

let sdkLoadingPromise: Promise<void> | null = null;

const loadFacebookSDK = (): Promise<void> => {
  if (sdkLoadingPromise) return sdkLoadingPromise;

  sdkLoadingPromise = new Promise((resolve, reject) => {
    // Already loaded?
    if (window.FB) {
      console.log('✅ Facebook SDK already loaded');
      resolve();
      return;
    }

    const appId = import.meta.env.VITE_META_APP_ID;
    if (!appId) {
      console.error('❌ VITE_META_APP_ID not set in .env');
      reject(new Error('Facebook App ID not configured'));
      return;
    }

    // Setup async init callback
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v22.0',
      });
      console.log('✅ Facebook SDK initialized with appId:', appId);
      resolve();
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
    }

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!window.FB) {
        reject(new Error('Facebook SDK load timeout'));
      }
    }, 10000);
  });

  return sdkLoadingPromise;
};

export const useFacebookSDK = () => {
  const [isReady, setIsReady] = useState(!!window.FB);
  const [isLoading, setIsLoading] = useState(!window.FB);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.FB) {
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    loadFacebookSDK()
      .then(() => {
        setIsReady(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('SDK load error:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return {
    isReady,
    isLoading,
    error,
    FB: window.FB,
  };
};