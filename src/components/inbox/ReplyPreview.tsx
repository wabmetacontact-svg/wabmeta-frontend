// src/components/inbox/ReplyPreview.tsx
import React from 'react';
import { X, Reply, Image as ImageIcon, Video, FileText, Mic, MapPin, User } from 'lucide-react';
import type { Message } from './MessageBubble';

interface Props {
  replyTo: Message;
  contactName?: string;
  onCancel: () => void;
}

const ReplyPreview: React.FC<Props> = ({ replyTo, contactName = 'Contact', onCancel }) => {
  const isOutbound = replyTo.direction === 'OUTBOUND';
  const senderName = isOutbound ? 'You' : contactName;

  // ── Get icon + text for media types ──────────────────────────────────────
  const getPreviewContent = () => {
    const type = (replyTo.type || '').toLowerCase();

    switch (type) {
      case 'image':
        return {
          icon: <ImageIcon className="w-3.5 h-3.5" />,
          text: replyTo.content || 'Photo',
        };
      case 'video':
        return {
          icon: <Video className="w-3.5 h-3.5" />,
          text: replyTo.content || 'Video',
        };
      case 'audio':
      case 'voice':
      case 'ptt':
        return {
          icon: <Mic className="w-3.5 h-3.5" />,
          text: 'Voice message',
        };
      case 'document':
        return {
          icon: <FileText className="w-3.5 h-3.5" />,
          text: replyTo.fileName || 'Document',
        };
      case 'location':
        return {
          icon: <MapPin className="w-3.5 h-3.5" />,
          text: 'Location',
        };
      case 'contact':
      case 'contacts':
        return {
          icon: <User className="w-3.5 h-3.5" />,
          text: 'Contact card',
        };
      default:
        return {
          icon: null,
          text: replyTo.content || '',
        };
    }
  };

  const { icon, text } = getPreviewContent();
  const truncated = text.length > 80 ? text.substring(0, 80) + '...' : text;

  return (
    <div className="
      flex-shrink-0 animate-slide-right
      bg-[#0a0e27]/[0.04] backdrop-blur-sm
      border-t border-white/[0.06]
      px-3 sm:px-4 py-2.5
    ">
      <div className="flex items-start gap-3">
        {/* Reply icon */}
        <div className="
          w-7 h-7 rounded-full
          bg-emerald-500/15 border border-emerald-500/30
          flex items-center justify-center flex-shrink-0
          mt-0.5
        ">
          <Reply className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 reply-quote">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
            Replying to {senderName}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            {icon}
            <p className="truncate">{truncated}</p>
          </div>
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="
            p-1 rounded-md
            hover:bg-[#0a0e27]/[0.08]
            text-gray-400 hover:text-white
            transition-colors flex-shrink-0
          "
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ReplyPreview;
