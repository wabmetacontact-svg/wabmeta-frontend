import React, { useState, useEffect } from 'react';
import {
  Phone, PhoneCall, ToggleLeft, ToggleRight, Loader2,
  AlertCircle, Clock, Globe, CheckCircle2, PhoneIncoming, PhoneOutgoing, XCircle, ShieldCheck,
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

// Meta call_icons.restrict_to_user_countries ISO country codes leta hai.
// Common markets - baaki chahiye to yahan add kar do.
const COUNTRY_OPTIONS = [
  { code: 'IN', label: 'India', flag: '🇮🇳' },
  { code: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', label: 'United States', flag: '🇺🇸' },
  { code: 'AE', label: 'UAE', flag: '🇦🇪' },
  { code: 'SG', label: 'Singapore', flag: '🇸🇬' },
  { code: 'AU', label: 'Australia', flag: '🇦🇺' },
  { code: 'CA', label: 'Canada', flag: '🇨🇦' },
  { code: 'BR', label: 'Brazil', flag: '🇧🇷' },
];

const TIMEZONE_OPTIONS = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
  'UTC',
];

const DEFAULT_HOURS: DayHours[] = DAYS.map((day) => ({
  day,
  openTime: '0900',
  closeTime: '1800',
  enabled: !['SATURDAY', 'SUNDAY'].includes(day),
}));

interface Eligibility {
  connected: boolean;
  phoneNumber?: string;
  callingEnabled?: boolean | null;
  messagingLimit?: string | null;
  dailyLimit?: number | null;
  minimumDailyLimit?: number;
  meetsLimit?: boolean | null;
  outboundAvailable?: boolean;
  outboundBlockedReason?: string | null;
}

interface CallLogRow {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  from: string | null;
  to: string | null;
  startedAt: string;
  duration: number | null;
  contactName: string | null;
}

const CALL_STATUS_TEXT: Record<string, string> = {
  COMPLETED: 'Completed', MISSED: 'Missed', NOT_ANSWERED: 'No answer', REJECTED: 'Declined',
  FAILED: 'Failed', RINGING: 'Ringing', CALLING: 'Calling', ANSWERING: 'Answering', ANSWERED: 'In progress',
};

const formatSeconds = (s: number | null) =>
  s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '';

interface PermissionTemplate {
  name: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED' | string;
  category: string;
  rejectionReason: string | null;
  bodyText: string;
}

/**
 * WhatsApp lets a business call a customer only after they allow it. Inside
 * the 24-hour chat window the request goes as a free message; outside it Meta
 * needs an approved template with a call permission button - this card
 * creates that template and shows its review status.
 */
const PermissionTemplateCard: React.FC = () => {
  const [template, setTemplate] = useState<PermissionTemplate | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/calling/permission-template')
      .then((r) => setTemplate(r.data?.data ?? null))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  const create = async () => {
    setCreating(true);
    try {
      const r = await api.post('/calling/permission-template');
      setTemplate(r.data?.data ?? null);
      toast.success('Sent to Meta for approval');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not create the template');
    } finally {
      setCreating(false);
    }
  };

  const status = template?.status;
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <p className="text-sm font-semibold text-slate-700">Call permission template</p>
        </div>
        {status === 'APPROVED' && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">Approved</span>
        )}
        {status === 'PENDING' && (
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">Waiting for Meta</span>
        )}
        {(status === 'REJECTED' || status === 'PAUSED') && (
          <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
            {status === 'PAUSED' ? 'Paused' : 'Rejected'}
          </span>
        )}
      </div>
      <div className="px-4 py-3 space-y-3">
        <p className="text-xs text-slate-500">
          You can call a customer only after they tap <strong>Allow</strong>. If they messaged you in the last 24 hours the
          request is a free chat message. Otherwise WhatsApp needs this approved template, charged like any utility
          template from your wallet.
        </p>

        {!loaded ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        ) : template ? (
          <>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-sm text-slate-800">{template.bodyText}</p>
              <p className="mt-2 text-xs font-semibold text-sky-700 text-center border-t border-slate-200 pt-2">📞 Allow calls</p>
            </div>
            {status === 'PENDING' && (
              <p className="text-xs text-slate-500">Meta usually reviews it within a few minutes to 24 hours.</p>
            )}
            {(status === 'REJECTED' || status === 'PAUSED') && (
              <div className="space-y-2">
                {template.rejectionReason && <p className="text-xs text-red-600">{template.rejectionReason}</p>}
                {status === 'REJECTED' && (
                  <button
                    onClick={create}
                    disabled={creating}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {creating && <Loader2 className="w-4 h-4 animate-spin" />} Submit again
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <button
            onClick={create}
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {creating && <Loader2 className="w-4 h-4 animate-spin" />} Create template & send to Meta
          </button>
        )}
      </div>
    </div>
  );
};

const CallingSettings: React.FC = () => {
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [recentCalls, setRecentCalls] = useState<CallLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [callingEnabled, setCallingEnabled] = useState(false);
  // Meta ke paas "inbound calls" ka alag field nahi hai - call button
  // chhupana hi customers ko call karne se rokne ka tarika hai
  const [showCallButton, setShowCallButton] = useState(true);
  const [callbackEnabled, setCallbackEnabled] = useState(true);
  const [restrictCountries, setRestrictCountries] = useState<string[]>([]);
  const [callHoursEnabled, setCallHoursEnabled] = useState(false);
  // Pehle 'Asia/Kolkata' hardcoded jaata tha - UK/US numbers ke liye galat tha
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [weeklyHours, setWeeklyHours] = useState<DayHours[]>(DEFAULT_HOURS);

  useEffect(() => {
    fetchSettings();
    api.get('/calling/eligibility').then((r) => setEligibility(r.data?.data ?? null)).catch(() => undefined);
    api.get('/calling/logs', { params: { limit: 10 } }).then((r) => setRecentCalls(r.data?.data || [])).catch(() => undefined);
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/calling/settings');
      if (response.data.success) {
        const d = response.data.data;
        if (d.callingEnabled !== undefined) setCallingEnabled(d.callingEnabled);
        if (d.showCallButton !== undefined) setShowCallButton(d.showCallButton);
        if (d.callbackEnabled !== undefined) setCallbackEnabled(d.callbackEnabled);
        if (d.callHoursEnabled !== undefined) setCallHoursEnabled(d.callHoursEnabled);
        if (Array.isArray(d.restrictToCountries)) setRestrictCountries(d.restrictToCountries);
      }
    } catch (error) {
      console.error('Failed to fetch calling settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const response = await api.put('/calling/settings', {
        callingEnabled,
        showCallButton,
        callbackEnabled,
        restrictToCountries: restrictCountries,
        callHoursEnabled,
        timezone,
        weeklyHours: callHoursEnabled
          ? weeklyHours.filter((h) => h.enabled).map((h) => ({
              day: h.day, openTime: h.openTime, closeTime: h.closeTime,
            }))
          : [],
      });
      if (response.data?.callbackUnsupported) {
        // Meta is number ke country mein business-initiated calls allow nahi
        // karta, isliye backend ne callback band karke save kiya
        setCallbackEnabled(false);
        toast.success('✅ Calling settings saved. Callback requests are not available for your number\'s country, so they were turned off.');
      } else {
        toast.success('✅ Calling settings saved!');
      }
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

  const toggleItems = [
    { label: 'Enable WhatsApp Calling', desc: 'Call customers directly via WhatsApp', icon: PhoneCall, value: callingEnabled, set: setCallingEnabled },
    { label: 'Show call button to customers', desc: 'Turn off to stop customers from calling you', icon: Phone, value: showCallButton, set: setShowCallButton },
    { label: 'Callback Requests', desc: 'Customers can request a callback for missed calls', icon: PhoneCall, value: callbackEnabled, set: setCallbackEnabled },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900">WhatsApp Calling</h3>
        <p className="text-sm text-slate-500 mt-1">
          Configure call settings for your WhatsApp Business number
        </p>
      </div>

      {/* Can this number use calling? Meta's rules, checked against the number */}
      {eligibility?.connected && eligibility.meetsLimit === false ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium text-sm">This number cannot use calling yet</p>
              <p className="text-red-700 text-xs mt-1">
                WhatsApp allows calling only on numbers that can message at least{' '}
                {(eligibility.minimumDailyLimit || 2000).toLocaleString('en-IN')} customers a day. Yours is at{' '}
                <strong>{eligibility.dailyLimit?.toLocaleString('en-IN') ?? 'a lower tier'}</strong> a day. Meta raises the
                limit as you keep sending messages people want, with a good quality rating.
              </p>
            </div>
          </div>
        </div>
      ) : eligibility?.connected && eligibility.meetsLimit ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800 space-y-1">
              <p className="font-medium text-sm">
                {eligibility.phoneNumber} can use WhatsApp calling
                {eligibility.dailyLimit ? ` (limit ${eligibility.dailyLimit.toLocaleString('en-IN')} a day)` : ' (unlimited tier)'}
              </p>
              <p>
                {eligibility.callingEnabled
                  ? 'Calling is switched on. Customer calls ring in the dashboard for every agent.'
                  : 'Calling is switched off. Turn on "Enable WhatsApp Calling" below and save.'}
              </p>
              {eligibility.outboundAvailable === false && <p>{eligibility.outboundBlockedReason}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium text-sm">Requirements</p>
              <ul className="text-amber-700 text-xs mt-1 space-y-1">
                <li>• Daily messaging limit of at least 2,000 unique recipients</li>
                <li>• Cloud API phone number (not the WhatsApp Business app)</li>
                <li>
                  • <strong>Business-initiated calls</strong> are not available for numbers in
                  the US, Canada, Egypt, Vietnam or Nigeria. Customers from those
                  countries can still call you.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Basic Toggles */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700">Basic Settings</p>
        </div>
        {toggleItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <item.icon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
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
                <ToggleLeft className="w-10 h-6 text-slate-300" />
              )}
            </button>
          </div>
        ))}
      </div>

      <PermissionTemplateCard />

      {/* Country Restriction */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <p className="text-sm font-semibold text-slate-700">Country Restriction</p>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-slate-500 mb-3">
            The call button will only be shown to users in the countries you
            select. Leave empty to show it everywhere.
          </p>

          <div className="flex flex-wrap gap-2">
            {COUNTRY_OPTIONS.map((c) => {
              const active = restrictCountries.includes(c.code);
              return (
                <button
                  key={c.code}
                  onClick={() =>
                    setRestrictCountries((prev) =>
                      prev.includes(c.code)
                        ? prev.filter((x) => x !== c.code)
                        : [...prev, c.code]
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.flag} {c.label}
                </button>
              );
            })}
          </div>

          {restrictCountries.length === 0 && (
            <p className="mt-3 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              🌍 No restriction — the call button is shown in all countries
            </p>
          )}
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <p className="text-sm font-semibold text-slate-700">Business Hours</p>
            </div>
            <button onClick={() => setCallHoursEnabled(!callHoursEnabled)}>
              {callHoursEnabled ? (
                <ToggleRight className="w-10 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-slate-300" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {callHoursEnabled
              ? 'Call button visible only during these hours'
              : 'OFF — Call button visible 24/7'}
          </p>
        </div>

        {callHoursEnabled && (
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            {weeklyHours.map((h) => (
              <div
                key={h.day}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  h.enabled ? 'bg-green-50' : 'bg-slate-50 opacity-60'
                }`}
              >
                <button
                  onClick={() => toggleDay(h.day)}
                  className={`w-10 text-xs font-semibold rounded px-1 py-0.5 transition-colors ${
                    h.enabled
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {DAY_SHORT[h.day]}
                </button>

                {h.enabled ? (
                  <>
                    <input aria-label="Opening time"
                      type="time"
                      value={`${h.openTime.substring(0, 2)}:${h.openTime.substring(2)}`}
                      onChange={(e) =>
                        updateHour(h.day, 'openTime', e.target.value.replace(':', ''))
                      }
                      className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-800 w-28 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <span className="text-xs text-slate-500">to</span>
                    <input aria-label="Closing time"
                      type="time"
                      value={`${h.closeTime.substring(0, 2)}:${h.closeTime.substring(2)}`}
                      onChange={(e) =>
                        updateHour(h.day, 'closeTime', e.target.value.replace(':', ''))
                      }
                      className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-800 w-28 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <span className="text-xs text-green-600 ml-auto">
                      {formatTime(h.openTime)} – {formatTime(h.closeTime)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 italic">Closed</span>
                )}
              </div>
            ))}

            {/* Quick presets */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => setWeeklyHours(DEFAULT_HOURS)}
                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Mon–Fri 9AM–6PM
              </button>
              <button
                onClick={() =>
                  setWeeklyHours(
                    DAYS.map((day) => ({ day, openTime: '0900', closeTime: '2100', enabled: true }))
                  )
                }
                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                All Days 9AM–9PM
              </button>
              <button
                onClick={() =>
                  setWeeklyHours(
                    DAYS.map((day) => ({ day, openTime: '0000', closeTime: '2359', enabled: true }))
                  )
                }
                className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                24/7
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

      {/* Recent calls */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700">Recent calls</p>
        </div>
        {recentCalls.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500 text-center">No calls yet.</p>
        ) : (
          recentCalls.map((c) => {
            const Icon = c.direction === 'INBOUND' ? PhoneIncoming : PhoneOutgoing;
            const missed = ['MISSED', 'NOT_ANSWERED', 'REJECTED', 'FAILED'].includes(c.status);
            return (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
                <Icon className={`w-4 h-4 shrink-0 ${missed ? 'text-red-500' : 'text-emerald-600'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-900 truncate">
                    {c.contactName || (c.direction === 'INBOUND' ? c.from : c.to) || 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(c.startedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className={missed ? 'text-red-600 font-medium' : 'text-slate-700'}>{CALL_STATUS_TEXT[c.status] || c.status}</p>
                  {c.duration ? <p className="text-slate-400">{formatSeconds(c.duration)}</p> : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CallingSettings;
