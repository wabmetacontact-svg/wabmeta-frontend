// src/pages/admin/ClientBilling.tsx
//
// One client's bill and money: plan + add-ons (what they are charged), every
// payment actually received, offline payments waiting for verification, and
// the actions an onboarder or admin takes while selling to them.

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Loader2, Plus, SlidersHorizontal, Trash2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import PageLoader from '../../components/common/PageLoader';
import AssignPlanModal from '../../components/admin/AssignPlanModal';
import { useConfirm } from '../../context/ConfirmContext';
import { adminCan } from '../../utils/adminPermissions';

const inr = (paise: number) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const d = (v?: string | null) => (v ? new Date(v).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—');
const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900';
const errorText = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || fallback;

const statusTone: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  REFUNDED: 'bg-gray-50 text-gray-600 border-gray-200',
};

const Card: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <div className="flex items-center justify-between gap-3 mb-3">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const ClientBilling: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [data, setData] = useState<any>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [planOpen, setPlanOpen] = useState(false);

  const [addOn, setAddOn] = useState({ type: 'EXTRA_SEAT', quantity: '1', price: '', label: '', note: '' });
  const [savingAddOn, setSavingAddOn] = useState(false);
  const [pay, setPay] = useState({ amount: '', method: 'UPI', reference: '', description: '', paidAt: '' });
  const [savingPay, setSavingPay] = useState(false);
  const [viewReason, setViewReason] = useState('');
  const [onboarders, setOnboarders] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!organizationId) return;
    try {
      const res = await admin.getClientBilling(organizationId);
      setData(res.data.data);
    } catch (err) {
      toast.error(errorText(err, 'Could not load billing'));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    load();
    admin.getAddOnCatalog().then((r) => setCatalog(r.data.data || [])).catch(() => undefined);
    if (adminCan('orgs.write')) {
      admin.getAdmins().then((r) => setOnboarders((r.data.data || []).filter((a: any) => a.role === 'onboarder' && a.isActive))).catch(() => undefined);
    }
  }, [load]);

  const item = catalog.find((c) => c.type === addOn.type);

  const saveAddOn = async () => {
    setSavingAddOn(true);
    try {
      await admin.addClientAddOn(organizationId!, {
        type: addOn.type,
        quantity: Number(addOn.quantity) || 1,
        unitPricePaise: addOn.price === '' ? undefined : Math.round(Number(addOn.price) * 100),
        label: addOn.label || undefined,
        note: addOn.note || undefined,
      });
      toast.success('Add-on added. The limit is raised now.');
      setAddOn({ type: addOn.type, quantity: '1', price: '', label: '', note: '' });
      load();
    } catch (err) {
      toast.error(errorText(err, 'Could not add'));
    } finally {
      setSavingAddOn(false);
    }
  };

  const removeAddOn = async (a: any) => {
    const ok = await confirm({
      title: `Remove "${a.label}"?`,
      message: 'The extra capacity is taken away now. The line stays in the bill history.',
      confirmLabel: 'Remove',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await admin.removeClientAddOn(organizationId!, a.id);
      toast.success('Add-on removed');
      load();
    } catch (err) {
      toast.error(errorText(err, 'Could not remove'));
    }
  };

  const savePayment = async () => {
    const amount = Number(pay.amount);
    if (!amount || amount < 1) {
      toast.error('Enter the amount received.');
      return;
    }
    setSavingPay(true);
    try {
      await admin.recordManualPayment(organizationId!, {
        amountPaise: Math.round(amount * 100),
        method: pay.method,
        reference: pay.reference || undefined,
        description: pay.description || undefined,
        paidAt: pay.paidAt ? new Date(`${pay.paidAt}T12:00:00`).toISOString() : undefined,
      });
      toast.success('Recorded. It counts as revenue once finance verifies it.');
      setPay({ amount: '', method: 'UPI', reference: '', description: '', paidAt: '' });
      load();
    } catch (err) {
      toast.error(errorText(err, 'Could not record the payment'));
    } finally {
      setSavingPay(false);
    }
  };

  const viewAsClient = async () => {
    if (viewReason.trim().length < 3) {
      toast.error('Write a short reason. It is recorded.');
      return;
    }
    const owner = data.organization.owner;
    const tab = window.open('about:blank', '_blank');
    try {
      const res = await admin.impersonateUser(owner.id, { organizationId: organizationId!, reason: viewReason.trim() });
      const v = res.data.data;
      const params = new URLSearchParams({
        token: v.accessToken,
        name: [owner.firstName, owner.lastName].filter(Boolean).join(' '),
        email: owner.email,
        org: data.organization.name,
        expiresAt: v.expiresAt,
        returnTo: `/manage-wabmeta-admin/organizations/${organizationId}/billing`,
      });
      const url = `/impersonate#${params.toString()}`;
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        window.location.href = url;
      }
      setViewReason('');
    } catch (err) {
      tab?.close();
      toast.error(errorText(err, 'Could not open the view'));
    }
  };

  const changeOnboarder = async (onboarderId: string) => {
    try {
      await admin.assignOnboarder(organizationId!, onboarderId || null);
      toast.success('Onboarder updated');
      load();
    } catch (err) {
      toast.error(errorText(err, 'Could not change onboarder'));
    }
  };

  if (loading) return <PageLoader />;
  if (!data) return <div className="text-center py-20 text-gray-500">Client not found.</div>;

  const { organization: org, plan, bill, revenue, addOns, payments } = data;
  const allPayments = [
    ...payments.razorpay.map((p: any) => ({
      id: p.id, when: p.paidAt || p.createdAt, what: `${p.planName || 'Plan'} · Razorpay`,
      amount: p.amount - (p.refundedAmount || 0), status: p.status === 'REFUNDED' ? 'REFUNDED' : 'VERIFIED', ref: p.razorpayPaymentId,
      note: p.refundedAmount ? `₹${(p.refundedAmount / 100).toLocaleString('en-IN')} refunded` : '',
    })),
    ...payments.walletTopups.map((t: any) => ({ id: t.id, when: t.createdAt, what: 'Wallet top-up · Razorpay', amount: t.amountPaise, status: 'VERIFIED', ref: t.razorpayPaymentId })),
    ...payments.manual.map((m: any) => ({
      id: m.id, when: m.paidAt, what: `${m.description || 'Offline payment'} · ${m.method}`, amount: m.amountPaise, status: m.status,
      ref: m.reference, note: m.status === 'REJECTED' ? m.rejectReason : m.recordedByEmail ? `by ${m.recordedByEmail}` : '',
    })),
  ].sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <h1 className="text-xl font-bold text-gray-900">{org.name}</h1>
          <p className="text-xs text-gray-500 mt-1">
            Owner {org.owner?.email}{org.owner?.phone ? ` · ${org.owner.phone}` : ''} · client since {d(org.createdAt)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Onboarder: {data.onboarder ? `${data.onboarder.name} (${data.onboarder.email})` : 'none'}
            {adminCan('orgs.write') && (
              <select
                aria-label="Onboarder"
                value={org.onboardedById || ''}
                onChange={(e) => changeOnboarder(e.target.value)}
                className="ml-2 px-2 py-0.5 rounded-lg border border-gray-200 text-xs"
              >
                <option value="">— none —</option>
                {onboarders.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setPlanOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white text-sm">
            <Wallet className="w-4 h-4" /> Assign plan
          </button>
          <Link to={`/manage-wabmeta-admin/organizations/${org.id}/features`} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
            <SlidersHorizontal className="w-4 h-4" /> Features
          </Link>
          <Link to={`/manage-wabmeta-admin/organizations/${org.id}`} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
            Overview & notes
          </Link>
        </div>
      </div>

      {/* Totals */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Billed per month</p>
          <p className="text-xl font-bold text-gray-900">{inr(bill.monthlyTotalPaise)}</p>
          <p className="text-xs text-gray-400">plan {inr(bill.planMonthlyPaise)} + add-ons {inr(bill.monthlyAddOnsPaise)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">One-time charges</p>
          <p className="text-xl font-bold text-gray-900">{inr(bill.oneTimeAddOnsPaise)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Received (real revenue)</p>
          <p className="text-xl font-bold text-green-700">{inr(revenue.totalPaise)}</p>
          <p className="text-xs text-gray-400">this month {inr(revenue.thisMonthPaise)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Waiting for verification</p>
          <p className="text-xl font-bold text-amber-600">{inr(revenue.offlinePendingPaise)}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Plan + add-ons */}
        <Card title="What they bought">
          <div className="rounded-xl bg-gray-50 p-3 mb-3 text-sm">
            <p className="font-medium text-gray-900">{plan ? `${plan.name} plan` : 'No plan'}</p>
            {plan && (
              <p className="text-xs text-gray-500">
                {plan.billingCycle} · {plan.status} · {d(plan.periodStart)} to {d(plan.periodEnd)} · {inr(plan.monthlyPaise)}/month
              </p>
            )}
          </div>
          {addOns.length === 0 ? (
            <p className="text-sm text-gray-500">No add-ons.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {addOns.map((a: any) => (
                <li key={a.id} className={`py-2 flex items-center gap-3 ${a.active ? '' : 'opacity-50'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900">{a.label} × {a.quantity}</p>
                    <p className="text-xs text-gray-500">
                      {inr(a.unitPricePaise)} each · {a.billing === 'MONTHLY' ? 'monthly' : 'one-time'} · from {d(a.startsAt)}
                      {a.endsAt ? ` to ${d(a.endsAt)}` : ''}{a.removedAt ? ` · removed ${d(a.removedAt)}` : ''}
                      {a.createdByEmail ? ` · by ${a.createdByEmail}` : ''}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900">{inr(a.linePaise)}</span>
                  {a.active && !a.removedAt && (
                    <button aria-label={`Remove ${a.label}`} onClick={() => removeAddOn(a)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <p className="text-xs font-semibold text-gray-700">Add an add-on</p>
            <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
              <select aria-label="Add-on" className={`${inputCls} col-span-2`} value={addOn.type} onChange={(e) => setAddOn({ ...addOn, type: e.target.value, price: '' })}>
                {catalog.map((c) => <option key={c.type} value={c.type}>{c.label}</option>)}
              </select>
              <input aria-label="Quantity" inputMode="numeric" className={inputCls} placeholder="Qty" value={addOn.quantity} onChange={(e) => setAddOn({ ...addOn, quantity: e.target.value.replace(/\D/g, '') })} />
              <input aria-label="Price in rupees" inputMode="decimal" className={inputCls} placeholder={item ? `₹${item.defaultPricePaise / 100}` : '₹'} value={addOn.price} onChange={(e) => setAddOn({ ...addOn, price: e.target.value.replace(/[^\d.]/g, '') })} />
            </div>
            {addOn.type === 'CUSTOM' && (
              <input aria-label="What is it" className={inputCls} placeholder="What is it? e.g. Setup and training" value={addOn.label} onChange={(e) => setAddOn({ ...addOn, label: e.target.value })} />
            )}
            <div className="flex gap-2">
              <input aria-label="Note" className={inputCls} placeholder="Note (optional)" value={addOn.note} onChange={(e) => setAddOn({ ...addOn, note: e.target.value })} />
              <button onClick={saveAddOn} disabled={savingAddOn} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm whitespace-nowrap disabled:opacity-50">
                {savingAddOn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
              </button>
            </div>
            {item && <p className="text-xs text-gray-400">{item.billing === 'MONTHLY' ? 'Billed monthly' : 'One-time'}{item.limitKey ? ' · raises the client\'s limit while active' : ' · bill line only'}</p>}
          </div>
        </Card>

        {/* Record a payment */}
        <Card title="Record a payment received offline">
          <div className="grid gap-2 grid-cols-2">
            <input aria-label="Amount in rupees" inputMode="decimal" className={inputCls} placeholder="Amount ₹" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value.replace(/[^\d.]/g, '') })} />
            <select aria-label="Method" className={inputCls} value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
              {['UPI', 'CASH', 'BANK', 'CHEQUE', 'OTHER'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input aria-label="Reference" className={inputCls} placeholder="UTR / reference" value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} />
            <input aria-label="Paid on" type="date" className={inputCls} value={pay.paidAt} onChange={(e) => setPay({ ...pay, paidAt: e.target.value })} />
            <input aria-label="For" className={`${inputCls} col-span-2`} placeholder="For what, e.g. Starter plan + 2 seats, Sept" value={pay.description} onChange={(e) => setPay({ ...pay, description: e.target.value })} />
          </div>
          <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
            <p className="text-xs text-gray-500">Counts as revenue after finance verifies it.</p>
            <button onClick={savePayment} disabled={savingPay} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm disabled:opacity-50">
              {savingPay && <Loader2 className="w-4 h-4 animate-spin" />} Record payment
            </button>
          </div>

          {(adminCan('impersonate') || adminCan('clients.own')) && org.owner && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-700 mb-2">See the client's account (read-only, 30 minutes)</p>
              <div className="flex gap-2">
                <input aria-label="Reason for viewing" className={inputCls} placeholder="Reason, e.g. helping set up templates" value={viewReason} onChange={(e) => setViewReason(e.target.value)} />
                <button onClick={viewAsClient} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500 text-amber-950 text-sm whitespace-nowrap">
                  <Eye className="w-4 h-4" /> View
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Payments */}
      <Card title="All payments">
        {allPayments.length === 0 ? (
          <p className="text-sm text-gray-500">No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {allPayments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 text-gray-500 whitespace-nowrap">{d(p.when)}</td>
                  <td className="py-2 text-gray-700">
                    {p.what}
                    {p.ref && <span className="text-xs text-gray-400"> · {p.ref}</span>}
                    {p.note && <span className="block text-xs text-gray-400">{p.note}</span>}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-md border text-xs ${statusTone[p.status] || statusTone.VERIFIED}`}>{p.status}</span>
                  </td>
                  <td className="py-2 text-right font-medium text-gray-900">{inr(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <AssignPlanModal isOpen={planOpen} onClose={() => setPlanOpen(false)} onSuccess={() => { setPlanOpen(false); load(); }} organization={{ id: org.id, name: org.name, owner: org.owner }} />
    </div>
  );
};

export default ClientBilling;
