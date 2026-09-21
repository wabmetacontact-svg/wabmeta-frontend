// src/pages/admin/Revenue.tsx
//
// Money that came in (plan payments and wallet top-ups, by month in India
// time) and the recurring run rate implied by what active customers last
// paid.

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';

const inr = (paise: number) =>
  `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

const Tile: React.FC<{ label: string; value: string; help?: string }> = ({ label, value, help }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    {help && <p className="text-xs text-gray-400 mt-1">{help}</p>}
  </div>
);

const Revenue: React.FC = () => {
  const [months, setMonths] = useState(6);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    admin
      .getRevenue(months)
      .then((res) => setData(res.data.data))
      .catch((err) => toast.error(err?.response?.data?.message || 'Could not load revenue'))
      .finally(() => setLoading(false));
  }, [months]);

  // One row per month, plans and top-ups side by side.
  const rows = (() => {
    if (!data) return [];
    const map = new Map<string, { plans: number; payments: number; customers: number; topups: number; topupCount: number }>();
    for (const m of data.months) map.set(m.month, { plans: m.paise, payments: m.payments, customers: m.customers, topups: 0, topupCount: 0 });
    for (const w of data.walletTopups) {
      const row = map.get(w.month) || { plans: 0, payments: 0, customers: 0, topups: 0, topupCount: 0 };
      row.topups = w.paise;
      row.topupCount = w.topups;
      map.set(w.month, row);
    }
    return [...map.entries()].sort(([a], [b]) => (a < b ? 1 : -1));
  })();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
          <p className="text-sm text-gray-500 mt-1">Successful payments only. Months are India time.</p>
        </div>
        <select
          aria-label="Months"
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white"
        >
          {[3, 6, 12, 24].map((m) => <option key={m} value={m}>Last {m} months</option>)}
        </select>
      </div>

      {loading && !data && <div className="py-20 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin inline" /></div>}

      {data && (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Tile label="MRR" value={inr(data.mrrPaise)} help="Last payment of each active customer, per 30 days" />
            <Tile label="ARR" value={inr(data.arrPaise)} help="MRR × 12" />
            <Tile label="Paying customers" value={String(data.payingCustomers)} help={`${data.complimentaryCustomers} on a plan without a payment`} />
            <Tile label="Plans ended, 30 days" value={String(data.endedLast30Days)} help={`Coupons: ${data.couponsLast30Days.redemptions} used, ${inr(data.couponsLast30Days.discountPaise)} off`} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Month</th>
                  <th className="text-right px-4 py-3">Plan payments</th>
                  <th className="text-right px-4 py-3">Payers</th>
                  <th className="text-right px-4 py-3">Wallet top-ups</th>
                  <th className="text-right px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No payments in this period.</td></tr>
                )}
                {rows.map(([month, r]) => (
                  <tr key={month}>
                    <td className="px-4 py-3 text-gray-900">{monthLabel(month)}</td>
                    <td className="px-4 py-3 text-right">{inr(r.plans)} <span className="text-xs text-gray-400">({r.payments})</span></td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.customers}</td>
                    <td className="px-4 py-3 text-right">{inr(r.topups)} <span className="text-xs text-gray-400">({r.topupCount})</span></td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{inr(r.plans + r.topups)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">MRR by plan</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {Object.entries(data.byPlan).map(([plan, v]: [string, any]) => (
                  <tr key={plan}>
                    <td className="py-2 text-gray-700">{plan}</td>
                    <td className="py-2 text-right text-gray-500">{v.customers} customer(s)</td>
                    <td className="py-2 text-right font-medium text-gray-900">{inr(v.mrrPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Revenue;
