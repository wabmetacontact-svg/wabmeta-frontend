// src/components/common/Toast.tsx
import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const themes = {
    success: {
      bg: 'bg-emerald-50 border-emerald-100',
      text: 'text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: 'bg-red-50 border-red-100',
      text: 'text-red-800',
      icon: <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-100',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
  };

  const currentTheme = themes[type];

  return (
    <div className={`
      flex items-start justify-between gap-3 p-4 rounded-xl border shadow-md max-w-sm w-full bg-white
      animate-in slide-in-from-bottom-4 duration-200 ${currentTheme.bg}
    `}>
      <div className="flex gap-2.5">
        {currentTheme.icon}
        <p className={`text-sm font-semibold ${currentTheme.text} leading-snug`}>
          {message}
        </p>
      </div>
      {onClose && (
        <button
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;