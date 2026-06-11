// src/context/AuthProvider.tsx
// ✅ Existing file me ye changes karo

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type User, type Organization } from './AuthContext';
import api, { auth, setAuthToken, removeAuthToken } from '../services/api';
import toast from 'react-hot-toast';

// ✅ NEW: ForceLogout Popup Component
interface ForceLogoutPopupProps {
  message: string;
  countdown: number;
}

const ForceLogoutPopup: React.FC<ForceLogoutPopupProps> = ({ message, countdown }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border-2 border-red-100">
      {/* Icon */}
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-slate-900 mb-3">
        Security Notice
      </h2>

      {/* Message */}
      <p className="text-slate-600 text-sm mb-6 leading-relaxed">
        {message}
      </p>

      {/* Countdown */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-14 h-14 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-red-600">{countdown}</span>
        </div>
        <p className="text-slate-500 text-sm">
          Logging out in<br />
          <span className="font-semibold">{countdown} second{countdown !== 1 ? 's' : ''}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-red-500 rounded-full transition-all duration-1000"
          style={{ width: `${(countdown / 5) * 100}%` }}
        />
      </div>

      <p className="text-xs text-slate-400 mt-3">
        Please login again to continue using WabMeta
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

  // ✅ NEW: Force logout popup state
  const [forceLogoutState, setForceLogoutState] = useState<{
    show: boolean;
    message: string;
    countdown: number;
  }>({
    show: false,
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

  // ✅ NEW: Force logout function - socket event pe call hoga
  const triggerForceLogout = useCallback((message: string) => {
    console.log('🔒 Force logout triggered:', message);

    // Countdown 5 se shuru karo
    setForceLogoutState({
      show: true,
      message,
      countdown: 5,
    });

    // Countdown timer
    let remaining = 5;
    countdownTimer.current = setInterval(() => {
      remaining -= 1;
      setForceLogoutState(prev => ({
        ...prev,
        countdown: remaining,
      }));

      if (remaining <= 0) {
        if (countdownTimer.current) {
          clearInterval(countdownTimer.current);
        }
      }
    }, 1000);

    // 5 second baad actual logout
    forceLogoutTimer.current = setTimeout(async () => {
      // Popup hide karo
      setForceLogoutState({ show: false, message: '', countdown: 5 });

      // Auth data clear karo
      clearAuthData();
      removeAuthToken();

      setState({
        user: null,
        organization: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Login page pe redirect karo
      navigate('/login', { replace: true });

      // Toast show karo
      toast.error('You have been logged out. Please login again.', {
        duration: 5000,
        icon: '🔒',
      });
    }, 5000);
  }, [clearAuthData, navigate]);

  // ✅ Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (forceLogoutTimer.current) clearTimeout(forceLogoutTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, []);

  // ✅ NEW: Socket force_logout event listener
  // Window custom event use karenge (SocketProvider se AuthProvider communicate karega)
  useEffect(() => {
    const handleForceLogout = (event: CustomEvent) => {
      const { message } = event.detail || {};
      triggerForceLogout(
        message || 'Your account credentials have been changed. Please login again.'
      );
    };

    // ✅ Custom event listen karo
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
      {/* ✅ Force logout popup - sabse upar render hoga */}
      {forceLogoutState.show && (
        <ForceLogoutPopup
          message={forceLogoutState.message}
          countdown={forceLogoutState.countdown}
        />
      )}
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;