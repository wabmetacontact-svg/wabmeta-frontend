import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import ErrorBoundary from '../common/ErrorBoundary';
import AdminSearch from './AdminSearch';

const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="pl-64">
        <div className="sticky top-0 z-30 bg-gray-50/90 backdrop-blur border-b border-gray-200 px-8 py-3">
          <AdminSearch />
        </div>
        <div className="p-8">
          <ErrorBoundary variant="inline" resetKey={pathname}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;