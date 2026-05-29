// src/components/inbox/ChatWindow.tsx
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowDown, MessageSquare, Loader2 } from 'lucide-react';
import MessageBubble, { type Message } from './MessageBubble';
import { formatDateSeparator } from '../../utils/inboxHelpers';
import toast from 'react-hot-toast';

interface Props {
  messages: Message[];
  conversationId?: string;
  contactName?: string;
  loading?: boolean;
  searchQuery?: string;
  searchResultIds?: string[];
  currentSearchIndex?: number;
  onReply?: (msg: Message) => void;
  onForward?: (msg: Message) => void;
  onStar?: (msg: Message) => void;
  onReact?: (msg: Message, emoji: string) => void;
  onDeleted?: (messageId: string) => void;
  onEdited?: (messageId: string, content: string) => void;
  onJumpToMessage?: (messageId: string) => void;
}

const ChatWindow: React.FC<Props> = ({
  messages,
  conversationId,
  contactName,
  loading,
  searchQuery,
  searchResultIds = [],
  currentSearchIndex = -1,
  onReply,
  onForward,
  onStar,
  onReact,
  onDeleted,
  onEdited,
  onJumpToMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const lastMessageCountRef = useRef(messages.length);
  const isInitialLoadRef = useRef(true);

  // ── Scroll to bottom ────────────────────────────────────────────────────
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end',
    });
    setNewMessageCount(0);
  }, []);

  // ── Handle scroll: show/hide scroll-to-bottom button ────────────────────
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 100;

    setShowScrollButton(!isNearBottom && scrollHeight > clientHeight + 200);

    if (isNearBottom) {
      setNewMessageCount(0);
    }
  }, []);

  // ── Auto-scroll on new messages ─────────────────────────────────────────
  useEffect(() => {
    const newCount = messages.length - lastMessageCountRef.current;
    if (newCount > 0) {
      const el = containerRef.current;
      if (!el) return;

      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const isNearBottom = distanceFromBottom < 200;

      if (isInitialLoadRef.current || isNearBottom) {
        setTimeout(() => scrollToBottom(!isInitialLoadRef.current), 100);
      } else {
        // User is scrolled up - show counter
        setNewMessageCount((prev) => prev + newCount);
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // ── Initial load: instant scroll to bottom ─────────────────────────────
  useEffect(() => {
    if (messages.length > 0 && isInitialLoadRef.current) {
      setTimeout(() => {
        scrollToBottom(false);
        isInitialLoadRef.current = false;
      }, 50);
    }
  }, [messages.length, scrollToBottom]);

  // ── Reset on conversation change ────────────────────────────────────────
  useEffect(() => {
    isInitialLoadRef.current = true;
    setNewMessageCount(0);
    setShowScrollButton(false);
  }, [conversationId]);

  // ── Group messages by date + sender ─────────────────────────────────────
  const groupedMessages = useMemo(() => {
    const groups: Array<{
      type: 'date' | 'message';
      message?: Message;
      isGrouped?: boolean;
      showAvatar?: boolean;
      date?: string;
      key: string;
    }> = [];

    let lastDate: string | null = null;
    let lastDirection: string | null = null;
    let lastSenderTime: number = 0;

    messages.forEach((msg, idx) => {
      const msgDate = new Date(msg.createdAt || msg.timestamp);
      const dateKey = msgDate.toDateString();
      const msgTime = msgDate.getTime();

      // Date separator
      if (dateKey !== lastDate) {
        groups.push({
          type: 'date',
          date: msg.createdAt || msg.timestamp,
          key: `date-${dateKey}`,
        });
        lastDate = dateKey;
        lastDirection = null;
        lastSenderTime = 0;
      }

      // Same sender within 2 minutes = grouped
      const isGrouped =
        msg.direction === lastDirection &&
        msgTime - lastSenderTime < 2 * 60 * 1000;

      // Show avatar on LAST message of group (for inbound)
      const nextMsg = messages[idx + 1];
      const isLastInGroup =
        !nextMsg ||
        nextMsg.direction !== msg.direction ||
        new Date(nextMsg.createdAt || nextMsg.timestamp).getTime() - msgTime >= 2 * 60 * 1000 ||
        new Date(nextMsg.createdAt || nextMsg.timestamp).toDateString() !== dateKey;

      groups.push({
        type: 'message',
        message: msg,
        isGrouped,
        showAvatar: isLastInGroup,
        key: msg.id,
      });

      lastDirection = msg.direction;
      lastSenderTime = msgTime;
    });

    return groups;
  }, [messages]);

  // ── Copy handler ────────────────────────────────────────────────────────
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard', {
      duration: 2000,
      style: {
        background: '#1a2238',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
      },
    });
  }, []);

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center chat-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center chat-bg">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="
            w-20 h-20 rounded-full
            bg-emerald-500/10 border border-emerald-500/20
            flex items-center justify-center
          ">
            <MessageSquare className="w-9 h-9 text-emerald-400" />
          </div>
          <h3 className="text-base font-semibold text-white">No messages yet</h3>
          <p className="text-sm text-gray-400 max-w-xs">
            Start the conversation by sending a message below
          </p>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <div className="flex-1 relative overflow-hidden chat-bg chat-area">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="
          h-full overflow-y-auto inbox-scroll chat-scroll-container
          py-3 pb-6
        "
      >
        {groupedMessages.map((item) => {
          if (item.type === 'date') {
            return (
              <div key={item.key} className="flex justify-center my-4">
                <span className="
                  px-3 py-1
                  bg-white/[0.06] backdrop-blur-sm
                  border border-white/[0.05]
                  text-gray-300 text-[11px] font-medium
                  rounded-full shadow-sm
                ">
                  {formatDateSeparator(item.date)}
                </span>
              </div>
            );
          }

          const msg = item.message!;
          const isHighlighted =
            searchResultIds.length > 0 &&
            currentSearchIndex >= 0 &&
            searchResultIds[currentSearchIndex] === msg.id;

          return (
            <MessageBubble
              key={item.key}
              message={msg}
              conversationId={conversationId}
              contactName={contactName}
              showAvatar={item.showAvatar}
              isGrouped={item.isGrouped}
              isHighlighted={isHighlighted}
              searchQuery={searchQuery}
              onCopy={handleCopy}
              onReply={onReply}
              onForward={onForward}
              onStar={onStar}
              onReact={onReact}
              onDeleted={onDeleted}
              onEdited={onEdited}
              onJumpToMessage={onJumpToMessage}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Scroll to bottom button ─────────────────────────────────────── */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom(true)}
          className="
            absolute bottom-6 right-6 z-10
            w-11 h-11 rounded-full
            bg-emerald-500 hover:bg-emerald-600
            text-white shadow-lg shadow-emerald-500/30
            flex items-center justify-center
            transition-all hover:scale-110 active:scale-95
            animate-fade-in
          "
        >
          <ArrowDown className="w-5 h-5" />
          {newMessageCount > 0 && (
            <span className="
              absolute -top-1 -right-1
              min-w-[20px] h-5 px-1.5
              bg-red-500 text-white
              text-[10px] font-bold
              rounded-full flex items-center justify-center
              ring-2 ring-[#0a0e1c]
            ">
              {newMessageCount > 99 ? '99+' : newMessageCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default ChatWindow;