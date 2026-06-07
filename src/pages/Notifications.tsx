// src/pages/Notifications.tsx
import React, { useState } from 'react';
import {
  Bell,
  MessageSquare,
  Users,
  Megaphone,
  CreditCard,
  Settings,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  RefreshCw,
  Inbox,
  Filter,
  VolumeX,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useNotificationsStore } from '../context/NotificationsContext';
import type { NotificationType } from '../context/NotificationsContext';
import { timeAgo } from '../utils/timeAgo';

// ============================================
// HELPERS
// ============================================
const getNotificationIcon = (type: NotificationType) => {
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

const getNotificationIconStyle = (type: NotificationType) => {
  switch (type) {
    case 'message':  return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'campaign': return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'team':     return 'bg-green-50 text-green-600 border-green-100';
    case 'billing':  return 'bg-orange-50 text-orange-600 border-orange-100';
    case 'alert':    return 'bg-red-50 text-red-600 border-red-100';
    case 'whatsapp': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'system':   return 'bg-gray-50 text-gray-600 border-gray-200';
    default:         return 'bg-blue-50 text-blue-600 border-blue-100';
  }
};

// ============================================
// COMPONENT
// ============================================
const Notifications: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
  } = useNotificationsStore();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const [isMuted, setIsMuted] = React.useState(false);
  const [mutedUntilLabel, setMutedUntilLabel] = React.useState('');

  // Check mute status
  React.useEffect(() => {
    const checkMute = () => {
      const mutedStr = localStorage.getItem('wabmeta_muted_until');
      if (mutedStr) {
        if (mutedStr === '-1') {
          setIsMuted(true);
          setMutedUntilLabel('until you unmute');
        } else {
          const until = parseInt(mutedStr, 10);
          if (Date.now() < until) {
            setIsMuted(true);
            const date = new Date(until);
            setMutedUntilLabel(`until ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
          } else {
            setIsMuted(false);
            localStorage.removeItem('wabmeta_muted_until');
          }
        }
      } else {
        setIsMuted(false);
      }
    };
    checkMute();
    const interval = setInterval(checkMute, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleUnmute = () => {
    localStorage.removeItem('wabmeta_muted_until');
    setIsMuted(false);
    toast.success('Popups have been unmuted');
  };

  const totalCount = notifications.length;

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      clearAll();
    }
  };

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'message', label: 'Messages' },
    { value: 'campaign', label: 'Campaigns' },
    { value: 'team', label: 'Team' },
    { value: 'billing', label: 'Billing' },
    { value: 'alert', label: 'Alerts' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : "You're all caught up! 🎉"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={refresh}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <div className="flex bg-gray-100 border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {isMuted && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <VolumeX className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-800">
              Notification popups are currently muted {mutedUntilLabel}.
            </span>
          </div>
          <button
            onClick={handleUnmute}
            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            Unmute Now
          </button>
        </div>
      )}

      {/* Actions Bar */}
      {notifications.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
          bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-green-600 
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>
                  {typeFilter === 'all'
                    ? 'All types'
                    : notificationTypes.find((t) => t.value === typeFilter)?.label}
                </span>
              </button>

              {showFilterMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFilterMenu(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-44 
                    bg-white border border-gray-200
                    rounded-xl shadow-xl z-20 py-1">
                    {notificationTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setTypeFilter(type.value);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          typeFilter === type.value
                            ? 'text-green-600 bg-green-50 font-medium'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleClearAll}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 bg-gray-50 border border-gray-200 
              rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-950 mb-1">
              {filter === 'unread'
                ? 'No unread notifications'
                : typeFilter !== 'all'
                ? `No ${typeFilter} notifications`
                : 'No notifications yet'}
            </h3>
            <p className="text-gray-500 max-w-sm">
              {filter === 'unread'
                ? "You're all caught up! Check back later for new updates."
                : "When you receive notifications, they'll appear here."}
            </p>
            {(filter === 'unread' || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setFilter('all');
                  setTypeFilter('all');
                }}
                className="mt-4 text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconStyle = getNotificationIconStyle(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 hover:bg-gray-50/50 transition-colors ${
                    !notification.read ? 'bg-green-50/30' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl border shrink-0 ${iconStyle}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className={`font-semibold truncate ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                          {notification.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400 font-mono">
                        {timeAgo(notification.createdAt)}
                      </span>

                      <div className="flex items-center space-x-1">
                        {notification.actionUrl && (
                          <Link
                            to={notification.actionUrl}
                            onClick={() => markAsRead(notification.id)}
                            className="px-3 py-1 text-xs font-medium text-green-600 
                              hover:bg-green-50 rounded-lg transition-colors"
                          >
                            View
                          </Link>
                        )}

                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 text-gray-500 hover:text-green-600 
                              hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 
                            hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settings Preferences Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-50 border border-gray-200">
              <Settings className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
              <p className="text-sm text-gray-500 mt-0.5">Manage what you get notified about</p>
            </div>
          </div>
          <Link
            to="/dashboard/settings"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white 
              border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
          >
            Configure
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Notifications;