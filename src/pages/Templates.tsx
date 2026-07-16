// src/pages/Templates.tsx - FIXED
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, RefreshCw, FileText,
  Image, Video, Edit, Trash2, Copy, Eye,
  CheckCircle, XCircle, Clock, AlertCircle,
  LayoutGrid, List, Loader2, Type, CheckCircle2,
} from 'lucide-react';
import { templates as templateApi, whatsapp } from '../services/api';
import TemplateCard from '../components/templates/TemplateCard';
import TemplatePreview from '../components/templates/TemplatePreview';
import type { Template, TemplateCategory, TemplateStatus } from '../types/template';

// ─── Types ───────────────────────────────────────────────────
type TemplateTab = 'text' | 'media';
const MEDIA_TYPES = ['image', 'video', 'document'] as const;

// ─── Helpers ─────────────────────────────────────────────────
const extractVarsFromText = (text: string): string[] =>
  [...new Set((text.match(/\{\{(\d+)\}\}/g) || []).map(m => m.replace(/[{}]/g, '')))];

const mapTemplate = (t: any): Template => {
  const ht = String(t.headerType || 'NONE').toUpperCase();

  let header: Template['header'];
  if (ht === 'NONE') {
    header = { type: 'none' };
  } else if (ht === 'TEXT') {
    header = { type: 'text', text: t.headerContent || '' };
  } else {
    header = {
      type: ht.toLowerCase() as any,
      cloudinaryUrl: t.headerContent || undefined,
      mediaUrl: t.headerContent || undefined,
      fileName: t.headerContent
        ? t.headerContent.split('/').pop()?.split('?')[0]
        : undefined,
    };
  }

  const buttons = (Array.isArray(t.buttons) ? t.buttons : []).map(
    (b: any, i: number) => ({
      id: String(i),
      type: String(b.type || 'QUICK_REPLY').toLowerCase(),
      text: b.text || '',
      url: b.url,
      phoneNumber: b.phoneNumber || b.phone_number,
    })
  );

  return {
    id: t.id,
    name: t.name,
    category: String(t.category || 'UTILITY').toLowerCase() as TemplateCategory,
    language: t.language || 'en',
    status: String(t.status || 'PENDING').toLowerCase() as TemplateStatus,
    header,
    body: t.bodyText || '',
    footer: t.footerText || '',
    buttons,
    variables:
      Array.isArray(t.variables) && t.variables.length > 0
        ? t.variables.map((v: any) => String(v.index))
        : extractVarsFromText(t.bodyText || ''),
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
    usageCount: t.usageCount || 0,
    metaTemplateId: t.metaTemplateId || null,
    rejectionReason: t.rejectionReason || null,
  };
};

// ─── Status Badge ─────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { icon: React.ElementType; cls: string; label: string }> = {
    approved: { icon: CheckCircle, cls: 'bg-green-50 text-green-700 border-green-200', label: 'Approved' },
    rejected: { icon: XCircle, cls: 'bg-red-50 text-red-700 border-red-200', label: 'Rejected' },
    pending: { icon: Clock, cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending' },
    draft: { icon: FileText, cls: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Draft' },
  };
  const b = map[status.toLowerCase()] || map.pending;
  const Icon = b.icon;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                      text-xs font-medium border ${b.cls}`}>
      <Icon className="w-3 h-3 mr-1" />
      {b.label}
    </span>
  );
};

// ─── Category Badge ───────────────────────────────────────────
const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const colors: Record<string, string> = {
    marketing: 'bg-purple-50 text-purple-700 border-purple-200',
    utility: 'bg-blue-50 text-blue-700 border-blue-200',
    authentication: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${colors[category.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {category.toUpperCase()}
    </span>
  );
};

// ─── Header Icon ──────────────────────────────────────────────
const HeaderIcon: React.FC<{ type?: string }> = ({ type }) => {
  if (type === 'image') return <Image className="w-4 h-4 text-gray-400" />;
  if (type === 'video') return <Video className="w-4 h-4 text-gray-400" />;
  if (type === 'document') return <FileText className="w-4 h-4 text-gray-400" />;
  return <FileText className="w-4 h-4 text-gray-400" />;
};

// ─── Component ────────────────────────────────────────────────
const Templates: React.FC = () => {
  const navigate = useNavigate();

  const [list, setList] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [categoryF, setCategoryF] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [tab, setTab] = useState<TemplateTab>('text');

  // ✅ FIX: Track first mount to avoid double fetch
  const isFirstMount = useRef(true);

  // ─── Fetch ─────────────────────────────────────────────────
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await templateApi.getAll({
        search: search || undefined,
        status: statusF || undefined,
        category: categoryF || undefined,
      });

      const raw = Array.isArray(res.data?.data) ? res.data.data : [];
      setList(raw.map(mapTemplate));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [search, statusF, categoryF]);

  // ─── Mount fetch ───────────────────────────────────────────
  useEffect(() => {
    fetchTemplates();
  }, []);

  // ─── Filter change fetch (debounced) ──────────────────────
  // ✅ FIX: Skip first render (mount already fetched)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const t = setTimeout(fetchTemplates, 300);
    return () => clearTimeout(t);
  }, [search, statusF, categoryF]);

  // ─── Sync ──────────────────────────────────────────────────
  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccess(null);

      // Get connected account
      const accRes = await whatsapp.accounts();
      const accounts: any[] = accRes.data?.data?.accounts || [];
      const connected =
        accounts.find(a => a.status === 'CONNECTED' && a.isDefault) ||
        accounts.find(a => a.status === 'CONNECTED');

      if (!connected) {
        setError(
          'No connected WhatsApp account found. ' +
          'Please connect WhatsApp in Settings first.'
        );
        return;
      }

      const res = await templateApi.sync(connected.id);
      const msg = res.data?.message || 'Templates synced successfully';
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 5000);
      await fetchTemplates();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync from Meta');
    } finally {
      setSyncing(false);
    }
  };

  // ─── Delete ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await templateApi.delete(deleteTarget.id);
      setList(prev => prev.filter(t => t.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccess('Template deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete template');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Duplicate ─────────────────────────────────────────────
  const handleDuplicate = (template: Template) => {
    navigate('/dashboard/templates/new', {
      state: { duplicateFrom: template },
    });
  };

  // ─── Filtered lists ────────────────────────────────────────
  // ✅ FIX: Server already filters, client filter nahi karo
  // Sirf tab split karo
  const textTemplates = list.filter(t => !MEDIA_TYPES.includes(t.header?.type as any));
  const mediaTemplates = list.filter(t => MEDIA_TYPES.includes(t.header?.type as any));
  const activeList = tab === 'media' ? mediaTemplates : textTemplates;

  // ─── Stats ─────────────────────────────────────────────────
  const stats = [
    { label: 'Total', value: list.length, icon: FileText, hex: '#3B82F6' },
    { label: 'Approved', value: list.filter(t => t.status === 'approved').length, icon: CheckCircle2, hex: '#10B981' },
    { label: 'Pending', value: list.filter(t => t.status === 'pending').length, icon: Clock, hex: '#F59E0B' },
    { label: 'Rejected', value: list.filter(t => t.status === 'rejected').length, icon: XCircle, hex: '#EF4444' },
  ];

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center
                      sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Message Templates
          </h1>
          <p className="text-gray-500 mt-1">
            Create and manage your WhatsApp message templates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing || loading}
            className="inline-flex items-center px-4 py-2 border border-gray-200
                       rounded-lg text-gray-600 hover:bg-gray-50
                       disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync from Meta'}
          </button>
          <Link
            to="/dashboard/templates/new"
            className="inline-flex items-center px-4 py-2 bg-green-600
                       text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Template
          </Link>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4
                        flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </div>
          <button onClick={() => setSuccess(null)}
            className="text-green-500 hover:text-green-700">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4
                        flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium text-sm">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border p-6
                       transition-all duration-300 hover:-translate-y-0.5
                       hover:shadow-md"
            style={{
              backgroundColor: `${s.hex}0A`,
              borderColor: `${s.hex}20`,
            }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.08]">
              <s.icon size={80} />
            </div>
            <p className="text-xs font-mono uppercase tracking-widest mb-1 text-gray-500">
              {s.label}
            </p>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search & Filters ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2
                               w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border
                         border-gray-200 rounded-xl text-gray-900
                         placeholder:text-gray-400 focus:outline-none
                         focus:border-green-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border
                        rounded-lg transition-colors
                        ${showFilters
                ? 'bg-gray-100 text-gray-900 border-gray-300 font-medium'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {(statusF || categoryF) && (
              <span className="ml-2 w-5 h-5 bg-green-600 text-white
                               text-xs rounded-full flex items-center
                               justify-center font-bold">
                {[statusF, categoryF].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* View mode */}
          <div className="flex items-center gap-2">
            {(['grid', 'list'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-lg border transition-colors
                            ${viewMode === mode
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-white text-gray-400 hover:text-gray-600 border-gray-200'}`}
              >
                {mode === 'grid'
                  ? <LayoutGrid className="w-5 h-5" />
                  : <List className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusF}
                onChange={e => setStatusF(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg
                           bg-white text-gray-900 focus:outline-none
                           focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Status</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryF}
                onChange={e => setCategoryF(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg
                           bg-white text-gray-900 focus:outline-none
                           focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utility</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </div>
            {(statusF || categoryF) && (
              <button
                onClick={() => { setStatusF(''); setCategoryF(''); }}
                className="self-end px-3 py-2 text-sm text-gray-500
                           hover:text-gray-900 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex items-center gap-1 bg-gray-100 border
                      border-gray-200 rounded-xl p-1 w-fit">
        {([
          { id: 'text', label: 'Text Templates', icon: Type, count: textTemplates.length },
          { id: 'media', label: 'Media Templates', icon: Image, count: mediaTemplates.length },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg
                        text-sm font-medium transition-all
                        ${tab === t.id
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold
                              ${tab === t.id
                ? 'bg-green-700 text-white'
                : 'bg-gray-200 text-gray-600'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading templates...</p>
          </div>
        </div>

      ) : activeList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl
                        border border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 border border-gray-100
                          rounded-full flex items-center justify-center mx-auto mb-4">
            {tab === 'media'
              ? <Image className="w-10 h-10 text-gray-400" />
              : <FileText className="w-10 h-10 text-gray-400" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {tab === 'media' ? 'media' : 'text'} templates found
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {search || statusF || categoryF
              ? 'Try adjusting your filters'
              : `Create your first ${tab} template to get started`}
          </p>
          {!search && !statusF && !categoryF && (
            <Link
              to="/dashboard/templates/new"
              className="inline-flex items-center gap-2 px-4 py-2.5
                         bg-green-600 hover:bg-green-700 text-white
                         font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Template
            </Link>
          )}
        </div>

      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {activeList.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onDelete={() => { setDeleteTarget(t); }}
              onDuplicate={() => handleDuplicate(t)}
              onPreview={() => setPreviewTemplate(t)}
            />
          ))}
        </div>

      ) : (
        /* ── List View ── */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Template', 'Category', 'Status', 'Language', 'Created', 'Actions'].map(h => (
                    <th key={h}
                      className={`px-6 py-3 text-xs font-medium text-gray-500
                                    uppercase tracking-wider
                                    ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {activeList.map(t => (
                  <tr key={t.id}
                    className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-200
                                        rounded-lg flex items-center justify-center shrink-0">
                          <HeaderIcon type={t.header?.type} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{t.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                            {t.body}
                          </p>
                          {t.status === 'rejected' && t.rejectionReason && (
                            <p className="text-xs text-red-600 mt-0.5">
                              Reason: {t.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CategoryBadge category={t.category} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-600">{t.language}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewTemplate(t)}
                          className="p-2 text-gray-400 hover:text-gray-700
                                     hover:bg-gray-100 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/dashboard/templates/edit/${t.id}`)
                          }
                          className="p-2 text-gray-400 hover:text-blue-600
                                     hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(t)}
                          className="p-2 text-gray-400 hover:text-green-600
                                     hover:bg-green-50 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          className="p-2 text-gray-400 hover:text-red-600
                                     hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {previewTemplate && (
        <TemplatePreview
          template={{
            name: previewTemplate.name,
            category: previewTemplate.category,
            language: previewTemplate.language,
            header: previewTemplate.header,
            body: previewTemplate.body,
            footer: previewTemplate.footer || '',
            buttons: previewTemplate.buttons,
          }}
          sampleVariables={{}}
          isModal
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center
                        justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center
                            justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
              Delete Template
            </h3>
            <p className="text-center text-gray-600 mb-6 text-sm">
              Are you sure you want to delete{' '}
              <strong>"{deleteTarget.name}"</strong>?
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-200
                           rounded-lg text-gray-700 hover:bg-gray-50
                           transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white
                           rounded-lg hover:bg-red-700 transition-colors
                           disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;