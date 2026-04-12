// src/hooks/useInboxSocket.ts - COMPLETELY REWRITTEN

import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

interface InboundMessage {
    id: string;
    conversationId: string;
    waMessageId?: string;
    wamId?: string;
    content: string;
    direction: 'INBOUND' | 'OUTBOUND';
    status: string;
    createdAt: string;
    timestamp?: string;
    type: string;
    mediaUrl?: string;
    mediaType?: string;
    fileName?: string;
    metadata?: any;
}

interface ConversationUpdate {
    id: string;
    lastMessageAt: string;
    lastMessagePreview: string;
    unreadCount: number;
    isWindowOpen?: boolean;
    windowExpiresAt?: string;
    contact?: any;
    isPinned?: boolean;
    labels?: string[];
    isArchived?: boolean;
    isRead?: boolean;
}

interface MessageStatusUpdate {
    messageId: string;
    waMessageId?: string;
    wamId?: string;
    conversationId: string;
    status: string;
    timestamp: string;
    tempId?: string;
    clientMsgId?: string;
    failureReason?: string;
}

type NewMessageCallback = (message: InboundMessage) => void;
type ConversationUpdateCallback = (update: ConversationUpdate) => void;
type MessageStatusCallback = (status: MessageStatusUpdate) => void;

export const useInboxSocket = (
    selectedConversationId: string | null,
    onNewMessage?: NewMessageCallback,
    onConversationUpdate?: ConversationUpdateCallback,
    onMessageStatus?: MessageStatusCallback
) => {
    const { socket, isConnected, joinConversation, leaveConversation } = useSocket();

    const previousConversationId = useRef<string | null>(null);

    // ✅ Store callbacks in refs - prevents stale closures
    const onNewMessageRef = useRef(onNewMessage);
    const onConversationUpdateRef = useRef(onConversationUpdate);
    const onMessageStatusRef = useRef(onMessageStatus);

    // Always update refs with latest callbacks
    useEffect(() => {
        onNewMessageRef.current = onNewMessage;
        onConversationUpdateRef.current = onConversationUpdate;
        onMessageStatusRef.current = onMessageStatus;
    });

    // ✅ Join/Leave conversation rooms
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Leave previous conversation room
        if (
            previousConversationId.current &&
            previousConversationId.current !== selectedConversationId
        ) {
            leaveConversation(previousConversationId.current);
            console.log('📤 Left conversation:', previousConversationId.current);
        }

        // Join new conversation room
        if (selectedConversationId) {
            joinConversation(selectedConversationId);
            console.log('📂 Joined conversation:', selectedConversationId);
            previousConversationId.current = selectedConversationId;
        }

        // Cleanup on unmount
        return () => {
            if (selectedConversationId) {
                leaveConversation(selectedConversationId);
            }
        };
    }, [socket, isConnected, selectedConversationId, joinConversation, leaveConversation]);

    // ✅ Socket event listeners - Registered ONCE
    useEffect(() => {
        if (!socket) return;

        // ============================================
        // NEW MESSAGE HANDLER
        // ============================================
        const handleNewMessage = (data: any) => {
            try {
                // Backend sends: { organizationId, conversationId, message, conversation?, tempId? }
                const message: InboundMessage = data.message || data;

                if (!message?.id && !message?.waMessageId) {
                    console.warn('⚠️ Invalid message data received:', data);
                    return;
                }

                console.log('📩 [SOCKET] message:new:', {
                    id: message.id,
                    direction: message.direction,
                    conversationId: message.conversationId || data.conversationId,
                    type: message.type,
                });

                // ✅ Ensure conversationId is set
                if (!message.conversationId && data.conversationId) {
                    message.conversationId = data.conversationId;
                }

                if (onNewMessageRef.current) {
                    onNewMessageRef.current(message);
                }
            } catch (e) {
                console.error('❌ handleNewMessage error:', e);
            }
        };

        // ============================================
        // CONVERSATION UPDATE HANDLER
        // ============================================
        const handleConversationUpdate = (data: any) => {
            try {
                // Backend sends: { organizationId, conversation }
                const update: ConversationUpdate = data.conversation || data;

                if (!update?.id) {
                    console.warn('⚠️ Invalid conversation update:', data);
                    return;
                }

                console.log('💬 [SOCKET] conversation:updated:', update.id);

                if (onConversationUpdateRef.current) {
                    onConversationUpdateRef.current(update);
                }
            } catch (e) {
                console.error('❌ handleConversationUpdate error:', e);
            }
        };

        // ============================================
        // MESSAGE STATUS HANDLER
        // ============================================
        const handleMessageStatus = (data: any) => {
            try {
                if (!data?.status) {
                    console.warn('⚠️ Invalid status update:', data);
                    return;
                }

                const statusUpdate: MessageStatusUpdate = {
                    messageId: data.messageId,
                    waMessageId: data.waMessageId,
                    wamId: data.wamId,
                    conversationId: data.conversationId,
                    status: data.status,
                    timestamp: data.timestamp || new Date().toISOString(),
                    tempId: data.tempId,
                    clientMsgId: data.clientMsgId,
                    failureReason: data.failureReason,
                };

                console.log('📊 [SOCKET] message:status:', {
                    messageId: statusUpdate.messageId,
                    waMessageId: statusUpdate.waMessageId,
                    status: statusUpdate.status,
                    tempId: statusUpdate.tempId,
                });

                if (onMessageStatusRef.current) {
                    onMessageStatusRef.current(statusUpdate);
                }
            } catch (e) {
                console.error('❌ handleMessageStatus error:', e);
            }
        };

        // ✅ Remove old listeners first (prevents duplicate handlers)
        socket.off('message:new', handleNewMessage);
        socket.off('conversation:updated', handleConversationUpdate);
        socket.off('message:status', handleMessageStatus);

        // ✅ Register new listeners
        socket.on('message:new', handleNewMessage);
        socket.on('conversation:updated', handleConversationUpdate);
        socket.on('message:status', handleMessageStatus);

        console.log('✅ [SOCKET] Inbox listeners registered, socket:', socket.id);

        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('conversation:updated', handleConversationUpdate);
            socket.off('message:status', handleMessageStatus);
            console.log('🔌 [SOCKET] Inbox listeners removed');
        };
    }, [socket]); // ✅ Only depends on socket instance

    return { isConnected };
};

export default useInboxSocket;