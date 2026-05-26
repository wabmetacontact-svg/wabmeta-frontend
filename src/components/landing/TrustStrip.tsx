import React from 'react';
import { Send, MessageSquare, Bot, BarChart3, Users, Layers } from 'lucide-react';

const items = [
  { icon: Send,          label: 'Bulk Campaigns' },
  { icon: MessageSquare, label: 'Shared Inbox' },
  { icon: Bot,           label: 'Chatbot Builder' },
  { icon: BarChart3,     label: 'Analytics' },
  { icon: Users,         label: 'Team Access' },
  { icon: Layers,        label: 'Automation' },
];

const TrustStrip: React.FC = () => (
  <section className="border-y border-gray-100 dark:border-white/5
    bg-gray-50/60 dark:bg-white/[0.015]">
    <div className="max-w-6xl mx-auto px-5 py-5">
      <div className="flex items-center justify-between gap-6 overflow-x-auto scrollbar-hide">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500
          uppercase tracking-wider whitespace-nowrap flex-shrink-0">
          Built for teams that run on WhatsApp
        </p>
        <div className="flex items-center gap-6 flex-shrink-0">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-gray-400
              dark:text-gray-500 whitespace-nowrap">
              <Icon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TrustStrip;
