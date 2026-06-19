import React, { useState } from 'react';
import {
  Save,
  AlertTriangle,
  Settings,
  Mail,
  Hash,
  Power,
  Trash2,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// TOGGLE SWITCH COMPONENT
// ============================================

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full
      transition-colors disabled:opacity-50 disabled:cursor-not-allowed
      ${checked ? 'bg-primary-600' : 'bg-white/[0.1]'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white
        transition-transform shadow-md
        ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

// ============================================
// MAIN COMPONENT
// ============================================

const SystemSettings: React.FC = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [registration, setRegistration] = useState(true);
  const [messageLimit, setMessageLimit] = useState(1000);
  const [supportEmail, setSupportEmail] = useState('support@wabmeta.com');
  const [saving, setSaving] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Replace with actual API call when available
      await new Promise((res) => setTimeout(res, 800));
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear all cache? This will sign out active sessions.')) {
      return;
    }

    setClearingCache(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      toast.success('Cache cleared successfully');
    } catch {
      toast.error('Failed to clear cache');
    } finally {
      setClearingCache(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage global platform configuration
        </p>
      </div>

      {/* General Configuration */}
      <div className="bg-[#0a0e27] border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/[0.06]">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Settings className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              General Configuration
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Platform-wide settings and toggles
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Maintenance Mode */}
          <div
            className="flex items-center justify-between p-4 bg-[#050816]
              rounded-xl border border-white/[0.06] hover:border-white/[0.1]
              transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  maintenance ? 'bg-red-500/10' : 'bg-green-500/10'
                }`}
              >
                <Power
                  className={`w-4 h-4 ${
                    maintenance ? 'text-red-400' : 'text-green-400'
                  }`}
                />
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">
                  Maintenance Mode
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Disable access for all non-admin users
                </p>
              </div>
            </div>
            <ToggleSwitch checked={maintenance} onChange={setMaintenance} />
          </div>

          {/* Allow Registration */}
          <div
            className="flex items-center justify-between p-4 bg-[#050816]
              rounded-xl border border-white/[0.06] hover:border-white/[0.1]
              transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  registration ? 'bg-green-500/10' : 'bg-gray-500/10'
                }`}
              >
                <Hash
                  className={`w-4 h-4 ${
                    registration ? 'text-green-400' : 'text-gray-400'
                  }`}
                />
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">
                  Allow New Registrations
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Allow new users to sign up on the platform
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={registration}
              onChange={setRegistration}
            />
          </div>

          {/* Message Limit */}
          <div className="p-4 bg-[#050816] rounded-xl border border-white/[0.06]">
            <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
              Global Message Limit (Per User/Day)
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="number"
                value={messageLimit}
                onChange={(e) => setMessageLimit(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e27]
                  border border-white/[0.08] rounded-xl text-sm text-white
                  focus:outline-none focus:border-primary-500
                  transition-colors"
                placeholder="1000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Maximum messages a user can send per day across all campaigns
            </p>
          </div>

          {/* Support Email */}
          <div className="p-4 bg-[#050816] rounded-xl border border-white/[0.06]">
            <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
              Support Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e27]
                  border border-white/[0.08] rounded-xl text-sm text-white
                  placeholder:text-gray-500 focus:outline-none
                  focus:border-primary-500 transition-colors"
                  placeholder="support@example.com"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Email shown to users for support inquiries
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600
              hover:bg-primary-700 text-white font-medium rounded-xl
              transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#0a0e27] border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-400">Danger Zone</h3>
            <p className="text-sm text-gray-400 mt-1">
              Actions here can cause data loss or service disruption. Proceed
              with caution.
            </p>

            <div className="mt-5 space-y-3">
              {/* Clear Cache */}
              <div
                className="flex items-center justify-between p-4 bg-[#050816]
                  border border-white/[0.06] rounded-xl"
              >
                <div>
                  <h4 className="font-medium text-white text-sm">
                    Clear All Cache
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Force refresh all cached data across the platform
                  </p>
                </div>
                <button
                  onClick={handleClearCache}
                  disabled={clearingCache}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10
                    border border-red-500/20 text-red-400 font-medium rounded-lg
                    hover:bg-red-500/20 transition-colors text-sm
                    disabled:opacity-50 shrink-0"
                >
                  {clearingCache ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Clear Cache
                </button>
              </div>

              {/* Optional: Add more danger actions here */}
              <div
                className="flex items-center justify-between p-4 bg-[#050816]
                  border border-white/[0.06] rounded-xl"
              >
                <div>
                  <h4 className="font-medium text-white text-sm">
                    Force Logout All Users
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Invalidate all active user sessions immediately
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10
                    border border-red-500/20 text-red-400 font-medium rounded-lg
                    hover:bg-red-500/20 transition-colors text-sm shrink-0"
                  onClick={() => toast('Coming soon!')}
                >
                  <Power className="w-4 h-4" />
                  Force Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;