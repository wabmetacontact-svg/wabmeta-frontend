// src/hooks/useMetaConnect.ts - FIXED VERSION
// ✅ FIX B1 + B2: After successful Meta OAuth connect, calls
// refreshAllWhatsAppConnections() which notifies ALL mounted
// useWhatsAppConnection hook instances to re-fetch. Previously only the
// WhatsAppSettings component's local state was updated — every other part
// of the app (sidebar, campaign creation, template creation, etc.) still
// showed the old "disconnected" state until a full page refresh.

import { useState, useRef, useCallback, useEffect } from 'react';
import { meta as metaApi } from '../services/api';
import { useFacebookSDK } from './useFacebookSDK';
import toast from 'react-hot-toast';
import { refreshAllWhatsAppConnections } from './useWhatsAppConnection'; // ✅ FIX: import global refresh

/**
 * The Multi-Partner Solution to sign clients up through, if any.
 *
 * A client who completes Embedded Signup with a solution ID is billed on the
 * Solution Partner's credit line instead of their own card. Empty = no
 * solution, and signup behaves exactly as it always has.
 *
 * It is a build-time variable like VITE_META_CONFIG_ID beside it, rather than
 * something fetched from the API, on purpose: FB.login has to run inside the
 * click that started it or the browser blocks the popup, so there is no time
 * to await a request first.
 */
const SOLUTION_ID = (import.meta.env.VITE_META_SOLUTION_ID || '').trim();

interface UseMetaConnectOptions {
  organizationId: string;
  organizationName?: string;
  onSuccess?: (data?: any) => void;
  onError?: (error: string) => void;
}

/**
 * Which Embedded Signup flow to open.
 *
 * 'existing' → Coexistence. The number already runs the WhatsApp Business app
 *   and keeps running it; the app and the Cloud API share the number. Meta
 *   calls this business app onboarding and it needs the featureType extra.
 *
 * 'new' → Standard onboarding for a number that has no WhatsApp on it. Passing
 *   featureType here would push the business into the coexistence flow and it
 *   has nothing to connect, so the extra is left out.
 */
export type ConnectMode = 'new' | 'existing';

export const useMetaConnect = ({
  organizationId,
  onSuccess,
  onError,
}: UseMetaConnectOptions) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const sessionInfoRef = useRef<{
    wabaId?: string;
    phoneNumberId?: string;
    sessionReceived?: boolean;
    coexistence?: boolean;
  }>({});
  // Kaun sa flow khola tha - coexistence event na aaye to fallback.
  const modeRef = useRef<ConnectMode>('new');

  const { isReady: sdkReady, isLoading: sdkLoading, error: sdkError } = useFacebookSDK();

  // ✅ Listen for Embedded Signup messages from Meta popup
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

          if (data.event === 'FINISH' || data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING') {
            // Coexistence flow (existing WhatsApp Business app number) ka
            // event alag hai aur usme sirf waba_id aata hai - phone number
            // backend WABA se dhoondhta hai. Pehle sirf 'FINISH' suna jaata
            // tha, isliye coexistence me session kabhi capture nahi hota tha.
            const { phone_number_id, waba_id } = data.data || {};
            sessionInfoRef.current = {
              wabaId: waba_id,
              phoneNumberId: phone_number_id,
              sessionReceived: true,
              coexistence: data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING',
            };
            console.log('✅ Session captured:', { event: data.event, waba_id, phone_number_id });
            window.dispatchEvent(new Event('wa_session_received')); // ✅ Event fire karo
          } else if (data.event === 'CANCEL') {
            console.log('❌ User cancelled Embedded Signup');
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
        coexistence:
          sessionInfoRef.current.coexistence ??
          (sessionInfoRef.current.sessionReceived ? false : modeRef.current === 'existing'),
        // So the account records which solution it came in through. Meta
        // confirms it independently with a PARTNER_ADDED webhook. The backend
        // also uses it to put the number on Gupshup (credit line + sends).
        // Coexistence is never on the solution - see the FB.login extras.
        ...(SOLUTION_ID && modeRef.current !== 'existing' ? { solutionId: SOLUTION_ID } : {}),
      });

      const data = response.data;
      console.log('📥 Backend connect response:', data);

      if (data?.success !== false) {
        const warning = data?.data?.warning;
        if (warning === 'PHONE_NOT_REGISTERED') {
          toast.error(
            'Phone connected but not fully activated. Please check Meta Business Manager to complete setup.',
            { duration: 10000 }
          );
        } else if (data?.data?.account?.connectionType === 'WHATSAPP_BUSINESS_APP') {
          toast.success(
            '✅ WhatsApp connected! Importing your chats and contacts from the WhatsApp Business app - this can take a few minutes.',
            { duration: 8000 }
          );
        } else {
          toast.success('✅ WhatsApp connected successfully!');
        }
        
        setProgress('');
        setLoading(false);

        // ✅ FIX B1: First call local onSuccess callback
        // (WhatsAppSettings.tsx uses this to refresh its own list)
        onSuccess?.(data?.data);

        // ✅ FIX B2: Then trigger global refresh after a short delay
        // to ensure the backend has fully committed the new account to DB.
        // This notifies ALL mounted useWhatsAppConnection hooks — sidebar,
        // campaign creation, template creation — so the whole app knows
        // the account is now connected without requiring a page reload.
        setTimeout(async () => {
          await refreshAllWhatsAppConnections();
        }, 600);

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

  const connect = useCallback(async (mode: ConnectMode = 'new') => {
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

    const waitForSessionInfo = (): Promise<void> => {
      return new Promise((resolve) => {
        if (sessionInfoRef.current.sessionReceived) {
          resolve();
          return;
        }

        const handler = () => {
          window.removeEventListener('wa_session_received', handler);
          resolve();
        };

        window.addEventListener('wa_session_received', handler);

        // 3 second timeout (was 2s)
        setTimeout(() => {
          window.removeEventListener('wa_session_received', handler);
          resolve(); // Timeout pe bhi proceed karo
        }, 3000);
      });
    };

    setLoading(true);
    setProgress('Opening Meta WhatsApp Setup...');
    sessionInfoRef.current = {};
    modeRef.current = mode;
    localStorage.setItem('currentOrganizationId', organizationId);

    console.log('🚀 Launching Meta Embedded Signup');

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

              await waitForSessionInfo(); // ✅ Event-driven wait
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
            sessionInfoVersion: '3',
            version: 'v3',
            // Signs the client up through the Multi-Partner Solution, which
            // puts them on the Solution Partner's credit line. Meta also shows
            // them a version of the flow that says both partners get access.
            //
            // Not for coexistence: Gupshup's partner-hosted flow does not
            // support existing WhatsApp Business app numbers yet, so those stay
            // on Meta direct (the customer's own payment method).
            ...(SOLUTION_ID && mode !== 'existing' ? { setup: { solutionID: SOLUTION_ID } } : {}),
            // Only the coexistence flow takes this. It used to be hardcoded, so
            // a business bringing a fresh number was sent down the "connect your
            // existing WhatsApp Business app" path with nothing to connect.
            ...(mode === 'existing'
              ? { featureType: 'whatsapp_business_app_onboarding' }
              : {}),
          },
        }
      );
    } catch (err: any) {
      console.error('❌ FB.login launch error:', err);
      toast.error(`Failed to open wizard: ${err.message}`);
      setLoading(false);
      setProgress('');
    }
  }, [sdkReady, organizationId, handleCodeCallback]);

  return {
    connect,
    loading,
    progress,
    sdkReady,
    sdkLoading,
    sdkError,
  };
};