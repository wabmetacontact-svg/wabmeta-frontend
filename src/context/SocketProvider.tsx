// src/context/SocketProvider.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';
import { useAuth } from './AuthContext';
import { getStoredAccessToken } from '../services/api';

const getSocketUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/api\/?$/, '')
      .replace(/\/v1\/?$/, '')
      .replace(/\/$/, '');
  }
  // ✅ Standard production socket domain align to prevent routing handshakes drops
  return import.meta.env.PROD
    ? 'https://api.wabmeta.com'
    : 'http://localhost:10000';
};

const getOrgId = (): string | null => {
  try {
    const orgData = localStorage.getItem('wabmeta_org');
    if (orgData) {
      const parsed = JSON.parse(orgData);
      if (parsed?.id) return parsed.id;
    }
  } catch {
    // Malformed org JSON: fall back to the plain id key below.
  }
  return localStorage.getItem('currentOrganizationId');
};

const getToken = (): string | null => getStoredAccessToken();

const getUserId = (): string | null => {
  try {
    const userData = localStorage.getItem('wabmeta_user');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed?.id) return parsed.id;
    }
  } catch {
    // Malformed user JSON: treat as signed out.
  }
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
    if (!token) return;

    if (socketRef.current?.connected) return;

    const organizationId = getOrgId();
    const userId = user?.id || getUserId();

    orgIdRef.current = organizationId;
    userIdRef.current = userId;

    const SOCKET_URL = getSocketUrl();
    console.log('🔌 Socket connecting to:', SOCKET_URL, '| Org:', organizationId, '| User:', userId);

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`.replace(/^Bearer Bearer /, 'Bearer '),
        rawToken: token,
        organizationId: organizationId || undefined,
        userId: userId || undefined,
      },
      query: {
        token,
        organizationId: organizationId || '',
        userId: userId || '',
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
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

      const orgId = orgIdRef.current;
      if (orgId) {
        newSocket.emit('org:join', orgId);
        newSocket.emit('join:org', orgId);
        newSocket.emit('join', `org:${orgId}`);
        newSocket.emit('join', orgId);
      }

      const uId = userIdRef.current;
      if (uId) {
        newSocket.emit('user:join', uId);
        newSocket.emit('join:user', uId);
        newSocket.emit('join', `user:${uId}`);
        newSocket.emit('join', uId);
      }
    });

    newSocket.on('force_logout', (data: {
      reason: string;
      title?: string;
      message: string;
      timestamp: string;
    }) => {
      console.log('🔒 Session expired event received');
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
      if (orgId) {
        newSocket.emit('org:join', orgId);
        newSocket.emit('join:org', orgId);
        newSocket.emit('join', `org:${orgId}`);
      }

      const uId = userIdRef.current;
      if (uId) {
        newSocket.emit('user:join', uId);
        newSocket.emit('join:user', uId);
        newSocket.emit('join', `user:${uId}`);
      }
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Socket cleanup');
      if (socketRef.current) {
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
      socketRef.current.emit('conversation:join', conversationId);
      socketRef.current.emit('join', `conversation:${conversationId}`);
      socketRef.current.emit('join', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected && conversationId) {
      socketRef.current.emit('leave:conversation', conversationId);
      socketRef.current.emit('conversation:leave', conversationId);
      socketRef.current.emit('leave', `conversation:${conversationId}`);
      socketRef.current.emit('leave', conversationId);
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