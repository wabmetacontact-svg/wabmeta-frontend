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

      {/* Subtle light Instagram tint (light mode only) */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 0% 0%, rgba(225,48,108,0.04) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 100% 100%, rgba(131,58,180,0.03) 0%, transparent 60%),
              #f9fafb
            `,
          }}
        />
      </div>

      {/* Sidebar - Desktop (fixed, out of flow, like DashboardLayout) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50">
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
          ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}
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
