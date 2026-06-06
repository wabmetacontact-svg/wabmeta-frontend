// 📁 src/pages/Contacts.tsx - COMPLETE WITH WHATSAPP PROFILE STATUS

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Upload,
  Download,
  Users,
  UserCheck,
  UserX,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle,
  MessageCircle,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Mail,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  AlertTriangle,
  Layers,
  ArrowLeft,
  FileSpreadsheet,
  Lock,
  Crown,
  UserPlus
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
import { formatPhoneForDisplay, validateIndianPhone } from '../utils/csvContacts';

// ============================================
// TYPES
// ============================================

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
  // WhatsApp Profile Fields
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
  pendingVerification: number;
}

// ============================================
// WHATSAPP STATUS BADGE COMPONENT
// ============================================

const WhatsAppStatusBadge: React.FC<{
  fetched: boolean;
  profileName: string | null;
  attempts: number;
}> = ({ fetched, profileName, attempts }) => {
  if (fetched && profileName) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        WhatsApp Verified
      </span>
    );
  }

  if (attempts > 0 && !fetched) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Verification Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
      <Clock className="w-3 h-3 mr-1" />
      Pending Verification
    </span>
  );
};

// ============================================
// CONTACT STATUS BADGE COMPONENT
// ============================================

const ContactStatusBadge: React.FC<{ status: Contact['status'] }> = ({ status }) => {
  const styles = {
    active: 'bg-green-50 text-green-700 border border-green-200',
    inactive: 'bg-red-50 text-red-700 border border-red-200',
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  };

  const labels = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// ============================================
// CONTACT ROW COMPONENT
// ============================================

const ContactRow: React.FC<{
  contact: Contact;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onRefreshProfile: (id: string) => void;
}> = ({ contact, selected, onSelect, onEdit, onDelete, onRefreshProfile }) => {
  const [showMenu, setShowMenu] = useState(false);

  const displayName = contact.whatsappProfileName ||
    `${contact.firstName} ${contact.lastName}`.trim() ||
    'Unknown';

  return (
    <tr className="hover:bg-gray-50/70 border-b border-gray-100 transition-all duration-200 group/row">
      {/* Checkbox */}
      <td className="px-4 py-3">
        <button onClick={() => onSelect(contact.id)}>
          {selected ? (
            <CheckSquare className="w-5 h-5 text-green-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-300" />
          )}
        </button>
      </td>

      {/* Contact Info */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{displayName}</p>
              {contact.whatsappProfileName && contact.whatsappProfileName !== contact.firstName && (
                <span className="text-xs text-gray-500">
                  (was: {contact.firstName})
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 font-mono">
              {formatPhoneForDisplay(contact.phone)}
            </p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-3">
        {contact.email ? (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-1 text-gray-400" />
            {contact.email}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        )}
      </td>

      {/* WhatsApp Status */}
      <td className="px-4 py-3">
        <WhatsAppStatusBadge
          fetched={contact.whatsappProfileFetched}
          profileName={contact.whatsappProfileName}
          attempts={contact.profileFetchAttempts}
        />
      </td>

      {/* Contact Status */}
      <td className="px-4 py-3">
        <ContactStatusBadge status={contact.status} />
      </td>

      {/* Tags */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {contact.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-50 border border-gray-200 text-gray-600"
            >
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

      {/* Last Contacted */}
      <td className="px-4 py-3">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {contact.lastContacted}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
              <button
                onClick={() => {
                  onEdit(contact);
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Contact
              </button>

              {!contact.whatsappProfileFetched && (
                <button
                  onClick={() => {
                    onRefreshProfile(contact.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verify WhatsApp
                </button>
              )}

              <Link
                to={`/dashboard/inbox?contact=${contact.phone}`}
                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Link>

              <hr className="my-1 border-gray-100" />

              <button
                onClick={() => {
                  onDelete(contact.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
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

// ============================================
// MAIN CONTACTS PAGE COMPONENT
// ============================================

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const { refreshStats } = useApp();

  const [activeTab, setActiveTab] = useState<'contacts' | 'groups'>('contacts');
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [meta, setMeta] = useState<ContactsMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [statsApi, setStatsApi] = useState<ContactStatsApi | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [, setRefreshingProfile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [whatsappFilter, setWhatsappFilter] = useState<string>('all');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Feature access & Modals
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10000;

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/contacts/stats');
      setStatsApi(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter.toUpperCase();
      if (whatsappFilter !== 'all') {
        params.whatsappProfileFetched = whatsappFilter === 'verified';
      }
      if (activeGroup?.id) {
        params.groupId = activeGroup.id;
      }

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

      const mappedContacts: Contact[] = contactsData.map((contact: any) => {
        const cf = contact.customFields || {};
        const backendStatus = String(contact.status || 'ACTIVE').toUpperCase();

        let uiStatus: Contact['status'] = 'active';
        if (backendStatus === 'BLOCKED' || backendStatus === 'INACTIVE') {
          uiStatus = 'inactive';
        } else if (backendStatus === 'UNSUBSCRIBED') {
          uiStatus = 'pending';
        }

        const phoneDisplay =
          contact.fullPhone ||
          (contact.countryCode ? `${contact.countryCode}${contact.phone}` : contact.phone) ||
          '';

        return {
          id: contact.id,
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          phone: phoneDisplay,
          email: contact.email || '',
          company: cf.company || '',
          address: cf.address || '',
          notes: cf.notes || '',
          status: uiStatus,
          tags: Array.isArray(contact.tags) ? contact.tags : [],
          lastContacted: contact.lastMessageAt
            ? new Date(contact.lastMessageAt).toLocaleDateString()
            : 'Never',
          createdAt: contact.createdAt || new Date().toISOString(),
          // WhatsApp Profile
          whatsappProfileFetched: contact.whatsappProfileFetched || false,
          whatsappProfileName: contact.whatsappProfileName || null,
          lastProfileFetchAt: contact.lastProfileFetchAt || null,
          profileFetchAttempts: contact.profileFetchAttempts || 0,
        };
      });

      setContacts(mappedContacts);
      setSelectedContacts([]);
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to load contacts'
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, whatsappFilter, activeGroup?.id]);

  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const res = await api.get('/contacts/groups/all');
      const groupsData = res.data?.data || [];
      setGroups(groupsData.map((g: any) => ({
        id: g.id,
        name: g.name,
        contactCount: g.contactCount || g._count?.members || 0,
        createdAt: g.createdAt,
      })));
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    await Promise.allSettled([fetchStats(), fetchContacts(), fetchGroups()]);
    refreshStats();
  }, [fetchStats, fetchContacts, fetchGroups, refreshStats]);

  // Initial load
  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('wabmeta_token');

    if (!token) {
      navigate('/login');
      return;
    }

    fetchAll();
  }, [navigate, fetchAll]);

  // Refetch on filter changes
  useEffect(() => {
    fetchContacts();
  }, [currentPage, searchQuery, statusFilter, whatsappFilter, activeGroup?.id, fetchContacts]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, whatsappFilter, activeGroup?.id]);

  // ============================================
  // HANDLERS
  // ============================================

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
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c.id));
    }
  };

  const handleSaveContact = async (contactData: any) => {
    try {
      // Validate phone
      if (!validateIndianPhone(contactData.phone)) {
        throw new Error('Invalid phone number format. Must include country code.');
      }

      const payload: any = {
        firstName: contactData.firstName || null,
        lastName: contactData.lastName || null,
        email: contactData.email || null,
        tags: contactData.tags || [],
        phone: String(contactData.phone || '').replace(/\D/g, ''),
        countryCode: '+91',
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

      await fetchAll();
      setShowAddModal(false);
      setEditingContact(null);
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to save contact'
      );
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      await api.delete(`/contacts/${id}`);
      await fetchAll();
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to delete contact'
      );
    }
  };

  const handleDeleteGroup = async (e: React.MouseEvent, groupId: string, groupName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete the group "${groupName}"? All contacts within this group will also be deleted. This action cannot be undone.`)) return;

    try {
      await api.delete(`/contacts/groups/${groupId}`);
      await fetchAll();
      if (activeGroup?.id === groupId) {
        setActiveGroup(null);
        setActiveTab('contacts');
      }
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to delete group'
      );
    }
  };

   const handleRefreshProfile = async (id: string) => {
    setRefreshingProfile(id);
    try {
      await api.post(`/contacts/${id}/refresh-profile`);
      await fetchContacts();
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to refresh profile'
      );
    } finally {
      setRefreshingProfile(null);
    }
  };

  const handleBulkRefreshProfiles = async () => {
    if (selectedContacts.length === 0) return;

    try {
      await api.post('/contacts/refresh-profiles/batch', {
        contactIds: selectedContacts,
      });
      await fetchContacts();
      setSelectedContacts([]);
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to refresh profiles'
      );
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedContacts.length === 0) return;

    try {
      if (action === 'delete') {
        if (!window.confirm(`Delete ${selectedContacts.length} contacts?`)) return;

        await api.delete('/contacts/bulk', {
          data: { contactIds: selectedContacts },
        });
        await fetchAll();
        setSelectedContacts([]);
      } else if (action === 'refresh-profiles') {
        await handleBulkRefreshProfiles();
      }
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Bulk action failed'
      );
    }
  };

  const handleImport = async (contacts: any[], groupData?: { id?: string; name?: string }) => {
    try {
      console.log('📤 Importing contacts payload:', {
        contactsCount: contacts.length,
        sample: contacts[0],
        groupData
      });

      const payload = {
        contacts: contacts.map(c => ({
          phone: String(c.phone).trim(), // Ensure string
          firstName: c.firstName || undefined,
          lastName: c.lastName || undefined,
          email: c.email || undefined,
          tags: c.tags || [],
          customFields: c.customFields || {}
        })),
        groupId: groupData?.id || undefined,
        // Note: Backend might not support groupName in import schema directly yet
        // groupName: groupData?.name, 
        skipDuplicates: true
      };

      // If you want to create group on fly, you might need separate API call or update backend schema
      // Assuming backend logic handles groupName inside import:
      if (groupData?.name) {
        (payload as any).groupName = groupData.name;
      }

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
    } catch (err: any) {
      console.error('Import failed:', err.response?.data); // Check console for exact validation error
      throw new Error(
        err.response?.data?.error ||
        JSON.stringify(err.response?.data?.errors) || // Show validation details
        'Import failed'
      );
    }
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
    } catch (err: any) {
      alert('Export failed');
    }
  };

  // ============================================
  // DELETE ALL CONTACTS
  // ============================================

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
      alert('All contacts successfully deleted');
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to delete all contacts'
      );
    } finally {
      setDeletingAll(false);
    }
  };

  // ============================================
  // STATS COMPUTATION
  // ============================================

  const stats = useMemo(() => {
    const total = statsApi?.total ?? meta.total ?? 0;
    const active = statsApi?.active ?? 0;
    const inactive = (statsApi?.blocked ?? 0) + (statsApi?.unsubscribed ?? 0);
    const verified = statsApi?.whatsappVerified ?? 0;

    return [
      {
        label: 'Total Contacts',
        value: loadingStats ? '...' : total.toLocaleString(),
        icon: Users,
        color: '#3B82F6', // Blue
      },
      {
        label: 'Active',
        value: loadingStats ? '...' : active.toLocaleString(),
        icon: UserCheck,
        color: '#10B981', // Emerald
      },
      {
        label: 'WhatsApp Verified',
        value: loadingStats ? '...' : verified.toLocaleString(),
        icon: CheckCircle,
        color: '#25D366', // WhatsApp Green
      },
      {
        label: 'Inactive',
        value: loadingStats ? '...' : inactive.toLocaleString(),
        icon: UserX,
        color: '#EF4444', // Red
      },
    ];
  }, [statsApi, meta.total, loadingStats]);

  // ============================================
  // RENDER
  // ============================================

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  const totalPages = meta.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">
            Manage your contact list
            <span className="text-gray-500 ml-1">
              (Showing {contacts.length} of {meta.total.toLocaleString()})
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchAll}
            className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Simple Bulk Paste */}
          <button
            onClick={handleBulkPasteClick}
            disabled={featuresLoading}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
              features.simpleBulkPaste
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {!features.simpleBulkPaste ? <Lock className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            <span className="hidden sm:inline">Bulk Paste</span>
            {!features.simpleBulkPaste && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                ₹2,500+
              </span>
            )}
          </button>

          {/* CSV Import */}
          <button
            onClick={handleCsvUploadClick}
            disabled={featuresLoading}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
              features.csvUpload
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {!features.csvUpload ? <Lock className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
            <span className="hidden sm:inline">CSV Import</span>
            {!features.csvUpload && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                ₹899+
              </span>
            )}
          </button>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          {/* Add Contact */}
          <button
            onClick={() => {
              setEditingContact(null);
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Contact</span>
          </button>
        </div>
      </div>

      {/* Upgrade Banner (if no features) */}
      {!featuresLoading && features.upgradeRequired && (
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">Unlock Bulk Upload Features</h3>
                <p className="text-white/80 mt-1">
                  {features.upgradeMessage || 'Upgrade to unlock bulk contacts paste, CSV imports, and advanced targeting.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setUpgradeFeature('Bulk Upload');
                setUpgradeMinPlan('MONTHLY');
                setShowUpgradeModal(true);
              }}
              className="px-6 py-3 bg-white text-purple-700 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-md shrink-0"
            >
              View Plans
            </button>
          </div>
        </div>
      )}

      {/* Feature Access Info hidden per user request */}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="flex-1">{error}</p>
          <button onClick={fetchAll} className="underline font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl border p-6 group/stat transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            style={{
              backgroundColor: `${stat.color}0A`, // ~4% opacity
              borderColor: `${stat.color}33`, // ~20% opacity
            }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover/stat:scale-110 group-hover/stat:opacity-[0.15] transition-all duration-500">
              <stat.icon size={80} style={{ color: stat.color }} />
            </div>
            <div className="relative z-10">
              <p 
                className="text-xs font-mono uppercase tracking-widest mb-1"
                style={{ color: stat.color }}
              >
                {stat.label}
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 mt-2">
        <button
          onClick={() => {
            setActiveTab('contacts');
            setActiveGroup(null);
            setCurrentPage(1);
          }}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'contacts'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>All Contacts</span>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'groups'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>Groups</span>
          <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs border border-gray-200">{groups.length}</span>
        </button>
      </div>

      {activeTab === 'contacts' || (activeTab === 'groups' && activeGroup) ? (
        <>
          {activeTab === 'groups' && activeGroup && (
            <div className="flex items-center space-x-4 mb-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <button onClick={() => { setActiveGroup(null); setCurrentPage(1); }} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeGroup.name}</h2>
                <p className="text-sm text-gray-600">Viewing {activeGroup.contactCount.toLocaleString()} numbers in this group</p>
              </div>
            </div>
          )}
          {/* Filters */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-4 relative z-10">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, or email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-green-500 focus:bg-white transition-colors [&>option]:bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>

              {/* WhatsApp Filter */}
              <select
                value={whatsappFilter}
                onChange={(e) => setWhatsappFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-green-500 focus:bg-white transition-colors [&>option]:bg-white"
              >
                <option value="all">All WhatsApp</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedContacts.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-green-50 border border-green-200 p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3 relative z-10">
                <CheckSquare className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  {selectedContacts.length} contact(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-2 relative z-10">
                <button
                  onClick={() => setShowAddToGroupModal(true)}
                  className="px-3 py-1.5 bg-green-100 border border-green-200 text-green-800 rounded-lg hover:bg-green-200 hover:text-green-900 text-sm font-medium transition-colors"
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  Add to Group
                </button>
                <button
                  onClick={handleBulkRefreshProfiles}
                  className="px-3 py-1.5 bg-green-100 border border-green-200 text-green-800 rounded-lg hover:bg-green-200 hover:text-green-900 text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4 inline mr-1" />
                  Verify WhatsApp
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 bg-red-100 border border-red-200 text-red-700 rounded-lg hover:bg-red-200 hover:text-red-900 text-sm font-medium transition-colors"
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
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No Contacts Yet</h3>
              <p className="text-gray-650 mt-2 mb-6">
                Add your first contact to get started with WhatsApp messaging.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Contact
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-1" />
                  Import CSV
                </button>
              </div>
            </div>
          )}

          {/* Contacts Table */}
          {contacts.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <button onClick={handleSelectAll}>
                          {selectedContacts.length === contacts.length ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        WhatsApp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Last Contact
                      </th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contacts.map((contact) => (
                      <ContactRow
                        key={contact.id}
                        contact={contact}
                        selected={selectedContacts.includes(contact.id)}
                        onSelect={handleSelectContact}
                        onEdit={(c) => {
                          setEditingContact(c);
                          setShowAddModal(true);
                        }}
                        onDelete={handleDeleteContact}
                        onRefreshProfile={handleRefreshProfile}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Groups</h2>
          </div>

          {loadingGroups ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div key={group.id} onClick={() => { setActiveGroup(group); setCurrentPage(1); }} className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 group/card cursor-pointer hover:border-green-300 hover:shadow-md transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:scale-110 group-hover/card:opacity-10 transition-all duration-500">
                    <Layers size={100} className="text-gray-200" />
                  </div>
                  
                  <div className="relative z-10">
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">GROUP</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 truncate" title={group.name}>{group.name}</h3>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-gray-900 font-semibold">{group.contactCount.toLocaleString()} <span className="text-gray-600 font-normal">contacts</span></span>
                      </div>
                      
                      {group.createdAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="text-gray-600 text-sm">Created {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPasteTargetGroupId(group.id);
                        setShowBulkPaste(true);
                      }}
                      className="p-2 text-green-750 hover:text-white hover:bg-green-600 rounded-lg transition-colors bg-green-50 border border-green-200"
                      title="Add Contacts to Group"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteGroup(e, group.id, group.name)}
                      className="p-2 text-red-655 hover:text-white hover:bg-red-600 rounded-lg transition-colors bg-red-50 border border-red-200"
                      title="Delete Group"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Layers className="w-8 h-8 text-gray-450" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No Groups Found</h3>
              <p className="text-gray-600 mt-2 mb-6 max-w-sm mx-auto">Groups you create during CSV imports will automatically appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        editContact={editingContact}
      />

      {/* Import Modal */}
      <ImportUploader
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />

      {/* New Modals */}
      <SimpleBulkPasteModal
        isOpen={showBulkPaste}
        onClose={() => {
          setShowBulkPaste(false);
          setPasteTargetGroupId('');
        }}
        onSuccess={() => {
          fetchContacts();
          refetchFeatures();
        }}
        groups={groups}
        initialGroupId={pasteTargetGroupId}
      />

      <CsvUploadModal
        isOpen={showCsvUpload}
        onClose={() => setShowCsvUpload(false)}
        onSuccess={() => {
          fetchContacts();
          refetchFeatures();
        }}
        groups={groups}
      />

      <AddToGroupModal
        isOpen={showAddToGroupModal}
        onClose={() => setShowAddToGroupModal(false)}
        selectedContactIds={selectedContacts}
        onSuccess={() => {
          setSelectedContacts([]);
          fetchAll();
        }}
      />

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={deletingAll ? undefined : () => setShowDeleteAllModal(false)}
          />
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl animate-scale-in p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 mx-auto border border-red-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center">Delete All Contacts</h2>
            <p className="text-gray-600 text-center mt-2 text-sm">
              Are you sure you want to delete ALL contacts? This will also remove them from all groups. This action CANNOT be undone.
            </p>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600 select-none">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteAllInput}
                onChange={(e) => setDeleteAllInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                disabled={deletingAll}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllContacts}
                disabled={deleteAllInput !== 'DELETE' || deletingAll}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-650 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {deletingAll ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
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