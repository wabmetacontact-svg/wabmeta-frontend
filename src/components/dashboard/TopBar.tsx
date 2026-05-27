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
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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

  useEffect(() => { setAvatarError(false); }, [user?.avatar]);

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

  const notifications = [
    {
      id: 1,
      type: 'message',
      title: 'New message from Priya',
      description: 'Hi, I wanted to know about...',
      time: '2 min ago',
      unread: true,
    },
  ];

  return (
    <header
      className={`fixed top-0 right-0 z-30 transition-all duration-300
        ${sidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-72'}
      `}
    >
      {/* ✅ Glass background */}
      <div className="absolute inset-0 bg-[#0a0e27]/70 backdrop-blur-2xl border-b border-white/[0.06]" />

      <div className="relative flex items-center justify-between h-16 px-4 lg:px-6">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg
              bg-white/[0.04] border border-white/[0.06]
              hover:bg-white/[0.08]
              text-gray-400 hover:text-white
              transition-all duration-300"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search - glass */}
          <div className="hidden md:flex items-center">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-green-400 transition-colors" />
              <input
                type="text"
                placeholder="Search contacts, campaigns, templates..."
                className="w-72 lg:w-96 pl-10 pr-20 py-2.5 text-sm
                  bg-white/[0.04] backdrop-blur-xl
                  border border-white/[0.08]
                  rounded-xl
                  text-white placeholder:text-gray-500
                  focus:outline-none focus:bg-white/[0.06] focus:border-green-400/30
                  transition-all duration-300"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1
                px-2 py-0.5 rounded-md
                bg-white/[0.05] border border-white/[0.08]">
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
              bg-white/[0.04] border border-white/[0.06]
              hover:bg-white/[0.08]
              text-gray-400 hover:text-white
              transition-all duration-300"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggle}
            title={resolved === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="relative p-2 rounded-lg
              bg-white/[0.04] border border-white/[0.06]
              hover:bg-white/[0.08] hover:border-white/[0.12]
              text-gray-400 hover:text-white
              transition-all duration-300 group"
          >
            {resolved === 'dark' ? (
              <Sun className="w-4 h-4 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg
                bg-white/[0.04] border border-white/[0.06]
                hover:bg-white/[0.08] hover:border-white/[0.12]
                text-gray-400 hover:text-white
                transition-all duration-300"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full
                ring-2 ring-[#0a0e27] animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80
                bg-[#0a0e27]/95 backdrop-blur-2xl
                border border-white/[0.1]
                rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                overflow-hidden z-50
                animate-fadeIn">

                {/* Top edge */}
                <div className="absolute top-0 left-[15%] right-[15%] h-px 
                  bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                  <h3 className="font-semibold text-white text-sm">Notifications</h3>
                  <button className="text-xs text-green-400 hover:text-green-300 font-medium">
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 px-4 py-3
                        hover:bg-white/[0.04] transition-colors cursor-pointer
                        ${notification.unread ? 'bg-green-500/[0.04]' : ''}
                      `}
                    >
                      <div className="w-9 h-9 rounded-full
                        bg-blue-500/20 border border-blue-400/30
                        flex items-center justify-center flex-shrink-0
                        text-blue-300">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        <p className="text-xs text-gray-400 truncate">{notification.description}</p>
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">{notification.time}</p>
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>

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
                bg-white/[0.04] border border-white/[0.06]
                hover:bg-white/[0.08] hover:border-white/[0.12]
                transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                {user?.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600
                    flex items-center justify-center text-white font-bold text-xs">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : 'JD'}
                  </div>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white">{user?.name || 'Guest'}</p>
                <p className="text-[10px] text-gray-500 capitalize font-mono">{user?.role || 'User'}</p>
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
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
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
                        text-gray-300 hover:text-white hover:bg-white/[0.04]
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
                bg-white/[0.04] backdrop-blur-xl
                border border-white/[0.08]
                rounded-xl
                text-white placeholder:text-gray-500
                focus:outline-none focus:bg-white/[0.06] focus:border-green-400/30"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;