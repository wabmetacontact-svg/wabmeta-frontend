// src/hooks/useGlobalNotifications.ts
// Ye hook DashboardLayout mein use hoga
// Inbox page pe ho ya na ho - notifications aayengi

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useApp } from '../context/AppContext';
import {
  playNotificationSound,
  showBrowserNotification,
  requestNotificationPermission,
} from './useNotifications';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';
import React from 'react';

// ─── Custom Toast UI ──────────────────────────────────────────────────────────
function NotificationToast({
  contactName,
  messagePreview,
  onClick,
}: {
  contactName: string;
  messagePreview: string;
  onClick: () => void;
}) {
  return React.createElement(
    'div',
    {
      className: 'flex items-center gap-3 cursor-pointer min-w-0',
      onClick,
    },
    // Icon
    React.createElement(
      'div',
      {
        className:
          'w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm',
      },
      React.createElement(MessageSquare, { className: 'w-5 h-5 text-white' })
    ),
    // Text
    React.createElement(
      'div',
      { className: 'flex-1 min-w-0' },
      React.createElement(
        'p',
        { className: 'font-semibold text-gray-900 dark:text-white text-sm truncate' },
        contactName
      ),
      React.createElement(
        'p',
        { className: 'text-gray-500 dark:text-gray-400 text-xs truncate mt-0.5' },
        messagePreview
      )
    )
  );
}

// ─── Main Hook ────────────────────────────────────────────────────────────────
export function useGlobalNotifications() {
  const { socket } = useSocket();
  const { incrementUnread } = useApp();
  const navigate = useNavigate();

  // Permission request - once on mount
  const permissionRequestedRef = useRef(false);

  useEffect(() => {
    if (permissionRequestedRef.current) return;
    permissionRequestedRef.current = true;
    requestNotificationPermission();
  }, []);

  // ─── Navigate to conversation ─────────────────────────────────────────────
  const navigateToConversation = useCallback(
    (convId: string) => {
      navigate(`/dashboard/inbox/${convId}`);
      toast.dismiss(); // Dismiss all toasts
    },
    [navigate]
  );

  // ─── Show in-app toast ─────────────────────────────────────────────────────
  const showToast = useCallback(
    (contactName: string, messagePreview: string, convId: string) => {
      toast.custom(
        (t) =>
          React.createElement(
            'div',
            {
              className: `${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl 
              pointer-events-auto flex items-center gap-3 p-4 
              border border-gray-100 dark:border-gray-700`,
            },
            React.createElement(NotificationToast, {
              contactName,
              messagePreview,
              onClick: () => {
                navigateToConversation(convId);
                toast.dismiss(t.id);
              },
            })
          ),
        {
          duration: 5000,
          position: 'top-right',
          id: `msg-${convId}`, // ✅ Same conv se duplicate toast nahi aayega
        }
      );
    },
    [navigateToConversation]
  );

  // ─── Socket listener ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      const msg = data?.message || data;
      const convId = msg?.conversationId || data?.conversationId;
      const direction = msg?.direction;

      // Sirf INBOUND messages
      if (direction !== 'INBOUND' || !convId) return;

      // ✅ Agar user already us conversation mein hai toh notification mat dikhao
      const currentPath = window.location.pathname;
      const isViewingThisConv = currentPath.includes(`/inbox/${convId}`);
      if (isViewingThisConv) return;

      // ─── Contact name extract karo ────────────────────────────────────────
      const contact = data?.conversation?.contact || {};
      const contactName =
        contact.whatsappProfileName ||
        contact.name ||
        (contact.firstName
          ? `${contact.firstName} ${contact.lastName || ''}`.trim()
          : null) ||
        msg.from ||
        'New Message';

      // ─── Message preview ─────────────────────────────────────────────────
      const messagePreview =
        (msg.content || 'New message').substring(0, 80);

      // ─── 1. Sound ─────────────────────────────────────────────────────────
      playNotificationSound();

      // ─── 2. In-app Toast ─────────────────────────────────────────────────
      showToast(contactName, messagePreview, convId);

      // ─── 3. Browser Notification (tab hidden ho toh) ──────────────────────
      showBrowserNotification({
        title: `💬 ${contactName}`,
        body: messagePreview,
        tag: `conv-${convId}`,
        onClick: () => {
          window.focus();
          navigateToConversation(convId);
        },
      });
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [socket, showToast, navigateToConversation]);
}

export default useGlobalNotifications;
