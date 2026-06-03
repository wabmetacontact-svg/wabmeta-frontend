import React, { useState } from 'react';
import { 
  Instagram, 
  Link as LinkIcon, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Shield,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useInstagramConnect } from '../../hooks/useInstagramConnect';

const InstagramSettings: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { connectInstagram, isConnecting } = useInstagramConnect();

  const handleConnect = () => {
    connectInstagram();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Instagram Settings</h1>
          <p className="text-sm text-gray-400">Manage your connected accounts and API permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connection Status Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="relative rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Instagram size={120} />
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isConnected ? 'bg-green-500/20' : 'bg-white/10'}`}>
                  <Instagram className={isConnected ? 'text-green-400' : 'text-gray-400'} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Instagram Business Account</h3>
                  <p className="text-xs text-gray-500">Required for DMs and Comment automation</p>
                </div>
              </div>

              {!isConnected ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Connect your Instagram Business account to enable automation. You must have a Facebook Page linked to your Instagram account.
                  </p>
                  <button 
                    disabled={isConnecting}
                    onClick={handleConnect}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <LinkIcon className="w-4 h-4" />
                    )}
                    {isConnecting ? 'Connecting...' : 'Connect Meta Account'}
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src="https://via.placeholder.com/40" className="w-10 h-10 rounded-full border border-white/10" alt="Profile" />
                      <div>
                        <p className="text-sm font-bold text-white">@wabmeta_official</p>
                        <p className="text-[10px] text-green-400 font-mono">CONNECTED • BUSINESS ACCOUNT</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Permissions / Webhook Status */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6">
            <h3 className="text-sm font-semibold text-white mb-4">API Permissions</h3>
            <div className="space-y-3">
              {[
                { label: 'Manage DMs', status: isConnected },
                { label: 'Read Comments', status: isConnected },
                { label: 'Manage Stories', status: isConnected },
                { label: 'Insights Access', status: isConnected },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  {item.status ? (
                    <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                      <CheckCircle size={12} /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-600 flex items-center gap-1">
                      <AlertCircle size={12} /> INACTIVE
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Requirements Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Pre-requisites</h4>
            </div>
            <ul className="space-y-3">
              {[
                'Instagram Business Account',
                'Linked Facebook Page',
                'Page Admin Permissions',
                'Allow Access to Messages enabled'
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <div className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500" />
                  {step}
                </li>
              ))}
            </ul>
            <a href="#" className="mt-4 flex items-center gap-1 text-[10px] text-indigo-400 hover:underline">
              How to setup Business Account <ExternalLink size={10} />
            </a>
          </div>

          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5">
            <h4 className="text-sm font-bold text-white mb-3">Quick Links</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-2 text-xs text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                Meta App Dashboard <ChevronRight size={14} />
              </button>
              <button className="w-full flex items-center justify-between p-2 text-xs text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                Webhook Logs <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramSettings;
