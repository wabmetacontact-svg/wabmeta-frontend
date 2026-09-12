// Follow-up quiet hours (backend: OrganizationSettings.quietHours*).
//
// Scheduled follow-ups (Wait/Delay, Wait for Reply timeouts) that fall inside
// this window are pushed to its end. Instant replies to a customer who just
// messaged are not affected. Off by default, with its own timezone - the org's
// timezone defaults to UTC, which would put "night" in the Indian afternoon.

import React, { useEffect, useState } from 'react';
import { Moon, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { crm as crmApi } from '../../services/api';

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Jakarta',
  'Europe/London',
  'America/New_York',
  'UTC',
];

type QuietHours = {
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  quietHoursTimezone: string;
};

const DEFAULTS: QuietHours = {
  quietHoursEnabled: false,
  quietHoursStart: '21:00',
  quietHoursEnd: '09:00',
  quietHoursTimezone: 'Asia/Kolkata',
};

const inputCls =
  'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60';

const QuietHoursCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<QuietHours>(DEFAULTS);
  const [saved, setSaved] = useState<QuietHours>(DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    crmApi
      .getSettings()
      .then((res) => {
        if (cancelled || !res.data.success) return;
        const s = res.data.data || {};
        const next: QuietHours = {
          quietHoursEnabled: !!s.quietHoursEnabled,
          quietHoursStart: s.quietHoursStart || DEFAULTS.quietHoursStart,
          quietHoursEnd: s.quietHoursEnd || DEFAULTS.quietHoursEnd,
          quietHoursTimezone: s.quietHoursTimezone || DEFAULTS.quietHoursTimezone,
        };
        setForm(next);
        setSaved(next);
      })
      .catch(() => {
        // Card stays on defaults; a save will surface the real error.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const zones = TIMEZONES.includes(form.quietHoursTimezone)
    ? TIMEZONES
    : [form.quietHoursTimezone, ...TIMEZONES];

  const save = async () => {
    if (form.quietHoursEnabled && form.quietHoursStart === form.quietHoursEnd) {
      toast.error('Start and end time cannot be the same');
      return;
    }
    setSaving(true);
    try {
      await crmApi.updateSettings(form);
      setSaved(form);
      toast.success(form.quietHoursEnabled ? 'Quiet hours saved' : 'Quiet hours turned off');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not save quiet hours');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Follow-up quiet hours</h3>
            <p className="text-sm text-gray-500">
              Follow-ups scheduled inside this window wait until it ends. Instant replies to customers
              who just messaged you are not affected.
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={form.quietHoursEnabled}
          aria-label="Enable quiet hours"
          disabled={loading}
          onClick={() => setForm({ ...form, quietHoursEnabled: !form.quietHoursEnabled })}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none disabled:opacity-60 ${
            form.quietHoursEnabled ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              form.quietHoursEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {form.quietHoursEnabled && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <label htmlFor="quiet-start" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
              From
            </label>
            <input
              id="quiet-start"
              type="time"
              value={form.quietHoursStart}
              onChange={(e) => setForm({ ...form, quietHoursStart: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="quiet-end" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
              Until
            </label>
            <input
              id="quiet-end"
              type="time"
              value={form.quietHoursEnd}
              onChange={(e) => setForm({ ...form, quietHoursEnd: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="quiet-tz" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
              Timezone
            </label>
            <select
              id="quiet-tz"
              value={form.quietHoursTimezone}
              onChange={(e) => setForm({ ...form, quietHoursTimezone: e.target.value })}
              className={inputCls}
            >
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {dirty && (
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default QuietHoursCard;
