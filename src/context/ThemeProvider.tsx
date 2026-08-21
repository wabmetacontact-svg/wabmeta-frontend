import React, {
  createContext,
  useContext,
  useEffect,
  useMemo
} from 'react';

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

// ─── Provider ────────────────────────────────────────────────────────────────

// The app is pinned to light mode on every route, dashboard included.
//
// This used to switch on the route, and the machinery for that is worth keeping
// in mind if per-route theming comes back: marketing ('/', '/contact',
// '/documentation', '/blog', '/privacy', '/terms', '/data-deletion') and auth
// ('/login', '/signup', '/forgot-password', '/reset-password', '/verify-email',
// '/verify-otp') were light, and everything else dark. Restoring it means
// reading `useLocation().pathname` here and returning 'dark' for the rest.
//
// Note: while this stays pinned, every `dark:` class in the app is inert.

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const mode: ThemeMode = 'light';

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
