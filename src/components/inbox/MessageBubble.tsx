// src/components/inbox/MessageBubble.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  CheckCheck,
  Clock,
  Download,
  Play,
  Pause,
  FileText,
  MapPin,
  User,
  Video,
  Mic,
  X,
  ExternalLink,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Copy,
  Phone,
  ChevronRight,
  Trash2,
  Pencil,
  MoreVertical,
  Reply,
  Star,
  Forward,
  Smile,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatMessageTime, getAvatarColor } from '../../utils/inboxHelpers';

export interface Message {
  id: string;
  content: string;
  direction: 'INBOUND' | 'OUTBOUND';
  type: string;
  status?: string;
  timestamp: string;
  createdAt?: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaMimeType?: string | null;
  mediaId?: string | null;
  fileName?: string | null;
  failureReason?: string | null;
  metadata?: any;
  isStarred?: boolean;
  reactions?: Array<{ emoji: string; userId: string }>;
  replyTo?: {
    id: string;
    content: string;
    direction: 'INBOUND' | 'OUTBOUND';
    type?: string;
    senderName?: string;
  };
  isForwarded?: boolean;
  edited?: boolean;
  waMessageId?: string | null;
  wamId?: string | null;
}

interface Props {
  message: Message;
  conversationId?: string;
  showAvatar?: boolean;
  contactName?: string;
  isGrouped?: boolean;
  isHighlighted?: boolean;
  searchQuery?: string;
  onCopy?: (content: string) => void;
  onReply?: (msg: Message) => void;
  onForward?: (msg: Message) => void;
  onStar?: (msg: Message) => void;
  onReact?: (msg: Message, emoji: string) => void;
  onDeleted?: (messageId: string) => void;
  onEdited?: (messageId: string, content: string) => void;
  onJumpToMessage?: (messageId: string) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.wabmeta.com/api';
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const HIDE_DELAY_MS = 250;
const REACTION_HIDE_MS = 300;

// Force download helper
const forceDownload = async (
  url: string,
  filename: string,
  e?: React.MouseEvent,
  onProgress?: (progress: number | null) => void,
  isMounted = { current: true }
) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  onProgress?.(0);
  const loadingToast = toast.loading('Downloading...');

  try {
    if (url.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (isMounted.current) onProgress?.(100);
      toast.dismiss(loadingToast);
      toast.success('Download complete');
      return;
    }

    if (url.includes('/inbox/media/')) {
      const mediaId = url.split('/inbox/media/')[1]?.split('?')[0];
      if (!mediaId) throw new Error('Invalid media URL');

      const queryParams = url.includes('?') ? `?${url.split('?')[1]}` : '';
      const response = await api.get(`/inbox/media/${mediaId}${queryParams}`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (!isMounted.current) return;
          if (progressEvent.total && progressEvent.total > 0) {
            const percent = Math.min(99, Math.round((progressEvent.loaded * 100) / progressEvent.total));
            onProgress?.(percent);
            toast.loading(`Downloading ${percent}%...`, { id: loadingToast });
          } else if (progressEvent.loaded) {
            onProgress?.(null);
          }
        },
      });

      if (!isMounted.current) return;
      onProgress?.(100);
      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || `file_${mediaId}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      toast.dismiss(loadingToast);
      toast.success('Download complete');
      return;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed');

    const contentLength = response.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

    let blob: Blob;
    if (response.body && totalBytes > 0) {
      const reader = response.body.getReader();
      let receivedBytes = 0;
      const chunks: BlobPart[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedBytes += value.length;
        if (isMounted.current) {
          const percent = Math.min(99, Math.round((receivedBytes * 100) / totalBytes));
          onProgress?.(percent);
          toast.loading(`Downloading ${percent}%...`, { id: loadingToast });
        }
      }

      const mimeType = response.headers.get('content-type') || 'application/octet-stream';
      blob = new Blob(chunks, { type: mimeType });
    } else {
      blob = await response.blob();
    }

    if (!isMounted.current) return;
    onProgress?.(100);
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    toast.dismiss(loadingToast);
    toast.success('Download complete');

  } catch (error: any) {
    console.error('Download error:', error);
    toast.dismiss(loadingToast);
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success('Opened in new tab');
    } catch {
      toast.error('Download failed. Please try again.');
    }
    throw error;
  }
};

function parseTemplateContent(content: string, meta: any): {
  isTemplate: boolean;
  headerText?: string;
  bodyText: string;
  footerText?: string;
  buttons: Array<{ type: string; text: string; url?: string; phone?: string }>;
  templateName?: string;
  mediaUrl?: string;
  mediaType?: string;
} {
  if (!content) return { isTemplate: false, bodyText: '', buttons: [] };

  if (content.startsWith('{') && (content.includes('templateName') || content.includes('bodyText'))) {
    try {
      const p = JSON.parse(content);
      return {
        isTemplate: true,
        templateName: p.templateName || p.name,
        headerText: p.header || p.headerText,
        bodyText: p.body || p.bodyText || p.templateName || '',
        footerText: p.footer || p.footerText,
        buttons: normalizeButtons(p.buttons || meta?.buttons || []),
        mediaUrl: p.mediaUrl || p.headerMediaUrl,
        mediaType: p.mediaType || p.headerType,
      };
    } catch { }
  }

  if (content.startsWith('Campaign:') || content.startsWith('Template:')) {
    const lines = content.split('\n');
    const campaignLine = lines.find((l) => l.startsWith('Campaign:'));
    const templateLine = lines.find((l) => l.startsWith('Template:'));
    const templateName = templateLine?.replace('Template:', '').trim() || 'Template';
    const bodyText = meta?.bodyText || meta?.body || '';
    return {
      isTemplate: true,
      templateName: templateLine?.replace('Template:', '').trim(),
      headerText: campaignLine || undefined,
      bodyText: bodyText || `📋 ${templateName.replace(/_/g, ' ')}`,
      buttons: normalizeButtons(meta?.buttons || []),
    };
  }

  return {
    isTemplate: false,
    templateName: meta?.templateName || meta?.template_name || undefined,
    bodyText: content,
    buttons: normalizeButtons(meta?.buttons || []),
  };
}

function normalizeButtons(raw: any[]): Array<{ type: string; text: string; url?: string; phone?: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((b: any) => ({
      type: (b.type || 'QUICK_REPLY').toUpperCase(),
      text: b.text || b.title || '',
      url: b.url,
      phone: b.phone_number || b.phone,
    }))
    .filter((b) => b.text);
}

function getMediaSrc(msg: Message): string | null {
  const url = msg.mediaUrl;
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  const mimeType = msg.mediaMimeType?.toLowerCase() || '';
  const isDocument = mimeType === 'application/pdf' ||
    mimeType.includes('document') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation');

  if (isDocument && msg.mediaId) {
    return `${API_BASE}/inbox/media/${msg.mediaId.trim()}`;
  }
  if (url.includes('cloudinary.com')) return url;
  if (url.startsWith('https://') && !url.includes('lookaside.fbsbx.com') && !url.includes('mmg.whatsapp.net') && !url.includes('scontent')) {
    return url;
  }
  if (msg.mediaId && /^\d+$/.test(msg.mediaId.trim())) {
    return `${API_BASE}/inbox/media/${msg.mediaId.trim()}`;
  }
  if (url && !url.startsWith('http') && /^\d+$/.test(url.trim())) {
    return `${API_BASE}/inbox/media/${url.trim()}`;
  }
  if (url?.startsWith('http') && msg.mediaId) {
    return `${API_BASE}/inbox/media/${msg.mediaId}`;
  }
  return null;
}

function HighlightedText({ text, query }: { text: string; query?: string }) {
  if (!query?.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-400/40 text-yellow-100 rounded px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function TextWithLinks({ text, query, isOutbound }: { text: string; query?: string; isOutbound?: boolean }) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  if (parts.length === 1) return <HighlightedText text={text} query={query} />;
  const linkClass = isOutbound
    ? "text-sky-300 hover:text-sky-100 underline break-all font-semibold transition-colors"
    : "text-emerald-600 hover:text-emerald-700 underline break-all font-semibold transition-colors";
  return (
    <>
      {parts.map((part, i) => {
        if (/^https?:\/\/[^\s]+$/.test(part)) {
          return (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {part}
            </a>
          );
        }
        return <HighlightedText key={i} text={part} query={query} />;
      })}
    </>
  );
}

const MessageBubble: React.FC<Props> = ({
  message,
  conversationId,
  showAvatar = false,
  contactName,
  isGrouped = false,
  isHighlighted = false,
  searchQuery = '',
  onCopy,
  onReply,
  onForward,
  onStar,
  onReact,
  onDeleted,
  onEdited,
  onJumpToMessage,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [isBubbleHovered, setBubbleHovered] = useState(false);
  const [isToolbarHovered, setToolbarHovered] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isReactionsOpen, setReactionsOpen] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content || '');
  const [deleting, setDeleting] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const handleDownload = async (url: string, filename: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (downloadState === 'downloading') return;

    setDownloadState('downloading');
    setDownloadProgress(0);

    try {
      await forceDownload(url, filename, e, (progress) => {
        if (isMountedRef.current) setDownloadProgress(progress);
      }, isMountedRef);

      if (isMountedRef.current) {
        setDownloadState('completed');
        setTimeout(() => {
          if (isMountedRef.current) {
            setDownloadState('idle');
            setDownloadProgress(null);
          }
        }, 2500);
      }
    } catch {
      if (isMountedRef.current) {
        setDownloadState('error');
        setTimeout(() => {
          if (isMountedRef.current) {
            setDownloadState('idle');
            setDownloadProgress(null);
          }
        }, 3000);
      }
    }
  };

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactionHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const reactionRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOutbound = message.direction === 'OUTBOUND';
  const msgType = (message.type || '').toLowerCase();
  const meta = message.metadata || {};
  const canEdit = isOutbound && msgType === 'text' && !!conversationId;
  const canDelete = !!conversationId;
  const isDeleted = message.content === '[revoke]' || message.content === '[Revoke]';

  const showActions = (isBubbleHovered || isToolbarHovered || isMenuOpen || isReactionsOpen) && !isEditing && !isDeleted;

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setBubbleHovered(false);
      setToolbarHovered(false);
    }, HIDE_DELAY_MS);
  }, [clearHideTimer]);

  const handleBubbleEnter = useCallback(() => {
    clearHideTimer();
    setBubbleHovered(true);
  }, [clearHideTimer]);

  const handleBubbleLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const handleToolbarEnter = useCallback(() => {
    clearHideTimer();
    setToolbarHovered(true);
  }, [clearHideTimer]);

  const handleToolbarLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const clearReactionTimer = useCallback(() => {
    if (reactionHideTimerRef.current) {
      clearTimeout(reactionHideTimerRef.current);
      reactionHideTimerRef.current = null;
    }
  }, []);

  const openReactions = useCallback(() => {
    clearReactionTimer();
    setReactionsOpen(true);
  }, [clearReactionTimer]);

  const scheduleReactionsClose = useCallback(() => {
    clearReactionTimer();
    reactionHideTimerRef.current = setTimeout(() => {
      setReactionsOpen(false);
    }, REACTION_HIDE_MS);
  }, [clearReactionTimer]);

  useEffect(() => {
    return () => {
      clearHideTimer();
      clearReactionTimer();
    };
  }, [clearHideTimer, clearReactionTimer]);

  useEffect(() => {
    if (!isMenuOpen && !isReactionsOpen) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
      if (isReactionsOpen && reactionRef.current && !reactionRef.current.contains(target)) {
        setReactionsOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [isMenuOpen, isReactionsOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setReactionsOpen(false);
        setShowDeleteConfirm(false);
        if (isEditing) setIsEditing(false);
        if (showFullImage) setShowFullImage(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isEditing, showFullImage]);

  useEffect(() => {
    if (isEditing) setTimeout(() => editRef.current?.focus(), 50);
  }, [isEditing]);

  useEffect(() => {
    if (isHighlighted && bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  const handleDelete = async () => {
    if (!conversationId) return;
    setDeleting(true);
    try {
      await api.delete(`/inbox/conversations/${conversationId}/messages/${message.id}`);
      onDeleted?.(message.id);
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setMenuOpen(false);
    }
  };

  const handleEdit = async () => {
    if (!conversationId || !editText.trim()) return;
    setEditSaving(true);
    try {
      await api.patch(`/inbox/conversations/${conversationId}/messages/${message.id}`, {
        content: editText.trim(),
      });
      onEdited?.(message.id, editText.trim());
      toast.success('Message updated');
      setIsEditing(false);
    } catch {
      toast.error('Failed to edit message');
    } finally {
      setEditSaving(false);
    }
  };

  const StatusIcon = () => {
    if (!isOutbound) return null;
    const status = message.status?.toUpperCase();
    switch (status) {
      case 'SENT': return <Check className="w-3.5 h-3.5 text-white/70" />;
      case 'DELIVERED': return <CheckCheck className="w-3.5 h-3.5 text-white/70" />;
      case 'READ': return <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />;
      case 'FAILED': return <AlertCircle className="w-3.5 h-3.5 text-red-300" />;
      default: return <Clock className="w-3 h-3 text-white/50 animate-pulse" />;
    }
  };

  const renderAvatar = () => {
    if (!showAvatar || isOutbound) return null;
    const name = contactName || 'U';
    const initial = name.charAt(0).toUpperCase();
    const color = getAvatarColor(name);
    return (
      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 self-end mb-0.5 ring-2 ring-white`}>
        {initial}
      </div>
    );
  };

  const renderImage = (src?: string | null, caption?: string) => {
    const imgSrc = src || getMediaSrc(message);
    if (!imgSrc) {
      return (
        <div className={`w-56 h-40 ${isOutbound ? 'bg-black/10 border-white/10' : 'bg-gray-100 border-gray-200'} rounded-xl flex flex-col items-center justify-center gap-2 border`}>
          <span className="text-3xl opacity-50">🖼️</span>
          <span className={`text-xs ${isOutbound ? 'text-white/60' : 'text-gray-400 font-semibold'}`}>Image unavailable</span>
        </div>
      );
    }
    return (
      <div className="relative max-w-xs">
        {imageLoading && !imageError && (
          <div className={`w-56 h-40 ${isOutbound ? 'bg-black/10 border-white/10' : 'bg-gray-100 border-gray-200'} rounded-xl flex items-center justify-center animate-pulse border`}>
            <div className={`w-7 h-7 border-2 ${isOutbound ? 'border-emerald-350' : 'border-emerald-500'} border-t-transparent rounded-full animate-spin`} />
          </div>
        )}
        {imageError && (
          <div className={`w-56 h-40 ${isOutbound ? 'bg-black/10 border-white/10' : 'bg-gray-100 border-gray-200'} rounded-xl flex flex-col items-center justify-center gap-2 border`}>
            <span className="text-3xl opacity-50">🖼️</span>
            <span className={`text-xs ${isOutbound ? 'text-white/60' : 'text-gray-500 font-bold'}`}>Media unavailable</span>
            <button
              onClick={() => {
                setImageError(false);
                setImageLoading(true);
                setRetryCount((p) => p + 1);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 ${isOutbound ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'} text-xs font-bold rounded-md transition-colors`}
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}
        <img
          key={`${imgSrc}-${retryCount}`}
          src={imgSrc}
          alt="Image"
          className={`max-w-full rounded-xl cursor-zoom-in hover:opacity-95 transition-all shadow-md ${imageLoading || imageError ? 'hidden' : 'block'}`}
          style={{ maxHeight: 300, maxWidth: 280 }}
          onLoad={() => { setImageLoading(false); setImageError(false); }}
          onError={() => { setImageLoading(false); setImageError(true); }}
          onClick={() => !imageError && setShowFullImage(true)}
        />
        {caption && <p className="mt-1.5 text-sm px-1 leading-relaxed font-medium">{caption}</p>}

        {showFullImage && !imageError && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowFullImage(false)}>
            <button className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm" onClick={() => setShowFullImage(false)}>
              <X className="w-5 h-5" />
            </button>
            <img src={imgSrc} alt="Full" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
            <button
              className="absolute bottom-4 right-4 p-2.5 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition-all animate-fade-in"
              onClick={(e) => handleDownload(imgSrc, 'image.jpg', e)}
              disabled={downloadState === 'downloading'}
              title={downloadState === 'downloading' ? `Downloading ${downloadProgress !== null ? `${downloadProgress}%` : '...'}` : 'Download'}
            >
              {downloadState === 'downloading' ? (
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
              ) : downloadState === 'completed' ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          </div>,
          document.body
        )}
      </div>
    );
  };

  const renderVideo = (src?: string | null, caption?: string) => {
    const vidSrc = src || getMediaSrc(message);
    if (!vidSrc) {
      return (
        <div className="w-64 h-40 bg-black/5 rounded-xl flex flex-col items-center justify-center text-gray-450 border border-white/10">
          <Video className="w-8 h-8 mb-2 opacity-50 text-gray-400" />
          <span className="text-xs font-semibold">Video unavailable</span>
        </div>
      );
    }
    return (
      <div className="relative max-w-xs animate-scale-in">
        <video src={vidSrc} controls className="max-w-full rounded-xl shadow-lg border border-gray-150" preload="metadata" style={{ maxHeight: 300 }} />
        {caption && <p className="mt-1.5 text-sm px-1 leading-relaxed font-semibold">{caption}</p>}
      </div>
    );
  };

  const renderAudio = () => {
    const src = getMediaSrc(message);
    const audioId = `audio-${message.id}`;
    const toggle = () => {
      const el = document.getElementById(audioId) as HTMLAudioElement;
      if (el) { if (isPlaying) el.pause(); else el.play(); }
    };
    return (
      <div className="flex items-center gap-3 min-w-[240px]">
        <button onClick={toggle} className="w-10 h-10 flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-0.5 h-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className={`w-0.5 rounded-full transition-all ${isPlaying ? 'wave-bar bg-emerald-400 animate-pulse' : (isOutbound ? 'bg-white/30' : 'bg-gray-300')}`} style={{ height: `${30 + (Math.sin(i) * 40 + 40) * 0.3}%`, ['--delay' as any]: `${i * 0.05}s` }} />
            ))}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Mic className={`w-3 h-3 ${isOutbound ? 'text-white/50' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isOutbound ? 'text-white/70' : 'text-gray-500'}`}>Voice message</span>
          </div>
        </div>
        {src && <audio id={audioId} src={src} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} className="hidden" />}
      </div>
    );
  };

  const renderDocument = (src?: string | null) => {
    const docSrc = src || getMediaSrc(message);
    const fileName = message.fileName || 'Document';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const getDocIconClass = () => {
      if (isOutbound) return 'from-white/15 to-white/25 border-white/20 text-white';
      const colors: Record<string, string> = {
        pdf: 'from-red-50 to-red-100 border-red-200 text-red-750',
        doc: 'from-blue-50 to-blue-100 border-blue-200 text-blue-750',
        docx: 'from-blue-50 to-blue-100 border-blue-200 text-blue-750',
        xls: 'from-green-50 to-green-100 border-green-200 text-green-750',
        xlsx: 'from-green-50 to-green-100 border-green-200 text-green-750',
        ppt: 'from-orange-50 to-orange-100 border-orange-200 text-orange-750',
        pptx: 'from-orange-50 to-orange-100 border-orange-200 text-orange-750',
      };
      return colors[ext] || 'from-gray-50 to-gray-100 border-gray-200 text-gray-600';
    };
    const colorClass = getDocIconClass();
    return (
      <div className="flex items-center gap-3 min-w-[260px] py-1">
        <div className={`w-12 h-14 rounded-lg bg-gradient-to-br ${colorClass} border flex flex-col items-center justify-center flex-shrink-0 relative overflow-hidden`}>
          {downloadState === 'downloading' ? (
            <div className="flex flex-col items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span className="text-[8px] font-bold mt-0.5 font-mono text-emerald-700">
                {downloadProgress !== null ? `${downloadProgress}%` : '...'}
              </span>
            </div>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              {ext && <span className="text-[9px] font-bold uppercase mt-0.5">{ext}</span>}
            </>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold truncate ${isOutbound ? 'text-white' : 'text-gray-900'}`}>
            {fileName}
          </p>
          {downloadState === 'downloading' ? (
            <div className="mt-1 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className={`font-bold ${isOutbound ? 'text-white/80' : 'text-emerald-700'}`}>
                  Downloading...
                </span>
                <span className={`font-mono font-bold ${isOutbound ? 'text-white' : 'text-emerald-800'}`}>
                  {downloadProgress !== null ? `${downloadProgress}%` : ''}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isOutbound ? 'bg-black/20' : 'bg-gray-200'}`}>
                <div
                  className={`h-full transition-all duration-150 rounded-full ${isOutbound
                      ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                      : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    } ${downloadProgress === null ? 'w-1/2 animate-pulse' : ''}`}
                  style={{ width: downloadProgress !== null ? `${downloadProgress}%` : undefined }}
                />
              </div>
            </div>
          ) : downloadState === 'completed' ? (
            <p className={`text-[10px] mt-0.5 font-semibold flex items-center gap-1 ${isOutbound ? 'text-emerald-300' : 'text-emerald-600'}`}>
              <Check className="w-3 h-3 text-emerald-600" /> Download complete
            </p>
          ) : (
            <p className={`text-[10px] mt-0.5 uppercase tracking-wider font-semibold ${isOutbound ? 'text-white/60' : 'text-gray-400'}`}>
              {ext || 'File'} Document
            </p>
          )}
        </div>

        {docSrc && (
          <div className="flex items-center gap-1">
            {ext === 'pdf' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(docSrc, '_blank', 'noopener,noreferrer');
                }}
                className={`p-2 rounded-full ${isOutbound ? 'bg-white/10 hover:bg-white/20 text-white/90' : 'bg-gray-100 hover:bg-gray-200 text-gray-750'} transition-colors`}
                title="View PDF"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={(e) => {
                const downloadUrl = docSrc.includes('?')
                  ? `${docSrc}&download=true`
                  : `${docSrc}?download=true`;
                handleDownload(downloadUrl, fileName, e);
              }}
              disabled={downloadState === 'downloading'}
              className={`p-2 rounded-full transition-all relative ${isOutbound
                  ? 'bg-white/10 hover:bg-white/20 text-white/90'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } ${downloadState === 'downloading' ? 'cursor-wait ring-2 ring-emerald-400/50' : ''}`}
              title={
                downloadState === 'downloading'
                  ? `Downloading ${downloadProgress !== null ? `${downloadProgress}%` : '...'}`
                  : downloadState === 'completed'
                    ? 'Downloaded'
                    : 'Download'
              }
            >
              {downloadState === 'downloading' ? (
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                </div>
              ) : downloadState === 'completed' ? (
                <Check className="w-4 h-4 text-emerald-400 animate-scale-in" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderLocation = () => {
    let loc: any = {};
    try {
      if (message.mediaUrl?.startsWith('{')) loc = JSON.parse(message.mediaUrl);
      else {
        const m = message.content?.match(/\[Location: ([\d.-]+), ([\d.-]+)\]/);
        if (m) loc = { latitude: parseFloat(m[1]), longitude: parseFloat(m[2]) };
      }
    } catch { }
    if (!loc.latitude || !loc.longitude) {
      return (
        <div className={`flex items-center gap-2 px-3 py-2 ${isOutbound ? 'bg-white/10' : 'bg-gray-100'} rounded-lg`}>
          <MapPin className="w-4 h-4 text-red-505" />
          <span className={`text-sm font-semibold ${isOutbound ? 'text-white' : 'text-gray-900'}`}>Location shared</span>
        </div>
      );
    }
    const mapUrl = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
    return (
      <div className={`rounded-xl overflow-hidden border ${isOutbound ? 'border-white/15' : 'border-gray-200'} max-w-[280px] shadow-md`}>
        <div className={`bg-gradient-to-br ${isOutbound ? 'from-emerald-900/40 via-blue-900/40 to-purple-900/40' : 'from-emerald-50 via-blue-50 to-purple-50'} h-32 flex items-center justify-center relative`}>
          <MapPin className="w-10 h-10 text-red-500 drop-shadow-lg relative z-10 animate-bounce" />
        </div>
        <div className={`p-3 ${isOutbound ? 'bg-black/10' : 'bg-gray-50'}`}>
          {loc.name && <p className={`text-sm font-bold ${isOutbound ? 'text-white' : 'text-gray-900'}`}>{loc.name}</p>}
          {loc.address && <p className={`text-xs mt-0.5 ${isOutbound ? 'text-white/70' : 'text-gray-650'}`}>{loc.address}</p>}
          <p className={`text-[10px] font-mono mt-1 ${isOutbound ? 'text-white/50' : 'text-gray-400'}`}>{loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}</p>
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 mt-2 text-xs ${isOutbound ? 'text-emerald-300 hover:text-emerald-250 font-bold' : 'text-emerald-600 hover:text-emerald-700 font-bold'} font-medium`}>
            <ExternalLink className="w-3.5 h-3.5 animate-pulse" /> Open in Maps
          </a>
        </div>
      </div>
    );
  };

  const renderContact = () => {
    let contacts: any[] = [];
    try { if (message.mediaUrl?.startsWith('[')) contacts = JSON.parse(message.mediaUrl); } catch { }
    const name = contacts[0]?.name?.formatted_name || 'Contact';
    const phone = contacts[0]?.phones?.[0]?.phone || '';
    return (
      <div className="flex items-center gap-3 min-w-[220px]">
        <div className={`w-11 h-11 bg-gradient-to-br ${isOutbound ? 'from-white/10 to-white/20 border-white/20 text-white' : 'from-blue-50 to-blue-100 border-blue-200 text-blue-600'} border rounded-full flex items-center justify-center flex-shrink-0`}>
          <User className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-bold ${isOutbound ? 'text-white' : 'text-gray-900'}`}>{name}</p>
          {phone && <p className={`text-xs ${isOutbound ? 'text-white/70' : 'text-gray-500 font-medium'}`}>{phone}</p>}
        </div>
      </div>
    );
  };

  const renderInteractive = () => {
    let interactiveData: any = {};
    try { if (message.mediaUrl?.startsWith('{')) interactiveData = JSON.parse(message.mediaUrl); } catch { }
    const metaInteractive = meta?.interactive || {};
    const merged = { ...metaInteractive, ...interactiveData };
    const iType = merged?.type || (merged?.button_reply ? 'button_reply' : null) || (merged?.list_reply ? 'list_reply' : null);

    if (iType === 'button_reply' || merged?.button_reply) {
      const reply = merged?.button_reply || {};
      return (
        <div className="space-y-1">
          <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${isOutbound ? 'text-white/50' : 'text-emerald-600'}`}>
            <MessageSquare className="w-3 h-3" /> Button Reply
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isOutbound ? 'bg-black/15 border border-white/15 text-white' : 'bg-emerald-50 border border-emerald-250 text-emerald-800'}`}>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-semibold">{reply.title || message.content || 'Button clicked'}</span>
          </div>
        </div>
      );
    }

    if (iType === 'list_reply' || merged?.list_reply) {
      const reply = merged?.list_reply || {};
      return (
        <div className="space-y-1">
          <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${isOutbound ? 'text-white/50' : 'text-blue-650'}`}>
            <ChevronRight className="w-3 h-3" /> List Reply
          </div>
          <div className={`px-3 py-2 rounded-lg border ${isOutbound ? 'bg-black/15 border border-white/15 text-white' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
            <p className="text-sm font-semibold">{reply.title || message.content || 'Option selected'}</p>
            {reply.description && <p className={`text-xs mt-0.5 ${isOutbound ? 'text-white/60' : 'text-blue-600 font-medium'}`}>{reply.description}</p>}
          </div>
        </div>
      );
    }

    if (iType === 'button' || merged?.action?.buttons) {
      const bodyText = merged?.body?.text || message.content || '';
      const buttons = normalizeButtons(merged?.action?.buttons || merged?.buttons || meta?.action?.buttons || []);
      const header = merged?.header;
      const footer = merged?.footer?.text;
      return (
        <div className="space-y-2 min-w-[240px]">
          {header?.type === 'text' && header?.text && <p className={`text-sm font-black ${isOutbound ? 'text-white/90' : 'text-gray-900'}`}>{header.text}</p>}
          {bodyText && <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">{bodyText}</p>}
          {footer && <p className={`text-xs italic ${isOutbound ? 'text-white/50' : 'text-gray-400 font-semibold'}`}>{footer}</p>}
          {buttons.length > 0 && (
            <div className={`pt-2 border-t ${isOutbound ? 'border-white/10' : 'border-gray-200'} space-y-1`}>
              {buttons.map((btn, i) => (
                <div key={i} className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold ${isOutbound ? 'bg-black/10 border-white/15 text-white hover:bg-black/20' : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'} transition-all duration-150 cursor-default shadow-sm`}>
                  {btn.type === 'URL' && <ExternalLink className="w-3.5 h-3.5" />}
                  {btn.type === 'PHONE_NUMBER' && <Phone className="w-3.5 h-3.5" />}
                  {btn.type === 'QUICK_REPLY' && <MessageSquare className="w-3.5 h-3.5" />}
                  {btn.text}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">{message.content || '[Interactive message]'}</p>;
  };

  const renderTemplateBubble = (parsed: ReturnType<typeof parseTemplateContent>) => {
    const { templateName, headerText, bodyText, footerText, buttons, mediaUrl: tplMedia, mediaType: tplMediaType } = parsed;
    const mediaSrc = tplMedia || getMediaSrc(message);
    const hasImage = tplMediaType?.toUpperCase() === 'IMAGE' || message.mediaType === 'image';
    const hasVideo = tplMediaType?.toUpperCase() === 'VIDEO' || message.mediaType === 'video';
    const hasDoc = tplMediaType?.toUpperCase() === 'DOCUMENT' || message.mediaType === 'document';

    return (
      <div className={`w-full max-w-xs space-y-0 overflow-hidden rounded-xl border ${isOutbound ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-gray-50'} shadow-md`}>
        <div className={`px-3 py-2 flex items-center gap-1.5 border-b ${isOutbound ? 'border-white/10 bg-emerald-500/10' : 'border-gray-200 bg-emerald-50/50'}`}>
          <MessageSquare className={`w-3.5 h-3.5 ${isOutbound ? 'text-emerald-300' : 'text-emerald-600'} flex-shrink-0`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${isOutbound ? 'text-emerald-300' : 'text-emerald-600'} truncate`}>
            {templateName ? templateName.replace(/_/g, ' ') : 'Template'}
          </span>
        </div>
        {mediaSrc && hasImage && <div className="overflow-hidden">{renderImage(mediaSrc)}</div>}
        {mediaSrc && hasVideo && <div className="overflow-hidden">{renderVideo(mediaSrc)}</div>}
        {mediaSrc && hasDoc && <div className="px-3 py-2">{renderDocument(mediaSrc)}</div>}
        {headerText && !mediaSrc && <p className={`px-3 pt-2 text-sm font-bold ${isOutbound ? 'text-white/90' : 'text-gray-900'}`}>{headerText}</p>}
        {bodyText && <p className="px-3 py-2 text-sm font-medium whitespace-pre-wrap break-words leading-relaxed"><TextWithLinks text={bodyText} isOutbound={isOutbound} /></p>}
        {footerText && <p className={`px-3 pb-2 text-[11px] italic font-semibold ${isOutbound ? 'text-white/50' : 'text-gray-400'}`}>{footerText}</p>}
        {buttons.length > 0 && (
          <div className={`border-t ${isOutbound ? 'border-white/10' : 'border-gray-200'}`}>
            {buttons.map((btn, i) => (
              <div key={i} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold ${isOutbound ? 'text-emerald-300 hover:bg-white/5' : 'text-emerald-600 hover:bg-gray-150'} cursor-default transition-all duration-150 ${i < buttons.length - 1 ? (isOutbound ? 'border-b border-white/10' : 'border-b border-gray-200') : ''}`}>
                {btn.type === 'URL' && <ExternalLink className="w-3.5 h-3.5" />}
                {btn.type === 'PHONE_NUMBER' && <Phone className="w-3.5 h-3.5" />}
                {btn.type === 'QUICK_REPLY' && <ChevronRight className="w-3.5 h-3.5" />}
                {btn.text}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (isDeleted) {
      return (
        <div className={`flex items-center gap-2 italic text-sm ${isOutbound ? 'text-white/50' : 'text-gray-400 font-semibold'}`}>
          <AlertCircle className="w-4 h-4 text-gray-400" /> This message was deleted
        </div>
      );
    }
    if (msgType === 'template') {
      const parsed = parseTemplateContent(message.content, meta);
      parsed.isTemplate = true;
      return renderTemplateBubble(parsed);
    }
    if (msgType === 'interactive') return renderInteractive();
    if (msgType === 'button') {
      return (
        <div className="space-y-1">
          <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${isOutbound ? 'text-white/50' : 'text-emerald-600'}`}>
            <MessageSquare className="w-3 h-3" /> Quick Reply
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isOutbound ? 'bg-black/15 border border-white/15 text-white' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
            <ChevronRight className="w-4 h-4 flex-shrink-0 animate-pulse" />
            <span className="text-sm font-semibold">{message.content || 'Button clicked'}</span>
          </div>
        </div>
      );
    }
    if (message.content) {
      const parsed = parseTemplateContent(message.content, meta);
      if (parsed.isTemplate) return renderTemplateBubble(parsed);
    }
    switch (msgType) {
      case 'image': return renderImage();
      case 'video': return renderVideo();
      case 'audio':
      case 'voice':
      case 'ptt': return renderAudio();
      case 'document': return renderDocument();
      case 'sticker': return renderImage();
      case 'location': return renderLocation();
      case 'contact':
      case 'contacts': return renderContact();
      case 'system':
        return (
          <div className={`flex items-center gap-2 text-sm italic font-semibold ${isOutbound ? 'text-white/70' : 'text-gray-500'}`}>
            <AlertCircle className="w-4 h-4 text-emerald-500" /> {message.content || 'System message'}
          </div>
        );
      default:
        return (
          <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">
            <TextWithLinks text={message.content || ''} query={searchQuery} isOutbound={isOutbound} />
          </p>
        );
    }
  };

  const renderReplyPreview = () => {
    if (!message.replyTo) return null;
    return (
      <div onClick={() => onJumpToMessage?.(message.replyTo!.id)} className={`reply-quote cursor-pointer mb-1.5 mx-1 border-l-2 border-emerald-500 ${isOutbound ? 'hover:bg-white/10' : 'hover:bg-black/5'} transition-colors`}>
        <p className={`text-[10px] font-bold mb-0.5 ${isOutbound ? 'text-emerald-300' : 'text-emerald-600'}`}>
          {message.replyTo.direction === 'OUTBOUND' ? 'You' : message.replyTo.senderName || 'Contact'}
        </p>
        <p className={`text-xs truncate ${isOutbound ? 'text-white/80' : 'text-gray-500 font-semibold'}`}>
          {message.replyTo.content || `[${message.replyTo.type || 'media'}]`}
        </p>
      </div>
    );
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;
    const grouped: Record<string, number> = {};
    message.reactions.forEach((r) => { grouped[r.emoji] = (grouped[r.emoji] || 0) + 1; });
    return (
      <div className={`absolute -bottom-2.5 ${isOutbound ? 'right-2' : 'left-2'} flex items-center gap-0.5 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 shadow-md z-10`}>
        {Object.entries(grouped).map(([emoji, count]) => (
          <button key={emoji} onClick={() => onReact?.(message, emoji)} className="flex items-center gap-0.5 hover:scale-110 transition-transform">
            <span className="text-xs">{emoji}</span>
            {count > 1 && <span className="text-[10px] text-gray-500 font-bold">{count}</span>}
          </button>
        ))}
      </div>
    );
  };

  const bubbleClass = isOutbound
    ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white'
    : 'bg-white text-gray-900 border border-gray-200';

  const bubbleRadius = isOutbound
    ? `rounded-2xl ${isGrouped ? 'rounded-tr-md' : ''} rounded-br-md`
    : `rounded-2xl ${isGrouped ? 'rounded-tl-md' : ''} rounded-bl-md`;

  const ts = message.timestamp || message.createdAt || '';

  return (
    <div
      ref={containerRef}
      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : 'mt-2'} px-2 sm:px-4 ${isHighlighted ? 'animate-fade-in' : ''}`}
    >
      {!isOutbound && <div className="w-7 mr-1.5 flex-shrink-0">{!isGrouped && renderAvatar()}</div>}

      <div
        ref={bubbleRef}
        className="relative max-w-[85%] sm:max-w-[70%] lg:max-w-[60%] group"
        onMouseEnter={handleBubbleEnter}
        onMouseLeave={handleBubbleLeave}
      >
        {showActions && (
          <div
            className={`absolute bottom-full ${isOutbound ? 'right-0' : 'left-0'} z-30`}
            onMouseEnter={handleToolbarEnter}
            onMouseLeave={handleToolbarLeave}
            style={{ paddingBottom: '6px' }}
          >
            <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg shadow-lg px-0.5 py-0.5 animate-fade-in">
              {onReact && (
                <div className="relative" ref={reactionRef}>
                  <button
                    onClick={() => setReactionsOpen((v) => !v)}
                    onMouseEnter={openReactions}
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-900"
                    title="React"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>
                  {isReactionsOpen && (
                    <div
                      className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-1.5 shadow-xl animate-fade-in z-40"
                      onMouseEnter={openReactions}
                      onMouseLeave={scheduleReactionsClose}
                    >
                      {QUICK_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onReact(message, emoji);
                            setReactionsOpen(false);
                          }}
                          className="text-lg hover:scale-125 transition-transform p-0.5"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {onReply && (
                <button onClick={() => onReply(message)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-900" title="Reply">
                  <Reply className="w-3.5 h-3.5" />
                </button>
              )}

              {onForward && (
                <button onClick={() => onForward(message)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-900" title="Forward">
                  <Forward className="w-3.5 h-3.5" />
                </button>
              )}

              {onStar && (
                <button onClick={() => onStar(message)} className={`p-1.5 hover:bg-gray-100 rounded-md transition-colors ${message.isStarred ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-900'}`} title="Star">
                  <Star className={`w-3.5 h-3.5 ${message.isStarred ? 'fill-current' : ''}`} />
                </button>
              )}

              {onCopy && message.content && msgType !== 'template' && (
                <button onClick={() => onCopy(message.content)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-900" title="Copy">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}

              {(canEdit || canDelete) && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-900"
                    title="More"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {isMenuOpen && (
                    <div className={`absolute top-full mt-1 ${isOutbound ? 'right-0' : 'left-0'} w-40 py-1 bg-white border border-gray-200 rounded-lg shadow-2xl animate-fade-in z-40`}>
                      {canEdit && (
                        <button
                          onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit message
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => { setShowDeleteConfirm(true); setMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-white border border-gray-200 rounded-2xl z-45 flex flex-col items-center justify-center p-3 animate-fade-in shadow-md">
            <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
            <p className="text-xs text-gray-900 mb-3 text-center font-bold">Delete this message?</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs rounded-md transition-colors font-semibold">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors flex items-center gap-1.5 font-bold">
                {deleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Delete
              </button>
            </div>
          </div>
        )}

        <div className={`relative shadow-md bubble-shadow animate-bubble-pop ${bubbleClass} ${bubbleRadius} ${msgType === 'template' ? 'p-0 overflow-hidden' : 'px-3.5 py-2'} ${isHighlighted ? 'ring-2 ring-emerald-500' : ''}`}>
          {message.isForwarded && (
            <div className={`flex items-center gap-1 text-[10px] italic mb-1 ${isOutbound ? 'text-white/60' : 'text-gray-400'}`}>
              <Forward className="w-3 h-3" /> Forwarded
            </div>
          )}

          {renderReplyPreview()}

          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[220px]">
              <textarea
                ref={editRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit(); }
                  else if (e.key === 'Escape') setIsEditing(false);
                }}
                className={`w-full text-sm rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none min-h-[60px] ${isOutbound ? 'bg-black/20 text-white border-none' : 'bg-gray-50 text-gray-900 border border-gray-200'}`}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className={`px-3 py-1 text-xs transition-colors ${isOutbound ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900 font-semibold'}`}>
                  Cancel
                </button>
                <button onClick={handleEdit} disabled={editSaving || !editText.trim()} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-md transition-colors flex items-center gap-1 font-bold disabled:opacity-50">
                  {editSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            renderContent()
          )}

          {!isEditing && (
            <div className={`flex items-center justify-end gap-1 ${msgType === 'template' ? 'px-3 pb-1.5 pt-0.5' : 'mt-1'}`}>
              {message.edited && <span className={`text-[10px] italic mr-1 ${isOutbound ? 'text-white/50' : 'text-gray-400 font-bold'}`}>edited</span>}
              {message.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current mr-0.5" />}
              <span className={`text-[10px] font-bold ${isOutbound ? 'text-white/75' : 'text-gray-400'}`}>{formatMessageTime(ts)}</span>
              <StatusIcon />
            </div>
          )}

          {message.status?.toUpperCase() === 'FAILED' && message.failureReason && (
            <div className={`mt-2 pt-2 border-t flex items-start gap-1.5 ${isOutbound ? 'border-red-400/30' : 'border-red-100'}`}>
              <AlertCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isOutbound ? 'text-red-300' : 'text-red-500'}`} />
              <p className={`text-[10px] ${isOutbound ? 'text-red-300' : 'text-red-600 font-semibold'}`}>{message.failureReason}</p>
            </div>
          )}
        </div>

        {renderReactions()}
      </div>
    </div>
  );
};

// ✅ FIXED: Deep Equality Comparison Function for React.memo
// This stops massive visual drops on incoming updates, preventing unneeded child bubble updates
const areMessagesEqual = (prevProps: Props, nextProps: Props) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.edited === nextProps.message.edited &&
    prevProps.message.isStarred === nextProps.message.isStarred &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.showAvatar === nextProps.showAvatar &&
    prevProps.isGrouped === nextProps.isGrouped &&
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.conversationId === nextProps.conversationId &&
    // Simple deep verification for reactions lengths
    (prevProps.message.reactions?.length || 0) === (nextProps.message.reactions?.length || 0)
  );
};

export default React.memo(MessageBubble, areMessagesEqual);