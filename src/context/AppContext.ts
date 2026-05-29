// src/context/AppContext.ts
import { createContext, useContext } from 'react';

export interface AppContextType {
  unreadCount: number;
  incrementUnread: (conversationId?: string) => void;
  decrementUnread: (conversationId?: string) => void;
  resetUnread: () => void;
}

export const AppContext = createContext<AppContextType>({
  unreadCount: 0,
  incrementUnread: () => {},
  decrementUnread: () => {},
  resetUnread: () => {},
});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    console.warn('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
