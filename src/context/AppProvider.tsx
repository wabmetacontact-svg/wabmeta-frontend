// src/context/AppProvider.tsx
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
import AddPhoneModal from "../components/auth/AddPhoneModal";

const isJwtLike = (t: string) =>
    typeof t === "string" && t.split(".").length === 3;

// ✅ Routes jahan modal NAHI dikhana
const PUBLIC_ROUTES = [
    "/",
    "/login",
    "/signup",
    "/verify-otp",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/terms",
    "/privacy",
    "/contact",
    "/blog",
    "/help",
    "/documentation",
    "/data-deletion",
    "/meta/callback",
];

// ✅ Routes jahan modal NAHI dikhana (admin)
const ADMIN_ROUTES_PREFIX = "/admin";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const location = useLocation();
    const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth();

    const [unreadCount, setUnreadCount] = useState(0);
    const [totalContacts, setTotalContacts] = useState(0);
    const [responseRate, setResponseRate] = useState(0);
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

    // ✅ Phone Modal Check
    const checkPhoneNumber = useCallback(() => {
        // 1️⃣ Auth still loading? Wait
        if (authLoading) {
            console.log("⏳ Auth loading - waiting...");
            return;
        }

        // 2️⃣ Not authenticated? Hide modal
        if (!isAuthenticated) {
            console.log("🔒 Not authenticated - hiding modal");
            setShowPhoneModal(false);
            return;
        }

        // 3️⃣ Public route check
        const isPublicRoute = PUBLIC_ROUTES.some((route) => {
            if (route === "/") return location.pathname === "/";
            return location.pathname.startsWith(route);
        });

        if (isPublicRoute) {
            console.log(`🔒 Public route (${location.pathname}) - hiding modal`);
            setShowPhoneModal(false);
            return;
        }

        // 4️⃣ Admin route check
        if (location.pathname.startsWith(ADMIN_ROUTES_PREFIX)) {
            console.log("🔒 Admin route - hiding modal");
            setShowPhoneModal(false);
            return;
        }

        // 5️⃣ Phone exists check
        const userStr = localStorage.getItem("wabmeta_user");
        if (!userStr) {
            console.log("⚠️ No user data");
            return;
        }

        try {
            const u = JSON.parse(userStr);

            const hasPhone =
                u.phone &&
                typeof u.phone === "string" &&
                u.phone.trim() !== "" &&
                u.phone.replace(/\D/g, "").length >= 10;

            if (hasPhone) {
                console.log(`✅ User has phone (${u.phone}) - hiding modal`);
                setShowPhoneModal(false);
                return;
            }

            // 6️⃣ Skip cooldown check (24 hours)
            const skippedAt = localStorage.getItem("phone_modal_skipped_at");
            if (skippedAt) {
                const hoursPassed =
                    (Date.now() - parseInt(skippedAt)) / (1000 * 60 * 60);
                if (hoursPassed < 24) {
                    console.log(
                        `⏰ Skipped recently (${hoursPassed.toFixed(1)}h ago)`
                    );
                    setShowPhoneModal(false);
                    return;
                }
            }

            // ✅ Show modal after delay
            console.log("📱 Showing phone modal in 1.5s...");
            setTimeout(() => {
                setShowPhoneModal(true);
            }, 1500);
        } catch (err) {
            console.error("Phone check failed:", err);
        }
    }, [location.pathname, isAuthenticated, authLoading]);

    // ✅ Initial stats load
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            refreshStats(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, authLoading]);

    // ✅ Re-check phone whenever route, auth, or user changes
    useEffect(() => {
        checkPhoneNumber();
    }, [location.pathname, isAuthenticated, authLoading, authUser, checkPhoneNumber]);

    // ✅ Sync user from authUser (jab login hota hai)
    useEffect(() => {
        if (authUser) {
            try {
                const userStr = localStorage.getItem("wabmeta_user");
                if (userStr) {
                    const u = JSON.parse(userStr);
                    setUser({
                        name:
                            [u.firstName, u.lastName]
                                .filter(Boolean)
                                .join(" ") || u.email,
                        email: u.email,
                        phone: u.phone || "",
                        role: u.role || "",
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

    // ✅ Cross-tab storage sync
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

    // ✅ Modal Handlers
    const handlePhoneModalClose = () => {
        setShowPhoneModal(false);
        localStorage.setItem(
            "phone_modal_skipped_at",
            Date.now().toString()
        );
    };

    const handlePhoneModalSuccess = (phone: string) => {
        localStorage.removeItem("phone_modal_skipped_at");

        // Update user state immediately
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

    const userFirstName = useMemo(() => {
        if (!user) return "there";
        const name = user.name?.split(" ")[0];
        return name || "there";
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
