// src/pages/admin/Announcements.tsx
//
// Publish a banner to customers - everyone, some plans, or chosen
// organizations - optionally with an in-app notification to every member.

import { useEffect, useState } from 'react';
import { Loader2, Megaphone, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import { adminCan } from '../../utils/adminPermissions';

const PLAN_TYPES = ['FREE_DEMO', 'STARTER', 'GROWTH', 'PRO', 'BUSINESS', 'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'];
const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900';

const EMPTY = {
  title: '',
  message: '',
  level: 'INFO',
  audience: 'ALL',
  planTypes: [] as string[],
  organizationIds: '',
  startsAt: '',
  endsAt: '',
  notify: false,
};

const toIso = (local: string) => (local ? new Date(local).toISOString() : null);

const isLive = (a: any) => {
  const now = Date.now();
  return a.isActive && new Date(a.startsAt).getTime() <= now && (!a.endsAt || new Date(a.endsAt).getTime() > now);
};

const Announcements: React.FC = () => {
  const confirm = useConfirm();
  const canWrite = adminCan('announcements.write');
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () =>
    admin.listAnnouncements().then((r) => setList(r.data.data || [])).catch(() => toast.error('Could not load announcements'));

  useEffect(() => {
    load();
  }, []);

  const publish = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Write a title and a message.');
      return;
    }
    const orgIds = form.organizationIds.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);

    if (form.notify) {
      const ok = await confirm({
        title: 'Send an in-app notification too?',
        message: 'Every member of every targeted organization gets a notification. This cannot be unsent.',
        confirmLabel: 'Publish and notify',
      });
      if (!ok) return;
    }

    setSaving(true);
    try {
      const res = await admin.createAnnouncement({
        title: form.title.trim(),
        message: form.message.trim(),
        level: form.level,
        audience: form.audience,
        planTypes: form.audience === 'PLANS' ? form.planTypes : undefined,
        organizationIds: form.audience === 'ORGS' ? orgIds : undefined,
        startsAt: toIso(form.startsAt),
        endsAt: toIso(form.endsAt),
        notify: form.notify,
      });
      toast.success(res.data.message || 'Published');
      setForm(EMPTY);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || 'Could not publish');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (a: any) => {
    await admin.updateAnnouncement(a.id, { isActive: !a.isActive }).catch(() => toast.error('Could not update'));
    load();
  };

  const remove = async (a: any) => {
    const ok = await confirm({ title: `Delete "${a.title}"?`, message: 'It disappears from every customer\'s app.', tone: 'danger', confirmLabel: 'Delete' });
    if (!ok) return;
    await admin.deleteAnnouncement(a.id).catch(() => toast.error('Could not delete'));
    load();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-sm text-gray-500 mt-1">A banner at the top of the customer dashboard. Critical ones cannot be dismissed.</p>
      </div>

      {canWrite && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input aria-label="Title" className={inputCls} placeholder="Title" maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="flex gap-2">
              <select aria-label="Level" className={inputCls} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <select aria-label="Audience" className={inputCls} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="ALL">Everyone</option>
                <option value="PLANS">Some plans</option>
                <option value="ORGS">Chosen organizations</option>
              </select>
            </div>
          </div>
          <textarea aria-label="Message" className={inputCls} rows={3} maxLength={2000} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />

          {form.audience === 'PLANS' && (
            <div className="flex flex-wrap gap-2">
              {PLAN_TYPES.map((p) => (
                <label key={p} className="flex items-center gap-1.5 text-xs text-gray-700 px-2 py-1 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    checked={form.planTypes.includes(p)}
                    onChange={() =>
                      setForm({ ...form, planTypes: form.planTypes.includes(p) ? form.planTypes.filter((x) => x !== p) : [...form.planTypes, p] })
                    }
                  />
                  {p}
                </label>
              ))}
            </div>
          )}
          {form.audience === 'ORGS' && (
            <textarea aria-label="Organization ids" className={inputCls} rows={2} placeholder="Organization ids, separated by commas or new lines" value={form.organizationIds} onChange={(e) => setForm({ ...form, organizationIds: e.target.value })} />
          )}

          <div className="flex gap-4 flex-wrap items-end">
            <label className="text-xs text-gray-500">
              Starts (empty = now)
              <input type="datetime-local" className={`${inputCls} mt-1`} value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </label>
            <label className="text-xs text-gray-500">
              Ends (empty = until switched off)
              <input type="datetime-local" className={`${inputCls} mt-1`} value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 pb-2">
              <input type="checkbox" checked={form.notify} onChange={(e) => setForm({ ...form, notify: e.target.checked })} />
              Also send an in-app notification
            </label>
            <button onClick={publish} disabled={saving} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              Publish
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {list.length === 0 && <p className="p-6 text-sm text-gray-400 text-center">No announcements yet.</p>}
        {list.map((a) => (
          <div key={a.id} className="p-4 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-gray-900">{a.title}</p>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{a.level}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${isLive(a) ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isLive(a) ? 'Live' : a.isActive ? 'Scheduled / ended' : 'Off'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{a.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {a.audience === 'ALL' ? 'Everyone' : a.audience === 'PLANS' ? `Plans: ${a.planTypes.join(', ')}` : `${a.organizationIds.length} organization(s)`}
                {' · '}from {new Date(a.startsAt).toLocaleString('en-IN')}
                {a.endsAt ? ` to ${new Date(a.endsAt).toLocaleString('en-IN')}` : ''}
                {a.notifiedAt ? ' · notified' : ''} · by {a.createdBy}
              </p>
            </div>
            {canWrite && (
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(a)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50">
                  {a.isActive ? 'Switch off' : 'Switch on'}
                </button>
                <button aria-label="Delete" onClick={() => remove(a)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
