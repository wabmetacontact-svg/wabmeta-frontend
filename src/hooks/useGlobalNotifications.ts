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
import { MessageSquare, X, VolumeX } from 'lucide-react';
import React, { useState } from 'react';
import api from '../services/api';
import { getAvatarColor } from '../utils/inboxHelpers';

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
  onClose,
  onMute,
}: {
  contactName: string;
  messagePreview: string;
  onClick: () => void;
  onClose: (e: React.MouseEvent) => void;
  onMute: (hours: number) => void;
}) {
  const [showMuteOptions, setShowMuteOptions] = useState(false);
  const initial = contactName.charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(contactName);

  return React.createElement(
    'div',
    { className: 'flex items-center gap-4 w-full min-w-0 group relative py-1' },
    React.createElement(
      'div',
      {
        className: 'flex-1 flex items-center gap-3.5 cursor-pointer min-w-0',
        onClick,
      },
      React.createElement(
        'div',
        {
          className: `w-11 h-11 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg text-white font-bold text-lg border border-white/20`,
        },
        initial
      ),
      React.createElement(
        'div',
        { className: 'flex-1 min-w-0 pr-2' },
        React.createElement(
          'p',
          { className: 'font-bold text-gray-900 dark:text-white text-[15px] truncate tracking-tight' },
          contactName
        ),
        React.createElement(
          'p',
          { className: 'text-gray-500 dark:text-gray-400 text-[13px] truncate mt-0.5 font-medium' },
          messagePreview
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'flex flex-col justify-center gap-2 flex-shrink-0 border-l border-gray-100 dark:border-white/10 pl-3 h-full' },
      React.createElement(
        'button',
        {
          onClick: onClose,
          className: 'p-1.5 text-gray-400 hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all active:scale-95',
          title: 'Close',
        },
        React.createElement(X, { className: 'w-4 h-4' })
      ),
      React.createElement(
        'div',
        { className: 'relative' },
        React.createElement(
          'button',
          {
            onClick: (e) => {
              e.stopPropagation();
              setShowMuteOptions(!showMuteOptions);
            },
            className: 'p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all active:scale-95',
            title: 'Mute popups options',
          },
          React.createElement(VolumeX, { className: 'w-4 h-4' })
        ),
        showMuteOptions &&
          React.createElement(
            'div',
            {
              className: 'absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-100 dark:border-gray-700 py-1 z-50 text-sm overflow-hidden',
            },
            [
              { label: 'For 1 Hour', value: 1 },
              { label: 'For 8 Hours', value: 8 },
              { label: 'For 24 Hours', value: 24 },
              { label: 'Until I unmute', value: -1 },
            ].map((opt) =>
              React.createElement(
                'button',
                {
                  key: opt.value,
                  onClick: (e) => {
                    e.stopPropagation();
                    onMute(opt.value);
                    setShowMuteOptions(false);
                  },
                  className: 'w-full text-left px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors',
                },
                opt.label
              )
            )
          )
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
              } max-w-[360px] w-full bg-white dark:bg-[#0a0e27]/95 dark:backdrop-blur-xl shadow-2xl rounded-2xl 
              pointer-events-auto flex items-center gap-3 p-3.5
              border border-gray-100 dark:border-white/[0.08] ring-1 ring-black/5 dark:ring-white/5 transition-all overflow-visible`,
            },
            React.createElement(NotificationToast, {
              contactName,
              messagePreview,
              onClick: () => {
                navigateToConversation(convId);
                toast.dismiss(t.id);
              },
              onClose: (e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
              },
              onMute: (hours) => {
                if (hours === -1) {
                  localStorage.setItem('wabmeta_muted_until', '-1');
                  toast.success('Popups muted until you unmute them');
                } else {
                  const later = Date.now() + hours * 60 * 60 * 1000;
                  localStorage.setItem('wabmeta_muted_until', later.toString());
                  toast.success(`Popups muted for ${hours} hour${hours > 1 ? 's' : ''}`);
                }
                toast.dismiss(t.id);
              }
            })
          ),
        {
          duration: 5000,
          position: 'top-right',
          id: 'global-new-message', // Use a fixed ID so it replaces the previous toast instead of piling up
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

      // ✅ Check mute status
      const mutedUntilStr = localStorage.getItem('wabmeta_muted_until');
      let isMuted = false;
      if (mutedUntilStr) {
        if (mutedUntilStr === '-1') {
          isMuted = true;
        } else {
          const mutedUntil = parseInt(mutedUntilStr, 10);
          if (Date.now() < mutedUntil) {
            isMuted = true;
          } else {
            localStorage.removeItem('wabmeta_muted_until');
          }
        }
      }

      // ✅ Only show toast/sound if NOT viewing this conv AND NOT muted
      if (!isViewingThisConv && !isMuted) {
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
