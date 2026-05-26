import React, { useState } from "react";
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
  Lock,
  Wallet,
  ChevronDown,
  GitBranch,
  FileSpreadsheet,
  History,
  Blocks,
  Code,
  Crown,
  Compass,
} from "lucide-react";
import Logo from "../common/Logo";
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
  items: NavItem[];
}

const prefetched = new Set<string>();

const prefetchRouteChunk = (href: string) => {
  if (prefetched.has(href)) return;
  prefetched.add(href);

  switch (href) {
    case "/dashboard":
      import("../../pages/Dashboard");
      break;
    case "/dashboard/inbox":
      import("../../pages/Inbox");
      break;
    case "/dashboard/contacts":
      import("../../pages/Contacts");
      break;
    case "/dashboard/templates":
      import("../../pages/Templates");
      break;
    case "/dashboard/campaigns":
      import("../../pages/Campaigns");
      break;
    case "/dashboard/billing":
      import("../../pages/Billing");
      break;
    case "/dashboard/wallet":
      import("../../pages/Wallet");
      break;
    case "/dashboard/team":
      import("../../pages/Team");
      break;
    case "/dashboard/settings":
      import("../../pages/Settings");
      break;
    case "/dashboard/reports":
      import("../../pages/Reports");
      break;
    case "/dashboard/chatbot":
    case "/dashboard/chatbots":
      import("../../pages/ChatbotList");
      break;
    case "/dashboard/automation":
    case "/dashboard/automations":
      import("../../pages/Automation");
      break;
    case "/dashboard/crm":
      import("../../pages/CRM");
      break;
    case "/dashboard/crm/leads":
      import("../../pages/LeadsList");
      break;
    default:
      break;
  }
};

const getDisplayName = (u: User | null): string => {
  if (!u) return "WabMeta Ads";
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  const legacyName = (u as any).name;
  if (legacyName && legacyName.trim()) return legacyName.trim();
  if (u.email && u.email.trim()) return "WabMeta Ads";
  return "WabMeta Ads";
};

const getEmail = (u: User | null): string => {
  if (!u) return "admin@wabmeta.com";
  if (u.email) return u.email;
  return "admin@wabmeta.com";
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
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const displayName = getDisplayName(user);
  const email = getEmail(user);
  const initial = "W"; // Match the mockup's W

  const handleLogout = async () => {
    await logout();
  };

  const navigation: NavGroup[] = [
    {
      title: "",
      items: [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        {
          name: "Inbox",
          href: "/dashboard/inbox",
          icon: Inbox,
          badge: unreadCount > 0 ? unreadCount : 76,
          badgeColor: "bg-violet-600 text-white",
        },
        {
          name: "Contacts",
          href: "/dashboard/contacts",
          icon: Users,
          badge:
            totalContacts > 0
              ? totalContacts > 1000
                ? `${(totalContacts / 1000).toFixed(1)}k`
                : totalContacts.toLocaleString()
              : "1.3k",
          badgeColor: "bg-slate-700/50 text-slate-300",
        },
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
      title: "AUTOMATION",
      items: [
        { name: "Campaigns", href: "/dashboard/campaigns", icon: Send },
        { name: "Flows", href: "/dashboard/flows", icon: GitBranch },
        { name: "Templates", href: "/dashboard/templates", icon: FileText },
        { name: "Chatbots", href: "/dashboard/chatbots", icon: Bot, featureKey: "chatbot" },
      ],
    },
    {
      title: "ANALYTICS",
      items: [
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "Reports", href: "/dashboard/reports", icon: FileSpreadsheet, featureKey: "reports" },
        { name: "Broadcast Logs", href: "/dashboard/broadcast-logs", icon: History },
      ],
    },
    {
      title: "INTEGRATIONS",
      items: [
        { name: "Integrations", href: "/dashboard/integrations", icon: Blocks },
        { name: "API & Webhooks", href: "/dashboard/api-webhooks", icon: Code },
      ],
    },
    {
      title: "OTHER",
      items: [
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
        { name: "Help & Support", href: "/dashboard/help", icon: HelpCircle },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-[#131924] border-r border-slate-800 transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full text-slate-300">
        {/* Logo Section */}
        <div
          className={`flex items-center h-16 px-4 border-b border-slate-800 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <Link
            to="/dashboard"
            className="flex items-center"
            onMouseEnter={() => prefetchRouteChunk("/dashboard")}
          >
            <Logo variant={collapsed ? "icon" : "full"} theme="dark" />
          </Link>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-4 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Workspace Selector */}
        {!collapsed && (
          <div className="mx-3 my-3 p-2.5 bg-[#1e2638] border border-slate-700/50 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#273046] transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-semibold text-white truncate">WabMeta Workspace</p>
                <span className="inline-flex px-1.5 py-0.5 text-[9px] font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded mt-0.5">
                  Pro Plan
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-3 scrollbar-thin">
          {navigation.map((group, groupIndex) => (
            <div key={group.title || groupIndex} className={groupIndex > 0 ? "mt-5" : ""}>
              {!collapsed && group.title && (
                <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  {group.title}
                </h3>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const isLocked = !!(item.featureKey && !hasAccess(item.featureKey));

                  return (
                    <div
                      key={item.name}
                      className="relative group"
                      onMouseEnter={() => {
                        setHoveredItem(item.name);
                        if (!isLocked) prefetchRouteChunk(item.href);
                      }}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link
                        to={isLocked ? "#" : item.href}
                        aria-disabled={isLocked}
                        onClick={(e) => {
                          if (isLocked) e.preventDefault();
                        }}
                        className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          active
                            ? "bg-violet-600/20 text-violet-300 font-semibold border-l-2 border-violet-500"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                        } ${collapsed ? "justify-center" : ""} ${
                          isLocked ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        <item.icon
                          className={`w-5 h-5 shrink-0 ${
                            active ? "text-violet-400" : "text-slate-400 group-hover:text-white"
                          }`}
                        />

                        {!collapsed && (
                          <>
                            <span className="ml-3 text-sm font-medium">{item.name}</span>

                            {isLocked ? (
                              <Lock className="w-3.5 h-3.5 ml-auto text-slate-500" />
                            ) : item.badge ? (
                              <span
                                className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  item.badgeColor || "bg-slate-850 text-slate-400"
                                }`}
                              >
                                {item.badge}
                              </span>
                            ) : null}
                          </>
                        )}
                      </Link>

                      {/* Sub-items rendering */}
                      {!collapsed && item.subItems && active && (
                        <div className="ml-9 mt-1 space-y-0.5">
                          {item.subItems.map((sub) => {
                            const subActive = location.pathname === sub.href;
                            return (
                              <Link
                                key={sub.name}
                                to={sub.href}
                                className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                  subActive
                                    ? "text-violet-400 font-medium"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                                }`}
                              >
                                {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* Tooltip (Collapsed Sidebar) */}
                      {collapsed && hoveredItem === item.name && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-slate-950 text-white text-sm font-medium rounded-lg whitespace-nowrap z-50 shadow-lg border border-slate-800">
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                          </div>
                          {isLocked && (
                            <span className="block text-xs text-slate-400 mt-1 font-normal">
                              Upgrade to unlock
                            </span>
                          )}
                          {!isLocked && item.badge && (
                            <span
                              className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-violet-600 text-white"
                            >
                              {item.badge}
                            </span>
                          )}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-950" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <div
            className="relative"
            onMouseEnter={() => collapsed && setHoveredItem("help")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              to="/dashboard/help"
              onMouseEnter={() => prefetchRouteChunk("/dashboard/help")}
              className={`flex items-center px-3 py-2.5 text-slate-400 hover:bg-slate-800/60 hover:text-white rounded-xl transition-colors ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <HelpCircle className="w-5 h-5 text-slate-400" />
              {!collapsed && <span className="ml-3 text-sm font-medium">Help & Support</span>}
            </Link>

            {collapsed && hoveredItem === "help" && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-slate-950 text-white text-sm font-medium rounded-lg whitespace-nowrap z-50 shadow-lg border border-slate-800">
                Help & Support
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-950" />
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => collapsed && setHoveredItem("logout")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-3 py-2.5 text-slate-400 hover:bg-red-950/20 hover:text-red-400 rounded-xl transition-colors ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
            </button>

            {collapsed && hoveredItem === "logout" && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-slate-950 text-white text-sm font-medium rounded-lg whitespace-nowrap z-50 shadow-lg border border-slate-800">
                Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-950" />
              </div>
            )}
          </div>

          {/* User Card */}
          {!collapsed && (
            <div className="mt-2 p-2 bg-[#1e2638] rounded-xl border border-slate-700/30 hover:bg-[#273046] transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0">
                  <div className="w-9 h-9 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                    {initial}
                  </div>
                  <div className="ml-2.5 flex-1 min-w-0 text-left">
                    <p className="text-xs font-semibold text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{email}</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 text-[8px] font-bold text-indigo-400 bg-indigo-500/10 rounded-md shrink-0">
                  Pro Plan
                </span>
              </div>
            </div>
          )}

          {/* User Avatar - Collapsed */}
          {collapsed && (
            <div
              className="relative mt-2 flex justify-center"
              onMouseEnter={() => setHoveredItem("user")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="w-9 h-9 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all">
                {initial}
              </div>

              {hoveredItem === "user" && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-slate-950 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg border border-slate-800">
                  <p className="font-medium">{displayName}</p>
                  <p className="text-slate-400 text-xs">{email}</p>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-950" />
                </div>
              )}
            </div>
          )}

          {/* Upgrade Plan button */}
          {!collapsed && (
            <div className="pt-2">
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all duration-300">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                <span>Upgrade Plan</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;