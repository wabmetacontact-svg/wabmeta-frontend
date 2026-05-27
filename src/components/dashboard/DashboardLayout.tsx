import React, { Suspense, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

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
        <div className="w-5 h-5 border-2 border-white/10 border-t-green-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    </div>
  );
};

const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const isInbox = location.pathname.startsWith('/dashboard/inbox');

  return (
    <div className="min-h-screen relative bg-[#050816]">

      {/* ✅ Global dashboard background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 0% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 100% 100%, rgba(59, 130, 246, 0.06) 0%, transparent 60%),
              linear-gradient(135deg, #050816 0%, #0a0e27 50%, #050816 100%)
            `,
          }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
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

      {/* Top Bar */}
      <TopBar
        onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300
          ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}
          ${isInbox ? 'overflow-hidden' : 'min-h-screen'}
        `}
      >
        {isInbox ? (
          <div className="h-[calc(100vh-4rem)]">
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