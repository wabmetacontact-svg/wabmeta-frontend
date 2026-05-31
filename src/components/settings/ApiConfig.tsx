// src/components/settings/ApiConfig.tsx

import React, { useState } from 'react';
import { Code, Copy, Eye, EyeOff, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ApiConfig: React.FC = () => {
  const [showSecret, setShowSecret] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Code className="w-6 h-6 mr-2 text-blue-600" />
          API & Webhooks
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Manage your API keys and webhook configuration
        </p>
      </div>

      {/* API Keys Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">API Keys</h3>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Generate New Key
          </button>
        </div>

        <div className="bg-[#0a0e27]/[0.02] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Production API Key</p>
              <div className="flex items-center mt-1">
                <code className="text-sm text-gray-400 bg-[#0a0e27]/[0.04] px-2 py-1 rounded">
                  {showSecret ? 'wm_live_sk_xxxxxxxxxxxxx' : 'wm_live_sk_••••••••••••'}
                </code>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-300"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard('wm_live_sk_xxxxxxxxxxxxx')}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-300"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div>
        <h3 className="font-medium text-white mb-4">Webhook Configuration</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              className="w-full px-4 py-2 border border-white/[0.12] rounded-lg focus:ring-2 focus:ring-green-500 bg-[#0a0e27] dark:bg-gray-700 text-white"
              placeholder="https://your-server.com/webhook"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Webhook Secret
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-white/[0.12] rounded-lg focus:ring-2 focus:ring-green-500 bg-[#0a0e27] dark:bg-gray-700 text-white"
              placeholder="Your webhook secret"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Events to Subscribe
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['message.received', 'message.sent', 'message.delivered', 'message.read'].map((event) => (
                <label key={event} className="flex items-center">
                  <input type="checkbox" className="rounded text-green-600 mr-2" defaultChecked />
                  <span className="text-sm text-gray-300">{event}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Save Webhook Settings
        </button>
      </div>
    </div>
  );
};

export default ApiConfig;