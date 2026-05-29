// src/hooks/useInboxNotifications.ts

import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import React from 'react';

interface InboxToastProps {
  contactName:    string;
  messagePreview: string;
  conversationId: string;
  onNavigate:     (id: string) => void;
}

// ─── Custom Toast Component ───────────────────────────────────────────────────
function InboxToast({ contactName, messagePreview, conversationId, onNavigate }: InboxToastProps) {
  return React.createElement(
    'div',
    {
      className: 'flex items-center gap-3 cursor-pointer',
      onClick:   () => onNavigate(conversationId),
    },
    React.createElement(
      'div',
      {
        className:
          'w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0',
      },
      React.createElement(MessageSquare, { className: 'w-5 h-5 text-white' })
    ),
    React.createElement(
      'div',
      { className: 'flex-1 min-w-0' },
      React.createElement(
        'p',
        { className: 'font-semibold text-gray-900 text-sm truncate' },
        contactName
      ),
      React.createElement(
        'p',
        { className: 'text-gray-500 text-xs truncate' },
        messagePreview
      )
    )
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useInboxNotifications() {
  const navigate = useNavigate();

  const showNewMessageToast = useCallback(
    (opts: {
      contactName:    string;
      messagePreview: string;
      conversationId: string;
    }) => {
      const handleNavigate = (convId: string) => {
        navigate(`/dashboard/inbox/${convId}`);
        toast.dismiss();
      };

      toast.custom(
        (t) =>
          React.createElement(
            'div',
            {
              className: `${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-white shadow-lg rounded-xl pointer-events-auto flex items-center gap-3 p-4 border border-gray-100`,
            },
            React.createElement(InboxToast, {
              ...opts,
              onNavigate: handleNavigate,
            })
          ),
        {
          duration: 5000,
          position: 'top-right',
        }
      );
    },
    [navigate]
  );

  return { showNewMessageToast };
}
