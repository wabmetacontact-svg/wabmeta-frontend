import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeContext, type ThemeContextValue } from './ThemeContext';

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { pathname } = useLocation();

    // Dynamically manage dark class based on the route
    useEffect(() => {
        const root = document.documentElement;
        
        // Marketing/public pages that should be in light theme
        const marketingRoutes = ['/', '/contact', '/documentation', '/blog', '/privacy', '/terms', '/data-deletion'];
        const isMarketing = marketingRoutes.includes(pathname);

        if (isMarketing) {
            root.classList.remove('dark');
            root.classList.add('light');
        } else {
            root.classList.remove('light');
            root.classList.add('dark');
        }
    }, [pathname]);

    const value = useMemo<ThemeContextValue>(() => ({
        mode: 'dark',
        resolved: 'dark',
        setMode: () => {},   // no-op — kept for API compatibility
        toggle: () => {},    // no-op — kept for API compatibility
    }), []);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
