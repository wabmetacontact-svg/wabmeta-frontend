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
    case 'message':  return 'bg-blue-50 border-blue-200 text-blue-600';
    case 'campaign': return 'bg-purple-50 border-purple-200 text-purple-600';
    case 'team':     return 'bg-green-50 border-green-200 text-green-600';
    case 'billing':  return 'bg-orange-50 border-orange-200 text-orange-600';
    case 'alert':    return 'bg-red-50 border-red-200 text-red-600';
    case 'whatsapp': return 'bg-emerald-50 border-emerald-200 text-emerald-600';
    case 'system':   return 'bg-gray-50 border-gray-200 text-gray-600';
    default:         return 'bg-blue-50 border-blue-200 text-blue-600';
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
        ${sidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'}
      `}
    >
      <div className="absolute inset-0 bg-white/85 backdrop-blur-md border-b border-gray-200" />

      <div className="relative flex items-center justify-between h-16 px-4 lg:px-6">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg
              bg-gray-100 border border-gray-200
              hover:bg-gray-200/60
              text-gray-500 hover:text-gray-900
              transition-all duration-300 focus-ring"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
              <input
                type="text"
                placeholder="Search contacts, campaigns, templates..."
                className="w-72 lg:w-96 pl-10 pr-20 py-2.5 text-sm
                  bg-gray-100 hover:bg-gray-200/50
                  border border-transparent
                  rounded-xl
                  text-gray-900 placeholder:text-gray-400
                  focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10
                  transition-all duration-300"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1
                px-2 py-0.5 rounded-md
                bg-gray-200 border border-gray-300">
                <Command className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-sans text-gray-500">K</span>
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
              bg-gray-100 border border-gray-200
              hover:bg-gray-200/60
              text-gray-500 hover:text-gray-900
              transition-all duration-300 focus-ring"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* ✅ NOTIFICATIONS - REAL DATA */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg
                bg-gray-100 border border-gray-200
                hover:bg-gray-200/60 hover:border-gray-300
                text-gray-500 hover:text-gray-900
                transition-all duration-300 focus-ring"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full
                    ring-2 ring-white animate-pulse" />
                  {unreadCount > 1 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                      bg-red-500 text-white text-[10px] font-bold rounded-full
                      flex items-center justify-center ring-2 ring-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96
                bg-white border border-gray-200
                rounded-2xl shadow-lg
                overflow-hidden z-50
                animate-fadeIn">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {unreadCount} unread
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications list */}
                <div className="max-h-96 overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4">
                      <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100
                        flex items-center justify-center mb-3">
                        <InboxIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
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
                          className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50
                            hover:bg-gray-50 transition-colors cursor-pointer
                            ${!notification.read ? 'bg-primary-50/20' : ''}
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
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                              {notification.description}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 font-sans">
                              {timeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
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
                <div className="px-4 py-3 border-t border-gray-100">
                  <Link
                    to="/dashboard/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-xs text-primary-600 hover:text-primary-700 font-medium"
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
                bg-gray-100 border border-gray-200
                hover:bg-gray-200/60 hover:border-gray-300
                transition-all duration-300 focus-ring"
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
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600
                    flex items-center justify-center text-white font-bold text-xs">
                    {initial}
                  </div>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-gray-800">{displayName}</p>
                <p className="text-[10px] text-gray-400 capitalize">
                  {user?.role || 'User'}
                </p>
              </div>
              <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-gray-400 transition-transform 
                ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56
                bg-white border border-gray-200
                rounded-2xl shadow-lg
                overflow-hidden z-50
                animate-fadeIn">

                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
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
                        text-gray-700 hover:text-gray-900 hover:bg-gray-50
                        transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>

                <div className="border-t border-gray-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2
                      text-red-600 hover:bg-red-50 hover:text-red-700
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 text-sm
                bg-gray-100 border border-gray-200
                rounded-xl
                text-gray-900 placeholder:text-gray-400
                focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;