// src/components/inbox/TypingIndicator.tsx
import React from 'react';
import { getAvatarColor } from '../../utils/inboxHelpers';

interface Props {
  contactName?: string;
  showAvatar?: boolean;
}

const TypingIndicator: React.FC<Props> = ({ contactName = 'User', showAvatar = true }) => {
  const initial = contactName.charAt(0).toUpperCase();
  const color = getAvatarColor(contactName);

  return (
    <div className="flex items-end gap-1.5 px-2 sm:px-4 mt-2 animate-fade-in">
      {showAvatar && (
        <div className={`
          w-7 h-7 rounded-full
          bg-gradient-to-br ${color}
          flex items-center justify-center
          text-white text-xs font-semibold
          flex-shrink-0
          ring-2 ring-[#0a0e1c]
        `}>
          {initial}
        </div>
      )}
      <div className="
        bg-[#1f2937]/90 backdrop-blur-sm
        border border-white/[0.06]
        rounded-2xl rounded-bl-md
        px-4 py-3 shadow-md bubble-shadow
      ">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full typing-dot" />
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full typing-dot" />
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full typing-dot" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
