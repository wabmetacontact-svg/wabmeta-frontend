// src/pages/admin/OfflinePayments.tsx
//
// Offline payments recorded by onboarders and admins. Finance or a super
// admin verifies each one against the bank or UPI statement; only then does
// it count as revenue. Whoever recorded a payment cannot verify it.

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import { adminCan } from '../../utils/adminPermissions';

const inr = (paise: number) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const tone: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const OfflinePayments: React.FC = () => {
  const canVerify = adminCan('payments.verify');
  const [status, setStatus] = useState('PENDING');
  const [rows, setRows] = useState<any[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    setRows(null);
    admin
      .getManualPayments(status || undefined)
      .then((r) => setRows(r.data.data || []))
      .catch((err) => {
        setRows([]);
        toast.error(err?.response?.data?.message || 'Could not load payments');
      });
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (p: any, approve: boolean) => {
    let reason: string | undefined;
    if (!approve) {
      const r = window.prompt('Why is this payment rejected? The onboarder sees this.');
      if (!r?.trim()) return;
      reason = r.trim();
    }
    setBusy(p.id);
    try {
      await admin.reviewManualPayment(p.id, { approve, reason });
      toast.success(approve ? 'Verified - now counted as revenue' : 'Rejected');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not update');
    } finally {
      setBusy(null);
    }
  };

  const pendingTotal = (rows || []).filter((r) => r.status === 'PENDING').reduce((s, r) => s + r.amountPaise, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offline payments</h1>
          <p className="text-sm text-gray-500 mt-1">
            UPI, cash and bank payments. Check each against the statement before verifying.
            {status === 'PENDING' && rows ? ` ${inr(pendingTotal)} waiting.` : ''}
          </p>
        </div>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="PENDING">Waiting</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Paid on</th>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Details</th>
              <th className="text-right px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows === null && <tr><td colSpan={6} className="py-10 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>}
            {rows?.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-gray-400">Nothing here.</td></tr>}
            {rows?.map((p) => (
              <tr key={p.id} className="align-top">
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{new Date(p.paidAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <Link to={`/manage-wabmeta-admin/organizations/${p.organizationId}/billing`} className="font-medium text-gray-900 hover:text-primary-600">{p.organizationName}</Link>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {p.method}{p.reference ? ` · ${p.reference}` : ''}
                  {p.description && <div>{p.description}</div>}
                  <div className="text-gray-400">
                    recorded by {p.recordedByEmail || '—'}
                    {p.verifiedByEmail ? ` · ${p.status.toLowerCase()} by ${p.verifiedByEmail}` : ''}
                    {p.rejectReason ? ` · "${p.rejectReason}"` : ''}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{inr(p.amountPaise)}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-md border text-xs ${tone[p.status]}`}>{p.status}</span></td>
                <td className="px-4 py-3">
                  {canVerify && p.status === 'PENDING' && (
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => review(p, true)} disabled={busy === p.id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs disabled:opacity-50">
                        <Check className="w-3.5 h-3.5" /> Verify
                      </button>
                      <button onClick={() => review(p, false)} disabled={busy === p.id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs disabled:opacity-50">
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfflinePayments;
