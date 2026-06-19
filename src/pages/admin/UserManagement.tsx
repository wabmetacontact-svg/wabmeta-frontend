// src/pages/admin/UserManagement.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Ban,
  Trash2,
  CheckCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  Users,
  UserX,
  Eye,
  X,
  Key,
  UserCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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

const safeString = (
  value: string | null | undefined,
  fallback: string = ''
): string => value ?? fallback;

const getUserDisplayName = (user: User): string => {
  const firstName = safeString(user.firstName);
  const lastName = safeString(user.lastName);
  if (firstName || lastName) return `${firstName} ${lastName}`.trim();
  return user.email?.split('@')[0] || 'Unknown User';
};

const getUserInitials = (user: User): string => {
  const firstName = safeString(user.firstName);
  const lastName = safeString(user.lastName);
  if (firstName && lastName)
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  if (firstName) return firstName.charAt(0).toUpperCase();
  return user.email?.charAt(0).toUpperCase() || 'U';
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

// ============================================
// STATUS BADGE
// ============================================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = (status || 'UNKNOWN').toUpperCase();
    switch (normalizedStatus) {
      case 'ACTIVE':
        return {
          bg: 'bg-green-500/10',
          text: 'text-green-400',
          border: 'border-green-500/20',
          icon: CheckCircle,
          label: 'Active',
        };
      case 'SUSPENDED':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          border: 'border-red-500/20',
          icon: Ban,
          label: 'Suspended',
        };
      case 'PENDING_VERIFICATION':
        return {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-400',
          border: 'border-yellow-500/20',
          icon: AlertCircle,
          label: 'Pending',
        };
      case 'INACTIVE':
        return {
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          border: 'border-gray-500/20',
          icon: UserX,
          label: 'Inactive',
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          border: 'border-gray-500/20',
          icon: Users,
          label: status || 'Unknown',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold
        rounded-full border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

// ============================================
// CONFIRMATION MODAL (Dark)
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
  isOpen,
  title,
  message,
  confirmText,
  confirmColor = 'bg-red-500 hover:bg-red-600',
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative bg-[#0a0e27] border border-white/[0.08]
        rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-300 bg-white/[0.04]
              hover:bg-white/[0.08] rounded-xl transition-colors
              disabled:opacity-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-xl transition-colors
              disabled:opacity-50 flex items-center gap-2 text-sm font-medium
              ${confirmColor}`}
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
// USER DETAILS MODAL (Dark)
// ============================================
interface UserDetailsModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  user,
  onClose,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-[#0a0e27] border border-white/[0.08]
        rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400
            hover:bg-white/[0.06] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 flex space-x-4 items-center border-b border-white/[0.06] pb-4">
          <div
            className="w-16 h-16 bg-gradient-to-br from-primary-400
              to-primary-600 rounded-full flex items-center justify-center
              text-white font-bold text-2xl"
          >
            {getUserInitials(user)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {getUserDisplayName(user)}
            </h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white">
            WhatsApp Accounts ({user.whatsappAccounts?.length || 0})
          </h3>

          {!user.whatsappAccounts || user.whatsappAccounts.length === 0 ? (
            <div className="text-center py-8 bg-[#050816] rounded-xl border border-white/[0.06]">
              <p className="text-sm text-gray-400">
                No WhatsApp accounts connected
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {user.whatsappAccounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 bg-[#050816] rounded-xl border border-white/[0.06]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white">
                          {account.verifiedName || 'Unnamed Account'}
                        </h4>
                        {account.isDefault && (
                          <span
                            className="text-xs bg-blue-500/10 text-blue-400
                              border border-blue-500/20 px-2 py-0.5 rounded-full"
                          >
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

                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/[0.06]">
                    <div>
                      <p className="text-xs text-gray-500">Quality Rating</p>
                      <p className="text-sm font-medium text-white">
                        {account.qualityRating || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone Number ID</p>
                      <p className="text-sm font-mono text-gray-300">
                        {account.phoneNumberId.slice(0, 12)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <p className="text-xs text-green-400 mb-1">Cloud API</p>
              <p className="text-xl font-bold text-green-300">
                {user.whatsappSummary?.cloudApiAccounts || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <p className="text-xs text-orange-400 mb-1">Business App</p>
              <p className="text-xl font-bold text-orange-300">
                {user.whatsappSummary?.businessAppAccounts || 0}
              </p>
            </div>
            <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
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
// PASSWORD MODAL (Dark)
// ============================================
interface PasswordModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onUpdate: (
    userId: string,
    newPassword: string,
    logoutDevices: boolean
  ) => Promise<void>;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdate,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logoutDevices, setLogoutDevices] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    setStrength(score);
  }, [newPassword]);

  const strengthConfig = [
    { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' },
    { label: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-400' },
    { label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
    { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-400' },
    {
      label: 'Very Strong',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
    },
  ];

  const currentStrength = strengthConfig[Math.min(strength, 4)];

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await onUpdate(user.id, newPassword, logoutDevices);
      setNewPassword('');
      setConfirmPassword('');
      setLogoutDevices(true);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNewPassword('');
      setConfirmPassword('');
      setLogoutDevices(true);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className="relative bg-[#0a0e27] border border-white/[0.08]
        rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#050816] border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  Change Password
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Admin override for user account
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 text-gray-400 hover:bg-white/[0.06] rounded-lg
                transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User info banner */}
        <div className="px-6 py-3 bg-blue-500/10 border-b border-blue-500/20 flex items-center gap-2">
          <div
            className="w-7 h-7 bg-blue-500 rounded-full flex items-center
              justify-center text-white text-xs font-bold shrink-0"
          >
            {getUserInitials(user)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {getUserDisplayName(user)}
            </p>
            <p className="text-xs text-blue-300 truncate">{user.email}</p>
          </div>
          <StatusBadge status={user.status} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 bg-[#050816]
                  border border-white/[0.08] rounded-xl text-sm text-white
                  placeholder:text-gray-500 focus:outline-none
                  focus:border-primary-500 transition-colors"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {newPassword.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i < strength ? currentStrength.color : 'bg-white/[0.1]'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${currentStrength.textColor}`}>
                  {currentStrength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full px-4 py-2.5 pr-10 bg-[#050816]
                  border rounded-xl text-sm text-white placeholder:text-gray-500
                  focus:outline-none transition-colors ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/[0.08] focus:border-primary-500'
                  }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Logout toggle */}
          <div className="bg-[#050816] border border-white/[0.06] p-3.5 rounded-xl">
            <label className="relative flex items-center cursor-pointer select-none w-full gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">
                  Logout all active devices
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  User will be prompted to log in again
                </div>
              </div>
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={logoutDevices}
                  onChange={(e) => setLogoutDevices(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className="w-11 h-6 bg-white/[0.1] rounded-full peer
                  peer-checked:bg-primary-600 transition-colors
                  after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                  after:bg-white after:rounded-full after:h-5 after:w-5
                  after:transition-all peer-checked:after:translate-x-5"
                />
              </div>
            </label>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-300 bg-white/[0.04]
                hover:bg-white/[0.08] rounded-xl transition-colors
                disabled:opacity-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading || !newPassword || newPassword !== confirmPassword
              }
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700
                text-white rounded-xl flex items-center gap-2
                disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// PAGINATION COMPONENT
// ============================================
interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
  loading,
}) => {
  const { page, limit, total, totalPages } = pagination;
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Generate page numbers to show (smart pagination)
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const showAround = 1; // show 1 page before/after current

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (page > 3) pages.push('...');

      const startPage = Math.max(2, page - showAround);
      const endPage = Math.min(totalPages - 1, page + showAround);

      for (let i = startPage; i <= endPage; i++) pages.push(i);

      if (page < totalPages - 2) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className="px-4 sm:px-6 py-3 border-t border-white/[0.06] bg-[#050816]
      flex flex-col sm:flex-row items-center justify-between gap-3"
    >
      {/* Info + Per page */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-gray-400">
        <p>
          Showing{' '}
          <span className="text-white font-medium">{start}</span>–
          <span className="text-white font-medium">{end}</span> of{' '}
          <span className="text-white font-medium">
            {total.toLocaleString()}
          </span>
        </p>

        <div className="flex items-center gap-2">
          <span>Per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={loading}
            className="bg-[#0a0e27] border border-white/[0.08] rounded-lg
              px-2 py-1 text-xs text-gray-300 focus:outline-none
              focus:border-primary-500 transition-colors disabled:opacity-50"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1 || loading}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-white/[0.06]
            hover:text-white disabled:opacity-30 disabled:cursor-not-allowed
            transition-all"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || loading}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-white/[0.06]
            hover:text-white disabled:opacity-30 disabled:cursor-not-allowed
            transition-all"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === 'string' ? (
              <span key={`dots-${idx}`} className="px-2 text-gray-500 text-xs">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={loading}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium
                  transition-all disabled:opacity-50
                  ${
                    p === page
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
                  }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || loading}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-white/[0.06]
            hover:text-white disabled:opacity-30 disabled:cursor-not-allowed
            transition-all"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages || loading}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-white/[0.06]
            hover:text-white disabled:opacity-30 disabled:cursor-not-allowed
            transition-all"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [detailsModalUser, setDetailsModalUser] = useState<User | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'activate' | 'delete';
    user: User | null;
  }>({ isOpen: false, type: 'suspend', user: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
    hasOrganizations: boolean;
  }>({ isOpen: false, user: null, hasOrganizations: false });

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await admin.getUsers({
        search: search || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      const data = response.data?.data || response.data;
      const usersData: User[] = Array.isArray(data)
        ? data
        : data?.users || data?.items || [];

      const total =
        response.data?.meta?.total || data?.total || usersData.length;
      const totalPages =
        response.data?.meta?.totalPages || Math.ceil(total / pagination.limit);

      setUsers(usersData);
      setPagination((prev) => ({ ...prev, total, totalPages }));
    } catch (err: any) {
      console.error('❌ Fetch Users Failed:', err);
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

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleAction = async () => {
    const { type, user } = confirmModal;
    if (!user) return;
    setActionLoading(user.id);
    try {
      switch (type) {
        case 'suspend':
          await admin.updateUserStatus(user.id, 'SUSPENDED');
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id ? { ...u, status: 'SUSPENDED' } : u
            )
          );
          toast.success(`${getUserDisplayName(user)} suspended`);
          break;
        case 'activate':
          await admin.updateUserStatus(user.id, 'ACTIVE');
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id ? { ...u, status: 'ACTIVE' } : u
            )
          );
          toast.success(`${getUserDisplayName(user)} activated`);
          break;
        case 'delete':
          await admin.deleteUser(user.id);
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
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
        openConfirmModal('delete', user);
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

  const handleUpdatePassword = async (
    userId: string,
    password: string,
    logoutDevices: boolean
  ) => {
    try {
      await admin.updateUserPassword(userId, { password, logoutDevices });
      toast.success('Password updated');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update');
      throw error;
    }
  };

  const openConfirmModal = (
    type: 'suspend' | 'activate' | 'delete',
    user: User
  ) => {
    setConfirmModal({ isOpen: true, type, user });
  };

  const getModalConfig = () => {
    const { type, user } = confirmModal;
    const userName = user ? getUserDisplayName(user) : '';
    switch (type) {
      case 'suspend':
        return {
          title: 'Suspend User',
          message: `Are you sure you want to suspend ${userName}?`,
          confirmText: 'Suspend',
          confirmColor: 'bg-orange-500 hover:bg-orange-600',
        };
      case 'activate':
        return {
          title: 'Activate User',
          message: `Are you sure you want to activate ${userName}?`,
          confirmText: 'Activate',
          confirmColor: 'bg-green-500 hover:bg-green-600',
        };
      case 'delete':
        return {
          title: 'Delete User',
          message: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
          confirmText: 'Delete',
          confirmColor: 'bg-red-500 hover:bg-red-600',
        };
      default:
        return {
          title: 'Confirm',
          message: 'Proceed?',
          confirmText: 'Confirm',
          confirmColor: 'bg-primary-500',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        {...getModalConfig()}
        onConfirm={handleAction}
        onCancel={() =>
          setConfirmModal({ isOpen: false, type: 'suspend', user: null })
        }
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

      {/* Force Delete Modal (Dark) */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() =>
              setDeleteModal({
                isOpen: false,
                user: null,
                hasOrganizations: false,
              })
            }
          />
          <div
            className="relative bg-[#0a0e27] border border-white/[0.08]
            rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  User Owns Organizations
                </h3>
                <p className="text-sm text-gray-400">
                  This user owns organizations. Force delete will permanently
                  remove all associated data including campaigns, contacts, and
                  templates.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleForceDelete}
                className="w-full p-3 bg-red-500/10 hover:bg-red-500/20
                  border border-red-500/30 text-red-400 rounded-xl
                  font-semibold transition-all text-sm"
              >
                Force Delete Everything
              </button>
              <button
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    user: null,
                    hasOrganizations: false,
                  })
                }
                className="w-full p-3 bg-white/[0.04] hover:bg-white/[0.08]
                  border border-white/[0.08] text-gray-300 rounded-xl
                  font-medium transition-all text-sm"
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
          <p className="text-sm text-gray-400 mt-1">
            <span className="text-white font-medium">
              {pagination.total.toLocaleString()}
            </span>{' '}
            users total
          </p>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-[#0a0e27]
                border border-white/[0.08] rounded-xl text-sm text-white
                placeholder:text-gray-500 focus:outline-none
                focus:border-primary-500 transition-colors"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 bg-[#0a0e27] border border-white/[0.08]
              hover:border-white/[0.15] hover:bg-white/[0.02] rounded-xl
              transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-400 ${
                loading ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl
          text-red-400 flex justify-between items-center text-sm font-medium"
        >
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#0a0e27] border border-white/[0.08] rounded-2xl overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400 mb-3" />
            <p className="text-sm text-gray-400">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-16 h-16 mx-auto mb-4 bg-white/[0.03] rounded-2xl
              flex items-center justify-center border border-white/[0.06]"
            >
              <Users className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">
              {search
                ? 'No users match your search'
                : 'No users found'}
            </p>
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="mt-3 text-sm text-primary-400 hover:text-primary-300"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#050816] border-b border-white/[0.06]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className="w-10 h-10 bg-gradient-to-br from-primary-400
                              to-primary-600 rounded-full flex items-center
                              justify-center text-white font-bold shrink-0"
                          >
                            {getUserInitials(user)}
                          </div>
                          <div className="ml-3 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">
                              {getUserDisplayName(user)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailsModalUser(user)}
                            className="p-2 text-gray-400 hover:text-primary-400
                              hover:bg-primary-500/10 rounded-lg transition-all"
                            title="Quick View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/manage-wabmeta-admin/users/${user.id}`
                              )
                            }
                            className="p-2 text-gray-400 hover:text-blue-400
                              hover:bg-blue-500/10 rounded-lg transition-all"
                            title="View Full Details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPasswordModalUser(user)}
                            className="p-2 text-gray-400 hover:text-purple-400
                              hover:bg-purple-500/10 rounded-lg transition-all"
                            title="Manage Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => openConfirmModal('suspend', user)}
                              className="p-2 text-gray-400 hover:text-orange-400
                                hover:bg-orange-500/10 rounded-lg transition-all"
                              title="Suspend User"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openConfirmModal('activate', user)}
                              className="p-2 text-gray-400 hover:text-green-400
                                hover:bg-green-500/10 rounded-lg transition-all"
                              title="Activate User"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-gray-400 hover:text-red-400
                              hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete User"
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

            {/* ✅ PAGINATION */}
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              loading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;