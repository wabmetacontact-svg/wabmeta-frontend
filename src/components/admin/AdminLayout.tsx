import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import ErrorBoundary from '../common/ErrorBoundary';

const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="pl-64">
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