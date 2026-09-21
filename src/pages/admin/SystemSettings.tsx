// src/pages/admin/SystemSettings.tsx
//
// Platform-wide switches, saved on the server and enforced there
// (backend: src/modules/admin/systemSettings.ts), plus the signed-in admin's
// own two-factor authentication.
//
// This page used to fake its save with a timeout; nothing it showed was ever
// stored. The message limit, support email and clear-cache controls it had
// did nothing and are gone - per-organization daily caps now live on each
// organization's Control page.

import React, { useEffect, useState } from 'react';
import { Building2, Hash, KeyRound, Loader2, Power, Save, Settings, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import { adminCan, getAdminUser, saveAdminUser } from '../../utils/adminPermissions';

interface PlatformSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowRegistration: boolean;
  maxOrganizationsPerUser: number;
}

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  label: string;
}> = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full
      transition-colors disabled:opacity-50 disabled:cursor-not-allowed
      ${checked ? 'bg-primary-600' : 'bg-gray-300'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white
        transition-transform shadow-md
        ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

const errorText = (err: any, fallback: string) => err?.response?.data?.message || fallback;

// ─── Two-factor card ───────────────────────────────────────────────────────

const TwoFactorCard: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(!!getAdminUser()?.otpEnabled);
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    admin
      .getProfile()
      .then((res) => {
        setEnabled(!!res.data.data?.otpEnabled);
        saveAdminUser(res.data.data);
      })
      .catch(() => undefined);
  }, []);

  const start = async () => {
    setBusy(true);
    try {
      const res = await admin.startTwoFactor();
      setSetup(res.data.data);
      setCode('');
    } catch (err) {
      toast.error(errorText(err, 'Could not start 2FA setup'));
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async () => {
    setBusy(true);
    try {
      if (enabled) {
        await admin.disableTwoFactor(code);
        setEnabled(false);
        toast.success('Two-factor authentication is off');
      } else {
        await admin.confirmTwoFactor(code);
        setEnabled(true);
        setSetup(null);
        toast.success('Two-factor authentication is on');
      }
      setCode('');
    } catch (err) {
      toast.error(errorText(err, 'That code is not correct'));
    } finally {
      setBusy(false);
    }
  };

  const grouped = setup?.secret.match(/.{1,4}/g)?.join(' ') ?? '';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-200">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Your two-factor authentication</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            A code from an authenticator app (Google Authenticator, Authy, 1Password) at every admin sign-in.
          </p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
            enabled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}
        >
          {enabled ? 'On' : 'Off'}
        </span>
      </div>

      {!enabled && !setup && (
        <button
          onClick={start}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          Turn on 2FA
        </button>
      )}

      {setup && !enabled && (
        <div className="space-y-3 text-sm">
          <p className="text-gray-700">
            1. In your authenticator app choose <em>Enter a setup key</em> and type this key
            (time-based):
          </p>
          <code className="block p-3 rounded-xl bg-gray-50 border border-gray-200 font-mono tracking-wider text-gray-900 break-all select-all">
            {grouped}
          </code>
          <p className="text-xs text-gray-500">
            On a phone, you can instead{' '}
            <a href={setup.otpauthUrl} className="text-primary-600 underline">
              open this link
            </a>{' '}
            to add it directly.
          </p>
          <p className="text-gray-700">2. Enter the 6-digit code the app shows:</p>
        </div>
      )}

      {(setup || enabled) && (
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <input
            aria-label="Authenticator code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="w-36 px-3 py-2 rounded-xl border border-gray-200 text-sm tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button
            onClick={confirmCode}
            disabled={busy || code.length !== 6}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 ${
              enabled ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'bg-gray-900 text-white hover:bg-black'
            }`}
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {enabled ? 'Turn off 2FA' : 'Confirm and turn on'}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────

const SystemSettings: React.FC = () => {
  const confirm = useConfirm();
  const canWrite = adminCan('settings.write');

  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [saved, setSaved] = useState<PlatformSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    admin
      .getSystemSettings()
      .then((res) => {
        setSettings(res.data.data);
        setSaved(res.data.data);
      })
      .catch((err) => toast.error(errorText(err, 'Could not load settings')));
  }, []);

  const update = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) =>
    setSettings((s) => (s ? { ...s, [key]: value } : s));

  const handleSave = async () => {
    if (!settings) return;

    if (settings.maintenanceMode && !saved?.maintenanceMode) {
      const ok = await confirm({
        title: 'Turn on maintenance mode?',
        message: 'Every customer - web and mobile - is blocked until you turn it off. The admin panel and incoming webhooks keep working.',
        confirmLabel: 'Turn on',
        tone: 'danger',
      });
      if (!ok) return;
    }

    setSaving(true);
    try {
      const res = await admin.updateSystemSettings({
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        allowRegistration: settings.allowRegistration,
        maxOrganizationsPerUser: settings.maxOrganizationsPerUser,
      });
      setSettings(res.data.data);
      setSaved(res.data.data);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(errorText(err, 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide switches. They take effect within 15 seconds.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-200">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Settings className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Platform</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {canWrite ? 'Changes apply to every customer.' : 'Your role can view these but not change them.'}
            </p>
          </div>
        </div>

        {!settings ? (
          <div className="py-10 text-center text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin inline" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${settings.maintenanceMode ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                    <Power className={`w-4 h-4 ${settings.maintenanceMode ? 'text-red-500' : 'text-green-500'}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Maintenance mode</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Blocks every customer on web and mobile. Admin panel and webhooks keep working.
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  label="Maintenance mode"
                  checked={settings.maintenanceMode}
                  onChange={(v) => update('maintenanceMode', v)}
                  disabled={!canWrite}
                />
              </div>
              {settings.maintenanceMode && (
                <textarea
                  aria-label="Maintenance message"
                  value={settings.maintenanceMessage}
                  onChange={(e) => update('maintenanceMessage', e.target.value)}
                  disabled={!canWrite}
                  maxLength={500}
                  rows={2}
                  placeholder="Message customers see, e.g. We'll be back by 6 pm IST."
                  className="mt-3 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.allowRegistration ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                  <Hash className={`w-4 h-4 ${settings.allowRegistration ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Allow new sign-ups</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Off blocks email, phone and Google sign-up. Existing users can still sign in.</p>
                </div>
              </div>
              <ToggleSwitch
                label="Allow new sign-ups"
                checked={settings.allowRegistration}
                onChange={(v) => update('allowRegistration', v)}
                disabled={!canWrite}
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Building2 className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Organizations per user</h4>
                  <p className="text-xs text-gray-500 mt-0.5">How many organizations one user may create and own.</p>
                </div>
              </div>
              <input
                aria-label="Organizations per user"
                type="number"
                min={1}
                max={1000}
                value={settings.maxOrganizationsPerUser}
                onChange={(e) => update('maxOrganizationsPerUser', Math.max(1, Number(e.target.value) || 1))}
                disabled={!canWrite}
                className="w-24 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        )}

        {canWrite && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save settings
            </button>
          </div>
        )}
      </div>

      <TwoFactorCard />
    </div>
  );
};

export default SystemSettings;
