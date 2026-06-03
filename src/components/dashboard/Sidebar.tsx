import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Send,
  FileText,
  Inbox,
  Bot,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  CreditCard,
  UserCircle,
  Wallet,
  Plus,
  Sparkles,
  Lock,
  MessageSquare,
  Instagram,
  Heart,
  MessageCircle,
  Image,
  BookOpen,
  TrendingUp,
  Megaphone,
  ChevronDown,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useApp } from "../../context/AppContext";
import { usePlanAccess } from "../../hooks/usePlanAccess";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types/auth";
import { FaWhatsapp } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────

type Channel = "whatsapp" | "instagram";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  featureKey?: string;
  comingSoon?: boolean;
  subItems?: { name: string; href: string }[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

// ─── Prefetch helper ──────────────────────────────────────────────────────────

const prefetched = new Set<string>();
const prefetchRouteChunk = (href: string) => {
  if (prefetched.has(href)) return;
  prefetched.add(href);
  switch (href) {
    case "/dashboard": import("../../pages/Dashboard"); break;
    case "/dashboard/inbox": import("../../pages/Inbox"); break;
    case "/dashboard/contacts": import("../../pages/Contacts"); break;
    case "/dashboard/templates": import("../../pages/Templates"); break;
    case "/dashboard/campaigns": import("../../pages/Campaigns"); break;
    case "/dashboard/wallet": import("../../pages/Wallet"); break;
    case "/dashboard/settings": import("../../pages/Settings"); break;
    case "/dashboard/reports": import("../../pages/Reports"); break;
    case "/dashboard/chatbots": import("../../pages/ChatbotList"); break;
    case "/dashboard/automations": import("../../pages/Automation"); break;
    case "/dashboard/crm": import("../../pages/CRM"); break;
    default: break;
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDisplayName = (u: User | null): string => {
  if (!u) return "Guest";
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  const legacyName = (u as any).name;
  if (legacyName?.trim()) return legacyName.trim();
  if (u.email?.trim()) return u.email.trim();
  return "User";
};

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 22) return "Good evening";
  return "Good night";
};

// ─── WhatsApp Navigation ──────────────────────────────────────────────────────

const getWhatsAppNav = (
  unreadCount: number,
  totalContacts: number
): NavGroup[] => [
  {
    title: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        name: "Inbox",
        href: "/dashboard/inbox",
        icon: Inbox,
        featureKey: "inbox",
        badge: unreadCount > 0
          ? unreadCount > 99 ? "99+" : unreadCount
          : undefined,
        badgeColor: "bg-red-500",
      },
      {
        name: "Contacts",
        href: "/dashboard/contacts",
        icon: Users,
        badge: totalContacts > 0
          ? totalContacts > 1000
            ? `${(totalContacts / 1000).toFixed(1)}k`
            : totalContacts.toLocaleString()
          : undefined,
        badgeColor: "bg-blue-500",
      },
    ],
  },
  {
    title: "CRM",
    items: [
      {
        name: "CRM",
        href: "/dashboard/crm",
        icon: Users,
        subItems: [
          { name: "Dashboard", href: "/dashboard/crm" },
          { name: "Leads", href: "/dashboard/crm/leads" },
        ],
      },
    ],
  },
  {
    title: "Messaging",
    items: [
      {
        name: "Campaigns",
        href: "/dashboard/campaigns",
        icon: Send,
        featureKey: "campaigns",
      },
      { name: "Templates", href: "/dashboard/templates", icon: FileText },
      {
        name: "Chatbots",
        href: "/dashboard/chatbots",
        icon: Bot,
        featureKey: "chatbot",
      },
      {
        name: "Automations",
        href: "/dashboard/automations",
        icon: Zap,
        featureKey: "automation",
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        name: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        featureKey: "reports",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      { name: "Team", href: "/dashboard/team", icon: UserCircle },
      { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
      {
        name: "Wallet",
        href: "/dashboard/wallet",
        icon: Wallet,
        featureKey: "wallet",
      },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

// ─── Instagram Navigation ─────────────────────────────────────────────────────

const getInstagramNav = (): NavGroup[] => [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/instagram/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Engagement",
    items: [
      {
        name: "DM Automation",
        href: "/instagram/dm-automation",
        icon: MessageCircle,
      },
      {
        name: "Comment Automation",
        href: "/instagram/comments",
        icon: MessageSquare,
      },
      {
        name: "Story Automation",
        href: "/instagram/stories",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        name: "Post Management",
        href: "/instagram/posts",
        icon: Image,
        comingSoon: true,
      },
      {
        name: "Campaigns",
        href: "/instagram/campaigns",
        icon: Megaphone,
        comingSoon: true,
      },
    ],
  },
  {
    title: "Growth",
    items: [
      {
        name: "Lead Generation",
        href: "/instagram/leads",
        icon: Users,
        comingSoon: true,
      },
      {
        name: "Analytics",
        href: "/instagram/analytics",
        icon: TrendingUp,
        comingSoon: true,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        name: "IG Settings",
        href: "/instagram/settings",
        icon: Settings,
      },
    ],
  },
];

// ─── Channel Switcher Component ───────────────────────────────────────────────

interface ChannelSwitcherProps {
  activeChannel: Channel;
  onSwitch: (channel: Channel) => void;
  collapsed: boolean;
}

const ChannelSwitcher: React.FC<ChannelSwitcherProps> = ({
  activeChannel,
  onSwitch,
  collapsed,
}) => {
  const [open, setOpen] = useState(false);

  const channels: {
    id: Channel;
    label: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
    badge?: string;
  }[] = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: FaWhatsapp,
      color: "#25d366",
      gradient: "from-[#25d366] to-[#128C7E]",
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: Instagram,
      color: "#e1306c",
      gradient: "from-[#833ab4] via-[#fd1d1d] to-[#fcb045]",
      badge: "Beta",
    },
  ];

  const active = channels.find((c) => c.id === activeChannel)!;

  if (collapsed) {
    return (
      <div className="flex flex-col gap-1.5 mx-auto mt-3 px-2">
        {channels.map((ch) => {
          const isActive = ch.id === activeChannel;
          return (
            <button
              key={ch.id}
              onClick={() => onSwitch(ch.id)}
              title={ch.label}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                transition-all duration-300 mx-auto
                ${isActive
                  ? "shadow-lg scale-105"
                  : "opacity-50 hover:opacity-80 bg-white/[0.04] border border-white/[0.08]"
                }
              `}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${ch.color}40, ${ch.color}20)`,
                      border: `1px solid ${ch.color}60`,
                      boxShadow: `0 4px 16px ${ch.color}30`,
                    }
                  : {}
              }
            >
              <ch.icon
                className="w-4 h-4"
                style={{ color: isActive ? ch.color : "#9ca3af" }}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative mx-3 mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          bg-white/[0.04] border border-white/[0.08]
          hover:bg-white/[0.06] hover:border-white/[0.12]
          transition-all duration-300 group"
      >
        {/* Active channel icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${active.color}40, ${active.color}20)`,
            border: `1px solid ${active.color}50`,
          }}
        >
          <active.icon className="w-4 h-4" style={{ color: active.color }} />
        </div>

        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {active.label}
          </p>
          <p className="text-[10px] text-gray-500 font-mono">
            Active channel
          </p>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-300
            ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden
            bg-[#0a0e27]/95 backdrop-blur-xl
            border border-white/[0.1]
            shadow-[0_16px_40px_rgba(0,0,0,0.4)]
            z-50"
        >
          {channels.map((ch) => {
            const isActive = ch.id === activeChannel;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  onSwitch(ch.id);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5
                  transition-all duration-300
                  ${isActive
                    ? "bg-white/[0.06]"
                    : "hover:bg-white/[0.04]"
                  }
                `}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${ch.color}40, ${ch.color}20)`,
                    border: `1px solid ${ch.color}50`,
                  }}
                >
                  <ch.icon
                    className="w-4 h-4"
                    style={{ color: ch.color }}
                  />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-white">
                      {ch.label}
                    </p>
                    {ch.badge && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                        style={{
                          background: `${ch.color}25`,
                          color: ch.color,
                          border: `1px solid ${ch.color}40`,
                        }}
                      >
                        {ch.badge}
                      </span>
                    )}
                  </div>
                </div>

                {isActive && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ch.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { unreadCount, totalContacts } = useApp();
  const { hasAccess } = usePlanAccess();
  const { logout } = useAuth();

  // Detect active channel from URL
  const [activeChannel, setActiveChannel] = useState<Channel>(() => {
    return location.pathname.startsWith("/instagram")
      ? "instagram"
      : "whatsapp";
  });

  // Sync channel with URL
  useEffect(() => {
    if (location.pathname.startsWith("/instagram")) {
      setActiveChannel("instagram");
    } else {
      setActiveChannel("whatsapp");
    }
  }, [location.pathname]);

  const [user] = useState<User | null>(() => {
    const stored = localStorage.getItem("wabmeta_user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [greeting, setGreeting] = useState(getGreeting());
  useEffect(() => {
    const timer = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(timer);
  }, []);

  const displayName = getDisplayName(user);
  const firstName = displayName.split(" ")[0];
  const email = user?.email || "";
  const initial = (displayName?.charAt(0) || "G").toUpperCase();

  const handleLogout = async () => {
    await logout();
  };

  // Get navigation based on active channel
  const navigation =
    activeChannel === "instagram"
      ? getInstagramNav()
      : getWhatsAppNav(unreadCount, totalContacts);

  // Active check
  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/instagram/dashboard") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // CTA config per channel
  const ctaConfig = {
    whatsapp: {
      text: "New campaign",
      href: "/dashboard/campaigns/create",
      color: "from-green-500 to-emerald-500",
      shadow: "rgba(16,185,129,0.35)",
      shadowHover: "rgba(16,185,129,0.5)",
    },
    instagram: {
      text: "New automation",
      href: "/instagram/dm-automation/create",
      color: "from-[#833ab4] to-[#fd1d1d]",
      shadow: "rgba(131,58,180,0.35)",
      shadowHover: "rgba(131,58,180,0.5)",
    },
  };

  const cta = ctaConfig[activeChannel];

  // Active indicator color per channel
  const activeColor =
    activeChannel === "instagram"
      ? { bg: "rgba(225,48,108,0.2)", border: "#e1306c50", bar: "#e1306c", glow: "rgba(225,48,108,0.25)" }
      : { bg: "rgba(16,185,129,0.2)", border: "#10b98150", bar: "#10b981", glow: "rgba(16,185,129,0.25)" };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-72"}
      `}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-[#0a0e27]/80 backdrop-blur-2xl border-r border-white/[0.08]" />

      {/* Inner gradient accent - changes per channel */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background:
            activeChannel === "instagram"
              ? "radial-gradient(ellipse 70% 40% at 0% 0%, rgba(131,58,180,0.08) 0%, transparent 60%)"
              : "radial-gradient(ellipse 70% 40% at 0% 0%, rgba(16,185,129,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col h-full">

        {/* ── TOP: Logo + collapse ── */}
        <div
          className={`flex items-center h-16 px-4 border-b border-white/[0.06]
            ${collapsed ? "justify-center" : "justify-between"}
          `}
        >
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <img
              src={logo}
              alt="WabMeta"
              className={`object-contain transition-all duration-300
                ${collapsed ? "w-10 h-10" : "h-8 w-auto"}
                group-hover:scale-105
              `}
            />
          </Link>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg
                bg-white/[0.04] border border-white/[0.06]
                hover:bg-white/[0.08] hover:border-white/[0.12]
                text-gray-400 hover:text-white transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-3 p-1.5 rounded-lg
              bg-white/[0.04] border border-white/[0.06]
              hover:bg-white/[0.08] hover:border-white/[0.12]
              text-gray-400 hover:text-white transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* ── CHANNEL SWITCHER ── */}
        <ChannelSwitcher
          activeChannel={activeChannel}
          onSwitch={(ch) => {
            setActiveChannel(ch);
            // Navigate to channel dashboard
            // (navigation happens via Link components in nav)
          }}
          collapsed={collapsed}
        />



        {/* ── NAVIGATION ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          {navigation.map((group, groupIndex) => (
            <div key={group.title} className={groupIndex > 0 ? "mt-5" : "mt-2"}>
              {!collapsed && (
                <div className="flex items-center justify-between px-3 mb-2">
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray-500">
                    {group.title}
                  </h3>
                </div>
              )}

              {collapsed && groupIndex > 0 && (
                <div className="mx-3 my-3 h-px bg-white/[0.05]" />
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const isLocked = !!(item.featureKey && !hasAccess(item.featureKey));
                  const isSoon = !!item.comingSoon;

                  return (
                    <div
                      key={item.name}
                      className="relative group/item"
                      onMouseEnter={() => {
                        setHoveredItem(item.name);
                        if (!isLocked && !isSoon) prefetchRouteChunk(item.href);
                      }}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link
                        to={isLocked || isSoon ? "#" : item.href}
                        aria-disabled={isLocked || isSoon}
                        onClick={(e) => {
                          if (isLocked || isSoon) e.preventDefault();
                        }}
                        className={`relative flex items-center px-3 py-2.5 rounded-xl
                          transition-all duration-300 overflow-hidden
                          ${active ? "text-white" : "text-gray-400 hover:text-white"}
                          ${collapsed ? "justify-center" : ""}
                          ${isLocked || isSoon ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                      >
                        {/* Active background */}
                        {active && (
                          <>
                            <div
                              className="absolute inset-0 rounded-xl"
                              style={{
                                background: `linear-gradient(to right, ${activeColor.bg}, transparent)`,
                                border: `1px solid ${activeColor.border}`,
                              }}
                            />
                            <div
                              className="absolute inset-0 rounded-xl"
                              style={{
                                boxShadow: `0 4px 16px ${activeColor.glow}`,
                              }}
                            />
                            {/* Left bar */}
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                              style={{
                                backgroundColor: activeColor.bar,
                                boxShadow: `0 0 8px ${activeColor.bar}80`,
                              }}
                            />
                          </>
                        )}

                        {/* Hover background */}
                        {!active && (
                          <div
                            className="absolute inset-0 rounded-xl
                              bg-white/[0.04] opacity-0 group-hover/item:opacity-100
                              transition-opacity duration-300"
                          />
                        )}

                        <item.icon
                          className={`relative w-4 h-4 flex-shrink-0 transition-all duration-300
                            ${active ? "" : "text-gray-500 group-hover/item:text-white"}
                          `}
                          style={active ? { color: activeColor.bar } : {}}
                        />

                        {!collapsed && (
                          <>
                            <span className="relative ml-3 text-sm font-medium flex-1">
                              {item.name}
                            </span>

                            <div className="relative ml-auto flex items-center gap-2">
                              {isSoon ? (
                                <span
                                  className="px-1.5 py-0.5 text-[9px] font-bold rounded-full"
                                  style={{
                                    background: "rgba(99,102,241,0.2)",
                                    color: "#818cf8",
                                    border: "1px solid rgba(99,102,241,0.3)",
                                  }}
                                >
                                  Soon
                                </span>
                              ) : isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-gray-500" />
                              ) : item.badge ? (
                                <span
                                  className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full
                                    ${item.badgeColor
                                      ? `${item.badgeColor} text-white`
                                      : "bg-white/[0.08] border border-white/[0.1] text-gray-300"
                                    }
                                  `}
                                >
                                  {item.badge}
                                </span>
                              ) : null}
                            </div>
                          </>
                        )}
                      </Link>

                      {/* Sub-items */}
                      {!collapsed && item.subItems && active && (
                        <div className="ml-8 mt-1 space-y-0.5 pl-3 border-l border-white/[0.06]">
                          {item.subItems.map((sub) => {
                            const subActive = location.pathname === sub.href;
                            return (
                              <Link
                                key={sub.name}
                                to={sub.href}
                                className={`block px-3 py-1.5 text-xs rounded-lg transition-all duration-300
                                  ${subActive
                                    ? "font-medium bg-white/[0.04]"
                                    : "text-gray-500 hover:text-white hover:bg-white/[0.04]"
                                  }
                                `}
                                style={
                                  subActive ? { color: activeColor.bar } : {}
                                }
                              >
                                {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* Collapsed Tooltip */}
                      {collapsed && hoveredItem === item.name && (
                        <div
                          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2
                            bg-[#0a0e27]/95 backdrop-blur-xl
                            border border-white/[0.12]
                            text-white text-xs font-medium rounded-lg whitespace-nowrap z-50
                            shadow-xl"
                        >
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {isSoon && (
                              <span className="text-[9px] text-indigo-400">
                                Soon
                              </span>
                            )}
                            {isLocked && (
                              <Lock className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ── CTA Button ── */}
          {!collapsed && (
            <div className="mt-6 mx-1">
              <Link
                to={cta.href}
                className={`group/cta relative flex items-center justify-center gap-2
                  w-full py-3 px-4 rounded-xl
                  bg-gradient-to-r ${cta.color}
                  text-white text-sm font-semibold
                  hover:-translate-y-0.5
                  transition-all duration-500
                  border border-white/20
                  overflow-hidden`}
                style={{
                  boxShadow: `0 8px 24px ${cta.shadow}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 12px 32px ${cta.shadowHover}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 8px 24px ${cta.shadow}`;
                }}
              >
                <span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent
                    -translate-x-full group-hover/cta:translate-x-full transition-transform duration-1000"
                />
                <Plus className="relative w-4 h-4" />
                <span className="relative">{cta.text}</span>
              </Link>
            </div>
          )}

          {collapsed && (
            <div className="mt-6">
              <Link
                to={cta.href}
                className={`relative mx-auto flex items-center justify-center
                  w-11 h-11 rounded-xl
                  bg-gradient-to-br ${cta.color}
                  text-white border border-white/20
                  hover:scale-110 transition-all duration-300`}
                style={{
                  boxShadow: `0 8px 20px ${cta.shadow}`,
                }}
                onMouseEnter={() => setHoveredItem("create")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Plus className="w-5 h-5" />
              </Link>
            </div>
          )}
        </nav>

        {/* ── BOTTOM SECTION ── */}
        <div className="p-3 border-t border-white/[0.06] space-y-1">
          {/* Help */}
          <div
            className="relative"
            onMouseEnter={() => collapsed && setHoveredItem("help")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              to="/dashboard/help"
              className={`flex items-center px-3 py-2.5 rounded-xl
                text-gray-400 hover:text-white hover:bg-white/[0.04]
                transition-all duration-300
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <HelpCircle className="w-4 h-4" />
              {!collapsed && (
                <span className="ml-3 text-sm font-medium">Help & Support</span>
              )}
            </Link>

            {collapsed && hoveredItem === "help" && (
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2
                  bg-[#0a0e27]/95 backdrop-blur-xl border border-white/[0.12]
                  text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-xl"
              >
                Help & Support
              </div>
            )}
          </div>

          {/* Logout */}
          <div
            className="relative"
            onMouseEnter={() => collapsed && setHoveredItem("logout")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl
                text-gray-400 hover:text-red-400 hover:bg-red-500/10
                hover:border-red-400/20 border border-transparent
                transition-all duration-300
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && (
                <span className="ml-3 text-sm font-medium">Logout</span>
              )}
            </button>

            {collapsed && hoveredItem === "logout" && (
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2
                  bg-[#0a0e27]/95 backdrop-blur-xl border border-white/[0.12]
                  text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-xl"
              >
                Logout
              </div>
            )}
          </div>

          {/* User Card */}
          {!collapsed && email && (
            <div
              className="mt-3 p-2.5 rounded-xl
                bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]
                hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg
                    bg-gradient-to-br from-green-500 to-emerald-600
                    flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                >
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate font-mono">
                    {email}
                  </p>
                </div>
                <Sparkles className="w-3 h-3 text-green-400 flex-shrink-0" />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.15);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;