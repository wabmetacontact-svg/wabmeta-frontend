// Client's own Razorpay account (backend: /api/payments/gateway).
//
// Customer money goes straight to the client's Razorpay - WabMeta never holds
// it. The secret is stored encrypted and never sent back to the browser.
// The webhook is optional: without it the server still polls Razorpay every few
// minutes, it is just a few minutes slower.

import React, { useEffect, useState } from 'react';
import { CreditCard, Loader2, Save, Copy, Check, Link2, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { payments as paymentsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';

type Gateway = {
  connected: boolean;
  keyId?: string;
  webhookConfigured?: boolean;
  isActive?: boolean;
};

const inputCls =
  'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500';
const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1';

const apiBase = () =>
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || 'https://api.wabmeta.com/api';

const PaymentsSettings: React.FC = () => {
  const { organization } = useAuth();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gateway, setGateway] = useState<Gateway>({ connected: false });
  const [form, setForm] = useState({ keyId: '', keySecret: '', webhookSecret: '' });
  const [copied, setCopied] = useState(false);

  const webhookUrl = organization?.id ? `${apiBase()}/webhooks/razorpay/client/${organization.id}` : '';

  const load = () =>
    paymentsApi
      .getGateway()
      .then((res) => {
        if (res.data.success) setGateway(res.data.data || { connected: false });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!form.keyId.trim() || !form.keySecret.trim()) {
      toast.error('Enter both the Key ID and the Key Secret');
      return;
    }
    setSaving(true);
    try {
      const res = await paymentsApi.connectGateway({
        keyId: form.keyId.trim(),
        keySecret: form.keySecret.trim(),
        webhookSecret: form.webhookSecret.trim() || null,
      });
      setGateway(res.data.data);
      setForm({ keyId: '', keySecret: '', webhookSecret: '' });
      toast.success('Razorpay connected');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not connect Razorpay');
    } finally {
      setSaving(false);
    }
  };

  const disconnect = async () => {
    if (
      !(await confirm({
        title: 'Disconnect Razorpay?',
        message: 'New payment links cannot be created until you connect it again. Links already sent keep working.',
        confirmLabel: 'Disconnect',
        tone: 'danger',
      }))
    )
      return;
    try {
      await paymentsApi.disconnectGateway();
      setGateway({ connected: false });
      toast.success('Razorpay disconnected');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not disconnect');
    }
  };

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy - select the URL and copy it manually');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading payment settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          Payments
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Connect your own Razorpay account to send payment links from the CRM, the AI agent and automations.
          Customers pay you directly - WabMeta never holds your money.
        </p>
      </div>

      {gateway.connected ? (
        <div className="p-5 bg-green-50 border border-green-200 rounded-2xl">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                Razorpay connected
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Key: <span className="font-mono">{gateway.keyId}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {gateway.webhookConfigured
                  ? 'Webhook secret saved - payments confirm instantly.'
                  : 'No webhook yet - payments confirm within a few minutes by polling.'}
              </p>
            </div>
            <button
              type="button"
              onClick={disconnect}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl"
            >
              <Trash2 className="w-4 h-4" /> Disconnect
            </button>
          </div>
        </div>
      ) : (
        <p className="p-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl">
          Not connected yet. Payment links cannot be created until you add your keys.
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{gateway.connected ? 'Replace keys' : 'Connect Razorpay'}</h3>
          <a
            href="https://dashboard.razorpay.com/app/website-app-settings/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            Where do I find these? <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rzp-key-id" className={labelCls}>Key ID</label>
            <input
              id="rzp-key-id"
              value={form.keyId}
              onChange={(e) => setForm({ ...form, keyId: e.target.value })}
              placeholder="rzp_live_xxxxxxxx"
              className={inputCls}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="rzp-key-secret" className={labelCls}>Key Secret</label>
            <input
              id="rzp-key-secret"
              type="password"
              value={form.keySecret}
              onChange={(e) => setForm({ ...form, keySecret: e.target.value })}
              placeholder="Stored encrypted, never shown again"
              className={inputCls}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div>
          <label htmlFor="rzp-webhook-secret" className={labelCls}>Webhook secret (optional)</label>
          <input
            id="rzp-webhook-secret"
            type="password"
            value={form.webhookSecret}
            onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })}
            placeholder="The secret you set on the Razorpay webhook"
            className={inputCls}
            autoComplete="new-password"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {gateway.connected ? 'Save keys' : 'Connect'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-gray-500" />
          Instant confirmation (optional)
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          In your Razorpay dashboard open <strong>Settings → Webhooks → Add New Webhook</strong>, paste this URL,
          pick the <strong>payment_link.paid</strong>, <strong>payment_link.expired</strong> and{' '}
          <strong>payment_link.cancelled</strong> events, set a secret, and save the same secret above.
        </p>
        <div className="flex gap-2 mt-3">
          <input readOnly value={webhookUrl} aria-label="Webhook URL" className={`${inputCls} font-mono text-xs`} />
          <button
            type="button"
            onClick={copyWebhook}
            className="px-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Skip this and payments still get confirmed - the server checks Razorpay every few minutes.
        </p>
      </div>
    </div>
  );
};

export default PaymentsSettings;
