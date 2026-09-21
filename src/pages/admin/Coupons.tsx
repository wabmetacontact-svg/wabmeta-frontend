// src/pages/admin/Coupons.tsx
//
// Discount codes for plan checkout. A code's type and value cannot change
// once created, because orders already made carry them.

import { useEffect, useState } from 'react';
import { Loader2, Plus, Ticket, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import { adminCan } from '../../utils/adminPermissions';

const PLAN_TYPES = ['STARTER', 'GROWTH', 'PRO', 'BUSINESS', 'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'];
const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900';

const EMPTY = {
  code: '',
  description: '',
  discountType: 'PERCENT',
  value: '',
  maxRedemptions: '',
  onePerOrg: true,
  planTypes: [] as string[],
  validUntil: '',
};

const describe = (c: any) =>
  c.discountType === 'PERCENT' ? `${c.value}% off` : `₹${(c.value / 100).toLocaleString('en-IN')} off`;

const Coupons: React.FC = () => {
  const confirm = useConfirm();
  const canWrite = adminCan('coupons.write');
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => admin.listCoupons().then((r) => setList(r.data.data || [])).catch(() => toast.error('Could not load coupons'));

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const raw = Number(form.value);
    if (!form.code.trim() || !raw) {
      toast.error('Enter a code and a discount.');
      return;
    }
    setSaving(true);
    try {
      await admin.createCoupon({
        code: form.code.trim(),
        description: form.description.trim() || null,
        discountType: form.discountType,
        // The API takes FLAT in paise; the form takes rupees.
        value: form.discountType === 'FLAT' ? Math.round(raw * 100) : Math.round(raw),
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
        onePerOrg: form.onePerOrg,
        planTypes: form.planTypes,
        validUntil: form.validUntil ? new Date(`${form.validUntil}T23:59:59`).toISOString() : null,
      });
      toast.success('Coupon created');
      setForm(EMPTY);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not create coupon');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: any) => {
    await admin.updateCoupon(c.id, { isActive: !c.isActive }).catch(() => toast.error('Could not update'));
    load();
  };

  const remove = async (c: any) => {
    const ok = await confirm({
      title: `Delete ${c.code}?`,
      message: c._count?.redemptions ? 'It has been used, so it will be switched off and kept on record.' : 'It has never been used.',
      tone: 'danger',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      const res = await admin.deleteCoupon(c.id);
      toast.success(res.data.message || 'Done');
    } catch {
      toast.error('Could not delete');
    }
    load();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <p className="text-sm text-gray-500 mt-1">Customers enter these on the Billing page. The discount is applied to the Razorpay order.</p>
      </div>

      {canWrite && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <input aria-label="Code" className={`${inputCls} uppercase`} placeholder="CODE" maxLength={32} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })} />
            <select aria-label="Discount type" className={inputCls} value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
              <option value="PERCENT">Percent off</option>
              <option value="FLAT">Rupees off</option>
            </select>
            <input aria-label="Discount" inputMode="decimal" className={inputCls} placeholder={form.discountType === 'PERCENT' ? '% (1-100)' : '₹ amount'} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value.replace(/[^\d.]/g, '') })} />
            <input aria-label="Max uses" inputMode="numeric" className={inputCls} placeholder="Max uses (empty = no limit)" value={form.maxRedemptions} onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value.replace(/\D/g, '') })} />
          </div>
          <input aria-label="Description" className={inputCls} placeholder="Description (for admins)" maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500">Only for plans (none = all):</span>
            {PLAN_TYPES.map((p) => (
              <label key={p} className="flex items-center gap-1.5 text-xs text-gray-700 px-2 py-1 rounded-lg border border-gray-200">
                <input type="checkbox" checked={form.planTypes.includes(p)} onChange={() => setForm({ ...form, planTypes: form.planTypes.includes(p) ? form.planTypes.filter((x) => x !== p) : [...form.planTypes, p] })} />
                {p}
              </label>
            ))}
          </div>
          <div className="flex gap-4 flex-wrap items-end">
            <label className="text-xs text-gray-500">
              Valid until (empty = no end)
              <input type="date" className={`${inputCls} mt-1`} value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 pb-2">
              <input type="checkbox" checked={form.onePerOrg} onChange={(e) => setForm({ ...form, onePerOrg: e.target.checked })} />
              Once per organization
            </label>
            <button onClick={create} disabled={saving} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create coupon
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Discount</th>
              <th className="text-left px-4 py-3">Plans</th>
              <th className="text-right px-4 py-3">Used</th>
              <th className="text-left px-4 py-3">Valid until</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No coupons yet.</td></tr>
            )}
            {list.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-mono font-medium text-gray-900"><Ticket className="w-4 h-4 text-gray-400" />{c.code}</div>
                  {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
                </td>
                <td className="px-4 py-3 text-gray-700">{describe(c)}{c.onePerOrg ? <span className="text-xs text-gray-400"> · once per org</span> : null}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{c.planTypes.length ? c.planTypes.join(', ') : 'All'}</td>
                <td className="px-4 py-3 text-right text-gray-700">{c.redeemedCount}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ''}</td>
                <td className="px-4 py-3 text-gray-600">{c.validUntil ? new Date(c.validUntil).toLocaleDateString('en-IN') : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-md border ${c.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {c.isActive ? 'Active' : 'Off'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {canWrite && (
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => toggle(c)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50">
                        {c.isActive ? 'Switch off' : 'Switch on'}
                      </button>
                      <button aria-label="Delete" onClick={() => remove(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
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

export default Coupons;
