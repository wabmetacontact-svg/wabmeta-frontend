// src/pages/admin/UserManagement.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Ban, Trash2, CheckCircle, RefreshCw,
  Loader2, AlertCircle, Users,
  UserX, Eye, X, Key, ShieldCheck, UserCheck
} from 'lucide-react';
import api, { admin } from '../../services/api';
import toast from 'react-hot-toast';
import WhatsAppConnectionBadge from '../../components/admin/WhatsAppConnectionBadge';

// ============================================
// TYPES
// ============================================
interface Organization {
  id: string;
  name: string;
  role: string;
}

interface WhatsAppAccount {
  id: string;
  verifiedName: string | null;
  displayPhoneNumber: string;
  connectionType: 'CLOUD_API' | 'BUSINESS_APP' | 'ON_PREMISE';
  status: 'active' | 'inactive';
  isDefault: boolean;
  qualityRating: string | null;
  phoneNumberId: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  status: string;
  emailVerified?: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  organizations?: Organization[];
  whatsappAccounts?: WhatsAppAccount[];
  whatsappSummary?: {
    cloudApiAccounts: number;
    businessAppAccounts: number;
    activeAccounts: number;
  };
  password?: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Safe string helper
const safeString = (value: string | null | undefined, fallback: string = ''): string => {
  return value ?? fallback;
};

// Get user display name
const getUserDisplayName = (user: User): string => {
  const firstName = safeString(user.firstName);
  const lastName = safeString(user.lastName);

  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  return user.email?.split('@')[0] || 'Unknown User';
};

// Get user initials
const getUserInitials = (user: User): string => {
  const firstName = safeString(user.firstName);
  const lastName = safeString(user.lastName);

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  return user.email?.charAt(0).toUpperCase() || 'U';
};

// Format date safely
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};


// ============================================
// STATUS BADGE COMPONENT
// ============================================
interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = (status || 'UNKNOWN').toUpperCase();

    switch (normalizedStatus) {
      case 'ACTIVE':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          icon: CheckCircle,
          label: 'Active'
        };
      case 'SUSPENDED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          icon: Ban,
          label: 'Suspended'
        };
      case 'PENDING_VERIFICATION':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          icon: AlertCircle,
          label: 'Pending'
        };
      case 'INACTIVE':
        return {
          bg: 'bg-[#0a0e27]/[0.04]',
          text: 'text-gray-300',
          icon: UserX,
          label: 'Inactive'
        };
      default:
        return {
          bg: 'bg-[#0a0e27]/[0.04]',
          text: 'text-gray-300',
          icon: Users,
          label: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

// ============================================
// CONFIRMATION MODAL
// ============================================
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, title, message, confirmText, confirmColor = 'bg-red-500', onConfirm, onCancel, loading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-[#0a0e27] rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-300 bg-[#0a0e27]/[0.04] rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2 ${confirmColor}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// USER DETAILS MODAL
// ============================================
interface UserDetailsModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, user, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[#0a0e27] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-[#0a0e27]/[0.06] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 flex space-x-4 items-center border-b border-white/[0.05] pb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {getUserInitials(user)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {getUserDisplayName(user)}
            </h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            WhatsApp Accounts ({user.whatsappAccounts?.length || 0})
          </h3>

          {!user.whatsappAccounts || user.whatsappAccounts.length === 0 ? (
            <div className="text-center py-8 bg-[#0a0e27]/50 rounded-lg">
              <p className="text-gray-400">
                No WhatsApp accounts connected
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {user.whatsappAccounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 bg-[#0a0e27] rounded-lg border border-white/[0.1]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white">
                          {account.verifiedName || 'Unnamed Account'}
                        </h4>
                        {account.isDefault && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400">
                        {account.displayPhoneNumber}
                      </p>
                    </div>

                    <WhatsAppConnectionBadge
                      type={account.connectionType}
                      status={account.status}
                      showRecommended={true}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/[0.08]">
                    <div>
                      <p className="text-xs text-gray-400">Quality Rating</p>
                      <p className="text-sm font-medium text-white">
                        {account.qualityRating || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Phone Number ID</p>
                      <p className="text-sm font-mono text-white">
                        {account.phoneNumberId.slice(0, 12)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-600 dark:text-green-400 mb-1">Cloud API</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {user.whatsappSummary?.cloudApiAccounts || 0}
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Business App</p>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                {user.whatsappSummary?.businessAppAccounts || 0}
              </p>
            </div>
            
            <div className="p-3 bg-[#0a0e27] rounded-lg border border-white/[0.1]">
              <p className="text-xs text-gray-400 mb-1">Active</p>
              <p className="text-xl font-bold text-gray-300">
                {user.whatsappSummary?.activeAccounts || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PASSWORD MANAGEMENT MODAL
// ============================================
interface PasswordModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onUpdate: (userId: string, newPassword: string, logoutDevices: boolean) => Promise<void>;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, user, onClose, onUpdate }) => {
  const [newPassword, setNewPassword] = useState('');
  const [logoutDevices, setLogoutDevices] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(user.id, newPassword, logoutDevices);
      setNewPassword('');
      setLogoutDevices(true);
      onClose();
    } catch (error) {
      // toast handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[#0a0e27] rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary-500" />
          Manage Password
        </h2>
        
        <p className="text-gray-400 text-sm mb-6">
          Set a new password for <strong>{user.email}</strong>.
        </p>

        <div className="space-y-4">
          {user.password && (
            <div className="p-3 bg-[#0a0e27] rounded-lg border border-white/[0.08]">
              <p className="text-xs text-gray-500 mb-1">Current Password Hash (Database):</p>
              <p className="text-xs font-mono text-gray-400 break-all bg-[#0a0e27] p-2 rounded">
                {user.password}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 bg-[#0a0e27] border border-white/[0.1] rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-400"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Logout all devices beautiful toggle switch */}
            <div className="flex items-center space-x-3 bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl transition-all hover:bg-white/[0.04] mt-4">
              <label className="relative flex items-center cursor-pointer select-none w-full">
                <div className="flex-1 pr-2">
                  <div className="text-sm font-semibold text-white">Logout all active devices</div>
                  <div className="text-xs text-gray-500 mt-0.5">User will be prompted to log in again on all devices</div>
                </div>
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    id="logoutDevices"
                    checked={logoutDevices}
                    onChange={(e) => setLogoutDevices(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/[0.08] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-checked:after:bg-white peer-checked:after:border-transparent transition-all"></div>
                </div>
              </label>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 bg-[#0a0e27]/[0.04] rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !newPassword}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 transition-all font-medium"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const UserManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  const [detailsModalUser, setDetailsModalUser] = useState<User | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'activate' | 'delete';
    user: User | null;
  }>({
    isOpen: false,
    type: 'suspend',
    user: null
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
    hasOrganizations: boolean;
  }>({
    isOpen: false,
    user: null,
    hasOrganizations: false,
  });

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await admin.getUsers({
        search: search || undefined,
        page: pagination.page,
        limit: pagination.limit
      });

      const data = response.data?.data || response.data;
      const usersData: User[] = Array.isArray(data)
        ? data
        : (data?.users || data?.items || []);

      const total = response.data?.meta?.total || data?.total || usersData.length;
      const totalPages = response.data?.meta?.totalPages || Math.ceil(total / pagination.limit);

      setUsers(usersData);
      setPagination(prev => ({ ...prev, total, totalPages }));

    } catch (err: any) {
      console.error("❌ Fetch Users Failed:", err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [search, pagination.page, pagination.limit]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleAction = async () => {
    const { type, user } = confirmModal;
    if (!user) return;

    setActionLoading(user.id);

    try {
      switch (type) {
        case 'suspend':
          await admin.updateUserStatus(user.id, 'SUSPENDED');
          setUsers(prev => prev.map(u =>
            u.id === user.id ? { ...u, status: 'SUSPENDED' } : u
          ));
          toast.success(`${getUserDisplayName(user)} suspended`);
          break;

        case 'activate':
          await admin.updateUserStatus(user.id, 'ACTIVE');
          setUsers(prev => prev.map(u =>
            u.id === user.id ? { ...u, status: 'ACTIVE' } : u
          ));
          toast.success(`${getUserDisplayName(user)} activated`);
          break;

        case 'delete':
          await admin.deleteUser(user.id);
          setUsers(prev => prev.filter(u => u.id !== user.id));
          toast.success(`${getUserDisplayName(user)} deleted`);
          break;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${type} user`);
    } finally {
      setActionLoading(null);
      setConfirmModal({ isOpen: false, type: 'suspend', user: null });
    }
  };

  const handleDelete = async (user: User) => {
    try {
      const response = await admin.getUser(user.id);
      const userData = response.data?.data;
      const ownsOrgs = (userData?.organizations || []).length > 0;

      if (ownsOrgs) {
        setDeleteModal({ isOpen: true, user, hasOrganizations: true });
      } else {
        if (confirm(`Delete user ${user.email}?`)) {
          await admin.deleteUser(user.id);
          toast.success('User deleted');
          fetchUsers();
        }
      }
    } catch (error: any) {
      toast.error('Failed to verify user data');
    }
  };

  const handleForceDelete = async () => {
    const user = deleteModal.user;
    if (!user) return;
    try {
      await api.delete(`/admin/users/${user.id}?force=true`);
      toast.success('User deleted');
      setDeleteModal({ isOpen: false, user: null, hasOrganizations: false });
      fetchUsers();
    } catch (error: any) {
      toast.error('Delete failed');
    }
  };

  const handleUpdatePassword = async (userId: string, password: string, logoutDevices: boolean) => {
    try {
      await admin.updateUserPassword(userId, { password, logoutDevices });
      toast.success('Password updated');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update');
      throw error;
    }
  };

  const openConfirmModal = (type: 'suspend' | 'activate' | 'delete', user: User) => {
    setConfirmModal({ isOpen: true, type, user });
  };

  const getModalConfig = () => {
    const { type, user } = confirmModal;
    const userName = user ? getUserDisplayName(user) : '';

    switch (type) {
      case 'suspend':
        return {
          title: 'Suspend User',
          message: `Suspend ${userName}?`,
          confirmText: 'Suspend',
          confirmColor: 'bg-orange-500 hover:bg-orange-600'
        };
      case 'activate':
        return {
          title: 'Activate User',
          message: `Activate ${userName}?`,
          confirmText: 'Activate',
          confirmColor: 'bg-green-500 hover:bg-green-600'
        };
      case 'delete':
        return {
          title: 'Delete User',
          message: `Delete ${userName}?`,
          confirmText: 'Delete',
          confirmColor: 'bg-red-500 hover:bg-red-600'
        };
      default:
        return { title: 'Confirm', message: 'Proceed?', confirmText: 'Confirm', confirmColor: 'bg-primary-500' };
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        {...getModalConfig()}
        onConfirm={handleAction}
        onCancel={() => setConfirmModal({ isOpen: false, type: 'suspend', user: null })}
        loading={!!actionLoading}
      />

      <UserDetailsModal
        isOpen={!!detailsModalUser}
        user={detailsModalUser}
        onClose={() => setDetailsModalUser(null)}
      />

      <PasswordModal
        isOpen={!!passwordModalUser}
        user={passwordModalUser}
        onClose={() => setPasswordModalUser(null)}
        onUpdate={handleUpdatePassword}
      />

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0a0e27] rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">User Owns Organizations</h3>
            <p className="text-gray-400 mb-6 font-medium">
              This user owns organizations. Forced delete will remove all associated data.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleForceDelete}
                className="w-full p-4 border border-red-200 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-all"
              >
                Force Delete Everything
              </button>
              <button
                onClick={() => setDeleteModal({ isOpen: false, user: null, hasOrganizations: false })}
                className="w-full p-3 border border-white/[0.1] rounded-xl hover:bg-[#050816] font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total.toLocaleString()} users total</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-white/[0.1] rounded-xl"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <button onClick={fetchUsers} className="p-2.5 bg-[#0a0e27] border border-white/[0.1] rounded-xl hover:bg-[#050816]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-xl text-red-700 flex justify-between items-center border border-red-100 font-medium">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="w-5 h-5" /></button>
        </div>
      )}

      <div className="bg-[#0a0e27] border border-white/[0.1] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#050816] border-b border-white/[0.1]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#050816] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                        {getUserInitials(user)}
                      </div>
                      <div className="ml-3 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{getUserDisplayName(user)}</div>
                        <div className="text-sm text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => setDetailsModalUser(user)} className="p-2 text-gray-400 hover:text-primary-600"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setPasswordModalUser(user)} className="p-2 text-gray-400 hover:text-purple-600" title="Check/Manage Password"><Key className="w-4 h-4" /></button>
                      
                      {user.status === 'ACTIVE' ? (
                        <button 
                          onClick={() => openConfirmModal('suspend', user)}
                          className="p-2 text-gray-400 hover:text-orange-600"
                          title="Suspend User"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => openConfirmModal('activate', user)}
                          className="p-2 text-gray-400 hover:text-green-600"
                          title="Activate User"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}

                      <button onClick={() => handleDelete(user)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;