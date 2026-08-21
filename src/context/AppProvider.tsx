// src/context/AppProvider.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppContext } from './AppContext';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { inbox as inboxApi, contacts as contactsApi } from '../services/api';

// Safe token verification without thread stalling
const isTokenCurrentlyValid = (): boolean => {
  try {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('wabmeta_token');

    if (!token) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(
      decodeURIComponent(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );
    if (!payload.exp) return false;

    return payload.exp * 1000 > Date.now() + 30_000;
  } catch {
    return false;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const unreadConversations = useRef<Set<string>>(new Set());

  const isFetchingRef = useRef(false);
  const { socket } = useSocket();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let isMounted = true; // ✅ Prevents memory leak in recursive stack
    let activeTimer: NodeJS.Timeout | null = null;

    if (!isAuthenticated) {
      setUnreadCount(0);
      setTotalContacts(0);
      unreadConversations.current.clear();
      isFetchingRef.current = false;
      return;
    }

    if (isFetchingRef.current) return;

    const fetchWithRetry = async (attempt = 1): Promise<void> => {
      if (!isMounted) return;

      if (!isTokenCurrentlyValid()) {
        console.log(`⏳ [AppProvider] Token not ready (attempt ${attempt}), waiting...`);

        if (attempt <= 5) {
          const delay = Math.min(500 * Math.pow(2, attempt - 1), 8000);
          await new Promise<void>((resolve) => {
            if (isMounted) activeTimer = setTimeout(resolve, delay);
          });
          return fetchWithRetry(attempt + 1);
        }

        console.warn('[AppProvider] Token never became valid after 5 attempts');
        return;
      }

      isFetchingRef.current = true;

      try {
        const convRes = await inboxApi.getConversations({
          limit: 200,
          isArchived: false,
        });

        if (isMounted && convRes.data?.success) {
          let convs: any[] = [];
          const d = convRes.data.data;
          if (Array.isArray(d)) convs = d;
          else if (d?.conversations) convs = d.conversations;
          else if (Array.isArray(d?.data)) convs = d.data;

          unreadConversations.current.clear();
          let count = 0;
          convs.forEach((c: any) => {
            if ((c.unreadCount || 0) > 0 && !c.isArchived) {
              unreadConversations.current.add(c.id);
              count++;
            }
          });
          setUnreadCount(count);
          console.log(`📬 [AppProvider] Initial unread: ${count}`);
        }
      } catch (e: any) {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          console.warn('[AppProvider] Auth error on conversations fetch - skipping');
        } else {
          console.error('[AppProvider] Conversations fetch failed:', e?.message);
        }
      }

      try {
        const statsRes = await contactsApi.stats();
        if (isMounted && statsRes.data?.success) {
          const total = statsRes.data.data?.total || 0;
          setTotalContacts(total);
        }
      } catch (e: any) {
        if (e?.response?.status !== 401 && e?.response?.status !== 403) {
          console.error('[AppProvider] Contacts stats fetch failed:', e?.message);
        }
      } finally {
        if (isMounted) {
          isFetchingRef.current = false;
        }
      }
    };

    const initTimer = setTimeout(() => {
      fetchWithRetry(1);
    }, 300);

    return () => {
      isMounted = false; // ✅ Kills any active retry processing chains
      clearTimeout(initTimer);
      if (activeTimer) clearTimeout(activeTimer);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      const msg = data?.message || data;
      const convId = msg?.conversationId || data?.conversationId;
      const direction = msg?.direction;

      if (direction !== 'INBOUND' || !convId) return;

      const isViewingThisConv = window.location.pathname.includes(`/inbox/${convId}`);
      if (isViewingThisConv) return;

      if (!unreadConversations.current.has(convId)) {
        unreadConversations.current.add(convId);
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleConversationRead = (data: any) => {
      const convId = data?.conversationId || data?.id;
      if (!convId) return;

      if (unreadConversations.current.has(convId)) {
        unreadConversations.current.delete(convId);
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('conversation:read', handleConversationRead);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('conversation:read', handleConversationRead);
    };
  }, [socket]);

  const incrementUnread = useCallback((conversationId?: string) => {
    if (conversationId) {
      if (!unreadConversations.current.has(conversationId)) {
        unreadConversations.current.add(conversationId);
        setUnreadCount(prev => prev + 1);
      }
    } else {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const decrementUnread = useCallback((conversationId?: string) => {
    if (conversationId) {
      if (unreadConversations.current.has(conversationId)) {
        unreadConversations.current.delete(conversationId);
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } else {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  const resetUnread = useCallback(() => {
    unreadConversations.current.clear();
    setUnreadCount(0);
  }, []);

  return (
    <AppContext.Provider
      value={{
        unreadCount,
        incrementUnread,
        decrementUnread,
        resetUnread,
        totalContacts,
        setTotalContacts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;