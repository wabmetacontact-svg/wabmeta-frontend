// src/context/AppProvider.tsx
import React, {
    useEffect,
    useMemo,
    useCallback,
    useRef,
    useState,
} from "react";
import { contacts, inbox } from "../services/api";
import { AppContext, type UserType } from "./AppContext";
import AddPhoneModal from "../components/auth/AddPhoneModal";

const isJwtLike = (t: string) =>
    typeof t === "string" && t.split(".").length === 3;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalContacts, setTotalContacts] = useState(0);
    const [responseRate, setResponseRate] = useState(0);

    // ✅ Phone Modal State
    const [showPhoneModal, setShowPhoneModal] = useState(false);

    const [user, setUser] = useState<UserType | null>(() => {
        try {
            const stored = localStorage.getItem("wabmeta_user");
            if (!stored) return null;

            const u = JSON.parse(stored);
            return {
                name:
                    [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                    u.email,
                email: u.email,
                phone: u.phone || "",
                role: u.role || "",
                avatar: u.avatar || null,
            };
        } catch {
            return null;
        }
    });

    const lastStatsFetchRef = useRef(0);

    const refreshStats = useCallback(async (force: boolean = false) => {
        try {
            const token =
                localStorage.getItem("accessToken") ||
                localStorage.getItem("token") ||
                localStorage.getItem("wabmeta_token");

            if (!token || !isJwtLike(token)) return;

            const now = Date.now();
            if (!force && now - lastStatsFetchRef.current < 30_000) {
                return;
            }
            lastStatsFetchRef.current = now;

            try {
                const [contactsRes, inboxStatsRes] = await Promise.all([
                    contacts.stats(),
                    inbox.stats
                        ? inbox.stats()
                        : Promise.resolve({ data: { data: {} } } as any),
                ]);

                const contactsStats = contactsRes.data?.data || {};
                const inboxStats = inboxStatsRes.data?.data || {};

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
            } catch (err) {
                console.error("Partial stats failure", err);
            }
        } catch (error) {
            console.error("Failed to update global stats", error);
        }
    }, []);

    // ✅ Phone Modal Check Logic
    const checkPhoneNumber = useCallback(() => {
        const token =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("wabmeta_token");

        if (!token || !isJwtLike(token)) {
            setShowPhoneModal(false);
            return;
        }

        const userStr = localStorage.getItem("wabmeta_user");
        if (!userStr) return;

        try {
            const u = JSON.parse(userStr);

            // Phone exists & not empty? Don't show
            if (u.phone && u.phone.trim() !== "") {
                setShowPhoneModal(false);
                return;
            }

            // Check skip cooldown (24 hours)
            const skippedAt = localStorage.getItem("phone_modal_skipped_at");
            if (skippedAt) {
                const hoursPassed =
                    (Date.now() - parseInt(skippedAt)) / (1000 * 60 * 60);
                if (hoursPassed < 24) {
                    setShowPhoneModal(false);
                    return;
                }
            }

            // Show modal after small delay (better UX)
            setTimeout(() => {
                setShowPhoneModal(true);
            }, 1500);
        } catch (err) {
            console.error("Phone check failed:", err);
        }
    }, []);

    // Initial load
    useEffect(() => {
        refreshStats(true);
        checkPhoneNumber();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ Re-check phone whenever user state changes (login/logout)
    useEffect(() => {
        if (user) {
            checkPhoneNumber();
        } else {
            setShowPhoneModal(false);
        }
    }, [user, checkPhoneNumber]);

    // ✅ Listen for storage changes (for cross-tab sync)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "wabmeta_user" || e.key === "accessToken") {
                checkPhoneNumber();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () =>
            window.removeEventListener("storage", handleStorageChange);
    }, [checkPhoneNumber]);

    // ✅ Phone Modal Handlers
    const handlePhoneModalClose = () => {
        setShowPhoneModal(false);
        localStorage.setItem(
            "phone_modal_skipped_at",
            Date.now().toString()
        );
    };

    const handlePhoneModalSuccess = (phone: string) => {
        // Clear skip cooldown
        localStorage.removeItem("phone_modal_skipped_at");

        // Update user state
        if (user) {
            setUser({ ...user, phone });
        }

        // Refresh user from localStorage
        try {
            const userStr = localStorage.getItem("wabmeta_user");
            if (userStr) {
                const u = JSON.parse(userStr);
                setUser({
                    name:
                        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                        u.email,
                    email: u.email,
                    phone: u.phone || phone,
                    role: u.role || "",
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
        }),
        [user, unreadCount, totalContacts, responseRate, refreshStats]
    );

    // Get user firstName for modal
    const userFirstName = useMemo(() => {
        if (!user) return "there";
        const name = user.name?.split(" ")[0];
        return name || "there";
    }, [user]);

    return (
        <AppContext.Provider value={value}>
            {children}

            {/* ✅ Phone Modal - Globally accessible */}
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
