// src/context/SocketProvider.tsx - COMPLETE FIX

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';

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

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket]           = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef      = useRef<Socket | null>(null);
  const orgIdRef       = useRef<string | null>(null);
  // ✅ Flag to prevent double-init in React StrictMode
  const initializedRef = useRef(false);

  useEffect(() => {
    // ✅ StrictMode double-mount fix
    if (initializedRef.current) return;
    initializedRef.current = true;

    const token = getToken();
    if (!token) {
      console.log('⚠️ No auth token, skipping socket');
      return;
    }

    const organizationId = getOrgId();
    orgIdRef.current = organizationId;

    const SOCKET_URL = getSocketUrl();
    console.log('🔌 Socket connecting to:', SOCKET_URL, '| Org:', organizationId);

    const newSocket = io(SOCKET_URL, {
      auth:                 { token, organizationId },
      transports:           ['polling', 'websocket'], // polling pehle (Render ke liye)
      path:                 '/socket.io/',
      reconnection:         true,
      reconnectionAttempts: 20,
      reconnectionDelay:    1000,
      reconnectionDelayMax: 10000,
      timeout:              30000,
      forceNew:             true,
      autoConnect:          true,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);

      // ✅ Org room join on connect + reconnect
      const orgId = orgIdRef.current;
      if (orgId) {
        newSocket.emit('org:join', orgId);
        console.log('📂 Joined org room:', orgId);
      }
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
      // ✅ Re-join org on reconnect
      const orgId = orgIdRef.current;
      if (orgId) {
        newSocket.emit('org:join', orgId);
      }
    });

    // ✅ Pong ke liye
    newSocket.on('pong', () => {});

    setSocket(newSocket);

    return () => {
      console.log('🔌 Socket cleanup');
      initializedRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected && conversationId) {
      socketRef.current.emit('join:conversation', conversationId);
      console.log('📂 Joined conv room:', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected && conversationId) {
      socketRef.current.emit('leave:conversation', conversationId);
      console.log('📤 Left conv room:', conversationId);
    }
  }, []);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      joinConversation,
      leaveConversation,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;