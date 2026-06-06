import React, { Suspense, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import IconSidebar from './IconSidebar';
import TopNav from './TopNav';
import { useGlobalNotifications } from '../../hooks/useGlobalNotifications';

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
        <div className="w-5 h-5 border-2 border-cream-300 border-t-ocean-500 rounded-full animate-spin" />
        <span className="text-sm text-ink-500">Loading…</span>
      </div>
    </div>
  );
};

const GlobalNotificationHandler: React.FC = () => {
  useGlobalNotifications();
  return null;
};

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const isInbox = location.pathname.startsWith('/dashboard/inbox');

  return (
    <div className={`${isInbox ? 'max-md:h-[100dvh] max-md:overflow-hidden h-screen' : 'min-h-screen'} relative dashboard-bg`}>
      <GlobalNotificationHandler />

      {/* Floating icon sidebar (desktop + mobile) */}
      <IconSidebar />

      {/* Floating top nav */}
      <TopNav />

      {/* Main content */}
      <main
        className={`
          pt-24 pl-20 lg:pl-24 pr-4 lg:pr-6
          ${isInbox ? 'h-screen overflow-hidden' : 'min-h-screen pb-8'}
          transition-all duration-300
        `}
      >
        {isInbox ? (
          <div className="h-[calc(100vh-6rem)] max-md:h-[calc(100dvh-6rem)]">
            <Suspense fallback={<RouteLoader />}>
              <Outlet />
            </Suspense>
          </div>
        ) : (
          <Suspense fallback={<RouteLoader />}>
            <Outlet />
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;