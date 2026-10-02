// src/pages/admin/RazorpayPayments.tsx
//
// The Razorpay account's own payment list, read live from Razorpay. Shows
// money that never went through WabMeta's checkout too - QR codes, payment
// links, payment pages - and says for each payment whether WabMeta recorded
// it and for which customer.

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';

type Account = 'plans' | 'wallet';
type Kind = 'plan' | 'wallet' | 'direct';

interface RazorpayRow {
  id: string;
  status: string;
  amountPaise: number;
  refundedPaise: number;
  method: string | null;
  payer: string | null;
  contact: string | null;
  email: string | null;
  description: string | null;
  orderId: string | null;
  errorDescription: string | null;
  createdAt: string;
  kind: Kind;
  /** WabMeta has this payment in its plan or wallet records */
  recorded: boolean;
  /** Money kept from a WabMeta checkout that WabMeta never recorded */
  needsReconcile: boolean;
  organization: { id: string; name: string } | null;
}

interface RazorpayData {
  account: Account;
  accounts: Account[];
  page: number;
  limit: number;
  hasMore: boolean;
  rows: RazorpayRow[];
}

const AUTO_REFRESH_MS = 60_000;

const inr = (paise: number) =>
  `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
  });

// Razorpay's payment states, in words
const STATUS: Record<string, { label: string; cls: string }> = {
  captured: { label: 'Received', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  refunded: { label: 'Refunded', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  failed: { label: 'Failed', cls: 'bg-red-50 text-red-700 border-red-200' },
  authorized: { label: 'Authorized, not captured', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  created: { label: 'Started', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'captured', label: 'Received' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const ACCOUNT_LABEL: Record<Account, string> = { plans: 'Plans account', wallet: 'Wallet account' };

const SourceCell: React.FC<{ row: RazorpayRow }> = ({ row }) => {
  const org = row.organization ? (
    <Link to={`/manage-wabmeta-admin/organizations/${row.organization.id}`} className="block font-medium text-gray-900 hover:text-emerald-700">
      {row.organization.name}
    </Link>
  ) : null;
  if (row.kind === 'direct') {
    return (
      <div>
        <span className="text-xs font-semibold text-violet-700">Direct to Razorpay</span>
        <span className="block text-xs text-gray-400">QR code, payment link or page</span>
      </div>
    );
  }
  return (
    <div>
      <span className={`text-xs font-semibold ${row.kind === 'plan' ? 'text-emerald-700' : 'text-blue-700'}`}>
        {row.kind === 'plan' ? 'Plan' : 'Wallet top-up'}
      </span>
      {org}
      {row.needsReconcile && (
        <Link to="/manage-wabmeta-admin/revenue" className="block text-xs text-amber-700 underline mt-0.5">
          Paid but not recorded in WabMeta → Reconcile
        </Link>
      )}
    </div>
  );
};

const RazorpayPayments: React.FC = () => {
  const [account, setAccount] = useState<Account>('plans');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<RazorpayData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await admin.getRazorpayPayments({
          account,
          from: from || undefined,
          to: to || undefined,
          q: q || undefined,
          page,
        });
        setData(res.data.data);
      } catch (err: any) {
        if (!silent) toast.error(err?.response?.data?.message || 'Could not load Razorpay payments');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [account, from, to, q, page]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Only the newest page changes on its own; keep it current.
  useEffect(() => {
    if (page !== 1 || q) return;
    const t = setInterval(() => load(true), AUTO_REFRESH_MS);
    return () => clearInterval(t);
  }, [load, page, q]);

  const submitSearch = () => {
    const v = searchInput.trim();
    if (v && !/^pay_[A-Za-z0-9]+$/.test(v)) {
      toast.error('Search takes a Razorpay payment id, like pay_QmA81Kx2LwZr3T');
      return;
    }
    setPage(1);
    setQ(v);
  };

  const rows = (data?.rows || []).filter((r) => !status || r.status === status);
  const received = (data?.rows || []).filter((r) => r.status === 'captured' || r.status === 'refunded');
  const receivedPaise = received.reduce((s, r) => s + r.amountPaise - r.refundedPaise, 0);
  const directCount = (data?.rows || []).filter((r) => r.kind === 'direct' && r.status === 'captured').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Razorpay payments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Straight from Razorpay: every payment on the account, including QR codes, payment links and payment pages.
          </p>
        </div>
        <button
          onClick={() => load()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap items-end gap-3">
        {data && data.accounts.length > 1 && (
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {data.accounts.map((a) => (
              <button
                key={a}
                onClick={() => { setAccount(a); setPage(1); }}
                className={`px-3 py-2 text-sm ${account === a ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {ACCOUNT_LABEL[a]}
              </button>
            ))}
          </div>
        )}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          {STATUS_TABS.map((t) => (
            <button
              key={t.label}
              onClick={() => setStatus(t.value)}
              className={`px-3 py-2 text-sm ${status === t.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              if (!e.target.value.trim() && q) { setQ(''); setPage(1); }
            }}
            onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
            placeholder="Find a payment: pay_… then Enter"
            aria-label="Find a Razorpay payment by id"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>
        {/* The two dates wrap together */}
        <div className="flex gap-3">
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
      </div>

      {data && data.rows.length > 0 && (
        <p className="text-sm text-gray-600">
          On this page: <strong>{inr(receivedPaise)}</strong> received in {received.length} payment{received.length === 1 ? '' : 's'}
          {directCount > 0 && <>, of which <strong>{directCount}</strong> came directly (QR, link or page)</>}.
        </p>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading && !data ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-16">No Razorpay payments match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Paid by</th>
                  <th className="px-4 py-3 font-medium">Belongs to</th>
                  <th className="px-4 py-3 font-medium">Razorpay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => {
                  const s = STATUS[r.status] || { label: r.status, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
                  return (
                    <tr key={r.id} className="align-top">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{when(r.createdAt)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{inr(r.amountPaise)}</span>
                        {r.refundedPaise > 0 && <span className="block text-xs text-amber-700">−{inr(r.refundedPaise)} refunded</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>{s.label}</span>
                        {r.status === 'failed' && r.errorDescription && (
                          <span className="block text-xs text-red-700 mt-1 max-w-[220px]">{r.errorDescription}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <span className="block max-w-[200px] truncate" title={r.payer || undefined}>{r.payer || '—'}</span>
                        {r.method && <span className="block text-xs text-gray-400 uppercase">{r.method}</span>}
                        {r.description && <span className="block text-xs text-gray-400 max-w-[220px]">{r.description}</span>}
                      </td>
                      <td className="px-4 py-3"><SourceCell row={r} /></td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        <span className="block select-all">{r.id}</span>
                        {r.orderId && <span className="block select-all text-gray-400">{r.orderId}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && !q && (page > 1 || data.hasMore) && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span>Page {data.page}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">Newer</button>
              <button disabled={!data.hasMore} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">Older</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Read live from Razorpay, 50 payments per page, newest first. The status filter applies to the page shown.
      </p>
    </div>
  );
};

export default RazorpayPayments;
