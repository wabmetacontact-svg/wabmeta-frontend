// src/components/inbox/ChatInput.tsx - ENTERPRISE FIXED
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Paperclip, Smile, Mic, FileText, Loader2,
  Clock, Sparkles, Bold, Italic, Code, X, Zap,
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
  const [sending, setSending] = useState(false); // FIX Issue#2: now used
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

  // FIX Bug#10: Single typing timer in ChatInput only
  // Inbox.tsx handleTyping has its own 10s API cooldown
  // ChatInput just calls onTyping(true) on input change
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FIX Issue#3: Outside click refs for emoji/attachment
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPanelRef = useRef<HTMLDivElement>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // ── Window status check ─────────────────────────────────────────────────
  // FIX Bug#9: Handle null windowExpiresAt correctly
  const windowOpen = (() => {
    if (!isWindowOpen) return false;
    if (!windowExpiresAt) return true; // isWindowOpen=true but no expiry = open
    return new Date(windowExpiresAt) > new Date();
  })();

  // ── Auto-resize textarea ────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [message]);

  // FIX Bug#10: Unified typing handler - just call onTyping(true) on change
  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);

      if (!onTyping) return;
      // Debounce: only fire if user is actively typing
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      onTyping(true); // Inbox.tsx handles the 10s API cooldown
      typingDebounceRef.current = setTimeout(() => {
        // No need to call onTyping(false) - API cooldown handles this
      }, 1000);
    },
    [onTyping]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    };
  }, []);

  // Focus on reply
  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

  // Quick reply trigger (type "/" at start)
  useEffect(() => {
    if (message.startsWith('/') && quickReplies.length > 0) {
      setShowQuickReplies(true);
    } else {
      setShowQuickReplies(false);
    }
  }, [message, quickReplies.length]);

  // FIX Issue#3: Outside click to close emoji/attachment
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;

      // Close emoji if click outside both button and panel
      if (showEmoji) {
        if (
          !emojiButtonRef.current?.contains(target) &&
          !emojiPanelRef.current?.contains(target)
        ) {
          setShowEmoji(false);
        }
      }

      // Close attachment if click outside
      if (showAttachments) {
        if (
          !attachmentButtonRef.current?.contains(target) &&
          !attachmentMenuRef.current?.contains(target)
        ) {
          setShowAttachments(false);
        }
      }
    };

    if (showEmoji || showAttachments) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji, showAttachments]);

  // ── Submit handler ──────────────────────────────────────────────────────
  // FIX Issue#2: setSending(true/false) properly
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const textToSend = message.trim();
      if (!textToSend || disabled || sending) return;

      if (!windowOpen) {
        onOpenTemplateModal();
        return;
      }

      const replyId = replyTo?.id;

      // Reset UI immediately
      setMessage('');
      onCancelReply?.();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }

      // Send with loading state
      setSending(true);
      try {
        await onSendMessage(textToSend, { replyToId: replyId });
      } catch (error: any) {
        toast.error(error.message || 'Failed to send message');
      } finally {
        setSending(false);
      }
    },
    [message, disabled, sending, windowOpen, onOpenTemplateModal, onSendMessage, replyTo, onCancelReply]
  );

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }
    if (e.key === 'Escape') {
      if (showEmoji) { setShowEmoji(false); return; }
      if (showAttachments) { setShowAttachments(false); return; }
      if (replyTo) { onCancelReply?.(); return; }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      wrapSelection('*', '*');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      wrapSelection('_', '_');
    }
  };

  // ── Wrap selected text ──────────────────────────────────────────────────
  const wrapSelection = (before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = message.substring(start, end);
    const newMessage =
      message.substring(0, start) + before + selected + after + message.substring(end);
    setMessage(newMessage);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // ── Emoji insert ────────────────────────────────────────────────────────
  const handleEmojiSelect = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setMessage((prev) => prev + emoji);
      setShowEmoji(false);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newMessage = message.substring(0, start) + emoji + message.substring(end);
    setMessage(newMessage);
    setShowEmoji(false);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  // ── File handling ───────────────────────────────────────────────────────
  const handleAttachmentSelect = (
    type: 'image' | 'video' | 'document' | 'audio' | 'camera' | 'location' | 'contact',
    accept?: string
  ) => {
    setShowAttachments(false);

    if (!windowOpen) {
      toast.error('Session expired. Send a template first.');
      return;
    }

    if (type === 'location' || type === 'contact') {
      toast('Coming soon!', { icon: '🚧' });
      return;
    }

    if (accept) fileAccept.current = accept;

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

  // ── Drag and drop ───────────────────────────────────────────────────────
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

  // ── Voice ───────────────────────────────────────────────────────────────
  const handleVoiceSend = async (blob: Blob, duration: number) => {
    if (!onSendVoice) {
      toast.error('Voice messages not configured');
      return;
    }
    await onSendVoice(blob, duration);
    setIsRecording(false);
  };

  // ── Quick reply ─────────────────────────────────────────────────────────
  const handleQuickReplySelect = (qr: QuickReply) => {
    setMessage(qr.text);
    setShowQuickReplies(false);
    textareaRef.current?.focus();
  };

  const filteredQuickReplies = quickReplies.filter((qr) => {
    if (!message.startsWith('/')) return false;
    const query = message.substring(1).toLowerCase();
    return (
      qr.shortcut.toLowerCase().includes(query) ||
      qr.text.toLowerCase().includes(query)
    );
  });

  // ── Window closed state ─────────────────────────────────────────────────
  if (!windowOpen) {
    return (
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-3 sm:p-4">
        <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">24-Hour Session Closed</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Start a new session using an approved template
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTemplateModal}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-emerald-500/20 hover:scale-105 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            Browse Templates
          </button>
        </div>
      </div>
    );
  }

  // ── Voice recording ─────────────────────────────────────────────────────
  if (isRecording) {
    return (
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-3 sm:p-4">
        <VoiceRecorder
          isRecording={isRecording}
          onStart={() => { }}
          onStop={() => { }}
          onCancel={() => setIsRecording(false)}
          onSend={handleVoiceSend}
        />
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-shrink-0 relative bg-white border-t border-gray-200 ${isDragging ? 'drag-active' : ''}`}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-emerald-500/5 backdrop-blur-sm pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-emerald-600">
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
        <div className="absolute bottom-full left-3 right-3 mb-2 z-30 max-h-64 overflow-y-auto inbox-scroll bg-white border border-gray-200 rounded-2xl shadow-2xl py-2 animate-fade-in">
          <div className="px-3 pb-2 flex items-center gap-1.5 border-b border-gray-100">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Quick Replies
            </p>
          </div>
          {filteredQuickReplies.map((qr) => (
            <button
              key={qr.id}
              onClick={() => handleQuickReplySelect(qr)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  /{qr.shortcut}
                </span>
                <p className="text-xs text-gray-700 line-clamp-2 group-hover:text-gray-900">
                  {qr.text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Formatting toolbar */}
      {showFormatting && (
        <div className="flex items-center gap-1 px-3 sm:px-4 pt-2 pb-1 border-b border-gray-100 animate-fade-in">
          {[
            { label: 'Bold', action: () => wrapSelection('*', '*'), icon: Bold, title: 'Bold (Ctrl+B)' },
            { label: 'Italic', action: () => wrapSelection('_', '_'), icon: Italic, title: 'Italic (Ctrl+I)' },
            { label: 'Code', action: () => wrapSelection('```', '```'), icon: Code, title: 'Code' },
          ].map(({ action, icon: Icon, title }) => (
            <button
              key={title}
              onClick={action}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
              title={title}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <button
            onClick={() => wrapSelection('~', '~')}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
            title="Strikethrough"
          >
            <span className="line-through">S</span>
          </button>
          <div className="ml-auto">
            <button
              onClick={() => setShowFormatting(false)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main input */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-white">
        <input
          ref={fileInputRef}
          type="file"
          accept={fileAccept.current}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex items-end gap-2 bg-white">
          {/* Attachment */}
          <div className="relative flex-shrink-0">
            <button
              ref={attachmentButtonRef}
              type="button"
              onClick={() => {
                setShowAttachments(!showAttachments);
                setShowEmoji(false);
              }}
              disabled={uploading || disabled}
              className={`p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${showAttachments
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800 border border-transparent'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Attach files"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </button>
            {/* FIX Issue#3: Pass ref to AttachmentMenu wrapper */}
            <div ref={attachmentMenuRef}>
              <AttachmentMenu
                isOpen={showAttachments}
                onClose={() => setShowAttachments(false)}
                onSelect={handleAttachmentSelect}
                position="top"
              />
            </div>
          </div>

          {/* Formatting toggle */}
          <button
            type="button"
            onClick={() => setShowFormatting(!showFormatting)}
            className={`hidden sm:block p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${showFormatting
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800 border border-transparent'
              }`}
            title="Formatting"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <div className="flex-1 relative bg-white">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange} // FIX Bug#10
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || uploading}
              rows={1}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 text-sm leading-relaxed focus:outline-none focus:bg-white focus:border-emerald-500/50 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed inbox-scroll"
              style={{ minHeight: '46px', maxHeight: '150px' }}
            />
            {message.length > 1000 && (
              <span
                className={`absolute bottom-1.5 right-3 text-[10px] font-mono ${message.length > 4000 ? 'text-red-600' : 'text-gray-500'
                  }`}
              >
                {message.length}/4096
              </span>
            )}
          </div>

          {/* Emoji */}
          <div className="relative flex-shrink-0 bg-white">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => {
                setShowEmoji(!showEmoji);
                setShowAttachments(false);
              }}
              className={`p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${showEmoji
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800 border border-transparent'
                }`}
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            {/* FIX Issue#3: Wrap emoji panel with ref */}
            <div ref={emojiPanelRef}>
              <EmojiPickerPanel
                isOpen={showEmoji}
                onClose={() => setShowEmoji(false)}
                onEmojiSelect={handleEmojiSelect}
              />
            </div>
          </div>

          {/* Send or Mic - FIX Issue#2: Show loading spinner when sending */}
          {message.trim() ? (
            <button
              type="submit"
              disabled={sending || disabled || uploading || message.length > 4096}
              className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white transition-all shadow-md hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
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
                className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white transition-all shadow-md hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                title="Record voice message"
              >
                <Mic className="w-5 h-5" />
              </button>
            )
          )}
        </div>

        {/* Helper text */}
        <div className="hidden sm:flex items-center justify-between mt-1.5 px-1 bg-white">
          <p className="text-[10px] text-gray-500 font-mono">
            <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200/50 rounded text-[9px]">
              Enter
            </kbd>
            <span className="mx-1">to send,</span>
            <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200/50 rounded text-[9px]">
              Shift + Enter
            </kbd>
            <span className="mx-1">for new line</span>
            {quickReplies.length > 0 && (
              <>
                <span className="mx-2">•</span>
                <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200/50 rounded text-[9px]">
                  /
                </kbd>
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