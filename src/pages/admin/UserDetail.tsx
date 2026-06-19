// src/pages/admin/UserDetail.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  FileText,
  BarChart2,
  Wallet,
  Download,
  Search,
  RefreshCw,
  Loader2,
  Phone,
  Mail,
  Calendar,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Zap,
  Bot,
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock,
  IndianRupee,
  ShieldCheck,
  ShieldOff,
  Activity,
  Eye,
} from 'lucide-react';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

interface UserBasic {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  status: string;
  createdAt: string;
  lastLoginAt?: string | null;
}

interface Contact {
  id: string;
  phone: string;
  countryCode: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  tags: string[];
  status: string;
  source?: string | null;
  messageCount: number;
  lastMessageAt?: string | null;
  createdAt: string;
  deletedAt?: string | null;  // ✅ NEW
  organization: { id: string; name: string };
}

interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
  text: string;
  url?: string;
  phone_number?: string;
}

interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  headerType?: string | null;
  headerContent?: string | null;       // ✅ NEW
  bodyText: string;
  footerText?: string | null;
  buttons?: TemplateButton[] | any;     // ✅ NEW
  variables?: any[];                    // ✅ NEW
  status: string;
  rejectionReason?: string | null;
  qualityScore?: string | null;         // ✅ NEW
  headerMediaId?: string | null;        // ✅ NEW
  metaTemplateId?: string | null;       // ✅ NEW
  wabaId?: string | null;               // ✅ NEW
  createdAt: string;
  updatedAt?: string;                   // ✅ NEW
  organization: { id: string; name: string };
  whatsappAccount?: {                   // ✅ NEW
    id: string;
    phoneNumber: string;
    displayName: string;
  } | null;
  _count: { campaigns: number };
}

interface Analytics {
  overview: {
    totalContacts: number;
    totalTemplates: number;
    totalCampaigns: number;
    totalMessages: number;
    totalChatbots: number;
    totalAutomations: number;
    contactsLast30Days: number;
  };
  campaigns: {
    byStatus: Record<string, number>;
    last5: Array<{
      id: string;
      name: string;
      status: string;
      totalContacts: number;
      sentCount: number;
      deliveredCount: number;
      readCount: number;
      failedCount: number;
      createdAt: string;
    }>;
  };
  messages: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    last7Days: number;
    last30Days: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entity?: string | null;
    createdAt: string;
  }>;
}

interface WalletData {
  wallet: {
    id: string;
    isActive: boolean;
    balancePaise: number;
    balanceRupees: number;
    totalCreditedRupees: number;
    totalDebitedRupees: number;
    creditEnabled: boolean;
    creditLimitRupees: number;
    flagged: boolean;
    flagReason?: string | null;
    accessGrantedAt?: string | null;
    lastTransactionAt?: string | null;
    currentMonthRupees: number;
    maxMonthlyRupees: number;
  } | null;
  organization: { id: string; name: string } | null;
  transactions: Array<{
    id: string;
    transactionId: string;
    type: string;
    amountPaise: number;
    balanceBeforePaise: number;
    balanceAfterPaise: number;
    description: string;
    status: string;
    razorpayPaymentId?: string | null;
    note?: string | null;
    createdAt: string;
  }>;
  total: number;
}

// ============================================
// HELPERS
// ============================================

const formatDate = (d?: string | null) => {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const formatDateTime = (d?: string | null) => {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

const formatRupees = (paise: number) =>
  `₹${(paise / 100).toFixed(2)}`;

const getUserDisplayName = (user: UserBasic) => {
  const fn = user.firstName || '';
  const ln = user.lastName || '';
  if (fn || ln) return `${fn} ${ln}`.trim();
  return user.email?.split('@')[0] || 'User';
};

const getUserInitials = (user: UserBasic) => {
  const fn = user.firstName || '';
  const ln = user.lastName || '';
  if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
  if (fn) return fn[0].toUpperCase();
  return user.email?.[0]?.toUpperCase() || 'U';
};

// ============================================
// TAB CONFIG
// ============================================

type TabKey = 'contacts' | 'templates' | 'analytics' | 'wallet';

const TABS: Array<{ key: TabKey; label: string; icon: React.ElementType }> = [
  { key: 'contacts', label: 'Contacts', icon: Users },
  { key: 'templates', label: 'Templates', icon: FileText },
  { key: 'analytics', label: 'Analytics', icon: BarChart2 },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
];

// ============================================
// STATUS BADGE
// ============================================

const StatusBadge: React.FC<{ status: string; small?: boolean }> = ({
  status,
  small,
}) => {
  const map: Record<string, { bg: string; text: string }> = {
    ACTIVE: { bg: 'bg-green-100', text: 'text-green-700' },
    BLOCKED: { bg: 'bg-red-100', text: 'text-red-700' },
    UNSUBSCRIBED: { bg: 'bg-gray-100', text: 'text-gray-600' },
    DELETED: { bg: 'bg-red-500/20', text: 'text-red-400' }, // ✅ NEW
    APPROVED: { bg: 'bg-green-100', text: 'text-green-700' },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-700' },
    COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-700' },
    RUNNING: { bg: 'bg-purple-100', text: 'text-purple-700' },
    DRAFT: { bg: 'bg-gray-100', text: 'text-gray-600' },
    FAILED: { bg: 'bg-red-100', text: 'text-red-700' },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-500' },
  };

  const cfg = map[status?.toUpperCase()] || {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium
        ${small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}
        ${cfg.bg} ${cfg.text}`}
    >
      {status}
    </span>
  );
};

// ============================================
// STAT CARD
// ============================================

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}> = ({ label, value, icon: Icon, color, sub }) => (
  <div className="bg-[#0a0e27] border border-white/[0.08] rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
);

// ============================================
// PAGINATION
// ============================================

const Pagination: React.FC<{
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}> = ({ page, totalPages, total, limit, onPageChange }) => {
  if (totalPages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
      <p className="text-xs text-gray-400">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
        <span className="text-xs text-gray-300 min-w-[60px] text-center">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] disabled:opacity-40 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// CONTACTS TAB
// ============================================

const ContactsTab: React.FC<{ userId: string }> = ({ userId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [includeDeleted, setIncludeDeleted] = useState(true);
  const [exporting, setExporting] = useState(false);
  const limit = 20;

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await admin.getUserContacts(userId, {
        page,
        limit,
        search: search || undefined,
        includeDeleted,
      });
      const data = res.data?.data;
      setContacts(data?.contacts || []);
      setTotal(data?.total || res.data?.meta?.total || 0);
    } catch (err: any) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [userId, page, search, includeDeleted]);

  useEffect(() => {
    const t = setTimeout(fetchContacts, 300);
    return () => clearTimeout(t);
  }, [fetchContacts]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await admin.exportUserContacts(userId);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_${userId}_contacts.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Contacts exported!');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2 bg-[#0a0e27] border border-white/[0.1]
                rounded-xl text-sm text-white placeholder:text-gray-500
                focus:outline-none focus:border-primary-500 w-56"
            />
          </div>

          {/* Include deleted toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={includeDeleted}
                onChange={(e) => {
                  setIncludeDeleted(e.target.checked);
                  setPage(1);
                }}
              />
              <div className="w-9 h-5 bg-gray-600 rounded-full peer
                peer-checked:bg-primary-600 transition-colors
                after:content-[''] after:absolute after:top-0.5 after:left-0.5
                after:bg-white after:rounded-full after:h-4 after:w-4
                after:transition-all peer-checked:after:translate-x-4" />
            </div>
            <span className="text-xs text-gray-400">Include deleted/blocked</span>
          </label>
        </div>

        {/* Export + Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchContacts}
            className="p-2 border border-white/[0.1] rounded-xl
              hover:bg-white/[0.04] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || total === 0}
            className="flex items-center gap-2 px-3 py-2 bg-green-600
              hover:bg-green-700 text-white text-sm font-medium rounded-xl
              transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export CSV
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10
        border border-blue-500/20 rounded-xl">
        <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
        <p className="text-xs text-blue-300">
          Admin view shows ALL contacts including those deleted by user.
          Deleted contacts appear with <strong>DELETED</strong> status badge.
          Total: <strong>{total}</strong> contacts
        </p>
      </div>

      {/* Table */}
      <div className="bg-[#0a0e27] border border-white/[0.08] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No contacts found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#050816] border-b border-white/[0.06]">
                  <tr>
                    {[
                      'Contact',
                      'Phone',
                      'Tags',
                      'Status',
                      'Messages',
                      'Organization',
                      'Added',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold
                          text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {contacts.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-white/[0.02] transition-colors
                        ${c.status !== 'ACTIVE' ? 'opacity-60' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {[c.firstName, c.lastName].filter(Boolean).join(' ') ||
                              'No Name'}
                          </p>
                          {c.email && (
                            <p className="text-xs text-gray-500">{c.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-sm text-gray-300 font-mono">
                            {c.phone?.startsWith('+') ? c.phone : `${c.countryCode || ''}${c.phone}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(c.tags || []).slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-primary-500/10
                                text-primary-400 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {c.tags?.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{c.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} small />
                        {c.status === 'DELETED' && c.deletedAt && (
                          <p className="text-[10px] text-red-400 mt-1">
                            {formatDate(c.deletedAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-300">
                            {c.messageCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-400">
                            {c.organization?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

// ============================================
// TEMPLATE PREVIEW MODAL (WhatsApp style)
// ============================================

const TemplatePreviewModal: React.FC<{
  template: Template | null;
  onClose: () => void;
}> = ({ template, onClose }) => {
  if (!template) return null;

  // Parse buttons safely
  const buttons: TemplateButton[] = Array.isArray(template.buttons)
    ? template.buttons
    : [];

  // Parse variables safely
  const variables: any[] = Array.isArray(template.variables)
    ? template.variables
    : [];

  // Format body text with variable highlighting
  const formatBodyText = (text: string) => {
    return text.split(/(\{\{\d+\}\})/g).map((part, i) => {
      if (/\{\{\d+\}\}/.test(part)) {
        return (
          <span
            key={i}
            className="bg-yellow-200 text-yellow-900 px-1 rounded font-mono text-xs"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Get button icon
  const getButtonIcon = (type: string) => {
    switch (type) {
      case 'URL':
        return '🔗';
      case 'PHONE_NUMBER':
        return '📞';
      case 'COPY_CODE':
        return '📋';
      case 'QUICK_REPLY':
      default:
        return '💬';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0a0e27] rounded-2xl shadow-2xl
        max-w-3xl w-full max-h-[90vh] overflow-hidden border border-white/[0.1]
        flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08]
          flex items-center justify-between shrink-0 bg-[#050816]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500
              to-primary-700 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">
                {template.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={template.status} small />
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-500">{template.language}</span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-500">{template.category}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-white/[0.06]
              rounded-lg transition-colors shrink-0"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body - 2 column layout */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-0">

            {/* LEFT: WhatsApp Preview */}
            <div className="p-6 bg-gradient-to-br from-[#0a1929] to-[#0a0e27]
              border-r border-white/[0.06]">
              <p className="text-xs font-semibold text-gray-400 uppercase
                tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Live Preview
              </p>

              {/* WhatsApp chat bubble container */}
              <div className="bg-[#0b141a] rounded-xl p-3 max-w-sm mx-auto
                border border-white/[0.05]"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")',
                }}
              >
                {/* WhatsApp message bubble */}
                <div className="bg-[#005c4b] rounded-lg overflow-hidden shadow-lg
                  ml-auto max-w-[280px] relative">

                  {/* Header */}
                  {template.headerType && template.headerType !== 'NONE' && (
                    <div className="bg-[#004a3d] p-2">
                      {template.headerType === 'TEXT' && template.headerContent && (
                        <p className="text-white font-bold text-sm break-words">
                          {template.headerContent}
                        </p>
                      )}
                      {template.headerType === 'IMAGE' && (
                        <div className="bg-gray-700 rounded h-32 flex items-center
                          justify-center">
                          <div className="text-center">
                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Image Header</p>
                          </div>
                        </div>
                      )}
                      {template.headerType === 'VIDEO' && (
                        <div className="bg-gray-700 rounded h-32 flex items-center
                          justify-center">
                          <div className="text-center">
                            <span className="text-3xl">🎥</span>
                            <p className="text-xs text-gray-400 mt-1">Video Header</p>
                          </div>
                        </div>
                      )}
                      {template.headerType === 'DOCUMENT' && (
                        <div className="bg-gray-700 rounded p-3 flex items-center gap-2">
                          <span className="text-2xl">📄</span>
                          <span className="text-xs text-gray-300">Document</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-3">
                    <p className="text-white text-sm whitespace-pre-wrap break-words
                      leading-relaxed">
                      {formatBodyText(template.bodyText)}
                    </p>

                    {/* Footer */}
                    {template.footerText && (
                      <p className="text-gray-400 text-xs mt-2 italic break-words">
                        {template.footerText}
                      </p>
                    )}

                    {/* Timestamp */}
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <span className="text-[10px] text-gray-400">
                        {new Date().toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <CheckCircle className="w-3 h-3 text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Buttons (separate bubbles in WhatsApp style) */}
                {buttons.length > 0 && (
                  <div className="ml-auto max-w-[280px] mt-1 space-y-1">
                    {buttons.map((btn, i) => (
                      <button
                        key={i}
                        className="w-full bg-[#005c4b] hover:bg-[#004a3d]
                          text-blue-300 text-sm font-medium py-2.5 px-3
                          rounded-lg transition-colors text-center flex
                          items-center justify-center gap-2"
                      >
                        <span>{getButtonIcon(btn.type)}</span>
                        <span className="truncate">{btn.text}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[10px] text-gray-600 text-center mt-3">
                This is how it appears to recipients
              </p>
            </div>

            {/* RIGHT: Template Details */}
            <div className="p-6 space-y-5">
              <p className="text-xs font-semibold text-gray-400 uppercase
                tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                Template Details
              </p>

              {/* Rejection reason */}
              {template.status === 'REJECTED' && template.rejectionReason && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs font-semibold text-red-400 mb-1">
                    ❌ Rejection Reason
                  </p>
                  <p className="text-sm text-red-300">{template.rejectionReason}</p>
                </div>
              )}

              {/* Quality Score */}
              {template.qualityScore && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-xs font-semibold text-green-400 mb-1">
                    ⭐ Quality Score
                  </p>
                  <p className="text-sm text-green-300 font-mono">
                    {template.qualityScore}
                  </p>
                </div>
              )}

              {/* Meta Info Grid */}
              <div className="space-y-2.5">
                <DetailRow label="Template ID" value={template.id} mono />
                {template.metaTemplateId && (
                  <DetailRow
                    label="Meta Template ID"
                    value={template.metaTemplateId}
                    mono
                  />
                )}
                {template.wabaId && (
                  <DetailRow label="WABA ID" value={template.wabaId} mono />
                )}
                <DetailRow label="Header Type" value={template.headerType || 'NONE'} />
                <DetailRow label="Buttons Count" value={String(buttons.length)} />
                <DetailRow
                  label="Variables Count"
                  value={String(variables.length)}
                />
                <DetailRow
                  label="Used In"
                  value={`${template._count?.campaigns || 0} campaigns`}
                />
                <DetailRow
                  label="Organization"
                  value={template.organization?.name || 'N/A'}
                />
                {template.whatsappAccount && (
                  <DetailRow
                    label="WhatsApp Number"
                    value={`${template.whatsappAccount.displayName} (${template.whatsappAccount.phoneNumber})`}
                  />
                )}
                <DetailRow
                  label="Created"
                  value={formatDateTime(template.createdAt)}
                />
                {template.updatedAt && (
                  <DetailRow
                    label="Last Updated"
                    value={formatDateTime(template.updatedAt)}
                  />
                )}
              </div>

              {/* Variables list */}
              {variables.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">
                    Variables
                  </p>
                  <div className="space-y-1.5">
                    {variables.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 bg-white/[0.03]
                          rounded-lg border border-white/[0.05]"
                      >
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5
                          rounded text-xs font-mono">
                          {`{{${i + 1}}}`}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                          {typeof v === 'string' ? v : v.name || v.type || `Variable ${i + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons details */}
              {buttons.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">
                    Buttons Details
                  </p>
                  <div className="space-y-2">
                    {buttons.map((btn, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-white/[0.03] rounded-lg
                          border border-white/[0.05]"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getButtonIcon(btn.type)}</span>
                          <span className="text-sm font-medium text-white">
                            {btn.text}
                          </span>
                          <span className="ml-auto text-[10px] text-gray-500 uppercase
                            bg-white/[0.05] px-1.5 py-0.5 rounded">
                            {btn.type}
                          </span>
                        </div>
                        {btn.url && (
                          <p className="text-xs text-blue-400 font-mono truncate
                            pl-6">
                            {btn.url}
                          </p>
                        )}
                        {btn.phone_number && (
                          <p className="text-xs text-green-400 font-mono truncate
                            pl-6">
                            {btn.phone_number}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-[#050816]
          flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500">
            Created by user · Admin read-only view
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700
              text-white text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DETAIL ROW HELPER
// ============================================

const DetailRow: React.FC<{
  label: string;
  value: string;
  mono?: boolean;
}> = ({ label, value, mono }) => (
  <div className="flex items-start justify-between gap-3 py-1.5
    border-b border-white/[0.04] last:border-0">
    <span className="text-xs text-gray-500 shrink-0 pt-0.5">{label}</span>
    <span
      className={`text-xs text-right break-all text-gray-200
        ${mono ? 'font-mono' : 'font-medium'}`}
    >
      {value}
    </span>
  </div>
);

// ============================================
// TEMPLATES TAB
// ============================================

const TemplatesTab: React.FC<{ userId: string }> = ({ userId }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null); // ✅ NEW
  const limit = 20;

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await admin.getUserTemplates(userId, {
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      const data = res.data?.data;
      setTemplates(data?.templates || []);
      setTotal(data?.total || res.data?.meta?.total || 0);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [userId, page, search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchTemplates, 300);
    return () => clearTimeout(t);
  }, [fetchTemplates]);

  const totalPages = Math.ceil(total / limit);

  const categoryColors: Record<string, string> = {
    MARKETING: 'bg-purple-500/10 text-purple-400',
    UTILITY: 'bg-blue-500/10 text-blue-400',
    AUTHENTICATION: 'bg-orange-500/10 text-orange-400',
  };

  return (
    <div className="space-y-4">
      {/* ✅ Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2 bg-[#0a0e27] border border-white/[0.1]
                rounded-xl text-sm text-white placeholder:text-gray-500
                focus:outline-none focus:border-primary-500 w-52"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[#0a0e27] border border-white/[0.1]
              rounded-xl text-sm text-gray-300 focus:outline-none
              focus:border-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <button
          onClick={fetchTemplates}
          className="p-2 border border-white/[0.1] rounded-xl
            hover:bg-white/[0.04] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0a0e27] border border-white/[0.08] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No templates found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#050816] border-b border-white/[0.06]">
                  <tr>
                    {[
                      'Template Name',
                      'Category',
                      'Language',
                      'Status',
                      'Used In',
                      'Organization',
                      'Created',
                      'Actions', // ✅ NEW
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold
                          text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {templates.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 max-w-md">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {t.name}
                          </p>
                          {/* ✅ Body text - 2 lines max with full preview hint */}
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2
                            leading-relaxed whitespace-pre-wrap break-words">
                            {t.bodyText}
                          </p>
                          {/* Header type indicator */}
                          {t.headerType && t.headerType !== 'NONE' && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <span className="text-[10px] bg-primary-500/10
                                text-primary-400 px-1.5 py-0.5 rounded font-medium">
                                {t.headerType} HEADER
                              </span>
                              {t.footerText && (
                                <span className="text-[10px] bg-gray-500/10
                                  text-gray-400 px-1.5 py-0.5 rounded font-medium">
                                  FOOTER
                                </span>
                              )}
                              {Array.isArray(t.buttons) && t.buttons.length > 0 && (
                                <span className="text-[10px] bg-green-500/10
                                  text-green-400 px-1.5 py-0.5 rounded font-medium">
                                  {t.buttons.length} BTN
                                </span>
                              )}
                            </div>
                          )}
                          {t.status === 'REJECTED' && t.rejectionReason && (
                            <p className="text-xs text-red-400 mt-1">
                              ❌ {t.rejectionReason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium
                            ${categoryColors[t.category] || 'bg-gray-500/10 text-gray-400'}`}
                        >
                          {t.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {t.language}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} small />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-300">
                            {t._count?.campaigns || 0} campaigns
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-400">
                            {t.organization?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(t.createdAt)}
                      </td>
                      {/* ✅ NEW: View button */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setPreviewTemplate(t)}
                          className="flex items-center gap-1.5 px-3 py-1.5
                            bg-primary-500/10 hover:bg-primary-500/20
                            text-primary-400 text-xs font-medium rounded-lg
                            transition-colors"
                          title="View full template"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

// ============================================
// ANALYTICS TAB
// ============================================

const AnalyticsTab: React.FC<{ userId: string }> = ({ userId }) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await admin.getUserAnalytics(userId);
      setAnalytics(res.data?.data || null);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16 text-gray-400">
        No analytics data available
      </div>
    );
  }

  const { overview, campaigns, messages, recentActivity } = analytics;

  const overviewStats = [
    {
      label: 'Total Contacts',
      value: overview.totalContacts.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      sub: `+${overview.contactsLast30Days} last 30 days`,
    },
    {
      label: 'Total Messages',
      value: messages.total.toLocaleString(),
      icon: MessageSquare,
      color: 'bg-green-500',
      sub: `${messages.last7Days} last 7 days`,
    },
    {
      label: 'Total Campaigns',
      value: overview.totalCampaigns.toLocaleString(),
      icon: Zap,
      color: 'bg-purple-500',
      sub: `${campaigns.byStatus['COMPLETED'] || 0} completed`,
    },
    {
      label: 'Templates',
      value: overview.totalTemplates.toLocaleString(),
      icon: FileText,
      color: 'bg-orange-500',
      sub: `${overview.totalChatbots} chatbots`,
    },
    {
      label: 'Messages Delivered',
      value: messages.delivered.toLocaleString(),
      icon: CheckCircle,
      color: 'bg-teal-500',
      sub: `${messages.read} read`,
    },
    {
      label: 'Automations',
      value: overview.totalAutomations.toLocaleString(),
      icon: Bot,
      color: 'bg-indigo-500',
      sub: 'Total created',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Refresh */}
      <div className="flex justify-end">
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-3 py-2 border border-white/[0.1]
            rounded-xl text-sm text-gray-400 hover:bg-white/[0.04] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Overview stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {overviewStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Message breakdown */}
      <div className="bg-[#0a0e27] border border-white/[0.08] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-400" />
          Message Delivery Stats
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Sent', value: messages.sent, color: 'text-blue-400' },
            { label: 'Delivered', value: messages.delivered, color: 'text-green-400' },
            { label: 'Read', value: messages.read, color: 'text-purple-400' },
            { label: 'Failed', value: messages.failed, color: 'text-red-400' },
          ].map((m) => (
            <div
              key={m.label}
              className="text-center p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]"
            >
              <p className={`text-2xl font-bold ${m.color}`}>
                {m.value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign status breakdown */}
      {Object.keys(campaigns.byStatus).length > 0 && (
        <div className="bg-[#0a0e27] border border-white/[0.08] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary-400" />
            Campaign Status Breakdown
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(campaigns.byStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center gap-2 px-3 py-2
                  bg-white/[0.03] rounded-xl border border-white/[0.06]"
              >
                <StatusBadge status={status} small />
                <span className="text-sm font-bold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last 5 campaigns */}
      {campaigns.last5.length > 0 && (
        <div className="bg-[#0a0e27] border border-white/[0.08] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-400" />
              Recent Campaigns
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#050816]">
                <tr>
                  {['Name', 'Status', 'Total', 'Sent', 'Delivered', 'Read', 'Failed', 'Date'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold
                          text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {campaigns.last5.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {c.name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} small />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {c.totalContacts}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-400">
                      {c.sentCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-400">
                      {c.deliveredCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-purple-400">
                      {c.readCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-400">
                      {c.failedCount}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <div className="bg-[#0a0e27] border border-white/[0.08] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-400" />
              Recent Activity (Last 30 Days)
            </h3>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentActivity.map((a) => (
              <div
                key={a.id}
                className="px-5 py-3 flex items-center justify-between
                  hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                  <span className="text-sm text-gray-300">
                    <span className="font-medium text-white">{a.action}</span>
                    {a.entity && (
                      <span className="text-gray-500"> on {a.entity}</span>
                    )}
                  </span>
                </div>
                <span className="text-xs text-gray-500 shrink-0">
                  {formatDateTime(a.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// WALLET TAB
// ============================================

const WalletTab: React.FC<{ userId: string }> = ({ userId }) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [txTypeFilter, setTxTypeFilter] = useState('');
  const limit = 20;

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await admin.getUserWallet(userId, {
        page,
        limit,
        type: txTypeFilter || undefined,
      });
      setWalletData(res.data?.data || null);
    } catch {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, [userId, page, txTypeFilter]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
      </div>
    );
  }

  const wallet = walletData?.wallet;
  const transactions = walletData?.transactions || [];
  const total = walletData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const txTypeColors: Record<string, string> = {
    credit: 'text-green-400',
    debit: 'text-red-400',
    refund: 'text-blue-400',
    admin_credit: 'text-purple-400',
    admin_debit: 'text-orange-400',
    reserved: 'text-yellow-400',
    released: 'text-teal-400',
  };

  return (
    <div className="space-y-5">
      {/* Refresh */}
      <div className="flex justify-end">
        <button
          onClick={fetchWallet}
          className="p-2 border border-white/[0.1] rounded-xl
            hover:bg-white/[0.04] transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Organization info */}
      {walletData?.organization && (
        <div className="flex items-center gap-2 px-4 py-3
          bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">
            Organization:{' '}
            <strong className="text-white">
              {walletData.organization.name}
            </strong>
          </span>
        </div>
      )}

      {/* No wallet */}
      {!wallet ? (
        <div className="text-center py-16 bg-[#0a0e27] border border-white/[0.08] rounded-2xl">
          <Wallet className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No wallet created yet</p>
          <p className="text-xs text-gray-600 mt-1">
            User needs to request wallet access first
          </p>
        </div>
      ) : (
        <>
          {/* Wallet status banner */}
          {wallet.flagged && (
            <div className="flex items-center gap-2 px-4 py-3
              bg-red-500/10 border border-red-500/20 rounded-xl">
              <ShieldOff className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-300">
                  Wallet Flagged
                </p>
                {wallet.flagReason && (
                  <p className="text-xs text-red-400 mt-0.5">
                    Reason: {wallet.flagReason}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Wallet cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Current Balance"
              value={`₹${wallet.balanceRupees?.toFixed(2)}`}
              icon={IndianRupee}
              color={wallet.isActive ? 'bg-green-500' : 'bg-gray-500'}
              sub={wallet.isActive ? 'Active' : 'Inactive'}
            />
            <StatCard
              label="Total Credited"
              value={`₹${wallet.totalCreditedRupees?.toFixed(2)}`}
              icon={TrendingUp}
              color="bg-blue-500"
              sub="All time"
            />
            <StatCard
              label="Total Debited"
              value={`₹${wallet.totalDebitedRupees?.toFixed(2)}`}
              icon={Activity}
              color="bg-orange-500"
              sub="All time"
            />
            <StatCard
              label="This Month"
              value={`₹${wallet.currentMonthRupees?.toFixed(2)}`}
              icon={Calendar}
              color="bg-purple-500"
              sub={`Limit: ₹${wallet.maxMonthlyRupees?.toFixed(0)}`}
            />
          </div>

          {/* Wallet meta info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-[#0a0e27] border border-white/[0.06] rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Wallet Status</p>
              <div className="flex items-center gap-1.5">
                {wallet.isActive ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Active</span>
                  </>
                ) : (
                  <>
                    <ShieldOff className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-400">Inactive</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#0a0e27] border border-white/[0.06] rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Credit Limit</p>
              <p className="text-sm font-medium text-white">
                {wallet.creditEnabled
                  ? `₹${wallet.creditLimitRupees?.toFixed(2)}`
                  : 'Not Enabled'}
              </p>
            </div>

            <div className="p-3 bg-[#0a0e27] border border-white/[0.06] rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Access Granted</p>
              <p className="text-sm font-medium text-white">
                {wallet.accessGrantedAt
                  ? formatDate(wallet.accessGrantedAt)
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-[#0a0e27] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]
              flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Transaction History ({total})
              </h3>
              <select
                value={txTypeFilter}
                onChange={(e) => {
                  setTxTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 bg-[#050816] border border-white/[0.1]
                  rounded-lg text-xs text-gray-300 focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
                <option value="refund">Refund</option>
                <option value="admin_credit">Admin Credit</option>
                <option value="admin_debit">Admin Debit</option>
              </select>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <IndianRupee className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No transactions found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#050816]">
                      <tr>
                        {[
                          'Description',
                          'Type',
                          'Amount',
                          'Balance After',
                          'Status',
                          'Date',
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold
                              text-gray-500 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {transactions.map((tx) => {
                        const isCredit = ['credit', 'refund', 'admin_credit', 'released'].includes(
                          tx.type
                        );
                        return (
                          <tr
                            key={tx.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm text-white">{tx.description}</p>
                                {tx.note && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {tx.note}
                                  </p>
                                )}
                                {tx.razorpayPaymentId && (
                                  <p className="text-xs text-gray-600 font-mono mt-0.5">
                                    {tx.razorpayPaymentId}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs font-medium ${
                                  txTypeColors[tx.type] || 'text-gray-400'
                                }`}
                              >
                                {tx.type.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-sm font-semibold ${
                                  isCredit ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {isCredit ? '+' : '-'}
                                {formatRupees(tx.amountPaise)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                              {formatRupees(tx.balanceAfterPaise)}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={tx.status} small />
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {formatDateTime(tx.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  limit={limit}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('contacts');
  const [user, setUser] = useState<UserBasic | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // User basic info fetch karo
  useEffect(() => {
    if (!userId) return;
    setUserLoading(true);
    admin
      .getUser(userId)
      .then((res) => {
        setUser(res.data?.data || null);
      })
      .catch(() => {
        toast.error('Failed to load user');
        navigate('/manage-wabmeta-admin/users');
      })
      .finally(() => setUserLoading(false));
  }, [userId, navigate]);

  if (!userId) {
    return (
      <div className="text-center py-20 text-gray-400">Invalid user ID</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/manage-wabmeta-admin/users')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      {/* User Header Profile */}
      {userLoading ? (
        <div className="flex items-center gap-4 bg-[#0a0e27] border border-white/[0.08] rounded-2xl p-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
          <span className="text-gray-400 text-sm">Loading user profile...</span>
        </div>
      ) : user ? (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0e27] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {getUserInitials(user)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">
                  {getUserDisplayName(user)}
                </h1>
                <StatusBadge status={user.status} />
              </div>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                {user.email}
              </p>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-500" />
                    {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  Joined {formatDate(user.createdAt)}
                </span>
                {user.lastLoginAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    Last Login {formatDateTime(user.lastLoginAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center text-red-300">
          User not found
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-white/[0.08] flex items-center gap-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors
                ${isActive 
                  ? 'border-primary-500 text-primary-400' 
                  : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="py-2">
        {activeTab === 'contacts' && <ContactsTab userId={userId} />}
        {activeTab === 'templates' && <TemplatesTab userId={userId} />}
        {activeTab === 'analytics' && <AnalyticsTab userId={userId} />}
        {activeTab === 'wallet' && <WalletTab userId={userId} />}
      </div>
    </div>
  );
};

export default UserDetail;
