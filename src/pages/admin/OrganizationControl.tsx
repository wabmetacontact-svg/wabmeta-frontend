// src/pages/admin/OrganizationControl.tsx
//
// Everything an admin can decide about one organization: whether it may
// operate (active / read-only / suspended), limits that replace its plan's,
// and ending every member's session.

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Ban,
  Building2,
  CheckCircle2,
  Gauge,
  Loader2,
  Lock,
  LogOut,
  Save,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import PageLoader from '../../components/common/PageLoader';
import { useConfirm } from '../../context/ConfirmContext';
import { adminCan } from '../../utils/adminPermissions';

type OrgStatus = 'ACTIVE' | 'READ_ONLY' | 'SUSPENDED';

const STATUS_OPTIONS: {
  value: OrgStatus;
  label: string;
  help: string;
  icon: typeof CheckCircle2;
  tone: string;
}[] = [
  {
    value: 'ACTIVE',
    label: 'Active',
    help: 'Normal. Everything works.',
    icon: CheckCircle2,
    tone: 'border-green-500 bg-green-50 text-green-700',
  },
  {
    value: 'READ_ONLY',
    label: 'Read-only',
    help: 'Team can sign in, see data and pay. Nothing is sent or changed - no campaigns, bots or replies.',
    icon: Lock,
    tone: 'border-amber-500 bg-amber-50 text-amber-700',
  },
  {
    value: 'SUSPENDED',
    label: 'Suspended',
    help: 'Everyone is signed out and cannot use the app. Nothing is sent. Incoming messages are still saved.',
    icon: Ban,
    tone: 'border-red-500 bg-red-50 text-red-700',
  },
];

const LIMITS: { key: string; label: string; help: string }[] = [
  { key: 'contacts', label: 'Contacts', help: 'Saved contacts' },
  { key: 'messagesPerMonth', label: 'Messages / month', help: 'Outbound messages' },
  { key: 'whatsappNumbers', label: 'WhatsApp numbers', help: 'Connected numbers' },
  { key: 'teamMembers', label: 'Team seats', help: 'Members (and login sessions)' },
  { key: 'aiRepliesPerDay', label: 'AI replies / day', help: 'AI agent and chatbot AI' },
  { key: 'dailyCampaignMessages', label: 'Campaign messages / day', help: 'Anti-spam cap, India time' },
];

const UNLIMITED = 999999;

const showLimit = (v: number | null | undefined) =>
  v === null || v === undefined ? 'No limit' : v >= UNLIMITED ? 'Unlimited' : v.toLocaleString('en-IN');

const errorText = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

const OrganizationControl: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<any>(null);
  const [status, setStatus] = useState<OrgStatus>('ACTIVE');
  const [reason, setReason] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const [limits, setLimits] = useState<any>(null);
  // Text in each override box; '' means "use the plan".
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [savingLimits, setSavingLimits] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(async () => {
    if (!organizationId) return;
    try {
      const [orgRes, limitRes] = await Promise.all([
        admin.getOrganization(organizationId),
        admin.getOrganizationLimits(organizationId),
      ]);
      const o = orgRes.data.data;
      setOrg(o);
      setStatus((o?.status as OrgStatus) || 'ACTIVE');
      setReason(o?.statusReason || '');

      const l = limitRes.data.data;
      setLimits(l);
      setDraft(
        Object.fromEntries(LIMITS.map(({ key }) => [key, l?.overrides?.[key] ? String(l.overrides[key]) : '']))
      );
    } catch (err) {
      toast.error(errorText(err, 'Could not load this organization'));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveStatus = async () => {
    if (!organizationId) return;
    if (status !== 'ACTIVE' && !reason.trim()) {
      toast.error('Write a reason. The customer sees it.');
      return;
    }

    const option = STATUS_OPTIONS.find((o) => o.value === status)!;
    const ok = await confirm({
      title: `Set ${org?.name || 'this organization'} to ${option.label}?`,
      message: option.help,
      confirmLabel: `Make ${option.label.toLowerCase()}`,
      tone: status === 'ACTIVE' ? 'default' : 'danger',
    });
    if (!ok) return;

    setSavingStatus(true);
    try {
      const res = await admin.setOrganizationStatus(organizationId, {
        status,
        reason: status === 'ACTIVE' ? undefined : reason.trim(),
      });
      const d = res.data.data;
      const parts = [`Now ${option.label.toLowerCase()}`];
      if (d?.campaignsPaused) parts.push(`${d.campaignsPaused} campaign(s) paused`);
      if (d?.usersLoggedOut) parts.push(`${d.usersLoggedOut} user(s) signed out`);
      toast.success(parts.join(' · '));
      await load();
    } catch (err) {
      toast.error(errorText(err, 'Could not change the status'));
    } finally {
      setSavingStatus(false);
    }
  };

  const saveLimits = async () => {
    if (!organizationId) return;

    const payload: Record<string, number | null> = {};
    for (const { key, label } of LIMITS) {
      const text = (draft[key] || '').trim();
      if (text === '') {
        payload[key] = null;
        continue;
      }
      const n = Number(text);
      if (!Number.isInteger(n) || n < 1 || n > UNLIMITED) {
        toast.error(`${label}: enter a whole number from 1 to ${UNLIMITED}, or leave it empty.`);
        return;
      }
      payload[key] = n;
    }

    setSavingLimits(true);
    try {
      const res = await admin.updateOrganizationLimits(organizationId, payload);
      setLimits(res.data.data);
      toast.success('Limits saved');
    } catch (err) {
      toast.error(errorText(err, 'Could not save limits'));
    } finally {
      setSavingLimits(false);
    }
  };

  const logoutAll = async () => {
    if (!organizationId) return;
    const ok = await confirm({
      title: 'Sign out every member?',
      message: 'All members are signed out on every device right away. They can sign in again.',
      confirmLabel: 'Sign everyone out',
      tone: 'danger',
    });
    if (!ok) return;

    setLoggingOut(true);
    try {
      const res = await admin.forceLogoutOrganization(organizationId);
      toast.success(res.data.message || 'Signed out');
    } catch (err) {
      toast.error(errorText(err, 'Could not sign members out'));
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) return <PageLoader />;

  if (!org) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 text-gray-500">
        Organization not found.
      </div>
    );
  }

  const canStatus = adminCan('orgs.status');
  const canLimits = adminCan('orgs.limits');
  const canSessions = adminCan('sessions.manage');
  const current = STATUS_OPTIONS.find((o) => o.value === (org.status || 'ACTIVE'))!;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 truncate">{org.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-500">
              <span>Plan: {org.subscription?.plan?.name || org.planType}</span>
              <span>·</span>
              <span>{org.members?.length ?? 0} member(s)</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-medium ${current.tone}`}
              >
                <current.icon className="w-3 h-3" />
                {current.label}
              </span>
            </div>
            {org.statusReason && (
              <p className="text-xs text-gray-500 mt-2">
                Reason: {org.statusReason}
                {org.statusChangedBy ? ` · by ${org.statusChangedBy}` : ''}
                {org.statusChangedAt ? ` · ${new Date(org.statusChangedAt).toLocaleString('en-IN')}` : ''}
              </p>
            )}
          </div>
          <Link
            to={`/manage-wabmeta-admin/organizations/${organizationId}/features`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Features
          </Link>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Account status</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Running campaigns are paused on read-only or suspend, and stay paused after reactivation.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              disabled={!canStatus}
              onClick={() => setStatus(o.value)}
              className={`text-left p-4 rounded-xl border-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                status === o.value ? o.tone : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <o.icon className="w-4 h-4" />
                {o.label}
              </div>
              <p className="text-xs mt-1.5 text-gray-600 leading-relaxed">{o.help}</p>
            </button>
          ))}
        </div>

        {status !== 'ACTIVE' && (
          <div className="mt-4">
            <label htmlFor="org-status-reason" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Reason (the customer sees this)
            </label>
            <textarea
              id="org-status-reason"
              value={reason}
              disabled={!canStatus}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="e.g. Invoice for September is unpaid"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={saveStatus}
            disabled={!canStatus || savingStatus || (status === (org.status || 'ACTIVE') && reason === (org.statusReason || ''))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black disabled:opacity-50"
          >
            {savingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save status
          </button>
        </div>
        {!canStatus && <p className="text-xs text-gray-400 mt-2 text-right">Your role cannot change this.</p>}
      </div>

      {/* Limits */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Gauge className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Custom limits</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              A number here replaces the plan's limit for this organization only. Leave empty to use the plan.
              {limits?.planName ? ` Plan: ${limits.planName}.` : ''}
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {LIMITS.map(({ key, label, help }) => (
            <div key={key} className="py-3 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">
                  {help} · plan: {showLimit(limits?.plan?.[key])} · now:{' '}
                  <span className="font-medium text-gray-700">{showLimit(limits?.effective?.[key])}</span>
                </p>
              </div>
              <input
                aria-label={`${label} override`}
                inputMode="numeric"
                disabled={!canLimits}
                value={draft[key] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value.replace(/[^\d]/g, '') }))}
                placeholder="Plan"
                className="w-36 px-3 py-2 rounded-xl border border-gray-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-gray-400">Enter {UNLIMITED} for unlimited.</p>
          <button
            onClick={saveLimits}
            disabled={!canLimits || savingLimits}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black disabled:opacity-50"
          >
            {savingLimits ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save limits
          </button>
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4 flex-wrap">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <LogOut className="w-5 h-5 text-orange-500" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-base font-semibold text-gray-900">Sign out every member</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ends all sessions of all {org.members?.length ?? 0} member(s) on every device, immediately.
          </p>
        </div>
        <button
          onClick={logoutAll}
          disabled={!canSessions || loggingOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
        >
          {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Sign everyone out
        </button>
      </div>
    </div>
  );
};

export default OrganizationControl;
