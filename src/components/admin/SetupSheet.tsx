// src/components/admin/SetupSheet.tsx
//
// The onboarder's setup sheet for one client - what used to be a spreadsheet:
// a line per thing set up (plan and login email, Facebook, phone numbers,
// website, onboarding, Udyam), its charge, the IDs, a status, and sometimes a
// password.
//
// Passwords never come with the sheet. A line only says whether it has one;
// the client's onboarder or a super admin asks for it on its own, and every
// such request is in the audit log. Everyone else who can edit the client can
// edit the rest of the sheet but sees no password box at all.

import React, { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';

interface Line {
  /** null for a line that has never been saved. */
  id: string | null;
  label: string;
  /** Rupees as typed; empty is "NIL". */
  charge: string;
  chargeNote: string;
  details: string;
  status: string;
  hasPassword: boolean;
  /** undefined: leave as it is. null: remove. string: set to this. */
  password?: string | null;
  /** A revealed password, shown until hidden or saved. */
  shown?: string;
}

const STATUSES = ['', 'Pending', 'Approved', 'Done', 'Rejected'];
const inputCls = 'w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900';
const errorText = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || fallback;
const inr = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const toLine = (i: any): Line => ({
  id: i.id ?? null,
  label: i.label,
  charge: i.chargePaise === null || i.chargePaise === undefined ? '' : String(i.chargePaise / 100),
  chargeNote: i.chargeNote ?? '',
  details: i.details ?? '',
  status: i.status ?? '',
  hasPassword: !!i.hasPassword,
});

const SetupSheet: React.FC<{ organizationId: string }> = ({ organizationId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canSecrets, setCanSecrets] = useState(false);
  const [businessType, setBusinessType] = useState('');
  const [done, setDone] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [dirty, setDirty] = useState(false);

  const apply = (data: any) => {
    setCanSecrets(!!data.canSeeSecrets);
    setBusinessType(data.businessType ?? '');
    setDone(!!data.done);
    setLines((data.items ?? []).map(toLine));
    setDirty(false);
  };

  const load = useCallback(() => {
    setLoading(true);
    admin
      .getClientSetup(organizationId)
      .then((r) => apply(r.data.data))
      .catch((err) => toast.error(errorText(err, 'Could not load the setup sheet')))
      .finally(() => setLoading(false));
  }, [organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  const edit = (n: number, patch: Partial<Line>) => {
    setLines((ls) => ls.map((l, i) => (i === n ? { ...l, ...patch } : l)));
    setDirty(true);
  };

  const totalPaise = lines.reduce((sum, l) => sum + (l.charge.trim() ? Math.round(Number(l.charge) * 100) || 0 : 0), 0);

  const save = async () => {
    for (const l of lines) {
      if (!l.label.trim()) return toast.error('Every line needs a name.');
      if (l.charge.trim() && !(Number(l.charge) >= 0)) return toast.error(`"${l.label}": enter the charge in rupees.`);
    }
    setSaving(true);
    try {
      const res = await admin.saveClientSetup(organizationId, {
        businessType: businessType.trim() || null,
        done,
        items: lines.map((l) => ({
          id: l.id,
          label: l.label.trim(),
          chargePaise: l.charge.trim() ? Math.round(Number(l.charge) * 100) : null,
          chargeNote: l.chargeNote,
          details: l.details,
          status: l.status,
          // Only sent when it was touched - an untouched line keeps its password.
          ...(l.password !== undefined && { password: l.password }),
        })),
      });
      apply(res.data.data);
      toast.success('Setup sheet saved');
    } catch (err) {
      toast.error(errorText(err, 'Could not save the setup sheet'));
    } finally {
      setSaving(false);
    }
  };

  const reveal = async (n: number) => {
    const l = lines[n]!;
    if (!l.id) return;
    try {
      const res = await admin.revealSetupPassword(organizationId, l.id);
      setLines((ls) => ls.map((x, i) => (i === n ? { ...x, shown: res.data.data.password } : x)));
      // Off the screen again on its own, in case nobody hides it.
      setTimeout(() => setLines((ls) => ls.map((x) => (x.id === l.id ? { ...x, shown: undefined } : x))), 30_000);
    } catch (err) {
      toast.error(errorText(err, 'Could not read the password'));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading the setup sheet…
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-gray-900">Setup sheet</h2>
          <p className="text-xs text-gray-500 mt-1">
            What was set up for this client, what it cost, and the IDs. Charges are a record - revenue is counted from
            recorded payments. Also shown in TeamOS, without passwords.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            aria-label="Business type"
            className={`${inputCls} w-48`}
            placeholder="Business, e.g. Affiliate Marketing"
            value={businessType}
            onChange={(e) => {
              setBusinessType(e.target.value);
              setDirty(true);
            }}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={done}
              onChange={(e) => {
                setDone(e.target.checked);
                setDirty(true);
              }}
            />
            Setup done
          </label>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-2 py-2 w-40">Setup</th>
              <th className="text-left px-2 py-2 w-40">Charges ₹</th>
              <th className="text-left px-2 py-2">IDs</th>
              {canSecrets && <th className="text-left px-2 py-2 w-56">Password</th>}
              <th className="text-left px-2 py-2 w-32">Status</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 align-top">
            {lines.map((l, n) => (
              <tr key={l.id ?? `new-${n}`}>
                <td className="px-2 py-2">
                  <input aria-label="Setup" className={inputCls} value={l.label} onChange={(e) => edit(n, { label: e.target.value })} />
                </td>
                <td className="px-2 py-2 space-y-1">
                  <input aria-label={`${l.label} charge`} inputMode="decimal" className={inputCls} placeholder="NIL" value={l.charge} onChange={(e) => edit(n, { charge: e.target.value.replace(/[^\d.]/g, '') })} />
                  <input aria-label={`${l.label} charge note`} className={`${inputCls} text-xs`} placeholder="e.g. 700+600" value={l.chargeNote} onChange={(e) => edit(n, { chargeNote: e.target.value })} />
                </td>
                <td className="px-2 py-2">
                  <textarea aria-label={`${l.label} IDs`} rows={2} className={inputCls} placeholder="Emails, numbers, IDs" value={l.details} onChange={(e) => edit(n, { details: e.target.value })} />
                </td>
                {canSecrets && (
                  <td className="px-2 py-2">
                    {l.password !== undefined ? (
                      <div className="flex gap-1">
                        <input
                          aria-label={`${l.label} password`}
                          type="password"
                          autoComplete="new-password"
                          className={inputCls}
                          placeholder={l.password === null ? 'Will be removed' : 'Password'}
                          value={l.password ?? ''}
                          disabled={l.password === null}
                          onChange={(e) => edit(n, { password: e.target.value })}
                        />
                        <button type="button" className="px-2 text-xs text-gray-500" onClick={() => edit(n, { password: undefined })}>
                          Undo
                        </button>
                      </div>
                    ) : l.hasPassword ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 min-w-[90px]">
                          {l.shown ?? '••••••••'}
                        </span>
                        {l.shown ? (
                          <button type="button" aria-label="Hide" className="p-1 text-gray-500" onClick={() => edit(n, { shown: undefined })}>
                            <EyeOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button type="button" aria-label="Show" className="p-1 text-gray-500" disabled={!l.id || dirty} title={dirty ? 'Save first' : 'Show'} onClick={() => reveal(n)}>
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button type="button" className="text-xs text-gray-600 underline" onClick={() => edit(n, { password: '', shown: undefined })}>
                          Change
                        </button>
                        <button type="button" className="text-xs text-red-600 underline" onClick={() => edit(n, { password: null, shown: undefined })}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="text-xs text-gray-600 underline" onClick={() => edit(n, { password: '' })}>
                        Add password
                      </button>
                    )}
                  </td>
                )}
                <td className="px-2 py-2">
                  <select aria-label={`${l.label} status`} className={inputCls} value={l.status} onChange={(e) => edit(n, { status: e.target.value })}>
                    {[...new Set([...STATUSES, l.status])].map((s) => (
                      <option key={s} value={s}>
                        {s || '—'}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <button
                    type="button"
                    aria-label={`Remove ${l.label}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setLines((ls) => ls.filter((_, i) => i !== n));
                      setDirty(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200">
              <td className="px-2 py-3 font-semibold text-gray-900">Total</td>
              <td className="px-2 py-3 font-semibold text-gray-900">{inr(totalPaise)}</td>
              <td colSpan={canSecrets ? 4 : 3} />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setLines((ls) => [...ls, { id: null, label: '', charge: '', chargeNote: '', details: '', status: '', hasPassword: false }]);
            setDirty(true);
          }}
        >
          <Plus className="w-4 h-4" /> Add line
        </button>
        <div className="flex items-center gap-3">
          {!canSecrets && <span className="text-xs text-gray-400">Passwords are kept by the client&apos;s onboarder.</span>}
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save sheet
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupSheet;
