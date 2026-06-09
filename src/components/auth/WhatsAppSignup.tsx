// src/components/auth/WhatsAppSignup.tsx

import { useEffect, useState } from 'react';
import { useFacebookSDK } from '../../hooks/useFacebookSDK';

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB: any;
  }
}

interface WhatsAppSignupProps {
  organizationId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

const WhatsAppSignup = ({
  organizationId,
  onSuccess,
  onError
}: WhatsAppSignupProps) => {
  const { isReady, isLoading } = useFacebookSDK();
  const [connecting, setConnecting] = useState(false);

  // ✅ Facebook SDK Initialize
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: import.meta.env.VITE_META_APP_ID || '881518987956566',
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v23.0',
      });
      console.log('✅ Facebook SDK initialized');
    };

    // Load SDK if not already loaded
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const launchWhatsAppSignup = () => {
    if (!window.FB) {
      onError?.('Facebook SDK not loaded. Please refresh.');
      return;
    }

    setConnecting(true);

    // ✅ CORRECT: WBA Onboarding config
    window.FB.login(
      async (response: any) => {
        console.log('📨 FB Login Response:', response);

        if (response.authResponse) {
          const code = response.authResponse.code;

          if (!code) {
            setConnecting(false);
            onError?.('No authorization code received');
            return;
          }

          console.log('✅ Got auth code, sending to backend...');

          try {
            // ✅ Send code to backend
            const state = localStorage.getItem('meta_connection_state') ||
              `${organizationId}:${Date.now()}`;

            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/meta/callback`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                  'X-Organization-Id': organizationId,
                },
                body: JSON.stringify({ code, state }),
              }
            );

            const data = await res.json();

            if (data.success) {
              console.log('✅ WhatsApp connected:', data.data);
              onSuccess?.(data.data);
            } else {
              throw new Error(data.message || 'Connection failed');
            }
          } catch (err: any) {
            console.error('❌ Connection failed:', err);
            onError?.(err.message || 'Failed to connect WhatsApp');
          } finally {
            setConnecting(false);
          }
        } else {
          console.log('❌ User cancelled or denied permission');
          setConnecting(false);
          onError?.('Connection cancelled by user');
        }
      },
      {
        // ✅ CORRECT config for WBA Onboarding
        config_id: import.meta.env.VITE_META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: 'whatsapp_business_app_onboarding', // ✅ KEY PART
          sessionInfoVersion: '3',
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={launchWhatsAppSignup}
        disabled={!isReady || connecting || isLoading}
        className={`
          flex items-center gap-3 px-6 py-3 rounded-xl font-semibold
          transition-all duration-200 text-white
          ${!isReady || connecting || isLoading
            ? 'bg-gray-400 cursor-not-allowed opacity-60'
            : 'bg-[#25D366] hover:bg-[#128C7E] hover:shadow-lg active:scale-95'
          }
        `}
      >
        {/* WhatsApp Icon */}
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>

        {isLoading
          ? 'Loading SDK...'
          : connecting
            ? 'Connecting...'
            : 'Connect WhatsApp Business'
        }
      </button>

      {/* Info text */}
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Connect your existing WhatsApp Business App account or create a new one
      </p>
    </div>
  );
};

export default WhatsAppSignup;