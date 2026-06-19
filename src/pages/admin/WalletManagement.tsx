import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import {
  Wallet,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PowerOff,
  Power,
  X,
  Building2,
  RefreshCw,
  Clock,
  IndianRupee,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

// ============================================
// STATUS BADGE
// ============================================

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { bg: string; text: string; border: string }> = {
    PENDING: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
    },
    APPROVED: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
    },
    REJECTED: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/20',
    },
    ACTIVE: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
    },
    INACTIVE: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-400',
      border: 'border-gray-500/20',
    },
    FLAGGED: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      border: 'border-orange-500/20',
    },
  };

  const cfg = config[status.toUpperCase()] || config.INACTIVE;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold
        rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {status.toUpperCase()}
    </span>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const WalletManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'wallets'>('requests');
  const [loading, setLoading] = useState(false);

  // Requests state
  const [requests, setRequests] = useState<any[]>([]);
  const [reviewing, setReviewing] = useState<string | null>(null);

  // Wallets state
  const [wallets, setWallets] = useState<any[]>([]);

  // Adjust modal state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingWallet, setAdjustingWallet] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustType, setAdjustType] = useState<'admin_credit' | 'admin_debit'>(
    'admin_credit'
  );
  const [adjusting, setAdjusting] = useState(false);

  // Toggle modal state
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<{
    orgId: string;
    orgName: string;
    currentlyActive: boolean;
  } | null>(null);
  const [toggleReason, setToggleReason] = useState('');
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else {
      fetchWallets();
    }
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await admin.getWalletRequests({ limit: 50 });
      setRequests(res.data?.data?.requests || []);
    } catch (err) {
      toast.error('Failed to load wallet requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await admin.getAllWallets({ limit: 50 });
      setWallets(res.data?.data?.wallets || []);
    } catch (err) {
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (
    requestId: string,
    action: 'approve' | 'reject'
  ) => {
    try {
      setReviewing(requestId);
      await admin.reviewWalletRequest(requestId, {
        action,
        note: `Admin ${action}d`,
      });
      toast.success(`Request ${action}d successfully`);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setReviewing(null);
    }
  };

  const openAdjustModal = (orgId: string) => {
    setAdjustingWallet(orgId);
    setAdjustAmount('');
    setAdjustNote('Credit by WabMeta');
    setAdjustType('admin_credit');
    setShowAdjustModal(true);
  };

  const handleTypeChange = (type: 'admin_credit' | 'admin_debit') => {
    setAdjustType(type);
    setAdjustNote(
      type === 'admin_credit' ? 'Credit by WabMeta' : 'Debit by WabMeta'
    );
  };

  const handleAdjustBalance = async () => {
    if (!adjustingWallet || !adjustAmount || Number(adjustAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setAdjusting(true);
      await admin.adjustWalletBalance(adjustingWallet, {
        type: adjustType,
        amount: Number(adjustAmount),
        note:
          adjustNote ||
          `Manual ${
            adjustType === 'admin_credit' ? 'credit' : 'debit'
          } by admin`,
      });
      toast.success('Balance adjusted successfully');
      setShowAdjustModal(false);
      fetchWallets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to adjust balance');
    } finally {
      setAdjusting(false);
    }
  };

  const openToggleModal = (
    orgId: string,
    orgName: string,
    currentlyActive: boolean
  ) => {
    setToggleTarget({ orgId, orgName, currentlyActive });
    setToggleReason('');
    setShowToggleModal(true);
  };

  const handleToggleWallet = async () => {
    if (!toggleTarget) return;
    const willActivate = !toggleTarget.currentlyActive;

    if (!willActivate && toggleReason.trim().length < 5) {
      toast.error('Please provide a reason for deactivation (min 5 chars)');
      return;
    }

    try {
      setToggling(true);
      await admin.toggleWalletActive(toggleTarget.orgId, {
        activate: willActivate,
        reason: toggleReason.trim() || undefined,
      });
      toast.success(
        willActivate
          ? `Wallet activated for ${toggleTarget.orgName}`
          : `Wallet deactivated for ${toggleTarget.orgName}`
      );
      setShowToggleModal(false);
      setToggleTarget(null);
      fetchWallets();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to update wallet status'
      );
    } finally {
      setToggling(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'requests') fetchRequests();
    else fetchWallets();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet Management</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage organization wallets and access requests
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0e27]
            border border-white/[0.08] hover:border-white/[0.15]
            hover:bg-white/[0.02] text-gray-300 rounded-xl
            transition-all disabled:opacity-50 text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/[0.06]">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'requests'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Access Requests
          </button>
          <button
            onClick={() => setActiveTab('wallets')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'wallets'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Active Wallets
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : activeTab === 'requests' ? (
          /* Requests Table */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#050816] border-b border-white/[0.06]">
                <tr>
                  {[
                    'Organization',
                    'User',
                    'Reason',
                    'Status',
                    'Date',
                    'Actions',
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-3 text-xs font-semibold text-gray-500
                        uppercase tracking-wider ${
                          i === 5 ? 'text-right' : 'text-left'
                        }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div
                        className="w-16 h-16 mx-auto mb-3 bg-white/[0.03] rounded-2xl
                        flex items-center justify-center border border-white/[0.06]"
                      >
                        <CheckCircle className="w-7 h-7 text-gray-600" />
                      </div>
                      <p className="text-gray-400 font-medium">
                        No wallet requests found
                      </p>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 bg-gradient-to-br from-blue-500
                              to-blue-700 rounded-lg flex items-center
                              justify-center shrink-0"
                          >
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-sm truncate">
                              {req.organization?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {req.organization?.planType || 'FREE'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {req.user?.email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className="text-sm text-gray-400 max-w-xs truncate"
                          title={req.reason}
                        >
                          {req.reason}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(req.requestedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReview(req.id, 'approve')}
                              disabled={reviewing === req.id}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700
                                text-white rounded-lg text-xs font-semibold
                                transition-colors disabled:opacity-50
                                flex items-center gap-1"
                            >
                              {reviewing === req.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(req.id, 'reject')}
                              disabled={reviewing === req.id}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20
                                text-red-400 border border-red-500/20 rounded-lg
                                text-xs font-semibold transition-colors
                                disabled:opacity-50 flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Wallets Table */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#050816] border-b border-white/[0.06]">
                <tr>
                  {[
                    'Organization',
                    'Balance',
                    'Credit Limit',
                    'Status',
                    'Actions',
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-3 text-xs font-semibold text-gray-500
                        uppercase tracking-wider ${
                          i === 4 ? 'text-right' : 'text-left'
                        }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {wallets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div
                        className="w-16 h-16 mx-auto mb-3 bg-white/[0.03] rounded-2xl
                        flex items-center justify-center border border-white/[0.06]"
                      >
                        <Wallet className="w-7 h-7 text-gray-600" />
                      </div>
                      <p className="text-gray-400 font-medium">
                        No wallets found
                      </p>
                    </td>
                  </tr>
                ) : (
                  wallets.map((w) => (
                    <tr
                      key={w.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 bg-gradient-to-br from-green-500
                              to-emerald-700 rounded-lg flex items-center
                              justify-center shrink-0"
                          >
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {w.organization?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {w.organization?.planType || 'FREE'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-green-400" />
                          <span className="font-bold text-white text-base">
                            {formatINR(w.balance * 100).replace('₹', '')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {w.creditEnabled ? (
                          <span className="text-blue-400 font-medium">
                            {formatINR(w.creditLimit * 100)}
                          </span>
                        ) : (
                          <span className="text-gray-600">Disabled</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <StatusBadge
                            status={w.isActive ? 'ACTIVE' : 'INACTIVE'}
                          />
                          {w.flagged && (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-semibold
                                bg-orange-500/10 text-orange-400 border border-orange-500/20
                                flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Flagged
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openAdjustModal(w.organizationId)}
                            className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20
                              text-blue-400 border border-blue-500/20 rounded-lg
                              text-xs font-semibold transition-colors"
                          >
                            Adjust Balance
                          </button>

                          {w.isActive ? (
                            <button
                              onClick={() =>
                                openToggleModal(
                                  w.organizationId,
                                  w.organization?.name || 'Unknown',
                                  true
                                )
                              }
                              className="flex items-center gap-1 px-3 py-1.5
                                bg-red-500/10 hover:bg-red-500/20 text-red-400
                                border border-red-500/20 rounded-lg text-xs
                                font-semibold transition-colors"
                              title="Deactivate wallet"
                            >
                              <PowerOff className="w-3.5 h-3.5" />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                openToggleModal(
                                  w.organizationId,
                                  w.organization?.name || 'Unknown',
                                  false
                                )
                              }
                              className="flex items-center gap-1 px-3 py-1.5
                                bg-green-500/10 hover:bg-green-500/20 text-green-400
                                border border-green-500/20 rounded-lg text-xs
                                font-semibold transition-colors"
                              title="Re-activate wallet"
                            >
                              <Power className="w-3.5 h-3.5" />
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ──────────────────── ADJUST BALANCE MODAL ──────────────────── */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAdjustModal(false)}
          />
          <div
            className="relative bg-[#0a0e27] border border-white/[0.08]
            rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Adjust Wallet Balance
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add or remove funds manually
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-2 text-gray-400 hover:bg-white/[0.06] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Action Type */}
              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                  Action Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('admin_credit')}
                    className={`flex items-center justify-center gap-2 py-2.5
                      rounded-xl border transition-all text-sm font-semibold ${
                        adjustType === 'admin_credit'
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-white/[0.08] bg-[#050816] text-gray-400 hover:border-white/[0.15]'
                      }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Credit (Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('admin_debit')}
                    className={`flex items-center justify-center gap-2 py-2.5
                      rounded-xl border transition-all text-sm font-semibold ${
                        adjustType === 'admin_debit'
                          ? 'border-red-500 bg-red-500/10 text-red-400'
                          : 'border-white/[0.08] bg-[#050816] text-gray-400 hover:border-white/[0.15]'
                      }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Debit (Remove)
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                  Amount (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#050816]
                      border border-white/[0.08] rounded-xl text-sm text-white
                      placeholder:text-gray-500 focus:outline-none
                      focus:border-primary-500 transition-colors"
                    placeholder="Enter amount in Rupees"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                  Admin Note <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#050816]
                    border border-white/[0.08] rounded-xl text-sm text-white
                    placeholder:text-gray-500 focus:outline-none
                    focus:border-primary-500 transition-colors"
                  placeholder={
                    adjustType === 'admin_credit'
                      ? 'Credit by WabMeta'
                      : 'Debit by WabMeta'
                  }
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  This will appear in user's transaction history
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] bg-[#050816] flex justify-end gap-3">
              <button
                onClick={() => setShowAdjustModal(false)}
                disabled={adjusting}
                className="px-4 py-2 text-gray-300 bg-white/[0.04]
                  hover:bg-white/[0.08] rounded-xl text-sm font-medium
                  transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustBalance}
                disabled={adjusting}
                className="flex items-center gap-2 px-5 py-2 bg-primary-600
                  hover:bg-primary-700 text-white rounded-xl text-sm font-medium
                  transition-colors disabled:opacity-50"
              >
                {adjusting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────── TOGGLE MODAL ──────────────────── */}
      {showToggleModal && toggleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setShowToggleModal(false);
              setToggleTarget(null);
            }}
          />
          <div
            className="relative bg-[#0a0e27] border border-white/[0.08]
            rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    toggleTarget.currentlyActive
                      ? 'bg-red-500/10 border-red-500/20'
                      : 'bg-green-500/10 border-green-500/20'
                  }`}
                >
                  {toggleTarget.currentlyActive ? (
                    <PowerOff className="w-5 h-5 text-red-400" />
                  ) : (
                    <Power className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white">
                    {toggleTarget.currentlyActive
                      ? 'Deactivate Wallet'
                      : 'Activate Wallet'}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {toggleTarget.orgName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowToggleModal(false);
                  setToggleTarget(null);
                }}
                className="p-2 text-gray-400 hover:bg-white/[0.06] rounded-lg transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {toggleTarget.currentlyActive ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm">
                  <p className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    This will deactivate the wallet
                  </p>
                  <ul className="space-y-1 text-red-300 text-xs ml-6 list-disc">
                    <li>
                      Wallet link for{' '}
                      <strong className="text-red-200">
                        {toggleTarget.orgName}
                      </strong>{' '}
                      will be severed
                    </li>
                    <li>Organization loses access to wallet features</li>
                    <li>Existing balance preserved (not deleted)</li>
                    <li>You can re-activate anytime</li>
                  </ul>
                </div>
              ) : (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-sm">
                  <p className="font-semibold text-green-400 mb-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    This will re-activate the wallet
                  </p>
                  <p className="text-green-300 text-xs ml-6">
                    <strong className="text-green-200">
                      {toggleTarget.orgName}
                    </strong>{' '}
                    will regain access to their wallet and existing balance.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                  Reason{' '}
                  {toggleTarget.currentlyActive ? (
                    <span className="text-red-400 normal-case">*</span>
                  ) : (
                    <span className="text-gray-600 normal-case">
                      (Optional)
                    </span>
                  )}
                </label>
                <textarea
                  value={toggleReason}
                  onChange={(e) => setToggleReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#050816]
                    border border-white/[0.08] rounded-xl text-sm text-white
                    placeholder:text-gray-500 focus:outline-none
                    focus:border-primary-500 transition-colors resize-none"
                  placeholder={
                    toggleTarget.currentlyActive
                      ? 'Reason for deactivation (min 5 chars)...'
                      : 'Reason for re-activation (optional)...'
                  }
                  rows={3}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] bg-[#050816] flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowToggleModal(false);
                  setToggleTarget(null);
                }}
                disabled={toggling}
                className="px-4 py-2 text-gray-300 bg-white/[0.04]
                  hover:bg-white/[0.08] rounded-xl text-sm font-medium
                  transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleWallet}
                disabled={toggling}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl
                  text-sm font-medium text-white transition-colors
                  disabled:opacity-50 ${
                    toggleTarget.currentlyActive
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                {toggling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : toggleTarget.currentlyActive ? (
                  <PowerOff className="w-4 h-4" />
                ) : (
                  <Power className="w-4 h-4" />
                )}
                {toggling
                  ? 'Processing...'
                  : toggleTarget.currentlyActive
                  ? 'Deactivate'
                  : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;
