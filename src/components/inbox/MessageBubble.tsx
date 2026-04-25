// src/components/inbox/MessageBubble.tsx - WhatsApp-style message renderer

import React, { useState, useRef, useEffect } from 'react';
import {
  Check, CheckCheck, Clock, Download, Play, Pause,
  FileText, MapPin, User, Video, Mic, X, ExternalLink,
  AlertCircle, MessageSquare, RefreshCw, Copy, Phone,
  MousePointerClick, ChevronRight, Trash2, Pencil, MoreVertical,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
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
}

interface MessageBubbleProps {
  message: Message;
  conversationId?: string;
  onCopy?: (content: string) => void;
  onDeleted?: (messageId: string) => void;
  onEdited?: (messageId: string, newContent: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const API_BASE = 'https://wabmeta-api.onrender.com/api';

/** Parse template content from plain-text or JSON */
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

  // ── JSON template (structured) ──
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
    } catch { /* fall through */ }
  }

  // ── Multi-line Campaign format: "Campaign: X\nTemplate: Y" ──
  if (content.startsWith('Campaign:') || content.startsWith('Template:')) {
    const lines = content.split('\n');
    const campaignLine = lines.find(l => l.startsWith('Campaign:'));
    const templateLine = lines.find(l => l.startsWith('Template:'));
    const templateName = templateLine?.replace('Template:', '').trim() || 'Template';
    const buttons = normalizeButtons(meta?.buttons || []);
    // Body text from metadata if available
    const bodyText = meta?.bodyText || meta?.body || '';
    return {
      isTemplate: true,
      templateName: templateLine?.replace('Template:', '').trim(),
      headerText: campaignLine || undefined,
      bodyText: bodyText || `📋 ${templateName.replace(/_/g, ' ')}`,
      buttons,
    };
  }

  // ── Type TEMPLATE with plain content ──
  return { isTemplate: false, bodyText: content, buttons: normalizeButtons(meta?.buttons || []) };
}

function normalizeButtons(raw: any[]): Array<{ type: string; text: string; url?: string; phone?: string }> {
  if (!Array.isArray(raw)) return [];
  return raw.map((b: any) => ({
    type: (b.type || 'QUICK_REPLY').toUpperCase(),
    text: b.text || b.title || '',
    url: b.url,
    phone: b.phone_number || b.phone,
  })).filter(b => b.text);
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

// ─── Main Component ───────────────────────────────────────────────────────────
const MessageBubble: React.FC<MessageBubbleProps> = ({ message, conversationId, onCopy, onDeleted, onEdited }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // ── Context menu & edit state ──
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content || '');
  const [deleting, setDeleting] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  // Focus edit textarea
  useEffect(() => {
    if (isEditing) setTimeout(() => editRef.current?.focus(), 50);
  }, [isEditing]);

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

  const handleEdit = async () => {
    if (!conversationId || !editText.trim()) return;
    setEditSaving(true);
    try {
      await api.patch(`/inbox/conversations/${conversationId}/messages/${message.id}`, { content: editText.trim() });
      onEdited?.(message.id, editText.trim());
      toast.success('Message updated');
      setIsEditing(false);
    } catch {
      toast.error('Failed to edit message');
    } finally {
      setEditSaving(false);
    }
  };

  const isOutbound = message.direction === 'OUTBOUND';
  const msgType = (message.type || '').toLowerCase();
  const meta = message.metadata || {};
  const canEdit = isOutbound && msgType === 'text' && !!conversationId;
  const canDelete = !!conversationId;

  // ── Timestamp ──────────────────────────────────────────────────────────────
  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return ''; }
  };

  // ── Status icon ────────────────────────────────────────────────────────────
  const StatusIcon = () => {
    if (!isOutbound) return null;
    switch (message.status?.toUpperCase()) {
      case 'SENT':      return <Check className="w-3.5 h-3.5 text-gray-300" />;
      case 'DELIVERED': return <CheckCheck className="w-3.5 h-3.5 text-gray-300" />;
      case 'READ':      return <CheckCheck className="w-3.5 h-3.5 text-blue-300" />;
      case 'FAILED':    return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
      default:          return <Clock className="w-3 h-3 text-gray-400 animate-pulse" />;
    }
  };

  // ── Image ──────────────────────────────────────────────────────────────────
  const renderImage = (src?: string | null, caption?: string) => {
    const imgSrc = src || getMediaSrc(message);
    if (!imgSrc) {
      return (
        <div className="w-52 h-36 bg-gray-700/50 rounded-xl flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">🖼️</span>
          <span className="text-xs text-gray-400">Image unavailable</span>
        </div>
      );
    }
    return (
      <div className="relative max-w-xs">
        {imageLoading && !imageError && (
          <div className="w-52 h-36 bg-gray-700 rounded-xl flex items-center justify-center animate-pulse">
            <div className="w-7 h-7 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {imageError && (
          <div className="w-52 h-36 bg-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 border border-gray-600">
            <span className="text-3xl">🖼️</span>
            <span className="text-xs text-gray-400">Media unavailable</span>
            <button onClick={() => { setImageError(false); setImageLoading(true); setRetryCount(p => p + 1); }}
              className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}
        <img key={`${imgSrc}-${retryCount}`} src={imgSrc} alt="Image"
          className={`max-w-full rounded-xl cursor-zoom-in hover:opacity-95 transition-all shadow ${imageLoading || imageError ? 'hidden' : 'block'}`}
          style={{ maxHeight: 280, maxWidth: 260 }}
          onLoad={() => { setImageLoading(false); setImageError(false); }}
          onError={() => { setImageLoading(false); setImageError(true); }}
          onClick={() => !imageError && setShowFullImage(true)}
        />
        {caption && <p className="mt-1.5 text-sm">{caption}</p>}
        {showFullImage && !imageError && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setShowFullImage(false)}>
            <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white" onClick={() => setShowFullImage(false)}>
              <X className="w-6 h-6" />
            </button>
            <img src={imgSrc} alt="Full" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
            <a href={imgSrc} download target="_blank" rel="noopener noreferrer"
              className="absolute bottom-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white" onClick={e => e.stopPropagation()}>
              <Download className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>
    );
  };

  // ── Video ──────────────────────────────────────────────────────────────────
  const renderVideo = (src?: string | null, caption?: string) => {
    const vidSrc = src || getMediaSrc(message);
    if (!vidSrc) return (
      <div className="w-64 h-40 bg-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-400">
        <Video className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-xs">Video unavailable</span>
      </div>
    );
    return (
      <div className="relative max-w-xs">
        <video src={vidSrc} controls className="max-w-full rounded-xl shadow" preload="metadata" style={{ maxHeight: 280 }} />
        {caption && <p className="mt-1.5 text-sm">{caption}</p>}
      </div>
    );
  };

  // ── Audio ──────────────────────────────────────────────────────────────────
  const renderAudio = () => {
    const src = getMediaSrc(message);
    const audioId = `audio-${message.id}`;
    const toggle = () => {
      const el = document.getElementById(audioId) as HTMLAudioElement;
      el && (isPlaying ? el.pause() : el.play());
    };
    return (
      <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl min-w-[220px]">
        <button onClick={toggle} className="p-2.5 bg-green-500 hover:bg-green-600 rounded-full text-white transition-colors shadow">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1">
          <div className="h-1.5 bg-white/20 rounded-full"><div className="h-full w-0 bg-green-400 rounded-full" /></div>
          <span className="text-[10px] text-white/60 mt-1 block">Voice message</span>
          {src && <audio id={audioId} src={src} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} className="hidden" />}
        </div>
        <Mic className="w-4 h-4 text-white/40" />
      </div>
    );
  };

  // ── Document ───────────────────────────────────────────────────────────────
  const renderDocument = (src?: string | null) => {
    const docSrc = src || getMediaSrc(message);
    const fileName = message.fileName || 'Document';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const iconColor = ext === 'pdf' ? 'text-red-500' : ext === 'doc' || ext === 'docx' ? 'text-blue-500' : 'text-gray-500';
    return (
      <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl min-w-[240px]">
        <div className="p-2.5 bg-white/20 rounded-xl">
          <FileText className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-[10px] uppercase text-white/50 mt-0.5">{ext || 'File'}</p>
        </div>
        {docSrc && (
          <a href={docSrc} target="_blank" rel="noopener noreferrer" download={fileName}
            className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Download className="w-4 h-4 text-white/70" />
          </a>
        )}
      </div>
    );
  };

  // ── Location ───────────────────────────────────────────────────────────────
  const renderLocation = () => {
    let loc: any = {};
    try {
      if (message.mediaUrl?.startsWith('{')) loc = JSON.parse(message.mediaUrl);
      else {
        const m = message.content?.match(/\[Location: ([\d.-]+), ([\d.-]+)\]/);
        if (m) loc = { latitude: parseFloat(m[1]), longitude: parseFloat(m[2]) };
      }
    } catch {}
    if (!loc.latitude || !loc.longitude) return (
      <div className="flex items-center gap-2 p-3 bg-white/10 rounded-xl">
        <MapPin className="w-5 h-5 text-red-400" />
        <span className="text-sm">Location shared</span>
      </div>
    );
    const mapUrl = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
    return (
      <div className="rounded-2xl overflow-hidden border border-white/10 max-w-xs">
        <div className="bg-gradient-to-br from-green-900/60 to-blue-900/60 h-28 flex items-center justify-center relative">
          <MapPin className="w-10 h-10 text-red-400 drop-shadow-md" />
          <div className="absolute bottom-2 right-2 bg-black/40 px-2 py-1 rounded text-[10px] text-white">
            📍 {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
          </div>
        </div>
        <div className="p-3 bg-white/5">
          {loc.name && <p className="text-sm font-medium">{loc.name}</p>}
          {loc.address && <p className="text-xs text-white/60 mt-0.5">{loc.address}</p>}
          <a href={mapUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-400 mt-2 hover:underline font-medium">
            <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
          </a>
        </div>
      </div>
    );
  };

  // ── Contact card ───────────────────────────────────────────────────────────
  const renderContact = () => {
    let contacts: any[] = [];
    try { if (message.mediaUrl?.startsWith('[')) contacts = JSON.parse(message.mediaUrl); } catch {}
    const name = contacts[0]?.name?.formatted_name || 'Contact';
    const phone = contacts[0]?.phones?.[0]?.phone || '';
    return (
      <div className="p-3 bg-white/10 rounded-2xl min-w-[200px]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 rounded-full"><User className="w-5 h-5 text-blue-400" /></div>
          <div>
            <p className="text-sm font-semibold">{name}</p>
            {phone && <p className="text-xs text-white/60">{phone}</p>}
          </div>
        </div>
      </div>
    );
  };

  // ── Interactive (button reply / list reply) ────────────────────────────────
  const renderInteractive = () => {
    const body = meta?.body?.text || meta?.text || message.content || '';
    const buttonReply = meta?.button_reply || meta?.buttonReply;
    const listReply = meta?.list_reply || meta?.listReply;

    // Button reply (what user clicked)
    if (buttonReply || listReply) {
      const reply = buttonReply || listReply;
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] text-white/50">
            <MousePointerClick className="w-3 h-3" />
            Button Reply
          </div>
          <div className="px-3 py-2 bg-white/10 rounded-xl border border-white/20 text-sm font-medium">
            {reply.title || reply.text || body}
          </div>
        </div>
      );
    }

    // Interactive message with buttons
    const btns = normalizeButtons(meta?.action?.buttons || meta?.buttons || []);
    return (
      <div className="space-y-2">
        {body && <p className="text-sm whitespace-pre-wrap break-words">{body}</p>}
        {btns.length > 0 && (
          <div className="pt-2 border-t border-white/10 space-y-1">
            {btns.map((btn, i) => (
              <div key={i} className="flex items-center justify-center gap-1.5 p-2 bg-white/10 rounded-xl border border-white/15 text-xs font-semibold cursor-default">
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

  // ── WhatsApp-style template bubble ────────────────────────────────────────
  const renderTemplateBubble = (parsed: ReturnType<typeof parseTemplateContent>) => {
    const { templateName, headerText, bodyText, footerText, buttons, mediaUrl: tplMedia, mediaType: tplMediaType } = parsed;
    const mediaSrc = tplMedia || getMediaSrc(message);
    const hasImage = tplMediaType?.toUpperCase() === 'IMAGE' || message.mediaType === 'image';
    const hasVideo = tplMediaType?.toUpperCase() === 'VIDEO' || message.mediaType === 'video';
    const hasDoc   = tplMediaType?.toUpperCase() === 'DOCUMENT' || message.mediaType === 'document';

    return (
      <div className="w-full max-w-xs space-y-0 overflow-hidden rounded-2xl border border-white/10">
        {/* Template badge */}
        <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5 border-b border-white/10 bg-white/5">
          <MessageSquare className="w-3 h-3 text-green-300 flex-shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-green-300 truncate">
            {templateName ? templateName.replace(/_/g, ' ') : 'Template'}
          </span>
        </div>

        {/* Media header */}
        {mediaSrc && hasImage && (
          <div className="overflow-hidden">{renderImage(mediaSrc)}</div>
        )}
        {mediaSrc && hasVideo && (
          <div className="overflow-hidden">{renderVideo(mediaSrc)}</div>
        )}
        {mediaSrc && hasDoc && (
          <div className="px-3 py-2">{renderDocument(mediaSrc)}</div>
        )}

        {/* Text header */}
        {headerText && !mediaSrc && (
          <p className="px-3 pt-2 text-sm font-bold text-white/90">{headerText}</p>
        )}

        {/* Body */}
        {bodyText && (
          <p className="px-3 py-2 text-sm whitespace-pre-wrap break-words leading-relaxed">{bodyText}</p>
        )}

        {/* Footer */}
        {footerText && (
          <p className="px-3 pb-2 text-[11px] text-white/45">{footerText}</p>
        )}

        {/* Buttons */}
        {buttons.length > 0 && (
          <div className="border-t border-white/10">
            {buttons.map((btn, i) => (
              <div key={i}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-green-300 hover:bg-white/5 cursor-default transition-colors ${i < buttons.length - 1 ? 'border-b border-white/10' : ''}`}>
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

  // ── Main content resolver ─────────────────────────────────────────────────
  const renderContent = () => {
    // TEMPLATE type — always use template renderer
    if (msgType === 'template') {
      const parsed = parseTemplateContent(message.content, meta);
      parsed.isTemplate = true; // force
      return renderTemplateBubble(parsed);
    }

    // INTERACTIVE type
    if (msgType === 'interactive') {
      return renderInteractive();
    }

    // Plain content that looks like a template
    if (message.content) {
      const parsed = parseTemplateContent(message.content, meta);
      if (parsed.isTemplate) {
        return renderTemplateBubble(parsed);
      }
    }

    // Media types
    switch (msgType) {
      case 'image':    return renderImage();
      case 'video':    return renderVideo();
      case 'audio':
      case 'voice':
      case 'ptt':      return renderAudio();
      case 'document': return renderDocument();
      case 'sticker':  return renderImage(); // sticker = image-like
      case 'location': return renderLocation();
      case 'contact':
      case 'contacts': return renderContact();
      default:
        return <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content || ''}</p>;
    }
  };

  // ── Bubble colours ────────────────────────────────────────────────────────
  const bubbleClass = isOutbound
    ? 'bg-[#005c4b] text-white rounded-br-none'
    : 'bg-[#202c33] text-white rounded-bl-none';

  const ts = message.timestamp || message.createdAt || '';

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-1.5 px-2 group`}>
      <div className={`relative max-w-[80%] lg:max-w-[65%] rounded-2xl shadow-md overflow-visible ${bubbleClass}`}
        style={{ padding: msgType === 'template' ? 0 : undefined }}>

        {/* Hover Actions (Copy / Context Menu) */}
        <div className={`absolute top-1 ${isOutbound ? '-left-[4.5rem]' : '-right-[4.5rem]'} flex flex-row-reverse items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 w-[4.5rem] ${isOutbound ? 'justify-end' : 'justify-start'}`}>
          {onCopy && message.content && msgType !== 'template' && (
            <button onClick={() => onCopy(message.content)}
              className="p-1.5 bg-gray-800 border border-gray-700 rounded-lg shadow hover:text-green-400 transition-colors"
              title="Copy">
              <Copy className="w-3.5 h-3.5 text-gray-300" />
            </button>
          )}
          
          {(canEdit || canDelete) && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 bg-gray-800 border border-gray-700 rounded-lg shadow hover:text-green-400 transition-colors"
                title="More"
              >
                <MoreVertical className="w-3.5 h-3.5 text-gray-300" />
              </button>

              {/* Context Menu Dropdown */}
              {showMenu && (
                <div className={`absolute top-8 ${isOutbound ? 'right-0' : 'left-0'} w-36 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-20`}>
                  {canEdit && (
                    <button 
                      onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                  {canDelete && (
                    <button 
                      onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors border-t border-gray-700/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-gray-900/95 rounded-2xl z-30 flex flex-col items-center justify-center p-3 backdrop-blur-sm">
            <p className="text-xs text-white mb-3 text-center">Delete message for everyone?</p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 flex items-center gap-1 transition-colors"
                disabled={deleting}
              >
                {deleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Content or Edit Mode */}
        <div className={msgType === 'template' ? '' : 'px-3.5 py-2.5'}>
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <textarea
                ref={editRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-black/20 text-white text-sm rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none min-h-[60px]"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 text-xs text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEdit}
                  disabled={editSaving || !editText.trim()}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg shadow transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {editSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>

        {/* Timestamp + Status */}
        <div className={`flex items-center justify-end gap-1 ${msgType === 'template' ? 'px-3 pb-2' : 'px-0 pb-0'} mt-1`}>
          {meta?.edited && <span className="text-[10px] text-white/40 mr-1 italic">Edited</span>}
          <span className="text-[10px] text-white/40">{formatTime(ts)}</span>
          <StatusIcon />
        </div>

        {/* Failure reason */}
        {message.status?.toUpperCase() === 'FAILED' && message.failureReason && (
          <div className="mx-3 mb-2 pt-2 border-t border-red-400/30 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-300 shrink-0 mt-0.5" />
            <p className="text-[10px] text-red-300">Failed: {message.failureReason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;