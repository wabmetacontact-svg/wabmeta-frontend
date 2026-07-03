import { useCallback, useEffect, useMemo, useState } from 'react';
import { whatsapp } from '../services/api';

export type WhatsAppAccountStatus = 
  'PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'BANNED';

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

// ✅ FIX: Global refresh registry
// Ye ek shared Set hai jisme saare hooks apne
// refresh functions register karte hain.
// Jab koi bhi ek jagah se refreshAll() call kare,
// sabhi instances simultaneously refresh ho jaate hain.
type RefreshFn = () => Promise<void>;
const globalRefreshRegistry = new Set<RefreshFn>();

export const refreshAllWhatsAppConnections = async (): Promise<void> => {
  console.log(
    `🔄 Refreshing all WhatsApp connections 
     (${globalRefreshRegistry.size} instances)`
  );
  await Promise.allSettled(
    Array.from(globalRefreshRegistry).map((fn) => fn())
  );
};

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

export const useWhatsAppConnection = (): UseWhatsAppConnectionReturn => {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await whatsapp.accounts();
      setError(null);

      const data = res.data?.data || res.data;
      const list = (
        data?.accounts || 
        (Array.isArray(data) ? data : [])
      ) as WhatsAppAccount[];

      setAccounts(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setAccounts([]);
      setError(
        e?.response?.data?.message || 
        e?.message || 
        null
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ FIX: Global registry mein register karo
  useEffect(() => {
    globalRefreshRegistry.add(fetchAccounts);
    fetchAccounts(); // Initial load

    return () => {
      // Cleanup: unmount pe registry se remove karo
      globalRefreshRegistry.delete(fetchAccounts);
    };
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
      // ✅ Baaki saare instances bhi refresh karo
      await refreshAllWhatsAppConnections();
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