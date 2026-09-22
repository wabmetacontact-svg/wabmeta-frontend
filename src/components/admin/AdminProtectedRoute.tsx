// src/components/admin/AdminProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { admin } from '../../services/api';
import { adminCan, saveAdminUser } from '../../utils/adminPermissions';

interface AdminProtectedRouteProps {
  children?: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      const token = localStorage.getItem('wabmeta_admin_token');

      // ✅ Strict validation to block 'true' injection bypass attacks
      if (!token || token === 'true' || token.split('.').length !== 3) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsChecking(false);
        }
        return;
      }

      try {
        // Double check token with backend profile validation
        const response = await admin.getProfile();
        if (response.data?.success && isMounted) {
          console.log('✅ Admin credentials verified with backend');
          // Keep the role's permissions current for the buttons we show.
          saveAdminUser(response.data.data);
          setIsAuthenticated(true);
        } else if (isMounted) {
          throw new Error('Invalid Admin session profile data');
        }
      } catch (error) {
        console.error('❌ Admin verification failure:', error);
        if (isMounted) {
          localStorage.removeItem('wabmeta_admin_token');
          localStorage.removeItem('wabmeta_admin_user');
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    // Every mount verifies. A "check only once" ref used to guard this, and
    // under React StrictMode (dev) it hung forever: the first run's cleanup
    // set isMounted=false, the second run was skipped by the ref, so the
    // only answer that arrived was ignored and the spinner never stopped.
    verifyAdmin();

    return () => { isMounted = false; };
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">Verifying secure admin session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/manage-wabmeta-admin/login" state={{ from: location }} replace />;
  }

  // An onboarder has no dashboard: their home is their client list, and the
  // only other pages they can use are a client's own pages and Settings.
  if (adminCan('clients.own') && !adminCan('dashboard.read')) {
    const p = location.pathname;
    const allowed =
      p.startsWith('/manage-wabmeta-admin/my-clients') ||
      p.startsWith('/manage-wabmeta-admin/settings') ||
      /^\/manage-wabmeta-admin\/organizations\/[^/]+(\/(billing|features))?$/.test(p);
    if (!allowed) return <Navigate to="/manage-wabmeta-admin/my-clients" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AdminProtectedRoute;