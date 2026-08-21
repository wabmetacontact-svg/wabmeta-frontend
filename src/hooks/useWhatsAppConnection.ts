// src/hooks/useWhatsAppConnection.ts
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

const refreshRegistry = new Set<() => Promise<void>>();

export const refreshAllWhatsAppConnections = async (): Promise<void> => {
  console.log(`🔄 Global refresh: notifying ${refreshRegistry.size} hook instance(s)`);
  const promises = Array.from(refreshRegistry).map((fn) => fn().catch(() => { }));
  await Promise.all(promises);
};

export const useWhatsAppConnection = (): UseWhatsAppConnectionReturn => {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (isMounted = { current: true }) => {
    try {
      if (isMounted.current) setIsLoading(true);
      const res = await whatsapp.accounts();

      if (!isMounted.current) return;
      setError(null);

      const data = res.data?.data || res.data;
      const list = (data?.accounts || (Array.isArray(data) ? data : [])) as any;
      setAccounts(Array.isArray(list) ? list : []);
    } catch (e: any) {
      if (!isMounted.current) return;
      setAccounts([]);
      setError(e?.response?.data?.message || e?.message || null);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const isMounted = { current: true };
    const boundFetch = () => fetchAccounts(isMounted);

    refreshRegistry.add(boundFetch);
    boundFetch();

    return () => {
      isMounted.current = false;
      refreshRegistry.delete(boundFetch);
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
    refresh: () => fetchAccounts(),
    disconnect,
    setDefault,
  };
};

export default useWhatsAppConnection;