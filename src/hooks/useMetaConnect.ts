// src/hooks/useMetaConnect.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { meta as metaApi } from '../services/api';
import { useFacebookSDK } from './useFacebookSDK';
import toast from 'react-hot-toast';

interface UseMetaConnectOptions {
  organizationId: string;
  organizationName?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useMetaConnect = ({
  organizationId,
  organizationName,
  onSuccess,
  onError,
}: UseMetaConnectOptions) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const sessionInfoRef = useRef<{
    wabaId?: string;
    phoneNumberId?: string;
    sessionReceived?: boolean;
  }>({});

  const { isReady: sdkReady, isLoading: sdkLoading, error: sdkError } = useFacebookSDK();

  // ✅ Listen for Embedded Signup messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        !event.origin.includes('facebook.com') &&
        !event.origin.includes('fb.com')
      ) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('📱 WA_EMBEDDED_SIGNUP Event:', data.event, data.data);

          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data || {};
            sessionInfoRef.current = {
              wabaId: waba_id,
              phoneNumberId: phone_number_id,
              sessionReceived: true,
            };
            console.log('✅ Session captured:', { waba_id, phone_number_id });
          } else if (data.event === 'CANCEL') {
            console.log('❌ User cancelled');
            setLoading(false);
            setProgress('');
          } else if (data.event === 'ERROR') {
            console.error('❌ Embedded Signup error:', data.data);
            const errMsg = data.data?.error_message || 'Setup error occurred';
            toast.error(errMsg);
            onError?.(errMsg);
            setLoading(false);
            setProgress('');
          }
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onError]);

  const handleCodeCallback = useCallback(async (code: string) => {
    try {
      setProgress('Connecting your WhatsApp Business Account...');

      const response = await metaApi.connect({
        code,
        organizationId,
        wabaId: sessionInfoRef.current.wabaId,
        phoneNumberId: sessionInfoRef.current.phoneNumberId,
      });

      const data = response.data;
      console.log('📥 Backend response:', data);

      if (data?.success !== false) {
        toast.success('✅ WhatsApp connected successfully!');
        setProgress('');
        setLoading(false);
        onSuccess?.();
      } else {
        throw new Error(data?.message || 'Connection failed');
      }
    } catch (err: any) {
      console.error('❌ Connection failed:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Connection failed. Please try again.';

      toast.error(errorMsg);
      onError?.(errorMsg);
      setLoading(false);
      setProgress('');
    }
  }, [organizationId, onSuccess, onError]);

  const connect = useCallback(async () => {
    if (!sdkReady || !window.FB) {
      toast.error('Facebook SDK not loaded. Please refresh and try again.');
      return;
    }

    if (!organizationId) {
      toast.error('Organization not found.');
      return;
    }

    const configId = import.meta.env.VITE_META_CONFIG_ID;

    if (!configId) {
      toast.error('Meta configuration missing. Contact support.');
      return;
    }

    setLoading(true);
    setProgress('Opening Meta WhatsApp Setup...');
    sessionInfoRef.current = {};
    localStorage.setItem('currentOrganizationId', organizationId);

    console.log('🚀 Launching Embedded Signup directly');

    try {
      window.FB.login(
        (response: any) => {
          const handleResponse = async () => {
            console.log('📥 FB.login response:', {
              status: response.status,
              hasAuthResponse: !!response.authResponse,
            });

            if (response.authResponse?.code) {
              const code = response.authResponse.code;
              setProgress('Verifying your WhatsApp setup...');

              // Wait for session info
              let waited = 0;
              while (!sessionInfoRef.current.sessionReceived && waited < 2000) {
                await new Promise(resolve => setTimeout(resolve, 200));
                waited += 200;
              }

              await handleCodeCallback(code);
            } else {
              setLoading(false);
              setProgress('');
              if (response.status === 'not_authorized' || response.status === 'unknown') {
                toast.error('WhatsApp setup was cancelled or not completed.');
              }
            }
          };
          handleResponse();
        },
        {
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            featureType: 'whatsapp_business_app_onboarding',
            sessionInfoVersion: '3',
            version: 'v3',
          },
        }
      );
    } catch (err: any) {
      console.error('❌ FB.login launch error:', err);
      toast.error(`Failed to open wizard: ${err.message}`);
      setLoading(false);
      setProgress('');
    }
  }, [sdkReady, organizationId, organizationName, handleCodeCallback]);

  return {
    connect,
    loading,
    progress,
    sdkReady,
    sdkLoading,
    sdkError,
  };
};
