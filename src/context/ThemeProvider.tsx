import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useMemo 
} from 'react';
import { useLocation } from 'react-router-dom';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark';

export type ThemeContextValue = {
  mode: ThemeMode;
};

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};

// ─── Routes Config ───────────────────────────────────────────────────────────

// Yeh routes LIGHT mode mein rahenge
const LIGHT_ROUTES = [
  '/',
  '/contact',
  '/documentation', 
  '/blog',
  '/privacy',
  '/terms',
  '/data-deletion',
];

// Yeh routes bhi LIGHT mein honge (auth pages)
const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-otp',
];

// ─── Provider ────────────────────────────────────────────────────────────────

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { pathname } = useLocation();

  // Determine mode based on route
  const mode: ThemeMode = useMemo(() => {
    const isLightRoute = 
      LIGHT_ROUTES.includes(pathname) || 
      AUTH_ROUTES.includes(pathname);
    
    // Ab sab kuch light hai - dashboard bhi
    // Agar sirf marketing light chahiye toh: return isLightRoute ? 'light' : 'dark'
    return 'light'; // ← PURE LIGHT MODE
  }, [pathname]);

  // Apply class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(mode);
  }, [mode]);

  const value = useMemo<ThemeContextValue>(() => ({ mode }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
