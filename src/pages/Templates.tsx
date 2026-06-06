// src/pages/Templates.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Image,
  Video,
  Edit,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  LayoutGrid,
  List,
  Loader2,
  Type,
} from 'lucide-react';
import { templates, whatsapp } from '../services/api';
import TemplateCard from '../components/templates/TemplateCard';
import TemplatePreview from '../components/templates/TemplatePreview';
import type { Template, TemplateCategory, TemplateStatus } from '../types/template';

type TemplateTab = 'text' | 'media';

const Templates: React.FC = () => {
  const navigate = useNavigate();

  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateTab, setTemplateTab] = useState<TemplateTab>('text');

  // Helper Functions
  const extractVariablesFromText = (text: string) => {
    const matches = text.match(/\{\{(\d+)\}\}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))];
  };

  const mapHeaderFromBackend = (t: any) => {
    const ht = (t.headerType || 'NONE').toUpperCase();

    if (ht === 'NONE' || ht === null) return { type: 'none' as const };

    if (ht === 'TEXT') {
      return {
        type: 'text' as const,
        text: t.headerContent || ''
      };
    }

    return {
      type: ht.toLowerCase() as any,
      mediaUrl: t.headerContent || undefined,
      mediaId: t.headerMediaId || undefined,
      cloudinaryUrl: t.headerContent || undefined,
      text: undefined
    };
  };

  const mapButtonsFromBackend = (t: any) => {
    const btns = Array.isArray(t.buttons) ? t.buttons : [];
    return btns.map((b: any, index: number) => ({
      id: String(index),
      type: (b.type || '').toLowerCase(),
      text: b.text,
      url: b.url,
      phoneNumber: b.phoneNumber || b.phone_number
    }));
  };

  // Map backend template to frontend Template type
  const mapTemplate = (t: any): Template => ({
    id: t.id,
    name: t.name,
    category: String(t.category || 'UTILITY').toLowerCase() as TemplateCategory,
    language: t.language || 'en',
    status: String(t.status || 'PENDING').toLowerCase() as TemplateStatus,
    header: mapHeaderFromBackend(t),
    body: t.bodyText || '',
    footer: t.footerText || '',
    buttons: mapButtonsFromBackend(t),
    variables:
      Array.isArray(t.variables) && t.variables.length > 0
        ? t.variables.map((v: any) => String(v.index))
        : extractVariablesFromText(t.bodyText || ''),
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
    usageCount: t.usageCount || 0,
    metaTemplateId: t.metaTemplateId || null,
    rejectionReason: t.rejectionReason || undefined
  });

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await templates.getAll({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });

      const templatesData = Array.isArray(response.data?.data) ? response.data.data : [];
      const mappedTemplates = templatesData.map(mapTemplate);
      setTemplateList(mappedTemplates);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Sync templates from Meta
  const handleSyncTemplates = async () => {
    try {
      setSyncing(true);
      setError(null);

      // Find a connected WhatsApp account only when user clicks Sync
      const accountsRes = await whatsapp.accounts();
      const accountsData = accountsRes.data?.data;
      const accounts = accountsData?.accounts || (Array.isArray(accountsData) ? accountsData : []);

      const connected =
        (Array.isArray(accounts) &&
          (accounts.find((a: any) => a.status === 'CONNECTED' && a.isDefault) ||
            accounts.find((a: any) => a.status === 'CONNECTED'))) ||
        null;

      if (!connected) {
        setError('No connected WhatsApp account found. Please connect WhatsApp to sync templates.');
        return;
      }

      await templates.sync(connected.id);
      await fetchTemplates();
    } catch (err: any) {
      console.error('Error syncing templates:', err);
      setError(err.response?.data?.message || 'Failed to sync templates from Meta');
    } finally {
      setSyncing(false);
    }
  };

  // Delete template
  const handleDeleteTemplate = async (id?: string) => {
    const templateId = id || selectedTemplate?.id;
    if (!templateId) return;

    try {
      await templates.delete(templateId);
      setTemplateList(prev => prev.filter(t => t.id !== templateId));
      setShowDeleteModal(false);
      setSelectedTemplate(null);
    } catch (err: any) {
      console.error('Error deleting template:', err);
      alert(err.response?.data?.message || 'Failed to delete template');
    }
  };

  // Duplicate template
  const handleDuplicateTemplate = (template: Template) => {
    navigate('/dashboard/templates/new', {
      state: { duplicateFrom: template },
    });
  };

  // Initial fetch
  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch on filter/search change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTemplates();
    }, 300);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, categoryFilter]);

  // Filter templates (client-side filtering for already fetched data)
  const filteredTemplates = templateList.filter((template) => {
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.body.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || template.status === statusFilter.toLowerCase();
    const matchesCategory = !categoryFilter || template.category === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Split into text vs media templates
  const MEDIA_TYPES = ['image', 'video', 'document'];
  const textTemplates = filteredTemplates.filter(
    (t) => !MEDIA_TYPES.includes((t.header?.type || 'none').toLowerCase())
  );
  const mediaTemplates = filteredTemplates.filter(
    (t) => MEDIA_TYPES.includes((t.header?.type || 'none').toLowerCase())
  );

  // Active tab templates
  const activeTemplates = templateTab === 'media' ? mediaTemplates : textTemplates;

  // Stats
  const stats = [
    {
      label: 'Total Templates',
      value: templateList.length,
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
      hexColor: '#3B82F6'
    },
    {
      label: 'Approved',
      value: templateList.filter(t => t.status === 'approved').length,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
      hexColor: '#10B981'
    },
    {
      label: 'Pending',
      value: templateList.filter(t => t.status === 'pending').length,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
      hexColor: '#F59E0B'
    },
    {
      label: 'Rejected',
      value: templateList.filter(t => t.status === 'rejected').length,
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
      hexColor: '#EF4444'
    },
  ];

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: any; class: string; label: string }> = {
      approved: {
        icon: CheckCircle,
        class: 'bg-green-50 text-green-700 border-green-200',
        label: 'Approved',
      },
      rejected: {
        icon: XCircle,
        class: 'bg-red-50 text-red-700 border-red-200',
        label: 'Rejected',
      },
      pending: {
        icon: Clock,
        class: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        label: 'Pending',
      },
    };

    const badge = badges[status.toLowerCase()] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.class}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  // Get category badge
  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      marketing: 'bg-purple-50 text-purple-700 border-purple-200',
      utility: 'bg-blue-50 text-blue-700 border-blue-200',
      authentication: 'bg-orange-50 text-orange-700 border-orange-200',
    };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[category.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200'
        }`}>
        {category.toUpperCase()}
      </span>
    );
  };

  // Get header type icon
  const getHeaderIcon = (type: string | null) => {
    switch (type?.toUpperCase()) {
      case 'IMAGE':
        return <Image className="w-4 h-4 text-gray-400" />;
      case 'VIDEO':
        return <Video className="w-4 h-4 text-gray-400" />;
      case 'DOCUMENT':
      case 'TEXT':
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Message Templates</h1>
          <p className="text-gray-500 mt-1">
            Create and manage your WhatsApp message templates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncTemplates}
            disabled={syncing || loading}
            className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Sync templates from Meta"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${syncing || loading ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync from Meta'}
          </button>
          <Link
            to="/dashboard/templates/new"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Template
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="relative overflow-hidden rounded-2xl border p-6 group/stat transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ backgroundColor: `${stat.hexColor}0A`, borderColor: `${stat.hexColor}20` }}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover/stat:scale-110 group-hover/stat:opacity-[0.15] transition-all duration-500">
              <stat.icon size={80} className={stat.color.split(' ')[1]} />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <p className={`text-xs font-mono uppercase tracking-widest mb-1 ${stat.color.split(' ')[1]}`}>{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-colors shadow-sm"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-lg transition-colors ${showFilters
              ? 'bg-gray-100 text-gray-900 border-gray-300 font-medium'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {(statusFilter || categoryFilter) && (
              <span className="ml-2 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {[statusFilter, categoryFilter].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border transition-colors ${viewMode === 'grid'
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'bg-white text-gray-400 hover:text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg border transition-colors ${viewMode === 'list'
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'bg-white text-gray-400 hover:text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Status</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utility</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </div>

            {(statusFilter || categoryFilter) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setCategoryFilter('');
                }}
                className="self-end px-3 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTemplateTab('text')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${templateTab === 'text'
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <Type className="w-4 h-4" />
          Text Templates
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${templateTab === 'text'
              ? 'bg-green-700 text-white'
              : 'bg-gray-200 text-gray-600'
            }`}>
            {textTemplates.length}
          </span>
        </button>
        <button
          onClick={() => setTemplateTab('media')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${templateTab === 'media'
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <Image className="w-4 h-4" />
          Media Templates
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${templateTab === 'media'
              ? 'bg-green-700 text-white'
              : 'bg-gray-200 text-gray-600'
            }`}>
            {mediaTemplates.length}
          </span>
        </button>
      </div>

      {/* ── Templates Display ── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading templates...</p>
          </div>
        </div>
      ) : activeTemplates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {templateTab === 'media'
              ? <Image className="w-10 h-10 text-gray-400" />
              : <FileText className="w-10 h-10 text-gray-400" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {templateTab === 'media' ? 'media' : 'text'} templates found
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchQuery || statusFilter || categoryFilter
              ? 'Try adjusting your filters or search query'
              : templateTab === 'media'
                ? 'Create a template with an Image, Video or Document header'
                : 'Create your first text template to get started'}
          </p>
          {!searchQuery && !statusFilter && !categoryFilter && (
            <Link
              to="/dashboard/templates/new"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Template</span>
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {activeTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDelete={() => handleDeleteTemplate(template.id)}
              onDuplicate={() => handleDuplicateTemplate(template)}
              onPreview={() => setPreviewTemplate(template)}
            />
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {activeTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50 transition-all duration-200 group/row">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-200/50 rounded-lg flex items-center justify-center mr-3">
                          {getHeaderIcon(template.header.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{template.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">{template.body}</p>
                          {template.status === 'rejected' && template.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1">Reason: {template.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getCategoryBadge(template.category)}</td>
                    <td className="px-6 py-4">{getStatusBadge(template.status)}</td>
                    <td className="px-6 py-4"><span className="text-gray-600">{template.language}</span></td>
                    <td className="px-6 py-4">
                      <span className="text-gray-550 text-sm">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setPreviewTemplate(template)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Preview">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/dashboard/templates/edit/${template.id}`)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDuplicateTemplate(template)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelectedTemplate(template); setShowDeleteModal(true); }} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={{
            name: previewTemplate.name,
            category: previewTemplate.category,
            language: previewTemplate.language,
            header: previewTemplate.header,
            body: previewTemplate.body,
            footer: previewTemplate.footer || '',
            buttons: previewTemplate.buttons
          }}
          sampleVariables={{}}
          isModal
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 shadow-xl rounded-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
              Delete Template
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to delete "{selectedTemplate.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTemplate(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTemplate()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;