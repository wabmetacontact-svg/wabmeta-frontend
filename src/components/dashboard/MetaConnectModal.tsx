import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Info,
  ExternalLink,
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
  const sessionInfoRef = useRef<{ wabaId?: string; phoneNumberId?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const { isReady: sdkReady, isLoading: sdkLoading, error: sdkError } = useFacebookSDK();

  // ✅ Setup message listener for Embedded Signup events
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Facebook
      if (!event.origin.endsWith('facebook.com')) return;

      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('📱 Embedded Signup Event:', data);
          
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data || {};
            sessionInfoRef.current = { wabaId: waba_id, phoneNumberId: phone_number_id };
            console.log('✅ Session captured:', sessionInfoRef.current);
            setProgress('Setup complete! Verifying...');
          } else if (data.event === 'CANCEL') {
            console.log('❌ User cancelled Embedded Signup');
            setError(
              'Setup was cancelled.\n\n' +
              'Please try again and complete ALL the wizard steps to connect your WhatsApp Business Account.'
            );
            setLoading(false);
            setProgress('');
          } else if (data.event === 'ERROR') {
            console.log('❌ Embedded Signup error:', data.data);
            setError(`Setup error: ${data.data?.error_message || 'Unknown error'}`);
            setLoading(false);
            setProgress('');
          }
        }
      } catch (e) {
        // Not JSON message, ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen]);

  if (!isOpen) return null;

  // ✅ Launch Embedded Signup Wizard
  const launchEmbeddedSignup = async () => {
    if (!sdkReady || !window.FB) {
      setError('Facebook SDK not loaded yet. Please wait or refresh the page.');
      return;
    }

    if (!organizationId) {
      setError('Organization not found. Please refresh and try again.');
      return;
    }

    const configId = import.meta.env.VITE_META_CONFIG_ID;
    
    if (!configId) {
      setError(
        '❌ META_CONFIG_ID not configured!\n\n' +
        'Please contact support to enable WhatsApp connection.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setShowInstructions(false);
    setProgress('Opening Meta Embedded Signup...');

    // Save org ID for callback
    localStorage.setItem('currentOrganizationId', organizationId);

    console.log('🚀 Launching Embedded Signup with:', {
      configId,
      organizationId,
    });

    try {
      // ✅ CRITICAL: Use FB.login with Embedded Signup config
      window.FB.login(
        (response: any) => {
          console.log('📥 FB.login full response:', response);

          if (response.authResponse) {
            const code = response.authResponse.code;

            if (code) {
              handleCodeCallback(code);
            } else {
              setLoading(false);
              setProgress('');
              setError('No authorization code received. Please try again.');
              setShowInstructions(true);
            }
          } else {
            setLoading(false);
            setProgress('');
            setShowInstructions(true);
            
            setError(
              '⚠️ Embedded Signup was not completed.\n\n' +
              'Please complete ALL the wizard steps:\n' +
              '• Create/Select Business Portfolio\n' +
              '• Create WhatsApp Business Account\n' +
              '• Add and VERIFY phone number\n' +
              '• Click FINISH at the end'
            );
          }
        },
        {
          // ✅ CORRECT Embedded Signup Config (Meta v3)
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: '',
            sessionInfoVersion: '3',
          },
        }
      );
    } catch (err: any) {
      console.error('❌ FB.login error:', err);
      setError(`Failed to launch wizard: ${err.message}`);
      setLoading(false);
      setProgress('');
      setShowInstructions(true);
    }
  };

  // ✅ Send code to backend
  const handleCodeCallback = async (code: string) => {
    try {
      setProgress('Connecting to your WhatsApp Business Account...');

      console.log('📤 Sending code to backend...');

      const response = await metaApi.connect({
        code,
        organizationId,
        wabaId: sessionInfoRef.current.wabaId,
        phoneNumberId: sessionInfoRef.current.phoneNumberId,
      });

      const data = response.data;
      console.log('📥 Backend response:', data);

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
      console.error('❌ Backend callback failed:', err);

      const errorMsg = err.response?.data?.message || err.message || 'Connection failed';

      if (errorMsg.includes('WABA') || errorMsg.includes('not found')) {
        setError(
          '⚠️ WhatsApp Business Account not detected!\n\n' +
          'You completed the login but did NOT finish setting up WhatsApp.\n\n' +
          'Please try again and:\n' +
          '✅ CREATE a NEW WhatsApp Business Account in the wizard\n' +
          '✅ ADD and VERIFY your phone number\n' +
          '✅ Click "FINISH" at the end\n\n' +
          '❌ Don\'t close the wizard early!'
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
              <CheckCircle className="w-10 h-10 text-green-600" />
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

          {/* Step-by-step Instructions */}
          {showInstructions && !success && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900 dark:text-blue-200 text-base">
                    Important: Complete ALL Steps
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    A wizard will open in a popup. Follow these steps carefully:
                  </p>
                </div>
              </div>

              <ol className="space-y-2.5 ml-9">
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    Login to your <strong>Facebook account</strong>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    Click <strong>"Get Started"</strong> on the WhatsApp wizard
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Create a Meta Business Portfolio</strong> (or select existing)
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Create a WhatsApp Business Account</strong> (give it a name)
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                    5
                  </span>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Add Phone Number</strong> (must be NOT used on regular WhatsApp)
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                    6
                  </span>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Verify Phone</strong> via SMS or Voice Call
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded-full flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    Click <strong>"FINISH"</strong> at the end
                  </div>
                </li>
              </ol>

              <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
                <p className="text-xs text-amber-900 dark:text-amber-200">
                  ⚠️ <strong>WARNING:</strong> The phone number must NOT be currently used on regular WhatsApp app. 
                  If it is, first delete the WhatsApp account on your phone.
                </p>
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
          {sdkLoading && (
            <div className="bg-[#0a0e27] rounded-xl p-3 flex items-center gap-2">
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
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {sdkError}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Please check your internet connection and refresh the page.
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
              {/* MAIN BUTTON: Embedded Signup */}
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
                    SDK Not Ready
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    Start WhatsApp Setup Wizard
                  </>
                )}
              </button>

              {/* Help Link */}
              <a
                href="https://www.facebook.com/business/help/2087193751603668"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Read Meta's official setup guide
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaConnectModal;