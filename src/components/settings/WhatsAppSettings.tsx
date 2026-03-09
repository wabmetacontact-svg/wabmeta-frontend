import { useState, useEffect } from 'react';
import {
    Phone,
    CheckCircle,
    Trash2,
    Loader2,
    Star,
    Cloud,
    Plus
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface WhatsAppAccount {
    id: string;
    phoneNumber: string;
    displayName: string;
    verifiedName: string;
    qualityRating: string;
    status: string;
    connectionType: 'CLOUD_API' | 'WHATSAPP_BUSINESS_APP';
    isDefault: boolean;
    createdAt: string;
}

export default function WhatsAppSettings() {
    const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const { data } = await api.get('/meta/accounts');
            setAccounts(data.data || []);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        setConnecting(true);

        try {
            // Get OAuth URL - always Cloud API
            const { data } = await api.get('/meta/oauth-url', {
                params: { connectionType: 'CLOUD_API' }
            });

            // Store connection type for callback
            localStorage.setItem('wabmeta_connection_type', 'CLOUD_API');

            // Redirect to OAuth
            window.location.href = data.data.url;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to start connection');
            setConnecting(false);
        }
    };

    const handleDisconnect = async (accountId: string) => {
        if (!confirm('Are you sure you want to disconnect this account?')) return;

        try {
            await api.post(`/meta/accounts/${accountId}/disconnect`);
            toast.success('Account disconnected');
            fetchAccounts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to disconnect');
        }
    };

    const handleSetDefault = async (accountId: string) => {
        try {
            await api.post(`/meta/accounts/${accountId}/set-default`);
            toast.success('Default account updated');
            fetchAccounts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to set default');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    const connectedAccounts = accounts.filter(a => a.status === 'CONNECTED');
    const hasConnectedAccount = connectedAccounts.length > 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">WhatsApp Connection</h2>
                <p className="text-gray-500 mt-1">Connect your WhatsApp Business account via Meta</p>
            </div>

            {/* ✅ Single Connect with Meta Option */}
            <div className={`p-6 rounded-2xl border-2 transition-all ${hasConnectedAccount
                ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                            <Cloud className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Connect with Meta</h3>
                            <p className="text-sm text-gray-500">WhatsApp Business Cloud API via Meta</p>
                        </div>
                    </div>
                    {hasConnectedAccount && (
                        <span className="px-2.5 py-1 bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs font-semibold rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Connected
                        </span>
                    )}
                </div>

                {hasConnectedAccount ? (
                    <div className="space-y-4">
                        {/* Show all connected accounts */}
                        {connectedAccounts.map((account) => (
                            <div
                                key={account.id}
                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-green-600" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-semibold text-gray-900 dark:text-white">
                                                {account.phoneNumber}
                                            </span>
                                            {account.isDefault && (
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            )}
                                            {account.isDefault && (
                                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {account.displayName || account.verifiedName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${account.qualityRating === 'GREEN'
                                        ? 'bg-green-100 text-green-700'
                                        : account.qualityRating === 'YELLOW'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {account.qualityRating}
                                    </span>
                                    {!account.isDefault && connectedAccounts.length > 1 && (
                                        <button
                                            onClick={() => handleSetDefault(account.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 text-sm"
                                        >
                                            <Star className="w-3.5 h-3.5" />
                                            Set Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDisconnect(account.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-sm"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-500 mb-4">
                            Connect your WhatsApp Business account through Meta's official Cloud API for high-volume messaging with advanced features.
                        </p>
                        <button
                            onClick={handleConnect}
                            disabled={connecting}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold transition-colors"
                        >
                            {connecting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Plus className="w-5 h-5" />
                            )}
                            Connect with Meta
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}