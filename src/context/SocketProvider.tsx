// src/context/SocketProvider.tsx - COMPLETE FIXED

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const connectionAttempted = useRef(false);
    const orgIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (connectionAttempted.current) return;
        connectionAttempted.current = true;

        const token =
            localStorage.getItem('accessToken') ||
            localStorage.getItem('token') ||
            localStorage.getItem('wabmeta_token');

        if (!token) {
            console.log('⚠️ No auth token, skipping socket connection');
            return;
        }

        // Get organization ID
        let organizationId: string | null = null;
        try {
            const orgData = localStorage.getItem('wabmeta_org');
            if (orgData) {
                organizationId = JSON.parse(orgData)?.id || null;
            }
            if (!organizationId) {
                organizationId = localStorage.getItem('currentOrganizationId');
            }
        } catch (e) {
            organizationId = localStorage.getItem('currentOrganizationId');
        }

        orgIdRef.current = organizationId;

        // Socket URL
        const socketBase = import.meta.env.PROD
            ? 'https://wabmeta-api.onrender.com'
            : 'http://localhost:10000';

        const SOCKET_URL = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL
                .replace(/\/api\/v1\/?$/, '')
                .replace(/\/api\/?$/, '')
                .replace(/\/v1\/?$/, '')
                .replace(/\/$/, '')
            : socketBase;

        console.log('🔌 Connecting socket:', SOCKET_URL, '| Org:', organizationId);

        const newSocket = io(SOCKET_URL, {
            auth: { token, organizationId },
            transports: ['polling', 'websocket'],
            path: '/socket.io/',
            reconnection: true,
            reconnectionAttempts: 15,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            timeout: 20000,
            forceNew: true,
            autoConnect: true,
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setIsConnected(true);

            if (organizationId) {
                newSocket.emit('org:join', organizationId);
                console.log('📂 Joined org room:', organizationId);
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
            // Re-join org room after reconnect
            if (orgIdRef.current) {
                newSocket.emit('org:join', orgIdRef.current);
            }
        });

        setSocket(newSocket);

        return () => {
            console.log('🔌 Cleaning up socket...');
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            connectionAttempted.current = false;
        };
    }, []);

    const joinConversation = useCallback((conversationId: string) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('join:conversation', conversationId);
            console.log('📂 Joined conversation room:', conversationId);
        }
    }, []);

    const leaveConversation = useCallback((conversationId: string) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('leave:conversation', conversationId);
            console.log('📤 Left conversation room:', conversationId);
        }
    }, []);

    return (
        <SocketContext.Provider value={{
            socket,
            isConnected,
            joinConversation,
            leaveConversation
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;