// src/components/inbox/EmojiPickerPanel.tsx
import React, { useEffect, useRef } from 'react';
import EmojiPicker, { type EmojiClickData, Theme, EmojiStyle } from 'emoji-picker-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPickerPanel: React.FC<Props> = ({ isOpen, onClose, onEmojiSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
  };

  return (
    <div
      ref={containerRef}
      className="
        absolute bottom-full right-0 mb-2 z-40
        rounded-2xl overflow-hidden
        shadow-2xl border border-white/[0.1]
        animate-fade-in
      "
    >
      <EmojiPicker
        onEmojiClick={handleEmojiClick}
        theme={Theme.DARK}
        emojiStyle={EmojiStyle.NATIVE}
        width={340}
        height={420}
        searchPlaceholder="Search emoji..."
        previewConfig={{ showPreview: false }}
        skinTonesDisabled={false}
        lazyLoadEmojis
      />
    </div>
  );
};

export default EmojiPickerPanel;
