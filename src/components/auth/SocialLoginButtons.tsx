// src/components/auth/SocialLoginButtons.tsx - PRODUCTION READY

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface SocialLoginButtonsProps {
  loading?: boolean;
  onSuccess?: () => void;
  mode?: 'login' | 'signup';
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: (notification?: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ 
  loading = false, 
  onSuccess,
  mode = 'login'
}) => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const initializedRef = useRef(false);

  // ✅ Google callback handler
  const handleGoogleCallback = useCallback(async (response: any) => {
    if (!response?.credential) {
      toast.error('Google login failed - no credential received');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Signing in with Google...');

    try {
      console.log('🔐 Google credential received, verifying...');

      const result = await googleLogin(response.credential);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(mode === 'signup' ? 'Account created successfully! 🎉' : 'Welcome back! 👋');
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        toast.error(result.error || 'Google login failed. Please try again.');
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('❌ Google login error:', error);
      
      const errorMsg = 
        error?.response?.data?.message || 
        error?.message || 
        'Google login failed. Please try again.';
      
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [googleLogin, navigate, onSuccess, mode]);

  // ✅ FIX: Simpler script loading
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('⚠️ VITE_GOOGLE_CLIENT_ID not configured');
      return;
    }

    if (initializedRef.current) return;

    let mounted = true;

    const initGoogle = () => {
      if (!mounted) return;

      if (!window.google?.accounts?.id) {
        console.error('❌ Google SDK not available');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id:                 GOOGLE_CLIENT_ID,
          callback:                  handleGoogleCallback,
          auto_select:               false,
          cancel_on_tap_outside:     true,
          use_fedcm_for_prompt:      false,
          context:                   mode === 'signup' ? 'signup' : 'signin',
        });

        if (buttonContainerRef.current && mounted) {
          const width = buttonContainerRef.current.offsetWidth || 320;

          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            type:            'standard',
            theme:           'outline',
            size:            'large',
            width:           Math.min(width, 400),
            text:            mode === 'signup' ? 'signup_with' : 'continue_with',
            shape:           'rectangular',
            logo_alignment:  'left',
          });

          setIsReady(true);
          initializedRef.current = true;
        }
      } catch (err) {
        console.error('❌ Google init error:', err);
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      // Wait for script to load
      const existingScript = document.getElementById('google-signin-script');

      if (existingScript) {
        // Script tag exists, wait for SDK
        const checkInterval = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(checkInterval);
            initGoogle();
          }
        }, 100);

        // ✅ Cleanup on timeout
        const timeout = setTimeout(() => {
          clearInterval(checkInterval);
          if (mounted) {
            console.error('❌ Google SDK load timeout');
            toast.error('Failed to load Google Sign-In');
          }
        }, 10_000);

        return () => {
          mounted = false;
          clearInterval(checkInterval);
          clearTimeout(timeout);
        };
      } else {
        // No script tag - add one
        const script = document.createElement('script');
        script.id     = 'google-signin-script';
        script.src    = 'https://accounts.google.com/gsi/client';
        script.async  = true;
        script.defer  = true;

        script.onload = () => {
          if (mounted) setTimeout(initGoogle, 100);
        };

        script.onerror = () => {
          if (mounted) {
            console.error('❌ Failed to load Google Sign-In');
            toast.error('Failed to load Google Sign-In');
          }
        };

        document.head.appendChild(script);
      }
    }

    return () => {
      mounted = false;
    };
  }, [handleGoogleCallback, mode]);

  // ─── Not Configured State ───
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-xs text-yellow-700 text-center">
          ⚠️ Google Sign-In not configured. Add <code className="font-mono bg-yellow-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> to your .env
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Google Button Container */}
      <div className={`relative ${(loading || isProcessing) ? 'opacity-50 pointer-events-none' : ''}`}>
        <div
          ref={buttonContainerRef}
          className="w-full flex justify-center min-h-[44px]"
        />

        {/* Loading skeleton while SDK loads */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
              <span>Loading Google Sign-In...</span>
            </div>
          </div>
        )}
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">Verifying your account...</p>
        </div>
      )}
    </div>
  );
};

export default SocialLoginButtons;