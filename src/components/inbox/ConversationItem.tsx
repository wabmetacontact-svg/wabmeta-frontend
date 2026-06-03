// src/components/inbox/ConversationItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Tag,
  MoreVertical,
  X,
  Check,
  CheckCheck,
  VolumeX,
  Trash2,
  UserCheck,
  Instagram,
  MessageSquare
} from 'lucide-react';
import {
  getContactName,
  getContactInitial,
  getAvatarColor,
  getLabelStyle,
  formatChatTime,
  getMessagePreview,
  CUSTOM_PALETTE,
  AVAILABLE_LABELS,
  type ContactLike,
} from '../../utils/inboxHelpers';

interface Conversation {
  id: string;
  contact: ContactLike;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  lastMessageType?: string;
  lastMessageDirection?: 'INBOUND' | 'OUTBOUND';
  lastMessageStatus?: string;
  unreadCount: number;
  isArchived?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  isWindowOpen?: boolean;
  labels?: string[];
  isTyping?: boolean;
  channelType?: 'WHATSAPP' | 'INSTAGRAM';
}

interface Props {
  conv: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  onPin: (e: React.MouseEvent) => void;
  onArchive: (e: React.MouseEvent) => void;
  onMute?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onAddLabel: (label: string) => void;
  onRemoveLabel: (label: string, e: React.MouseEvent) => void;
  onCreateCustomLabel: (label: string, color?: string) => void;
  allLabels: { label: string; color?: string }[];
  searchQuery?: string;
}

const ConversationItem: React.FC<Props> = ({
  conv,
  isSelected,
  onSelect,
  onPin,
  onArchive,
  onMute,
  onDelete,
  onAddLabel,
  onRemoveLabel,
  onCreateCustomLabel,
  allLabels,
  searchQuery = '',
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('#10B981'); // default emerald
  const menuRef = useRef<HTMLDivElement>(null);

  const name = getContactName(conv.contact);
  const initial = getContactInitial(conv.contact);
  const avatarColor = getAvatarColor(name);
  const hasUnread = conv.unreadCount > 0;
  const isOutbound = conv.lastMessageDirection === 'OUTBOUND';

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu && !showLabels) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowLabels(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu, showLabels]);

  // ── Highlighted name for search ────────────────────────────────────────
  const renderName = () => {
    if (!searchQuery.trim()) return name;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = name.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-emerald-400/30 text-emerald-100 rounded px-0.5">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // ── Status icon for outbound messages ──────────────────────────────────
  const StatusIcon = () => {
    if (!isOutbound) return null;
    const status = conv.lastMessageStatus?.toUpperCase();
    if (status === 'READ') return <CheckCheck className="w-3 h-3 text-blue-400 flex-shrink-0" />;
    if (status === 'DELIVERED') return <CheckCheck className="w-3 h-3 text-gray-400 flex-shrink-0" />;
    if (status === 'SENT') return <Check className="w-3 h-3 text-gray-400 flex-shrink-0" />;
    return null;
  };

  const ChannelBadge = ({ type }: { type?: 'WHATSAPP' | 'INSTAGRAM' }) => {
    if (type === 'INSTAGRAM') {
      return (
        <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center border-2 border-[#0a0e27] shadow-lg z-10">
          <Instagram size={10} className="text-white" />
        </div>
      );
    }
    return (
      <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center border-2 border-[#0a0e27] shadow-lg z-10">
        <MessageSquare size={10} className="text-white" />
      </div>
    );
  };

  return (
    <div className={`conv-item relative ${isSelected ? 'active' : ''}`}>
      <div
        onClick={onSelect}
        className={`
          group flex items-start gap-3 px-3 py-3 cursor-pointer
          transition-all duration-200
          ${isSelected
            ? 'bg-[#0a0e27]/[0.06]'
            : 'hover:bg-[#0a0e27]/[0.03]'
          }
        `}
      >
        {/* ── Avatar ─────────────────────────────────────────────────────── */}
        <div className="relative flex-shrink-0">
          <div
            className={`
              w-12 h-12 rounded-full overflow-hidden
              bg-gradient-to-br ${avatarColor}
              flex items-center justify-center
              text-white font-semibold text-base
              shadow-md ring-2 ring-white/5
              ${hasUnread ? 'ring-emerald-400/30' : ''}
            `}
          >
            {conv.contact.avatar ? (
              <img
                src={conv.contact.avatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              initial
            )}
          </div>

          <ChannelBadge type={conv.channelType || 'WHATSAPP'} />

          {/* Pin badge */}
          {conv.isPinned && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center ring-2 ring-[#0a0e27]">
              <Pin className="w-2.5 h-2.5 text-amber-900" />
            </div>
          )}

          {/* Online indicator (when window is open) */}
          {!conv.isPinned && conv.isWindowOpen && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-[#0a0e27]" />
          )}

          {/* Muted icon */}
          {conv.isMuted && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center ring-2 ring-[#0a0e27]">
              <VolumeX className="w-2.5 h-2.5 text-gray-300" />
            </div>
          )}
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Top row: Name + Time */}
          <div className="flex justify-between items-baseline mb-0.5">
            <h3
              className={`
                text-sm truncate flex-1
                ${hasUnread
                  ? 'font-semibold text-white'
                  : 'font-medium text-gray-200'
                }
              `}
            >
              {renderName()}
            </h3>
            <span
              className={`
                text-[11px] ml-2 flex-shrink-0
                ${hasUnread
                  ? 'text-emerald-400 font-medium'
                  : 'text-gray-500'
                }
              `}
            >
              {formatChatTime(conv.lastMessageAt)}
            </span>
          </div>

          {/* Bottom row: Preview + Badge */}
          <div className="flex items-center gap-2">
            {/* Typing indicator OR preview */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {conv.isTyping ? (
                <span className="flex items-center gap-1 text-emerald-400 text-xs">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full typing-dot" />
                    <span className="w-1 h-1 bg-emerald-400 rounded-full typing-dot" />
                    <span className="w-1 h-1 bg-emerald-400 rounded-full typing-dot" />
                  </span>
                  <span className="font-medium">typing...</span>
                </span>
              ) : (
                <>
                  <StatusIcon />
                  <p
                    className={`
                      text-xs truncate
                      ${hasUnread
                        ? 'text-gray-200 font-medium'
                        : 'text-gray-400'
                      }
                    `}
                  >
                    {getMessagePreview(conv.lastMessagePreview, conv.lastMessageType)}
                  </p>
                </>
              )}
            </div>

            {/* Unread Badge */}
            {hasUnread && (
              <span className="
                flex-shrink-0 min-w-[1.25rem] h-5 px-1.5
                bg-emerald-500 text-white text-[10px] font-bold
                rounded-full flex items-center justify-center
                shadow-sm animate-badge-pulse
              ">
                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
              </span>
            )}
          </div>

          {/* Labels */}
          {conv.labels && conv.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {conv.labels.slice(0, 3).map((labelName) => {
                const labelObj = allLabels.find(l => l.label === labelName);
                const style = getLabelStyle(labelName, labelObj?.color);
                return (
                  <div
                    key={labelName}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveLabel(labelName, e);
                    }}
                    className={`
                      px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider
                      ${style.bg} ${style.text} border ${style.border}
                      cursor-pointer hover:opacity-80 group/label flex items-center gap-1 transition-all
                    `}
                  >
                    {labelName}
                    <X className="w-2.5 h-2.5 opacity-0 group-hover/label:opacity-80" />
                  </div>
                );
              })}
              {conv.labels.length > 3 && (
                <span className="text-[9px] text-gray-500 self-center">
                  +{conv.labels.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Menu Button ──────────────────────────────────────────────── */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
            setShowLabels(false);
          }}
          className="
            p-1 rounded-md
            opacity-0 group-hover:opacity-100
            hover:bg-[#0a0e27]/[0.08]
            transition-all duration-200
            flex-shrink-0 self-start mt-1
          "
        >
          <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* ── Context Menu ──────────────────────────────────────────────── */}
      {showMenu && (
        <div
          ref={menuRef}
          className="
            absolute right-3 top-12 z-30
            w-48 py-1.5
            bg-[#0f1729]/98 backdrop-blur-xl
            border border-white/[0.1]
            rounded-xl shadow-2xl
            animate-fade-in
          "
        >
          <button
            onClick={(e) => {
              onPin(e);
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-[#0a0e27]/[0.05] transition-colors"
          >
            {conv.isPinned ? (
              <>
                <PinOff className="w-4 h-4 text-gray-400" />
                Unpin conversation
              </>
            ) : (
              <>
                <Pin className="w-4 h-4 text-gray-400" />
                Pin to top
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLabels(true);
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-[#0a0e27]/[0.05] transition-colors"
          >
            <Tag className="w-4 h-4 text-gray-400" />
            Add label
          </button>

          {onMute && (
            <button
              onClick={(e) => {
                onMute(e);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-[#0a0e27]/[0.05] transition-colors"
            >
              <VolumeX className="w-4 h-4 text-gray-400" />
              {conv.isMuted ? 'Unmute' : 'Mute notifications'}
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-[#0a0e27]/[0.05] transition-colors"
          >
            <UserCheck className="w-4 h-4 text-gray-400" />
            Mark as read
          </button>

          <div className="border-t border-white/[0.06] my-1" />

          <button
            onClick={(e) => {
              onArchive(e);
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-[#0a0e27]/[0.05] transition-colors"
          >
            {conv.isArchived ? (
              <>
                <ArchiveRestore className="w-4 h-4 text-gray-400" />
                Unarchive
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 text-gray-400" />
                Archive
              </>
            )}
          </button>

          {onDelete && (
            <button
              onClick={(e) => {
                onDelete(e);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      )}

      {/* ── Label Picker ──────────────────────────────────────────────── */}
      {showLabels && (
        <div
          ref={menuRef}
          className="
            absolute right-3 top-12 z-30
            w-56 py-1.5
            bg-[#0f1729]/98 backdrop-blur-xl
            border border-white/[0.1]
            rounded-xl shadow-2xl
            animate-fade-in
          "
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Apply Label
          </div>
          <div className="max-h-64 overflow-y-auto inbox-scroll">
            {(() => {
              const mergedLabels = Array.from(new Map(
                [
                  ...AVAILABLE_LABELS.map(l => ({ label: l })), 
                  ...allLabels
                ].map(item => [item.label, item])
              ).values());
              const unappliedLabels = mergedLabels.filter((l) => !(conv.labels || []).includes(l.label));
              
              if (unappliedLabels.length === 0) {
                return (
                  <div className="px-3 py-3 text-xs text-gray-500 text-center">
                    All labels applied
                  </div>
                );
              }

              return unappliedLabels.map(({ label, color }) => {
                const style = getLabelStyle(label, color);
                return (
                  <button
                    key={label}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddLabel(label);
                      setShowLabels(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[#0a0e27]/[0.05] transition-colors"
                  >
                    <span className={`w-3 h-3 rounded-full ${style.dot}`} />
                    <span className={`capitalize text-xs font-medium ${style.text}`}>
                      {label}
                    </span>
                  </button>
                );
              });
            })()}
          </div>
          
          <div className="border-t border-white/[0.06] mt-1 p-2">
            <div className="flex gap-1 mb-2 overflow-x-auto inbox-scroll pb-1">
              {CUSTOM_PALETTE.map((p) => (
                <button
                  key={p.color}
                  onClick={(e) => { e.stopPropagation(); setSelectedColor(p.color); }}
                  className={`w-5 h-5 rounded-full flex-shrink-0 border-2 ${selectedColor === p.color ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: p.color }}
                  title={p.name}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="New custom label..."
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter' && newLabelName.trim()) {
                    onCreateCustomLabel(newLabelName.trim(), selectedColor);
                    onAddLabel(newLabelName.trim());
                    setNewLabelName('');
                    setShowLabels(false);
                  }
                }}
                className="
                  flex-1 bg-white/[0.05] border border-white/[0.1] rounded text-sm px-2 py-1
                  text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50
                "
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (newLabelName.trim()) {
                    onCreateCustomLabel(newLabelName.trim(), selectedColor);
                    onAddLabel(newLabelName.trim());
                    setNewLabelName('');
                    setShowLabels(false);
                  }
                }}
                className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ConversationItem);