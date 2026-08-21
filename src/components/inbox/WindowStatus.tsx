// src/components/inbox/WindowStatus.tsx

import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface WindowStatusProps {
    windowExpiresAt: string | Date | null;
    isWindowOpen: boolean;
}

const WindowStatus: React.FC<WindowStatusProps> = ({
    windowExpiresAt,
    isWindowOpen,
}) => {
    const getTimeRemaining = () => {
        if (!windowExpiresAt) return null;

        const expiresAt = new Date(windowExpiresAt);
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();

        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const timeRemaining = getTimeRemaining();
    // Force closed if no time remaining, even if isWindowOpen is true
    const isOpen = isWindowOpen && !!timeRemaining;

    // Window closed checks are based on timestamp boundaries.

    if (isOpen) {
        return (
            <div className="w-full bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-center shadow-sm z-10 relative">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse ring-2 ring-emerald-50" />
                    </div>
                    <span className="text-sm font-semibold text-emerald-800">
                        24h Window Active
                    </span>
                    <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {timeRemaining} left
                    </span>
                </div>
            </div>
        );
    }

    // Window Closed State
    return (
        <div className="w-full bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center justify-center shadow-sm z-10 relative">
            <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">
                    24h Window Closed
                </span>
                <span className="text-xs text-amber-600">
                    • Use templates to message
                </span>
            </div>
        </div>
    );
};

export default WindowStatus;