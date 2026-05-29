// src/context/AppProvider.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppContext } from './AppContext';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { inbox as inboxApi, contacts as contactsApi } from '../services/api';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);

  // Track which conversations have unread messages
  const unreadConversations = useRef<Set<string>>(new Set());

  const { socket } = useSocket();
  const { isAuthenticated } = useAuth();

  // ============================================
  // ✅ Initial unread count fetch (on mount + login)
  // ============================================
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      unreadConversations.current.clear();
      return;
    }

    const fetchInitialCounts = async () => {
      try {
        // Fetch conversations to get initial unread count
        const convRes = await inboxApi.getConversations({ limit: 200, isArchived: false });
        if (convRes.data.success) {
          let convs: any[] = [];
          const d = convRes.data.data;
          if (Array.isArray(d)) convs = d;
          else if (d?.conversations) convs = d.conversations;

          // ✅ Build unread set + count
          unreadConversations.current.clear();
          let count = 0;
          convs.forEach((c: any) => {
            if (c.unreadCount > 0 && !c.isArchived) {
              unreadConversations.current.add(c.id);
              count++;
            }
          });
          setUnreadCount(count);
          console.log(`📬 Initial unread count: ${count}`);
        }
      } catch (e) {
        console.error('Failed to fetch initial unread count:', e);
      }

      try {
        // Fetch total contacts
        const contactRes = await contactsApi.getAll({ limit: 1 });
        if (contactRes.data.success) {
          const total =
            contactRes.data.data?.pagination?.total ||
            contactRes.data.data?.total ||
            contactRes.data.total ||
            0;
          setTotalContacts(total);
        }
      } catch (e) {
        console.error('Failed to fetch contact count:', e);
      }
    };

    fetchInitialCounts();
  }, [isAuthenticated]);

  // ============================================
  // ✅ Socket: New message → unread count badhao
  // ============================================
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ AppProvider: No socket yet');
      return;
    }

    console.log('✅ AppProvider: Subscribing to message:new');

    const handleNewMessage = (data: any) => {
      const msg = data?.message || data;
      const convId = msg?.conversationId || data?.conversationId;
      const direction = msg?.direction;

      console.log('📩 AppProvider received message:new:', { convId, direction });

      // Sirf INBOUND messages
      if (direction !== 'INBOUND' || !convId) return;

      // Check: kya user abhi us conversation mein hai?
      const currentPath = window.location.pathname;
      const isViewingThisConv = currentPath.includes(`/inbox/${convId}`);

      if (isViewingThisConv) {
        console.log('👁️ User is viewing this conv, skip unread increment');
        return;
      }

      // Increment only if not already in set
      if (!unreadConversations.current.has(convId)) {
        unreadConversations.current.add(convId);
        setUnreadCount(prev => {
          const next = prev + 1;
          console.log(`🔢 Unread: ${prev} → ${next}`);
          return next;
        });
      }
    };

    // ✅ Conversation read hone par decrement
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

  // ============================================
  // Helper methods
  // ============================================
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
