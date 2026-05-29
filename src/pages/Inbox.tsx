// src/pages/Inbox.tsx - COMPLETE OPTIMIZED VERSION

import React, {
  useState, useEffect, useCallback, useRef, useMemo
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search, MoreVertical, Info, Loader2, Phone,
  MessageSquare, AlertCircle, RefreshCw,
  Pin, PinOff, Tag, Archive, ArchiveRestore, X, ArrowLeft,
  Bell,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useInboxSocket, type InboundMessage, type ConversationUpdate, type MessageStatusUpdate } from '../hooks/useInboxSocket';
import api, { inbox as inboxApi, whatsapp as whatsappApi } from '../services/api';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import WindowStatus from '../components/inbox/WindowStatus';
import ChatInput from '../components/inbox/ChatInput';
import MessageBubble from '../components/inbox/MessageBubble';
import SendTemplateModal from '../components/inbox/SendTemplateModal';
import { formatMessageDateTime, safeParseDate } from '../utils/dateHelpers';
import CallScreen from '../components/inbox/CallScreen';

// ============================================
// TYPES
// ============================================
interface Contact {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  avatar?: string;
  whatsappProfileName?: string;
  tags?: string[];
}

interface Message {
  id: string;
  waMessageId?: string;
  wamId?: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'TEMPLATE' | 'STICKER' | 'LOCATION' | 'CONTACT' | 'INTERACTIVE';
  direction: 'INBOUND' | 'OUTBOUND';
  status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: string;
  timestamp?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  statusUpdatedAt?: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaId?: string;
  fileName?: string;
  templateName?: string;
  failureReason?: string;
  metadata?: any;
  conversationId?: string;
}

interface Conversation {
  id: string;
  contact: Contact;
  lastMessageAt: string;
  lastMessagePreview?: string;
  unreadCount: number;
  isArchived: boolean;
  isRead?: boolean;
  isWindowOpen?: boolean;
  windowExpiresAt?: string;
  isPinned?: boolean;
  labels?: string[];
  assignedTo?: string;
}

// ============================================
// LABEL COLORS
// ============================================
const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  important: { bg: 'bg-red-100', text: 'text-red-700' },
  'follow-up': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700' },
  pending: { bg: 'bg-orange-100', text: 'text-orange-700' },
  vip: { bg: 'bg-purple-100', text: 'text-purple-700' },
  new: { bg: 'bg-blue-100', text: 'text-blue-700' },
  support: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  sales: { bg: 'bg-pink-100', text: 'text-pink-700' },
};
const AVAILABLE_LABELS = Object.keys(LABEL_COLORS);

// ============================================
// HELPERS
// ============================================
const safeFormatDistance = (date: any): string => {
  try {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return formatDistanceToNow(d, { addSuffix: false });
  } catch {
    return '';
  }
};

const getContactName = (contact: Contact): string => {
  if (contact.whatsappProfileName) return contact.whatsappProfileName;
  if (contact.name) return contact.name;
  if (contact.firstName || contact.lastName)
    return [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  return contact.phone;
};

const getContactInitial = (contact: Contact): string =>
  getContactName(contact).charAt(0).toUpperCase();

const getLabelStyle = (label: string) =>
  LABEL_COLORS[label.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-700' };

const sortConversations = (convs: Conversation[]): Conversation[] => {
  return [...convs].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastMessageAt || 0).getTime() -
      new Date(a.lastMessageAt || 0).getTime();
  });
};

// ✅ Clean preview text - no [button] or raw JSON
const getMessagePreview = (raw?: string, type?: string): string => {
  if (!raw) return 'No messages yet';

  // Interactive / button messages
  if (raw === '[button]' || raw === '[Button]') return '🔘 Button message';
  if (type === 'interactive' || type === 'INTERACTIVE') return '🔘 Interactive message';

  // Template multi-line: "Campaign: X\nTemplate: Y"
  if (raw.startsWith('Campaign:') || raw.startsWith('Template:')) {
    const tplLine = raw.split('\n').find(l => l.startsWith('Template:'));
    const name = tplLine?.replace('Template:', '').trim() || 'Template';
    return `📋 ${name.replace(/_/g, ' ')}`;
  }

  // Template JSON
  if (raw.startsWith('{') && raw.includes('templateName')) {
    try {
      const p = JSON.parse(raw);
      const name = p.templateName || p.name || 'Template';
      const body = p.body || p.bodyText || '';
      return `📋 ${body || name.replace(/_/g, ' ')}`;
    } catch { }
  }

  // Media type emojis
  if (raw === '[Image]' || raw === '[image]') return '📷 Photo';
  if (raw === '[Video]' || raw === '[video]') return '🎥 Video';
  if (raw === '[Audio]' || raw === '[audio]') return '🎵 Audio';
  if (raw === '[Document]' || raw === '[document]') return '📄 Document';
  if (raw === '[Sticker]' || raw === '[sticker]') return '🎭 Sticker';
  if (raw === '[Location]' || raw === '[location]') return '📍 Location';
  if (raw === '[Contact]' || raw === '[contact]') return '👤 Contact';

  return raw.substring(0, 60);
};

// ============================================
// MAIN COMPONENT
// ============================================
const Inbox: React.FC = () => {
  const { conversationId: urlConvId } = useParams();
  const navigate = useNavigate();
  const { decrementUnread, incrementUnread } = useApp();

  // ============================================
  // REFS
  // ============================================
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetchingMessagesRef = useRef(false);
  const lastFetchedConvId = useRef<string | null>(null);

  // ✅ Track sent message IDs to prevent socket duplicates
  const sentMessageIds = useRef<Set<string>>(new Set());
  // ✅ Track temp IDs -> real IDs mapping
  const tempToRealIdMap = useRef<Map<string, string>>(new Map());

  // ============================================
  // STATE
  // ============================================
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState<string | null>(null);
  const [showConversationMenu, setShowConversationMenu] = useState<string | null>(null);
  const [whatsappAccountId, setWhatsappAccountId] = useState<string | null>(null);
  const [showCallScreen, setShowCallScreen] = useState(false);
  // Mobile: show chat panel instead of list
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Selected conversation ref for use in callbacks
  const selectedConvRef = useRef<Conversation | null>(null);
  useEffect(() => {
    selectedConvRef.current = selectedConversation;
  }, [selectedConversation]);

  // ============================================
  // SCROLL TO BOTTOM
  // ============================================
  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto'
      });
    }, 50);
  }, []);

  // ============================================
  // GET WHATSAPP ACCOUNT (once on mount)
  // ============================================
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await whatsappApi.accounts();
        const accounts: any[] = res.data?.data?.accounts || [];
        const connected = accounts.find((a: any) => a.status === 'CONNECTED');
        const accountId = connected?.id || accounts[0]?.id;
        if (accountId) {
          setWhatsappAccountId(accountId);
          console.log('✅ WhatsApp account loaded:', accountId);
        }
      } catch (e) {
        console.error('Failed to fetch WA accounts:', e);
      }
    };
    fetchAccount();
  }, []);

  // ============================================
  // FETCH CONVERSATIONS
  // ============================================
  const fetchConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }

      const params: any = { limit: 200 };
      if (searchQuery?.trim()) params.search = searchQuery.trim();

      if (filter === 'unread') {
        params.isRead = false;
        params.isArchived = false;
      } else if (filter === 'archived') {
        params.isArchived = true;
      } else {
        params.isArchived = false;
      }

      const response = await inboxApi.getConversations(params);

      if (response.data.success) {
        let data: Conversation[] = [];
        if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data.data?.conversations) {
          data = response.data.data.conversations;
        }

        const valid = data.filter((c) => c?.id && c?.contact);
        setConversations(sortConversations(valid));
      }
    } catch (e: any) {
      if (!silent) {
        setError(e.response?.data?.message || e.message || 'Failed to load conversations');
        setConversations([]);
      }
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filter]);

  // ============================================
  // FETCH MESSAGES
  // ============================================
  const fetchMessages = useCallback(async (convId: string, force = false) => {
    if (fetchingMessagesRef.current && !force) return;
    if (lastFetchedConvId.current === convId && messages.length > 0 && !force) return;

    try {
      fetchingMessagesRef.current = true;
      setLoadingMessages(true);

      const response = await inboxApi.getMessages(convId, { limit: 100 });

      if (response.data.success) {
        let msgs: Message[] = [];
        const d = response.data.data;

        if (Array.isArray(d)) msgs = d;
        else if (d?.messages) msgs = d.messages;

        // Sort chronologically
        msgs.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // ✅ Register all real message IDs to prevent duplicates
        sentMessageIds.current.clear();
        msgs.forEach((m) => {
          if (m.waMessageId) sentMessageIds.current.add(m.waMessageId);
          if (m.wamId) sentMessageIds.current.add(m.wamId);
          sentMessageIds.current.add(m.id);
        });

        setMessages(msgs);
        lastFetchedConvId.current = convId;

        // Mark as read
        inboxApi.markAsRead(convId).catch(() => { });
        setConversations((prev) =>
          prev.map((c) => c.id === convId
            ? { ...c, unreadCount: 0, isRead: true }
            : c
          )
        );

        scrollToBottom(false);
      }
    } catch (e) {
      console.error('fetchMessages error:', e);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
      fetchingMessagesRef.current = false;
    }
  }, [scrollToBottom]);

  // ============================================
  // SELECT CONVERSATION
  // ============================================
  const selectConversation = useCallback((conv: Conversation) => {
    if (selectedConvRef.current?.id === conv.id) {
      setShowMobileChat(true);
      return;
    }
    setMessages([]);
    lastFetchedConvId.current = null;
    sentMessageIds.current.clear();
    tempToRealIdMap.current.clear();
    setSelectedConversation(conv);
    setShowContactInfo(false);
    setShowMobileChat(true);
    navigate(`/dashboard/inbox/${conv.id}`);
    fetchMessages(conv.id);
    
    // ✅ Sync sidebar - decrement if this conv had unread
    if (conv.unreadCount > 0) {
      decrementUnread(conv.id);
    }
  }, [navigate, fetchMessages, decrementUnread]);

  // ============================================
  // SEND TEXT MESSAGE
  // ============================================
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !selectedConvRef.current) return;

    const conv = selectedConvRef.current;
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // ✅ Optimistic message
    const tempMessage: Message = {
      id: tempId,
      content: text,
      type: 'TEXT',
      direction: 'OUTBOUND',
      status: 'PENDING',
      createdAt: now,
      timestamp: now,
      conversationId: conv.id,
    };

    // ✅ Register temp ID to prevent socket duplicate
    sentMessageIds.current.add(tempId);

    setMessages((prev) => [...prev, tempMessage]);
    scrollToBottom();

    try {
      if (!whatsappAccountId) throw new Error('No WhatsApp account connected');

      const response = await whatsappApi.sendText({
        whatsappAccountId,
        to: conv.contact.phone,
        message: text,
        tempId,
      });

      if (response.data.success) {
        const realMsg = response.data.data as any;
        const realId = realMsg?.id || realMsg?.waMessageId;
        const realWamId = realMsg?.waMessageId || realMsg?.wamId;

        // ✅ Register real IDs
        if (realId) sentMessageIds.current.add(realId);
        if (realWamId) sentMessageIds.current.add(realWamId);
        if (realId) tempToRealIdMap.current.set(tempId, realId);

        // ✅ Replace temp with real message
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== tempId) return m;
            return {
              ...m,
              ...realMsg,
              id: realId || tempId,
              status: 'SENT',
              createdAt: realMsg.createdAt || now,
              timestamp: realMsg.timestamp || realMsg.createdAt || now,
            };
          })
        );

        // Update conversation preview
        setConversations((prev) =>
          sortConversations(
            prev.map((c) =>
              c.id === conv.id
                ? { ...c, lastMessagePreview: text.substring(0, 50), lastMessageAt: now }
                : c
            )
          )
        );
      } else {
        throw new Error(response.data.message || 'Failed to send');
      }
    } catch (e: any) {
      console.error('Send error:', e);
      toast.error(e.response?.data?.message || e.message || 'Failed to send message');
      setMessages((prev) =>
        prev.map((m) => m.id === tempId ? { ...m, status: 'FAILED' } : m)
      );
      sentMessageIds.current.delete(tempId);
    }
  }, [whatsappAccountId, scrollToBottom]);

  // ============================================
  // SEND MEDIA
  // ============================================
  const handleUploadAndSendMedia = useCallback(async (file: File) => {
    if (!selectedConvRef.current) return;

    const conv = selectedConvRef.current;
    const tempId = `temp-media-${Date.now()}`;
    const mime = file.type || '';

    const tempType: Message['type'] =
      mime.startsWith('image/') ? 'IMAGE' :
        mime.startsWith('video/') ? 'VIDEO' :
          mime.startsWith('audio/') ? 'AUDIO' : 'DOCUMENT';

    const tempMsg: Message = {
      id: tempId,
      content: file.name,
      type: tempType,
      direction: 'OUTBOUND',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      mediaUrl: mime.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      conversationId: conv.id,
    };

    sentMessageIds.current.add(tempId);
    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    try {
      // 1. Upload file
      const uploadToast = toast.loading('Uploading...');
      const form = new FormData();
      form.append('file', file);
      const uploadRes = await api.post('/inbox/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.dismiss(uploadToast);

      const uploaded = uploadRes.data?.data;
      if (!uploaded?.url || !uploaded?.mediaType) throw new Error('Upload failed');

      // 2. Send media message
      const sendToast = toast.loading('Sending...');
      const sendRes = await api.post(
        `/inbox/conversations/${conv.id}/messages/media`,
        {
          mediaType: uploaded.mediaType,
          mediaUrl: uploaded.url,
        }
      );
      toast.dismiss(sendToast);

      const result = sendRes.data?.data;
      const realMsg = result?.message || result;
      const realId = realMsg?.id;
      const realWamId = realMsg?.waMessageId || realMsg?.wamId;

      if (realId) sentMessageIds.current.add(realId);
      if (realWamId) sentMessageIds.current.add(realWamId);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...(realMsg || m), id: realId || m.id, status: 'SENT', mediaUrl: uploaded.url }
            : m
        )
      );

      const preview = tempType === 'IMAGE' ? '📷 Image' :
        tempType === 'VIDEO' ? '🎥 Video' :
          tempType === 'AUDIO' ? '🎵 Audio' : '📄 Document';

      setConversations((prev) =>
        sortConversations(
          prev.map((c) =>
            c.id === conv.id
              ? { ...c, lastMessagePreview: preview, lastMessageAt: new Date().toISOString() }
              : c
          )
        )
      );

      toast.success('Sent!');
    } catch (e: any) {
      toast.dismiss();
      toast.error(e.response?.data?.message || e.message || 'Failed to send media');
      setMessages((prev) =>
        prev.map((m) => m.id === tempId ? { ...m, status: 'FAILED' } : m)
      );
      sentMessageIds.current.delete(tempId);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [scrollToBottom]);

  // ============================================
  // PIN CONVERSATION
  // ============================================
  const handlePinConversation = useCallback(async (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPinned = !conv.isPinned;
    try {
      setConversations((prev) =>
        sortConversations(prev.map((c) =>
          c.id === conv.id ? { ...c, isPinned: newPinned } : c
        ))
      );
      await api.patch(`/inbox/conversations/${conv.id}/pin`, { isPinned: newPinned });
      toast.success(newPinned ? 'Pinned' : 'Unpinned');
    } catch {
      toast.error('Failed to update pin');
      setConversations((prev) =>
        sortConversations(prev.map((c) =>
          c.id === conv.id ? { ...c, isPinned: !newPinned } : c
        ))
      );
    } finally {
      setShowConversationMenu(null);
    }
  }, []);

  // ============================================
  // ARCHIVE CONVERSATION
  // ============================================
  const handleArchiveConversation = useCallback(async (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (conv.isArchived) {
        await api.post(`/inbox/conversations/${conv.id}/unarchive`);
        toast.success('Unarchived');
      } else {
        await api.post(`/inbox/conversations/${conv.id}/archive`);
        toast.success('Archived');
      }

      if (selectedConvRef.current?.id === conv.id) {
        setSelectedConversation(null);
        setMessages([]);
        navigate('/dashboard/inbox');
      }
      fetchConversations(true);
    } catch {
      toast.error('Failed to archive');
    } finally {
      setShowConversationMenu(null);
    }
  }, [fetchConversations, navigate]);

  // ============================================
  // LABELS
  // ============================================
  const handleAddLabel = useCallback(async (conv: Conversation, label: string) => {
    try {
      await api.post(`/inbox/conversations/${conv.id}/labels`, { labels: [label] });
      toast.success(`Label added: ${label}`);
      setShowLabelPicker(null);

      const updatedLabels = [...new Set([...(conv.labels || []), label])];
      setConversations((prev) =>
        prev.map((c) => c.id === conv.id ? { ...c, labels: updatedLabels } : c)
      );
      if (selectedConvRef.current?.id === conv.id) {
        setSelectedConversation((prev) => prev ? { ...prev, labels: updatedLabels } : prev);
      }
    } catch {
      toast.error('Failed to add label');
    }
  }, []);

  const handleRemoveLabel = useCallback(async (
    conv: Conversation, label: string, e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await api.delete(`/inbox/conversations/${conv.id}/labels/${encodeURIComponent(label)}`);
      const updatedLabels = (conv.labels || []).filter((l) => l !== label);
      setConversations((prev) =>
        prev.map((c) => c.id === conv.id ? { ...c, labels: updatedLabels } : c)
      );
      if (selectedConvRef.current?.id === conv.id) {
        setSelectedConversation((prev) => prev ? { ...prev, labels: updatedLabels } : prev);
      }
    } catch {
      toast.error('Failed to remove label');
    }
  }, []);

  // ✅ Open the calling screen overlay
  const handleCallContact = useCallback(() => {
    const conv = selectedConvRef.current;
    if (!conv) return;
    setShowCallScreen(true);
  }, []);

  // ============================================
  // ✅ SOCKET HANDLERS
  // ============================================
  useInboxSocket(
    selectedConversation?.id || null,

    // ===== NEW MESSAGE =====
    useCallback((newMsg: InboundMessage) => {
      if (!newMsg) return;
      const convId    = newMsg.conversationId;
      const msgId     = newMsg.id;
      const waId      = newMsg.waMessageId || newMsg.wamId;
      const direction = newMsg.direction;

      if (!convId) return;

      const isCurrentConv = selectedConvRef.current?.id === convId;

      // INBOUND in current conv → add to messages
      if (direction === 'INBOUND' && isCurrentConv) {
        setMessages(prev => {
          const isDup = prev.some(
            m => m.id === msgId || (waId && (m.waMessageId === waId || m.wamId === waId))
          );
          if (isDup) return prev;
          return [...prev, {
            ...newMsg as any,
            createdAt: newMsg.createdAt || new Date().toISOString(),
          }];
        });
        scrollToBottom();
        inboxApi.markAsRead(convId).catch(() => {});
      }

      // Update conversation list - ALWAYS
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === convId);
        const updated = [...prev];

        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            lastMessagePreview: (newMsg.content || 'New message').substring(0, 60),
            lastMessageAt:      newMsg.createdAt || new Date().toISOString(),
            unreadCount:        isCurrentConv ? 0 : (updated[idx].unreadCount || 0) + 1,
            isRead:             isCurrentConv,
          };
        }

        return sortConversations(updated);
      });

    }, [scrollToBottom]),

    // ===== CONVERSATION UPDATE =====
    useCallback((updatedConv: ConversationUpdate) => {
      if (!updatedConv?.id) return;
      console.log('💬 Conversation updated:', updatedConv.id);

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === updatedConv.id);

        if (idx === -1) {
          // ✅ Naya conversation list mein nahi hai - add karo
          if ((updatedConv as any).contact?.id) {
            return sortConversations([updatedConv as any, ...prev]);
          }
          return prev;
        }

        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updatedConv };
        return sortConversations(updated);
      });

      // Selected conversation bhi update karo
      if (selectedConvRef.current?.id === updatedConv.id) {
        setSelectedConversation((prev) =>
          prev ? { ...prev, ...updatedConv } : prev
        );
      }
    }, []),

    // ===== MESSAGE STATUS =====
    useCallback((statusUpdate: MessageStatusUpdate) => {
      if (!statusUpdate?.status) return;

      console.log('📊 Status update:', {
        messageId:   statusUpdate.messageId,
        waMessageId: statusUpdate.waMessageId,
        status:      statusUpdate.status,
        tempId:      statusUpdate.tempId,
      });

      setMessages((prev) =>
        prev.map((m) => {
          // ✅ Multiple ID se match karo
          const isMatch =
            (statusUpdate.messageId   && m.id === statusUpdate.messageId) ||
            (statusUpdate.tempId      && m.id === statusUpdate.tempId) ||
            (statusUpdate.waMessageId && (
              m.waMessageId === statusUpdate.waMessageId ||
              m.wamId       === statusUpdate.waMessageId
            )) ||
            (statusUpdate.wamId && (
              m.waMessageId === statusUpdate.wamId ||
              m.wamId       === statusUpdate.wamId
            ));

          if (!isMatch) return m;

          const newStatus = statusUpdate.status.toUpperCase() as Message['status'];

          // ✅ Status downgrade prevent karo
          const rank: Record<string, number> = {
            PENDING: 0, SENT: 1, DELIVERED: 2, READ: 3, FAILED: -1,
          };
          const curRank = rank[m.status || 'PENDING'] ?? 0;
          const newRank = rank[newStatus || 'PENDING'] ?? 0;

          if (newRank < curRank && newStatus !== 'FAILED') return m;

          console.log(`✅ Status: ${m.id} ${m.status} → ${newStatus}`);

          return {
            ...m,
            status:          newStatus,
            failureReason:   statusUpdate.failureReason,
            statusUpdatedAt: statusUpdate.timestamp,
            ...(newStatus === 'SENT'      && { sentAt:      statusUpdate.timestamp }),
            ...(newStatus === 'DELIVERED' && { deliveredAt: statusUpdate.timestamp }),
            ...(newStatus === 'READ'      && { readAt:      statusUpdate.timestamp }),
          };
        })
      );
    }, [])
  );

  // ============================================
  // EFFECTS
  // ============================================
  // Initial + filter load
  useEffect(() => {
    fetchConversations();
  }, [filter]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => fetchConversations(), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // URL-based conversation selection
  useEffect(() => {
    if (!urlConvId || conversations.length === 0) return;
    if (selectedConvRef.current?.id === urlConvId) return;

    const conv = conversations.find((c) => c.id === urlConvId);
    if (conv) {
      setSelectedConversation(conv);
      if (lastFetchedConvId.current !== urlConvId) {
        fetchMessages(urlConvId);
      }
    }
  }, [urlConvId, conversations, fetchMessages]);

  // ============================================
  // UNREAD COUNT (from filtered conversations)
  // ============================================
  const unreadCount = useMemo(
    () => conversations.filter((c) => c.unreadCount > 0).length,
    [conversations]
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Failed to Load Inbox
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={() => fetchConversations()}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <RefreshCw className="w-5 h-5" /> Try Again
        </button>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="flex h-full bg-gray-100 dark:bg-gray-900 overflow-hidden relative">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadAndSendMedia(file);
        }}
      />

      {/* ============================================ */}
      {/* LEFT SIDEBAR */}
      {/* ============================================ */}
      <div className={`
        flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col
        w-full md:w-96
        ${showMobileChat ? 'hidden md:flex' : 'flex'}
      `}>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Inbox
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </h2>
            <button
              onClick={() => { setRefreshing(true); fetchConversations(); }}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'archived', label: 'Archived' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${filter === f.key
                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
              >
                {f.label}
                {f.key === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 px-1 py-0.5 text-[10px] bg-green-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isSelected={selectedConversation?.id === conv.id}
                showMenu={showConversationMenu === conv.id}
                showLabelPicker={showLabelPicker === conv.id}
                onSelect={() => selectConversation(conv)}
                onMenuToggle={(e) => {
                  e.stopPropagation();
                  setShowConversationMenu(
                    showConversationMenu === conv.id ? null : conv.id
                  );
                }}
                onPin={(e) => handlePinConversation(conv, e)}
                onArchive={(e) => handleArchiveConversation(conv, e)}
                onOpenLabelPicker={(e) => {
                  e.stopPropagation();
                  setShowLabelPicker(conv.id);
                  setShowConversationMenu(null);
                }}
                onAddLabel={(label) => handleAddLabel(conv, label)}
                onRemoveLabel={(label, e) => handleRemoveLabel(conv, label, e)}
                onCloseMenu={() => setShowConversationMenu(null)}
                onCloseLabelPicker={() => setShowLabelPicker(null)}
              />
            ))
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* CHAT AREA */}
      {/* ============================================ */}
      <div className={`
        flex-1 flex flex-col h-full overflow-hidden
        ${!showMobileChat ? 'hidden md:flex' : 'flex'}
      `}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex-shrink-0"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div
                    className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0"
                    onClick={() => setShowContactInfo(!showContactInfo)}
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                      {getContactInitial(selectedConversation.contact)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        {getContactName(selectedConversation.contact)}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {selectedConversation.contact.phone}
                      </p>
                    </div>
                  </div>
                </div>
                {/* ✅ Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {/* Call Button */}
                  <button
                    onClick={handleCallContact}
                    title="WhatsApp Call"
                    className="flex items-center gap-1.5 px-2 sm:px-3 py-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-lg transition-all text-sm font-medium shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">Call</span>
                  </button>
                  {/* Info Button */}
                  <button
                    onClick={() => setShowContactInfo(!showContactInfo)}
                    className={`p-2 rounded-lg transition-colors ${
                      showContactInfo
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                    }`}
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Window Status */}
            <div className="flex-shrink-0">
              <WindowStatus
                windowExpiresAt={selectedConversation.windowExpiresAt || null}
                isWindowOpen={selectedConversation.isWindowOpen || false}
              />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#efe7dd] dark:bg-gray-950">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No messages yet</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, idx) => {
                    // Date separator
                    let showDateSep = idx === 0;
                    if (!showDateSep) {
                      const cur = safeParseDate(m.createdAt);
                      const prev = safeParseDate(messages[idx - 1].createdAt);
                      if (cur && prev) {
                        showDateSep = cur.toDateString() !== prev.toDateString();
                      }
                    }

                    return (
                      <React.Fragment key={m.id}>
                        {showDateSep && (
                          <div className="flex justify-center my-3">
                            <span className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded-full shadow-sm">
                              {formatMessageDateTime(m.createdAt)}
                            </span>
                          </div>
                        )}
                        <MessageBubble
                          message={m as any}
                          conversationId={selectedConversation.id}
                          onCopy={(text) => {
                            navigator.clipboard.writeText(text);
                            toast.success('Copied!');
                          }}
                          onDeleted={(msgId) => {
                            setMessages((prev) => prev.filter((msg) => msg.id !== msgId));
                          }}
                          onEdited={(msgId, newContent) => {
                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === msgId ? { ...msg, content: newContent } : msg
                              )
                            );
                          }}
                        />
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex-shrink-0">
              <ChatInput
                onSendMessage={handleSendMessage}
                onMediaUpload={handleUploadAndSendMedia}
                onOpenTemplateModal={() => setShowTemplateModal(true)}
                isWindowOpen={selectedConversation.isWindowOpen || false}
                windowExpiresAt={selectedConversation.windowExpiresAt}
              />
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select a Conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Choose from the left to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* CONTACT INFO SIDEBAR */}
      {/* ============================================ */}
      {showContactInfo && selectedConversation && (
        <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Contact Info</h3>
            <button
              onClick={() => setShowContactInfo(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-md">
                {getContactInitial(selectedConversation.contact)}
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white">
                {getContactName(selectedConversation.contact)}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedConversation.contact.phone}
              </p>
            </div>

            <div className="p-4 space-y-4">
              {selectedConversation.contact.email && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Email</label>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                    {selectedConversation.contact.email}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Labels</label>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedConversation.labels || []).map((label) => {
                    const style = getLabelStyle(label);
                    return (
                      <span
                        key={label}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
                      >
                        {label}
                      </span>
                    );
                  })}
                  {(selectedConversation.labels || []).length === 0 && (
                    <span className="text-xs text-gray-400">No labels</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
                  Window Status
                </label>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${selectedConversation.isWindowOpen
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                  {selectedConversation.isWindowOpen ? '24h Window Open' : 'Window Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && selectedConversation && (
        <SendTemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          conversationId={selectedConversation.id}
          contactPhone={selectedConversation.contact.phone}
          contactName={getContactName(selectedConversation.contact)}
          onSuccess={() => {
            setShowTemplateModal(false);
            fetchConversations(true);
            if (selectedConversation?.id) {
              fetchMessages(selectedConversation.id, true);
            }
          }}
        />
      )}

      {/* ============================================ */}
      {/* CALL SCREEN OVERLAY */}
      {/* ============================================ */}
      {showCallScreen && selectedConversation && (
        <CallScreen
          contact={selectedConversation.contact}
          conversationId={selectedConversation.id}
          onClose={() => setShowCallScreen(false)}
        />
      )}
    </div>
  );
};

// ============================================
// CONVERSATION ITEM COMPONENT (Extracted)
// ============================================
interface ConversationItemProps {
  conv: Conversation;
  isSelected: boolean;
  showMenu: boolean;
  showLabelPicker: boolean;
  onSelect: () => void;
  onMenuToggle: (e: React.MouseEvent) => void;
  onPin: (e: React.MouseEvent) => void;
  onArchive: (e: React.MouseEvent) => void;
  onOpenLabelPicker: (e: React.MouseEvent) => void;
  onAddLabel: (label: string) => void;
  onRemoveLabel: (label: string, e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  onCloseLabelPicker: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conv, isSelected, showMenu, showLabelPicker,
  onSelect, onMenuToggle, onPin, onArchive,
  onOpenLabelPicker, onAddLabel, onRemoveLabel,
  onCloseMenu, onCloseLabelPicker,
}) => {
  const name = getContactName(conv.contact);
  const initial = getContactInitial(conv.contact);
  const hasUnread = conv.unreadCount > 0;

  return (
    <div className="relative">
      <div
        onClick={onSelect}
        className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700/50 transition-colors ${isSelected
            ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500'
            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
            {conv.contact.avatar ? (
              <img src={conv.contact.avatar} className="w-full h-full rounded-full object-cover" alt="" />
            ) : initial}
          </div>
          {conv.isPinned && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <Pin className="w-2.5 h-2.5 text-yellow-900" />
            </div>
          )}
          {hasUnread && !conv.isPinned && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <h3 className={`text-sm font-semibold truncate ${hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>
              {name}
            </h3>
            <div className="flex flex-col items-end gap-0.5 ml-2 flex-shrink-0">
              <span className={`text-[10px] ${hasUnread ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                {safeFormatDistance(conv.lastMessageAt)}
              </span>
              {hasUnread && (
                <span className="min-w-[1.2rem] h-4 px-1 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                </span>
              )}
            </div>
          </div>

          <p className={`text-xs truncate ${hasUnread ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'
            }`}>
            {getMessagePreview(conv.lastMessagePreview)}
          </p>

          {/* Labels */}
          {conv.labels && conv.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {conv.labels.slice(0, 2).map((label) => {
                const style = getLabelStyle(label);
                return (
                  <span
                    key={label}
                    onClick={(e) => onRemoveLabel(label, e)}
                    className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full cursor-pointer ${style.bg} ${style.text}`}
                  >
                    {label} <X className="w-2.5 h-2.5 ml-0.5" />
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Menu Button */}
        <button
          onClick={onMenuToggle}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"
        >
          <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={onCloseMenu} />
          <div className="absolute right-4 top-12 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
            <button
              onClick={onPin}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {conv.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              {conv.isPinned ? 'Unpin' : 'Pin to top'}
            </button>
            <button
              onClick={onOpenLabelPicker}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Tag className="w-4 h-4" />
              Add Label
            </button>
            <button
              onClick={onArchive}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {conv.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              {conv.isArchived ? 'Unarchive' : 'Archive'}
            </button>
          </div>
        </>
      )}

      {/* Label Picker */}
      {showLabelPicker && (
        <>
          <div className="fixed inset-0 z-10" onClick={onCloseLabelPicker} />
          <div className="absolute right-4 top-12 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
            <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Add Label
            </div>
            {AVAILABLE_LABELS
              .filter((l) => !(conv.labels || []).includes(l))
              .map((label) => {
                const style = getLabelStyle(label);
                return (
                  <button
                    key={label}
                    onClick={() => onAddLabel(label)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${style.bg}`} />
                    <span className={`capitalize text-xs ${style.text}`}>{label}</span>
                  </button>
                );
              })
            }
          </div>
        </>
      )}
    </div>
  );
};

export default Inbox;