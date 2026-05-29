// src/components/inbox/MessageBubble.tsx - PREMIUM REDESIGN
import React, { useState, useRef, useEffect } from 'react';
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
  Heart,
  ThumbsUp,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatMessageTime, getAvatarColor } from '../../utils/inboxHelpers';

// ─── Types ────────────────────────────────────────────────────────────────────
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
  // Advanced features
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
}

interface Props {
  message: Message;
  conversationId?: string;
  showAvatar?: boolean;
  contactName?: string;
  isGrouped?: boolean; // Same sender as previous message
  isHighlighted?: boolean; // Search match
  searchQuery?: string;
  onCopy?: (content: string) => void;
  onReply?: (msg: Message) => void;
  onForward?: (msg: Message) => void;
  onStar?: (msg: Message) => void;
  onReact?: (msg: Message, emoji: string) => void;
  onDeleted?: (messageId: string) => void;
  onEdited?: (messageId: string, newContent: string) => void;
  onJumpToMessage?: (messageId: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = 'https://wabmeta-api.onrender.com/api';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
    } catch {}
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

  return { isTemplate: false, bodyText: content, buttons: normalizeButtons(meta?.buttons || []) };
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
  if (url.includes('cloudinary.com')) return url;
  if (url.startsWith('https://') && !url.includes('lookaside.fbsbx.com') && !url.includes('mmg.whatsapp.net')) return url;
  if (msg.mediaId && /^\d+$/.test(msg.mediaId.trim())) return `${API_BASE}/inbox/media/${msg.mediaId.trim()}`;
  if (url && !url.startsWith('http') && /^\d+$/.test(url.trim())) return `${API_BASE}/inbox/media/${url.trim()}`;
  if (url?.startsWith('http') && msg.mediaId) return `${API_BASE}/inbox/media/${msg.mediaId}`;
  return null;
}

// ─── Highlight search ─────────────────────────────────────────────────────────
function HighlightedText({ text, query }: { text: string; query?: string }) {
  if (!query?.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-400/40 text-yellow-100 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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

  const [showActions, setShowActions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content || '');
  const [deleting, setDeleting] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const reactionRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const isOutbound = message.direction === 'OUTBOUND';
  const msgType = (message.type || '').toLowerCase();
  const meta = message.metadata || {};
  const canEdit = isOutbound && msgType === 'text' && !!conversationId;
  const canDelete = !!conversationId;
  const isDeleted = message.content === '[revoke]' || message.content === '[Revoke]';

  // Close menus on outside click
  useEffect(() => {
    if (!showMenu && !showReactions) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
      if (reactionRef.current && !reactionRef.current.contains(e.target as Node)) {
        setShowReactions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu, showReactions]);

  // Focus edit textarea
  useEffect(() => {
    if (isEditing) setTimeout(() => editRef.current?.focus(), 50);
  }, [isEditing]);

  // Highlight scroll
  useEffect(() => {
    if (isHighlighted && bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  // ── Delete handler ──────────────────────────────────────────────────────
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
      setShowMenu(false);
    }
  };

  // ── Edit handler ────────────────────────────────────────────────────────
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

  // ── Status icon ─────────────────────────────────────────────────────────
  const StatusIcon = () => {
    if (!isOutbound) return null;
    const status = message.status?.toUpperCase();
    switch (status) {
      case 'SENT':
        return <Check className="w-3.5 h-3.5 text-gray-400" />;
      case 'DELIVERED':
        return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
      case 'READ':
        return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
      case 'FAILED':
        return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Clock className="w-3 h-3 text-gray-500 animate-pulse" />;
    }
  };

  // ── Avatar ──────────────────────────────────────────────────────────────
  const renderAvatar = () => {
    if (!showAvatar || isOutbound) return null;
    const name = contactName || 'U';
    const initial = name.charAt(0).toUpperCase();
    const color = getAvatarColor(name);
    return (
      <div className={`
        w-7 h-7 rounded-full
        bg-gradient-to-br ${color}
        flex items-center justify-center
        text-white text-xs font-semibold
        flex-shrink-0 self-end mb-0.5
        ring-2 ring-[#0a0e1c]
      `}>
        {initial}
      </div>
    );
  };

  // ── Image ───────────────────────────────────────────────────────────────
  const renderImage = (src?: string | null, caption?: string) => {
    const imgSrc = src || getMediaSrc(message);
    if (!imgSrc) {
      return (
        <div className="w-56 h-40 bg-white/5 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/10">
          <span className="text-3xl opacity-50">🖼️</span>
          <span className="text-xs text-gray-400">Image unavailable</span>
        </div>
      );
    }
    return (
      <div className="relative max-w-xs">
        {imageLoading && !imageError && (
          <div className="w-56 h-40 bg-white/5 rounded-xl flex items-center justify-center animate-pulse border border-white/10">
            <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {imageError && (
          <div className="w-56 h-40 bg-white/5 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/10">
            <span className="text-3xl opacity-50">🖼️</span>
            <span className="text-xs text-gray-400">Media unavailable</span>
            <button
              onClick={() => {
                setImageError(false);
                setImageLoading(true);
                setRetryCount((p) => p + 1);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs rounded-md transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}
        <img
          key={`${imgSrc}-${retryCount}`}
          src={imgSrc}
          alt="Image"
          className={`max-w-full rounded-xl cursor-zoom-in hover:opacity-95 transition-all shadow-lg ${
            imageLoading || imageError ? 'hidden' : 'block'
          }`}
          style={{ maxHeight: 300, maxWidth: 280 }}
          onLoad={() => {
            setImageLoading(false);
            setImageError(false);
          }}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
          onClick={() => !imageError && setShowFullImage(true)}
        />
        {caption && <p className="mt-1.5 text-sm px-1 leading-relaxed">{caption}</p>}

        {/* Full image modal */}
        {showFullImage && !imageError && (
          <div
            className="fixed inset-0 z-[60] glass-backdrop flex items-center justify-center p-4 image-zoom-enter"
            onClick={() => setShowFullImage(false)}
          >
            <button
              className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm"
              onClick={() => setShowFullImage(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={imgSrc}
              alt="Full"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <a
              href={imgSrc}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>
    );
  };

  // ── Video ───────────────────────────────────────────────────────────────
  const renderVideo = (src?: string | null, caption?: string) => {
    const vidSrc = src || getMediaSrc(message);
    if (!vidSrc) {
      return (
        <div className="w-64 h-40 bg-white/5 rounded-xl flex flex-col items-center justify-center text-gray-400 border border-white/10">
          <Video className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs">Video unavailable</span>
        </div>
      );
    }
    return (
      <div className="relative max-w-xs">
        <video
          src={vidSrc}
          controls
          className="max-w-full rounded-xl shadow-lg"
          preload="metadata"
          style={{ maxHeight: 300 }}
        />
        {caption && <p className="mt-1.5 text-sm px-1 leading-relaxed">{caption}</p>}
      </div>
    );
  };

  // ── Audio (voice message) ───────────────────────────────────────────────
  const renderAudio = () => {
    const src = getMediaSrc(message);
    const audioId = `audio-${message.id}`;
    const toggle = () => {
      const el = document.getElementById(audioId) as HTMLAudioElement;
      if (el) {
        if (isPlaying) el.pause();
        else el.play();
      }
    };
    return (
      <div className="flex items-center gap-3 min-w-[240px]">
        <button
          onClick={toggle}
          className="
            w-10 h-10 flex-shrink-0
            bg-emerald-500 hover:bg-emerald-600
            rounded-full text-white
            flex items-center justify-center
            transition-all shadow-md hover:shadow-lg
            active:scale-95
          "
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="flex-1">
          {/* Waveform visualizer */}
          <div className="flex items-center gap-0.5 h-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={`
                  w-0.5 rounded-full transition-all
                  ${isPlaying ? 'wave-bar bg-emerald-400' : 'bg-white/30'}
                `}
                style={{
                  height: `${30 + (Math.sin(i) * 40 + 40) * 0.3}%`,
                  ['--delay' as any]: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Mic className="w-3 h-3 text-white/40" />
            <span className="text-[10px] text-white/50 font-medium">Voice message</span>
          </div>
        </div>

        {src && (
          <audio
            id={audioId}
            src={src}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </div>
    );
  };

  // ── Document ────────────────────────────────────────────────────────────
  const renderDocument = (src?: string | null) => {
    const docSrc = src || getMediaSrc(message);
    const fileName = message.fileName || 'Document';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const iconColors: Record<string, string> = {
      pdf: 'from-red-500/20 to-red-600/20 text-red-400 border-red-500/30',
      doc: 'from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30',
      docx: 'from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30',
      xls: 'from-green-500/20 to-green-600/20 text-green-400 border-green-500/30',
      xlsx: 'from-green-500/20 to-green-600/20 text-green-400 border-green-500/30',
      ppt: 'from-orange-500/20 to-orange-600/20 text-orange-400 border-orange-500/30',
      pptx: 'from-orange-500/20 to-orange-600/20 text-orange-400 border-orange-500/30',
    };
    const colorClass = iconColors[ext] || 'from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-500/30';

    return (
      <div className="flex items-center gap-3 min-w-[260px] py-1">
        <div className={`
          w-12 h-14 rounded-lg
          bg-gradient-to-br ${colorClass} border
          flex flex-col items-center justify-center
          flex-shrink-0
        `}>
          <FileText className="w-5 h-5" />
          {ext && (
            <span className="text-[9px] font-bold uppercase mt-0.5">{ext}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-white">{fileName}</p>
          <p className="text-[10px] text-white/50 mt-0.5 uppercase tracking-wider">
            {ext || 'File'} Document
          </p>
        </div>
        {docSrc && (
          <a
            href={docSrc}
            target="_blank"
            rel="noopener noreferrer"
            download={fileName}
            className="
              p-2 rounded-full
              bg-white/10 hover:bg-white/20
              text-white/80 hover:text-white
              transition-colors flex-shrink-0
            "
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
    );
  };

  // ── Location ────────────────────────────────────────────────────────────
  const renderLocation = () => {
    let loc: any = {};
    try {
      if (message.mediaUrl?.startsWith('{')) loc = JSON.parse(message.mediaUrl);
      else {
        const m = message.content?.match(/\[Location: ([\d.-]+), ([\d.-]+)\]/);
        if (m) loc = { latitude: parseFloat(m[1]), longitude: parseFloat(m[2]) };
      }
    } catch {}
    if (!loc.latitude || !loc.longitude) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
          <MapPin className="w-4 h-4 text-red-400" />
          <span className="text-sm">Location shared</span>
        </div>
      );
    }
    const mapUrl = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
    return (
      <div className="rounded-xl overflow-hidden border border-white/10 max-w-[280px]">
        <div className="bg-gradient-to-br from-emerald-900/40 via-blue-900/40 to-purple-900/40 h-32 flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`,
          }} />
          <MapPin className="w-10 h-10 text-red-400 drop-shadow-lg relative z-10" />
        </div>
        <div className="p-3 bg-white/5">
          {loc.name && <p className="text-sm font-medium text-white">{loc.name}</p>}
          {loc.address && <p className="text-xs text-white/60 mt-0.5">{loc.address}</p>}
          <p className="text-[10px] text-white/40 font-mono mt-1">
            {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
          </p>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-1.5 mt-2
              text-xs text-emerald-400 hover:text-emerald-300
              font-medium
            "
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open in Maps
          </a>
        </div>
      </div>
    );
  };

  // ── Contact ─────────────────────────────────────────────────────────────
  const renderContact = () => {
    let contacts: any[] = [];
    try {
      if (message.mediaUrl?.startsWith('[')) contacts = JSON.parse(message.mediaUrl);
    } catch {}
    const name = contacts[0]?.name?.formatted_name || 'Contact';
    const phone = contacts[0]?.phones?.[0]?.phone || '';
    return (
      <div className="flex items-center gap-3 min-w-[220px]">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-blue-300" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{name}</p>
          {phone && <p className="text-xs text-white/60">{phone}</p>}
          {phone && (
            <button className="text-[10px] text-emerald-400 hover:text-emerald-300 mt-1 font-medium">
              Save to contacts
            </button>
          )}
        </div>
      </div>
    );
  };

  // ── Interactive (button reply) ──────────────────────────────────────────
  const renderInteractive = () => {
    const body = meta?.body?.text || meta?.text || message.content || '';
    const buttonReply = meta?.button_reply || meta?.buttonReply;
    const listReply = meta?.list_reply || meta?.listReply;

    if (buttonReply || listReply) {
      const reply = buttonReply || listReply;
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase tracking-wider font-medium">
            <ChevronRight className="w-3 h-3" />
            Button Reply
          </div>
          <div className="px-3 py-2 bg-white/10 rounded-lg border border-white/15 text-sm font-medium">
            {reply.title || reply.text || body}
          </div>
        </div>
      );
    }

    const btns = normalizeButtons(meta?.action?.buttons || meta?.buttons || []);
    return (
      <div className="space-y-2">
        {body && <p className="text-sm whitespace-pre-wrap break-words">{body}</p>}
        {btns.length > 0 && (
          <div className="pt-2 border-t border-white/10 space-y-1">
            {btns.map((btn, i) => (
              <div
                key={i}
                className="flex items-center justify-center gap-1.5 p-2 bg-white/10 hover:bg-white/15 rounded-lg border border-white/15 text-xs font-semibold cursor-default transition-colors"
              >
                {btn.type === 'URL' && <ExternalLink className="w-3 h-3" />}
                {btn.type === 'PHONE_NUMBER' && <Phone className="w-3 h-3" />}
                {btn.text}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Template ────────────────────────────────────────────────────────────
  const renderTemplateBubble = (parsed: ReturnType<typeof parseTemplateContent>) => {
    const { templateName, headerText, bodyText, footerText, buttons, mediaUrl: tplMedia, mediaType: tplMediaType } = parsed;
    const mediaSrc = tplMedia || getMediaSrc(message);
    const hasImage = tplMediaType?.toUpperCase() === 'IMAGE' || message.mediaType === 'image';
    const hasVideo = tplMediaType?.toUpperCase() === 'VIDEO' || message.mediaType === 'video';
    const hasDoc = tplMediaType?.toUpperCase() === 'DOCUMENT' || message.mediaType === 'document';

    return (
      <div className="w-full max-w-xs space-y-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
        {/* Template badge */}
        <div className="px-3 pt-2 pb-1.5 flex items-center gap-1.5 border-b border-white/10 bg-emerald-500/5">
          <MessageSquare className="w-3 h-3 text-emerald-300 flex-shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 truncate">
            {templateName ? templateName.replace(/_/g, ' ') : 'Template'}
          </span>
        </div>

        {mediaSrc && hasImage && <div className="overflow-hidden">{renderImage(mediaSrc)}</div>}
        {mediaSrc && hasVideo && <div className="overflow-hidden">{renderVideo(mediaSrc)}</div>}
        {mediaSrc && hasDoc && <div className="px-3 py-2">{renderDocument(mediaSrc)}</div>}

        {headerText && !mediaSrc && (
          <p className="px-3 pt-2 text-sm font-bold text-white/90">{headerText}</p>
        )}

        {bodyText && (
          <p className="px-3 py-2 text-sm whitespace-pre-wrap break-words leading-relaxed">
            {bodyText}
          </p>
        )}

        {footerText && (
          <p className="px-3 pb-2 text-[11px] text-white/45 italic">{footerText}</p>
        )}

        {buttons.length > 0 && (
          <div className="border-t border-white/10">
            {buttons.map((btn, i) => (
              <div
                key={i}
                className={`
                  flex items-center justify-center gap-1.5 px-3 py-2.5
                  text-xs font-semibold text-emerald-300 hover:bg-white/5
                  cursor-default transition-colors
                  ${i < buttons.length - 1 ? 'border-b border-white/10' : ''}
                `}
              >
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

  // ── Content router ──────────────────────────────────────────────────────
  const renderContent = () => {
    if (isDeleted) {
      return (
        <div className="flex items-center gap-2 italic text-white/50 text-sm">
          <AlertCircle className="w-4 h-4" />
          This message was deleted
        </div>
      );
    }

    if (msgType === 'template') {
      const parsed = parseTemplateContent(message.content, meta);
      parsed.isTemplate = true;
      return renderTemplateBubble(parsed);
    }

    if (msgType === 'interactive') return renderInteractive();

    if (message.content) {
      const parsed = parseTemplateContent(message.content, meta);
      if (parsed.isTemplate) return renderTemplateBubble(parsed);
    }

    switch (msgType) {
      case 'image':
        return renderImage();
      case 'video':
        return renderVideo();
      case 'audio':
      case 'voice':
      case 'ptt':
        return renderAudio();
      case 'document':
        return renderDocument();
      case 'sticker':
        return renderImage();
      case 'location':
        return renderLocation();
      case 'contact':
      case 'contacts':
        return renderContact();
      default:
        return (
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            <HighlightedText text={message.content || ''} query={searchQuery} />
          </p>
        );
    }
  };

  // ── Reply preview ───────────────────────────────────────────────────────
  const renderReplyPreview = () => {
    if (!message.replyTo) return null;
    return (
      <div
        onClick={() => onJumpToMessage?.(message.replyTo!.id)}
        className="
          reply-quote cursor-pointer
          mb-1.5 mx-1
          hover:bg-white/[0.08] transition-colors
        "
      >
        <p className="text-[10px] font-semibold text-emerald-400 mb-0.5">
          {message.replyTo.direction === 'OUTBOUND' ? 'You' : message.replyTo.senderName || 'Contact'}
        </p>
        <p className="text-xs text-white/70 truncate">
          {message.replyTo.content || `[${message.replyTo.type || 'media'}]`}
        </p>
      </div>
    );
  };

  // ── Reactions ───────────────────────────────────────────────────────────
  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    // Group by emoji
    const grouped: Record<string, number> = {};
    message.reactions.forEach((r) => {
      grouped[r.emoji] = (grouped[r.emoji] || 0) + 1;
    });

    return (
      <div className={`
        absolute -bottom-2.5 ${isOutbound ? 'right-2' : 'left-2'}
        flex items-center gap-0.5
        bg-[#1a2238] border border-white/10
        rounded-full px-1.5 py-0.5
        shadow-md
      `}>
        {Object.entries(grouped).map(([emoji, count]) => (
          <button
            key={emoji}
            onClick={() => onReact?.(message, emoji)}
            className="flex items-center gap-0.5 hover:scale-110 transition-transform"
          >
            <span className="text-xs">{emoji}</span>
            {count > 1 && <span className="text-[10px] text-gray-400">{count}</span>}
          </button>
        ))}
      </div>
    );
  };

  // ── Bubble colors ───────────────────────────────────────────────────────
  const bubbleClass = isOutbound
    ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white'
    : 'bg-[#1f2937]/90 backdrop-blur-sm text-white border border-white/[0.06]';

  const bubbleRadius = isOutbound
    ? `rounded-2xl ${isGrouped ? 'rounded-tr-md' : ''} rounded-br-md`
    : `rounded-2xl ${isGrouped ? 'rounded-tl-md' : ''} rounded-bl-md`;

  const ts = message.timestamp || message.createdAt || '';

  return (
    <div
      ref={bubbleRef}
      className={`
        flex ${isOutbound ? 'justify-end' : 'justify-start'}
        ${isGrouped ? 'mt-0.5' : 'mt-2'}
        px-2 sm:px-4
        ${isHighlighted ? 'animate-fade-in' : ''}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactions(false);
      }}
    >
      {/* Avatar for inbound */}
      {!isOutbound && <div className="w-7 mr-1.5 flex-shrink-0">{!isGrouped && renderAvatar()}</div>}

      <div className={`relative max-w-[85%] sm:max-w-[70%] lg:max-w-[60%] group`}>
        {/* Action bar (hover) */}
        {showActions && !isEditing && !isDeleted && (
          <div className={`
            absolute -top-9 ${isOutbound ? 'right-0' : 'left-0'}
            flex items-center gap-0.5
            bg-[#1a2238]/95 backdrop-blur-xl
            border border-white/[0.08]
            rounded-lg shadow-xl
            px-0.5 py-0.5
            animate-fade-in
            z-20
          `}>
            {onReact && (
              <div className="relative" ref={reactionRef}>
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                  title="React"
                >
                  <Smile className="w-3.5 h-3.5 text-gray-300" />
                </button>
                {showReactions && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#1a2238]/95 backdrop-blur-xl border border-white/[0.1] rounded-full px-2 py-1.5 shadow-xl animate-fade-in">
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onReact(message, emoji);
                          setShowReactions(false);
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
              <button
                onClick={() => onReply(message)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                title="Reply"
              >
                <Reply className="w-3.5 h-3.5 text-gray-300" />
              </button>
            )}

            {onForward && (
              <button
                onClick={() => onForward(message)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                title="Forward"
              >
                <Forward className="w-3.5 h-3.5 text-gray-300" />
              </button>
            )}

            {onStar && (
              <button
                onClick={() => onStar(message)}
                className={`p-1.5 hover:bg-white/10 rounded-md transition-colors ${
                  message.isStarred ? 'text-yellow-400' : 'text-gray-300'
                }`}
                title="Star"
              >
                <Star className={`w-3.5 h-3.5 ${message.isStarred ? 'fill-current' : ''}`} />
              </button>
            )}

            {onCopy && message.content && msgType !== 'template' && (
              <button
                onClick={() => onCopy(message.content)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                title="Copy"
              >
                <Copy className="w-3.5 h-3.5 text-gray-300" />
              </button>
            )}

            {(canEdit || canDelete) && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                  title="More"
                >
                  <MoreVertical className="w-3.5 h-3.5 text-gray-300" />
                </button>

                {showMenu && (
                  <div className={`
                    absolute top-8 ${isOutbound ? 'right-0' : 'left-0'}
                    w-40 py-1
                    bg-[#1a2238]/98 backdrop-blur-xl
                    border border-white/[0.1]
                    rounded-lg shadow-2xl
                    animate-fade-in
                  `}>
                    {canEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-white/[0.06] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit message
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Delete confirm overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-[#0a0e1c]/95 backdrop-blur-md rounded-2xl z-30 flex flex-col items-center justify-center p-3 animate-fade-in">
            <AlertCircle className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-xs text-white mb-3 text-center font-medium">
              Delete this message?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors flex items-center gap-1.5"
              >
                {deleting ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Bubble */}
        <div className={`
          relative shadow-md bubble-shadow animate-bubble-pop
          ${bubbleClass} ${bubbleRadius}
          ${msgType === 'template' ? 'p-0 overflow-hidden' : 'px-3.5 py-2'}
          ${isHighlighted ? 'ring-2 ring-yellow-400/60' : ''}
        `}>
          {/* Forwarded indicator */}
          {message.isForwarded && (
            <div className="flex items-center gap-1 text-[10px] text-white/50 italic mb-1">
              <Forward className="w-3 h-3" />
              Forwarded
            </div>
          )}

          {/* Reply preview */}
          {renderReplyPreview()}

          {/* Content or edit */}
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[220px]">
              <textarea
                ref={editRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEdit();
                  } else if (e.key === 'Escape') {
                    setIsEditing(false);
                  }
                }}
                className="
                  w-full bg-black/20 text-white text-sm
                  rounded-lg p-2.5
                  focus:outline-none focus:ring-1 focus:ring-emerald-400
                  resize-none min-h-[60px]
                "
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={editSaving || !editText.trim()}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-md transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {editSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            renderContent()
          )}

          {/* Timestamp + status */}
          {!isEditing && (
            <div className={`
              flex items-center justify-end gap-1
              ${msgType === 'template' ? 'px-3 pb-1.5 pt-0.5' : 'mt-1'}
            `}>
              {message.edited && (
                <span className="text-[10px] text-white/40 italic mr-1">edited</span>
              )}
              {message.isStarred && (
                <Star className="w-3 h-3 text-yellow-400 fill-current mr-0.5" />
              )}
              <span className="text-[10px] text-white/50">{formatMessageTime(ts)}</span>
              <StatusIcon />
            </div>
          )}

          {/* Failure reason */}
          {message.status?.toUpperCase() === 'FAILED' && message.failureReason && (
            <div className="mt-2 pt-2 border-t border-red-400/30 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-300 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-300">{message.failureReason}</p>
            </div>
          )}
        </div>

        {/* Reactions */}
        {renderReactions()}
      </div>
    </div>
  );
};

export default React.memo(MessageBubble);