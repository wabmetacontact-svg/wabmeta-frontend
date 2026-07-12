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

  // ✅ Load and initialize Google Sign-In SDK
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('⚠️ VITE_GOOGLE_CLIENT_ID not configured in .env');
      return;
    }

    if (initializedRef.current) {
      return;
    }

    const initGoogle = () => {
      if (!window.google?.accounts?.id) {
        console.error('❌ Google SDK not available');
        return;
      }

      try {
        console.log('🔧 Initializing Google Sign-In with client ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
          context: mode === 'signup' ? 'signup' : 'signin',
        });

        // Render the button
        if (buttonContainerRef.current) {
          const width = buttonContainerRef.current.offsetWidth || 320;
          
          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: Math.min(width, 400),
            text: mode === 'signup' ? 'signup_with' : 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });

          setIsReady(true);
          initializedRef.current = true;
          console.log('✅ Google Sign-In button rendered');
        }
      } catch (err: any) {
        console.error('❌ Google init error:', err);
      }
    };

    // Load Google script if not already loaded
    const existingScript = document.getElementById('google-signin-script');
    
    if (existingScript && window.google?.accounts?.id) {
      // Script already loaded
      initGoogle();
    } else if (!existingScript) {
      // Load fresh
      const script = document.createElement('script');
      script.id = 'google-signin-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google SDK loaded');
        // Wait a tick for SDK to be ready
        setTimeout(initGoogle, 100);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google Sign-In script');
        toast.error('Failed to load Google Sign-In. Please check your internet connection.');
      };
      document.head.appendChild(script);
    } else {
      // Script tag exists but SDK not ready - wait
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initGoogle();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => clearInterval(checkInterval), 5000);
    }
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