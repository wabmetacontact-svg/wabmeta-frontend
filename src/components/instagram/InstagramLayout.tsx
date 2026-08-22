import React, { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ErrorBoundary from "../common/ErrorBoundary";
import PageLoader from "../common/PageLoader";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import { useGlobalNotifications } from "../../hooks/useGlobalNotifications";

const GlobalNotificationHandler: React.FC = () => {
  useGlobalNotifications();
  return null;
};

const InstagramLayout: React.FC = () => {
  const { pathname } = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative bg-gray-50">
      <GlobalNotificationHandler />

      {/* Instagram-tinted background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 0% 0%, rgba(131,58,180,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 100% 100%, rgba(253,29,29,0.04) 0%, transparent 60%),
              linear-gradient(135deg, #050816 0%, #0a0e27 50%, #050816 100%)
            `,
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Sidebar - Mobile Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar collapsed={false} setCollapsed={() => {}} />
          </div>
        </>
      )}

      {/* TopBar */}
      <TopBar
        onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 min-h-screen
          ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}
        `}
      >
        <div className="p-4 lg:p-6">
          <ErrorBoundary variant="inline" resetKey={pathname}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default InstagramLayout;
