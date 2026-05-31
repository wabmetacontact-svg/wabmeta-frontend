// src/components/inbox/ChatInput.tsx - PREMIUM REDESIGN
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  FileText,
  Loader2,
  Clock,
  Sparkles,
  Bold,
  Italic,
  Code,
  X,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AttachmentMenu from './AttachmentMenu';
import EmojiPickerPanel from './EmojiPickerPanel';
import VoiceRecorder from './VoiceRecorder';
import ReplyPreview from './ReplyPreview';
import type { Message } from './MessageBubble';

interface QuickReply {
  id: string;
  shortcut: string;
  text: string;
}

interface Props {
  onSendMessage: (message: string, options?: { replyToId?: string }) => Promise<void>;
  onSendVoice?: (blob: Blob, duration: number) => Promise<void>;
  onOpenTemplateModal: () => void;
  onMediaUpload?: (file: File) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  isWindowOpen: boolean;
  windowExpiresAt?: string | Date | null;
  placeholder?: string;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  contactName?: string;
  quickReplies?: QuickReply[];
}

const ChatInput: React.FC<Props> = ({
  onSendMessage,
  onSendVoice,
  onOpenTemplateModal,
  onMediaUpload,
  onTyping,
  disabled = false,
  isWindowOpen,
  windowExpiresAt,
  placeholder = 'Type a message...',
  replyTo,
  onCancelReply,
  contactName,
  quickReplies = [],
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileAccept = useRef<string>('image/*,video/*,audio/*,.pdf,.doc,.docx');
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Window status ────────────────────────────────────────────────────────
  const checkWindowOpen = () => {
    if (!isWindowOpen) return false;
    if (!windowExpiresAt) return false;
    return new Date(windowExpiresAt) > new Date();
  };
  const windowOpen = checkWindowOpen();

  // ── Auto-resize textarea ────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // ── Typing indicator emit ───────────────────────────────────────────────
  useEffect(() => {
    if (!onTyping) return;
    if (message.length > 0) {
      onTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => onTyping(false), 2000);
    }
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [message, onTyping]);

  // ── Focus on mount and reply change ─────────────────────────────────────
  useEffect(() => {
    if (replyTo) {
      textareaRef.current?.focus();
    }
  }, [replyTo]);

  // ── Quick reply trigger (type "/" at start) ─────────────────────────────
  useEffect(() => {
    if (message.startsWith('/') && quickReplies.length > 0) {
      setShowQuickReplies(true);
    } else {
      setShowQuickReplies(false);
    }
  }, [message, quickReplies.length]);

  // ── Submit handler ──────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!message.trim() || disabled) return;

      if (!windowOpen) {
        onOpenTemplateModal();
        return;
      }

      const textToSend = message.trim();
      const replyId = replyTo?.id;

      // 1. Reset UI immediately for optimistic typing
      setMessage('');
      onCancelReply?.();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }

      // 2. Send asynchronously without blocking the UI
      onSendMessage(textToSend, { replyToId: replyId }).catch((error: any) => {
        toast.error(error.message || 'Failed to send message');
      });
    },
    [message, disabled, windowOpen, onOpenTemplateModal, onSendMessage, replyTo, onCancelReply]
  );

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter to send, Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    // Esc to cancel reply
    if (e.key === 'Escape' && replyTo) {
      e.preventDefault();
      onCancelReply?.();
      return;
    }

    // Ctrl/Cmd + B = Bold
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      wrapSelection('*', '*');
    }

    // Ctrl/Cmd + I = Italic
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      wrapSelection('_', '_');
    }
  };

  // ── Wrap selected text with markdown ────────────────────────────────────
  const wrapSelection = (before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = message.substring(start, end);
    const newMessage = message.substring(0, start) + before + selected + after + message.substring(end);
    setMessage(newMessage);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // ── Insert emoji at cursor ─────────────────────────────────────────────
  const handleEmojiSelect = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setMessage((prev) => prev + emoji);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newMessage = message.substring(0, start) + emoji + message.substring(end);
    setMessage(newMessage);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  // ── File handling ──────────────────────────────────────────────────────
  const handleAttachmentSelect = (
    type: 'image' | 'video' | 'document' | 'audio' | 'camera' | 'location' | 'contact',
    accept?: string
  ) => {
    if (!windowOpen) {
      toast.error('Session expired. Send a template first.');
      return;
    }

    if (type === 'location' || type === 'contact') {
      toast('Coming soon!', { icon: '🚧' });
      return;
    }

    if (accept) fileAccept.current = accept;

    // Camera: trigger image input with capture
    if (type === 'camera') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) await uploadFile(file);
      };
      input.click();
      return;
    }

    fileInputRef.current?.click();
  };

  const uploadFile = async (file: File) => {
    if (file.size > 16 * 1024 * 1024) {
      toast.error('File size must be less than 16MB');
      return;
    }
    if (!onMediaUpload) {
      toast.error('Media upload not configured');
      return;
    }
    try {
      setUploading(true);
      await onMediaUpload(file);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  // ── Drag and drop ──────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (windowOpen) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!windowOpen) {
      toast.error('Session expired');
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  // ── Voice recording ────────────────────────────────────────────────────
  const handleVoiceSend = async (blob: Blob, duration: number) => {
    if (!onSendVoice) {
      toast.error('Voice messages not configured');
      return;
    }
    await onSendVoice(blob, duration);
  };

  // ── Quick reply select ─────────────────────────────────────────────────
  const handleQuickReplySelect = (qr: QuickReply) => {
    setMessage(qr.text);
    setShowQuickReplies(false);
    textareaRef.current?.focus();
  };

  // ── Filter quick replies based on input ────────────────────────────────
  const filteredQuickReplies = quickReplies.filter((qr) => {
    if (!message.startsWith('/')) return false;
    const query = message.substring(1).toLowerCase();
    return (
      qr.shortcut.toLowerCase().includes(query) ||
      qr.text.toLowerCase().includes(query)
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // Window closed state
  if (!windowOpen) {
    return (
      <div className="
        flex-shrink-0
        bg-[#0a0e1c]/80 backdrop-blur-xl
        border-t border-white/[0.06]
        p-3 sm:p-4
      ">
        <div className="
          bg-gradient-to-br from-amber-500/10 to-orange-500/10
          border border-amber-500/20
          rounded-2xl p-4
          flex flex-col sm:flex-row items-center justify-between gap-3
        ">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="
              w-11 h-11 rounded-xl
              bg-amber-500/20 border border-amber-500/30
              flex items-center justify-center flex-shrink-0
            ">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                24-Hour Session Closed
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Start a new session using an approved template
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTemplateModal}
            className="
              w-full sm:w-auto px-5 py-2.5
              bg-emerald-500 hover:bg-emerald-600
              text-white rounded-xl font-medium
              flex items-center justify-center gap-2
              transition-all shadow-md hover:shadow-emerald-500/30
              hover:scale-105 active:scale-95
            "
          >
            <FileText className="w-4 h-4" />
            Browse Templates
          </button>
        </div>
      </div>
    );
  }

  // Voice recording active
  if (isRecording) {
    return (
      <div className="
        flex-shrink-0
        bg-[#0a0e1c]/80 backdrop-blur-xl
        border-t border-white/[0.06]
        p-3 sm:p-4
      ">
        <VoiceRecorder
          isRecording={isRecording}
          onStart={() => {}}
          onStop={() => {}}
          onCancel={() => setIsRecording(false)}
          onSend={handleVoiceSend}
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex-shrink-0 relative
        bg-[#0a0e1c]/80 backdrop-blur-xl
        border-t border-white/[0.06]
        ${isDragging ? 'drag-active' : ''}
      `}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-emerald-400">
            <Paperclip className="w-8 h-8" />
            <p className="text-sm font-medium">Drop file to send</p>
          </div>
        </div>
      )}

      {/* Reply preview */}
      {replyTo && onCancelReply && (
        <ReplyPreview
          replyTo={replyTo}
          contactName={contactName}
          onCancel={onCancelReply}
        />
      )}

      {/* Quick replies dropdown */}
      {showQuickReplies && filteredQuickReplies.length > 0 && (
        <div className="
          absolute bottom-full left-3 right-3 mb-2 z-30
          max-h-64 overflow-y-auto inbox-scroll
          bg-[#0f1729]/98 backdrop-blur-xl
          border border-white/[0.1]
          rounded-2xl shadow-2xl
          py-2 animate-fade-in
        ">
          <div className="px-3 pb-2 flex items-center gap-1.5 border-b border-white/[0.06]">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Quick Replies
            </p>
          </div>
          {filteredQuickReplies.map((qr) => (
            <button
              key={qr.id}
              onClick={() => handleQuickReplySelect(qr)}
              className="
                w-full px-3 py-2 text-left
                hover:bg-[#0a0e27]/[0.04]
                transition-colors group
              "
            >
              <div className="flex items-start gap-2">
                <span className="
                  flex-shrink-0 text-[10px] font-mono font-bold
                  text-emerald-400 bg-emerald-500/10
                  px-1.5 py-0.5 rounded
                ">
                  /{qr.shortcut}
                </span>
                <p className="text-xs text-gray-300 line-clamp-2 group-hover:text-white">
                  {qr.text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Formatting toolbar */}
      {showFormatting && (
        <div className="
          flex items-center gap-1
          px-3 sm:px-4 pt-2 pb-1
          border-b border-white/[0.04]
          animate-fade-in
        ">
          <button
            onClick={() => wrapSelection('*', '*')}
            className="p-1.5 rounded-md hover:bg-[#0a0e27]/[0.06] text-gray-400 hover:text-white transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => wrapSelection('_', '_')}
            className="p-1.5 rounded-md hover:bg-[#0a0e27]/[0.06] text-gray-400 hover:text-white transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => wrapSelection('```', '```')}
            className="p-1.5 rounded-md hover:bg-[#0a0e27]/[0.06] text-gray-400 hover:text-white transition-colors"
            title="Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => wrapSelection('~', '~')}
            className="p-1.5 rounded-md hover:bg-[#0a0e27]/[0.06] text-gray-400 hover:text-white transition-colors text-sm font-medium"
            title="Strikethrough"
          >
            <span className="line-through">S</span>
          </button>
          <div className="ml-auto">
            <button
              onClick={() => setShowFormatting(false)}
              className="p-1.5 rounded-md hover:bg-[#0a0e27]/[0.06] text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main input area */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={fileAccept.current}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowAttachments(!showAttachments);
                setShowEmoji(false);
              }}
              disabled={uploading || disabled}
              className={`
                p-2.5 rounded-xl
                transition-all hover:scale-105 active:scale-95
                ${showAttachments
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'hover:bg-[#0a0e27]/[0.06] text-gray-400 hover:text-white border border-transparent'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              title="Attach files"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </button>

            <AttachmentMenu
              isOpen={showAttachments}
              onClose={() => setShowAttachments(false)}
              onSelect={handleAttachmentSelect}
              position="top"
            />
          </div>

          {/* Formatting toggle */}
          <button
            type="button"
            onClick={() => setShowFormatting(!showFormatting)}
            className={`
              hidden sm:block p-2.5 rounded-xl
              transition-all hover:scale-105 active:scale-95
              ${showFormatting
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'hover:bg-[#0a0e27]/[0.06] text-gray-400 hover:text-white border border-transparent'
              }
            `}
            title="Formatting"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || sending || uploading}
              rows={1}
              className="
                w-full px-4 py-3
                bg-[#0a0e27]/[0.04] border border-white/[0.08]
                rounded-2xl
                text-white placeholder:text-gray-500
                text-sm leading-relaxed
                focus:outline-none focus:bg-[#0a0e27]/[0.06] focus:border-emerald-400/40
                resize-none transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                inbox-scroll
              "
              style={{ minHeight: '46px', maxHeight: '150px' }}
            />

            {/* Character count */}
            {message.length > 1000 && (
              <span className={`
                absolute bottom-1.5 right-3
                text-[10px] font-mono
                ${message.length > 4000 ? 'text-red-400' : 'text-gray-500'}
              `}>
                {message.length}/4096
              </span>
            )}
          </div>

          {/* Emoji button */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowEmoji(!showEmoji);
                setShowAttachments(false);
              }}
              className={`
                p-2.5 rounded-xl
                transition-all hover:scale-105 active:scale-95
                ${showEmoji
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'hover:bg-[#0a0e27]/[0.06] text-gray-400 hover:text-white border border-transparent'
                }
              `}
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            <EmojiPickerPanel
              isOpen={showEmoji}
              onClose={() => setShowEmoji(false)}
              onEmojiSelect={handleEmojiSelect}
            />
          </div>

          {/* Send or Voice button */}
          {message.trim() ? (
            <button
              type="submit"
              disabled={sending || disabled || uploading || message.length > 4096}
              className="
                flex-shrink-0 p-2.5 rounded-xl
                bg-gradient-to-br from-emerald-500 to-emerald-600
                hover:from-emerald-600 hover:to-emerald-700
                text-white
                transition-all shadow-md hover:shadow-emerald-500/40
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:scale-105 active:scale-95
              "
              title="Send (Enter)"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          ) : (
            onSendVoice && (
              <button
                type="button"
                onClick={() => setIsRecording(true)}
                disabled={disabled || uploading}
                className="
                  flex-shrink-0 p-2.5 rounded-xl
                  bg-gradient-to-br from-emerald-500 to-emerald-600
                  hover:from-emerald-600 hover:to-emerald-700
                  text-white
                  transition-all shadow-md hover:shadow-emerald-500/40
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:scale-105 active:scale-95
                "
                title="Record voice message"
              >
                <Mic className="w-5 h-5" />
              </button>
            )
          )}
        </div>

        {/* Helper text */}
        <div className="hidden sm:flex items-center justify-between mt-1.5 px-1">
          <p className="text-[10px] text-gray-500 font-mono">
            <kbd className="px-1 py-0.5 bg-[#0a0e27]/[0.04] rounded text-[9px]">Enter</kbd>
            <span className="mx-1">to send,</span>
            <kbd className="px-1 py-0.5 bg-[#0a0e27]/[0.04] rounded text-[9px]">Shift + Enter</kbd>
            <span className="mx-1">for new line</span>
            {quickReplies.length > 0 && (
              <>
                <span className="mx-2">•</span>
                <kbd className="px-1 py-0.5 bg-[#0a0e27]/[0.04] rounded text-[9px]">/</kbd>
                <span className="mx-1">for quick replies</span>
              </>
            )}
          </p>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;