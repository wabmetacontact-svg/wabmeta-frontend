// src/context/NotificationsProvider.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NotificationsContext, AppNotification } from './NotificationsContext';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'wabmeta_notifications';
const MAX_NOTIFICATIONS = 100;

const loadFromStorage = (userId?: string): AppNotification[] => {
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveToStorage = (notifications: AppNotification[], userId?: string) => {
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
};

const generateId = (): string => {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const initializedRef = useRef(false);

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
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (initializedRef.current && userId) {
      saveToStorage(notifications, userId);
    }
  }, [notifications, userId]);

  // ✅ Computed values properly memoized to bypass deep tree evaluation on every scroll/keypress
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const addNotification = useCallback(
    (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      const newNotif: AppNotification = {
        ...notif,
        id: generateId(),
        createdAt: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => {
        const fiveSecondsAgo = Date.now() - 5000;
        const isDuplicate = prev.some(
          (n) =>
            n.title === newNotif.title &&
            n.description === newNotif.description &&
            new Date(n.createdAt).getTime() > fiveSecondsAgo
        );

        if (isDuplicate) return prev;
        return [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS);
      });
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const refresh = useCallback(() => {
    if (userId) {
      setNotifications(loadFromStorage(userId));
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