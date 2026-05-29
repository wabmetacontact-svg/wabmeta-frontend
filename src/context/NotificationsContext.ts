// src/context/NotificationsContext.ts
import { createContext, useContext } from 'react';

export type NotificationType = 
  | 'message' 
  | 'campaign' 
  | 'team' 
  | 'billing' 
  | 'system' 
  | 'alert'
  | 'whatsapp';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;        // ISO timestamp
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  refresh: () => void;
}

export const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},
  clearAll: () => {},
  refresh: () => {},
});

export const useNotificationsStore = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    console.warn('useNotificationsStore must be used within NotificationsProvider');
  }
  return ctx;
};
