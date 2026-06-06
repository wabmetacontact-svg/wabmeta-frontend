import React, { Suspense, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useGlobalNotifications } from '../../hooks/useGlobalNotifications';

// ─── Route Loader ─────────────────────────────────────────────────────────────

const RouteLoader: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 250);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="w-full py-20 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    </div>
  );
};

// ─── Global Notification Handler ─────────────────────────────────────────────

const GlobalNotificationHandler: React.FC = () => {
  useGlobalNotifications();
  return null;
};

// ─── Dashboard Layout ─────────────────────────────────────────────────────────

const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const isInbox = location.pathname.startsWith('/dashboard/inbox');

  return (
    <div
      className={`
        relative
        bg-gray-50
        ${isInbox
          ? 'h-screen max-md:h-[100dvh] overflow-hidden'
          : 'min-h-screen'
        }
      `}
    >
      {/* Global notification handler */}
      <GlobalNotificationHandler />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar
              collapsed={false}
              setCollapsed={() => {}}
            />
          </div>
        </>
      )}

      {/* Top Bar */}
      <TopBar
        onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={`
          pt-16
          transition-all duration-300
          w-full
          max-md:overflow-x-hidden
          ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
          ${isInbox ? 'overflow-hidden' : 'min-h-screen'}
        `}
      >
        {isInbox ? (
          <div className="h-[calc(100vh-4rem)] max-md:h-[calc(100dvh-4rem)]">
            <Suspense fallback={<RouteLoader />}>
              <Outlet />
            </Suspense>
          </div>
        ) : (
          <div className="p-4 lg:p-6">
            <Suspense fallback={<RouteLoader />}>
              <Outlet />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;