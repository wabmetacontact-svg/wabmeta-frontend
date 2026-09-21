// src/pages/admin/AuditSecurity.tsx
//
// Two records in one place: what admins did (audit log) and what happened at
// the door (security events - failed logins, lockouts, org header mismatch).

import { Fragment, useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, ScrollText, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import { adminCan } from '../../utils/adminPermissions';

type Tab = 'audit' | 'security';

const TARGET_TYPES = ['', 'organization', 'user', 'admin', 'plan', 'whatsapp', 'settings'];
const EVENT_TYPES = ['', 'LOGIN_FAILED', 'LOGIN_LOCKED', 'LOGIN_SUCCESS', 'ORG_HEADER_MISMATCH'];

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const statusTone = (code: number) =>
  code >= 400 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200';

const inputCls =
  'px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900';

const AuditSecurity: React.FC = () => {
  const canAudit = adminCan('audit.read');
  const canSecurity = adminCan('security.read');
  const [tab, setTab] = useState<Tab>(canAudit ? 'audit' : 'security');

  const [filters, setFilters] = useState({ targetType: '', targetId: '', action: '', type: '', email: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const common = {
        page,
        limit: 25,
        from: filters.from ? new Date(filters.from).toISOString() : undefined,
        to: filters.to ? new Date(`${filters.to}T23:59:59`).toISOString() : undefined,
      };
      const res =
        tab === 'audit'
          ? await admin.getAuditLogs({
              ...common,
              targetType: filters.targetType || undefined,
              targetId: filters.targetId || undefined,
              action: filters.action || undefined,
            })
          : await admin.getSecurityEvents({
              ...common,
              type: filters.type || undefined,
              email: filters.email || undefined,
            });
      const d = res.data.data;
      setRows(tab === 'audit' ? d.logs : d.events);
      setTotal(d.total);
      setTotalPages(Math.max(1, d.totalPages));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not load records');
    } finally {
      setLoading(false);
    }
  }, [tab, page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key: keyof typeof filters, value: string) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit & Security</h1>
          <p className="text-sm text-gray-500 mt-1">Every admin change, and every suspicious sign-in.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex gap-2">
        {canAudit && (
          <button
            onClick={() => { setTab('audit'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
              tab === 'audit' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            <ScrollText className="w-4 h-4" /> Admin audit log
          </button>
        )}
        {canSecurity && (
          <button
            onClick={() => { setTab('security'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
              tab === 'security' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Security events
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3 flex-wrap items-end">
        {tab === 'audit' ? (
          <>
            <select aria-label="Target type" className={inputCls} value={filters.targetType} onChange={(e) => setFilter('targetType', e.target.value)}>
              {TARGET_TYPES.map((t) => <option key={t} value={t}>{t || 'All targets'}</option>)}
            </select>
            <input aria-label="Target id" className={inputCls} placeholder="Target id" value={filters.targetId} onChange={(e) => setFilter('targetId', e.target.value.trim())} />
            <input aria-label="Action" className={inputCls} placeholder="Action contains… e.g. status" value={filters.action} onChange={(e) => setFilter('action', e.target.value)} />
          </>
        ) : (
          <>
            <select aria-label="Event type" className={inputCls} value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t || 'All events'}</option>)}
            </select>
            <input aria-label="Email" className={inputCls} placeholder="Email contains…" value={filters.email} onChange={(e) => setFilter('email', e.target.value)} />
          </>
        )}
        <label className="text-xs text-gray-500">
          From
          <input type="date" className={`${inputCls} block mt-1`} value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
        </label>
        <label className="text-xs text-gray-500">
          To
          <input type="date" className={`${inputCls} block mt-1`} value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              {tab === 'audit' ? (
                <tr>
                  <th className="text-left px-4 py-3">When</th>
                  <th className="text-left px-4 py-3">Admin</th>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3">Target</th>
                  <th className="text-left px-4 py-3">Result</th>
                </tr>
              ) : (
                <tr>
                  <th className="text-left px-4 py-3">When</th>
                  <th className="text-left px-4 py-3">Event</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">IP</th>
                  <th className="text-left px-4 py-3">Detail</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Nothing recorded for these filters.</td></tr>
              )}
              {tab === 'audit' &&
                rows.map((r) => (
                  <Fragment key={r.id}>
                    <tr onClick={() => setOpen(open === r.id ? null : r.id)} className="hover:bg-gray-50 cursor-pointer align-top">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{when(r.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-900">{r.adminEmail || '—'}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-gray-800">{r.action}</code>
                        {r.reason && <p className="text-xs text-gray-500 mt-1">“{r.reason}”</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {r.targetType || '—'}
                        {r.targetId && <div className="font-mono text-[11px] text-gray-400 break-all">{r.targetId}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${statusTone(r.statusCode)}`}>{r.statusCode}</span>
                      </td>
                    </tr>
                    {open === r.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-4 py-3 text-xs text-gray-600">
                          <div className="mb-1">{r.method} {r.path} · IP {r.ip || '—'}</div>
                          {r.requestBody && (
                            <pre className="whitespace-pre-wrap break-all bg-white border border-gray-200 rounded-lg p-3 text-[11px]">
                              {JSON.stringify(r.requestBody, null, 2)}
                            </pre>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              {tab === 'security' &&
                rows.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{when(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${
                        r.type === 'LOGIN_SUCCESS' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>{r.type}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{r.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{r.ip || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 break-all">
                      {r.detail && Object.keys(r.detail).length ? JSON.stringify(r.detail) : '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <span>{total.toLocaleString('en-IN')} record(s)</span>
          <div className="flex items-center gap-2">
            <button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>{page} / {totalPages}</span>
            <button aria-label="Next page" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditSecurity;
