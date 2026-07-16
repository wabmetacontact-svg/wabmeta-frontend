// src/pages/Contacts.tsx - FIXED
import React, {
  useEffect, useMemo, useState, useCallback, useRef,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Upload, Download, Users, UserCheck, UserX,
  Clock, RefreshCw, AlertCircle, Loader2, CheckCircle,
  MessageCircle, Search, MoreVertical, Edit2, Trash2,
  Mail, Tag, Calendar, CheckSquare, Square, AlertTriangle,
  Layers, ArrowLeft, FileSpreadsheet, Lock, Crown, UserPlus,
} from 'lucide-react';

import AddContactModal from '../components/contacts/AddContactModal';
import ImportUploader from '../components/contacts/ImportUploader';
import SimpleBulkPasteModal from '../components/contacts/SimpleBulkPasteModal';
import AddToGroupModal from '../components/contacts/AddToGroupModal';
import CsvUploadModal from '../components/contacts/CsvUploadModal';
import UpgradeModal from '../components/common/UpgradeModal';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { useContactFeatures } from '../hooks/useContactFeatures';
import { formatPhoneForDisplay } from '../utils/csvContacts';

// ─── Types ───────────────────────────────────────────────────
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  tags: string[];
  notes: string;
  lastContacted: string;
  createdAt: string;
  whatsappProfileFetched: boolean;
  whatsappProfileName: string | null;
  lastProfileFetchAt: string | null;
  profileFetchAttempts: number;
}

interface ContactsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Group {
  id: string;
  name: string;
  contactCount: number;
  createdAt?: string;
}

interface ContactStatsApi {
  total: number;
  active: number;
  blocked: number;
  unsubscribed: number;
  recentlyAdded: number;
  withMessages: number;
  whatsappVerified: number;
}

// ─── WhatsApp Status Badge ────────────────────────────────────
const WhatsAppStatusBadge: React.FC<{
  fetched: boolean; profileName: string | null; attempts: number;
}> = ({ fetched, profileName, attempts }) => {
  if (fetched && profileName) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                       text-xs font-medium bg-green-50 text-green-700
                       border border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Verified
      </span>
    );
  }
  if (attempts > 0 && !fetched) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                       text-xs font-medium bg-amber-50 text-amber-700
                       border border-amber-200">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                     text-xs font-medium bg-gray-50 text-gray-500
                     border border-gray-200">
      <Clock className="w-3 h-3 mr-1" />
      Pending
    </span>
  );
};

// ─── Status Badge ─────────────────────────────────────────────
const ContactStatusBadge: React.FC<{ status: Contact['status'] }> = ({ status }) => {
  const map = {
    active: 'bg-green-50 text-green-700 border border-green-200',
    inactive: 'bg-red-50 text-red-700 border border-red-200',
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  };
  const labels = { active: 'Active', inactive: 'Inactive', pending: 'Pending' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                      text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
};

// ─── Contact Row ──────────────────────────────────────────────
const ContactRow: React.FC<{
  contact: Contact;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}> = ({ contact, selected, onSelect, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const displayName =
    contact.whatsappProfileName ||
    `${contact.firstName} ${contact.lastName}`.trim() ||
    'Unknown';

  return (
    <tr className="hover:bg-gray-50/70 border-b border-gray-100
                   transition-all duration-200 group/row">
      <td className="px-4 py-3">
        <button onClick={() => onSelect(contact.id)}>
          {selected
            ? <CheckSquare className="w-5 h-5 text-green-600" />
            : <Square className="w-5 h-5 text-gray-300" />}
        </button>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200
                          flex items-center justify-center text-gray-700
                          font-bold text-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{displayName}</p>
            <p className="text-sm text-gray-500 font-mono">
              {formatPhoneForDisplay(contact.phone)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        {contact.email
          ? <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-1 text-gray-400" />
            {contact.email}
          </div>
          : <span className="text-gray-400 text-sm">—</span>}
      </td>

      <td className="px-4 py-3">
        <WhatsAppStatusBadge
          fetched={contact.whatsappProfileFetched}
          profileName={contact.whatsappProfileName}
          attempts={contact.profileFetchAttempts}
        />
      </td>

      <td className="px-4 py-3">
        <ContactStatusBadge status={contact.status} />
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {contact.tags.slice(0, 2).map(tag => (
            <span key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-full
                             text-xs bg-gray-50 border border-gray-200 text-gray-600">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {contact.tags.length > 2 && (
            <span className="text-xs text-gray-500 font-medium">
              +{contact.tags.length - 2}
            </span>
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {contact.lastContacted}
        </div>
      </td>

      <td className="px-4 py-3 relative">
        <button
          onClick={() => setShowMenu(s => !s)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl
                            shadow-lg border border-gray-200 z-20">
              <button
                onClick={() => { onEdit(contact); setShowMenu(false); }}
                className="w-full flex items-center px-4 py-2.5 text-sm
                           text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Contact
              </button>

              <Link
                to={`/dashboard/inbox?contact=${contact.phone}`}
                className="w-full flex items-center px-4 py-2.5 text-sm
                           text-gray-700 hover:bg-gray-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Link>

              <hr className="my-1 border-gray-100" />

              <button
                onClick={() => { onDelete(contact.id); setShowMenu(false); }}
                className="w-full flex items-center px-4 py-2.5 text-sm
                           text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
};

// ─── Main Component ───────────────────────────────────────────
const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const { setTotalContacts } = useApp();

  const [activeTab, setActiveTab] = useState<'contacts' | 'groups'>('contacts');
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [meta, setMeta] = useState<ContactsMeta>({
    page: 1, limit: 20, total: 0, totalPages: 1,
  });
  const [statsApi, setStatsApi] = useState<ContactStatsApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [whatsappFilter, setWhatsappFilter] = useState('all');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const { features, loading: featuresLoading, refetch: refetchFeatures } = useContactFeatures();
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [upgradeMinPlan, setUpgradeMinPlan] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [pasteTargetGroupId, setPasteTargetGroupId] = useState('');
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteAllInput, setDeleteAllInput] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // ✅ FIX Bug2: Use ref to track mounted state and avoid re-render loops
  const isFirstMount = useRef(true);

  // ─── Fetch ────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/contacts/stats');
      const data = res.data?.data || null;
      setStatsApi(data);
      if (data) setTotalContacts(data.total || 0);
    } catch { /* silent */ } finally {
      setLoadingStats(false);
    }
  }, [setTotalContacts]);

  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const res = await api.get('/contacts/groups/all');
      const data = res.data?.data || [];
      setGroups(data.map((g: any) => ({
        id: g.id,
        name: g.name,
        contactCount: g.contactCount || g._count?.members || 0,
        createdAt: g.createdAt,
      })));
    } catch { /* silent */ } finally {
      setLoadingGroups(false);
    }
  }, []);

  const fetchContacts = useCallback(async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: 20,      // ✅ FIX Bug1: 20 per page, not 10000
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter.toUpperCase();
      if (whatsappFilter !== 'all') params.whatsappProfileFetched = whatsappFilter === 'verified';
      if (activeGroup?.id) params.groupId = activeGroup.id;

      const res = await api.get('/contacts', { params });
      const contactsData = Array.isArray(res.data?.data) ? res.data.data : [];
      const metaData = res.data?.meta;

      if (metaData) {
        setMeta({
          page: metaData.page,
          limit: metaData.limit,
          total: metaData.total,
          totalPages: metaData.totalPages,
        });
      }

      const mapped: Contact[] = contactsData.map((c: any) => {
        const cf = c.customFields || {};
        const status = String(c.status || 'ACTIVE').toUpperCase();
        let uiStatus: Contact['status'] = 'active';
        if (status === 'BLOCKED' || status === 'INACTIVE') uiStatus = 'inactive';
        else if (status === 'UNSUBSCRIBED') uiStatus = 'pending';

        const phone =
          c.fullPhone ||
          (c.countryCode ? `${c.countryCode}${c.phone}` : c.phone) ||
          '';

        return {
          id: c.id,
          firstName: c.firstName || '',
          lastName: c.lastName || '',
          phone,
          email: c.email || '',
          company: cf.company || '',
          address: cf.address || '',
          notes: cf.notes || '',
          status: uiStatus,
          tags: Array.isArray(c.tags) ? c.tags : [],
          lastContacted: c.lastMessageAt
            ? new Date(c.lastMessageAt).toLocaleDateString()
            : 'Never',
          createdAt: c.createdAt || new Date().toISOString(),
          whatsappProfileFetched: c.whatsappProfileFetched || false,
          whatsappProfileName: c.whatsappProfileName || null,
          lastProfileFetchAt: c.lastProfileFetchAt || null,
          profileFetchAttempts: c.profileFetchAttempts || 0,
        };
      });

      setContacts(mapped);
      setSelectedContacts([]);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to load contacts'
      );
    } finally {
      setLoading(false);
    }
    // ✅ FIX Bug2: Remove fetchContacts from deps to avoid loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, statusFilter, whatsappFilter, activeGroup?.id]);

  // ✅ FIX Bug7: Single initial fetch
  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token');

    if (!token) { navigate('/login'); return; }

    Promise.allSettled([fetchStats(), fetchContacts(), fetchGroups()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // ✅ FIX Bug7: Filter changes - skip first render
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setCurrentPage(1);
    fetchContacts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, whatsappFilter, activeGroup?.id]);

  // Pagination change
  useEffect(() => {
    if (isFirstMount.current) return;
    fetchContacts(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchAll = useCallback(async () => {
    await Promise.allSettled([
      fetchStats(),
      fetchContacts(currentPage),
      fetchGroups(),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // ─── Handlers ─────────────────────────────────────────────
  const handleBulkPasteClick = () => {
    if (!features.simpleBulkPaste) {
      setUpgradeFeature('Simple Bulk Paste');
      setUpgradeMinPlan('QUARTERLY');
      setShowUpgradeModal(true);
      return;
    }
    setPasteTargetGroupId('');
    setShowBulkPaste(true);
  };

  const handleCsvUploadClick = () => {
    if (!features.csvUpload) {
      setUpgradeFeature('CSV Import');
      setUpgradeMinPlan('MONTHLY');
      setShowUpgradeModal(true);
      return;
    }
    setShowCsvUpload(true);
  };

  const handleSelectContact = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedContacts(
      selectedContacts.length === contacts.length
        ? []
        : contacts.map(c => c.id)
    );
  };

  const handleSaveContact = async (contactData: any) => {
    const rawPhone = String(contactData.phone || '').trim();
    const clean = rawPhone.replace(/[\s\-\(\)]/g, '');

    if (!clean.startsWith('+')) {
      throw new Error('Phone number must start with country code (e.g. +91, +1)');
    }
    const digits = clean.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      throw new Error('Phone number must be 7-15 digits');
    }

    const payload = {
      firstName: contactData.firstName || null,
      lastName: contactData.lastName || null,
      email: contactData.email || null,
      tags: contactData.tags || [],
      phone: clean,
      customFields: {
        company: contactData.company || '',
        address: contactData.address || '',
        notes: contactData.notes || '',
      },
    };

    if (editingContact) {
      await api.put(`/contacts/${editingContact.id}`, payload);
    } else {
      await api.post('/contacts', payload);
    }

    await new Promise(r => setTimeout(r, 300));
    await fetchAll();
    setShowAddModal(false);
    setEditingContact(null);
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      setContacts(prev => prev.filter(c => c.id !== id));
      await api.delete(`/contacts/${id}`);
      await fetchStats();
    } catch (err: any) {
      await fetchContacts(currentPage);
      alert(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  // ✅ FIX Bug3: Corrected delete group message
  const handleDeleteGroup = async (
    e: React.MouseEvent,
    groupId: string,
    groupName: string
  ) => {
    e.stopPropagation();
    // ✅ Correct message - contacts are NOT deleted, only the group
    if (!window.confirm(
      `Delete group "${groupName}"?\n\n` +
      `The group will be removed but your contacts will remain in your contacts list.`
    )) return;

    try {
      setGroups(prev => prev.filter(g => g.id !== groupId));
      await api.delete(`/contacts/groups/${groupId}`);
      if (activeGroup?.id === groupId) {
        setActiveGroup(null);
        setActiveTab('contacts');
      }
    } catch (err: any) {
      await fetchGroups();
      alert(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedContacts.length === 0) return;
    if (action === 'delete') {
      if (!window.confirm(`Delete ${selectedContacts.length} contacts?`)) return;
      try {
        await api.delete('/contacts/bulk', {
          data: { contactIds: selectedContacts },
        });
        await fetchAll();
        setSelectedContacts([]);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Bulk delete failed');
      }
    }
  };

  const handleImport = async (contacts: any[], groupData?: any) => {
    const payload: any = {
      contacts: contacts.map(c => ({
        phone: String(c.phone).trim(),
        firstName: c.firstName || undefined,
        lastName: c.lastName || undefined,
        email: c.email || undefined,
        tags: c.tags || [],
        customFields: c.customFields || {},
      })),
      groupId: groupData?.id || undefined,
      skipDuplicates: true,
    };
    if (groupData?.name) payload.groupName = groupData.name;

    const res = await api.post('/contacts/import', payload);
    const result = res.data?.data;

    alert(
      `✅ Import Complete!\n` +
      `Imported: ${result?.imported || 0}\n` +
      `Skipped: ${result?.skipped || 0}\n` +
      `Failed: ${result?.failed || 0}`
    );

    await fetchAll();
    setShowImportModal(false);
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/contacts/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    }
  };

  const handleDeleteAllContacts = async () => {
    if (deleteAllInput !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }
    setDeletingAll(true);
    try {
      await api.delete('/contacts/all');
      await fetchAll();
      setShowDeleteAllModal(false);
      setDeleteAllInput('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete all contacts');
    } finally {
      setDeletingAll(false);
    }
  };

  // ─── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => [
    { label: 'Total Contacts', value: loadingStats ? '...' : (statsApi?.total ?? 0).toLocaleString(), icon: Users, color: '#3B82F6' },
    { label: 'Active', value: loadingStats ? '...' : (statsApi?.active ?? 0).toLocaleString(), icon: UserCheck, color: '#10B981' },
    { label: 'WhatsApp Verified', value: loadingStats ? '...' : (statsApi?.whatsappVerified ?? 0).toLocaleString(), icon: CheckCircle, color: '#25D366' },
    { label: 'Inactive', value: loadingStats ? '...' : ((statsApi?.blocked ?? 0) + (statsApi?.unsubscribed ?? 0)).toLocaleString(), icon: UserX, color: '#EF4444' },
  ], [statsApi, loadingStats]);

  // ─── Render ───────────────────────────────────────────────
  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">
            Manage your contact list
            <span className="text-gray-500 ml-1">
              ({contacts.length} of {meta.total.toLocaleString()})
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchAll}
            className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200
                       text-gray-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Bulk Paste */}
          <button
            onClick={handleBulkPasteClick}
            disabled={featuresLoading}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl
                        font-medium transition-colors
                        ${features.simpleBulkPaste
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {features.simpleBulkPaste
              ? <Upload className="w-4 h-4" />
              : <Lock className="w-4 h-4" />}
            <span className="hidden sm:inline">Bulk Paste</span>
            {!features.simpleBulkPaste && (
              <span className="text-xs bg-yellow-100 text-yellow-700
                               px-1.5 py-0.5 rounded-full">
                ₹2,500+
              </span>
            )}
          </button>

          {/* CSV Import */}
          <button
            onClick={handleCsvUploadClick}
            disabled={featuresLoading}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl
                        font-medium transition-colors
                        ${features.csvUpload
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {features.csvUpload
              ? <FileSpreadsheet className="w-4 h-4" />
              : <Lock className="w-4 h-4" />}
            <span className="hidden sm:inline">CSV Import</span>
            {!features.csvUpload && (
              <span className="text-xs bg-yellow-100 text-yellow-700
                               px-1.5 py-0.5 rounded-full">
                ₹899+
              </span>
            )}
          </button>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100
                       rounded-xl hover:bg-gray-200 text-gray-700
                       font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={() => { setEditingContact(null); setShowAddModal(true); }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-green-600
                       hover:bg-green-700 text-white font-medium rounded-xl
                       transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Contact</span>
          </button>
        </div>
      </div>

      {/* Upgrade Banner */}
      {!featuresLoading && features.upgradeRequired && (
        <div className="bg-gradient-to-r from-purple-600 via-blue-600
                        to-green-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center
                          justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl
                              flex items-center justify-center shrink-0">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">
                  Unlock Bulk Upload Features
                </h3>
                <p className="text-white/80 mt-1">
                  {features.upgradeMessage ||
                    'Upgrade to unlock bulk paste, CSV imports, and more.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setUpgradeFeature('Bulk Upload');
                setUpgradeMinPlan('MONTHLY');
                setShowUpgradeModal(true);
              }}
              className="px-6 py-3 bg-white text-purple-700 rounded-xl
                         font-bold hover:bg-purple-50 transition-colors
                         shadow-md shrink-0"
            >
              View Plans
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4
                        flex items-center space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button onClick={fetchAll} className="underline font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border p-6
                       transition-all duration-300 hover:-translate-y-0.5
                       hover:shadow-md"
            style={{
              backgroundColor: `${s.color}0A`,
              borderColor: `${s.color}33`,
            }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.08]">
              <s.icon size={80} style={{ color: s.color }} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-mono uppercase tracking-widest mb-1"
                style={{ color: s.color }}>
                {s.label}
              </p>
              <h3 className="text-3xl font-bold text-gray-900">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('contacts'); setActiveGroup(null); setCurrentPage(1); }}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors
                      flex items-center gap-2
                      ${activeTab === 'contacts'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Users className="w-4 h-4" />
          All Contacts
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors
                      flex items-center gap-2
                      ${activeTab === 'groups'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Layers className="w-4 h-4" />
          Groups
          <span className="bg-gray-100 text-gray-600 py-0.5 px-2
                           rounded-full text-xs border border-gray-200">
            {groups.length}
          </span>
        </button>
      </div>

      {/* Contacts Tab */}
      {(activeTab === 'contacts' || (activeTab === 'groups' && activeGroup)) && (
        <>
          {/* Group breadcrumb */}
          {activeTab === 'groups' && activeGroup && (
            <div className="flex items-center space-x-4 bg-white rounded-xl
                            p-4 border border-gray-200 shadow-sm">
              <button
                onClick={() => { setActiveGroup(null); setCurrentPage(1); }}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg
                           text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeGroup.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {activeGroup.contactCount.toLocaleString()} contacts
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-200
                          p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2
                                   w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, or email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border
                             border-gray-200 rounded-xl text-gray-900
                             placeholder:text-gray-400 focus:outline-none
                             focus:border-green-500 focus:bg-white transition-colors"
                />
              </div>

              {/* ✅ FIX Bug8: Correct status filter values */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200
                           rounded-xl text-gray-700 focus:outline-none
                           focus:border-green-500 focus:bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>

              <select
                value={whatsappFilter}
                onChange={e => setWhatsappFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200
                           rounded-xl text-gray-700 focus:outline-none
                           focus:border-green-500 focus:bg-white"
              >
                <option value="all">All WhatsApp</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedContacts.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl
                            p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  {selectedContacts.length} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAddToGroupModal(true)}
                  className="px-3 py-1.5 bg-green-100 border border-green-200
                             text-green-800 rounded-lg hover:bg-green-200
                             text-sm font-medium transition-colors"
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  Add to Group
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 bg-red-100 border border-red-200
                             text-red-700 rounded-lg hover:bg-red-200
                             text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedContacts([])}
                  className="px-3 py-1.5 text-gray-500 hover:text-gray-800 text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {meta.total === 0 && !error && !loading && (
            <div className="bg-white rounded-xl border border-gray-200
                            p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center
                              justify-center mx-auto mb-4 border border-gray-100">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No Contacts Yet
              </h3>
              <p className="text-gray-600 mt-2 mb-6">
                Add your first contact to get started.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-xl
                             hover:bg-green-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Contact
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl
                             hover:bg-gray-200 transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-1" />
                  Import CSV
                </button>
              </div>
            </div>
          )}

          {/* Contacts Table */}
          {contacts.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-white
                            border border-gray-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <button onClick={handleSelectAll}>
                          {selectedContacts.length === contacts.length
                            ? <CheckSquare className="w-5 h-5 text-green-600" />
                            : <Square className="w-5 h-5 text-gray-300" />}
                        </button>
                      </th>
                      {[
                        'Contact', 'Email', 'WhatsApp',
                        'Status', 'Tags', 'Last Contact', '',
                      ].map(h => (
                        <th key={h}
                          className="px-4 py-3 text-left text-xs font-semibold
                                       text-gray-600 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contacts.map(c => (
                      <ContactRow
                        key={c.id}
                        contact={c}
                        selected={selectedContacts.includes(c.id)}
                        onSelect={handleSelectContact}
                        onEdit={contact => { setEditingContact(contact); setShowAddModal(true); }}
                        onDelete={handleDeleteContact}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200
                                flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Page {meta.page} of {meta.totalPages}
                    ({meta.total.toLocaleString()} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={meta.page === 1}
                      className="px-3 py-1.5 bg-white border border-gray-200
                                 text-gray-700 rounded-lg disabled:opacity-50
                                 text-sm hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))}
                      disabled={meta.page >= meta.totalPages}
                      className="px-3 py-1.5 bg-white border border-gray-200
                                 text-gray-700 rounded-lg disabled:opacity-50
                                 text-sm hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && !activeGroup && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Groups</h2>

          {loadingGroups ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(group => (
                <div
                  key={group.id}
                  onClick={() => { setActiveGroup(group); setCurrentPage(1); }}
                  className="relative overflow-hidden rounded-2xl bg-white
                             border border-gray-200 p-6 group/card cursor-pointer
                             hover:border-green-300 hover:shadow-md
                             transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Layers size={100} className="text-gray-200" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-mono text-gray-500
                                  uppercase tracking-widest mb-2">
                      GROUP
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 truncate"
                      title={group.name}>
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50
                                      flex items-center justify-center
                                      text-green-600 border border-green-100">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-gray-900 font-semibold">
                        {group.contactCount.toLocaleString()}{' '}
                        <span className="text-gray-600 font-normal">contacts</span>
                      </span>
                    </div>
                    {group.createdAt && (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50
                                        flex items-center justify-center
                                        text-blue-600 border border-blue-100">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span className="text-gray-600 text-sm">
                          {new Date(group.createdAt).toLocaleDateString(
                            'en-US', { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hover actions */}
                  <div className="absolute top-4 right-4 flex items-center gap-2
                                  opacity-0 group-hover/card:opacity-100
                                  transition-opacity z-20">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setPasteTargetGroupId(group.id);
                        setShowBulkPaste(true);
                      }}
                      className="p-2 text-green-700 hover:text-white
                                 hover:bg-green-600 rounded-lg transition-colors
                                 bg-green-50 border border-green-200"
                      title="Add Contacts"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={e => handleDeleteGroup(e, group.id, group.name)}
                      className="p-2 text-red-600 hover:text-white
                                 hover:bg-red-600 rounded-lg transition-colors
                                 bg-red-50 border border-red-200"
                      title="Delete Group"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200
                            p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center
                              justify-center mx-auto mb-4 border border-gray-100">
                <Layers className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No Groups Found
              </h3>
              <p className="text-gray-600 mt-2 max-w-sm mx-auto">
                Groups you create will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingContact(null); }}
        onSave={handleSaveContact}
        editContact={editingContact}
      />

      <ImportUploader
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />

      <SimpleBulkPasteModal
        isOpen={showBulkPaste}
        onClose={() => { setShowBulkPaste(false); setPasteTargetGroupId(''); }}
        onSuccess={async () => {
          await new Promise(r => setTimeout(r, 500));
          await fetchAll();
          refetchFeatures();
        }}
        groups={groups}
        initialGroupId={pasteTargetGroupId}
      />

      <CsvUploadModal
        isOpen={showCsvUpload}
        onClose={() => setShowCsvUpload(false)}
        onSuccess={async () => {
          await new Promise(r => setTimeout(r, 500));
          await fetchAll();
          refetchFeatures();
        }}
        groups={groups}
      />

      <AddToGroupModal
        isOpen={showAddToGroupModal}
        onClose={() => setShowAddToGroupModal(false)}
        selectedContactIds={selectedContacts}
        onSuccess={async () => {
          setSelectedContacts([]);
          await new Promise(r => setTimeout(r, 300));
          await fetchAll();
        }}
      />

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={deletingAll ? undefined : () => setShowDeleteAllModal(false)}
          />
          <div className="relative w-full max-w-md bg-white border border-gray-200
                          rounded-2xl shadow-xl p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center
                            justify-center mb-4 text-red-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center">
              Delete All Contacts
            </h2>
            <p className="text-gray-600 text-center mt-2 text-sm">
              This will permanently delete ALL contacts. This cannot be undone.
            </p>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <strong className="text-red-600 select-none">DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteAllInput}
                onChange={e => setDeleteAllInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200
                           rounded-xl text-gray-900 focus:outline-none
                           focus:border-red-500 transition-colors"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                disabled={deletingAll}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700
                           bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllContacts}
                disabled={deleteAllInput !== 'DELETE' || deletingAll}
                className="flex-1 px-4 py-2 text-sm font-medium text-white
                           bg-red-600 hover:bg-red-700 disabled:opacity-50
                           disabled:cursor-not-allowed rounded-xl transition-colors
                           flex items-center justify-center gap-2"
              >
                {deletingAll
                  ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  : <Trash2 className="w-4 h-4" />}
                {deletingAll ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        minimumPlan={upgradeMinPlan}
      />
    </div>
  );
};

export default Contacts;