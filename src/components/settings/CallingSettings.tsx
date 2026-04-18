// src/components/settings/CallingSettings.tsx

import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, ToggleLeft, ToggleRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CallingSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    callingEnabled: false,
    inboundCallsEnabled: true,
    callbackEnabled: true,
    callHoursEnabled: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/calling/settings');
      if (response.data.success) {
        setSettings(prev => ({ ...prev, ...response.data.data }));
      }
    } catch (error) {
      console.error('Failed to fetch calling settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof typeof settings) => {
    const prevSettings = { ...settings };
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      setSaving(true);
      await api.put('/calling/settings', newSettings);
      toast.success('Calling settings updated!');
    } catch (error: any) {
      // Revert on failure
      setSettings(prevSettings);
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-green-500" />
      </div>
    );
  }

  const toggleItems = [
    {
      key: 'callingEnabled' as const,
      label: 'Enable WhatsApp Calling',
      desc: 'Business se customers ko directly call karo',
      icon: PhoneCall,
    },
    {
      key: 'inboundCallsEnabled' as const,
      label: 'Allow Inbound Calls',
      desc: 'Customers aapko WhatsApp pe call kar sakein',
      icon: Phone,
    },
    {
      key: 'callbackEnabled' as const,
      label: 'Callback Requests',
      desc: 'Missed calls pe callback option show karo',
      icon: PhoneCall,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          WhatsApp Calling
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Meta WhatsApp Business Calling API se customers ko directly call karo
        </p>
      </div>

      {/* Requirements Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 dark:text-amber-200 font-medium text-sm">
              Requirements
            </p>
            <ul className="text-amber-700 dark:text-amber-300 text-xs mt-1 space-y-1">
              <li>• 2000+ daily messaging limit required</li>
              <li>• Cloud API (not Business App)</li>
              <li>• Customer permission needed before calling</li>
              <li>• "calls" webhook field subscribed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Settings Toggles */}
      <div className="space-y-4">
        {toggleItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <item.icon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {item.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(item.key)}
              disabled={saving}
              className="relative disabled:opacity-50 transition-opacity"
              title={settings[item.key] ? 'Disable' : 'Enable'}
            >
              {settings[item.key] ? (
                <ToggleRight className="w-10 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-gray-400" />
              )}
            </button>
          </div>
        ))}
      </div>

      {saving && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Saving...
        </p>
      )}
    </div>
  );
};

export default CallingSettings;
