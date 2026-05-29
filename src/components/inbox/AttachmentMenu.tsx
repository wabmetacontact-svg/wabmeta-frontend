// src/components/inbox/AttachmentMenu.tsx
import React, { useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Video,
  FileText,
  MapPin,
  User,
  Camera,
  Music,
} from 'lucide-react';

interface AttachmentOption {
  type: 'image' | 'video' | 'document' | 'audio' | 'camera' | 'location' | 'contact';
  label: string;
  icon: React.ReactNode;
  color: string;
  accept?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: AttachmentOption['type'], accept?: string) => void;
  position?: 'top' | 'bottom';
}

const OPTIONS: AttachmentOption[] = [
  {
    type: 'image',
    label: 'Photo',
    icon: <ImageIcon className="w-5 h-5" />,
    color: 'from-violet-500 to-purple-600',
    accept: 'image/*',
  },
  {
    type: 'video',
    label: 'Video',
    icon: <Video className="w-5 h-5" />,
    color: 'from-red-500 to-pink-600',
    accept: 'video/*',
  },
  {
    type: 'document',
    label: 'Document',
    icon: <FileText className="w-5 h-5" />,
    color: 'from-blue-500 to-indigo-600',
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
  },
  {
    type: 'audio',
    label: 'Audio',
    icon: <Music className="w-5 h-5" />,
    color: 'from-orange-500 to-red-600',
    accept: 'audio/*',
  },
  {
    type: 'camera',
    label: 'Camera',
    icon: <Camera className="w-5 h-5" />,
    color: 'from-emerald-500 to-teal-600',
    accept: 'image/*',
  },
];

const AttachmentMenu: React.FC<Props> = ({ isOpen, onClose, onSelect, position = 'top' }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={`
        absolute left-2 z-30
        ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
        w-[280px]
        bg-[#0f1729]/98 backdrop-blur-2xl
        border border-white/[0.1]
        rounded-2xl shadow-2xl
        p-3 animate-fade-in
      `}
    >
      <div className="px-1 mb-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Send Attachment
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.type}
            onClick={() => {
              onSelect(option.type, option.accept);
              onClose();
            }}
            className="
              flex flex-col items-center gap-2
              p-3 rounded-xl
              bg-white/[0.03] hover:bg-white/[0.06]
              border border-white/[0.05] hover:border-white/[0.1]
              transition-all hover:scale-105 active:scale-95
              group
            "
          >
            <div className={`
              w-11 h-11 rounded-xl
              bg-gradient-to-br ${option.color}
              flex items-center justify-center
              text-white shadow-md
              group-hover:shadow-lg transition-shadow
            `}>
              {option.icon}
            </div>
            <span className="text-[11px] font-medium text-gray-200">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AttachmentMenu;
