// src/pages/admin/PlanPayments.tsx
//
// Every plan payment across customers: received, refunded, and failed
// checkout attempts (recorded by the Razorpay webhook). Answers "did this
// customer's payment come in?" without opening the Razorpay dashboard.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';

type Status = 'SUCCESS' | 'FAILED' | 'REFUNDED';

interface PlanPaymentRow {
  id: string;
  status: Status | 'PENDING';
  amountPaise: number;
  refundedPaise: number;
  planName: string | null;
  billingCycle: string | null;
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  method: string | null;
  failureReason: string | null;
  createdAt: string;
  paidAt: string | null;
  failedAt: string | null;
  organization: { id: string; name: string } | null;
}

interface PlanPaymentsData {
  rows: PlanPaymentRow[];
  total: number;
  page: number;
  limit: number;
  summary: { receivedCount: number; receivedPaise: number; refundedPaise: number; failedCount: number };
}

const PAGE_SIZE = 50;
const AUTO_REFRESH_MS = 30_000;

const inr = (paise: number) =>
  `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const when = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      })
    : '—';

const STATUS_TABS: { value: Status | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'SUCCESS', label: 'Received' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const StatusBadge: React.FC<{ row: PlanPaymentRow }> = ({ row }) => {
  if (row.status === 'SUCCESS' && row.refundedPaise > 0) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Partly refunded</span>;
  }
  const map: Record<string, { label: string; cls: string }> = {
    SUCCESS: { label: 'Received', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    FAILED: { label: 'Failed', cls: 'bg-red-50 text-red-700 border-red-200' },
    REFUNDED: { label: 'Refunded', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    PENDING: { label: 'Pending', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  };
  const s = map[row.status] || map.PENDING;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>{s.label}</span>;
};

const Tile: React.FC<{ label: string; value: string; help?: string }> = ({ label, value, help }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    {help && <p className="text-xs text-gray-400 mt-1">{help}</p>}
  </div>
);

const PlanPayments: React.FC = () => {
  const [status, setStatus] = useState<Status | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PlanPaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await admin.getPlanPayments({
          status: status || undefined,
          q: q || undefined,
          from: from || undefined,
          to: to || undefined,
          page,
          limit: PAGE_SIZE,
        });
        setData(res.data.data);
      } catch (err: any) {
        if (!silent) toast.error(err?.response?.data?.message || 'Could not load plan payments');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [status, q, from, to, page]
  );

  useEffect(() => {
    load();
  }, [load]);

  // New payments arrive through the Razorpay webhook; pick them up quietly.
  useEffect(() => {
    const t = setInterval(() => load(true), AUTO_REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  const onSearch = (value: string) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      setQ(value.trim());
    }, 400);
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan payments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Every plan payment through Razorpay: money received, refunds, and failed attempts. Updates every 30 seconds.
          </p>
        </div>
        <button
          onClick={() => load()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Tile
            label="Received"
            value={inr(data.summary.receivedPaise)}
            help={`${data.summary.receivedCount} payment${data.summary.receivedCount === 1 ? '' : 's'}, after refunds`}
          />
          <Tile label="Refunded" value={inr(data.summary.refundedPaise)} />
          <Tile label="Failed attempts" value={String(data.summary.failedCount)} help="Customer tried to pay, Razorpay declined" />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap items-end gap-3">
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          {STATUS_TABS.map((t) => (
            <button
              key={t.label}
              onClick={() => { setStatus(t.value); setPage(1); }}
              className={`px-3 py-2 text-sm ${status === t.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchInput}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Customer, plan, pay_… or order_…"
            aria-label="Search plan payments"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>
        <label className="text-xs text-gray-500">
          From
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className="block mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700" />
        </label>
        <label className="text-xs text-gray-500">
          To
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className="block mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700" />
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading && !data ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : !data || data.rows.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-16">No plan payments match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Razorpay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.rows.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{when(r.paidAt || r.failedAt || r.createdAt)}</td>
                    <td className="px-4 py-3">
                      {r.organization ? (
                        <Link to={`/manage-wabmeta-admin/organizations/${r.organization.id}`} className="font-medium text-gray-900 hover:text-emerald-700">
                          {r.organization.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Deleted organization</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.planName || '—'}
                      {r.billingCycle && <span className="block text-xs text-gray-400 capitalize">{r.billingCycle}</span>}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{inr(r.amountPaise)}</span>
                      {r.refundedPaise > 0 && <span className="block text-xs text-amber-700">−{inr(r.refundedPaise)} refunded</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge row={r} />
                      {r.status === 'FAILED' && r.failureReason && (
                        <span className="block text-xs text-red-700 mt-1 max-w-[240px]">{r.failureReason}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {r.razorpayPaymentId && <span className="block select-all">{r.razorpayPaymentId}</span>}
                      {r.razorpayOrderId && <span className="block select-all text-gray-400">{r.razorpayOrderId}</span>}
                      {r.method && <span className="block font-sans text-gray-400 uppercase">{r.method}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > data.limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span>Page {data.page} of {totalPages} · {data.total} payments</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">Previous</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Failed attempts are recorded from 2 Oct 2026, when the Razorpay webhook was set up. For a payment Razorpay received but this list is missing, use Reconcile on the Revenue page.
      </p>
    </div>
  );
};

export default PlanPayments;
