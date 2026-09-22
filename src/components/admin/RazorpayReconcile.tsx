// src/components/admin/RazorpayReconcile.tsx
//
// Razorpay is the source of truth for money collected online. This matches
// its captured payments against what WabMeta recorded and lets finance record
// one that was missed (a plan payment also activates the customer's plan).

import { useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import { adminCan } from '../../utils/adminPermissions';

const inr = (paise: number) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const when = (unix: number) => new Date(unix * 1000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

const RazorpayReconcile: React.FC = () => {
  const canImport = adminCan('payments.verify');
  const [days, setDays] = useState(7);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    try {
      const res = await admin.reconcileRevenue(days);
      setResult(res.data.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not reach Razorpay');
    } finally {
      setLoading(false);
    }
  };

  const importOne = async (paymentId: string) => {
    setImporting(paymentId);
    try {
      const res = await admin.importRazorpayPayment(paymentId);
      const d = res.data.data;
      toast.success(d.kind === 'plan' ? 'Recorded - and the plan is now active' : 'Recorded - wallet credited');
      run();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not record');
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Match with Razorpay</h3>
          <p className="text-xs text-gray-500 mt-0.5">Every payment Razorpay collected should appear here in WabMeta. Anything missing is shown below.</p>
        </div>
        <div className="flex items-center gap-2">
          <select aria-label="Days" value={days} onChange={(e) => setDays(Number(e.target.value))} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
            {[1, 7, 30, 90].map((d) => <option key={d} value={d}>Last {d} day{d > 1 ? 's' : ''}</option>)}
          </select>
          <button onClick={run} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white text-sm disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Check now
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-3 text-sm">
          <p className="text-gray-600">
            Razorpay collected <strong>{inr(result.collectedPaise)}</strong> in {result.collectedCount} payment(s) in the last {result.days} day(s).
          </p>

          {result.missing.length === 0 && result.amountMismatch.length === 0 && result.refundMismatch.length === 0 ? (
            <p className="flex items-center gap-2 text-green-700"><CheckCircle2 className="w-4 h-4" /> Everything matches. Revenue is complete for this period.</p>
          ) : null}

          {result.missing.length > 0 && (
            <div>
              <p className="font-medium text-red-700 mb-1">Not recorded in WabMeta: {inr(result.missingPaise)} in {result.missing.length} payment(s)</p>
              <ul className="divide-y divide-gray-100 border border-red-100 rounded-xl">
                {result.missing.map((p: any) => (
                  <li key={p.id} className="px-3 py-2 flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs text-gray-700">{p.id}</span>
                    <span className="text-xs text-gray-500">{when(p.created_at)} · {p.method || ''} · {p.email || p.contact || ''}</span>
                    <span className="ml-auto font-semibold text-gray-900">{inr(p.amount - (p.amount_refunded || 0))}</span>
                    {canImport && (
                      <button onClick={() => importOne(p.id)} disabled={importing === p.id} className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs disabled:opacity-50">
                        {importing === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Record it'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.amountMismatch.length > 0 && (
            <div>
              <p className="font-medium text-amber-700 mb-1">Different amount recorded</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {result.amountMismatch.map((m: any) => (
                  <li key={m.payment.id}><span className="font-mono">{m.payment.id}</span>: Razorpay {inr(m.payment.amount)}, WabMeta {inr(m.recordedPaise)}</li>
                ))}
              </ul>
            </div>
          )}

          {result.refundMismatch.length > 0 && (
            <div>
              <p className="font-medium text-amber-700 mb-1">Refund not recorded</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {result.refundMismatch.map((m: any) => (
                  <li key={m.payment.id}>
                    <span className="font-mono">{m.payment.id}</span>: refunded {inr(m.payment.amount_refunded)} on Razorpay, {inr(m.recordedRefundPaise)} in WabMeta
                    {canImport && (
                      <button onClick={() => importOne(m.payment.id)} className="ml-2 underline">fix</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RazorpayReconcile;
