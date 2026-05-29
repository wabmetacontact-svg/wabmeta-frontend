// src/context/AppContext.ts
import { createContext, useContext } from 'react';

export interface AppContextType {
  // Unread messages
  unreadCount: number;
  incrementUnread: (conversationId?: string) => void;
  decrementUnread: (conversationId?: string) => void;
  resetUnread: () => void;

  // ✅ Contacts count (sidebar ke liye)
  totalContacts: number;
  setTotalContacts: (count: number) => void;
}

export const AppContext = createContext<AppContextType>({
  unreadCount: 0,
  incrementUnread: () => {},
  decrementUnread: () => {},
  resetUnread: () => {},

  totalContacts: 0,
  setTotalContacts: () => {},
});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    console.warn('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
