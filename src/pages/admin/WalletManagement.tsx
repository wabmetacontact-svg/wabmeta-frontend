import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import { 
  Wallet, 
  CheckCircle, 
  Loader2, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
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
    setAdjustNote('');
    setAdjustType('admin_credit');
    setShowAdjustModal(true);
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
                        <p>No active wallets found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  wallets.map((wallet) => (
                    <tr key={wallet.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{wallet.organization?.name || 'Unknown'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">{formatINR(wallet.balance * 100)}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {wallet.creditEnabled ? formatINR(wallet.creditLimit * 100) : 'Disabled'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            wallet.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {wallet.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {wallet.flagged && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Flagged
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openAdjustModal(wallet.organizationId)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                        >
                          Adjust Balance
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Balance Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Adjust Wallet Balance</h3>
              <p className="text-sm text-gray-500 mt-1">Add or remove funds manually</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustType('admin_credit')}
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
                    onClick={() => setAdjustType('admin_debit')}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note (Optional)</label>
                <textarea
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Reason for adjustment..."
                  rows={2}
                />
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
    </div>
  );
};

export default WalletManagement;
