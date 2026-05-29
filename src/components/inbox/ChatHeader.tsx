// src/components/inbox/ChatHeader.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  Search,
  Info,
  MoreVertical,
  X,
  Star,
  Archive,
  Trash2,
  VolumeX,
  Volume2,
  UserCheck,
  Tag,
  Download,
  Bell,
  BellOff,
} from 'lucide-react';
import {
  getContactName,
  getContactInitial,
  getAvatarColor,
  type ContactLike,
} from '../../utils/inboxHelpers';

interface Conversation {
  id: string;
  contact: ContactLike;
  isWindowOpen?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  isTyping?: boolean;
  lastSeenAt?: string;
}

interface Props {
  conversation: Conversation;
  showContactInfo: boolean;
  isMobile?: boolean;
  onBack: () => void;
  onToggleContactInfo: () => void;
  onCall: () => void;
  onVideoCall?: () => void;
  onSearchMessages: () => void;
  onMute?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onClearChat?: () => void;
  onExportChat?: () => void;
}

const ChatHeader: React.FC<Props> = ({
  conversation,
  showContactInfo,
  isMobile = false,
  onBack,
  onToggleContactInfo,
  onCall,
  onVideoCall,
  onSearchMessages,
  onMute,
  onArchive,
  onDelete,
  onClearChat,
  onExportChat,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = getContactName(conversation.contact);
  const initial = getContactInitial(conversation.contact);
  const avatarColor = getAvatarColor(name);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  // Last seen / status text
  const getStatusText = () => {
    if (conversation.isTyping) {
      return (
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="flex gap-0.5">
            <span className="w-1 h-1 bg-emerald-400 rounded-full typing-dot" />
            <span className="w-1 h-1 bg-emerald-400 rounded-full typing-dot" />
            <span className="w-1 h-1 bg-emerald-400 rounded-full typing-dot" />
          </span>
          <span className="text-xs font-medium ml-1">typing...</span>
        </span>
      );
    }
    
    // Simulate real-time active based on lastMessageAt (e.g. within last 3 minutes)
    if ((conversation as any).lastMessageAt) {
      const lastMsgDate = new Date((conversation as any).lastMessageAt);
      const diffMins = (Date.now() - lastMsgDate.getTime()) / (1000 * 60);
      
      if (diffMins <= 3) {
        return <span className="text-emerald-400">● Active now</span>;
      }
      
      // Show relative time if within 24h, else date
      const diffHours = diffMins / 60;
      if (diffHours < 24) {
        if (Math.floor(diffHours) === 0) {
           return <span className="text-gray-400">Last active: {Math.floor(diffMins)} mins ago</span>;
        }
        return <span className="text-gray-400">Last active: {Math.floor(diffHours)} hours ago</span>;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        return <span className="text-gray-400">Last active: {diffDays} {diffDays === 1 ? 'day' : 'days'} ago</span>;
      }
    }

    if (conversation.isWindowOpen) {
      return <span className="text-emerald-400">● Active now</span>;
    }
    return <span className="text-gray-500">{conversation.contact.phone}</span>;
  };

  return (
    <div className="
      flex-shrink-0 relative
      bg-[#0a0e1c]/80 backdrop-blur-xl
      border-b border-white/[0.06]
      px-3 sm:px-4 py-3
    ">
      <div className="flex items-center justify-between gap-3">
        {/* ── Left: Back + Avatar + Name ───────────────────────────────── */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Mobile back button */}
          {isMobile && (
            <button
              onClick={onBack}
              className="
                lg:hidden p-1.5 -ml-1 rounded-lg
                hover:bg-white/[0.06]
                text-gray-300 hover:text-white
                transition-colors flex-shrink-0
              "
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Avatar */}
          <button
            onClick={onToggleContactInfo}
            className="relative flex-shrink-0 group"
          >
            <div className={`
              w-10 h-10 rounded-full overflow-hidden
              bg-gradient-to-br ${avatarColor}
              flex items-center justify-center
              text-white font-semibold
              shadow-md ring-2 ring-white/5
              group-hover:ring-emerald-400/30
              transition-all
            `}>
              {conversation.contact.avatar ? (
                <img
                  src={conversation.contact.avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            {conversation.isWindowOpen && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#0a0e1c]" />
            )}
          </button>

          {/* Name & Status */}
          <button
            onClick={onToggleContactInfo}
            className="text-left min-w-0 flex-1 hover:opacity-80 transition-opacity"
          >
            <h2 className="font-semibold text-white text-sm sm:text-base truncate flex items-center gap-1.5">
              {name}
              {conversation.isMuted && (
                <VolumeX className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              )}
            </h2>
            <p className="text-xs truncate">
              {getStatusText()}
            </p>
          </button>
        </div>

        {/* ── Right: Actions ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Voice Call */}
          <button
            onClick={onCall}
            title="Voice call"
            className="
              p-2 rounded-lg
              hover:bg-emerald-500/10
              text-gray-400 hover:text-emerald-400
              transition-all hover:scale-110
            "
          >
            <Phone className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Video Call */}
          {onVideoCall && (
            <button
              onClick={onVideoCall}
              title="Video call"
              className="
                p-2 rounded-lg
                hover:bg-blue-500/10
                text-gray-400 hover:text-blue-400
                transition-all hover:scale-110
                hidden sm:block
              "
            >
              <Video className="w-[18px] h-[18px]" />
            </button>
          )}

          {/* Search Messages */}
          <button
            onClick={onSearchMessages}
            title="Search in chat"
            className="
              p-2 rounded-lg
              hover:bg-white/[0.06]
              text-gray-400 hover:text-white
              transition-all hover:scale-110
              hidden sm:block
            "
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Info Panel Toggle */}
          <button
            onClick={onToggleContactInfo}
            title="Contact info"
            className={`
              p-2 rounded-lg transition-all hover:scale-110
              ${showContactInfo
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'hover:bg-white/[0.06] text-gray-400 hover:text-white'
              }
            `}
          >
            <Info className="w-[18px] h-[18px]" />
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              title="More"
              className="
                p-2 rounded-lg
                hover:bg-white/[0.06]
                text-gray-400 hover:text-white
                transition-all
              "
            >
              <MoreVertical className="w-[18px] h-[18px]" />
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div
                ref={menuRef}
                className="
                  absolute right-0 top-12 z-50
                  w-56 py-1.5
                  bg-[#0f1729]/98 backdrop-blur-xl
                  border border-white/[0.1]
                  rounded-xl shadow-2xl
                  animate-fade-in
                "
              >
                <button
                  onClick={() => {
                    onSearchMessages();
                    setShowMenu(false);
                  }}
                  className="sm:hidden w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-white/[0.05] transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  Search messages
                </button>

                {onMute && (
                  <button
                    onClick={() => {
                      onMute();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-white/[0.05] transition-colors"
                  >
                    {conversation.isMuted ? (
                      <>
                        <Bell className="w-4 h-4 text-gray-400" />
                        Unmute notifications
                      </>
                    ) : (
                      <>
                        <BellOff className="w-4 h-4 text-gray-400" />
                        Mute notifications
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-white/[0.05] transition-colors"
                >
                  <Star className="w-4 h-4 text-gray-400" />
                  Starred messages
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-white/[0.05] transition-colors"
                >
                  <Tag className="w-4 h-4 text-gray-400" />
                  Manage labels
                </button>

                {onExportChat && (
                  <button
                    onClick={() => {
                      onExportChat();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-white/[0.05] transition-colors"
                  >
                    <Download className="w-4 h-4 text-gray-400" />
                    Export chat
                  </button>
                )}

                <div className="border-t border-white/[0.06] my-1" />

                {onArchive && (
                  <button
                    onClick={() => {
                      onArchive();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-white/[0.05] transition-colors"
                  >
                    <Archive className="w-4 h-4 text-gray-400" />
                    {conversation.isArchived ? 'Unarchive chat' : 'Archive chat'}
                  </button>
                )}

                {onClearChat && (
                  <button
                    onClick={() => {
                      onClearChat();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear messages
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete conversation
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
