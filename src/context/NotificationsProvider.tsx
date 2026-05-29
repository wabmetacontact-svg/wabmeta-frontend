// src/context/NotificationsProvider.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  NotificationsContext,
  AppNotification,
} from './NotificationsContext';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'wabmeta_notifications';
const MAX_NOTIFICATIONS = 100; // Keep last 100

// ✅ Helper: Load from localStorage
const loadFromStorage = (userId?: string): AppNotification[] => {
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

// ✅ Helper: Save to localStorage
const saveToStorage = (notifications: AppNotification[], userId?: string) => {
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    // Keep only last MAX_NOTIFICATIONS
    const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
};

// ✅ Generate unique ID
const generateId = (): string => {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const initializedRef = useRef(false);

  // ============================================
  // ✅ Load notifications on mount + user change
  // ============================================
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      initializedRef.current = false;
      return;
    }

    if (!initializedRef.current && userId) {
      const stored = loadFromStorage(userId);
      setNotifications(stored);
      initializedRef.current = true;
      console.log(`📬 Loaded ${stored.length} notifications from storage`);
    }
  }, [isAuthenticated, userId]);

  // ============================================
  // ✅ Persist to localStorage on changes
  // ============================================
  useEffect(() => {
    if (initializedRef.current && userId) {
      saveToStorage(notifications, userId);
    }
  }, [notifications, userId]);

  // ============================================
  // ✅ Computed: Unread count
  // ============================================
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ============================================
  // ✅ Add new notification
  // ============================================
  const addNotification = useCallback(
    (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      const newNotif: AppNotification = {
        ...notif,
        id: generateId(),
        createdAt: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => {
        // ✅ Prevent duplicates - same title + description within 5 seconds
        const fiveSecondsAgo = Date.now() - 5000;
        const isDuplicate = prev.some(
          (n) =>
            n.title === newNotif.title &&
            n.description === newNotif.description &&
            new Date(n.createdAt).getTime() > fiveSecondsAgo
        );

        if (isDuplicate) {
          console.log('⏭️ Duplicate notification skipped');
          return prev;
        }

        // Add new at top, keep max 100
        const updated = [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS);
        console.log(`🔔 New notification added: ${newNotif.title}`);
        return updated;
      });
    },
    []
  );

  // ============================================
  // ✅ Mark single as read
  // ============================================
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // ============================================
  // ✅ Mark all as read
  // ============================================
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // ============================================
  // ✅ Delete single
  // ============================================
  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ============================================
  // ✅ Clear all
  // ============================================
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // ============================================
  // ✅ Refresh (reload from storage)
  // ============================================
  const refresh = useCallback(() => {
    if (userId) {
      const stored = loadFromStorage(userId);
      setNotifications(stored);
    }
  }, [userId]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refresh,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
