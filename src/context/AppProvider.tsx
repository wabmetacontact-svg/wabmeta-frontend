// src/context/AppProvider.tsx - COMPLETE OPTIMIZED VERSION

import React, {
    useEffect,
    useMemo,
    useCallback,
    useRef,
    useState,
} from "react";
import { useLocation } from "react-router-dom";
import { contacts, inbox } from "../services/api";
import { AppContext, type UserType } from "./AppContext";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import AddPhoneModal from "../components/auth/AddPhoneModal";

const isJwtLike = (t: string) =>
    typeof t === "string" && t.split(".").length === 3;

const PUBLIC_ROUTES = [
    "/", "/login", "/signup", "/verify-otp", "/verify-email",
    "/forgot-password", "/reset-password", "/terms", "/privacy",
    "/contact", "/blog", "/help", "/documentation",
    "/data-deletion", "/meta/callback",
];

const ADMIN_ROUTES_PREFIX = "/admin";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const location = useLocation();
    const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth();
    const { socket, isConnected } = useSocket();

    const [unreadCount,   setUnreadCount]   = useState(0);
    const [totalContacts, setTotalContacts] = useState(0);
    const [responseRate,  setResponseRate]  = useState(0);
    const [showPhoneModal, setShowPhoneModal] = useState(false);

    const [user, setUser] = useState<UserType | null>(() => {
        try {
            const stored = localStorage.getItem("wabmeta_user");
            if (!stored) return null;
            const u = JSON.parse(stored);
            return {
                name:   [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email,
                email:  u.email,
                phone:  u.phone || "",
                role:   u.role || "",
                avatar: u.avatar || null,
            };
        } catch {
            return null;
        }
    });

    const lastStatsFetchRef     = useRef(0);
    // ✅ Track which conversations have unread messages
    const unreadConvIdsRef      = useRef<Set<string>>(new Set());
    // ✅ Track current viewed conversation (live)
    const currentConvIdRef      = useRef<string | null>(null);

    // ────────────────────────────────────────────────────────────────────
    // ✅ Sync currently viewed conversation from URL
    // ────────────────────────────────────────────────────────────────────
    useEffect(() => {
        const match = location.pathname.match(/\/inbox\/([^/]+)/);
        const convId = match?.[1] || null;
        currentConvIdRef.current = convId;

        // ✅ Agar user inbox open karta hai aur conv unread tha, decrement
        if (convId && unreadConvIdsRef.current.has(convId)) {
            unreadConvIdsRef.current.delete(convId);
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    }, [location.pathname]);

    // ────────────────────────────────────────────────────────────────────
    // ✅ Refresh Stats
    // ────────────────────────────────────────────────────────────────────
    const refreshStats = useCallback(async (force: boolean = false) => {
        try {
            const token =
                localStorage.getItem("accessToken") ||
                localStorage.getItem("token") ||
                localStorage.getItem("wabmeta_token");

            if (!token || !isJwtLike(token)) return;

            const now = Date.now();
            if (!force && now - lastStatsFetchRef.current < 30_000) return;
            lastStatsFetchRef.current = now;

            const [contactsRes, inboxStatsRes] = await Promise.all([
                contacts.stats(),
                inbox.stats
                    ? inbox.stats()
                    : Promise.resolve({ data: { data: {} } } as any),
            ]);

            const contactsStats = contactsRes.data?.data || {};
            const inboxStats    = inboxStatsRes.data?.data || {};

            const unread =
                inboxStats.unreadCount ??
                inboxStats.unread ??
                inboxStats.totalUnread ??
                inboxStats.unreadTotal ??
                0;

            const rr =
                inboxStats.responseRate ??
                inboxStats.response_rate ??
                inboxStats.avgResponseRate ??
                inboxStats.averageResponseRate ??
                0;

            setTotalContacts(Number(contactsStats?.total || 0));
            setUnreadCount(Number(unread || 0));
            setResponseRate(Number(rr || 0));
        } catch (error) {
            console.error("Failed to update global stats", error);
        }
    }, []);

    // ────────────────────────────────────────────────────────────────────
    // ✅ CRITICAL: Socket listeners for realtime sidebar
    // ────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !isConnected) return;

        console.log('🔔 AppProvider: Registering socket listeners for sidebar');

        // ────────────────────────────────────────────────────────────────
        // NEW MESSAGE: Increment unread if INBOUND + not current conv
        // ────────────────────────────────────────────────────────────────
        const handleNewMessage = (data: any) => {
            const msg       = data?.message || data;
            const direction = msg?.direction;
            const convId    = msg?.conversationId || data?.conversationId;

            if (direction !== 'INBOUND' || !convId) return;

            // ✅ If user is currently viewing this conv, don't increment
            if (currentConvIdRef.current === convId) {
                console.log('📩 Sidebar: User viewing this conv, skip increment');
                return;
            }

            // ✅ Only increment if not already counted
            if (!unreadConvIdsRef.current.has(convId)) {
                unreadConvIdsRef.current.add(convId);
                setUnreadCount(prev => {
                    const newCount = prev + 1;
                    console.log(`📩 Sidebar unread: ${prev} → ${newCount}`);
                    return newCount;
                });
            }
        };

        // ────────────────────────────────────────────────────────────────
        // CONVERSATION UPDATE: Sync unread state
        // ────────────────────────────────────────────────────────────────
        const handleConversationUpdate = (data: any) => {
            const conv = data?.conversation || data;
            if (!conv?.id) return;

            const convId       = conv.id;
            const wasUnread    = unreadConvIdsRef.current.has(convId);
            const nowHasUnread = (conv.unreadCount ?? 0) > 0 && conv.isRead !== true;

            // Read → Unread
            if (!wasUnread && nowHasUnread && currentConvIdRef.current !== convId) {
                unreadConvIdsRef.current.add(convId);
                setUnreadCount(prev => prev + 1);
            }
            // Unread → Read
            else if (wasUnread && !nowHasUnread) {
                unreadConvIdsRef.current.delete(convId);
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        };

        socket.on('message:new',          handleNewMessage);
        socket.on('conversation:updated', handleConversationUpdate);

        return () => {
            socket.off('message:new',          handleNewMessage);
            socket.off('conversation:updated', handleConversationUpdate);
            console.log('🔔 AppProvider: Socket listeners removed');
        };
    }, [socket, isConnected]);

    // ────────────────────────────────────────────────────────────────────
    // ✅ Manual unread methods (for Inbox.tsx)
    // ────────────────────────────────────────────────────────────────────
    const incrementUnread = useCallback((convId: string) => {
        if (!unreadConvIdsRef.current.has(convId)) {
            unreadConvIdsRef.current.add(convId);
            setUnreadCount(prev => prev + 1);
        }
    }, []);

    const decrementUnread = useCallback((convId: string) => {
        if (unreadConvIdsRef.current.has(convId)) {
            unreadConvIdsRef.current.delete(convId);
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    }, []);

    const setUnreadCountManual = useCallback((count: number) => {
        setUnreadCount(count);
    }, []);

    // ────────────────────────────────────────────────────────────────────
    // PHONE MODAL CHECK (existing code - same as before)
    // ────────────────────────────────────────────────────────────────────
    const checkPhoneNumber = useCallback(() => {
        if (authLoading) return;
        if (!isAuthenticated) { setShowPhoneModal(false); return; }

        const isPublicRoute = PUBLIC_ROUTES.some(route =>
            route === "/" ? location.pathname === "/" : location.pathname.startsWith(route)
        );
        if (isPublicRoute) { setShowPhoneModal(false); return; }

        if (location.pathname.startsWith(ADMIN_ROUTES_PREFIX)) {
            setShowPhoneModal(false);
            return;
        }

        const userStr = localStorage.getItem("wabmeta_user");
        if (!userStr) return;

        try {
            const u = JSON.parse(userStr);
            const hasPhone =
                u.phone &&
                typeof u.phone === "string" &&
                u.phone.trim() !== "" &&
                u.phone.replace(/\D/g, "").length >= 10;

            if (hasPhone) { setShowPhoneModal(false); return; }

            const skippedAt = localStorage.getItem("phone_modal_skipped_at");
            if (skippedAt) {
                const hoursPassed = (Date.now() - parseInt(skippedAt)) / (1000 * 60 * 60);
                if (hoursPassed < 24) {
                    setShowPhoneModal(false);
                    return;
                }
            }

            setTimeout(() => setShowPhoneModal(true), 1500);
        } catch (err) {
            console.error("Phone check failed:", err);
        }
    }, [location.pathname, isAuthenticated, authLoading]);

    // ────────────────────────────────────────────────────────────────────
    // EFFECTS
    // ────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isAuthenticated && !authLoading) refreshStats(true);
    }, [isAuthenticated, authLoading, refreshStats]);

    useEffect(() => {
        checkPhoneNumber();
    }, [location.pathname, isAuthenticated, authLoading, authUser, checkPhoneNumber]);

    useEffect(() => {
        if (authUser) {
            try {
                const userStr = localStorage.getItem("wabmeta_user");
                if (userStr) {
                    const u = JSON.parse(userStr);
                    setUser({
                        name:   [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email,
                        email:  u.email,
                        phone:  u.phone || "",
                        role:   u.role || "",
                        avatar: u.avatar || null,
                    });
                }
            } catch (err) {
                console.error("Failed to sync user", err);
            }
        } else if (!authLoading && !isAuthenticated) {
            setUser(null);
        }
    }, [authUser, isAuthenticated, authLoading]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "wabmeta_user" || e.key === "accessToken") {
                checkPhoneNumber();
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [checkPhoneNumber]);

    const handlePhoneModalClose = () => {
        setShowPhoneModal(false);
        localStorage.setItem("phone_modal_skipped_at", Date.now().toString());
    };

    const handlePhoneModalSuccess = (phone: string) => {
        localStorage.removeItem("phone_modal_skipped_at");
        try {
            const userStr = localStorage.getItem("wabmeta_user");
            if (userStr) {
                const u = JSON.parse(userStr);
                setUser({
                    name:   [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email,
                    email:  u.email,
                    phone:  u.phone || phone,
                    role:   u.role || "",
                    avatar: u.avatar || null,
                });
            }
        } catch (err) {
            console.error("Failed to refresh user", err);
        }
    };

    const value = useMemo(
        () => ({
            user,
            setUser,
            unreadCount,
            totalContacts,
            responseRate,
            refreshStats,
            incrementUnread,
            decrementUnread,
            setUnreadCount: setUnreadCountManual,
        }),
        [user, unreadCount, totalContacts, responseRate, refreshStats, incrementUnread, decrementUnread, setUnreadCountManual]
    );

    const userFirstName = useMemo(() => {
        if (!user) return "there";
        return user.name?.split(" ")[0] || "there";
    }, [user]);

    return (
        <AppContext.Provider value={value}>
            {children}
            <AddPhoneModal
                isOpen={showPhoneModal}
                onClose={handlePhoneModalClose}
                onSuccess={handlePhoneModalSuccess}
                userName={userFirstName}
                required={false}
            />
        </AppContext.Provider>
    );
};

export default AppProvider;
