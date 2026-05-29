// src/context/AppContext.ts

import { createContext, useContext } from "react";

export interface UserType {
    role?:   string;
    phone?:  string;
    name:    string;
    email:   string;
    avatar?: string | null;
}

export interface AppContextType {
    user:    UserType | null;
    setUser: (user: UserType | null) => void;

    unreadCount:   number;
    totalContacts: number;
    responseRate:  number;

    refreshStats:    (force?: boolean) => Promise<void>;
    
    // ✅ NEW: Realtime unread methods
    incrementUnread: (convId: string) => void;
    decrementUnread: (convId: string) => void;
    setUnreadCount:  (count: number) => void;
}

export const AppContext = createContext<AppContextType>({
    user:    null,
    setUser: () => {},

    unreadCount:   0,
    totalContacts: 0,
    responseRate:  0,

    refreshStats:    async () => {},
    incrementUnread: () => {},
    decrementUnread: () => {},
    setUnreadCount:  () => {},
});

export const useApp = () => useContext(AppContext);
