// src/context/AuthProvider.tsx
// ✅ Existing file me ye changes karo

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type User, type Organization } from './AuthContext';
import api, { auth, setAuthToken, removeAuthToken } from '../services/api';
import toast from 'react-hot-toast';

// ============================================
// ✅ PROFESSIONAL SESSION EXPIRED POPUP
// ============================================
interface ForceLogoutPopupProps {
  title: string;
  message: string;
  countdown: number;
}

const ForceLogoutPopup: React.FC<ForceLogoutPopupProps> = ({
  title,
  message,
  countdown,
}) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
      {/* Icon - Lock instead of warning */}
      <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg
          className="w-7 h-7 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-slate-900 text-center mb-2">
        {title}
      </h2>

      {/* Message */}
      <p className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
        {message}
      </p>

      {/* Countdown - subtle */}
      <div className="bg-slate-50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-slate-500">
            Redirecting in{' '}
            <span className="font-semibold text-slate-700">
              {countdown}s
            </span>
          </p>
        </div>

        {/* Subtle progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${((5 - countdown) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Subtle footer */}
      <p className="text-xs text-slate-400 text-center">
        You will be redirected to the sign in page
      </p>
    </div>
  </div>
);

// ... TOKEN_KEYS same as before ...

const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
  USER: 'wabmeta_user',
  ORG: 'wabmeta_org',
  LEGACY_TOKEN: 'token',
  LEGACY_WABMETA: 'wabmeta_token',
} as const;

const isValidJWT = (token: string | null): boolean => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const [state, setState] = useState<{
    user: User | null;
    organization: Organization | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }>({
    user: null,
    organization: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // ✅ State me title bhi add karo
  const [forceLogoutState, setForceLogoutState] = useState<{
    show: boolean;
    title: string;
    message: string;
    countdown: number;
  }>({
    show: false,
    title: '',
    message: '',
    countdown: 5,
  });

  const initialCheckDone = useRef(false);
  const isRefreshing = useRef(false);
  const forceLogoutTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);

  // ✅ Token helpers
  const getAccessToken = useCallback((): string | null => {
    const token =
      localStorage.getItem(TOKEN_KEYS.ACCESS) ||
      localStorage.getItem(TOKEN_KEYS.LEGACY_TOKEN) ||
      localStorage.getItem(TOKEN_KEYS.LEGACY_WABMETA);
    return isValidJWT(token) ? token : null;
  }, []);

  const getRefreshToken = useCallback((): string | null => {
    return localStorage.getItem(TOKEN_KEYS.REFRESH);
  }, []);

  const loadSavedData = useCallback((): { user: User | null; org: Organization | null } => {
    try {
      const savedUser = localStorage.getItem(TOKEN_KEYS.USER);
      const savedOrg = localStorage.getItem(TOKEN_KEYS.ORG);
      return {
        user: savedUser ? JSON.parse(savedUser) : null,
        org: savedOrg ? JSON.parse(savedOrg) : null,
      };
    } catch {
      return { user: null, org: null };
    }
  }, []);

  const saveToStorage = useCallback((user: User | null, org: Organization | null) => {
    if (user) localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(TOKEN_KEYS.USER);

    if (org) localStorage.setItem(TOKEN_KEYS.ORG, JSON.stringify(org));
    else localStorage.removeItem(TOKEN_KEYS.ORG);
  }, []);

  const clearAuthData = useCallback(() => {
    Object.values(TOKEN_KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('remember_me');
    localStorage.removeItem('currentOrganizationId');
  }, []);

  // ✅ Logout function
  const logout = useCallback(async () => {
    console.log('👋 Logging out...');
    try {
      await auth.logout();
    } catch (e) {
      console.warn('⚠️ Logout API call failed, clearing locally');
    }

    clearAuthData();
    removeAuthToken();

    setState({
      user: null,
      organization: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    navigate('/login', { replace: true });
  }, [navigate, clearAuthData]);

  // ✅ triggerForceLogout function update karo
  const triggerForceLogout = useCallback(
    (title: string, message: string) => {
      console.log('🔒 Session expired:', message);

      setForceLogoutState({
        show: true,
        title,
        message,
        countdown: 5,
      });

      let remaining = 5;
      countdownTimer.current = setInterval(() => {
        remaining -= 1;
        setForceLogoutState((prev) => ({
          ...prev,
          countdown: remaining,
        }));

        if (remaining <= 0) {
          if (countdownTimer.current) {
            clearInterval(countdownTimer.current);
          }
        }
      }, 1000);

      forceLogoutTimer.current = setTimeout(async () => {
        setForceLogoutState({
          show: false,
          title: '',
          message: '',
          countdown: 5,
        });

        clearAuthData();
        removeAuthToken();

        setState({
          user: null,
          organization: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        navigate('/login', { replace: true });

        // ✅ Subtle toast - no admin reference
        toast('Please sign in to continue', {
          duration: 4000,
          icon: '🔐',
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
          },
        });
      }, 5000);
    },
    [clearAuthData, navigate]
  );

  // ✅ Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (forceLogoutTimer.current) clearTimeout(forceLogoutTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, []);

  // ✅ Event listener bhi update karo
  useEffect(() => {
    const handleForceLogout = (event: CustomEvent) => {
      const { title, message } = event.detail || {};
      triggerForceLogout(
        title || 'Session Expired',
        message || 'Your session has expired. Please sign in to continue.'
      );
    };

    window.addEventListener('force_logout', handleForceLogout as EventListener);

    return () => {
      window.removeEventListener('force_logout', handleForceLogout as EventListener);
    };
  }, [triggerForceLogout]);

  // ✅ Refresh token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing.current) return false;

    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      isRefreshing.current = true;
      const response = await auth.refresh(refreshToken);

      if (response.data?.success && response.data?.data?.accessToken) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        setAuthToken(accessToken, newRefreshToken || refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing.current = false;
    }
  }, [getRefreshToken]);

  // ✅ Verify session
  const verifySession = useCallback(async (): Promise<boolean> => {
    const accessToken = getAccessToken();
    if (!accessToken) return false;

    try {
      const userResponse = await auth.me();

      if (userResponse.data?.success && userResponse.data?.data) {
        const user = userResponse.data.data;

        let org: Organization | null = null;
        try {
          const orgResponse = await api.get('/organizations/current');
          if (orgResponse.data?.success && orgResponse.data?.data) {
            org = orgResponse.data.data;
          }
        } catch {
          const saved = loadSavedData();
          org = saved.org;
        }

        saveToStorage(user, org);

        if (!org) return false;

        setState({
          user,
          organization: org,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      }
      return false;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) return await verifySession();
      }
      return false;
    }
  }, [getAccessToken, loadSavedData, saveToStorage, refreshAccessToken]);

  // ✅ Initial auth check
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const accessToken = getAccessToken();

        if (!accessToken) {
          if (isMounted) {
            setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
          }
          return;
        }

        const { user: savedUser, org: savedOrg } = loadSavedData();
        if (savedUser && isMounted) {
          setState(prev => ({
            ...prev,
            user: savedUser,
            organization: savedOrg,
            isAuthenticated: true,
          }));
        }

        const isValid = await verifySession();

        if (!isValid && isMounted) {
          clearAuthData();
          setState({
            user: null,
            organization: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          navigate('/login', { replace: true });
        } else if (isMounted) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('💥 Auth init failed:', error);
        if (isMounted) {
          setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
        }
      }
    };

    if (!initialCheckDone.current) {
      initialCheckDone.current = true;
      initAuth();
    }

    return () => { isMounted = false; };
  }, []);

  // ✅ Login
  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await auth.login({ email, password });

      if (response.data?.success && response.data?.data) {
        const { user, tokens, organization } = response.data.data;

        if (!organization) {
          toast.error('Login failed: Organization not assigned.');
          throw new Error('Organization not assigned');
        }

        setAuthToken(tokens.accessToken, tokens.refreshToken);
        saveToStorage(user, organization || null);

        setState({
          user,
          organization: organization || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      }

      throw new Error(response.data?.message || 'Login failed');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return { success: false, error: message };
    }
  }, [saveToStorage]);

  // ✅ Register
  const register = useCallback(async (
    data: any
  ): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await auth.register(data);

      if (response.data?.success && response.data?.data) {
        const result = response.data.data;

        if (result.requiresVerification) {
          setState(prev => ({ ...prev, isLoading: false }));
          return { success: true };
        }

        const { user, tokens, organization } = result as any;
        if (user && tokens) {
          setAuthToken(tokens.accessToken, tokens.refreshToken);
          saveToStorage(user, organization || null);
          setState({
            user,
            organization: organization || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }

        return { success: true };
      }

      throw new Error(response.data?.message || 'Registration failed');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return { success: false, error: message };
    }
  }, [saveToStorage]);

  // ✅ Google login
  const googleLogin = useCallback(async (
    credential: string
  ): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await auth.googleLogin({ credential });

      if (response.data?.success && response.data?.data) {
        const { user, tokens, organization } = response.data.data;

        if (!organization) {
          toast.error('Login failed: Organization not assigned.');
          throw new Error('Organization not assigned');
        }

        setAuthToken(tokens.accessToken, tokens.refreshToken);
        saveToStorage(user, organization || null);

        setState({
          user,
          organization: organization || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      }

      throw new Error(response.data?.message || 'Google login failed');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Google login failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return { success: false, error: message };
    }
  }, [saveToStorage]);

  // ✅ Update user
  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      const newUser = { ...prev.user, ...updatedUser };
      saveToStorage(newUser, prev.organization);
      return { ...prev, user: newUser };
    });
  }, [saveToStorage]);

  // ✅ Update organization
  const updateOrganization = useCallback((updatedOrg: Partial<Organization>) => {
    setState(prev => {
      if (!prev.organization) return prev;
      const newOrg = { ...prev.organization, ...updatedOrg };
      saveToStorage(prev.user, newOrg);
      return { ...prev, organization: newOrg };
    });
  }, [saveToStorage]);

  const setOrganization = useCallback((org: Organization | null) => {
    setState(prev => {
      saveToStorage(prev.user, org);
      return { ...prev, organization: org };
    });
  }, [saveToStorage]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    return await verifySession();
  }, [verifySession]);

  const value = {
    ...state,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    updateOrganization,
    setOrganization,
    clearError,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* ✅ Professional session expired popup */}
      {forceLogoutState.show && (
        <ForceLogoutPopup
          title={forceLogoutState.title}
          message={forceLogoutState.message}
          countdown={forceLogoutState.countdown}
        />
      )}
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;