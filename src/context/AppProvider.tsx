// src/context/AppProvider.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppContext } from './AppContext';
import { useSocket } from './SocketContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Track which conversations have unread messages
  const unreadConversations = useRef<Set<string>>(new Set());
  
  const { socket } = useSocket();

  // ✅ Socket se global unread count sync karo
  // Ye DashboardLayout level pe kaam karega - Inbox page pe ho ya na ho
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      const msg = data?.message || data;
      const convId = msg?.conversationId || data?.conversationId;
      const direction = msg?.direction;

      // Sirf INBOUND messages pe unread count badhao
      if (direction !== 'INBOUND' || !convId) return;

      // Check: kya user abhi us conversation mein hai?
      const currentPath = window.location.pathname;
      const isViewingThisConv = currentPath.includes(`/inbox/${convId}`);

      if (!isViewingThisConv) {
        // Sirf tabhi increment karo jab ye conversation already unread mein nahi hai
        if (!unreadConversations.current.has(convId)) {
          unreadConversations.current.add(convId);
          setUnreadCount(prev => prev + 1);
        }
      }
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
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
    <AppContext.Provider value={{
      unreadCount,
      incrementUnread,
      decrementUnread,
      resetUnread,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
