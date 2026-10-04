// src/pages/admin/MyClients.tsx
//
// Home for onboarders and sales: the clients that are theirs, what those
// clients are billed each month, and the money that has really come in.
//
// "Theirs" differs by role. For sales it is the clients they sold, each of
// which they hand to an onboarder from here. For an onboarder it is the
// clients they are onboarding, whoever sold them.

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Loader2, Plus, Search, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import { adminCan } from '../../utils/adminPermissions';

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
  const isSales = adminCan('clients.sell');
  const [summary, setSummary] = useState<any>(null);
  const [clients, setClients] = useState<any[] | null>(null);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);
  const [onboarders, setOnboarders] = useState<{ id: string; name: string }[]>([]);
  const [handing, setHanding] = useState<string | null>(null);

  useEffect(() => {
    if (!isSales) return;
    admin
      .getHandOffOnboarders()
      .then((r) => setOnboarders(r.data.data || []))
      .catch(() => toast.error('Could not load the onboarders to hand clients to'));
  }, [isSales]);

  const handOff = async (c: any, onboarderId: string) => {
    if (!onboarderId || onboarderId === c.onboarder?.id) return;
    setHanding(c.id);
    try {
      const res = await admin.handOffClient(c.id, onboarderId);
      toast.success(`${c.name}: ${res.data.message}`);
      load();
    } catch (err) {
      toast.error(errorText(err, 'Could not hand the client over'));
    } finally {
      setHanding(null);
    }
  };

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
          <p className="text-sm text-gray-500 mt-1">
            {isSales
              ? 'Clients you sold. Hand each one to an onboarder when it is ready to set up. Revenue counts only money actually received.'
              : 'Clients you are onboarding. Revenue counts only money actually received.'}
          </p>
        </div>
        <button onClick={() => setShowNew((v) => !v)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium">
          {showNew ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {showNew ? 'Cancel' : 'New client'}
        </button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Tile
          label={isSales ? 'Clients sold' : 'Clients'}
          value={summary ? String(summary.clients) : '—'}
          help={
            isSales && clients
              ? `${clients.filter((c) => !c.onboarder).length} not handed to an onboarder yet`
              : undefined
          }
        />
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
            <p className="text-xs text-gray-500">
              {isSales
                ? 'The client starts on the free demo plan. Hand it to an onboarder below; they set up the paid plan.'
                : "The client starts on the free demo plan. Assign their paid plan from the client's billing page."}
            </p>
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
              {/* Each side sees the other: sales whom it went to, the onboarder who sold it. */}
              <th className="text-left px-4 py-3">{isSales ? 'Onboarder' : 'Sold by'}</th>
              <th className="text-left px-4 py-3">{isSales ? 'Sold' : 'Onboarded'}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients === null && <tr><td colSpan={7} className="py-10 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>}
            {clients?.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-400">No clients yet. Create your first one.</td></tr>}
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
                <td className="px-4 py-3">
                  {isSales ? (
                    <div className="flex items-center gap-2">
                      <select
                        aria-label={`Onboarder for ${c.name}`}
                        value={c.onboarder?.id || ''}
                        disabled={handing === c.id}
                        onChange={(e) => handOff(c, e.target.value)}
                        className={`px-2 py-1 rounded-lg border text-xs ${c.onboarder ? 'border-gray-200 text-gray-700' : 'border-amber-300 bg-amber-50 text-amber-800'}`}
                      >
                        {/* No "none" once chosen: a client nobody onboards is one nobody finishes setting up. */}
                        {!c.onboarder && <option value="">Hand to onboarder…</option>}
                        {onboarders.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                        {/* Still show an onboarder who has since been switched off. */}
                        {c.onboarder && !onboarders.some((o) => o.id === c.onboarder.id) && (
                          <option value={c.onboarder.id}>{c.onboarder.name}</option>
                        )}
                      </select>
                      {handing === c.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                    </div>
                  ) : (
                    <span className="text-gray-600">{c.soldBy?.name || '—'}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {(() => {
                    const at = isSales ? c.soldAt : c.onboardedAt;
                    return at ? new Date(at).toLocaleDateString('en-IN') : '—';
                  })()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/manage-wabmeta-admin/organizations/${c.id}/billing`} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50">
                    {isSales ? 'View' : 'Billing'}
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
