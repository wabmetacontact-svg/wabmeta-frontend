// src/services/impersonation.ts
//
// An admin's read-only "view as user" session in the customer app.
//
// The admin panel gets a 30-minute token from the API and opens
// /impersonate#... in a new tab. That page stores the token where the app
// normally keeps a user's token and reloads, so the whole app runs as that
// user. The backend refuses every change made with this token.
//
// localStorage is shared by every tab of the site, so whatever user session
// this browser already had is set aside first and put back on exit.

const FLAG = 'wabmeta_impersonation';
const BACKUP = 'wabmeta_impersonation_backup';

// The keys a user session lives in (see TOKEN_KEYS in api.ts).
const USER_KEYS = [
  'accessToken',
  'refreshToken',
  'wabmeta_user',
  'wabmeta_org',
  'currentOrganizationId',
] as const;

export interface ImpersonationInfo {
  userName: string;
  userEmail: string;
  organizationName: string;
  expiresAt: string;
  /** Where "Exit" takes the admin back to. */
  returnTo: string;
}

export const getImpersonation = (): ImpersonationInfo | null => {
  try {
    const raw = localStorage.getItem(FLAG);
    return raw ? (JSON.parse(raw) as ImpersonationInfo) : null;
  } catch {
    return null;
  }
};

export const isImpersonating = (): boolean => getImpersonation() !== null;

export const startImpersonation = (accessToken: string, info: ImpersonationInfo): void => {
  // Back up a real session only once - a second "view as" must not
  // overwrite the backup with the first impersonated session.
  if (!isImpersonating()) {
    const backup: Record<string, string> = {};
    for (const key of USER_KEYS) {
      const value = localStorage.getItem(key);
      if (value !== null) backup[key] = value;
    }
    localStorage.setItem(BACKUP, JSON.stringify(backup));
  }

  for (const key of USER_KEYS) localStorage.removeItem(key);
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem(FLAG, JSON.stringify(info));
};

/** Drop the admin view and put back whatever session was there before. */
export const endImpersonation = (): string => {
  const info = getImpersonation();

  for (const key of USER_KEYS) localStorage.removeItem(key);
  try {
    const backup = JSON.parse(localStorage.getItem(BACKUP) || '{}') as Record<string, string>;
    for (const [key, value] of Object.entries(backup)) localStorage.setItem(key, value);
  } catch {
    // Nothing to restore.
  }
  localStorage.removeItem(BACKUP);
  localStorage.removeItem(FLAG);

  return info?.returnTo || '/manage-wabmeta-admin/users';
};
