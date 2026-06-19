import { useEffect, useState } from 'react';
import {
  Phone,
  Trash2,
  CheckCircle,
  XCircle,
  Building2,
  RefreshCw,
  Loader2,
  Search,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';
import WhatsAppConnectionBadge from '../../components/admin/WhatsAppConnectionBadge';

// ============================================
// TYPES
// ============================================

interface Connection {
  id: string;
  phoneNumber: string;
  displayName: string;
  verifiedName: string;
  qualityRating: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  connectionType?: string;
  organization: {
    id: string;
    name: string;
    owner: {
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

// ============================================
// CONFIRM MODAL
// ============================================

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
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
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-12 h-12 bg-red-500/10 border border-red-500/20
            rounded-xl flex items-center justify-center shrink-0"
          >
            <WifiOff className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400">{message}</p>
          </div>
        </div>

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
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white
              rounded-xl transition-colors disabled:opacity-50
              flex items-center gap-2 text-sm font-medium"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// QUALITY BADGE
// ============================================

const QualityBadge: React.FC<{ rating: string }> = ({ rating }) => {
  const config: Record<string, { bg: string; text: string; border: string }> = {
    GREEN: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
    },
    YELLOW: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
    },
    RED: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/20',
    },
    UNKNOWN: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-400',
      border: 'border-gray-500/20',
    },
  };

  const cfg = config[rating?.toUpperCase()] || config.UNKNOWN;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold
        rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {rating || 'UNKNOWN'}
    </span>
  );
};

// ============================================
// STATUS INDICATOR
// ============================================

const StatusIndicator: React.FC<{ isActive: boolean; status: string }> = ({
  isActive,
  status,
}) => {
  const active = status === 'CONNECTED' && isActive;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        <div
          className={`w-2 h-2 rounded-full ${
            active ? 'bg-green-400' : 'bg-red-400'
          }`}
        />
        {active && (
          <div className="absolute w-2 h-2 rounded-full bg-green-400 animate-ping opacity-75" />
        )}
      </div>
      <span
        className={`text-sm font-medium ${
          active ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {active ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function WhatsAppConnections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    connection: Connection | null;
  }>({ isOpen: false, connection: null });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const { data } = await admin.getWhatsAppConnections();
      setConnections(data.data || data);
    } catch (error) {
      toast.error('Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectClick = (connection: Connection) => {
    setConfirmModal({ isOpen: true, connection });
  };

  const handleDisconnect = async () => {
    if (!confirmModal.connection) return;

    setDisconnecting(true);
    try {
      await admin.disconnectWhatsApp(confirmModal.connection.id);
      toast.success('Account disconnected successfully');
      setConfirmModal({ isOpen: false, connection: null });
      fetchConnections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  };

  // Filter connections by search
  const filteredConnections = connections.filter((conn) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      conn.organization?.name?.toLowerCase().includes(q) ||
      conn.organization?.owner?.email?.toLowerCase().includes(q) ||
      conn.phoneNumber?.toLowerCase().includes(q) ||
      conn.displayName?.toLowerCase().includes(q) ||
      conn.verifiedName?.toLowerCase().includes(q)
    );
  });

  // Stats
  const activeCount = connections.filter(
    (c) => c.status === 'CONNECTED' && c.isActive
  ).length;
  const inactiveCount = connections.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Disconnect WhatsApp Account"
        message={`Are you sure you want to disconnect WhatsApp for "${confirmModal.connection?.organization.name}"? This action will preserve data but the account won't be able to send/receive messages.`}
        onConfirm={handleDisconnect}
        onCancel={() => setConfirmModal({ isOpen: false, connection: null })}
        loading={disconnecting}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            WhatsApp Connections
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage all connected WhatsApp accounts across organizations
          </p>
        </div>

        <button
          onClick={fetchConnections}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0e27]
            border border-white/[0.08] hover:border-white/[0.15]
            hover:bg-white/[0.02] text-gray-300 rounded-xl
            transition-all disabled:opacity-50 text-sm font-medium"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="bg-[#0a0e27] border border-white/[0.08]
          rounded-2xl p-5 hover:border-white/[0.12] transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Total Connections
            </p>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Phone className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {connections.length}
          </p>
        </div>

        <div
          className="bg-[#0a0e27] border border-white/[0.08]
          rounded-2xl p-5 hover:border-white/[0.12] transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Active
            </p>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Wifi className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-400">{activeCount}</p>
        </div>

        <div
          className="bg-[#0a0e27] border border-white/[0.08]
          rounded-2xl p-5 hover:border-white/[0.12] transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Inactive
            </p>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <WifiOff className="w-4 h-4 text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-400">{inactiveCount}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by organization, email, phone, or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#0a0e27] border border-white/[0.08]
            rounded-xl text-sm text-white placeholder:text-gray-500
            focus:outline-none focus:border-primary-500
            transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0a0e27] border border-white/[0.08] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400 mb-3" />
            <p className="text-sm text-gray-400">Loading connections...</p>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-16 h-16 mx-auto mb-4 bg-white/[0.03] rounded-2xl
              flex items-center justify-center border border-white/[0.06]"
            >
              <Phone className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">
              {search
                ? 'No connections match your search'
                : 'No WhatsApp connections found'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-3 text-sm text-primary-400 hover:text-primary-300"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#050816] border-b border-white/[0.06]">
                <tr>
                  {[
                    'Organization',
                    'Phone',
                    'Quality',
                    'Type',
                    'Status',
                    'Actions',
                  ].map((header, idx) => (
                    <th
                      key={header}
                      className={`px-6 py-4 text-xs font-semibold text-gray-500
                        uppercase tracking-wider ${
                          idx === 5 ? 'text-right' : 'text-left'
                        }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredConnections.map((conn) => (
                  <tr
                    key={conn.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Organization */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 bg-gradient-to-br from-blue-500
                            to-blue-700 rounded-xl flex items-center
                            justify-center shrink-0"
                        >
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">
                            {conn.organization?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conn.organization?.owner?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="font-mono font-medium text-white text-sm">
                          {conn.phoneNumber}
                        </span>
                      </div>
                      {(conn.verifiedName || conn.displayName) && (
                        <p className="text-xs text-gray-500 mt-1 ml-5">
                          {conn.verifiedName || conn.displayName}
                        </p>
                      )}
                    </td>

                    {/* Quality */}
                    <td className="px-6 py-4">
                      <QualityBadge rating={conn.qualityRating} />
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <WhatsAppConnectionBadge
                        type={(conn.connectionType as any) || 'CLOUD_API'}
                        status={
                          conn.status === 'CONNECTED' && conn.isActive
                            ? 'active'
                            : 'inactive'
                        }
                      />
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusIndicator
                        isActive={conn.isActive}
                        status={conn.status}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {conn.isActive ? (
                        <button
                          onClick={() => handleDisconnectClick(conn)}
                          className="p-2 text-gray-400 hover:text-red-400
                            hover:bg-red-500/10 rounded-lg transition-all"
                          title="Disconnect"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        {!loading && filteredConnections.length > 0 && (
          <div
            className="px-6 py-3 border-t border-white/[0.06] bg-[#050816]
            flex items-center justify-between"
          >
            <p className="text-xs text-gray-500">
              Showing{' '}
              <span className="text-gray-300 font-medium">
                {filteredConnections.length}
              </span>{' '}
              of{' '}
              <span className="text-gray-300 font-medium">
                {connections.length}
              </span>{' '}
              connections
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                Clear filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
