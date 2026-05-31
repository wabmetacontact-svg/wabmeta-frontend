// src/components/inbox/MessageSearchBar.tsx
import React, { useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  isOpen: boolean;
  query: string;
  resultsCount: number;
  currentIndex: number;
  onQueryChange: (q: string) => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const MessageSearchBar: React.FC<Props> = ({
  isOpen,
  query,
  resultsCount,
  currentIndex,
  onQueryChange,
  onClose,
  onNext,
  onPrev,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="
      flex-shrink-0 animate-slide-right
      bg-[#0f1729]/90 backdrop-blur-xl
      border-b border-white/[0.06]
      px-3 py-2.5
    ">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.shiftKey ? onPrev() : onNext();
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="Search in conversation..."
            className="
              w-full pl-9 pr-3 py-2
              bg-[#0a0e27]/[0.05] border border-white/[0.08]
              rounded-lg text-sm text-white
              placeholder:text-gray-500
              focus:outline-none focus:border-emerald-400/40
              transition-all
            "
          />
        </div>

        {query && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 font-mono px-2">
              {resultsCount > 0 ? `${currentIndex + 1}/${resultsCount}` : '0/0'}
            </span>
            <button
              onClick={onPrev}
              disabled={resultsCount === 0}
              className="
                p-1.5 rounded-md
                hover:bg-[#0a0e27]/[0.08]
                text-gray-300 hover:text-white
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-colors
              "
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              disabled={resultsCount === 0}
              className="
                p-1.5 rounded-md
                hover:bg-[#0a0e27]/[0.08]
                text-gray-300 hover:text-white
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-colors
              "
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="
            p-1.5 rounded-md
            hover:bg-[#0a0e27]/[0.08]
            text-gray-300 hover:text-white
            transition-colors
          "
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageSearchBar;
