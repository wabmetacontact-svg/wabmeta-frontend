// src/pages/admin/Organizations.tsx
//
// Every organization, filterable by status, plan and internal tag, with
// actions on a whole selection at once and a CSV export of what is shown.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ChevronLeft, ChevronRight, Download, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import { adminCan } from '../../utils/adminPermissions';
import { downloadBlob } from '../../utils/download';

const PLAN_TYPES = ['', 'FREE_DEMO', 'STARTER', 'GROWTH', 'PRO', 'BUSINESS', 'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'];
const STATUSES = ['', 'ACTIVE', 'READ_ONLY', 'SUSPENDED'];

type BulkKind = 'extend' | 'status' | 'tag_add' | 'tag_remove' | 'logout' | 'notify';

const BULK_OPTIONS: { value: BulkKind; label: string; permission: string }[] = [
  { value: 'tag_add', label: 'Add tag', permission: 'orgs.write' },
  { value: 'tag_remove', label: 'Remove tag', permission: 'orgs.write' },
  { value: 'extend', label: 'Extend subscription', permission: 'billing.write' },
  { value: 'status', label: 'Change status', permission: 'orgs.status' },
  { value: 'notify', label: 'Send notification', permission: 'announcements.write' },
  { value: 'logout', label: 'Sign everyone out', permission: 'sessions.manage' },
];

const statusTone: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  READ_ONLY: 'bg-amber-50 text-amber-700 border-amber-200',
  SUSPENDED: 'bg-red-50 text-red-700 border-red-200',
};

const inputCls =
  'px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900';


const Organizations: React.FC = () => {
  const confirm = useConfirm();
  const [filters, setFilters] = useState({ search: '', status: '', planType: '', tag: '' });
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [bulk, setBulk] = useState<BulkKind>('tag_add');
  const [bulkParams, setBulkParams] = useState({ tag: '', days: '30', status: 'READ_ONLY', reason: '', title: '', message: '' });
  const [running, setRunning] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await admin.listOrganizations({
        page,
        limit: 25,
        search: filters.search || undefined,
        status: filters.status || undefined,
        planType: filters.planType || undefined,
        tag: filters.tag || undefined,
      });
      setRows(res.data.data || []);
      setMeta({ total: res.data.meta?.total ?? 0, totalPages: Math.max(1, res.data.meta?.totalPages ?? 1) });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not load organizations');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    const t = setTimeout(load, filters.search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, filters.search]);

  useEffect(() => {
    admin.getAllTags().then((r) => setTags(r.data.data || [])).catch(() => undefined);
  }, []);

  const setFilter = (key: keyof typeof filters, value: string) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const togglePage = () =>
    setSelected((s) => {
      const next = new Set(s);
      rows.forEach((r) => (allOnPage ? next.delete(r.id) : next.add(r.id)));
      return next;
    });

  const allowedBulk = useMemo(() => BULK_OPTIONS.filter((o) => adminCan(o.permission)), []);

  const runBulk = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    const option = BULK_OPTIONS.find((o) => o.value === bulk)!;

    const ok = await confirm({
      title: `${option.label} for ${ids.length} organization(s)?`,
      message: 'Each organization is handled one by one; you will see how many succeeded.',
      confirmLabel: option.label,
      tone: bulk === 'status' || bulk === 'logout' ? 'danger' : 'default',
    });
    if (!ok) return;

    setRunning(true);
    try {
      const res = await admin.bulkAction({
        organizationIds: ids,
        action: bulk,
        tag: bulkParams.tag || undefined,
        days: bulk === 'extend' ? Number(bulkParams.days) : undefined,
        status: bulk === 'status' ? bulkParams.status : undefined,
        reason: bulkParams.reason || undefined,
        title: bulkParams.title || undefined,
        message: bulkParams.message || undefined,
      });
      const d = res.data.data;
      if (d.failed > 0) {
        toast.error(`${d.succeeded} done, ${d.failed} failed: ${d.results.find((r: any) => !r.ok)?.error || ''}`);
      } else {
        toast.success(res.data.message || 'Done');
      }
      setSelected(new Set());
      load();
      admin.getAllTags().then((r) => setTags(r.data.data || [])).catch(() => undefined);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Bulk action failed');
    } finally {
      setRunning(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await admin.exportCsv('organizations', {
        status: filters.status || undefined,
        planType: filters.planType || undefined,
        tag: filters.tag || undefined,
      });
      downloadBlob(res.data as Blob, `organizations-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-sm text-gray-500 mt-1">{meta.total.toLocaleString('en-IN')} organization(s)</p>
        </div>
        {adminCan('data.export') && (
          <button
            onClick={exportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            aria-label="Search organizations"
            className={`${inputCls} w-full pl-9`}
            placeholder="Name or slug"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
        </div>
        <select aria-label="Status" className={inputCls} value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'Any status'}</option>)}
        </select>
        <select aria-label="Plan" className={inputCls} value={filters.planType} onChange={(e) => setFilter('planType', e.target.value)}>
          {PLAN_TYPES.map((p) => <option key={p} value={p}>{p || 'Any plan'}</option>)}
        </select>
        <select aria-label="Tag" className={inputCls} value={filters.tag} onChange={(e) => setFilter('tag', e.target.value)}>
          <option value="">Any tag</option>
          {tags.map((t) => <option key={t.tag} value={t.tag}>{t.tag} ({t.count})</option>)}
        </select>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && allowedBulk.length > 0 && (
        <div className="sticky top-4 z-10 bg-gray-900 text-white rounded-2xl p-4 flex gap-3 flex-wrap items-center shadow-xl">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <select aria-label="Bulk action" className="px-3 py-2 rounded-xl text-sm text-gray-900" value={bulk} onChange={(e) => setBulk(e.target.value as BulkKind)}>
            {allowedBulk.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {(bulk === 'tag_add' || bulk === 'tag_remove') && (
            <input aria-label="Tag" className="px-3 py-2 rounded-xl text-sm text-gray-900 w-40" placeholder="tag" value={bulkParams.tag} onChange={(e) => setBulkParams((p) => ({ ...p, tag: e.target.value }))} />
          )}
          {bulk === 'extend' && (
            <input aria-label="Days" type="number" min={1} className="px-3 py-2 rounded-xl text-sm text-gray-900 w-24" value={bulkParams.days} onChange={(e) => setBulkParams((p) => ({ ...p, days: e.target.value }))} />
          )}
          {bulk === 'status' && (
            <select aria-label="New status" className="px-3 py-2 rounded-xl text-sm text-gray-900" value={bulkParams.status} onChange={(e) => setBulkParams((p) => ({ ...p, status: e.target.value }))}>
              <option value="ACTIVE">Active</option>
              <option value="READ_ONLY">Read-only</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          )}
          {(bulk === 'status' || bulk === 'extend') && (
            <input aria-label="Reason" className="px-3 py-2 rounded-xl text-sm text-gray-900 flex-1 min-w-[160px]" placeholder="Reason" value={bulkParams.reason} onChange={(e) => setBulkParams((p) => ({ ...p, reason: e.target.value }))} />
          )}
          {bulk === 'notify' && (
            <>
              <input aria-label="Title" className="px-3 py-2 rounded-xl text-sm text-gray-900 w-48" placeholder="Title" value={bulkParams.title} onChange={(e) => setBulkParams((p) => ({ ...p, title: e.target.value }))} />
              <input aria-label="Message" className="px-3 py-2 rounded-xl text-sm text-gray-900 flex-1 min-w-[200px]" placeholder="Message" value={bulkParams.message} onChange={(e) => setBulkParams((p) => ({ ...p, message: e.target.value }))} />
            </>
          )}
          <button onClick={runBulk} disabled={running} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-semibold disabled:opacity-50">
            {running && <Loader2 className="w-4 h-4 animate-spin" />}
            Run
          </button>
          <button onClick={() => setSelected(new Set())} className="text-sm text-gray-300 hover:text-white">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" aria-label="Select page" checked={allOnPage} onChange={togglePage} />
                </th>
                <th className="text-left px-4 py-3">Organization</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Tags</th>
                <th className="text-right px-4 py-3">Members</th>
                <th className="text-right px-4 py-3">Contacts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && rows.length === 0 && (
                <tr><td colSpan={8} className="py-10 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={8} className="py-10 text-center text-gray-400">No organizations match.</td></tr>
              )}
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" aria-label={`Select ${o.name}`} checked={selected.has(o.id)} onChange={() => toggle(o.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/manage-wabmeta-admin/organizations/${o.id}`} className="flex items-center gap-2 font-medium text-gray-900 hover:text-primary-600">
                      <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                      {o.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.owner?.email}</td>
                  <td className="px-4 py-3 text-gray-600">{o.subscription?.plan?.name || o.planType}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${statusTone[o.status] || statusTone.ACTIVE}`}>
                      {o.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(o.adminTags || []).map((t: string) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px]">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{o._count?.members ?? 0}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{(o._count?.contacts ?? 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>{page} / {meta.totalPages}</span>
          <button aria-label="Next page" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Organizations;
