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
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

const WalletManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'wallets'>('requests');
  const [loading, setLoading] = useState(false);

  // Requests state
  const [requests, setRequests] = useState<any[]>([]);
  const [reviewing, setReviewing] = useState<string | null>(null);

  // Wallets state
  const [wallets, setWallets] = useState<any[]>([]);
  const [adjustingWallet, setAdjustingWallet] = useState<string | null>(null);
  
  // Adjust modal state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustType, setAdjustType] = useState<'admin_credit' | 'admin_debit'>('admin_credit');

  // ── Toggle (activate/deactivate) modal state ──────────────────────────────
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<{ orgId: string; orgName: string; currentlyActive: boolean } | null>(null);
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

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setReviewing(requestId);
      await admin.reviewWalletRequest(requestId, { action, note: `Admin ${action}d` });
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
    setAdjustNote(type === 'admin_credit' 
      ? 'Credit by WabMeta' 
      : 'Debit by WabMeta');
  };

  const handleAdjustBalance = async () => {
    if (!adjustingWallet || !adjustAmount || Number(adjustAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    try {
      await admin.adjustWalletBalance(adjustingWallet, {
        type: adjustType,
        amount: Number(adjustAmount),
        note: adjustNote || `Manual ${adjustType === 'admin_credit' ? 'credit' : 'debit'} by admin`
      });
      toast.success('Balance adjusted successfully');
      setShowAdjustModal(false);
      fetchWallets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to adjust balance');
    }
  };

  // ── Open toggle modal ──────────────────────────────────────────────────────
  const openToggleModal = (orgId: string, orgName: string, currentlyActive: boolean) => {
    setToggleTarget({ orgId, orgName, currentlyActive });
    setToggleReason('');
    setShowToggleModal(true);
  };

  // ── Confirm toggle (activate / deactivate) ─────────────────────────────────
  const handleToggleWallet = async () => {
    if (!toggleTarget) return;
    const willActivate = !toggleTarget.currentlyActive;

    // Reason required only for deactivation
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
      toast.error(err.response?.data?.message || 'Failed to update wallet status');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
          <p className="text-gray-500">Manage organization wallets and access requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Access Requests
        </button>
        <button
          onClick={() => setActiveTab('wallets')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'wallets'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Active Wallets
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : activeTab === 'requests' ? (
          /* Requests Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-600">Organization</th>
                  <th className="px-6 py-4 font-medium text-gray-600">User</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Reason</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Status</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Date</th>
                  <th className="px-6 py-4 font-medium text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <CheckCircle className="w-12 h-12 text-gray-300 mb-3" />
                        <p>No wallet requests found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{req.organization?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{req.organization?.planType || 'FREE'}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{req.user?.email || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate" title={req.reason}>
                          {req.reason}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          req.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReview(req.id, 'approve')}
                              disabled={reviewing === req.id}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(req.id, 'reject')}
                              disabled={reviewing === req.id}
                              className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                            >
                              Reject
                            </button>
                          </>
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
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-600">Organization</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Balance</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Credit Limit</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Status</th>
                  <th className="px-6 py-4 font-medium text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wallets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Wallet className="w-12 h-12 text-gray-300 mb-3" />
                        <p>No wallets found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  wallets.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{w.organization?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{w.organization?.planType || 'FREE'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">{formatINR(w.balance * 100)}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {w.creditEnabled ? formatINR(w.creditLimit * 100) : 'Disabled'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            w.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {w.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {w.flagged && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Flagged
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Adjust Balance */}
                          <button
                            onClick={() => openAdjustModal(w.organizationId)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                          >
                            Adjust Balance
                          </button>

                          {/* Activate / Deactivate */}
                          {w.isActive ? (
                            <button
                              onClick={() => openToggleModal(w.organizationId, w.organization?.name || 'Unknown', true)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                              title="Deactivate wallet — this will sever the wallet link"
                            >
                              <PowerOff className="w-3.5 h-3.5" />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => openToggleModal(w.organizationId, w.organization?.name || 'Unknown', false)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors"
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

      {/* ── Adjust Balance Modal ───────────────────────────────────────────── */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Adjust Wallet Balance</h3>
                <p className="text-sm text-gray-500 mt-1">Add or remove funds manually</p>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('admin_credit')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl border ${
                      adjustType === 'admin_credit' 
                        ? 'border-green-500 bg-green-50 text-green-700 font-semibold' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Credit (Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('admin_debit')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl border ${
                      adjustType === 'admin_debit' 
                        ? 'border-red-500 bg-red-50 text-red-700 font-semibold' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Debit (Remove)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter amount in Rupees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note *</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={
                    adjustType === 'admin_credit'
                      ? 'Credit by WabMeta'
                      : 'Debit by WabMeta'
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will appear in user's transaction history
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustBalance}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm"
              >
                Confirm Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Activate / Deactivate Confirmation Modal ───────────────────────── */}
      {showToggleModal && toggleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${
              toggleTarget.currentlyActive ? 'bg-red-50' : 'bg-green-50'
            } rounded-t-2xl`}>
              <div className="flex items-center gap-3">
                {toggleTarget.currentlyActive ? (
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <PowerOff className="w-5 h-5 text-red-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Power className="w-5 h-5 text-green-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {toggleTarget.currentlyActive ? 'Deactivate Wallet' : 'Activate Wallet'}
                  </h3>
                  <p className="text-sm text-gray-500">{toggleTarget.orgName}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowToggleModal(false); setToggleTarget(null); }}
                className="p-1.5 hover:bg-white/60 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {toggleTarget.currentlyActive ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <p className="font-semibold mb-1">⚠️ This will deactivate the wallet.</p>
                  <ul className="list-disc list-inside space-y-1 text-red-600">
                    <li>The wallet link for <strong>{toggleTarget.orgName}</strong> will be severed</li>
                    <li>Organization will lose access to wallet features</li>
                    <li>Existing balance will be preserved (not deleted)</li>
                    <li>You can re-activate anytime</li>
                  </ul>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                  <p className="font-semibold mb-1">✅ This will re-activate the wallet.</p>
                  <p className="text-green-600">
                    <strong>{toggleTarget.orgName}</strong> will regain access to their wallet and existing balance.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason {toggleTarget.currentlyActive && <span className="text-red-500">*</span>}
                  {!toggleTarget.currentlyActive && <span className="text-gray-400 font-normal"> (Optional)</span>}
                </label>
                <textarea
                  value={toggleReason}
                  onChange={(e) => setToggleReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder={
                    toggleTarget.currentlyActive
                      ? 'Reason for deactivation (min 5 chars)...'
                      : 'Reason for re-activation (optional)...'
                  }
                  rows={2}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => { setShowToggleModal(false); setToggleTarget(null); }}
                disabled={toggling}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleWallet}
                disabled={toggling}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium shadow-sm text-white transition-colors ${
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
                  ? 'Deactivate Wallet'
                  : 'Activate Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;
