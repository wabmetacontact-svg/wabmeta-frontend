// src/pages/Inbox.tsx - WORLD-CLASS CHAT UI
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import ConversationList from '../components/inbox/ConversationList';
import ChatHeader from '../components/inbox/ChatHeader';
import ChatWindow from '../components/inbox/ChatWindow';
import ChatInput from '../components/inbox/ChatInput';
import WindowStatus from '../components/inbox/WindowStatus';
import ContactInfoPanel from '../components/inbox/ContactInfoPanel';
import MessageSearchBar from '../components/inbox/MessageSearchBar';
import TypingIndicator from '../components/inbox/TypingIndicator';
import SendTemplateModal from '../components/inbox/SendTemplateModal';
import UpgradeModal from '../components/common/UpgradeModal';
import CallScreen from '../components/inbox/CallScreen';
import QuickRepliesPanel, { type QuickReply } from '../components/inbox/QuickRepliesPanel';

// Hooks & Services
import {
  useInboxSocket,
  type InboundMessage,
  type ConversationUpdate,
  type MessageStatusUpdate,
} from '../hooks/useInboxSocket';
import api, { inbox as inboxApi, whatsapp as whatsappApi } from '../services/api';
import { useApp } from '../context/AppContext';

// Utils
import {
  sortConversations,
  getContactName,
  type ContactLike,
} from '../utils/inboxHelpers';
import type { Message } from '../components/inbox/MessageBubble';
import type { Note } from '../components/inbox/ConversationNotes';

// Styles
import '../components/inbox/inbox.styles.css';

// ============================================
// TYPES
// ============================================
interface Conversation {
  id: string;
  contact: ContactLike;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  lastMessageType?: string;
  lastMessageDirection?: 'INBOUND' | 'OUTBOUND';
  lastMessageStatus?: string;
  lastCustomerMessageAt?: string | null;
  unreadCount: number;
  isArchived?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  isWindowOpen?: boolean;
  windowExpiresAt?: string | null;
  labels?: string[];
  isTyping?: boolean;
  assignedTo?: { id: string; name: string } | null;
  createdAt?: string;
}

type FilterTab = 'all' | 'unread' | 'archived';

// ============================================
// QUICK REPLIES (localStorage based)
// ============================================
const QR_STORAGE_KEY = 'wabmeta_quick_replies';

const loadQuickReplies = (): QuickReply[] => {
  try {
    const data = localStorage.getItem(QR_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  // Default quick replies
  return [
    {
      id: 'qr-1',
      shortcut: 'welcome',
      text: 'Hello! 👋 Thanks for reaching out. How can I help you today?',
      category: 'Greetings',
    },
    {
      id: 'qr-2',
      shortcut: 'thanks',
      text: 'Thank you for your message. We appreciate your patience!',
      category: 'Greetings',
    },
    {
      id: 'qr-3',
      shortcut: 'hours',
      text: 'Our business hours are Monday to Friday, 9 AM to 6 PM IST.',
      category: 'Info',
    },
    {
      id: 'qr-4',
      shortcut: 'pricing',
      text: 'You can find our pricing details on our website. Would you like me to send you the link?',
      category: 'Sales',
    },
    {
      id: 'qr-5',
      shortcut: 'bye',
      text: 'Thank you for chatting with us! Have a great day! 🙌',
      category: 'Greetings',
    },
  ];
};

const saveQuickReplies = (qrs: QuickReply[]) => {
  try {
    localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(qrs));
  } catch {}
};

// ============================================
// NOTES (localStorage based per conversation)
// ============================================
const NOTES_KEY = (convId: string) => `wabmeta_notes_${convId}`;

const loadNotes = (convId: string): Note[] => {
  try {
    const data = localStorage.getItem(NOTES_KEY(convId));
    if (data) return JSON.parse(data);
  } catch {}
  return [];
};

const saveNotes = (convId: string, notes: Note[]) => {
  try {
    localStorage.setItem(NOTES_KEY(convId), JSON.stringify(notes));
  } catch {}
};

// ============================================
// MAIN COMPONENT
// ============================================
const Inbox: React.FC = () => {
  const { conversationId: urlConvId } = useParams();
  const navigate = useNavigate();
  const { decrementUnread } = useApp();

  // ============================================
  // REFS
  // ============================================
  const selectedConvRef = useRef<Conversation | null>(null);
  const fetchingMessagesRef = useRef(false);
  const lastFetchedConvId = useRef<string | null>(null);
  const sentMessageIds = useRef<Set<string>>(new Set());
  const tempToRealIdMap = useRef<Map<string, string>>(new Map());

  // ============================================
  // STATE
  // ============================================
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [whatsappAccountId, setWhatsappAccountId] = useState<string | null>(null);
  const [labels, setLabels] = useState<{label: string, count: number, color?: string}[]>([]);

  // UI State
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Reply / forward
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  // Message search
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);

  // Quick replies
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(loadQuickReplies);

  // Notes (per conversation)
  const [notes, setNotes] = useState<Note[]>([]);

  // Typing indicator (for current conversation)
  const [isContactTyping, setIsContactTyping] = useState(false);

  // ============================================
  // SYNC REFS
  // ============================================
  const filterRef = useRef<FilterTab>(filter);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  useEffect(() => {
    selectedConvRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    saveQuickReplies(quickReplies);
  }, [quickReplies]);

  useEffect(() => {
    if (selectedConversation) {
      setNotes(loadNotes(selectedConversation.id));
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (selectedConversation) {
      saveNotes(selectedConversation.id, notes);
    }
  }, [notes, selectedConversation?.id]);

  // ============================================
  // FETCH WHATSAPP ACCOUNT
  // ============================================
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await whatsappApi.accounts();
        const accounts: any[] = res.data?.data?.accounts || [];
        const connected = accounts.find((a: any) => a.status === 'CONNECTED');
        const accountId = connected?.id || accounts[0]?.id;
        if (accountId) setWhatsappAccountId(accountId);
      } catch (e) {
        console.error('Failed to fetch WA accounts:', e);
      }
    };
    fetchAccount();
  }, []);

  // ============================================
  // FETCH LABELS
  // ============================================
  const fetchLabels = async () => {
    try {
      const res = await inboxApi.getLabels();
      if (res.data.success) {
        setLabels(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch labels:', e);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  const handleCreateCustomLabel = async (label: string, color?: string) => {
    try {
      await inboxApi.createCustomLabel(label, color);
      fetchLabels();
    } catch (e) {
      console.error('Failed to create custom label:', e);
      toast.error('Failed to create label');
    }
  };

  // ============================================
  // FETCH CONVERSATIONS
  // ============================================
  const fetchConversations = useCallback(
    async (silent = false) => {
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
        } else if (filter !== 'all') {
          params.isArchived = false;
          params.labels = filter;
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
    },
    [searchQuery, filter]
  );

  // ============================================
  // FETCH MESSAGES
  // ============================================
  const fetchMessages = useCallback(
    async (convId: string, force = false) => {
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

          msgs.sort(
            (a, b) =>
              new Date(a.createdAt || a.timestamp).getTime() -
              new Date(b.createdAt || b.timestamp).getTime()
          );

          sentMessageIds.current.clear();
          msgs.forEach((m: any) => {
            if (m.waMessageId) sentMessageIds.current.add(m.waMessageId);
            if (m.wamId) sentMessageIds.current.add(m.wamId);
            sentMessageIds.current.add(m.id);
          });

          setMessages(msgs);
          lastFetchedConvId.current = convId;

          // Mark as read
          inboxApi.markAsRead(convId).catch(() => {});
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId ? { ...c, unreadCount: 0, isRead: true } : c
            )
          );
        }
      } catch (e) {
        console.error('fetchMessages error:', e);
        toast.error('Failed to load messages');
        setMessages([]);
      } finally {
        setLoadingMessages(false);
        fetchingMessagesRef.current = false;
      }
    },
    [messages.length]
  );

  // ============================================
  // SELECT CONVERSATION
  // ============================================
  const selectConversation = useCallback(
    (conv: Conversation) => {
      if (selectedConvRef.current?.id === conv.id) {
        setShowMobileChat(true);
        return;
      }
      setMessages([]);
      setReplyTo(null);
      setShowMessageSearch(false);
      setMessageSearchQuery('');
      setIsContactTyping(false);
      lastFetchedConvId.current = null;
      sentMessageIds.current.clear();
      tempToRealIdMap.current.clear();
      setSelectedConversation(conv);
      setShowContactInfo(false);
      setShowMobileChat(true);
      navigate(`/dashboard/inbox/${conv.id}`);
      fetchMessages(conv.id);

      if (conv.unreadCount > 0) {
        decrementUnread(conv.id);
      }
    },
    [navigate, fetchMessages, decrementUnread]
  );

  // ============================================
  // SEND TEXT MESSAGE
  // ============================================
  const handleSendMessage = useCallback(
    async (text: string, options?: { replyToId?: string }) => {
      if (!text.trim() || !selectedConvRef.current) return;

      const conv = selectedConvRef.current;
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // Build reply info if replying
      let replyToData: Message['replyTo'] | undefined;
      if (options?.replyToId) {
        const repliedMsg = messages.find((m) => m.id === options.replyToId);
        if (repliedMsg) {
          replyToData = {
            id: repliedMsg.id,
            content: repliedMsg.content,
            direction: repliedMsg.direction,
            type: repliedMsg.type,
            senderName: getContactName(conv.contact),
          };
        }
      }

      const tempMessage: Message = {
        id: tempId,
        content: text,
        type: 'TEXT',
        direction: 'OUTBOUND',
        status: 'PENDING',
        createdAt: now,
        timestamp: now,
        replyTo: replyToData,
      };

      sentMessageIds.current.add(tempId);
      setMessages((prev) => [...prev, tempMessage]);

      try {
        if (!whatsappAccountId) throw new Error('No WhatsApp account connected');

        const response = await whatsappApi.sendText({
          whatsappAccountId,
          to: conv.contact.phone,
          message: text,
          tempId,
          ...(options?.replyToId && { replyToWamId: options.replyToId }),
        } as any);

        if (response.data.success) {
          const realMsg = response.data.data as any;
          const realId = realMsg?.id || realMsg?.waMessageId;
          const realWamId = realMsg?.waMessageId || realMsg?.wamId;

          if (realId) sentMessageIds.current.add(realId);
          if (realWamId) sentMessageIds.current.add(realWamId);
          if (realId) tempToRealIdMap.current.set(tempId, realId);

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
                replyTo: replyToData,
              };
            })
          );

          setConversations((prev) =>
            sortConversations(
              prev.map((c) =>
                c.id === conv.id
                  ? {
                      ...c,
                      lastMessagePreview: text.substring(0, 60),
                      lastMessageAt: now,
                      lastMessageDirection: 'OUTBOUND',
                      lastMessageStatus: 'SENT',
                    }
                  : c
              )
            )
          );
        } else {
          throw new Error(response.data.message || 'Failed to send');
        }
      } catch (e: any) {
        console.error('Send error:', e);
        const errMessage = e.response?.data?.message || e.message;
        if (errMessage === 'TRIAL_CHAT_LIMIT_REACHED') {
          setShowUpgradeModal(true);
        } else {
          toast.error(errMessage || 'Failed to send message');
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'FAILED' } : m))
        );
        sentMessageIds.current.delete(tempId);
      }
    },
    [whatsappAccountId, messages]
  );

  // ============================================
  // SEND MEDIA
  // ============================================
  const handleUploadAndSendMedia = useCallback(
    async (file: File) => {
      if (!selectedConvRef.current) return;

      const conv = selectedConvRef.current;
      const tempId = `temp-media-${Date.now()}`;
      const mime = file.type || '';

      const tempType: Message['type'] = mime.startsWith('image/')
        ? 'IMAGE'
        : mime.startsWith('video/')
        ? 'VIDEO'
        : mime.startsWith('audio/')
        ? 'AUDIO'
        : 'DOCUMENT';

      const tempMsg: Message = {
        id: tempId,
        content: file.name,
        type: tempType,
        direction: 'OUTBOUND',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        mediaUrl: mime.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        fileName: file.name,
      };

      sentMessageIds.current.add(tempId);
      setMessages((prev) => [...prev, tempMsg]);

      try {
        const uploadToast = toast.loading('Uploading...');
        const form = new FormData();
        form.append('file', file);
        const uploadRes = await api.post('/inbox/media/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.dismiss(uploadToast);

        const uploaded = uploadRes.data?.data;
        if (!uploaded?.url || !uploaded?.mediaType) throw new Error('Upload failed');

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

        toast.success('Sent!');
      } catch (e: any) {
        toast.dismiss();
        const errMessage = e.response?.data?.message || e.message;
        if (errMessage === 'TRIAL_CHAT_LIMIT_REACHED') {
          setShowUpgradeModal(true);
        } else {
          toast.error(errMessage || 'Failed to send media');
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'FAILED' } : m))
        );
        sentMessageIds.current.delete(tempId);
      }
    },
    []
  );

  // ============================================
  // SEND VOICE MESSAGE
  // ============================================
  const handleSendVoice = useCallback(
    async (blob: Blob, duration: number) => {
      if (!selectedConvRef.current) return;
      
      // ✅ Determine correct file extension from blob type
      let extension = 'ogg'; // default
      const mimeType = blob.type;
      
      if (mimeType.includes('ogg')) extension = 'ogg';
      else if (mimeType.includes('mp4')) extension = 'm4a';
      else if (mimeType.includes('mpeg')) extension = 'mp3';
      else if (mimeType.includes('webm')) extension = 'webm';
      
      const fileName = `voice-${Date.now()}.${extension}`;
      
      // ✅ Create file with correct extension AND audio mime type
      const file = new File([blob], fileName, { 
        type: blob.type 
      });
      
      console.log('🎤 Sending voice:', { 
        fileName, 
        mimeType: blob.type, 
        size: blob.size,
        duration 
      });
      
      await handleUploadAndSendMedia(file);
    },
    [handleUploadAndSendMedia]
  );

  // ============================================
  // TYPING INDICATOR (AGENT)
  // ============================================
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = useCallback(
    async (isTyping: boolean) => {
      if (!isTyping || !selectedConvRef.current) return;
      
      // Prevent spamming the API, only send once every 10 seconds
      if (typingTimerRef.current) return;
      
      try {
        await api.post(`/inbox/conversations/${selectedConvRef.current.id}/typing`);
      } catch (err) {
        console.error('Failed to send typing indicator', err);
      }
      
      typingTimerRef.current = setTimeout(() => {
        typingTimerRef.current = null;
      }, 10000); // 10s cooldown
    },
    []
  );

  // ============================================
  // PIN / ARCHIVE / LABELS
  // ============================================
  const handlePinConversation = useCallback(
    async (conv: Conversation, e: React.MouseEvent) => {
      e.stopPropagation();
      const newPinned = !conv.isPinned;
      try {
        setConversations((prev) =>
          sortConversations(
            prev.map((c) => (c.id === conv.id ? { ...c, isPinned: newPinned } : c))
          )
        );
        await api.patch(`/inbox/conversations/${conv.id}/pin`, { isPinned: newPinned });
        toast.success(newPinned ? 'Pinned' : 'Unpinned');
      } catch {
        toast.error('Failed to update pin');
        setConversations((prev) =>
          sortConversations(
            prev.map((c) => (c.id === conv.id ? { ...c, isPinned: !newPinned } : c))
          )
        );
      }
    },
    []
  );

  const handleArchiveConversation = useCallback(
    async (conv: Conversation, e: React.MouseEvent) => {
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
      }
    },
    [fetchConversations, navigate]
  );

  const handleClearChat = useCallback(async (conv: Conversation) => {
    if (window.confirm('Are you sure you want to clear this chat? This will only remove messages locally.')) {
      setMessages([]);
      toast.success('Chat cleared locally');
    }
  }, []);

  const handleDeleteAll = useCallback(async () => {
    if (
      window.confirm(
        'Are you sure you want to delete ALL conversations? This will permanently delete all messages and chats from the database. This action cannot be undone.'
      )
    ) {
      try {
        await inboxApi.deleteAllConversations();
        setConversations([]);
        setSelectedConversation(null);
        setMessages([]);
        toast.success('All conversations deleted successfully');
      } catch (err) {
        toast.error('Failed to delete conversations');
      }
    }
  }, []);

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedConversationIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedConversationIds(ids);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedConversationIds([]);
  }, []);

  const handleBulkArchive = useCallback(async (isArchived: boolean) => {
    if (selectedConversationIds.length === 0) return;
    try {
      await inboxApi.bulkUpdate({ conversationIds: selectedConversationIds, isArchived });
      setConversations((prev) =>
        prev.map((c) =>
          selectedConversationIds.includes(c.id) ? { ...c, isArchived } : c
        )
      );
      handleClearSelection();
      toast.success(`Conversations ${isArchived ? 'archived' : 'unarchived'}`);
    } catch (err) {
      toast.error('Failed to update conversations');
    }
  }, [selectedConversationIds, handleClearSelection]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedConversationIds.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedConversationIds.length} conversation(s)? This action cannot be undone.`
      )
    ) {
      try {
        await inboxApi.bulkDeleteConversations(selectedConversationIds);
        setConversations((prev) =>
          prev.filter((c) => !selectedConversationIds.includes(c.id))
        );
        if (selectedConversation?.id && selectedConversationIds.includes(selectedConversation.id)) {
          setSelectedConversation(null);
          setMessages([]);
        }
        handleClearSelection();
        toast.success('Conversations deleted');
      } catch (err) {
        toast.error('Failed to delete conversations');
      }
    }
  }, [selectedConversationIds, handleClearSelection, selectedConversation]);

  const handleAddLabel = useCallback(async (conv: Conversation, label: string) => {
    try {
      await inboxApi.addLabels(conv.id, [label]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id
            ? { ...c, labels: [label] }
            : c
        )
      );
      if (selectedConversation?.id === conv.id) {
        setSelectedConversation((prev) =>
          prev ? { ...prev, labels: [label] } : prev
        );
      }
      fetchLabels(); // refresh counts
    } catch (err) {
      console.error('Add label failed:', err);
      toast.error('Failed to add label');
    }
  }, []);

  const handleRemoveLabel = useCallback(
    async (conv: Conversation, label: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      try {
        await inboxApi.removeLabel(conv.id, label);
        const updatedLabels = (conv.labels || []).filter((l) => l !== label);
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, labels: updatedLabels } : c))
        );
        if (selectedConvRef.current?.id === conv.id) {
          setSelectedConversation((prev) =>
            prev ? { ...prev, labels: updatedLabels } : prev
          );
        }
        fetchLabels(); // refresh counts
      } catch {
        toast.error('Failed to remove label');
      }
    },
    []
  );

  // ============================================
  // MESSAGE ACTIONS (Reply, Forward, Star, React)
  // ============================================
  const handleReplyMessage = useCallback((msg: Message) => {
    setReplyTo(msg);
  }, []);

  const handleForwardMessage = useCallback((msg: Message) => {
    // TODO: Open forward modal with conversation picker
    toast('Forward feature coming soon!', { icon: '🚧' });
    console.log('Forward:', msg);
  }, []);

  const handleStarMessage = useCallback(
    async (msg: Message) => {
      if (!selectedConvRef.current) return;
      const newStarred = !msg.isStarred;
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isStarred: newStarred } : m))
      );
      try {
        await api.patch(
          `/inbox/conversations/${selectedConvRef.current.id}/messages/${msg.id}/star`,
          { starred: newStarred }
        );
        toast.success(newStarred ? '⭐ Starred' : 'Unstarred');
      } catch {
        // Revert
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isStarred: msg.isStarred } : m))
        );
      }
    },
    []
  );

  const handleReactMessage = useCallback(
    async (msg: Message, emoji: string) => {
      if (!selectedConvRef.current) return;

      const existingReactions = msg.reactions || [];
      const userReaction = existingReactions.find((r) => r.userId === 'self');

      let newReactions;
      if (userReaction?.emoji === emoji) {
        // Toggle off
        newReactions = existingReactions.filter((r) => r.userId !== 'self');
      } else {
        // Replace or add
        newReactions = existingReactions.filter((r) => r.userId !== 'self');
        newReactions.push({ emoji, userId: 'self' });
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, reactions: newReactions } : m))
      );

      try {
        await api.post(
          `/inbox/conversations/${selectedConvRef.current.id}/messages/${msg.id}/react`,
          { emoji: userReaction?.emoji === emoji ? null : emoji }
        );
      } catch {
        // Revert
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, reactions: existingReactions } : m
          )
        );
      }
    },
    []
  );

  const handleJumpToMessage = useCallback((messageId: string) => {
    const el = document.querySelector(`[data-message-id="${messageId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('animate-fade-in');
      setTimeout(() => el.classList.remove('animate-fade-in'), 2000);
    } else {
      toast('Message not in view', { icon: 'ℹ️' });
    }
  }, []);

  // ============================================
  // MESSAGE SEARCH
  // ============================================
  const searchResults = useMemo(() => {
    if (!messageSearchQuery.trim()) return [];
    const q = messageSearchQuery.toLowerCase();
    return messages
      .filter((m) => m.content?.toLowerCase().includes(q))
      .map((m) => m.id);
  }, [messageSearchQuery, messages]);

  const handleSearchNext = useCallback(() => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex((prev) => (prev + 1) % searchResults.length);
  }, [searchResults.length]);

  const handleSearchPrev = useCallback(() => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex((prev) =>
      prev <= 0 ? searchResults.length - 1 : prev - 1
    );
  }, [searchResults.length]);

  useEffect(() => {
    if (searchResults.length > 0 && currentSearchIndex === -1) {
      setCurrentSearchIndex(0);
    } else if (searchResults.length === 0) {
      setCurrentSearchIndex(-1);
    }
  }, [searchResults.length, currentSearchIndex]);

  // ============================================
  // NOTES HANDLERS
  // ============================================
  const handleAddNote = useCallback(async (text: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
      author: 'You',
    };
    setNotes((prev) => [newNote, ...prev]);
    toast.success('Note added');
  }, []);

  const handleUpdateNote = useCallback(async (id: string, text: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, text, updatedAt: new Date().toISOString() } : n
      )
    );
    toast.success('Note updated');
  }, []);

  const handleDeleteNote = useCallback(async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success('Note deleted');
  }, []);

  // ============================================
  // QUICK REPLIES HANDLERS
  // ============================================
  const handleAddQuickReply = useCallback(async (qr: Omit<QuickReply, 'id'>) => {
    const newQR: QuickReply = { ...qr, id: `qr-${Date.now()}` };
    setQuickReplies((prev) => [...prev, newQR]);
    toast.success('Quick reply added');
  }, []);

  const handleUpdateQuickReply = useCallback(
    async (id: string, update: Partial<QuickReply>) => {
      setQuickReplies((prev) =>
        prev.map((qr) => (qr.id === id ? { ...qr, ...update } : qr))
      );
      toast.success('Quick reply updated');
    },
    []
  );

  const handleDeleteQuickReply = useCallback(async (id: string) => {
    setQuickReplies((prev) => prev.filter((qr) => qr.id !== id));
    toast.success('Quick reply deleted');
  }, []);

  const handleQuickReplySelect = useCallback((qr: QuickReply) => {
    // Send directly or insert into input
    handleSendMessage(qr.text);
  }, [handleSendMessage]);

  // ============================================
  // SOCKET HANDLERS
  // ============================================
  useInboxSocket(
    selectedConversation?.id || null,

    // NEW MESSAGE
    useCallback(
      (newMsg: InboundMessage) => {
        if (!newMsg) return;
        const convId = newMsg.conversationId;
        const msgId = newMsg.id;
        const waId = newMsg.waMessageId || newMsg.wamId;
        const direction = newMsg.direction;

        if (!convId) return;

        const isCurrentConv = selectedConvRef.current?.id === convId;

        if (isCurrentConv) {
          setMessages((prev) => {
            const isDup = prev.some(
              (m) =>
                m.id === msgId || (waId && (m.waMessageId === waId || m.wamId === waId))
            );
            if (isDup) return prev;
            return [
              ...prev,
              {
                ...(newMsg as any),
                createdAt: newMsg.createdAt || new Date().toISOString(),
              },
            ];
          });
          
          if (direction === 'INBOUND') {
            inboxApi.markAsRead(convId).catch(() => {});
            setIsContactTyping(false);
          }
        }

        // Always update conversation list
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === convId);
          const updated = [...prev];

          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              lastMessagePreview: (newMsg.content || 'New message').substring(0, 60),
              lastMessageAt: newMsg.createdAt || new Date().toISOString(),
              lastMessageType: newMsg.type,
              lastMessageDirection: direction,
              unreadCount: (isCurrentConv || direction === 'OUTBOUND') ? 0 : (updated[idx].unreadCount || 0) + 1,
              ...(direction === 'INBOUND' ? { lastCustomerMessageAt: newMsg.createdAt || new Date().toISOString() } : {})
            };
          }

          return sortConversations(updated);
        });
      },
      []
    ),

    // CONVERSATION UPDATE
    useCallback((updatedConv: ConversationUpdate) => {
      if (!updatedConv?.id) return;

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === updatedConv.id);
        const currentFilter = filterRef.current;

        if (idx === -1) {
          if ((updatedConv as any).contact?.id) {
            if (currentFilter === 'archived' && !updatedConv.isArchived) return prev;
            if (currentFilter !== 'archived' && updatedConv.isArchived) return prev;
            return sortConversations([updatedConv as any, ...prev]);
          }
          return prev;
        }

        const updated = [...prev];
        const isCurrentlyOpen = selectedConvRef.current?.id === updatedConv.id;
        
        // Remove if it no longer matches the current filter
        if (currentFilter === 'archived' && !updatedConv.isArchived) {
          return sortConversations(updated.filter(c => c.id !== updatedConv.id));
        }
        if (currentFilter !== 'archived' && updatedConv.isArchived) {
          return sortConversations(updated.filter(c => c.id !== updatedConv.id));
        }

        updated[idx] = { 
          ...updated[idx], 
          ...updatedConv,
          // Prevent backend webhook from overriding unread count if the chat is actively open
          ...(isCurrentlyOpen ? { unreadCount: 0, isRead: true } : {})
        };
        return sortConversations(updated);
      });

      if (selectedConvRef.current?.id === updatedConv.id) {
        setSelectedConversation((prev) =>
          prev ? { ...prev, ...updatedConv, unreadCount: 0, isRead: true } : prev
        );
      }
    }, []),

    // MESSAGE STATUS
    useCallback((statusUpdate: MessageStatusUpdate) => {
      if (!statusUpdate?.status) return;

      const newStatus = statusUpdate.status.toUpperCase() as Message['status'];
      const rank: Record<string, number> = {
        PENDING: 0,
        SENT: 1,
        DELIVERED: 2,
        READ: 3,
        FAILED: -1,
      };

      setMessages((prev) =>
        prev.map((m) => {
          const isMatch =
            (statusUpdate.messageId && m.id === statusUpdate.messageId) ||
            (statusUpdate.tempId && m.id === statusUpdate.tempId) ||
            (statusUpdate.waMessageId &&
              ((m as any).waMessageId === statusUpdate.waMessageId ||
                (m as any).wamId === statusUpdate.waMessageId)) ||
            (statusUpdate.wamId &&
              ((m as any).waMessageId === statusUpdate.wamId ||
                (m as any).wamId === statusUpdate.wamId));

          if (!isMatch) return m;

          const curRank = rank[m.status || 'PENDING'] ?? 0;
          const newRank = rank[newStatus || 'PENDING'] ?? 0;

          if (newRank < curRank && newStatus !== 'FAILED') return m;

          return {
            ...m,
            status: newStatus,
            failureReason: statusUpdate.failureReason,
          };
        })
      );

      // Update conversation's last message status for the sidebar
      if (statusUpdate.conversationId) {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === statusUpdate.conversationId) {
              const curRank = rank[c.lastMessageStatus || 'PENDING'] ?? 0;
              const newRank = rank[newStatus || 'PENDING'] ?? 0;
              if (newRank >= curRank || newStatus === 'FAILED') {
                return { ...c, lastMessageStatus: newStatus };
              }
            }
            return c;
          })
        );
      }
    }, [])
  );

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    fetchConversations();
  }, [filter]);

  useEffect(() => {
    const t = setTimeout(() => fetchConversations(), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

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
  // KEYBOARD SHORTCUTS
  // ============================================
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F = Search messages
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && selectedConversation) {
        e.preventDefault();
        setShowMessageSearch(true);
      }

      // Ctrl/Cmd + / = Quick replies
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowQuickReplies(true);
      }

      // Esc = Close panels
      if (e.key === 'Escape') {
        if (showMessageSearch) setShowMessageSearch(false);
        else if (replyTo) setReplyTo(null);
        else if (showContactInfo) setShowContactInfo(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedConversation, showMessageSearch, replyTo, showContactInfo]);

  // ============================================
  // LOADING / ERROR STATES
  // ============================================
  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full chat-bg">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading inbox...</p>
        </div>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full chat-bg px-6">
        <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Inbox</h3>
        <p className="text-gray-400 mb-6 text-center max-w-md text-sm">{error}</p>
        <button
          onClick={() => fetchConversations()}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="flex h-full overflow-hidden relative chat-bg">
      {/* ─── Left Sidebar: Conversation List ─────────────────────────────── */}
      <div className={`
        flex-shrink-0
        w-full md:w-[340px] lg:w-[380px]
        h-full
        ${showMobileChat ? 'hidden md:block' : 'block'}
      `}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id}
          loading={loading}
          refreshing={refreshing}
          filter={filter}
          searchQuery={searchQuery}
          onFilterChange={setFilter}
          onSearchChange={setSearchQuery}
          onRefresh={() => {
            setRefreshing(true);
            fetchConversations();
          }}
          onSelectConversation={selectConversation}
          onPinConversation={handlePinConversation}
          onArchiveConversation={handleArchiveConversation}
          onAddLabel={handleAddLabel}
          onRemoveLabel={handleRemoveLabel}
          onCreateCustomLabel={handleCreateCustomLabel}
          labels={labels}
          onDeleteAll={handleDeleteAll}
          selectedConversationIds={selectedConversationIds}
          onToggleSelection={handleToggleSelection}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onBulkArchive={handleBulkArchive}
          onBulkDelete={handleBulkDelete}
        />
      </div>

      {/* ─── Center: Chat Window ─────────────────────────────────────────── */}
      <div className={`
        flex-1 flex flex-col h-full overflow-hidden min-w-0 w-full
        ${!showMobileChat ? 'hidden md:flex' : 'flex'}
      `}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              conversation={selectedConversation}
              showContactInfo={showContactInfo}
              isMobile={true}
              onBack={() => setShowMobileChat(false)}
              onToggleContactInfo={() => setShowContactInfo(!showContactInfo)}
              onCall={() => setShowCallScreen(true)}
              onSearchMessages={() => setShowMessageSearch(true)}
              onArchive={() => {
                const event = new MouseEvent('click') as any;
                handleArchiveConversation(selectedConversation, event);
              }}
              onClearChat={() => handleClearChat(selectedConversation)}
            />

            {/* Message Search Bar */}
            <MessageSearchBar
              isOpen={showMessageSearch}
              query={messageSearchQuery}
              resultsCount={searchResults.length}
              currentIndex={currentSearchIndex}
              onQueryChange={setMessageSearchQuery}
              onClose={() => {
                setShowMessageSearch(false);
                setMessageSearchQuery('');
              }}
              onNext={handleSearchNext}
              onPrev={handleSearchPrev}
            />

            {/* Window Status */}
            <WindowStatus
              windowExpiresAt={selectedConversation.windowExpiresAt || null}
              isWindowOpen={selectedConversation.isWindowOpen || false}
            />

            {/* Messages Container */}
            <ChatWindow
              messages={messages}
              conversationId={selectedConversation.id}
              contactName={getContactName(selectedConversation.contact)}
              loading={loadingMessages}
              searchQuery={messageSearchQuery}
              searchResultIds={searchResults}
              currentSearchIndex={currentSearchIndex}
              onReply={handleReplyMessage}
              onForward={handleForwardMessage}
              onStar={handleStarMessage}
              onReact={handleReactMessage}
              onDeleted={(msgId) => {
                setMessages((prev) => prev.filter((m) => m.id !== msgId));
              }}
              onEdited={(msgId, content) => {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === msgId ? { ...m, content, edited: true } : m
                  )
                );
              }}
              onJumpToMessage={handleJumpToMessage}
            />

            {/* Typing indicator */}
            {isContactTyping && (
              <TypingIndicator
                contactName={getContactName(selectedConversation.contact)}
              />
            )}

            {/* Chat Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onSendVoice={handleSendVoice}
              onMediaUpload={handleUploadAndSendMedia}
              onTyping={handleTyping}
              onOpenTemplateModal={() => setShowTemplateModal(true)}
              isWindowOpen={selectedConversation.isWindowOpen || false}
              windowExpiresAt={selectedConversation.windowExpiresAt}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              contactName={getContactName(selectedConversation.contact)}
              quickReplies={quickReplies}
            />
          </>
        ) : (
          <EmptyState onOpenQuickReplies={() => setShowQuickReplies(true)} />
        )}
      </div>

      {/* ─── Right Sidebar: Contact Info ─────────────────────────────────── */}
      {showContactInfo && selectedConversation && (
        <ContactInfoPanel
          conversation={selectedConversation}
          messages={messages}
          notes={notes}
          allLabels={labels}
          onClose={() => setShowContactInfo(false)}
          onAddLabel={(label) => handleAddLabel(selectedConversation, label)}
          onRemoveLabel={(label) => handleRemoveLabel(selectedConversation, label)}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onArchive={() => {
            const event = new MouseEvent('click') as any;
            handleArchiveConversation(selectedConversation, event);
          }}
          onViewProfile={() => {
            if (selectedConversation.contact.id) {
              navigate(`/dashboard/contacts/${selectedConversation.contact.id}`);
            }
          }}
        />
      )}

      {/* ─── Modals ─────────────────────────────────────────────────────── */}

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

      {/* Call Screen */}
      {showCallScreen && selectedConversation && (
        <CallScreen
          contact={selectedConversation.contact}
          conversationId={selectedConversation.id}
          onClose={() => setShowCallScreen(false)}
        />
      )}

      {/* Quick Replies Manager */}
      <QuickRepliesPanel
        isOpen={showQuickReplies}
        quickReplies={quickReplies}
        onClose={() => setShowQuickReplies(false)}
        onSelect={handleQuickReplySelect}
        onAdd={handleAddQuickReply}
        onUpdate={handleUpdateQuickReply}
        onDelete={handleDeleteQuickReply}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="10+ Contacts"
        minimumPlan="MONTHLY"
        message="You have reached your free demo limit of chatting with 10 contacts. Please upgrade your plan to continue."
      />
    </div>
  );
};

// ============================================
// EMPTY STATE
// ============================================
const EmptyState: React.FC<{ onOpenQuickReplies: () => void }> = ({
  onOpenQuickReplies,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center chat-bg p-6">
      <div className="text-center max-w-md">
        <div className="
          w-24 h-24 mx-auto mb-6
          bg-gradient-to-br from-emerald-500/20 to-emerald-600/10
          border border-emerald-500/20
          rounded-3xl flex items-center justify-center
          shadow-2xl shadow-emerald-500/10
        ">
          <MessageSquare className="w-12 h-12 text-emerald-400" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          Welcome to your Inbox
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Select a conversation from the left to start chatting, or use keyboard
          shortcuts to navigate faster.
        </p>

        {/* Quick tips */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            { keys: ['Ctrl', 'F'], label: 'Search messages' },
            { keys: ['Ctrl', '/'], label: 'Quick replies' },
            { keys: ['Esc'], label: 'Close panel' },
            { keys: ['/'], label: 'Insert reply' },
          ].map((tip, i) => (
            <div
              key={i}
              className="
                flex items-center gap-2 p-2.5
                bg-[#0a0e27]/[0.03] border border-white/[0.06]
                rounded-lg
              "
            >
              <div className="flex items-center gap-0.5">
                {tip.keys.map((k, ki) => (
                  <React.Fragment key={ki}>
                    {ki > 0 && <span className="text-gray-400 text-[10px]">+</span>}
                    <kbd className="
                      px-1.5 py-0.5
                      bg-[#0a0e27]/[0.06] border border-white/[0.08]
                      rounded text-[10px] font-mono text-gray-300
                    ">
                      {k}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
              <span className="text-[11px] text-gray-400 truncate">{tip.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onOpenQuickReplies}
          className="
            inline-flex items-center gap-2 px-4 py-2
            bg-[#0a0e27]/[0.04] hover:bg-[#0a0e27]/[0.08]
            border border-white/[0.08]
            rounded-xl
            text-sm text-gray-300 hover:text-white
            transition-all
          "
        >
          Manage Quick Replies
        </button>
      </div>
    </div>
  );
};

export default Inbox;