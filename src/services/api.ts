// src/services/api.ts - FIXED VERSION
// ✅ FIX: exported performTokenRefresh() as a single-flight function so that
// AuthProvider.tsx and this interceptor share ONE in-flight refresh call instead of
// two independent mutexes. Previously, two parallel refresh calls could race,
// causing the backend's reuse-detection to revoke ALL sessions for a valid user.

import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse
} from 'axios';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  details?: any;
  stack?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponseData {
  user: AuthUser;
  tokens: AuthTokens;
  organization?: {
    id: string;
    name: string;
    slug: string;
    planType: string;
  };
}

export interface RegisterResponse {
  message: string;
  email: string;
  requiresVerification: boolean;
}

// ============================================
// CONFIGURATION
// ============================================

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;

  console.log('VITE_API_URL:', envUrl);

  if (envUrl) {
    return envUrl.replace(/\/+$/, '').replace(/\/v1$/, '');
  }

  if (import.meta.env.PROD) {
    return 'https://wabmeta-api.onrender.com/api';
  }

  return 'http://localhost:10000/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Configuration:', {
  baseUrl: API_BASE_URL,
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
});

// ============================================
// TOKEN MANAGEMENT
// ============================================

const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
  USER: 'wabmeta_user',
  ORG: 'wabmeta_org',
  ADMIN: 'wabmeta_admin_token',
  LEGACY_TOKEN: 'token',
  LEGACY_WABMETA: 'wabmeta_token',
  ORG_ID: 'currentOrganizationId',
} as const;

const isValidJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3;
};

const getAccessToken = (): string | null => {
  let token = localStorage.getItem(TOKEN_KEYS.ACCESS);

  if (!token || !isValidJWT(token)) {
    token = localStorage.getItem(TOKEN_KEYS.LEGACY_TOKEN) ||
      localStorage.getItem(TOKEN_KEYS.LEGACY_WABMETA);
  }

  if (import.meta.env.DEV && !token) {
    console.debug('📂 Storage check: Access token is missing or invalid');
  }

  return token && isValidJWT(token) ? token : null;
};

const getRefreshToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEYS.REFRESH);
  if (!token && import.meta.env.DEV) {
    console.debug('📂 Storage check: Refresh token is missing');
  }
  return token && typeof token === 'string' && token.length > 0 ? token : null;
};

const getAdminToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEYS.ADMIN);
  return token && isValidJWT(token) ? token : null;
};

const setAuthTokens = (accessToken: string, refreshToken?: string) => {
  if (accessToken && isValidJWT(accessToken)) {
    localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
    localStorage.setItem(TOKEN_KEYS.LEGACY_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.LEGACY_WABMETA, accessToken);
  }

  if (refreshToken && typeof refreshToken === 'string') {
    localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
  }
};

const clearAuthData = () => {
  Object.values(TOKEN_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

const cleanupInvalidTokens = () => {
  const jwtKeys = [
    TOKEN_KEYS.ACCESS,
    TOKEN_KEYS.LEGACY_TOKEN,
    TOKEN_KEYS.LEGACY_WABMETA,
    TOKEN_KEYS.ADMIN,
  ];

  jwtKeys.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value && !isValidJWT(value)) {
      localStorage.removeItem(key);
      console.warn(`⚠️ Removed invalid JWT token: ${key}`);
    }
  });
};

// ============================================
// AXIOS INSTANCE
// ============================================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase() || 'GET';
    const url = config.url || '';

    if (import.meta.env.DEV) {
      console.log(`📤 ${method} ${url}`);
    }

    cleanupInvalidTokens();

    const isAdminRoute = url.includes('/admin');
    const token = isAdminRoute ? getAdminToken() : getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const orgRaw = localStorage.getItem(TOKEN_KEYS.ORG);
      const org = orgRaw ? JSON.parse(orgRaw) : null;
      const orgId = org?.id || localStorage.getItem(TOKEN_KEYS.ORG_ID);

      if (orgId) {
        config.headers['X-Organization-Id'] = orgId;
      }
    } catch {
      // ignore
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

// ============================================
// ✅ SINGLE-FLIGHT TOKEN REFRESH
// Shared by this interceptor AND AuthProvider.tsx so only ONE
// /auth/refresh request is ever in flight at a time.
// ============================================

let refreshPromise: Promise<string> | null = null;

export const performTokenRefresh = async (): Promise<string> => {
  if (refreshPromise) {
    // A refresh is already in flight — piggyback on it instead of firing another.
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  refreshPromise = (async () => {
    try {
      const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const newAccessToken = response.data?.data?.accessToken;
      const newRefreshToken = response.data?.data?.refreshToken;

      if (!newAccessToken || !isValidJWT(newAccessToken)) {
        throw new Error('Invalid access token received from refresh');
      }

      setAuthTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    } finally {
      // Reset so the NEXT expiry triggers a fresh refresh
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const status = response.status;
    const url = response.config.url || '';

    const newAccessToken = response.headers['x-new-access-token'];
    if (newAccessToken && isValidJWT(newAccessToken)) {
      console.log('🛡️ Auto-healing SYNC: Updating local storage with new session token');
      setAuthTokens(newAccessToken);
    }

    if (import.meta.env.DEV) {
      console.log(`📥 ${status} ${url}`);
    }

    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    };

    const status = error.response?.status;
    const url = originalRequest?.url || '';
    const errorData = error.response?.data;

    console.error(`❌ ${status} ${url}`, errorData?.message || error.message);

    if (error.code === 'ERR_NETWORK') {
      console.error('🔴 Network Error - Backend may be down or CORS misconfigured');
      return Promise.reject({
        message: 'Cannot connect to server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      });
    }

    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout');
      return Promise.reject({
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT',
      });
    }

    if (status === 402) {
      const errorData = error.response?.data as any;

      window.dispatchEvent(new CustomEvent('planLimitExceeded', {
        detail: {
          limitType: errorData?.data?.limitType,
          used: errorData?.data?.used,
          limit: errorData?.data?.limit,
          message: errorData?.message,
        }
      }));

      return Promise.reject({
        ...error,
        isLimitExceeded: true,
        limitData: errorData?.data,
      });
    }

    if (status === 401 && originalRequest && !originalRequest._retry) {
      const isAdminRoute = url.includes('/admin');

      if (isAdminRoute) {
        localStorage.removeItem(TOKEN_KEYS.ADMIN);
        if (window.location.pathname.startsWith('/manage-wabmeta-admin')) {
          window.location.href = '/manage-wabmeta-admin/login';
        }
        return Promise.reject(error);
      }

      const skipRefresh =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/google') ||
        url.includes('/auth/verify');

      if (skipRefresh) {
        return Promise.reject(error);
      }

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        console.warn('⚠️ No refresh token available');
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Attempting token refresh...');

        // ✅ FIX: use the shared single-flight refresh instead of a local axios.post,
        // so this interceptor and AuthProvider.tsx never race on the same refresh token.
        const newAccessToken = await performTokenRefresh();

        console.log('✅ Token refreshed successfully');

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);

      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        clearAuthData();
        processQueue(refreshError as AxiosError, null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// API MODULES
// ============================================

// ---------- AUTH ----------
export const auth = {
  register: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    organizationName?: string;
  }) =>
    api.post<ApiResponse<RegisterResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponseData>>('/auth/login', data),

  googleLogin: (data: { credential: string }) =>
    api.post<ApiResponse<AuthResponseData>>('/auth/google', data),

  me: () => api.get<ApiResponse<AuthUser>>('/auth/me'),

  verifyEmail: (data: { token: string }) =>
    api.post<ApiResponse<{ message: string }>>(
      '/auth/verify-email',
      data
    ),

  resendVerification: (data: { email: string }) =>
    api.post<ApiResponse<{ message: string }>>(
      '/auth/resend-verification',
      data
    ),

  forgotPassword: (data: { email: string }) =>
    api.post<ApiResponse<{ message: string }>>(
      '/auth/forgot-password',
      data
    ),

  resetPassword: (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }) =>
    api.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      data
    ),

  sendOTP: (data: { email: string }) =>
    api.post<ApiResponse<{ message: string }>>('/auth/send-otp', data),

  verifyOTP: (data: { email: string; otp: string }) =>
    api.post<ApiResponse<AuthResponseData>>('/auth/verify-otp', data),

  sendPhoneOTP: (data: { phone: string }) =>
    api.post<ApiResponse<{ message: string }>>(
      '/auth/send-phone-otp',
      data
    ),

  verifyPhoneOTPAndRegister: (data: {
    phone: string;
    otp: string;
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    organizationName?: string;
  }) =>
    api.post<ApiResponse<AuthResponseData>>(
      '/auth/verify-phone-otp',
      data
    ),

  refresh: (refreshToken?: string) =>
    api.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', {
      refreshToken,
    }),

  logout: () =>
    api.post<ApiResponse<{ message: string }>>('/auth/logout'),

  logoutAll: () =>
    api.post<ApiResponse<{ message: string }>>('/auth/logout-all'),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    api.post<ApiResponse<{ message: string }>>(
      '/auth/change-password',
      data
    ),
};

// ---------- USERS ----------
export const users = {
  getProfile: () => api.get<ApiResponse>('/users/profile'),

  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  }) => api.put<ApiResponse>('/users/profile', data),

  updateAvatar: (avatar: string) => api.put<ApiResponse>('/users/avatar', { avatar }),

  getStats: () => api.get<ApiResponse>('/users/stats'),

  getSessions: () => api.get<ApiResponse>('/users/sessions'),

  revokeSession: (sessionId: string) => api.delete<ApiResponse>(`/users/sessions/${sessionId}`),

  revokeAllSessions: () => api.delete<ApiResponse>('/users/sessions'),

  deleteAccount: (data: { password: string; reason?: string }) =>
    api.delete<ApiResponse>('/users/account', { data }),

  addPhone: (data: { phone: string }) =>
    api.post<ApiResponse<{
      message: string;
      phone: string;
      whatsappSent: boolean;
    }>>('/users/add-phone', data),
};

// ---------- ORGANIZATIONS ----------
export const organizations = {
  getAll: () => api.get<ApiResponse>('/organizations'),

  getCurrent: () => api.get<ApiResponse>('/organizations/current'),

  getById: (id: string) => api.get<ApiResponse>(`/organizations/${id}`),

  create: (data: { name: string; slug?: string }) => api.post<ApiResponse>('/organizations', data),

  update: (id: string, data: any) => api.put<ApiResponse>(`/organizations/${id}`, data),

  delete: (id: string, password: string) =>
    api.delete<ApiResponse>(`/organizations/${id}`, { data: { password } }),

  inviteMember: (orgId: string, data: { email: string; role: string }) =>
    api.post<ApiResponse>(`/organizations/${orgId}/members`, data),

  updateMemberRole: (orgId: string, memberId: string, role: string) =>
    api.put<ApiResponse>(`/organizations/${orgId}/members/${memberId}`, { role }),

  removeMember: (orgId: string, memberId: string) =>
    api.delete<ApiResponse>(`/organizations/${orgId}/members/${memberId}`),

  switch: (orgId: string) => api.post<ApiResponse>(`/organizations/${orgId}/switch`),
};

// ---------- CONTACTS ----------
export const contacts = {
  getAll: (params?: any) => api.get<ApiResponse>('/contacts', { params }),
  create: (data: any) => api.post<ApiResponse>('/contacts', data),
  getById: (id: string) => api.get<ApiResponse>(`/contacts/${id}`),
  update: (id: string, data: any) => api.put<ApiResponse>(`/contacts/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/contacts/${id}`),
  import: (data: any) => api.post<ApiResponse>('/contacts/import', data),
  export: (format: string = 'csv') =>
    api.get(`/contacts/export?format=${format}`, { responseType: 'blob' }),
  stats: () => api.get<ApiResponse>('/contacts/stats'),
  getTags: () => api.get<ApiResponse>('/contacts/tags'),
  getGroups: () => api.get<ApiResponse>('/contacts/groups/all'),
};

// ---------- TEMPLATES ----------
export const templates = {
  getAll: (params?: any) => api.get<ApiResponse>('/templates', { params }),

  create: (data: any) => api.post<ApiResponse>('/templates', data),

  getById: (id: string) => api.get<ApiResponse>(`/templates/${id}`),

  update: (id: string, data: any) => api.put<ApiResponse>(`/templates/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/templates/${id}`),

  sync: (whatsappAccountId: string) =>
    api.post<ApiResponse>('/templates/sync', { whatsappAccountId }),

  submitForApproval: (id: string) =>
    api.post<ApiResponse>(`/templates/${id}/submit`),

  stats: () => api.get<ApiResponse>('/templates/stats'),

  uploadMedia: (file: File, whatsappAccountId?: string) => {
    const formData = new FormData();
    formData.append('file', file);

    if (whatsappAccountId) {
      formData.append('whatsappAccountId', whatsappAccountId);
    }

    console.log('📤 API: Uploading media:', {
      filename: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type,
      accountId: whatsappAccountId || 'auto',
    });

    return api.post<ApiResponse<{
      cloudinaryUrl: string;
      permanentUrl?: string;
      mediaHandle?: string;
      metaNumericId?: string;
      mediaId: string;
      filename: string;
      mimeType: string;
      size: number;
      whatsappAccountId?: string;
      wabaId?: string;
      url: string;
    }>>('/templates/upload-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },
};

// ---------- CAMPAIGNS ----------
export const campaigns = {
  getAll: (params?: any) => api.get<ApiResponse>('/campaigns', { params }),

  create: (data: any) => api.post<ApiResponse>('/campaigns', data),

  uploadContacts: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post<ApiResponse>('/campaigns/upload-contacts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getUploadTemplate: () => api.get<ApiResponse>('/campaigns/upload-template'),

  validateCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post<ApiResponse>('/campaigns/upload-validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getById: (id: string) => api.get<ApiResponse>(`/campaigns/${id}`),

  update: (id: string, data: any) => api.put<ApiResponse>(`/campaigns/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/campaigns/${id}`),

  start: (id: string) => api.post<ApiResponse>(`/campaigns/${id}/start`),

  pause: (id: string) => api.post<ApiResponse>(`/campaigns/${id}/pause`),

  resume: (id: string) => api.post<ApiResponse>(`/campaigns/${id}/resume`),

  cancel: (id: string) => api.post<ApiResponse>(`/campaigns/${id}/cancel`),

  duplicate: (id: string, name: string) =>
    api.post<ApiResponse>(`/campaigns/${id}/duplicate`, { name }),

  getContacts: (id: string, params?: any) =>
    api.get<ApiResponse>(`/campaigns/${id}/contacts`, { params }),

  getAnalytics: (id: string) =>
    api.get<ApiResponse>(`/campaigns/${id}/analytics`),

  stats: () => api.get<ApiResponse>('/campaigns/stats'),

  getFailedContacts: (campaignId: string, page = 1, limit = 100) =>
    api.get<ApiResponse>(`/campaigns/${campaignId}/failed`, { params: { page, limit } }),

  exportFailedContacts: (campaignId: string) =>
    api.get(`/campaigns/${campaignId}/failed/export`, { responseType: 'blob' }),

  getRecipients: (campaignId: string, params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get<ApiResponse>(`/campaigns/${campaignId}/recipients`, { params }),

  exportRecipients: (campaignId: string, status?: string) =>
    api.get(`/campaigns/${campaignId}/recipients/export`, {
      params: { status },
      responseType: 'blob',
    }),

  getDetailedStats: (campaignId: string) =>
    api.get<ApiResponse>(`/campaigns/${campaignId}/stats`),

  resumePending: (campaignId: string) =>
    api.post<ApiResponse>(`/campaigns/${campaignId}/resume`),

  retryFailed: (campaignId: string, data: { contactIds?: string[] }) =>
    api.post<ApiResponse>(`/campaigns/${campaignId}/retry`, data),
  estimateCost: (campaignId: string) =>
    api.get<ApiResponse>(`/campaigns/${campaignId}/estimate-cost`),
};

// ---------- ANALYTICS ----------
export const analytics = {
  getOverview: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse>('/analytics/overview', { params }),

  getMessages: (days?: number) =>
    api.get<ApiResponse>('/analytics/messages', { params: { days } }),

  getCampaigns: (limit?: number) =>
    api.get<ApiResponse>('/analytics/campaigns', { params: { limit } }),

  getContacts: (days?: number) =>
    api.get<ApiResponse>('/analytics/contacts', { params: { days } }),

  getConversations: (days?: number) =>
    api.get<ApiResponse>('/analytics/conversations', { params: { days } }),

  getTemplates: () =>
    api.get<ApiResponse>('/analytics/templates'),

  export: (type: string, format?: string) =>
    api.get<ApiResponse>('/analytics/export', { params: { type, format } }),
};

// ---------- WHATSAPP ----------
export const whatsapp = {
  accounts: async () => {
    try {
      const response = await api.get('/meta/accounts');

      let accounts = [];

      if (Array.isArray(response.data?.data)) {
        accounts = response.data.data;
      } else if (Array.isArray(response.data?.data?.accounts)) {
        accounts = response.data.data.accounts;
      } else if (response.data?.data) {
        accounts = [response.data.data];
      }

      console.log('📱 Fetched accounts:', accounts.length);

      return {
        ...response,
        data: {
          ...response.data,
          data: {
            accounts: accounts,
          }
        }
      } as any;
    } catch (error) {
      console.error('❌ Failed to fetch accounts:', error);
      throw error;
    }
  },

  getAccount: (id: string) => api.get<ApiResponse>(`/meta/accounts/${id}`),
  connect: (data: { code: string; state?: string }) =>
    api.post<ApiResponse>('/meta/connect', data),
  disconnect: (id: string) => api.delete<ApiResponse>(`/meta/accounts/${id}`),
  setDefault: (id: string) => api.post<ApiResponse>(`/meta/accounts/${id}/set-default`),
  sendText: async (data: {
    whatsappAccountId: string;
    to: string;
    message: string;
    tempId?: string;
  }) => {
    const response = await api.post<ApiResponse>('/whatsapp/send/text', data);

    const now = new Date().toISOString();

    if (response.data?.data) {
      const msgData = response.data.data as any;
      response.data.data = {
        ...msgData,
        createdAt: msgData.createdAt || msgData.sentAt || now,
        sentAt: msgData.sentAt || msgData.createdAt || now,
      };
    }

    console.log('📤 Normalized send response:', response.data);

    return response;
  },
  sendTemplate: async (data: any) => {
    const response = await api.post<ApiResponse>('/whatsapp/send/template', data);

    const now = new Date().toISOString();

    if (response.data?.data) {
      const msgData = response.data.data as any;
      response.data.data = {
        ...msgData,
        createdAt: msgData.createdAt || msgData.sentAt || now,
        sentAt: msgData.sentAt || msgData.createdAt || now,
      };
    }

    console.log('📤 Normalized sendTemplate response:', response.data);

    return response;
  },

  syncAccountQuality: (accountId: string) =>
    api.post<ApiResponse>(
      `/whatsapp/accounts/${accountId}/sync-quality`
    ),

  syncAllAccountsQuality: () =>
    api.post<ApiResponse<{
      accounts: any[];
      syncStats: {
        total: number;
        synced: number;
        failed: number;
      };
    }>>('/whatsapp/accounts/sync-all'),
};

// ---------- META ----------
export const meta = {
  connect: (data: {
    code: string;
    organizationId: string;
    wabaId?: string;
    phoneNumberId?: string;
  }) =>
    api.post<ApiResponse<{ account: any }>>('/meta/connect', data),
  getOrgStatus: (organizationId: string) =>
    api.get<ApiResponse<{ status: 'CONNECTED' | 'DISCONNECTED'; connectedCount: number }>>(
      `/meta/organizations/${organizationId}/status`
    ),
};

// ---------- INBOX ----------
export const inbox = {
  getConversations: (params?: any) => api.get<ApiResponse>('/inbox/conversations', { params }),
  getConversation: (id: string) => api.get<ApiResponse>(`/inbox/conversations/${id}`),
  getMessages: (conversationId: string, params?: any) =>
    api.get<ApiResponse>(`/inbox/conversations/${conversationId}/messages`, { params }),
  sendMessage: async (conversationId: string, data: { content: string; type?: string }) => {
    const response = await api.post<ApiResponse>(
      `/inbox/conversations/${conversationId}/messages`,
      data
    );

    const now = new Date().toISOString();

    if (response.data?.data) {
      const msgData = response.data.data as any;
      response.data.data = {
        ...msgData,
        createdAt: msgData.createdAt || msgData.sentAt || now,
        sentAt: msgData.sentAt || msgData.createdAt || now,
      };
    }

    return response;
  },
  markAsRead: (conversationId: string) =>
    api.post<ApiResponse>(`/inbox/conversations/${conversationId}/read`),
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse>('/inbox/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  stats: () => api.get<ApiResponse>('/inbox/stats'),
  resolveTemplateMedia: (templateId: string) =>
    api.post('/inbox/template/resolve-media', { templateId }),
  getLabels: () => api.get<ApiResponse>('/inbox/labels'),
  createCustomLabel: (label: string, color?: string) => api.post<ApiResponse>('/inbox/labels', { label, color }),
  deleteCustomLabel: (label: string) => api.delete<ApiResponse>(`/inbox/labels/${label}`),
  addLabels: (id: string, labels: string[]) => api.post<ApiResponse>(`/inbox/conversations/${id}/labels`, { labels }),
  removeLabel: (id: string, label: string) => api.delete<ApiResponse>(`/inbox/conversations/${id}/labels/${label}`),
  deleteAllConversations: () => api.delete<ApiResponse>('/inbox/delete-all'),
  bulkUpdate: (data: { conversationIds: string[];[key: string]: any }) => api.post<ApiResponse>('/inbox/bulk', data),
  bulkDeleteConversations: (conversationIds: string[]) => api.post<ApiResponse>('/inbox/bulk-delete', { conversationIds }),
};

// ─── Voice message upload ────────────────────────────────────────────────────
export const uploadVoiceMessage = async (
  conversationId: string,
  blob: Blob,
  duration: number,
  whatsappAccountId: string
) => {
  const form = new FormData();
  form.append('file', blob, `voice-${Date.now()}.webm`);
  form.append('conversationId', conversationId);
  form.append('duration', String(duration));
  form.append('whatsappAccountId', whatsappAccountId);
  form.append('type', 'audio');

  return api.post('/inbox/media/upload-voice', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ---------- CHATBOT ----------
export const chatbots = {
  getAll: () => api.get<ApiResponse>('/chatbots'),
  getById: (id: string) => api.get<ApiResponse>(`/chatbots/${id}`),
  create: (data: any) => api.post<ApiResponse>('/chatbots', data),
  update: (id: string, data: any) => api.put<ApiResponse>(`/chatbots/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/chatbots/${id}`),
  activate: (id: string) => api.post<ApiResponse>(`/chatbots/${id}/activate`),
  deactivate: (id: string) => api.post<ApiResponse>(`/chatbots/${id}/deactivate`),
  duplicate: (id: string, name: string) => api.post<ApiResponse>(`/chatbots/${id}/duplicate`, { name }),
};

// ---------- CRM ----------
export const crm = {
  getStats: () => api.get<ApiResponse>('/crm/stats'),
  syncFromContacts: () => api.post<ApiResponse>('/crm/sync-from-contacts'),

  getPipelines: () => api.get<ApiResponse>('/crm/pipelines'),
  createPipeline: (data: any) => api.post<ApiResponse>('/crm/pipelines', data),

  getLeads: (params?: any) => api.get<ApiResponse>('/crm/leads', { params }),
  getInterestedLeads: (params?: any) => api.get<ApiResponse>('/crm/leads/interested', { params }),
  getLeadById: (id: string) => api.get<ApiResponse>(`/crm/leads/${id}`),
  createLead: (data: any) => api.post<ApiResponse>('/crm/leads', data),
  updateLead: (id: string, data: any) => api.put<ApiResponse>(`/crm/leads/${id}`, data),
  deleteLead: (id: string) => api.delete<ApiResponse>(`/crm/leads/${id}`),

  getLeadNotes: (leadId: string) => api.get<ApiResponse>(`/crm/leads/${leadId}/notes`),
  addLeadNote: (leadId: string, content: string) => api.post<ApiResponse>(`/crm/leads/${leadId}/notes`, { content }),

  addLeadTask: (leadId: string, data: any) => api.post<ApiResponse>(`/crm/leads/${leadId}/tasks`, data),
  completeTask: (taskId: string) => api.put<ApiResponse>(`/crm/tasks/${taskId}/complete`),

  getContactNotes: (contactId: string) => api.get<ApiResponse>(`/crm/contacts/${contactId}/notes`),
  addContactNote: (contactId: string, content: string) => api.post<ApiResponse>(`/crm/contacts/${contactId}/notes`, { content }),
};

// ---------- AUTOMATIONS ----------
export const automations = {
  getAll: () => api.get<ApiResponse>('/automations'),
  getById: (id: string) => api.get<ApiResponse>(`/automations/${id}`),
  create: (data: any) => api.post<ApiResponse>('/automations', data),
  update: (id: string, data: any) => api.put<ApiResponse>(`/automations/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/automations/${id}`),
  toggle: (id: string) => api.post<ApiResponse>(`/automations/${id}/toggle`),
};

// ---------- BILLING ----------
export const billing = {
  getCurrentPlan: () => api.get<ApiResponse>('/billing/plan'),
  getPlans: () => api.get<ApiResponse>('/billing/plans'),
  getUsage: () => api.get<ApiResponse>('/billing/usage'),
  upgrade: (data: { planType: string; billingCycle: string }) =>
    api.post<ApiResponse>('/billing/upgrade', data),
  cancel: () => api.post<ApiResponse>('/billing/cancel'),
  getInvoices: (params?: any) => api.get<ApiResponse>('/billing/invoices', { params }),
  createRazorpayOrder: (data: { planKey: string; billingCycle?: string }) =>
    api.post<ApiResponse>('/billing/razorpay/create-order', data),
  verifyRazorpayPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => api.post<ApiResponse>('/billing/razorpay/verify', data),
};

// ---------- WALLET ----------
export const wallet = {
  getWallet: () => api.get<ApiResponse>('/wallet'),

  requestAccess: (data: { reason: string; additionalInfo?: string }) =>
    api.post<ApiResponse>('/wallet/request-access', data),

  getTransactions: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get<ApiResponse>('/wallet/transactions', { params }),

  createTopUpOrder: (amount: number) =>
    api.post<ApiResponse>('/wallet/topup/create-order', { amount }),

  verifyTopUp: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    amount: number;
  }) => api.post<ApiResponse>('/wallet/topup/verify', data),

  getAnalytics: () => api.get<ApiResponse>('/wallet/analytics'),

  adminGetAllWallets: (params?: {
    page?: number;
    limit?: number;
    flagged?: boolean;
    isActive?: boolean;
  }) => api.get<ApiResponse>('/admin/wallets', { params }),

  adminGetRequests: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse>('/admin/wallets/requests', { params }),

  adminReviewRequest: (
    requestId: string,
    data: { action: 'approve' | 'reject'; note?: string }
  ) => api.patch<ApiResponse>(`/admin/wallets/requests/${requestId}/review`, data),

  adminAdjustBalance: (
    organizationId: string,
    data: { type: 'admin_credit' | 'admin_debit'; amount: number; note: string }
  ) => api.patch<ApiResponse>(`/admin/wallets/${organizationId}/adjust`, data),

  adminSetCredit: (
    organizationId: string,
    data: { creditLimit: number; enable: boolean }
  ) => api.patch<ApiResponse>(`/admin/wallets/${organizationId}/credit`, data),

  adminFlagWallet: (
    organizationId: string,
    data: { reason?: string; unflag?: boolean }
  ) => api.patch<ApiResponse>(`/admin/wallets/${organizationId}/flag`, data),

  adminToggleWallet: (
    organizationId: string,
    data: { activate: boolean; reason?: string }
  ) => api.patch<ApiResponse>(`/admin/wallets/${organizationId}/toggle`, data),
};

// ---------- SETTINGS ----------
export const settings = {
  getAll: () => api.get<ApiResponse>('/settings'),
  update: (data: any) => api.put<ApiResponse>('/settings', data),
  getWebhooks: () => api.get<ApiResponse>('/settings/webhooks'),
  updateWebhooks: (data: any) => api.put<ApiResponse>('/settings/webhooks', data),
  testWebhook: () => api.post<ApiResponse>('/settings/webhooks/test'),
  getApiKeys: () => api.get<ApiResponse>('/settings/api-keys'),
  generateApiKey: (data: { name: string }) =>
    api.post<ApiResponse>('/settings/api-keys', data),
  revokeApiKey: (id: string) =>
    api.delete<ApiResponse>(`/settings/api-keys/${id}`),
};

// ---------- TEAM ----------
export const team = {
  getMembers: () => api.get<ApiResponse>('/team/members'),
  inviteMember: (data: { email: string; role: string }) =>
    api.post<ApiResponse>('/team/invite', data),
  updateMemberRole: (memberId: string, role: string) =>
    api.put<ApiResponse>(`/team/members/${memberId}`, { role }),
  removeMember: (memberId: string) =>
    api.delete<ApiResponse>(`/team/members/${memberId}`),
  getInvitations: () => api.get<ApiResponse>('/team/invitations'),
  cancelInvitation: (id: string) =>
    api.delete<ApiResponse>(`/team/invitations/${id}`),
  resendInvitation: (id: string) =>
    api.post<ApiResponse>(`/team/invitations/${id}/resend`),
};

// ---------- DASHBOARD ----------
export const dashboard = {
  getStats: () => api.get<ApiResponse>('/dashboard/stats'),
  getWidgets: (days: number = 7) => api.get<ApiResponse>('/dashboard/widgets', { params: { days } }),
  getActivity: (limit: number = 10) =>
    api.get<ApiResponse>('/dashboard/activity', { params: { limit } }),
};

// ---------- ADMIN ----------
export const admin = {
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ token: string; admin: any }>>('/admin/login', data),

  getProfile: () => api.get<ApiResponse>('/admin/profile'),

  getDashboard: () => api.get<ApiResponse>('/admin/dashboard'),

  getUsers: (params?: {
    search?: string;
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => api.get<ApiResponse>('/admin/users', { params }),

  getUser: (id: string) =>
    api.get<ApiResponse>(`/admin/users/${id}`),

  updateUser: (id: string, data: any) =>
    api.put<ApiResponse>(`/admin/users/${id}`, data),

  updateUserStatus: (id: string, status: string) =>
    api.patch<ApiResponse>(`/admin/users/${id}/status`, { status }),

  suspendUser: (id: string) =>
    api.post<ApiResponse>(`/admin/users/${id}/suspend`),

  activateUser: (id: string) =>
    api.post<ApiResponse>(`/admin/users/${id}/activate`),

  updateUserPassword: (id: string, data: { password: string; logoutDevices?: boolean }) =>
    api.patch<ApiResponse>(`/admin/users/${id}/password`, data),

  deleteUser: (id: string) =>
    api.delete<ApiResponse>(`/admin/users/${id}`),

  getOrganizations: (params?: {
    search?: string;
    page?: number;
    limit?: number;
    planType?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => api.get<ApiResponse>('/admin/organizations', { params }),

  getOrganization: (id: string) =>
    api.get<ApiResponse>(`/admin/organizations/${id}`),

  updateOrganization: (id: string, data: any) =>
    api.put<ApiResponse>(`/admin/organizations/${id}`, data),

  deleteOrganization: (id: string) =>
    api.delete<ApiResponse>(`/admin/organizations/${id}`),

  updateSubscription: (id: string, data: any) =>
    api.put<ApiResponse>(`/admin/organizations/${id}/subscription`, data),

  getOrganizationFeatures: (id: string) =>
    api.get<ApiResponse>(`/admin/organizations/${id}/features`),

  updateOrganizationFeatures: (id: string, data: any) =>
    api.put<ApiResponse>(`/admin/organizations/${id}/features`, data),

  getSubscriptions: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    planType?: string;
    excludePlanType?: string;
    search?: string;
  }) => api.get<ApiResponse>('/admin/subscriptions', { params }),

  getSubscriptionStats: () =>
    api.get<ApiResponse>('/admin/subscriptions/stats'),

  assignPlan: (data: {
    organizationId: string;
    planSlug: string;
    validityDays?: number;
    customEndDate?: string;
    reason?: string;
  }) => api.post<ApiResponse>('/admin/subscriptions/assign', data),

  extendSubscription: (organizationId: string, data: {
    additionalDays: number;
    reason?: string;
  }) => api.post<ApiResponse>(`/admin/subscriptions/${organizationId}/extend`, data),

  revokeSubscription: (organizationId: string, data: {
    reason?: string;
    immediate?: boolean;
  }) => api.post<ApiResponse>(`/admin/subscriptions/${organizationId}/revoke`, data),

  getPlans: () => api.get<ApiResponse>('/admin/plans'),

  createPlan: (data: any) =>
    api.post<ApiResponse>('/admin/plans', data),

  updatePlan: (id: string, data: any) =>
    api.put<ApiResponse>(`/admin/plans/${id}`, data),

  deletePlan: (id: string) =>
    api.delete<ApiResponse>(`/admin/plans/${id}`),

  getAdmins: () => api.get<ApiResponse>('/admin/admins'),

  createAdmin: (data: any) =>
    api.post<ApiResponse>('/admin/admins', data),

  updateAdmin: (id: string, data: any) =>
    api.put<ApiResponse>(`/admin/admins/${id}`, data),

  deleteAdmin: (id: string) =>
    api.delete<ApiResponse>(`/admin/admins/${id}`),

  getActivityLogs: (params?: any) =>
    api.get<ApiResponse>('/admin/activity-logs', { params }),

  getSettings: () => api.get<ApiResponse>('/admin/settings'),

  updateSettings: (data: any) =>
    api.put<ApiResponse>('/admin/settings', data),

  getWhatsAppConnections: () => api.get<ApiResponse>('/admin/whatsapp-connections'),
  getWhatsAppStats: () => api.get<ApiResponse>('/admin/whatsapp-stats'),
  updateWhatsAppConnectionType: (accountId: string, connectionType: string) =>
    api.patch<ApiResponse>(`/admin/whatsapp-connections/${accountId}/connection-type`, { connectionType }),
  disconnectWhatsApp: (accountId: string) =>
    api.post<ApiResponse>(`/admin/whatsapp-connections/${accountId}/disconnect`),

  getWalletRequests: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse>('/admin/wallets/requests', { params }),

  getAllWallets: (params?: {
    page?: number;
    limit?: number;
    flagged?: boolean;
    isActive?: boolean;
  }) => api.get<ApiResponse>('/admin/wallets', { params }),

  reviewWalletRequest: (
    requestId: string,
    data: { action: 'approve' | 'reject'; note?: string }
  ) => api.patch<ApiResponse>(
    `/admin/wallets/requests/${requestId}/review`,
    data
  ),

  adjustWalletBalance: (
    organizationId: string,
    data: { type: 'admin_credit' | 'admin_debit'; amount: number; note: string }
  ) => api.patch<ApiResponse>(
    `/admin/wallets/${organizationId}/adjust`,
    data
  ),

  setWalletCredit: (
    organizationId: string,
    data: { creditLimit: number; enable: boolean }
  ) => api.patch<ApiResponse>(
    `/admin/wallets/${organizationId}/credit`,
    data
  ),

  flagWallet: (
    organizationId: string,
    data: { reason?: string; unflag?: boolean }
  ) => api.patch<ApiResponse>(
    `/admin/wallets/${organizationId}/flag`,
    data
  ),

  toggleWalletActive: (
    organizationId: string,
    data: { activate: boolean; reason?: string }
  ) => api.patch<ApiResponse>(
    `/admin/wallets/${organizationId}/toggle`,
    data
  ),

  getUserContacts: (
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      includeDeleted?: boolean;
    }
  ) => api.get<ApiResponse>(`/admin/users/${userId}/contacts`, { params }),

  exportUserContacts: (userId: string) =>
    api.get(`/admin/users/${userId}/contacts/export`, {
      responseType: 'blob',
    }),

  getUserTemplates: (
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      category?: string;
    }
  ) => api.get<ApiResponse>(`/admin/users/${userId}/templates`, { params }),

  getUserAnalytics: (userId: string) =>
    api.get<ApiResponse>(`/admin/users/${userId}/analytics`),

  getUserWallet: (
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      type?: string;
    }
  ) => api.get<ApiResponse>(`/admin/users/${userId}/wallet`, { params }),
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const setAuthToken = (accessToken: string, refreshToken?: string) => {
  setAuthTokens(accessToken, refreshToken);
};

export const removeAuthToken = () => {
  clearAuthData();
};

export const getAuthToken = () => {
  return getAccessToken();
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || error.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
};

export default api;