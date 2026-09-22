// src/pages/admin/MyClients.tsx
//
// An onboarder's home: the clients they brought in, what those clients are
// billed each month, and the money that has really come in from them.

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Loader2, Plus, Search, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';

const inr = (paise: number) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900';
const errorText = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || fallback;

const Tile: React.FC<{ label: string; value: string; help?: string }> = ({ label, value, help }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    {help && <p className="text-xs text-gray-400 mt-1">{help}</p>}
  </div>
);

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', password: '', organizationName: '' };

const MyClients: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [clients, setClients] = useState<any[] | null>(null);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    admin.getMyClientsSummary().then((r) => setSummary(r.data.data)).catch(() => undefined);
    admin
      .getMyClients(search || undefined)
      .then((r) => setClients(r.data.data || []))
      .catch((err) => {
        setClients([]);
        toast.error(errorText(err, 'Could not load your clients'));
      });
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const create = async () => {
    if (!form.firstName.trim() || !form.email.trim() || !form.organizationName.trim() || form.password.length < 8) {
      toast.error('Fill in name, email, business name and a password of at least 8 characters.');
      return;
    }
    setCreating(true);
    try {
      const res = await admin.createClient({
        ...form,
        lastName: form.lastName || undefined,
        phone: form.phone || undefined,
      });
      toast.success(`${res.data.data.organization.name} created. Give ${form.email} their password.`);
      setForm(EMPTY);
      setShowNew(false);
      load();
    } catch (err) {
      toast.error(errorText(err, 'Could not create the client'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My clients</h1>
          <p className="text-sm text-gray-500 mt-1">Clients you onboarded. Revenue counts only money actually received.</p>
        </div>
        <button onClick={() => setShowNew((v) => !v)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium">
          {showNew ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {showNew ? 'Cancel' : 'New client'}
        </button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Tile label="Clients" value={summary ? String(summary.clients) : '—'} />
        <Tile label="Billed per month" value={summary ? inr(summary.monthlyBilledPaise) : '—'} help="Active plans + monthly add-ons" />
        <Tile label="Received this month" value={summary ? inr(summary.revenueThisMonthPaise) : '—'} help="Razorpay + wallet + verified offline" />
        <Tile label="Received in total" value={summary ? inr(summary.revenueTotalPaise) : '—'} help={summary?.pendingPaise ? `${inr(summary.pendingPaise)} waiting for verification` : undefined} />
      </div>

      {showNew && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Plus className="w-4 h-4" /> New client</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <input aria-label="Business name" className={inputCls} placeholder="Business name" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} />
            <input aria-label="Owner first name" className={inputCls} placeholder="Owner first name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <input aria-label="Owner last name" className={inputCls} placeholder="Last name (optional)" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <input aria-label="Owner email" type="email" className={inputCls} placeholder="Owner email (their login)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input aria-label="Owner phone" className={inputCls} placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input aria-label="Temporary password" type="text" autoComplete="off" className={inputCls} placeholder="Temporary password (8+)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-500">The client starts on the free demo plan. Assign their paid plan from the client's billing page.</p>
            <button onClick={create} disabled={creating} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50">
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create client
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input aria-label="Search clients" className={`${inputCls} pl-9`} placeholder="Search by business name" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Owner</th>
              <th className="text-left px-4 py-3">Plan</th>
              <th className="text-left px-4 py-3">Plan ends</th>
              <th className="text-left px-4 py-3">Onboarded</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients === null && <tr><td colSpan={6} className="py-10 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>}
            {clients?.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-gray-400">No clients yet. Create your first one.</td></tr>}
            {clients?.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link to={`/manage-wabmeta-admin/organizations/${c.id}/billing`} className="flex items-center gap-2 font-medium text-gray-900 hover:text-primary-600">
                    <Building2 className="w-4 h-4 text-gray-400" /> {c.name}
                  </Link>
                  {c.status !== 'ACTIVE' && <span className="text-xs text-red-600">{c.status}</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{c.owner?.email}{c.owner?.phone ? ` · ${c.owner.phone}` : ''}</td>
                <td className="px-4 py-3 text-gray-600">{c.subscription?.plan?.name || c.planType}</td>
                <td className="px-4 py-3 text-gray-600">{c.subscription?.currentPeriodEnd ? new Date(c.subscription.currentPeriodEnd).toLocaleDateString('en-IN') : '—'}</td>
                <td className="px-4 py-3 text-gray-500">{c.onboardedAt ? new Date(c.onboardedAt).toLocaleDateString('en-IN') : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/manage-wabmeta-admin/organizations/${c.id}/billing`} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50">
                    Billing
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyClients;
