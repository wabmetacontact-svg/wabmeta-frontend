// src/components/settings/SecuritySettings.tsx

import React, { useState } from 'react';
import { Shield, Key, Smartphone, Clock } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

const SecuritySettings: React.FC = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
          <Shield className="w-6 h-6 mr-2 text-purple-600" />
          Security Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account security
        </p>
      </div>

      <div className="space-y-4">
        {/* Change Password */}
        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Key className="w-5 h-5 text-slate-400 mr-3" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Password</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Regularly update your password for safety</p>
              </div>
            </div>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-medium transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Change Password Modal */}
        <ChangePasswordModal 
          isOpen={isPasswordModalOpen} 
          onClose={() => setIsPasswordModalOpen(false)} 
        />

        {/* Two Factor */}
        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Smartphone className="w-5 h-5 text-slate-400 mr-3" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Add extra security to your account</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors">
              Enable 2FA
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-slate-400 mr-3" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Active Sessions</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your logged-in devices</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors">
              Sign Out All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;