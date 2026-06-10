import React from 'react';
import { Building } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors';

const GeneralSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Building className="w-6 h-6 text-slate-400" />
          Organization Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your organization details and preferences
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
        {/* Organization Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Organization Name
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Your Organization"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Timezone
          </label>
          <select className={inputClass}>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Website
          </label>
          <input
            type="url"
            className={inputClass}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      {/* Save Button */}
      <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
        Save Changes
      </button>
    </div>
  );
};

export default GeneralSettings;