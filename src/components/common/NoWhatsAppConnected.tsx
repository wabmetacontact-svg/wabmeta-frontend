// src/components/common/NoWhatsAppConnected.tsx
import React from 'react';
import { MessageCircle, Smartphone, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useMetaConnect } from '../../hooks/useMetaConnect';
import toast from 'react-hot-toast';

interface NoWhatsAppConnectedProps {
  organizationId: string;
  title?: string;
  description?: string;
  onConnected?: () => void;
}

export const NoWhatsAppConnected: React.FC<NoWhatsAppConnectedProps> = ({
  organizationId,
  title = 'Connect Your WhatsApp Business',
  description = 'Connect your WhatsApp Business account to start messaging your customers.',
  onConnected,
}) => {
  const { connect, loading, progress, sdkLoading } = useMetaConnect({
    organizationId,
    onSuccess: () => {
      toast.success('WhatsApp Business connected successfully!');
      onConnected?.();
    },
    onError: (err) => {
      toast.error(err || 'Failed to connect WhatsApp Business');
    },
  });

  const features = [
    'Send template messages to customers at scale',
    'Receive and reply to inbound messages in real-time',
    'Build and activate automated chatbot flows',
    'Execute target campaign marketing schedules',
    'Monitor delivery statistics and conversion data',
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 lg:p-8 animate-in fade-in duration-200">
      <div className="max-w-lg w-full text-center">

        {/* Brand Emerald Glow Ring */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-35" />
          <div className="relative flex items-center justify-center w-full h-full bg-emerald-50 rounded-full border border-emerald-100">
            <Smartphone className="w-10 h-10 text-emerald-600" />
          </div>
          <div className="absolute -right-1 -bottom-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">{description}</p>

        {/* Features Checklist */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 text-left shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Unlock powerful business benefits:
          </h3>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600 font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Action Trigger */}
        <button
          onClick={connect}
          disabled={loading || sdkLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{progress || 'Connecting...'}</span>
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              <span>Connect WhatsApp Business</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="mt-4 text-xs text-gray-400">
          A valid{' '}
          <a
            href="https://business.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline font-semibold"
          >
            Meta Business Account
          </a>{' '}
          is required to establish integration
        </p>
      </div>
    </div>
  );
};

export default NoWhatsAppConnected;