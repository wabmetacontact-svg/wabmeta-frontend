// src/hooks/useInboxSocket.ts - FINAL CLEAN VERSION

import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

// ============================================================
// TYPES
// ============================================================
export interface InboundMessage {
  id:             string;
  conversationId: string;
  waMessageId?:   string;
  wamId?:         string;
  content:        string;
  direction:      'INBOUND' | 'OUTBOUND';
  status:         string;
  createdAt:      string;
  timestamp?:     string;
  type:           string;
  mediaUrl?:      string;
  mediaType?:     string;
  fileName?:      string;
  metadata?:      any;
}

export interface ConversationUpdate {
  id:                 string;
  lastMessageAt:      string;
  lastMessagePreview: string;
  unreadCount:        number;
  isWindowOpen?:      boolean;
  windowExpiresAt?:   string;
  contact?:           any;
  isPinned?:          boolean;
  labels?:            string[];
  isArchived?:        boolean;
  isRead?:            boolean;
}

export interface MessageStatusUpdate {
  messageId?:     string;
  waMessageId?:   string;
  wamId?:         string;
  conversationId: string;
  status:         string;
  timestamp:      string;
  tempId?:        string;
  clientMsgId?:   string;
  failureReason?: string;
}

type NewMessageCallback         = (message: InboundMessage) => void;
type ConversationUpdateCallback = (update: ConversationUpdate) => void;
type MessageStatusCallback      = (status: MessageStatusUpdate) => void;

// ============================================================
// HOOK
// ============================================================
export const useInboxSocket = (
  selectedConversationId:  string | null,
  onNewMessage?:           NewMessageCallback,
  onConversationUpdate?:   ConversationUpdateCallback,
  onMessageStatus?:        MessageStatusCallback
) => {
  const { socket, isConnected, joinConversation, leaveConversation } = useSocket();

  // ✅ Refs se stale closure problem solve hota hai
  const onNewMessageRef         = useRef(onNewMessage);
  const onConversationUpdateRef = useRef(onConversationUpdate);
  const onMessageStatusRef      = useRef(onMessageStatus);
  const prevConvIdRef           = useRef<string | null>(null);

  // Always latest callbacks
  useEffect(() => {
    onNewMessageRef.current         = onNewMessage;
    onConversationUpdateRef.current = onConversationUpdate;
    onMessageStatusRef.current      = onMessageStatus;
  });

  // ✅ Join/Leave conversation room
  useEffect(() => {
    if (!isConnected) return;

    const prev = prevConvIdRef.current;
    const curr = selectedConversationId;

    // Leave old room
    if (prev && prev !== curr) {
      leaveConversation(prev);
    }

    // Join new room
    if (curr) {
      joinConversation(curr);
      prevConvIdRef.current = curr;
    }

    return () => {
      if (curr) {
        leaveConversation(curr);
        prevConvIdRef.current = null;
      }
    };
  }, [isConnected, selectedConversationId, joinConversation, leaveConversation]);

  // ✅ Socket listeners - socket change hone par re-register
  useEffect(() => {
    if (!socket) return;

    // --------------------------------------------------
    // message:new
    // --------------------------------------------------
    const handleNewMessage = (data: any) => {
      try {
        // Backend se format:
        // { organizationId, conversationId, message, conversation? }
        const raw    = data?.message || data;
        const convId = raw?.conversationId || data?.conversationId;

        if (!raw || !convId) {
          console.warn('⚠️ Invalid message:new payload');
          return;
        }

        const msg: InboundMessage = {
          ...raw,
          conversationId: convId,
          createdAt: raw.createdAt || new Date().toISOString(),
        };

        console.log('📩 message:new:', {
          id:        msg.id,
          direction: msg.direction,
          convId:    msg.conversationId,
          type:      msg.type,
        });

        onNewMessageRef.current?.(msg);
      } catch (e) {
        console.error('handleNewMessage error:', e);
      }
    };

    // --------------------------------------------------
    // conversation:updated
    // --------------------------------------------------
    const handleConversationUpdate = (data: any) => {
      try {
        const update: ConversationUpdate = data?.conversation || data;
        if (!update?.id) return;

        console.log('💬 conversation:updated:', update.id);
        onConversationUpdateRef.current?.(update);
      } catch (e) {
        console.error('handleConversationUpdate error:', e);
      }
    };

    // --------------------------------------------------
    // message:status
    // --------------------------------------------------
    const handleMessageStatus = (data: any) => {
      try {
        if (!data?.status) return;

        const statusUpdate: MessageStatusUpdate = {
          messageId:      data.messageId,
          waMessageId:    data.waMessageId,
          wamId:          data.wamId,
          conversationId: data.conversationId || '',
          status:         data.status,
          timestamp:      data.timestamp || new Date().toISOString(),
          tempId:         data.tempId,
          clientMsgId:    data.clientMsgId,
          failureReason:  data.failureReason,
        };

        console.log('📊 message:status:', {
          messageId:   statusUpdate.messageId,
          waMessageId: statusUpdate.waMessageId,
          status:      statusUpdate.status,
          tempId:      statusUpdate.tempId,
        });

        onMessageStatusRef.current?.(statusUpdate);
      } catch (e) {
        console.error('handleMessageStatus error:', e);
      }
    };

    // ✅ Pehle purane listeners hataao (duplicate prevention)
    socket.off('message:new',          handleNewMessage);
    socket.off('conversation:updated', handleConversationUpdate);
    socket.off('message:status',       handleMessageStatus);

    // ✅ Naye listeners register karo
    socket.on('message:new',          handleNewMessage);
    socket.on('conversation:updated', handleConversationUpdate);
    socket.on('message:status',       handleMessageStatus);

    console.log('✅ Socket listeners registered, socket:', socket.id);

    return () => {
      socket.off('message:new',          handleNewMessage);
      socket.off('conversation:updated', handleConversationUpdate);
      socket.off('message:status',       handleMessageStatus);
      console.log('🔌 Socket listeners removed');
    };
  }, [socket]); // ✅ Sirf socket par depend karo

  return { isConnected };
};

export default useInboxSocket;