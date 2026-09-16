// src/context/AuthContext.ts

import { createContext, useContext } from 'react';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    emailVerified: boolean;
    role?: string;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    planType: string;
    // Effective locks - backend plan limit + admin lock dono mila kar bhejta
    // hai. Naam wabmeta-backend ke FEATURE_REGISTRY se aate hain; yahan ka
    // mirror src/constants/features.ts me hai.
    featureInboxLocked?: boolean;
    featureContactsLocked?: boolean;
    featureCrmLocked?: boolean;
    featureCampaignsLocked?: boolean;
    featureTemplatesLocked?: boolean;
    featureChatbotLocked?: boolean;
    featureAutomationLocked?: boolean;
    featureAiAgentLocked?: boolean;
    featureTelegramLocked?: boolean;
    featureInstagramLocked?: boolean;
    featureReportsLocked?: boolean;
    featureWalletLocked?: boolean;
    featureConnectionLocked?: boolean;
}

export interface AuthContextType {
    user: User | null;
    organization: Organization | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    // Sirf pehla session check (app boot par). Login/register jaisi
    // in-flight actions ise nahi chhedti - warna route guards login
    // page ko unmount kar dete hain aur uska error state mit jata hai.
    isInitializing: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: any) => Promise<{ success: boolean; error?: string }>;
    googleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateUser: (user: Partial<User>) => void;
    updateOrganization: (org: Partial<Organization>) => void;
    setOrganization: (org: Organization | null) => void;
    clearError: () => void;
    refreshSession: () => Promise<boolean>;
}

/**
 * ⚠️ IMPORTANT: Context value must be memoized in Provider to prevent
 * unnecessary re-renders in all consumer components.
 * 
 * See AuthProvider.tsx - useMemo wrapping the value object.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export default AuthContext;