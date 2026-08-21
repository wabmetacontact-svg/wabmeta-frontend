// src/components/dashboard/DashboardLayout.tsx
import React, { Suspense, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useGlobalNotifications } from '../../hooks/useGlobalNotifications';

const RouteLoader: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="w-full py-20 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    </div>
  );
};

const GlobalNotificationHandler: React.FC = () => {
  useGlobalNotifications();
  return null;
};

const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const isInbox = location.pathname.startsWith('/dashboard/inbox');

  // Close mobile menu on route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={`relative bg-gray-50 ${isInbox ? 'h-screen max-md:h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      <GlobalNotificationHandler />

      {/* Sidebar - Fixed on both mobile and desktop */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          isMobile={mobileSidebarOpen}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Top Bar */}
      <TopBar
        onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content Viewport */}
      <main
        className={`
          transition-all duration-300
          w-full
          max-md:overflow-x-hidden
          ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
          ${isInbox ? 'h-screen max-md:h-[100dvh] pt-16 flex flex-col overflow-hidden' : 'pt-16 min-h-screen'}
        `}
      >
        {isInbox ? (
          <div className="flex-1 min-h-0 w-full overflow-hidden">
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