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
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
          <Code className="w-6 h-6 mr-2 text-blue-600" />
          API & Webhooks
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your API keys and webhook configuration
        </p>
      </div>

      {/* API Keys Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-slate-800 dark:text-white">API Keys</h3>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center font-medium transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Generate New Key
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Production API Key</p>
              <div className="flex items-center mt-1.5">
                <code className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200/50 dark:border-slate-700 font-mono">
                  {showSecret ? 'wm_live_sk_xxxxxxxxxxxxx' : 'wm_live_sk_••••••••••••'}
                </code>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="ml-2 p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard('wm_live_sk_xxxxxxxxxxxxx')}
                  className="ml-2 p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
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
        <h3 className="font-medium text-slate-850 dark:text-white mb-4">Webhook Configuration</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
              placeholder="https://your-server.com/webhook"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Webhook Secret
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
              placeholder="Your webhook secret"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Events to Subscribe
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['message.received', 'message.sent', 'message.delivered', 'message.read'].map((event) => (
                <label key={event} className="flex items-center cursor-pointer">
                  <input type="checkbox" className="rounded text-green-600 mr-2 focus:ring-green-500/20 focus:outline-none" defaultChecked />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{event}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
          Save Webhook Settings
        </button>
      </div>
    </div>
  );
};

export default ApiConfig;