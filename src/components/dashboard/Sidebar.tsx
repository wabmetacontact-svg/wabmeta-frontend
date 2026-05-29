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
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useApp } from "../../context/AppContext";
import { usePlanAccess } from "../../hooks/usePlanAccess";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types/auth";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  featureKey?: string;
  subItems?: { name: string; href: string }[];
}

interface NavGroup {
  title: string;
  count: number;
  items: NavItem[];
}

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
    case "/dashboard/billing": import("../../pages/Billing"); break;
    case "/dashboard/wallet": import("../../pages/Wallet"); break;
    case "/dashboard/team": import("../../pages/Team"); break;
    case "/dashboard/settings": import("../../pages/Settings"); break;
    case "/dashboard/reports": import("../../pages/Reports"); break;
    case "/dashboard/chatbot":
    case "/dashboard/chatbots": import("../../pages/ChatbotList"); break;
    case "/dashboard/automation":
    case "/dashboard/automations": import("../../pages/Automation"); break;
    case "/dashboard/crm": import("../../pages/CRM"); break;
    case "/dashboard/crm/leads": import("../../pages/LeadsList"); break;
    default: break;
  }
};

const getDisplayName = (u: User | null): string => {
  if (!u) return "Guest";
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  const legacyName = (u as any).name;
  if (legacyName && legacyName.trim()) return legacyName.trim();
  if (u.email && u.email.trim()) return u.email.trim();
  return "User";
};

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 22) return "Good evening";
  return "Good night";
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { unreadCount, totalContacts } = useApp();
  const { hasAccess } = usePlanAccess();
  const { logout } = useAuth();

  const [user] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("wabmeta_user");
    if (storedUser) {
      try { return JSON.parse(storedUser); } catch { return null; }
    }
    return null;
  });

  // Real-time greeting
  const [greeting, setGreeting] = useState(getGreeting());
  useEffect(() => {
    const timer = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  const displayName = getDisplayName(user);
  const firstName = displayName.split(" ")[0];
  const email = user?.email || "";
  const initial = (displayName?.charAt(0) || "G").toUpperCase();

  const handleLogout = async () => { await logout(); };

  const navigation: NavGroup[] = [
    {
      title: "Main",
      count: 3,
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        {
          name: "Inbox",
          href: "/dashboard/inbox",
          icon: Inbox,
          badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
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
      count: 1,
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
      count: 4,
      items: [
        { name: "Campaigns", href: "/dashboard/campaigns", icon: Send },
        { name: "Templates", href: "/dashboard/templates", icon: FileText },
        { name: "Chatbots", href: "/dashboard/chatbots", icon: Bot, featureKey: "chatbot" },
        { name: "Automations", href: "/dashboard/automations", icon: Zap, featureKey: "automation" },
      ],
    },
    {
      title: "Analytics",
      count: 1,
      items: [
        { name: "Reports", href: "/dashboard/reports", icon: BarChart3, featureKey: "reports" },
      ],
    },
    {
      title: "Settings",
      count: 4,
      items: [
        { name: "Team", href: "/dashboard/team", icon: UserCircle },
        { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
        { name: "Wallet", href: "/dashboard/wallet", icon: Wallet, featureKey: "wallet" },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-72"}
      `}
    >
      {/* ✅ Glass background */}
      <div className="absolute inset-0 bg-[#0a0e27]/80 backdrop-blur-2xl border-r border-white/[0.08]" />

      {/* Inner gradient accent */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 0% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative flex flex-col h-full">

        {/* ✅ TOP: Logo + collapse */}
        <div className={`flex items-center h-16 px-4 border-b border-white/[0.06]
          ${collapsed ? "justify-center" : "justify-between"}
        `}>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 group"
            onMouseEnter={() => prefetchRouteChunk("/dashboard")}
          >
            <img
              src={logo}
              alt="WabMeta"
              className={`object-contain transition-all duration-300
                ${collapsed ? "w-10 h-10" : "w-10 h-10"}
                group-hover:scale-110
              `}
            />
          </Link>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg
                bg-white/[0.04] border border-white/[0.06]
                hover:bg-white/[0.08] hover:border-white/[0.12]
                text-gray-400 hover:text-white
                transition-all duration-300"
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
              text-gray-400 hover:text-white
              transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* ✅ USER GREETING CARD */}
        {!collapsed && (
          <div className="mx-3 mt-4 p-3 rounded-2xl
            bg-white/[0.04] backdrop-blur-xl
            border border-white/[0.08]
            relative overflow-hidden group hover:bg-white/[0.06] transition-all duration-300">

            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)',
              }}
            />

            <div className="relative flex items-center gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-green-500/30 rounded-xl blur-md" />
                <div className="relative w-11 h-11 rounded-xl
                  bg-gradient-to-br from-green-500 to-emerald-600
                  flex items-center justify-center text-white font-bold text-sm
                  border border-green-400/30">
                  {initial}
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full
                  bg-green-400 border-2 border-[#0a0e27]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                    {greeting}
                  </span>
                  <span className="text-xs">👋</span>
                </div>
                <p className="text-sm font-semibold text-white truncate">
                  {firstName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ NAVIGATION */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          {navigation.map((group, groupIndex) => (
            <div key={group.title} className={groupIndex > 0 ? "mt-5" : "mt-2"}>
              {!collapsed && (
                <div className="flex items-center justify-between px-3 mb-2">
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray-500">
                    {group.title}
                  </h3>
                  <span className="text-[10px] font-mono text-gray-600">
                    {String(group.count).padStart(2, '0')}
                  </span>
                </div>
              )}

              {collapsed && groupIndex > 0 && (
                <div className="mx-3 my-3 h-px bg-white/[0.05]" />
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const isLocked = !!(item.featureKey && !hasAccess(item.featureKey));

                  return (
                    <div
                      key={item.name}
                      className="relative group/item"
                      onMouseEnter={() => {
                        setHoveredItem(item.name);
                        if (!isLocked) prefetchRouteChunk(item.href);
                      }}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link
                        to={isLocked ? "#" : item.href}
                        aria-disabled={isLocked}
                        onClick={(e) => { if (isLocked) e.preventDefault(); }}
                        className={`relative flex items-center px-3 py-2.5 rounded-xl
                          transition-all duration-300 overflow-hidden
                          ${active
                            ? "text-white"
                            : "text-gray-400 hover:text-white"
                          }
                          ${collapsed ? "justify-center" : ""}
                          ${isLocked ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                      >
                        {/* Active background - glass green */}
                        {active && (
                          <>
                            <div className="absolute inset-0 rounded-xl
                              bg-gradient-to-r from-green-500/20 to-emerald-500/10
                              border border-green-400/30" />
                            <div className="absolute inset-0 rounded-xl"
                              style={{
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)',
                              }}
                            />
                            {/* Left active bar */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-green-400"
                              style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)' }}
                            />
                          </>
                        )}

                        {/* Hover background */}
                        {!active && (
                          <div className="absolute inset-0 rounded-xl
                            bg-white/[0.04] opacity-0 group-hover/item:opacity-100
                            transition-opacity duration-300" />
                        )}

                        <item.icon
                          className={`relative w-4.5 h-4.5 flex-shrink-0 transition-all duration-300
                            ${active ? "text-green-400" : "text-gray-500 group-hover/item:text-white"}
                          `}
                        />

                        {!collapsed && (
                          <>
                            <span className="relative ml-3 text-sm font-medium">
                              {item.name}
                            </span>

                            <div className="relative ml-auto flex items-center gap-2">
                              {isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-gray-500" />
                              ) : item.badge ? (
                                <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full
                                  ${item.badgeColor 
                                    ? `${item.badgeColor} text-white` 
                                    : 'bg-white/[0.08] border border-white/[0.1] text-gray-300'
                                  }
                                `}>
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
                                    ? "text-green-400 bg-white/[0.04] font-medium"
                                    : "text-gray-500 hover:text-white hover:bg-white/[0.04]"
                                  }
                                `}
                              >
                                {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* Collapsed Tooltip */}
                      {collapsed && hoveredItem === item.name && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2
                          bg-[#0a0e27]/95 backdrop-blur-xl
                          border border-white/[0.12]
                          text-white text-xs font-medium rounded-lg whitespace-nowrap z-50
                          shadow-xl">
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {isLocked && <Lock className="w-3 h-3 text-gray-400" />}
                          </div>
                          {isLocked && (
                            <span className="block text-[10px] text-gray-400 mt-1 font-normal">
                              Upgrade to unlock
                            </span>
                          )}
                          {!isLocked && item.badge && (
                            <span className={`ml-2 px-1.5 py-0.5 text-[10px] rounded-full
                              ${item.badgeColor || 'bg-white/[0.1]'} text-white
                            `}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ✅ CREATE NEW CTA - prominent */}
          {!collapsed && (
            <div className="mt-6 mx-1">
              <Link
                to="/dashboard/campaigns/create"
                onMouseEnter={() => prefetchRouteChunk("/dashboard/campaigns")}
                className="group/cta relative flex items-center justify-center gap-2
                  w-full py-3 px-4 rounded-xl
                  bg-gradient-to-r from-green-500 to-emerald-500
                  text-white text-sm font-semibold
                  shadow-[0_8px_24px_rgba(16,185,129,0.35)]
                  hover:shadow-[0_12px_32px_rgba(16,185,129,0.5)]
                  hover:-translate-y-0.5
                  transition-all duration-500
                  border border-green-400/30
                  overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent
                  -translate-x-full group-hover/cta:translate-x-full transition-transform duration-1000" />
                <Plus className="relative w-4 h-4" />
                <span className="relative">New campaign</span>
              </Link>
            </div>
          )}

          {collapsed && (
            <div className="mt-6">
              <Link
                to="/dashboard/campaigns/create"
                className="relative mx-auto flex items-center justify-center
                  w-11 h-11 rounded-xl
                  bg-gradient-to-br from-green-500 to-emerald-600
                  text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)]
                  hover:scale-110 transition-all duration-300
                  border border-green-400/30"
                onMouseEnter={() => setHoveredItem("create")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Plus className="w-5 h-5" />
              </Link>
              {hoveredItem === "create" && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2
                  bg-[#0a0e27]/95 backdrop-blur-xl border border-white/[0.12]
                  text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-xl">
                  New campaign
                </div>
              )}
            </div>
          )}
        </nav>

        {/* ✅ BOTTOM SECTION */}
        <div className="p-3 border-t border-white/[0.06] space-y-1">

          {/* Help */}
          <div className="relative"
            onMouseEnter={() => collapsed && setHoveredItem("help")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              to="/dashboard/help"
              onMouseEnter={() => prefetchRouteChunk("/dashboard/help")}
              className={`flex items-center px-3 py-2.5 rounded-xl
                text-gray-400 hover:text-white hover:bg-white/[0.04]
                transition-all duration-300
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <HelpCircle className="w-4.5 h-4.5" />
              {!collapsed && <span className="ml-3 text-sm font-medium">Help & Support</span>}
            </Link>

            {collapsed && hoveredItem === "help" && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2
                bg-[#0a0e27]/95 backdrop-blur-xl border border-white/[0.12]
                text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-xl">
                Help & Support
              </div>
            )}
          </div>

          {/* Logout */}
          <div className="relative"
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
              <LogOut className="w-4.5 h-4.5" />
              {!collapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
            </button>

            {collapsed && hoveredItem === "logout" && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2
                bg-[#0a0e27]/95 backdrop-blur-xl border border-white/[0.12]
                text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-xl">
                Logout
              </div>
            )}
          </div>

          {/* User Card */}
          {!collapsed && email && (
            <div className="mt-3 p-2.5 rounded-xl
              bg-white/[0.03] backdrop-blur-xl
              border border-white/[0.06]
              hover:bg-white/[0.05] transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg
                  bg-gradient-to-br from-green-500 to-emerald-600
                  flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                  <p className="text-[10px] text-gray-500 truncate font-mono">{email}</p>
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