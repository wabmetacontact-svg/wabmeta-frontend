// src/components/settings/CallingSettings.tsx

import React, { useState, useEffect } from 'react';
import {
  Phone, PhoneCall, ToggleLeft, ToggleRight, Loader2,
  AlertCircle, Clock, Globe, CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
const DAY_SHORT: Record<string, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};

interface DayHours {
  day: typeof DAYS[number];
  openTime: string;
  closeTime: string;
  enabled: boolean;
}

const DEFAULT_HOURS: DayHours[] = DAYS.map((day) => ({
  day,
  openTime: '0900',
  closeTime: '1800',
  enabled: !['SATURDAY', 'SUNDAY'].includes(day),
}));

const CallingSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Basic toggles
  const [callingEnabled, setCallingEnabled] = useState(false);
  const [inboundEnabled, setInboundEnabled] = useState(true);
  const [callbackEnabled, setCallbackEnabled] = useState(true);

  // Country restriction
  const [restrictIndia, setRestrictIndia] = useState(true);

  // Call Hours
  const [callHoursEnabled, setCallHoursEnabled] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState<DayHours[]>(DEFAULT_HOURS);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/calling/settings');
      if (response.data.success) {
        const d = response.data.data;
        if (d.callingEnabled !== undefined) setCallingEnabled(d.callingEnabled);
        if (d.inboundCallsEnabled !== undefined) setInboundEnabled(d.inboundCallsEnabled);
        if (d.callbackEnabled !== undefined) setCallbackEnabled(d.callbackEnabled);
        if (d.callHoursEnabled !== undefined) setCallHoursEnabled(d.callHoursEnabled);
      }
    } catch (error) {
      console.error('Failed to fetch calling settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = () => ({
    callingEnabled,
    inboundCallsEnabled: inboundEnabled,
    callbackEnabled,
    restrictToCountries: restrictIndia ? ['IN'] : [],
    callHoursEnabled,
    timezone: 'Asia/Kolkata',
    weeklyHours: callHoursEnabled
      ? weeklyHours
          .filter((h) => h.enabled)
          .map((h) => ({ day: h.day, openTime: h.openTime, closeTime: h.closeTime }))
      : [],
  });

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await api.put('/calling/settings', buildPayload());
      toast.success('✅ Calling settings saved!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: typeof DAYS[number]) => {
    setWeeklyHours((prev) =>
      prev.map((h) => (h.day === day ? { ...h, enabled: !h.enabled } : h))
    );
  };

  const updateHour = (day: typeof DAYS[number], field: 'openTime' | 'closeTime', value: string) => {
    setWeeklyHours((prev) =>
      prev.map((h) => (h.day === day ? { ...h, [field]: value } : h))
    );
  };

  const formatTime = (hhmm: string) => {
    const h = parseInt(hhmm.substring(0, 2));
    const m = hhmm.substring(2);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${m} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          WhatsApp Calling
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure call settings for your WhatsApp Business number
        </p>
      </div>

      {/* Requirements */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 dark:text-amber-200 font-medium text-sm">Requirements</p>
            <ul className="text-amber-700 dark:text-amber-300 text-xs mt-1 space-y-1">
              <li>• 2000+ business-initiated conversations/day (Tier 2)</li>
              <li>• Cloud API phone number (not Business App)</li>
              <li>• WhatsApp Calling enabled via Meta Business Suite</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: Basic Toggles ── */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-850 dark:text-slate-250">Basic Settings</p>
        </div>

        {[
          {
            label: 'Enable WhatsApp Calling',
            desc: 'Call customers directly via WhatsApp',
            icon: PhoneCall,
            value: callingEnabled,
            set: setCallingEnabled,
          },
          {
            label: 'Allow Inbound Calls',
            desc: 'Allow customers to call you',
            icon: Phone,
            value: inboundEnabled,
            set: setInboundEnabled,
          },
          {
            label: 'Callback Requests',
            desc: 'Customers can request a callback for missed calls',
            icon: PhoneCall,
            value: callbackEnabled,
            set: setCallbackEnabled,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <item.icon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-850 dark:text-white">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            </div>
            <button
              onClick={() => item.set(!item.value)}
              className="shrink-0"
              title={item.value ? 'Disable' : 'Enable'}
            >
              {item.value ? (
                <ToggleRight className="w-10 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-slate-400 dark:text-slate-650" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* ── SECTION 2: Country Restriction ── */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <p className="text-sm font-semibold text-slate-850 dark:text-slate-250">Country Restriction</p>
          </div>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-850 dark:text-white">
              🇮🇳 Restrict to India Only
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Call button will only be shown to users in India
            </p>
          </div>
          <button onClick={() => setRestrictIndia(!restrictIndia)}>
            {restrictIndia ? (
              <ToggleRight className="w-10 h-6 text-green-500" />
            ) : (
              <ToggleLeft className="w-10 h-6 text-slate-400 dark:text-slate-650" />
            )}
          </button>
        </div>
        {!restrictIndia && (
          <div className="px-4 pb-3">
            <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
              🌍 All countries can call — no restriction applied
            </p>
          </div>
        )}
      </div>

      {/* ── SECTION 3: Call Hours ── */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <p className="text-sm font-semibold text-slate-850 dark:text-slate-250">
                Business Hours (IST — Asia/Kolkata)
              </p>
            </div>
            <button onClick={() => setCallHoursEnabled(!callHoursEnabled)}>
              {callHoursEnabled ? (
                <ToggleRight className="w-10 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-slate-400 dark:text-slate-650" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {callHoursEnabled
              ? 'Call button will only be visible during these hours'
              : 'OFF — Call button is visible 24/7'}
          </p>
        </div>

        {callHoursEnabled && (
          <div className="p-4 space-y-2">
            {weeklyHours.map((h) => (
              <div
                key={h.day}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  h.enabled
                    ? 'bg-green-50 dark:bg-green-900/10'
                    : 'bg-slate-100/50 dark:bg-slate-900/40 opacity-60'
                }`}
              >
                {/* Day toggle */}
                <button
                  onClick={() => toggleDay(h.day)}
                  className={`w-10 text-xs font-semibold rounded px-1 py-0.5 transition-colors ${
                    h.enabled
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {DAY_SHORT[h.day]}
                </button>

                {/* Time inputs */}
                {h.enabled ? (
                  <>
                    <input
                      type="time"
                      value={`${h.openTime.substring(0, 2)}:${h.openTime.substring(2)}`}
                      onChange={(e) =>
                        updateHour(h.day, 'openTime', e.target.value.replace(':', ''))
                      }
                      className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-white w-28 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">to</span>
                    <input
                      type="time"
                      value={`${h.closeTime.substring(0, 2)}:${h.closeTime.substring(2)}`}
                      onChange={(e) =>
                        updateHour(h.day, 'closeTime', e.target.value.replace(':', ''))
                      }
                      className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-white w-28 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <span className="text-xs text-green-600 dark:text-green-400 ml-auto">
                      {formatTime(h.openTime)} – {formatTime(h.closeTime)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-450 dark:text-slate-500 italic">Closed</span>
                )}
              </div>
            ))}

            {/* Quick presets */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() =>
                  setWeeklyHours(DEFAULT_HOURS)
                }
                className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 transition-colors"
              >
                ⚡ Mon–Fri 9AM–6PM
              </button>
              <button
                onClick={() =>
                  setWeeklyHours(
                    DAYS.map((day) => ({ day, openTime: '0900', closeTime: '2100', enabled: true }))
                  )
                }
                className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition-colors"
              >
                🌐 All Days 9AM–9PM
              </button>
              <button
                onClick={() =>
                  setWeeklyHours(
                    DAYS.map((day) => ({ day, openTime: '0000', closeTime: '2359', enabled: true }))
                  )
                }
                className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 transition-colors"
              >
                ♾️ 24/7
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveAll}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle2 className="w-4 h-4" />
        )}
        {saving ? 'Saving...' : 'Save Calling Settings'}
      </button>
    </div>
  );
};

export default CallingSettings;
