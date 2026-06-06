import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search, Bell, ChevronDown, Settings, User, LogOut,
  CreditCard, HelpCircle, Command, Instagram, Inbox as InboxIcon,
  MessageSquare, Megaphone, Users, AlertCircle,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotificationsStore } from '../../context/NotificationsContext';
import type { NotificationType } from '../../context/NotificationsContext';
import { timeAgo } from '../../utils/timeAgo';
import ThemeToggle from '../common/ThemeToggle';
import logo from '../../assets/logo.png';

type Channel = 'whatsapp' | 'instagram';

const getNotifIcon = (type: NotificationType) => {
  switch (type) {
    case 'message':  return MessageSquare;
    case 'campaign': return Megaphone;
    case 'team':     return Users;
    case 'billing':  return CreditCard;
    case 'alert':    return AlertCircle;
    case 'whatsapp': return MessageSquare;
    case 'system':   return Settings;
    default:         return Bell;
  }
};

const TopNav: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsStore();

  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChannel, setShowChannel] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<HTMLDivElement>(null);

  const [channel, setChannel] = useState<Channel>(
    location.pathname.startsWith('/instagram') ? 'instagram' : 'whatsapp'
  );

  useEffect(() => {
    setChannel(location.pathname.startsWith('/instagram') ? 'instagram' : 'whatsapp');
  }, [location.pathname]);

  useEffect(() => setAvatarError(false), [user?.avatar]);

  // Outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (channelRef.current && !channelRef.current.contains(e.target as Node)) setShowChannel(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotif(false);
        setShowProfile(false);
        setShowChannel(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const displayName = (() => {
    if (!user) return 'Guest';
    const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    if (full) return full;
    return (user as any).name || user.email || 'User';
  })();

  const initial = displayName.charAt(0).toUpperCase();
  const recentNotifs = notifications.slice(0, 5);

  const channels = [
    { id: 'whatsapp' as Channel,  label: 'WhatsApp',  icon: FaWhatsapp, color: '#25D366', href: '/dashboard' },
    { id: 'instagram' as Channel, label: 'Instagram', icon: Instagram,  color: '#E1306C', href: '/instagram/dashboard' },
  ];
  const activeChannel = channels.find(c => c.id === channel)!;

  return (
    <header className="fixed top-4 left-20 right-4 lg:left-24 lg:right-6 z-30">
      <nav
        className="
          flex items-center gap-2 px-3 py-2
          bg-white/80 dark:bg-[#1A2331]/80
          backdrop-blur-xl
          border border-cream-300 dark:border-[#2A3441]
          rounded-full
          shadow-card
        "
      >
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 pl-2 pr-3">
          <img src={logo} alt="WabMeta" className="h-7 w-auto object-contain" />
        </Link>

        {/* Channel Switcher */}
        <div className="relative" ref={channelRef}>
          <button
            onClick={() => setShowChannel(!showChannel)}
            className="
              flex items-center gap-2 px-3 py-1.5 rounded-full
              bg-cream-100 dark:bg-[#131922]
              border border-cream-300 dark:border-[#2A3441]
              text-ink-900 dark:text-cream-100
              hover:bg-cream-200 dark:hover:bg-[#0F1419]
              transition-all duration-300
            "
          >
            <activeChannel.icon className="w-3.5 h-3.5" style={{ color: activeChannel.color }} />
            <span className="text-xs font-semibold hidden sm:inline">{activeChannel.label}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showChannel ? 'rotate-180' : ''}`} />
          </button>

          {showChannel && (
            <div className="
              absolute top-full left-0 mt-2 w-48
              bg-white dark:bg-[#1A2331]
              border border-cream-300 dark:border-[#2A3441]
              rounded-2xl shadow-float
              overflow-hidden z-50
              animate-scaleIn
            ">
              {channels.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setShowChannel(false);
                    navigate(ch.href);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5
                    text-left transition-colors
                    ${ch.id === channel
                      ? 'bg-cream-100 dark:bg-[#131922]'
                      : 'hover:bg-cream-50 dark:hover:bg-[#131922]'
                    }
                  `}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: `${ch.color}15` }}
                  >
                    <ch.icon className="w-4 h-4" style={{ color: ch.color }} />
                  </div>
                  <span className="text-sm font-medium text-ink-900 dark:text-cream-100">{ch.label}</span>
                  {ch.id === channel && (
                    <span className="ml-auto w-2 h-2 rounded-full" style={{ background: ch.color }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
          <input
            type="text"
            placeholder="Search..."
            className="
              w-48 lg:w-64 pl-9 pr-12 py-2 text-xs
              bg-cream-100 dark:bg-[#131922]
              border border-cream-300 dark:border-[#2A3441]
              rounded-full
              text-ink-900 dark:text-cream-100
              placeholder:text-ink-400
              focus:outline-none focus:border-ocean-500
              transition-all duration-300
            "
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5
            px-1.5 py-0.5 rounded-md
            bg-white dark:bg-[#1A2331]
            border border-cream-300 dark:border-[#2A3441]">
            <Command className="w-2.5 h-2.5 text-ink-400" />
            <span className="text-[9px] font-mono text-ink-400">K</span>
          </div>
        </div>

        {/* Mobile search button */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="md:hidden w-10 h-10 rounded-full flex items-center justify-center
            bg-cream-100 dark:bg-[#131922]
            border border-cream-300 dark:border-[#2A3441]
            text-ink-700 dark:text-cream-100
            hover:bg-cream-200 dark:hover:bg-[#0F1419]"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="
              relative w-10 h-10 rounded-full
              bg-cream-100 dark:bg-[#131922]
              border border-cream-300 dark:border-[#2A3441]
              text-ink-700 dark:text-cream-100
              hover:bg-cream-200 dark:hover:bg-[#0F1419]
              flex items-center justify-center
              transition-all duration-300
            "
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                bg-ocean-500 text-white text-[10px] font-bold rounded-full
                flex items-center justify-center ring-2 ring-white dark:ring-[#1A2331]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="
              absolute right-0 mt-3 w-96
              bg-white dark:bg-[#1A2331]
              border border-cream-300 dark:border-[#2A3441]
              rounded-3xl shadow-float
              overflow-hidden z-50
              animate-scaleIn
            ">
              <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200 dark:border-[#2A3441]">
                <div>
                  <h3 className="font-semibold text-sm text-ink-900 dark:text-cream-100">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-[10px] text-ink-500 mt-0.5">{unreadCount} unread</p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-ocean-500 hover:text-ocean-600 font-medium">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {recentNotifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4">
                    <div className="w-12 h-12 rounded-full bg-cream-100 dark:bg-[#131922] flex items-center justify-center mb-3">
                      <InboxIcon className="w-5 h-5 text-ink-400" />
                    </div>
                    <p className="text-sm text-ink-700 dark:text-cream-100 font-medium">No notifications yet</p>
                    <p className="text-xs text-ink-500 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  recentNotifs.map((n) => {
                    const Icon = getNotifIcon(n.type);
                    const content = (
                      <div
                        onClick={() => { markAsRead(n.id); setShowNotif(false); }}
                        className={`flex items-start gap-3 px-5 py-3 cursor-pointer
                          hover:bg-cream-50 dark:hover:bg-[#131922] transition-colors
                          ${!n.read ? 'bg-ocean-50/50 dark:bg-ocean-900/10' : ''}
                        `}
                      >
                        <div className="w-9 h-9 rounded-full bg-cream-100 dark:bg-[#131922] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-ocean-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-900 dark:text-cream-100 truncate">{n.title}</p>
                          <p className="text-xs text-ink-500 line-clamp-2 mt-0.5">{n.description}</p>
                          <p className="text-[10px] text-ink-400 mt-1 font-mono">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 bg-ocean-500 rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                    );
                    return n.actionUrl ? (
                      <Link key={n.id} to={n.actionUrl} className="block">{content}</Link>
                    ) : (
                      <div key={n.id}>{content}</div>
                    );
                  })
                )}
              </div>

              <div className="px-5 py-3 border-t border-cream-200 dark:border-[#2A3441]">
                <Link
                  to="/dashboard/notifications"
                  onClick={() => setShowNotif(false)}
                  className="block text-center text-xs text-ocean-500 hover:text-ocean-600 font-medium"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="
              flex items-center gap-2 pl-1 pr-3 py-1 rounded-full
              bg-cream-100 dark:bg-[#131922]
              border border-cream-300 dark:border-[#2A3441]
              hover:bg-cream-200 dark:hover:bg-[#0F1419]
              transition-all duration-300
            "
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              {user?.avatar && !avatarError ? (
                <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center text-white font-bold text-xs">
                  {initial}
                </div>
              )}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-ink-900 dark:text-cream-100">{displayName.split(' ')[0]}</span>
          </button>

          {showProfile && (
            <div className="
              absolute right-0 mt-3 w-56
              bg-white dark:bg-[#1A2331]
              border border-cream-300 dark:border-[#2A3441]
              rounded-2xl shadow-float
              overflow-hidden z-50
              animate-scaleIn
            ">
              <div className="px-4 py-3 border-b border-cream-200 dark:border-[#2A3441]">
                <p className="text-sm font-semibold text-ink-900 dark:text-cream-100 truncate">{displayName}</p>
                <p className="text-xs text-ink-500 truncate font-mono">{user?.email}</p>
              </div>

              <div className="py-1">
                {[
                  { icon: User, label: 'My Profile', href: '/dashboard/profile' },
                  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
                  { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
                  { icon: HelpCircle, label: 'Help & Support', href: '/dashboard/help' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-2.5
                      text-ink-700 dark:text-cream-100
                      hover:bg-cream-50 dark:hover:bg-[#131922]
                      transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-ink-500" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t border-cream-200 dark:border-[#2A3441] py-1">
                <button
                  onClick={async () => { setShowProfile(false); await logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5
                    text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10
                    transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile search */}
      {showSearch && (
        <div className="md:hidden mt-2 px-2 animate-fadeIn">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 text-sm
                bg-white dark:bg-[#1A2331]
                border border-cream-300 dark:border-[#2A3441]
                rounded-full
                text-ink-900 dark:text-cream-100
                placeholder:text-ink-400
                focus:outline-none focus:border-ocean-500"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNav;
