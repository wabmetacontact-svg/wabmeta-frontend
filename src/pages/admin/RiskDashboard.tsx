// src/pages/admin/RiskDashboard.tsx
//
// Accounts that need a human: blocked, low number quality, plans about to
// lapse, low wallets, failed payments, sudden sending spikes, failing
// campaigns, and customers who pay but have gone quiet.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';

const inr = (paise: number) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN')}`;
const d = (v?: string) => (v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—');

const OrgLink: React.FC<{ id?: string; name?: string }> = ({ id, name }) =>
  id ? (
    <Link to={`/manage-wabmeta-admin/organizations/${id}`} className="font-medium text-gray-900 hover:text-primary-600">
      {name || id}
    </Link>
  ) : (
    <span>{name || '—'}</span>
  );

interface Section {
  key: string;
  title: string;
  help: string;
  tone: string;
  render: (row: any) => React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    key: 'sendingSpikes', title: 'Sending spikes', tone: 'border-red-300',
    help: '3x their usual daily volume in the last 24 hours (and 500+). Possible spam or a hijacked account.',
    render: (r) => <><OrgLink id={r.organizationId} name={r.organizationName} /> · {r.last24} in 24h (usual ~{Math.round(r.prev7 / 7)}/day)</>,
  },
  {
    key: 'lowQuality', title: 'Low number quality', tone: 'border-red-300',
    help: 'WhatsApp quality YELLOW or RED. RED is close to a Meta restriction.',
    render: (r) => <><OrgLink id={r.organization?.id} name={r.organization?.name} /> · {r.phoneNumber} · <strong>{r.qualityRating}</strong></>,
  },
  {
    key: 'highCampaignFailure', title: 'Failing campaigns', tone: 'border-red-300',
    help: '20%+ of campaign messages failed in the last 7 days.',
    render: (r) => <><OrgLink id={r.organizationId} name={r.organizationName} /> · {r.failureRate}% failed ({r.failed}/{r.total})</>,
  },
  {
    key: 'blocked', title: 'Blocked by admin', tone: 'border-amber-300',
    help: 'Read-only or suspended right now.',
    render: (r) => <><OrgLink id={r.id} name={r.name} /> · {r.status}{r.statusReason ? ` · ${r.statusReason}` : ''}</>,
  },
  {
    key: 'expiringSoon', title: 'Plans ending in 7 days', tone: 'border-amber-300',
    help: 'A nudge now saves a renewal.',
    render: (r) => <><OrgLink id={r.organization?.id} name={r.organization?.name} /> · {r.plan?.name} · ends {d(r.currentPeriodEnd)}</>,
  },
  {
    key: 'recentlyExpired', title: 'Ended in the last 7 days', tone: 'border-amber-300',
    help: 'Did not renew.',
    render: (r) => <><OrgLink id={r.organization?.id} name={r.organization?.name} /> · {r.plan?.name} · ended {d(r.currentPeriodEnd)}</>,
  },
  {
    key: 'failedPayments', title: 'Failed payments (7 days)', tone: 'border-amber-300',
    help: 'Tried to pay and could not.',
    render: (r) => <><OrgLink id={r.organization?.id} name={r.organization?.name} /> · {r.planName} · {inr(r.amount)} · {d(r.createdAt)}</>,
  },
  {
    key: 'lowWallets', title: 'Low wallet balance', tone: 'border-blue-300',
    help: 'Below their own alert threshold - campaigns will pause soon.',
    render: (r) => <><OrgLink id={r.organizationId} name={r.organizationName} /> · {inr(r.balancePaise)} (alert at {inr(r.lowThresholdPaise)})</>,
  },
  {
    key: 'inactivePaying', title: 'Paying but quiet (14 days)', tone: 'border-blue-300',
    help: 'Active paid plan, nothing sent for two weeks. Churn risk.',
    render: (r) => <><OrgLink id={r.organizationId} name={r.organizationName} /> · plan ends {d(r.currentPeriodEnd)}</>,
  },
];

const RiskDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await admin.getRiskReport();
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not load the risk report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Needs attention</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data ? `As of ${new Date(data.generatedAt).toLocaleTimeString('en-IN')}. Each list shows up to 20.` : 'Loading…'}
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {!data && loading && <div className="py-20 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin inline" /></div>}

      {data && (
        <div className="grid gap-4 lg:grid-cols-2">
          {SECTIONS.map((s) => {
            const rows: any[] = data[s.key] || [];
            return (
              <div key={s.key} className={`bg-white rounded-2xl border-l-4 border border-gray-200 ${s.tone} p-5`}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{s.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${rows.length ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {rows.length}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 mb-3">{s.help}</p>
                {rows.length === 0 ? (
                  <p className="text-sm text-gray-400">Nothing here.</p>
                ) : (
                  <ul className="divide-y divide-gray-100 text-sm text-gray-600">
                    {rows.map((r, i) => <li key={i} className="py-1.5">{s.render(r)}</li>)}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiskDashboard;
