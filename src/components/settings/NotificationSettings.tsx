import React from 'react';
import { Bell, Mail, MessageSquare } from 'lucide-react';

const notificationItems = [
  {
    id: 'email',
    label: 'Email Notifications',
    desc: 'Receive updates via email',
    icon: Mail,
  },
  {
    id: 'message',
    label: 'New Message Alerts',
    desc: 'Get notified for new messages',
    icon: MessageSquare,
  },
  {
    id: 'campaign',
    label: 'Campaign Updates',
    desc: 'Campaign completion & stats',
    icon: Bell,
  },
];

const NotificationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-orange-600" />
          Notification Preferences
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose how you want to be notified
        </p>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {notificationItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            </div>
            {/* Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4
                peer-focus:ring-green-300 rounded-full peer
                peer-checked:after:translate-x-full peer-checked:after:border-white
                after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                after:bg-white after:border-slate-200 after:border after:rounded-full
                after:h-5 after:w-5 after:transition-all
                peer-checked:bg-green-600"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;