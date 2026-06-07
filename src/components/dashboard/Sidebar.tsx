import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Send, FileText, Inbox,
  Bot, BarChart3, Settings, HelpCircle,
  ChevronLeft, ChevronRight, LogOut, Zap,
  CreditCard, Wallet, Sparkles, Lock,
  MessageSquare, Instagram, MessageCircle,
  Image, BookOpen, TrendingUp, Megaphone,
  ChevronDown,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Logo from '../common/Logo';
import { useApp } from '../../context/AppContext';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

type Channel = 'whatsapp' | 'instagram';

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
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const prefetched = new Set<string>();
const prefetchRouteChunk = (href: string) => {
  if (prefetched.has(href)) return;
  prefetched.add(href);
  const map: Record<string, () => Promise<any>> = {
    '/dashboard':            () => import('../../pages/Dashboard'),
    '/dashboard/inbox':      () => import('../../pages/Inbox'),
    '/dashboard/contacts':   () => import('../../pages/Contacts'),
    '/dashboard/templates':  () => import('../../pages/Templates'),
    '/dashboard/campaigns':  () => import('../../pages/Campaigns'),
    '/dashboard/wallet':     () => import('../../pages/Wallet'),
    '/dashboard/settings':   () => import('../../pages/Settings'),
    '/dashboard/reports':    () => import('../../pages/Reports'),
    '/dashboard/chatbots':   () => import('../../pages/ChatbotList'),
    '/dashboard/automations':() => import('../../pages/Automation'),
    '/dashboard/crm':        () => import('../../pages/CRM'),
  };
  map[href]?.();
};

const getDisplayName = (u: User | null): string => {
  if (!u) return 'Guest';
  const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  if (full) return full;
  return (u as any).name?.trim() || u.email?.trim() || 'User';
};

// ─── Navigation Config ────────────────────────────────────────────────────────

const getWhatsAppNav = (unreadCount: number, totalContacts: number): NavGroup[] => [
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
        badgeColor: 'bg-blue-500',
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
      { name: 'Campaigns',   href: '/dashboard/campaigns',   icon: Send,     featureKey: 'campaigns' },
      { name: 'Templates',   href: '/dashboard/templates',   icon: FileText },
      { name: 'Chatbots',    href: '/dashboard/chatbots',    icon: Bot,      featureKey: 'chatbot' },
      { name: 'Automations', href: '/dashboard/automations', icon: Zap,      featureKey: 'automation' },
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
      { name: 'Wallet',  href: '/dashboard/wallet',  icon: Wallet, featureKey: 'wallet' },
      { name: 'Settings',href: '/dashboard/settings', icon: Settings },
    ],
  },
];

const getInstagramNav = (): NavGroup[] => [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/instagram/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { name: 'DM Automation',      href: '/instagram/dm-automation', icon: MessageCircle },
      { name: 'Comment Automation', href: '/instagram/comments',      icon: MessageSquare },
      { name: 'Story Automation',   href: '/instagram/stories',       icon: BookOpen },
    ],
  },
  {
    title: 'Content',
    items: [
      { name: 'Post Management', href: '/instagram/posts',      icon: Image,    comingSoon: true },
      { name: 'Campaigns',       href: '/instagram/campaigns',  icon: Megaphone,comingSoon: true },
    ],
  },
  {
    title: 'Growth',
    items: [
      { name: 'Lead Generation', href: '/instagram/leads',     icon: Users,       comingSoon: true },
      { name: 'Analytics',       href: '/instagram/analytics', icon: TrendingUp,  comingSoon: true },
    ],
  },
  {
    title: 'Settings',
    items: [
      { name: 'IG Settings', href: '/instagram/settings', icon: Settings },
    ],
  },
];

// ─── Channel Switcher ─────────────────────────────────────────────────────────

interface ChannelSwitcherProps {
  active: Channel;
  onSwitch: (ch: Channel) => void;
  collapsed: boolean;
}

const CHANNELS = [
  {
    id: 'whatsapp' as Channel,
    label: 'WhatsApp',
    icon: FaWhatsapp,
    color: '#25D366',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    id: 'instagram' as Channel,
    label: 'Instagram',
    icon: Instagram,
    color: '#e1306c',
    bg: '#fff0f5',
    border: '#fecdd3',
    badge: 'Beta',
  },
];

const ChannelSwitcher: React.FC<ChannelSwitcherProps> = ({ active, onSwitch, collapsed }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const current = CHANNELS.find(c => c.id === active)!;

  const handleSwitch = (ch: typeof CHANNELS[0]) => {
    onSwitch(ch.id);
    setOpen(false);
    navigate(ch.id === 'instagram' ? '/instagram/dashboard' : '/dashboard');
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1.5 px-2 mt-3">
        {CHANNELS.map(ch => {
          const isActive = ch.id === active;
          return (
            <button
              key={ch.id}
              onClick={() => handleSwitch(ch)}
              title={ch.label}
              className="w-10 h-10 rounded-xl flex items-center justify-center
                transition-all duration-200"
              style={{
                background: isActive ? ch.bg : 'transparent',
                border: `1px solid ${isActive ? ch.border : '#e5e7eb'}`,
              }}
            >
              <ch.icon
                className="w-4 h-4"
                style={{ color: isActive ? ch.color : '#9ca3af' }}
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
          bg-gray-50 border border-gray-200
          hover:bg-gray-100 hover:border-gray-300
          transition-all duration-200"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: current.bg, border: `1px solid ${current.border}` }}
        >
          <current.icon className="w-4 h-4" style={{ color: current.color }} />
        </div>

        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {current.label}
          </p>
          <p className="text-xs text-gray-400">Active channel</p>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200
            ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden
          bg-white border border-gray-200 shadow-lg z-50">
          {CHANNELS.map(ch => {
            const isActive = ch.id === active;
            return (
              <button
                key={ch.id}
                onClick={() => handleSwitch(ch)}
                className={`w-full flex items-center gap-3 px-3 py-2.5
                  transition-colors
                  ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: ch.bg, border: `1px solid ${ch.border}` }}
                >
                  <ch.icon className="w-4 h-4" style={{ color: ch.color }} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{ch.label}</p>
                    {ch.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold
                        bg-pink-50 text-pink-600 border border-pink-200">
                        {ch.badge}
                      </span>
                    )}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: ch.color }} />
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

  const [activeChannel, setActiveChannel] = useState<Channel>(() =>
    location.pathname.startsWith('/instagram') ? 'instagram' : 'whatsapp'
  );

  useEffect(() => {
    setActiveChannel(
      location.pathname.startsWith('/instagram') ? 'instagram' : 'whatsapp'
    );
  }, [location.pathname]);

  const [user] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem('wabmeta_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const displayName = getDisplayName(user);
  const initial = (displayName.charAt(0) || 'G').toUpperCase();
  const email = user?.email || '';

  const navigation = activeChannel === 'instagram'
    ? getInstagramNav()
    : getWhatsAppNav(unreadCount, totalContacts);

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/instagram/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // Active colors per channel
  const active = activeChannel === 'instagram'
    ? { bg: '#fff0f5', border: '#fecdd3', text: '#e1306c', bar: '#e1306c' }
    : { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', bar: '#25D366' };

  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 h-screen
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-white border-r border-gray-200" />

      <div className="relative flex flex-col h-full">

        {/* ── Header ── */}
        <div className={`
          flex items-center h-16 px-4
          border-b border-gray-100
          ${collapsed ? 'justify-center' : 'justify-between'}
        `}>
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <Logo
              variant={collapsed ? 'icon' : 'full'}
              theme="light"
            />
          </Link>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-gray-400
                hover:text-gray-600 hover:bg-gray-100
                transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapse expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-3 p-1.5 rounded-lg text-gray-400
              hover:text-gray-600 hover:bg-gray-100
              transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* ── Channel Switcher ── */}
        <ChannelSwitcher
          active={activeChannel}
          onSwitch={setActiveChannel}
          collapsed={collapsed}
        />

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          {navigation.map((group, gi) => (
            <div key={group.title} className={gi > 0 ? 'mt-6' : 'mt-2'}>
              {/* Group title */}
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase
                  tracking-widest text-gray-400">
                  {group.title}
                </p>
              )}

              {/* Divider when collapsed */}
              {collapsed && gi > 0 && (
                <div className="mx-3 my-3 h-px bg-gray-100" />
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
                        if (!isLocked && !isSoon) prefetchRouteChunk(item.href);
                      }}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link
                        to={isLocked || isSoon ? '#' : item.href}
                        onClick={e => { if (isLocked || isSoon) e.preventDefault(); }}
                        className={`
                          relative flex items-center px-3 py-2.5 rounded-xl
                          transition-all duration-200
                          ${collapsed ? 'justify-center' : ''}
                          ${isLocked || isSoon ? 'opacity-40 cursor-not-allowed' : ''}
                          ${itemActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                        `}
                        style={itemActive ? {
                          background: active.bg,
                          border: `1px solid ${active.border}`,
                        } : {}}
                      >
                        {/* Left bar indicator */}
                        {itemActive && (
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2
                              w-0.5 h-5 rounded-r-full"
                            style={{ background: active.bar }}
                          />
                        )}

                        {/* Icon */}
                        <item.icon
                          className="w-4 h-4 flex-shrink-0"
                          style={itemActive ? { color: active.text } : {}}
                        />

                        {/* Label + badges */}
                        {!collapsed && (
                          <>
                            <span className="ml-3 text-sm font-medium flex-1">
                              {item.name}
                            </span>
                            <div className="ml-auto flex items-center gap-1.5">
                              {isSoon ? (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold
                                  rounded-full bg-indigo-50 text-indigo-500 border border-indigo-200">
                                  Soon
                                </span>
                              ) : isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-gray-400" />
                              ) : item.badge ? (
                                <span className={`px-1.5 py-0.5 text-[10px]
                                  font-bold rounded-full text-white
                                  ${item.badgeColor || 'bg-gray-400'}`}>
                                  {item.badge}
                                </span>
                              ) : null}
                            </div>
                          </>
                        )}
                      </Link>

                      {/* Sub items */}
                      {!collapsed && item.subItems && itemActive && (
                        <div className="ml-7 mt-1 space-y-0.5 pl-3
                          border-l-2 border-gray-100">
                          {item.subItems.map(sub => {
                            const subActive = location.pathname === sub.href;
                            return (
                              <Link
                                key={sub.name}
                                to={sub.href}
                                className={`block px-3 py-1.5 text-xs rounded-lg
                                  transition-colors
                                  ${subActive
                                    ? 'font-semibold'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                  }`}
                                style={subActive ? { color: active.text } : {}}
                              >
                                {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* Collapsed tooltip */}
                      {collapsed && hoveredItem === item.name && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3
                          px-3 py-2 bg-gray-900 text-white text-xs font-medium
                          rounded-lg whitespace-nowrap z-50 shadow-lg
                          pointer-events-none">
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {isSoon && <span className="text-indigo-300 text-[9px]">Soon</span>}
                            {isLocked && <Lock className="w-3.5 h-3.5 text-gray-300" />}
                          </div>
                          {/* Arrow */}
                          <div className="absolute right-full top-1/2 -translate-y-1/2
                            border-4 border-transparent border-r-gray-900" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="p-3 border-t border-gray-100 space-y-0.5">

          {/* Help */}
          <div
            onMouseEnter={() => collapsed && setHoveredItem('help')}
            onMouseLeave={() => setHoveredItem(null)}
            className="relative"
          >
            <Link
              to="/dashboard/help"
              className={`flex items-center px-3 py-2.5 rounded-xl
                text-gray-500 hover:text-gray-900 hover:bg-gray-50
                transition-all duration-200
                ${collapsed ? 'justify-center' : ''}`}
            >
              <HelpCircle className="w-4 h-4" />
              {!collapsed && (
                <span className="ml-3 text-sm font-medium">Help & Support</span>
              )}
            </Link>
            {collapsed && hoveredItem === 'help' && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3
                px-3 py-2 bg-gray-900 text-white text-xs font-medium
                rounded-lg whitespace-nowrap z-50 shadow-lg pointer-events-none">
                Help & Support
                <div className="absolute right-full top-1/2 -translate-y-1/2
                  border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </div>

          {/* Logout */}
          <div
            onMouseEnter={() => collapsed && setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            className="relative"
          >
            <button
              onClick={logout}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl
                text-gray-500 hover:text-red-500 hover:bg-red-50
                transition-all duration-200
                ${collapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && (
                <span className="ml-3 text-sm font-medium">Logout</span>
              )}
            </button>
            {collapsed && hoveredItem === 'logout' && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3
                px-3 py-2 bg-gray-900 text-white text-xs font-medium
                rounded-lg whitespace-nowrap z-50 shadow-lg pointer-events-none">
                Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2
                  border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </div>

          {/* User Card */}
          {!collapsed && (
            <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex-shrink-0
                  bg-gradient-to-br from-primary-500 to-primary-600
                  flex items-center justify-center
                  text-white font-bold text-xs">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{email}</p>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;