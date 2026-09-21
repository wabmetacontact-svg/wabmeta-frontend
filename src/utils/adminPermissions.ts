// src/utils/adminPermissions.ts
//
// What the signed-in admin's role may do, as the API reported it at login
// and on every profile check. Only used to hide buttons - the API enforces
// every permission itself, so a stale or edited copy here grants nothing.

const ADMIN_USER_KEY = 'wabmeta_admin_user';

export const getAdminUser = (): { id?: string; role?: string; permissions?: string[]; otpEnabled?: boolean } | null => {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const saveAdminUser = (adminUser: unknown): void => {
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
};

export const adminCan = (permission: string): boolean =>
  !!getAdminUser()?.permissions?.includes(permission);
