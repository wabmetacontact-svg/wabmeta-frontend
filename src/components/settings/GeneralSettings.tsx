// src/components/settings/GeneralSettings.tsx

import React from 'react';
import { Building } from 'lucide-react';

const GeneralSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
          <Building className="w-6 h-6 mr-2 text-slate-400 dark:text-slate-500" />
          Organization Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your organization details and preferences
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Organization Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
            placeholder="Your Organization"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Timezone
          </label>
          <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none">
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Website
          </label>
          <input
            type="url"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
        Save Changes
      </button>
    </div>
  );
};

export default GeneralSettings;