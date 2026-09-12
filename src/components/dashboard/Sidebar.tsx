import React, { useState, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Send, FileText, Inbox,
  Bot, BarChart3, Settings, HelpCircle,
  ChevronLeft, ChevronRight, LogOut, Zap,
  CreditCard, Wallet, Sparkles, Lock, Instagram,
} from 'lucide-react';
import logo from '../../assets/logo.png';
import { useApp } from '../../context/AppContext';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import { useAuth } from '../../context/AuthContext';

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
  setCollapsed: (v: boolean) => void;
  isMobile?: boolean;
}

const prefetched = new Set<string>();
const prefetchRouteChunk = (href: string) => {
  if (prefetched.has(href)) return;
  prefetched.add(href);
  const map: Record<string, () => Promise<any>> = {
    '/dashboard': () => import('../../pages/Dashboard'),
    '/dashboard/inbox': () => import('../../pages/Inbox'),
    '/dashboard/contacts': () => import('../../pages/Contacts'),
    '/dashboard/templates': () => import('../../pages/Templates'),
    '/dashboard/campaigns': () => import('../../pages/Campaigns'),
    '/dashboard/wallet': () => import('../../pages/Wallet'),
    '/dashboard/settings': () => import('../../pages/Settings'),
    '/dashboard/reports': () => import('../../pages/Reports'),
    '/dashboard/chatbots': () => import('../../pages/ChatbotList'),
    '/dashboard/automations': () => import('../../pages/Automation'),
    '/dashboard/ai-agent': () => import('../../pages/AiAgent'),
    '/dashboard/crm': () => import('../../pages/CRM'),
    '/dashboard/telegram': () => import('../../pages/telegram/TelegramDashboard'),
  };
  map[href]?.();
};

const getDisplayName = (u: { firstName?: string; lastName?: string; email?: string } | null): string => {
  if (!u) return 'Guest';
  const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  if (full) return full;
  return u.firstName || u.email?.split('@')[0] || 'User';
};

// One unified sidebar for every channel. Instagram and Telegram live under
// "Channels"; Instagram expands to its sub-pages when it is the active section.
const getNav = (unreadCount: number, totalContacts: number): NavGroup[] => [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      {
        name: 'Inbox',
        href: '/dashboard/inbox',
        icon: Inbox,
        featureKey: 'inbox',
        badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
        badgeColor: 'bg-red-500',
      },
      {
        name: 'Contacts',
        href: '/dashboard/contacts',
        icon: Users,
        badge: totalContacts > 0
          ? totalContacts > 1000 ? `${(totalContacts / 1000).toFixed(1)}k` : totalContacts
          : undefined,
        badgeColor: 'bg-emerald-500',
      },
    ],
  },
  {
    title: 'CRM',
    items: [
      {
        name: 'CRM',
        href: '/dashboard/crm',
        icon: Users,
        subItems: [
          { name: 'Overview', href: '/dashboard/crm' },
          { name: 'Leads', href: '/dashboard/crm/leads' },
        ],
      },
    ],
  },
  {
    title: 'Messaging',
    items: [
      { name: 'Campaigns', href: '/dashboard/campaigns', icon: Send, featureKey: 'campaigns' },
      { name: 'Templates', href: '/dashboard/templates', icon: FileText },
      { name: 'Chatbots', href: '/dashboard/chatbots', icon: Bot, featureKey: 'chatbot' },
      { name: 'Automations', href: '/dashboard/automations', icon: Zap, featureKey: 'automation' },
      // Backend AI agent routes par featureLock('chatbot') hai - wahi lock yahan
      {
        name: 'AI Agent',
        href: '/dashboard/ai-agent',
        icon: Sparkles,
        featureKey: 'chatbot',
        badge: 'New',
        badgeColor: 'bg-violet-500',
      },
    ],
  },
  {
    title: 'Channels',
    items: [
      {
        name: 'Instagram',
        href: '/instagram',
        icon: Instagram,
        badge: 'Beta',
        badgeColor: 'bg-pink-500',
        subItems: [
          { name: 'Dashboard', href: '/instagram/dashboard' },
          { name: 'Posts & Stories', href: '/instagram/content' },
          { name: 'DM Automation', href: '/instagram/dm-automation' },
          { name: 'Comment Automation', href: '/instagram/comments' },
          { name: 'Story Automation', href: '/instagram/stories' },
          { name: 'Settings', href: '/instagram/settings' },
        ],
      },
      {
        name: 'Telegram',
        href: '/dashboard/telegram',
        icon: Send,
        badge: 'Beta',
        badgeColor: 'bg-sky-500',
        subItems: [
          { name: 'Dashboard', href: '/dashboard/telegram' },
          { name: 'Bots', href: '/dashboard/telegram/bots' },
          { name: 'Auto-replies', href: '/dashboard/telegram/automation' },
          { name: 'Broadcast', href: '/dashboard/telegram/broadcast' },
          { name: 'Settings', href: '/dashboard/telegram/settings' },
        ],
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, featureKey: 'reports' },
    ],
  },
  {
    title: 'Account',
    items: [
      { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet, featureKey: 'wallet' },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

const ACTIVE_THEME = { bg: '#f0fdf4', border: '#bbf7d0', text: '#1b8b4b', bar: '#1b8b4b' };

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, isMobile = false }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const { unreadCount, totalContacts } = useApp();
  const { hasAccess } = usePlanAccess();
  const { user, logout } = useAuth();

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const initial = useMemo(() => (displayName.charAt(0) || 'G').toUpperCase(), [displayName]);
  const email = user?.email || '';

  const navigation = useMemo(
    () => getNav(unreadCount, totalContacts),
    [unreadCount, totalContacts]
  );

  const isActive = (href: string) => {
    // Exact for the two section homes; prefix-match everywhere else so a section
    // stays highlighted (and its sub-items expand) across its child pages.
    if (href === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(href);
  };

  return (
    <aside className={`relative z-40 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${collapsed && !isMobile ? 'w-20' : 'w-64'}`}>

      {/* Header */}
      <div className={`flex items-center h-16 px-4 border-b border-gray-100 ${collapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <img
            src={logo}
            alt="WabMeta"
            className={`object-contain transition-all duration-300 group-hover:scale-105 ${collapsed && !isMobile ? 'w-8 h-8' : 'h-7 w-auto'}`}
          />
        </Link>

        {!collapsed && !isMobile && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && !isMobile && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {navigation.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {group.title}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.map(item => {
                const itemActive = isActive(item.href);
                const isLocked = !!(item.featureKey && !hasAccess(item.featureKey));
                const isSoon = !!item.comingSoon;

                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => {
                      setHoveredItem(item.name);
                      if (!isLocked && !isSoon) {
                        hoverTimer.current = setTimeout(() => {
                          prefetchRouteChunk(item.href);
                        }, 80);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredItem(null);
                      if (hoverTimer.current) {
                        clearTimeout(hoverTimer.current);
                        hoverTimer.current = null;
                      }
                    }}
                  >
                    <Link
                      to={isLocked || isSoon ? '#' : item.href}
                      onClick={e => { if (isLocked || isSoon) e.preventDefault(); }}
                      className={`
                        relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200
                        ${collapsed && !isMobile ? 'justify-center' : ''}
                        ${isLocked || isSoon ? 'opacity-40 cursor-not-allowed' : ''}
                        ${itemActive ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                      `}
                      style={itemActive ? {
                        background: ACTIVE_THEME.bg,
                        border: `1px solid ${ACTIVE_THEME.border}`,
                      } : {}}
                    >
                      {itemActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                          style={{ background: ACTIVE_THEME.bar }}
                        />
                      )}

                      <item.icon
                        className="w-4 h-4 flex-shrink-0"
                        style={itemActive ? { color: ACTIVE_THEME.text } : {}}
                      />

                      {(!collapsed || isMobile) && (
                        <>
                          <span className="ml-3 text-sm font-medium flex-1 truncate">
                            {item.name}
                          </span>
                          <div className="ml-auto flex items-center gap-1.5">
                            {isSoon ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-indigo-50 text-indigo-500 border border-indigo-200">Soon</span>
                            ) : isLocked ? (
                              <Lock className="w-3.5 h-3.5 text-gray-400" />
                            ) : item.badge ? (
                              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white ${item.badgeColor || 'bg-gray-400'}`}>
                                {item.badge}
                              </span>
                            ) : null}
                          </div>
                        </>
                      )}
                    </Link>

                    {(!collapsed || isMobile) && item.subItems && itemActive && (
                      <div className="ml-7 mt-1 space-y-0.5 pl-3 border-l-2 border-gray-100">
                        {item.subItems.map(sub => {
                          const subActive = location.pathname === sub.href;
                          return (
                            <Link
                              key={sub.name}
                              to={sub.href}
                              className={`block px-3 py-1.5 text-xs rounded-lg transition-colors ${subActive ? 'font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                              style={subActive ? { color: ACTIVE_THEME.text } : {}}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {collapsed && !isMobile && hoveredItem === item.name && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-lg pointer-events-none">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {isSoon && <span className="text-indigo-300 text-[9px]">Soon</span>}
                          {isLocked && <Lock className="w-3.5 h-3.5 text-gray-300" />}
                        </div>
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 space-y-0.5">
        <div onMouseEnter={() => collapsed && !isMobile && setHoveredItem('help')} onMouseLeave={() => setHoveredItem(null)} className="relative">
          <Link to="/dashboard/help" className={`flex items-center px-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
            <HelpCircle className="w-4 h-4" />
            {(!collapsed || isMobile) && <span className="ml-3 text-sm font-medium">Help & Support</span>}
          </Link>
          {collapsed && !isMobile && hoveredItem === 'help' && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-lg pointer-events-none">
              Help & Support
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          )}
        </div>

        <div onMouseEnter={() => collapsed && !isMobile && setHoveredItem('logout')} onMouseLeave={() => setHoveredItem(null)} className="relative">
          <button onClick={logout} className={`w-full flex items-center px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
            <LogOut className="w-4 h-4" />
            {(!collapsed || isMobile) && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
          {collapsed && !isMobile && hoveredItem === 'logout' && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-lg pointer-events-none">
              Logout
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          )}
        </div>

        {(!collapsed || isMobile) && (
          <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">{email}</p>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
