// src/hooks/useWhatsAppConnection.ts - FIXED VERSION
// ✅ FIX B1 + B2: Exported refreshAllWhatsAppConnections() so that after a successful
// Meta OAuth connect (in useMetaConnect.ts), ALL hook instances across the app
// can be told to re-fetch — instead of only the WhatsAppSettings component knowing
// about the new account. Previously, the global app state never updated after connect.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { whatsapp } from '../services/api';

export type WhatsAppAccountStatus = 'PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'BANNED';

export interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  displayName: string;
  status: WhatsAppAccountStatus;
  isDefault: boolean;
  wabaId: string;
  phoneNumberId: string;
  tokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UseWhatsAppConnectionReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  accounts: WhatsAppAccount[];
  defaultAccount: WhatsAppAccount | null;
  refresh: () => Promise<void>;
  disconnect: (accountId: string) => Promise<void>;
  setDefault: (accountId: string) => Promise<void>;
}

// ============================================
// ✅ GLOBAL REFRESH REGISTRY
// All mounted useWhatsAppConnection instances
// register their refresh functions here.
// refreshAllWhatsAppConnections() calls them all.
// ============================================
const refreshRegistry = new Set<() => Promise<void>>();

/**
 * Call this after a successful Meta OAuth connection to force
 * ALL mounted useWhatsAppConnection hooks to re-fetch accounts.
 * Import and call from useMetaConnect.ts after backend responds OK.
 */
export const refreshAllWhatsAppConnections = async (): Promise<void> => {
  console.log(`🔄 Global refresh: notifying ${refreshRegistry.size} hook instance(s)`);
  const promises = Array.from(refreshRegistry).map((fn) => fn().catch(() => { }));
  await Promise.all(promises);
};

export const useWhatsAppConnection = (): UseWhatsAppConnectionReturn => {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await whatsapp.accounts();
      setError(null);

      const data = res.data?.data || res.data;
      const list = (data?.accounts || (Array.isArray(data) ? data : [])) as any;
      setAccounts(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setAccounts([]);
      setError(e?.response?.data?.message || e?.message || null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Register this instance in the global registry
  useEffect(() => {
    refreshRegistry.add(fetchAccounts);
    return () => {
      refreshRegistry.delete(fetchAccounts);
    };
  }, [fetchAccounts]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const connectedAccounts = useMemo(
    () => accounts.filter((a) => a.status === 'CONNECTED'),
    [accounts]
  );

  const defaultAccount = useMemo(() => {
    return (
      connectedAccounts.find((a) => a.isDefault) ||
      connectedAccounts[0] ||
      null
    );
  }, [connectedAccounts]);

  const disconnect = useCallback(
    async (accountId: string) => {
      await whatsapp.disconnect(accountId);
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  const setDefault = useCallback(
    async (accountId: string) => {
      await whatsapp.setDefault(accountId);
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  return {
    isConnected: connectedAccounts.length > 0,
    isLoading,
    error,
    accounts,
    defaultAccount,
    refresh: fetchAccounts,
    disconnect,
    setDefault,
  };
};

export default useWhatsAppConnection;