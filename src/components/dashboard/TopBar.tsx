// src/components/dashboard/TopBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  Settings,
  User,
  LogOut,
  Menu,
  Command,
  CreditCard,
  HelpCircle,
  MessageSquare,
  Megaphone,
  Users,
  AlertCircle,
  Inbox as InboxIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotificationsStore } from '../../context/NotificationsContext';
import type { NotificationType } from '../../context/NotificationsContext';
import { timeAgo } from '../../utils/timeAgo';

interface TopBarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

// ─── Notification icon mapper ────────────────────────────────────────────────
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

const getNotifColor = (type: NotificationType) => {
  switch (type) {
    case 'message':  return 'bg-blue-500/20 border-blue-400/30 text-blue-300';
    case 'campaign': return 'bg-purple-500/20 border-purple-400/30 text-purple-300';
    case 'team':     return 'bg-green-500/20 border-green-400/30 text-green-300';
    case 'billing':  return 'bg-orange-500/20 border-orange-400/30 text-orange-300';
    case 'alert':    return 'bg-red-500/20 border-red-400/30 text-red-300';
    case 'whatsapp': return 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300';
    case 'system':   return 'bg-[#050816]0/20 border-gray-400/30 text-gray-300';
    default:         return 'bg-blue-500/20 border-blue-400/30 text-blue-300';
  }
};

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationsStore();

  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  const handleLogout = async () => {
    setShowProfile(false);
    await logout();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setShowSearch(true);
      }
      if (event.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowProfile(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ✅ Show only last 5 in dropdown
  const recentNotifications = notifications.slice(0, 5);

  // Display name
  const displayName = (() => {
    if (!user) return 'Guest';
    const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    if (full) return full;
    return (user as any).name || user.email || 'User';
  })();

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header
      className={`fixed top-0 right-0 z-30 transition-all duration-300
        ${sidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-72'}
      `}
    >
      <div className="absolute inset-0 bg-[#0a0e27]/70 backdrop-blur-2xl border-b border-white/[0.06]" />

      <div className="relative flex items-center justify-between h-16 px-4 lg:px-6">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg
              bg-[#0a0e27]/[0.04] border border-white/[0.06]
              hover:bg-[#0a0e27]/[0.08]
              text-gray-400 hover:text-white
              transition-all duration-300"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-green-400 transition-colors" />
              <input
                type="text"
                placeholder="Search contacts, campaigns, templates..."
                className="w-72 lg:w-96 pl-10 pr-20 py-2.5 text-sm
                  bg-[#0a0e27]/[0.04] backdrop-blur-xl
                  border border-white/[0.08]
                  rounded-xl
                  text-white placeholder:text-gray-500
                  focus:outline-none focus:bg-[#0a0e27]/[0.06] focus:border-green-400/30
                  transition-all duration-300"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1
                px-2 py-0.5 rounded-md
                bg-[#0a0e27]/[0.05] border border-white/[0.08]">
                <Command className="w-3 h-3 text-gray-500" />
                <span className="text-[10px] font-mono text-gray-500">K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Mobile Search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 rounded-lg
              bg-[#0a0e27]/[0.04] border border-white/[0.06]
              hover:bg-[#0a0e27]/[0.08]
              text-gray-400 hover:text-white
              transition-all duration-300"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* ✅ NOTIFICATIONS - REAL DATA */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg
                bg-[#0a0e27]/[0.04] border border-white/[0.06]
                hover:bg-[#0a0e27]/[0.08] hover:border-white/[0.12]
                text-gray-400 hover:text-white
                transition-all duration-300"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full
                    ring-2 ring-[#0a0e27] animate-pulse" />
                  {unreadCount > 1 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                      bg-red-500 text-white text-[10px] font-bold rounded-full
                      flex items-center justify-center ring-2 ring-[#0a0e27]">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96
                bg-[#0a0e27]/95 backdrop-blur-2xl
                border border-white/[0.1]
                rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                overflow-hidden z-50
                animate-fadeIn">

                <div className="absolute top-0 left-[15%] right-[15%] h-px 
                  bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                  <div>
                    <h3 className="font-semibold text-white text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {unreadCount} unread
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-green-400 hover:text-green-300 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications list */}
                <div className="max-h-96 overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4">
                      <div className="w-12 h-12 rounded-full bg-[#0a0e27]/[0.04] border border-white/[0.06]
                        flex items-center justify-center mb-3">
                        <InboxIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        You're all caught up!
                      </p>
                    </div>
                  ) : (
                    recentNotifications.map((notification) => {
                      const Icon = getNotifIcon(notification.type);
                      const colorClass = getNotifColor(notification.type);

                      const content = (
                        <div
                          className={`flex items-start gap-3 px-4 py-3
                            hover:bg-[#0a0e27]/[0.04] transition-colors cursor-pointer
                            ${!notification.read ? 'bg-green-500/[0.04]' : ''}
                          `}
                          onClick={() => {
                            markAsRead(notification.id);
                            setShowNotifications(false);
                          }}
                        >
                          <div className={`w-9 h-9 rounded-full border
                            flex items-center justify-center flex-shrink-0
                            ${colorClass}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                              {notification.description}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1 font-mono">
                              {timeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      );

                      return notification.actionUrl ? (
                        <Link
                          key={notification.id}
                          to={notification.actionUrl}
                          className="block"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div key={notification.id}>{content}</div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-white/[0.06]">
                  <Link
                    to="/dashboard/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-xs text-green-400 hover:text-green-300 font-medium"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 rounded-xl
                bg-[#0a0e27]/[0.04] border border-white/[0.06]
                hover:bg-[#0a0e27]/[0.08] hover:border-white/[0.12]
                transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                {user?.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600
                    flex items-center justify-center text-white font-bold text-xs">
                    {initial}
                  </div>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white">{displayName}</p>
                <p className="text-[10px] text-gray-500 capitalize font-mono">
                  {user?.role || 'User'}
                </p>
              </div>
              <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-gray-500 transition-transform 
                ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56
                bg-[#0a0e27]/95 backdrop-blur-2xl
                border border-white/[0.1]
                rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                overflow-hidden z-50
                animate-fadeIn">

                <div className="absolute top-0 left-[15%] right-[15%] h-px 
                  bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold text-white">{displayName}</p>
                  <p className="text-xs text-gray-400 truncate font-mono">{user?.email}</p>
                </div>

                <div className="py-2">
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
                      className="flex items-center gap-3 px-4 py-2
                        text-gray-300 hover:text-white hover:bg-[#0a0e27]/[0.04]
                        transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>

                <div className="border-t border-white/[0.06] py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2
                      text-red-400 hover:bg-red-500/10 hover:text-red-300
                      transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {showSearch && (
        <div className="md:hidden px-4 pb-3 animate-fadeIn">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 text-sm
                bg-[#0a0e27]/[0.04] backdrop-blur-xl
                border border-white/[0.08]
                rounded-xl
                text-white placeholder:text-gray-500
                focus:outline-none focus:bg-[#0a0e27]/[0.06] focus:border-green-400/30"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;