// src/components/admin/AdminProtectedRoute.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { admin } from '../../services/api';

interface AdminProtectedRouteProps {
  children?: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasChecked = useRef(false);

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

    if (!hasChecked.current) {
      hasChecked.current = true;
      verifyAdmin();
    }

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

  return children ? <>{children}</> : <Outlet />;
};

export default AdminProtectedRoute;