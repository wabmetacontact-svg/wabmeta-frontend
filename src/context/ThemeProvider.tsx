import React, { useEffect, useMemo } from 'react';
import { ThemeContext, type ThemeContextValue } from './ThemeContext';

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    // Always enforce dark mode — light mode has been removed from this app
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light');
        root.classList.add('dark');
        localStorage.setItem('wabmeta_theme_mode', 'dark');
    }, []);

    const value = useMemo<ThemeContextValue>(() => ({
        mode: 'dark',
        resolved: 'dark',
        setMode: () => {},   // no-op — kept for API compatibility
        toggle: () => {},    // no-op — kept for API compatibility
    }), []);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
