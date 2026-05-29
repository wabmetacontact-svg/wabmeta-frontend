// src/utils/inboxHelpers.ts
// Common helpers for inbox components

export interface ContactLike {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  avatar?: string;
  whatsappProfileName?: string;
  email?: string;
  tags?: string[];
}

// ─── Name helpers ────────────────────────────────────────────────────────────
export const getContactName = (contact: ContactLike): string => {
  if (contact.whatsappProfileName) return contact.whatsappProfileName;
  if (contact.name) return contact.name;
  if (contact.firstName || contact.lastName) {
    return [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  }
  return contact.phone;
};

export const getContactInitial = (contact: ContactLike): string =>
  getContactName(contact).charAt(0).toUpperCase();

// ─── Generate consistent color from string ───────────────────────────────────
const AVATAR_COLORS = [
  'from-emerald-400 to-green-600',
  'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',
  'from-orange-400 to-red-600',
  'from-teal-400 to-cyan-600',
  'from-yellow-400 to-orange-600',
  'from-pink-400 to-rose-600',
  'from-violet-400 to-purple-600',
  'from-indigo-400 to-blue-600',
  'from-rose-400 to-pink-600',
];

export const getAvatarColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// ─── Label colors ────────────────────────────────────────────────────────────
export const LABEL_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  important:    { bg: 'bg-red-500/15',    text: 'text-red-300',    dot: 'bg-red-500',    border: 'border-red-500/30' },
  'follow-up':  { bg: 'bg-amber-500/15',  text: 'text-amber-300',  dot: 'bg-amber-500',  border: 'border-amber-500/30' },
  resolved:     { bg: 'bg-emerald-500/15',text: 'text-emerald-300',dot: 'bg-emerald-500',border: 'border-emerald-500/30' },
  pending:      { bg: 'bg-orange-500/15', text: 'text-orange-300', dot: 'bg-orange-500', border: 'border-orange-500/30' },
  vip:          { bg: 'bg-purple-500/15', text: 'text-purple-300', dot: 'bg-purple-500', border: 'border-purple-500/30' },
  new:          { bg: 'bg-blue-500/15',   text: 'text-blue-300',   dot: 'bg-blue-500',   border: 'border-blue-500/30' },
  support:      { bg: 'bg-indigo-500/15', text: 'text-indigo-300', dot: 'bg-indigo-500', border: 'border-indigo-500/30' },
  sales:        { bg: 'bg-pink-500/15',   text: 'text-pink-300',   dot: 'bg-pink-500',   border: 'border-pink-500/30' },
  spam:         { bg: 'bg-gray-500/15',   text: 'text-gray-300',   dot: 'bg-gray-500',   border: 'border-gray-500/30' },
};

export const AVAILABLE_LABELS = Object.keys(LABEL_COLORS);

export const getLabelStyle = (label: string) =>
  LABEL_COLORS[label.toLowerCase()] || {
    bg: 'bg-gray-500/15',
    text: 'text-gray-300',
    dot: 'bg-gray-500',
    border: 'border-gray-500/30',
  };

// ─── Time helpers ────────────────────────────────────────────────────────────
export const formatChatTime = (dateString?: string | Date | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (isToday) {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    if (isYesterday) return 'Yesterday';
    if (diffDays < 7) {
      return date.toLocaleDateString('en-IN', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return '';
  }
};

export const formatMessageTime = (dateString?: string | Date | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

export const formatDateSeparator = (dateString?: string | Date | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString('en-IN', { weekday: 'long' });
    }
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

// ─── Message preview text ────────────────────────────────────────────────────
export const getMessagePreview = (raw?: string, type?: string): string => {
  if (!raw) return 'No messages yet';

  // Revoked/deleted
  if (raw === '[revoke]' || raw === '[Revoke]') return '🚫 This message was deleted';

  // Interactive
  if (raw === '[button]' || raw === '[Button]') return '🔘 Button message';
  if (type === 'interactive' || type === 'INTERACTIVE') return '🔘 Interactive message';

  // Template multi-line
  if (raw.startsWith('Campaign:') || raw.startsWith('Template:')) {
    const tplLine = raw.split('\n').find((l) => l.startsWith('Template:'));
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
    } catch {}
  }

  // Media types
  const mediaMap: Record<string, string> = {
    '[image]': '📷 Photo',
    '[Image]': '📷 Photo',
    '[video]': '🎥 Video',
    '[Video]': '🎥 Video',
    '[audio]': '🎵 Voice message',
    '[Audio]': '🎵 Voice message',
    '[document]': '📄 Document',
    '[Document]': '📄 Document',
    '[sticker]': '🎭 Sticker',
    '[Sticker]': '🎭 Sticker',
    '[location]': '📍 Location',
    '[Location]': '📍 Location',
    '[contact]': '👤 Contact',
    '[Contact]': '👤 Contact',
  };
  if (mediaMap[raw]) return mediaMap[raw];

  return raw.substring(0, 60);
};

// ─── Sort conversations ──────────────────────────────────────────────────────
export interface SortableConversation {
  id: string;
  lastMessageAt?: string;
  isPinned?: boolean;
}

export const sortConversations = <T extends SortableConversation>(convs: T[]): T[] => {
  return [...convs].sort((a, b) => {
    // Pinned first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then by last message
    return (
      new Date(b.lastMessageAt || 0).getTime() -
      new Date(a.lastMessageAt || 0).getTime()
    );
  });
};

// ─── File size formatter ─────────────────────────────────────────────────────
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

// ─── Duration formatter (seconds → MM:SS) ────────────────────────────────────
export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ─── Highlight search term in text ───────────────────────────────────────────
export const highlightText = (text: string, query: string): string => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-400/30 text-yellow-200 rounded px-0.5">$1</mark>');
};

// ─── Detect URLs in text ─────────────────────────────────────────────────────
export const linkifyText = (text: string): string => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-300 underline hover:text-blue-200">$1</a>'
  );
};
