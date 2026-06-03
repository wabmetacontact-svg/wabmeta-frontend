import React, { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import { useGlobalNotifications } from "../../hooks/useGlobalNotifications";

const RouteLoader: React.FC = () => {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setShow(true), 250);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="w-full py-20 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div
          className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{
            borderColor: "rgba(225,48,108,0.2)",
            borderTopColor: "#e1306c",
          }}
        />
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    </div>
  );
};

const GlobalNotificationHandler: React.FC = () => {
  useGlobalNotifications();
  return null;
};

const InstagramLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative bg-[#050816]">
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
          <Suspense fallback={<RouteLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default InstagramLayout;
