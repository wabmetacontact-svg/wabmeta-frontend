import React, { useState } from 'react';
import {
  X,
  Loader2,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Info,
} from 'lucide-react';
import { meta as metaApi } from '../../services/api';
import { useFacebookSDK } from '../../hooks/useFacebookSDK';

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onConnected?: () => void;
}

const MetaConnectModal: React.FC<MetaConnectModalProps> = ({
  isOpen,
  onClose,
  organizationId,
  onConnected,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const { isReady: sdkReady, isLoading: sdkLoading, error: sdkError } = useFacebookSDK();

  if (!isOpen) return null;

  // ✅ MAIN: Embedded Signup Flow (Recommended)
  const handleEmbeddedSignup = async () => {
    if (!sdkReady || !window.FB) {
      setError('Facebook SDK not loaded. Please refresh the page and try again.');
      return;
    }

    if (!organizationId) {
      setError('Organization not found. Please refresh and try again.');
      return;
    }

    const configId = import.meta.env.VITE_META_CONFIG_ID;
    const solutionId = import.meta.env.VITE_META_SOLUTION_ID;

    if (!configId) {
      setError('META_CONFIG_ID not configured. Contact support.');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress('Opening Meta signup wizard...');

    // Save org ID for callback
    localStorage.setItem('currentOrganizationId', organizationId);

    // ✅ Launch Embedded Signup
    window.FB.login(
      (response: any) => {
        console.log('📥 FB.login response:', response);

        if (response.authResponse) {
          const code = response.authResponse.code;
          const accessToken = response.authResponse.accessToken;

          if (code) {
            // ✅ Got authorization code (preferred for code flow)
            handleCodeCallback(code);
          } else if (accessToken) {
            // ✅ Got access token (token flow)
            handleTokenCallback(accessToken);
          } else {
            setLoading(false);
            setProgress('');
            setError('No code or token received. Please try again.');
          }
        } else {
          setLoading(false);
          setProgress('');

          if (response.status === 'unknown') {
            setError(
              'Signup was cancelled or incomplete.\n\n' +
              'Please complete ALL these steps:\n' +
              '1. Login to your Facebook account\n' +
              '2. Select or create a Meta Business Account\n' +
              '3. Create a WhatsApp Business Account\n' +
              '4. Add and verify your phone number\n' +
              '5. Grant ALL requested permissions'
            );
          } else {
            setError('Login failed. Please try again.');
          }
        }
      },
      {
        config_id: configId,
        response_type: 'code', // ✅ Use code flow (more secure)
        override_default_response_type: true,
        extras: {
          feature: 'whatsapp_embedded_signup',
          sessionInfoVersion: '3',
          ...(solutionId && {
            setup: {
              solutionID: solutionId,
            },
          }),
        },
      }
    );
  };

  // ✅ Send code to backend
  const handleCodeCallback = async (code: string) => {
    try {
      setProgress('Verifying with Meta...');

      const response = await metaApi.callback({
        code,
        organizationId,
      });

      const data = response.data;
      
      if (data?.success !== false) {
        setProgress('✅ Successfully connected!');
        setSuccess(true);
        
        setTimeout(() => {
          onConnected?.();
          onClose();
        }, 2000);
      } else {
        throw new Error(data?.message || 'Connection failed');
      }
    } catch (err: any) {
      console.error('❌ Code callback failed:', err);
      
      const errorMsg = err.response?.data?.message || err.message || 'Connection failed';
      
      // Special handling for WABA not found
      if (errorMsg.includes('WABA') || errorMsg.includes('WhatsApp Business Account not found')) {
        setError(
          '⚠️ WhatsApp Business Account not detected!\n\n' +
          'This usually means you skipped a step in the Meta wizard.\n\n' +
          'Please try again and:\n' +
          '✅ Create a NEW WhatsApp Business Account\n' +
          '✅ Add and VERIFY a phone number\n' +
          '✅ Grant ALL permissions when asked'
        );
      } else {
        setError(errorMsg);
      }
      
      setLoading(false);
      setProgress('');
    }
  };

  // ✅ Send token to backend
  const handleTokenCallback = async (accessToken: string) => {
    try {
      setProgress('Verifying with Meta...');

      const response = await metaApi.connect({
        code: accessToken,
        organizationId,
      });

      const data = response.data;
      
      if (data?.success !== false) {
        setProgress('✅ Successfully connected!');
        setSuccess(true);
        
        setTimeout(() => {
          onConnected?.();
          onClose();
        }, 2000);
      } else {
        throw new Error(data?.message || 'Connection failed');
      }
    } catch (err: any) {
      console.error('❌ Token callback failed:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Connection failed';
      setError(errorMsg);
      setLoading(false);
      setProgress('');
    }
  };

  // ✅ FALLBACK: Standard OAuth (popup/redirect)
  const handleStandardOAuth = async () => {
    setError(null);

    if (!organizationId) {
      setError('Organization ID missing. Please refresh and try again.');
      return;
    }

    try {
      setLoading(true);
      localStorage.setItem('currentOrganizationId', organizationId);

      const resp = await metaApi.getOAuthUrl(organizationId);
      const url = resp.data?.data?.url;

      if (!url) throw new Error('Failed to generate Meta OAuth URL');

      const popup = window.open(
        url,
        'wabmeta_meta_connect',
        'width=600,height=750,noopener,noreferrer'
      );

      if (!popup) {
        // Popup blocked - redirect
        window.location.href = url;
        return;
      }

      popup.focus();
      setLoading(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to start connection');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Connect WhatsApp Business
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Success State */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">
                  Successfully Connected!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your WhatsApp Business is now connected.
                </p>
              </div>
            </div>
          )}

          {/* Important Steps */}
          {!success && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-2">
                    ⚠️ IMPORTANT: Complete ALL Steps
                  </p>
                  <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-1.5 list-decimal list-inside">
                    <li>Login to your Facebook account</li>
                    <li>
                      <strong>Select or Create</strong> a Meta Business Account
                    </li>
                    <li>
                      <strong>Create a NEW</strong> WhatsApp Business Account
                    </li>
                    <li>
                      <strong>Add and Verify</strong> your phone number
                    </li>
                    <li>Grant ALL requested permissions</li>
                  </ol>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-3 font-medium">
                    ⚡ Skipping any step will cause connection to fail!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {progress && !error && !success && (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
              <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                {progress}
              </p>
            </div>
          )}

          {/* SDK Loading */}
          {sdkLoading && !error && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading Facebook SDK...
              </p>
            </div>
          )}

          {/* SDK Error */}
          {sdkError && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-700 dark:text-amber-300 text-sm">
                    Facebook SDK Error
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    {sdkError}. You can still use the standard OAuth method below.
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
                  <p className="font-semibold text-red-700 dark:text-red-300 text-sm mb-1">
                    Connection Failed
                  </p>
                  <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap font-sans">
                    {error}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {!success && (
            <>
              {/* PRIMARY: Embedded Signup Button */}
              <button
                onClick={handleEmbeddedSignup}
                disabled={loading || sdkLoading || !sdkReady}
                className="w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    Continue with Meta (Embedded Signup)
                  </>
                )}
              </button>

              {/* FALLBACK: Standard OAuth */}
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Having issues with the wizard?
                </p>
                <button
                  onClick={handleStandardOAuth}
                  disabled={loading}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Use Standard OAuth Instead
                </button>
              </div>

              {/* Help Link */}
              <a
                href="https://www.facebook.com/business/help/2087193751603668"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 mt-2"
              >
                Need help? Read Meta's setup guide →
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaConnectModal;