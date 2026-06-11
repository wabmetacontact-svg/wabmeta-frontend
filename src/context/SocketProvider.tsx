// src/context/SocketProvider.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';
import { useAuth } from './AuthContext';

const getSocketUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/api\/?$/, '')
      .replace(/\/v1\/?$/, '')
      .replace(/\/$/, '');
  }
  return import.meta.env.PROD
    ? 'https://wabmeta-api.onrender.com'
    : 'http://localhost:10000';
};

const getOrgId = (): string | null => {
  try {
    const orgData = localStorage.getItem('wabmeta_org');
    if (orgData) {
      const parsed = JSON.parse(orgData);
      if (parsed?.id) return parsed.id;
    }
  } catch {}
  return localStorage.getItem('currentOrganizationId');
};

const getToken = (): string | null => {
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('wabmeta_token')
  );
};

// ✅ NEW: User ID get karo localStorage se
const getUserId = (): string | null => {
  try {
    const userData = localStorage.getItem('wabmeta_user');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed?.id) return parsed.id;
    }
  } catch {}
  return null;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const orgIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (socketRef.current) {
        console.log('🔌 Logout detected, closing socket');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = getToken();
    if (!token) {
      console.log('⚠️ No auth token despite isAuthenticated');
      return;
    }

    if (socketRef.current?.connected) {
      console.log('⚡ Socket already connected, skipping');
      return;
    }

    const organizationId = getOrgId();
    const userId = user?.id || getUserId(); // ✅ User ID get karo

    orgIdRef.current = organizationId;
    userIdRef.current = userId;

    const SOCKET_URL = getSocketUrl();
    console.log('🔌 Socket connecting to:', SOCKET_URL, '| Org:', organizationId, '| User:', userId);

    const newSocket = io(SOCKET_URL, {
      auth: { token, organizationId },
      transports: ['polling', 'websocket'],
      path: '/socket.io/',
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 30000,
      forceNew: true,
      autoConnect: true,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);

      // ✅ Org room join
      const orgId = orgIdRef.current;
      if (orgId) {
        newSocket.emit('org:join', orgId);
        console.log('📂 Joined org room:', orgId);
      }

      // ✅ NEW: User room join (force logout ke liye)
      const uId = userIdRef.current;
      if (uId) {
        newSocket.emit('user:join', uId);
        console.log('👤 Joined user room:', uId);
      }
    });

    // ✅ Force logout event handler
    newSocket.on('force_logout', (data: {
      reason: string;
      title?: string;        // ✅ NEW
      message: string;
      timestamp: string;
    }) => {
      console.log('🔒 Session expired event received');

      // ✅ Custom event dispatch with title
      window.dispatchEvent(
        new CustomEvent('force_logout', {
          detail: {
            reason: data.reason,
            title: data.title || 'Session Expired',
            message: data.message,
          },
        })
      );
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connect error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attempt) => {
      console.log(`🔄 Socket reconnected after ${attempt} attempts`);

      const orgId = orgIdRef.current;
      if (orgId) newSocket.emit('org:join', orgId);

      // ✅ Reconnect pe bhi user room rejoin karo
      const uId = userIdRef.current;
      if (uId) newSocket.emit('user:join', uId);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Socket cleanup');
      if (socketRef.current) {
        // ✅ force_logout listener remove karo
        socketRef.current.off('force_logout');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, isLoading, user?.id]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected && conversationId) {
      socketRef.current.emit('join:conversation', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected && conversationId) {
      socketRef.current.emit('leave:conversation', conversationId);
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinConversation,
        leaveConversation,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;