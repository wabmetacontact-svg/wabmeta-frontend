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
  Moon,
  Sun,
  Menu,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, sidebarCollapsed }) => {
  const { user } = useApp();
  const { logout } = useAuth();
  const { resolved, toggle } = useTheme();

  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  // Handle Logout
  const handleLogout = async () => {
    setShowProfile(false);
    await logout();
  };

  // Click outside handler
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

  // Keyboard shortcut for search
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

  const notifications = [
    {
      id: 1,
      type: 'message',
      title: 'New message from Priya',
      description: 'Hi, I wanted to know about...',
      time: '2 min ago',
      unread: true
    },
    {
      id: 2,
      type: 'campaign',
      title: 'Festive Blast Completed',
      description: 'Campaign completed successfully with 98% delivery rate.',
      time: '5 min ago',
      unread: true
    }
  ];

  const isDark = resolved === 'dark';

  return (
    <header
      className={`fixed top-0 right-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-300"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden md:flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-64 lg:w-80 pl-10 pr-12 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 text-sm shadow-2xs"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center space-x-0.5 text-gray-400 dark:text-slate-400 text-[10px] font-medium bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-750 px-1 py-0.5 rounded-md shadow-2xs">
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>

            {/* + Create Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-750 text-white font-semibold text-xs rounded-xl shadow-md transition-all">
                <span>+ Create</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Mobile Search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-300"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-300 transition-colors"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-300 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4.5 h-4.5 bg-red-500 text-[10px] font-bold text-white rounded-full border border-white dark:border-slate-900 shadow-2xs">
                2
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-fade-in z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100">Notifications</h3>
                  <button className="text-sm text-violet-600 hover:text-violet-755 font-medium">
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{notification.title}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{notification.description}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">{notification.time}</p>
                      </div>
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-2"></div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800">
                  <Link
                    to="/dashboard/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-sm text-violet-600 hover:text-violet-755 font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-250 dark:border-slate-700 flex items-center justify-center bg-gray-100 dark:bg-slate-800 shadow-2xs shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  W
                </div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-gray-900 dark:text-slate-100">WabMeta Ads</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">Admin</p>
              </div>
              <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-gray-400 dark:text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-fade-in z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">WabMeta Ads</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">admin@wabmeta.com</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/dashboard/settings/profile"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">My Profile</span>
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Settings</span>
                  </Link>
                  <Link
                    to="/dashboard/settings/billing"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Billing</span>
                  </Link>
                  <Link
                    to="/dashboard/help"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Help & Support</span>
                  </Link>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-800 py-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
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

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden px-4 pb-4 animate-fade-in bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-slate-100 text-sm"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;