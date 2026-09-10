// src/components/channel/channelUi.tsx
//
// WhatsApp-dashboard visual building blocks, parameterized by channel theme.
// Telegram and Instagram pages reuse these so they look exactly like the
// WhatsApp pages — only the accent color changes.

import React from 'react';

export interface ChannelTheme {
  name: string;
  accent: string;            // hex, for inline fills (chart bars, dots)
  gradient?: string;         // Instagram uses a gradient for solid buttons
  tintBg: string;            // stat-card tinted background, e.g. 'bg-sky-50/40'
  tintBorder: string;        // stat-card border, e.g. 'border-sky-100'
  softBg: string;            // icon chip background, e.g. 'bg-sky-50'
  softBorder: string;        // icon chip border
  labelText: string;         // mono label color, e.g. 'text-sky-700'
  iconText: string;          // icon color, e.g. 'text-sky-600'
  pill: string;              // pill bg+text, e.g. 'bg-sky-100 text-sky-800'
  ring: string;              // focus ring hex
}

export const TELEGRAM_THEME: ChannelTheme = {
  name: 'Telegram',
  accent: '#229ED9',
  tintBg: 'bg-sky-50/40',
  tintBorder: 'border-sky-100',
  softBg: 'bg-sky-50',
  softBorder: 'border-sky-100',
  labelText: 'text-sky-700',
  iconText: 'text-sky-600',
  pill: 'bg-sky-100 text-sky-800',
  ring: '#229ED9',
};

export const INSTAGRAM_THEME: ChannelTheme = {
  name: 'Instagram',
  accent: '#e1306c',
  gradient: 'linear-gradient(135deg, #f09433 0%, #dc2743 50%, #bc1888 100%)',
  tintBg: 'bg-pink-50/40',
  tintBorder: 'border-pink-100',
  softBg: 'bg-pink-50',
  softBorder: 'border-pink-100',
  labelText: 'text-pink-700',
  iconText: 'text-pink-600',
  pill: 'bg-pink-100 text-pink-800',
  ring: '#e1306c',
};

/** The exact GlassCard used across the WhatsApp dashboard. */
export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)] border border-gray-200 p-6 ${className}`}>
    <div className="relative">{children}</div>
  </div>
);

/** Inline style for the primary button (gradient for IG, solid for TG). */
export const primaryBtnStyle = (t: ChannelTheme): React.CSSProperties =>
  t.gradient ? { background: t.gradient } : { background: t.accent };

/** WhatsApp-style page header: icon chip + title + subtitle, optional action. */
export const ChannelHeader: React.FC<{
  theme: ChannelTheme;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ theme, icon: Icon, title, subtitle, action }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      <div className={`w-11 h-11 rounded-2xl ${theme.softBg} border ${theme.softBorder} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${theme.iconText}`} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

/** WhatsApp-dashboard colored stat card (tinted bg, faded corner icon, mono label). */
export const StatCard: React.FC<{
  theme: ChannelTheme;
  icon?: React.ElementType;
  label: string;
  value: React.ReactNode;
  hint?: string;
  pill?: string;
}> = ({ theme, icon: Icon, label, value, hint, pill }) => (
  <div className={`relative overflow-hidden rounded-2xl ${theme.tintBg} border ${theme.tintBorder} p-6 group shadow-sm`}>
    {Icon && (
      <div className={`absolute top-0 right-0 p-4 opacity-[0.05] ${theme.iconText} group-hover:scale-110 transition-transform`}>
        <Icon size={80} />
      </div>
    )}
    <div className="relative">
      <p className={`text-[10px] font-mono ${theme.labelText} uppercase tracking-widest mb-1 font-semibold`}>{label}</p>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      {hint && <p className="text-xs text-gray-500 font-normal mt-2">{hint}</p>}
      {pill && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`text-[10px] ${theme.pill} px-2 py-0.5 rounded-full font-semibold`}>{pill}</span>
        </div>
      )}
    </div>
  </div>
);
