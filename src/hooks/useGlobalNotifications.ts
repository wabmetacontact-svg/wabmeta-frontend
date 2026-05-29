// src/hooks/useGlobalNotifications.ts
import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useNotificationsStore } from '../context/NotificationsContext';
import {
  playNotificationSound,
  showBrowserNotification,
  requestNotificationPermission,
} from './useNotifications';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';
import React from 'react';
import api from '../services/api';

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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
    React.createElement(
      'div',
      {
        className:
          'w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm',
      },
      React.createElement(MessageSquare, { className: 'w-5 h-5 text-white' })
    ),
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
  const { addNotification } = useNotificationsStore();
  const navigate = useNavigate();
  const permissionRequestedRef = useRef(false);

  // ✅ Permission request once
  useEffect(() => {
    if (permissionRequestedRef.current) return;
    permissionRequestedRef.current = true;
    
    const setupPush = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          if ('serviceWorker' in navigator && 'PushManager' in window) {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const readyReg = await navigator.serviceWorker.ready;
            
            // Check existing subscription
            let subscription = await readyReg.pushManager.getSubscription();
            
            if (!subscription) {
              const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
              if (publicVapidKey) {
                subscription = await readyReg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                });
              }
            }
            
            if (subscription) {
              await api.post('/users/subscribe', subscription);
              console.log('✅ Web Push Subscription successful');
            }
          }
        }
      } catch (err) {
        console.error('Service Worker or Push Subscription error:', err);
      }
    };
    
    setupPush();
  }, []);

  const navigateToConversation = useCallback(
    (convId: string) => {
      navigate(`/dashboard/inbox/${convId}`);
      toast.dismiss();
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
          id: `msg-${convId}`,
        }
      );
    },
    [navigateToConversation]
  );

  // ─── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // ====================
    // NEW MESSAGE
    // ====================
    const handleNewMessage = (data: any) => {
      const msg = data?.message || data;
      const convId = msg?.conversationId || data?.conversationId;
      const direction = msg?.direction;

      if (direction !== 'INBOUND' || !convId) return;

      // Check current location
      const currentPath = window.location.pathname;
      const isViewingThisConv = currentPath.includes(`/inbox/${convId}`);

      // Extract contact name
      const contact = data?.conversation?.contact || {};
      const contactName =
        contact.whatsappProfileName ||
        contact.name ||
        (contact.firstName
          ? `${contact.firstName} ${contact.lastName || ''}`.trim()
          : null) ||
        msg.from ||
        'New Message';

      const messagePreview = (msg.content || 'New message').substring(0, 100);

      // ✅ Always add to notifications store
      addNotification({
        type: 'message',
        title: `New message from ${contactName}`,
        description: messagePreview,
        actionUrl: `/dashboard/inbox/${convId}`,
        metadata: { conversationId: convId, contactName },
      });

      // ✅ Only show toast/sound if NOT viewing this conv
      if (!isViewingThisConv) {
        playNotificationSound();
        showToast(contactName, messagePreview, convId);
        showBrowserNotification({
          title: `💬 ${contactName}`,
          body: messagePreview,
          tag: `conv-${convId}`,
          onClick: () => {
            window.focus();
            navigateToConversation(convId);
          },
        });
      }
    };

    // ====================
    // CAMPAIGN COMPLETED
    // ====================
    const handleCampaignCompleted = (data: any) => {
      const campaignName = data?.name || data?.campaignName || 'Campaign';
      const stats = data?.stats || {};
      const deliveryRate = stats.deliveryRate || 
        (stats.total > 0 ? Math.round(((stats.delivered || 0) / stats.total) * 100) : 0);

      addNotification({
        type: 'campaign',
        title: 'Campaign completed successfully',
        description: `"${campaignName}" has been completed. ${deliveryRate}% delivery rate.`,
        actionUrl: data?.campaignId ? `/dashboard/campaigns/${data.campaignId}` : '/dashboard/campaigns',
        metadata: data,
      });

      playNotificationSound();
    };

    // ====================
    // CAMPAIGN FAILED
    // ====================
    const handleCampaignFailed = (data: any) => {
      const campaignName = data?.name || 'Campaign';
      addNotification({
        type: 'alert',
        title: 'Campaign failed',
        description: `"${campaignName}" failed to send. ${data?.error || 'Please check details.'}`,
        actionUrl: data?.campaignId ? `/dashboard/campaigns/${data.campaignId}` : '/dashboard/campaigns',
      });
      playNotificationSound();
    };

    // ====================
    // WHATSAPP ACCOUNT
    // ====================
    const handleAccountUpdated = (data: any) => {
      const status = data?.status;
      if (status === 'CONNECTED') {
        addNotification({
          type: 'whatsapp',
          title: 'WhatsApp account connected',
          description: 'Your WhatsApp Business account has been successfully connected.',
          actionUrl: '/dashboard/settings',
        });
      } else if (status === 'DISCONNECTED' || status === 'ERROR') {
        addNotification({
          type: 'alert',
          title: 'WhatsApp account issue',
          description: 'Your WhatsApp account needs attention. Please reconnect.',
          actionUrl: '/dashboard/settings',
        });
      }
    };

    // ====================
    // INCOMING CALL
    // ====================
    const handleIncomingCall = (data: any) => {
      addNotification({
        type: 'message',
        title: 'Incoming WhatsApp call',
        description: `Call from ${data?.contactName || data?.from || 'Unknown'}`,
        actionUrl: '/dashboard/inbox',
        metadata: data,
      });
      playNotificationSound();
    };

    // ✅ Attach all listeners
    socket.on('message:new', handleNewMessage);
    socket.on('campaign:completed', handleCampaignCompleted);
    socket.on('campaign:failed', handleCampaignFailed);
    socket.on('account:updated', handleAccountUpdated);
    socket.on('incomingCall', handleIncomingCall);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('campaign:completed', handleCampaignCompleted);
      socket.off('campaign:failed', handleCampaignFailed);
      socket.off('account:updated', handleAccountUpdated);
      socket.off('incomingCall', handleIncomingCall);
    };
  }, [socket, addNotification, showToast, navigateToConversation]);
}

export default useGlobalNotifications;
