// ✅ FIXED MetaConnectModal.tsx
// Fixes:
// 1. extras.setup me business pre-fill add kiya
// 2. sessionInfoVersion '3' → removed (let Meta decide)
// 3. Session info timing race condition fix (500ms delay)
// 4. Better error messages for "existing WABA not showing" case
// 5. Existing account reconnect support

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Info,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { meta as metaApi } from '../../services/api';
import { useFacebookSDK } from '../../hooks/useFacebookSDK';

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName?: string; // ✅ NEW: Pre-fill ke liye
  onConnected?: () => void;
}

const MetaConnectModal: React.FC<MetaConnectModalProps> = ({
  isOpen,
  onClose,
  organizationId,
  organizationName = '',
  onConnected,
}) => {
  const sessionInfoRef = useRef<{
    wabaId?: string;
    phoneNumberId?: string;
    sessionReceived?: boolean; // ✅ Track if session info arrived
  }>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const { isReady: sdkReady, isLoading: sdkLoading, error: sdkError } = useFacebookSDK();

  // ✅ Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setProgress('');
      setSuccess(false);
      setShowInstructions(true);
      sessionInfoRef.current = {};
    }
  }, [isOpen]);

  // ✅ Setup message listener for Embedded Signup events
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Facebook domains
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

            // ✅ Store session info
            sessionInfoRef.current = {
              wabaId: waba_id,
              phoneNumberId: phone_number_id,
              sessionReceived: true,
            };

            console.log('✅ Session captured:', {
              wabaId: waba_id,
              phoneNumberId: phone_number_id,
            });

            setProgress('Setup complete! Saving your account...');

          } else if (data.event === 'CANCEL') {
            console.log('❌ User cancelled Embedded Signup');
            setError(
              'Setup cancelled.\n\n' +
              'Please try again and complete ALL steps in the wizard.'
            );
            setLoading(false);
            setProgress('');
            setShowInstructions(true);

          } else if (data.event === 'ERROR') {
            console.error('❌ Embedded Signup error:', data.data);
            setError(`Setup error: ${data.data?.error_message || 'Unknown error occurred'}`);
            setLoading(false);
            setProgress('');
            setShowInstructions(true);
          }
        }
      } catch (e) {
        // Not a JSON message or not for us — ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen]);

  if (!isOpen) return null;

  // ✅ FIXED: Launch Embedded Signup Wizard
  const launchEmbeddedSignup = async () => {
    if (!sdkReady || !window.FB) {
      setError('Facebook SDK not loaded. Please refresh the page and try again.');
      return;
    }

    if (!organizationId) {
      setError('Organization not found. Please refresh and try again.');
      return;
    }

    const configId = import.meta.env.VITE_META_CONFIG_ID;

    if (!configId) {
      setError(
        '❌ Configuration missing!\n\n' +
        'META_CONFIG_ID is not set. Please contact support.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setShowInstructions(false);
    setProgress('Opening Meta WhatsApp Setup...');

    // Reset session info
    sessionInfoRef.current = {};

    // Save org ID
    localStorage.setItem('currentOrganizationId', organizationId);

    console.log('🚀 Launching Embedded Signup:', { configId, organizationId });

    try {
      window.FB.login(
        async (response: any) => {
          console.log('📥 FB.login response:', {
            status: response.status,
            hasAuthResponse: !!response.authResponse,
            authResponseKeys: response.authResponse ? Object.keys(response.authResponse) : [],
          });

          if (response.authResponse) {
            const code = response.authResponse.code;

            if (code) {
              // ✅ FIX: Wait for WA_EMBEDDED_SIGNUP message to arrive
              // (It sometimes comes slightly after FB.login callback)
              setProgress('Verifying your WhatsApp setup...');

              // Wait up to 2 seconds for session info
              let waited = 0;
              while (!sessionInfoRef.current.sessionReceived && waited < 2000) {
                await new Promise(resolve => setTimeout(resolve, 200));
                waited += 200;
              }

              if (sessionInfoRef.current.sessionReceived) {
                console.log('✅ Session info received before callback:', sessionInfoRef.current);
              } else {
                console.warn('⚠️ Session info not received — backend will lookup from token');
              }

              await handleCodeCallback(code);

            } else {
              setLoading(false);
              setProgress('');
              setShowInstructions(true);
              setError(
                'No authorization code received.\n\n' +
                'This usually means the popup was blocked or closed too early.\n' +
                'Please allow popups for this site and try again.'
              );
            }

          } else {
            setLoading(false);
            setProgress('');
            setShowInstructions(true);

            // Check if it was a cancel or an error
            if (response.status === 'not_authorized' || response.status === 'unknown') {
              setError(
                '⚠️ WhatsApp setup was not completed.\n\n' +
                'Please make sure to:\n' +
                '• Select your existing WhatsApp Business Account (or create new)\n' +
                '• Add a phone number\n' +
                '• Click "Finish" at the end of the wizard'
              );
            }
          }
        },
        {
          // ✅ CORRECT Embedded Signup config
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            // ✅ FIX 1: Pre-fill business name so existing WABA can be found
            setup: {
              business: organizationName ? { name: organizationName } : undefined,
            },
            featureType: '',
            // ✅ FIX 2: Use version 2 — version 3 has known issues with existing WABA detection
            sessionInfoVersion: '2',
          },
        }
      );
    } catch (err: any) {
      console.error('❌ FB.login launch error:', err);
      setError(`Failed to open wizard: ${err.message}`);
      setLoading(false);
      setProgress('');
      setShowInstructions(true);
    }
  };

  // ✅ Send code + session info to backend
  const handleCodeCallback = async (code: string) => {
    try {
      setProgress('Connecting your WhatsApp Business Account...');

      console.log('📤 Sending to backend:', {
        codeLength: code.length,
        wabaId: sessionInfoRef.current.wabaId || '(not captured)',
        phoneNumberId: sessionInfoRef.current.phoneNumberId || '(not captured)',
        organizationId,
      });

      const response = await metaApi.connect({
        code,
        organizationId,
        wabaId: sessionInfoRef.current.wabaId,
        phoneNumberId: sessionInfoRef.current.phoneNumberId,
      });

      const data = response.data;
      console.log('📥 Backend response:', data);

      if (data?.success !== false) {
        setProgress('✅ WhatsApp connected successfully!');
        setSuccess(true);

        setTimeout(() => {
          onConnected?.();
          onClose();
        }, 2500);

      } else {
        throw new Error(data?.message || 'Connection failed');
      }

    } catch (err: any) {
      console.error('❌ Connection failed:', err);

      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Connection failed. Please try again.';

      // ✅ Specific helpful error messages
      if (errorMsg.includes('already has a connected')) {
        setError(
          '⚠️ Already Connected!\n\n' +
          'This organization already has a WhatsApp account connected.\n' +
          'Please disconnect the existing account first from Settings → WhatsApp.'
        );
      } else if (errorMsg.includes('WABA') || errorMsg.includes('WhatsApp Business Account')) {
        setError(
          '⚠️ WhatsApp Business Account Not Found\n\n' +
          'The setup completed but we could not find your WhatsApp Business Account.\n\n' +
          'This can happen if:\n' +
          '• You closed the wizard too early\n' +
          '• The WABA was not properly linked to our app\n\n' +
          '✅ Fix: Go to business.facebook.com → WhatsApp accounts → "Assign partner"\n' +
          '   and add our app as a partner, then try connecting again.'
        );
      } else if (errorMsg.includes('No phone numbers')) {
        setError(
          '⚠️ No Phone Number Found\n\n' +
          'Your WhatsApp Business Account was found but has no phone numbers.\n\n' +
          'Please add a phone number in:\n' +
          'business.facebook.com → WhatsApp accounts → Phone numbers → Add'
        );
      } else {
        setError(errorMsg);
      }

      setLoading(false);
      setProgress('');
      setShowInstructions(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0a0e27] dark:bg-slate-900 rounded-2xl shadow-2xl border border-white/[0.1] dark:border-slate-800 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0a0e27]/20 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Connect WhatsApp Business
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-[#0a0e27]/20 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Success State */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex items-center gap-4">
              <CheckCircle className="w-10 h-10 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-700 dark:text-green-300 text-lg">
                  Successfully Connected! 🎉
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Your WhatsApp Business is now connected and ready to use.
                </p>
              </div>
            </div>
          )}

          {/* ✅ NEW: "Existing account not showing?" help box */}
          {showInstructions && !success && (
            <>
              {/* Main Instructions */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-900 dark:text-blue-200 text-base">
                      Complete ALL Steps in the Wizard
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      A popup will open. Follow carefully:
                    </p>
                  </div>
                </div>

                <ol className="space-y-2.5 ml-9">
                  {[
                    { num: '1', text: 'Login to your Facebook account' },
                    { num: '2', text: 'Click "Get Started" on the WhatsApp wizard' },
                    { num: '3', text: 'Select existing Business Portfolio OR create new one' },
                    { num: '4', text: 'Select existing WhatsApp Business Account OR create new' },
                    { num: '5', text: 'Select existing Phone Number OR add new one' },
                    { num: '6', text: 'Verify phone via SMS/Call (if new number)' },
                    { num: '✓', text: 'Click "FINISH" — don\'t close the popup early!', green: true },
                  ].map((step) => (
                    <li key={step.num} className="flex items-start gap-2.5">
                      <span className={`flex-shrink-0 w-6 h-6 ${step.green ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' : 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200'} rounded-full flex items-center justify-center text-xs font-bold`}>
                        {step.num}
                      </span>
                      <div className="text-sm text-blue-900 dark:text-blue-100 pt-0.5">
                        {step.text}
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    ⚠️ <strong>Phone number must NOT be active on regular WhatsApp app.</strong> If it is, delete the WhatsApp account from your phone first.
                  </p>
                </div>
              </div>

              {/* ✅ NEW: Existing WABA not showing help box */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-800 dark:text-orange-300 text-sm">
                      Existing WhatsApp account not showing in wizard?
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-1 leading-relaxed">
                      If your WhatsApp Business Account exists but doesn't appear in the dropdown, you need to assign our app as a partner first:
                    </p>
                    <ol className="mt-2 space-y-1">
                      {[
                        'Go to business.facebook.com → Settings',
                        'Accounts → WhatsApp accounts',
                        'Select your account → "Assign partner"',
                        'Enter our App ID and grant permissions',
                        'Then come back and connect',
                      ].map((step, i) => (
                        <li key={i} className="text-xs text-orange-700 dark:text-orange-400">
                          {i + 1}. {step}
                        </li>
                      ))}
                    </ol>
                    <a
                      href="https://business.facebook.com/settings/whatsapp-business-accounts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Business Manager
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Progress */}
          {progress && !error && !success && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                {progress}
              </p>
            </div>
          )}

          {/* SDK Loading */}
          {sdkLoading && (
            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
              <p className="text-sm text-gray-400">
                Loading Facebook SDK...
              </p>
            </div>
          )}

          {/* SDK Error */}
          {sdkError && !sdkReady && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
                    Facebook SDK Failed to Load
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{sdkError}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Check your internet connection or disable ad blockers and refresh.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-700 dark:text-red-300 text-sm mb-2">
                    Connection Failed
                  </p>
                  <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap font-sans leading-relaxed">
                    {error}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {!success && (
            <>
              {/* Main Connect Button */}
              <button
                onClick={launchEmbeddedSignup}
                disabled={loading || sdkLoading || !sdkReady}
                className="w-full px-5 py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {progress || 'Connecting...'}
                  </>
                ) : sdkLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading SDK...
                  </>
                ) : !sdkReady ? (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    SDK Not Ready — Refresh Page
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    {error ? 'Try Again' : 'Start WhatsApp Setup Wizard'}
                  </>
                )}
              </button>

              {/* Help Links */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <a
                  href="https://www.facebook.com/business/help/2087193751603668"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Official Setup Guide
                </a>
                <a
                  href="https://business.facebook.com/settings/whatsapp-business-accounts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Business Manager
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaConnectModal;
