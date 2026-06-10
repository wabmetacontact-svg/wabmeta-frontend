import React, { useState } from 'react';
import { Shield, Key, Smartphone, Clock } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

const SecuritySettings: React.FC = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const settingItems = [
    {
      icon: Key,
      title: 'Password',
      desc: 'Regularly update your password for safety',
      action: (
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors"
        >
          Change Password
        </button>
      ),
    },
    {
      icon: Smartphone,
      title: 'Two-Factor Authentication',
      desc: 'Add extra security to your account',
      action: (
        <button className="px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors">
          Enable 2FA
        </button>
      ),
    },
    {
      icon: Clock,
      title: 'Active Sessions',
      desc: 'Manage your logged-in devices',
      action: (
        <button className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
          Sign Out All
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-600" />
          Security Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account security
        </p>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {settingItems.map((item) => (
          <div
            key={item.title}
            className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            </div>
            {item.action}
          </div>
        ))}
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default SecuritySettings;