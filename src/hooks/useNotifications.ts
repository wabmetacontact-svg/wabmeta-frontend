// src/hooks/useNotifications.ts

import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface InAppNotification {
  id:        string;
  title:     string;
  body:      string;
  icon?:     string;
  tag?:      string;
  data?:     any;
  timestamp: string;
}

type NotificationCallback = (notification: InAppNotification) => void;

// ─── Browser notification permission ─────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') {
    console.warn('Notifications blocked by user');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// ─── Show browser notification ────────────────────────────────────────────────
export function showBrowserNotification(options: {
  title:    string;
  body:     string;
  icon?:    string;
  tag?:     string;
  data?:    any;
  onClick?: () => void;
}) {
  if (Notification.permission !== 'granted') return;

  // Tab active hai toh browser notification mat dikhao
  if (!document.hidden) return;

  const notification = new Notification(options.title, {
    body:               options.body,
    icon:               options.icon || '/logo-192.png',
    badge:              '/logo-192.png',
    tag:                options.tag || 'wabmeta-inbox',
    requireInteraction: false,
    silent:             false,
  });

  notification.onclick = () => {
    window.focus();
    options.onClick?.();
    notification.close();
  };

  // Auto close after 5 sec
  setTimeout(() => notification.close(), 5000);
}

// ─── Sound notification ───────────────────────────────────────────────────────
let notificationAudio: HTMLAudioElement | null = null;

export function playNotificationSound() {
  try {
    if (!notificationAudio) {
      notificationAudio = new Audio('/notification.mp3');
      notificationAudio.volume = 0.5;
    }
    notificationAudio.currentTime = 0;
    notificationAudio.play().catch(() => {});
  } catch {}
}

// ─── Main Hook ────────────────────────────────────────────────────────────────
export function useNotifications(onNotification?: NotificationCallback) {
  const { socket } = useSocket();
  const onNotificationRef      = useRef(onNotification);
  const permissionRequestedRef = useRef(false);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  });

  // Request permission on mount (once)
  useEffect(() => {
    if (permissionRequestedRef.current) return;
    permissionRequestedRef.current = true;

    requestNotificationPermission().then(granted => {
      console.log('🔔 Notification permission:', granted ? 'granted' : 'denied');
    });
  }, []);

  // Socket event listener
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      const msg       = data?.message || data;
      const convId    = msg?.conversationId || data?.conversationId;
      const direction = msg?.direction;

      // Sirf INBOUND messages pe notification
      if (direction !== 'INBOUND') return;

      const contactName =
        data?.conversation?.contact?.name               ||
        data?.conversation?.contact?.whatsappProfileName ||
        data?.conversation?.contact?.firstName           ||
        msg?.from                                        ||
        'New Message';

      const messageBody =
        msg?.content?.substring(0, 100) ||
        'New message received';

      const notification: InAppNotification = {
        id:        msg?.id || Date.now().toString(),
        title:     contactName,
        body:      messageBody,
        tag:       `conv-${convId}`,
        data:      { conversationId: convId },
        timestamp: msg?.createdAt || new Date().toISOString(),
      };

      // Tab mein nahi hai toh browser notification
      if (document.hidden) {
        showBrowserNotification({
          title: `💬 ${contactName}`,
          body:  messageBody,
          tag:   notification.tag,
          data:  notification.data,
          onClick: () => {
            if (convId) window.location.href = `/dashboard/inbox/${convId}`;
          },
        });
      }

      // Sound
      playNotificationSound();

      // In-app callback
      onNotificationRef.current?.(notification);
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [socket]);

  const showInAppNotification = useCallback((notification: InAppNotification) => {
    onNotificationRef.current?.(notification);
  }, []);

  return { showInAppNotification, requestNotificationPermission };
}

export default useNotifications;
