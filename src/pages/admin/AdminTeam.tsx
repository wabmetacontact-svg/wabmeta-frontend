// src/pages/admin/AdminTeam.tsx
//
// Who can use the admin panel, and with which role. Super admins only.
// The server refuses anything that would leave no active super admin, and
// nobody can change their own role or switch themselves off.

import { useEffect, useState } from 'react';
import { KeyRound, Loader2, Lock, Plus, ShieldCheck, Trash2, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import { adminCan, getAdminUser } from '../../utils/adminPermissions';

const ROLES: { value: string; label: string; help: string }[] = [
  { value: 'super_admin', label: 'Super admin', help: 'Everything, including money, plans, settings, admins and "view as user".' },
  { value: 'admin', label: 'Admin', help: 'Day-to-day: users, organizations, status, limits, features, subscriptions, announcements, exports.' },
  { value: 'support', label: 'Support', help: 'Sees everything, refreshes WhatsApp numbers, ends sessions. Changes nothing else.' },
  { value: 'finance', label: 'Finance', help: 'Sees everything; runs subscriptions, wallets (including money), coupons and exports.' },
];

const roleLabel = (r: string) => ROLES.find((x) => x.value === r)?.label || r;
const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900';
const errorText = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || fallback;

const EMPTY = { name: '', email: '', password: '', role: 'support' };

const AdminTeam: React.FC = () => {
  const confirm = useConfirm();
  const me = getAdminUser()?.id;
  const [admins, setAdmins] = useState<any[] | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () =>
    admin
      .getAdmins()
      .then((r) => setAdmins(r.data.data || []))
      .catch((err) => {
        setAdmins([]);
        toast.error(errorText(err, 'Could not load admins'));
      });

  useEffect(() => {
    load();
  }, []);

  if (!adminCan('admins.manage')) {
    return <div className="max-w-3xl mx-auto text-center py-20 text-gray-500">Only a super admin can manage the admin team.</div>;
  }

  const create = async () => {
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) {
      toast.error('Enter a name, an email and a password of at least 8 characters.');
      return;
    }
    setCreating(true);
    try {
      await admin.createAdmin({ ...form, name: form.name.trim(), email: form.email.trim() });
      toast.success(`${form.email} can now sign in as ${roleLabel(form.role)}`);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(errorText(err, 'Could not add admin'));
    } finally {
      setCreating(false);
    }
  };

  const update = async (a: any, data: Record<string, unknown>, success: string) => {
    setBusy(a.id);
    try {
      await admin.updateAdmin(a.id, data);
      toast.success(success);
      load();
    } catch (err) {
      toast.error(errorText(err, 'Could not update'));
    } finally {
      setBusy(null);
    }
  };

  const changeRole = async (a: any, role: string) => {
    const ok = await confirm({
      title: `Make ${a.name} ${roleLabel(role)}?`,
      message: `${ROLES.find((r) => r.value === role)?.help} Takes effect on their next click.`,
      confirmLabel: 'Change role',
      tone: role === 'super_admin' ? 'danger' : 'default',
    });
    if (ok) update(a, { role }, `${a.name} is now ${roleLabel(role)}`);
  };

  const toggleActive = async (a: any) => {
    if (a.isActive) {
      const ok = await confirm({
        title: `Switch off ${a.name}?`,
        message: 'They are signed out of the admin panel at once and cannot sign in until switched on again.',
        confirmLabel: 'Switch off',
        tone: 'danger',
      });
      if (!ok) return;
    }
    update(a, { isActive: !a.isActive }, a.isActive ? `${a.name} switched off` : `${a.name} switched on`);
  };

  const resetPassword = async (a: any) => {
    const password = window.prompt(`New password for ${a.email} (at least 8 characters). Tell them over a safe channel.`);
    if (password === null) return;
    if (password.length < 8) {
      toast.error('At least 8 characters.');
      return;
    }
    update(a, { password }, 'Password changed and any lockout cleared');
  };

  const resetTwoFactor = async (a: any) => {
    const ok = await confirm({
      title: `Reset ${a.name}'s 2FA?`,
      message: 'Use this when they lost their phone. They sign in with just the password until they set 2FA up again.',
      confirmLabel: 'Reset 2FA',
      tone: 'danger',
    });
    if (!ok) return;
    setBusy(a.id);
    try {
      await admin.resetAdminTwoFactor(a.id);
      toast.success('2FA reset');
      load();
    } catch (err) {
      toast.error(errorText(err, 'Could not reset 2FA'));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (a: any) => {
    const ok = await confirm({
      title: `Remove ${a.name}?`,
      message: 'Their admin account is deleted. Switching it off instead keeps their history easier to read.',
      confirmLabel: 'Remove',
      tone: 'danger',
      requireTyped: a.email,
    });
    if (!ok) return;
    setBusy(a.id);
    try {
      await admin.deleteAdmin(a.id);
      toast.success('Admin removed');
      load();
    } catch (err) {
      toast.error(errorText(err, 'Could not remove'));
    } finally {
      setBusy(null);
    }
  };

  const locked = (a: any) => a.lockedUntil && new Date(a.lockedUntil).getTime() > Date.now();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin team</h1>
        <p className="text-sm text-gray-500 mt-1">Who can open this panel, and what each person can do.</p>
      </div>

      {/* Roles */}
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLES.map((r) => (
          <div key={r.value} className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-sm font-semibold text-gray-900">{r.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{r.help}</p>
          </div>
        ))}
      </div>

      {/* Add */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> Add an admin</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <input aria-label="Name" className={inputCls} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input aria-label="Email" type="email" className={inputCls} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input aria-label="Temporary password" type="text" autoComplete="off" className={inputCls} placeholder="Temporary password (8+)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select aria-label="Role" className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
          <p className="text-xs text-gray-500">They sign in at /manage-wabmeta-admin/login. Ask them to turn on 2FA in Settings.</p>
          <button onClick={create} disabled={creating} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add admin
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {admins === null && <div className="p-8 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /></div>}
        {admins?.map((a) => {
          const isMe = a.id === me;
          return (
            <div key={a.id} className={`p-4 flex items-center gap-4 flex-wrap ${a.isActive ? '' : 'opacity-60'}`}>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <UserCog className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900">{a.name}</p>
                  {isMe && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-900 text-white">You</span>}
                  {!a.isActive && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Off</span>}
                  {a.otpEnabled && <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-700"><ShieldCheck className="w-3 h-3" /> 2FA</span>}
                  {locked(a) && <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-700"><Lock className="w-3 h-3" /> Locked</span>}
                </div>
                <p className="text-xs text-gray-500">
                  {a.email} · last sign-in {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString('en-IN') : 'never'}
                </p>
              </div>

              <select
                aria-label={`Role of ${a.name}`}
                value={a.role}
                disabled={isMe || busy === a.id}
                onChange={(e) => changeRole(a, e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white disabled:opacity-60"
                title={isMe ? 'You cannot change your own role' : undefined}
              >
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                {!ROLES.some((r) => r.value === a.role) && <option value={a.role}>{a.role}</option>}
              </select>

              <div className="flex items-center gap-1.5 flex-wrap">
                {locked(a) && (
                  <button onClick={() => update(a, { unlock: true }, 'Unlocked')} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50">
                    Unlock
                  </button>
                )}
                <button onClick={() => resetPassword(a)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50">
                  <KeyRound className="w-3.5 h-3.5" /> Password
                </button>
                {a.otpEnabled && !isMe && (
                  <button onClick={() => resetTwoFactor(a)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50">
                    Reset 2FA
                  </button>
                )}
                {!isMe && (
                  <button onClick={() => toggleActive(a)} disabled={busy === a.id} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    {a.isActive ? 'Switch off' : 'Switch on'}
                  </button>
                )}
                {!isMe && (
                  <button aria-label={`Remove ${a.name}`} onClick={() => remove(a)} disabled={busy === a.id} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTeam;
