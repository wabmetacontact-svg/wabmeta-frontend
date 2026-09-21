// src/components/admin/UserAccountControl.tsx
//
// On a user's admin page: their organizations (with a way into each one's
// Control page and a read-only "view as" for each), and their sessions.

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Eye, Laptop, Loader2, LogOut, Shield, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import { adminCan } from '../../utils/adminPermissions';

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
  organizations: { id: string; name: string; role?: string }[];
}

const errorText = (err: any, fallback: string) => err?.response?.data?.message || fallback;

const deviceName = (ua?: string | null) => {
  if (!ua) return 'Unknown device';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad/i.test(ua)) return 'iPhone / iPad';
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac os/i.test(ua)) return 'Mac';
  if (/okhttp|expo|reactnative/i.test(ua)) return 'Mobile app';
  return ua.slice(0, 40);
};

const UserAccountControl: React.FC<Props> = ({ userId, userName, userEmail, organizations }) => {
  const confirm = useConfirm();
  const [sessions, setSessions] = useState<any[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const canSessions = adminCan('sessions.manage');
  const canImpersonate = adminCan('impersonate');

  const loadSessions = useCallback(async () => {
    try {
      const res = await admin.getUserSessions(userId);
      setSessions(res.data.data || []);
    } catch {
      setSessions([]);
    }
  }, [userId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const revoke = async (sessionId: string) => {
    setBusy(sessionId);
    try {
      await admin.revokeUserSession(userId, sessionId);
      toast.success('Session ended. The device is signed out at its next token renewal.');
      await loadSessions();
    } catch (err) {
      toast.error(errorText(err, 'Could not end the session'));
    } finally {
      setBusy(null);
    }
  };

  const logoutEverywhere = async () => {
    const ok = await confirm({
      title: `Sign ${userName} out everywhere?`,
      message: 'Every device is signed out immediately. They can sign in again.',
      confirmLabel: 'Sign out everywhere',
      tone: 'danger',
    });
    if (!ok) return;

    setBusy('all');
    try {
      await admin.forceLogoutUser(userId);
      toast.success('Signed out on every device');
      await loadSessions();
    } catch (err) {
      toast.error(errorText(err, 'Could not sign out'));
    } finally {
      setBusy(null);
    }
  };

  // Which organization's "view as" form is open, and its reason.
  const [viewOrg, setViewOrg] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const viewAs = async (org: { id: string; name: string }) => {
    if (reason.trim().length < 3) {
      toast.error('Write a short reason. It is recorded in the audit log.');
      return;
    }

    // Open the tab now, inside the click, so a popup blocker allows it; the
    // address is filled in once the token arrives.
    const tab = window.open('about:blank', '_blank');
    setBusy(`view-${org.id}`);
    try {
      const res = await admin.impersonateUser(userId, { organizationId: org.id, reason: reason.trim() });
      const d = res.data.data;
      const params = new URLSearchParams({
        token: d.accessToken,
        name: userName,
        email: userEmail,
        org: d.organization?.name || org.name,
        expiresAt: d.expiresAt,
        returnTo: `/manage-wabmeta-admin/users/${userId}`,
      });
      const url = `/impersonate#${params.toString()}`;
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        window.location.href = url;
      }
      setViewOrg(null);
      setReason('');
    } catch (err) {
      tab?.close();
      toast.error(errorText(err, 'Could not open the view'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Organizations */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-500" />
          Organizations
        </h3>
        {organizations.length === 0 ? (
          <p className="text-sm text-gray-500">Not a member of any organization.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {organizations.map((org) => (
              <li key={org.id} className="py-2.5 flex items-center gap-3 flex-wrap">
                <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{org.name}</p>
                  {org.role && <p className="text-xs text-gray-500">{org.role}</p>}
                </div>
                <Link
                  to={`/manage-wabmeta-admin/organizations/${org.id}/control`}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Control
                </Link>
                {canImpersonate && viewOrg !== org.id && (
                  <button
                    onClick={() => { setViewOrg(org.id); setReason(''); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-medium text-amber-700 hover:bg-amber-50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View as user
                  </button>
                )}
                {canImpersonate && viewOrg === org.id && (
                  <div className="w-full flex items-center gap-2 mt-1">
                    <input
                      aria-label="Reason for viewing"
                      autoFocus
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && viewAs(org)}
                      maxLength={500}
                      placeholder="Reason, e.g. support ticket #123"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <button
                      onClick={() => viewAs(org)}
                      disabled={busy === `view-${org.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-xs font-medium text-amber-950 hover:bg-amber-400 disabled:opacity-50"
                    >
                      {busy === `view-${org.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                      Open read-only view
                    </button>
                    <button aria-label="Cancel" onClick={() => setViewOrg(null)} className="p-1.5 text-gray-400 hover:text-gray-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sessions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Laptop className="w-4 h-4 text-gray-500" />
            Signed-in devices {sessions ? `(${sessions.length})` : ''}
          </h3>
          {canSessions && (
            <button
              onClick={logoutEverywhere}
              disabled={busy === 'all'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {busy === 'all' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              Sign out everywhere
            </button>
          )}
        </div>

        {sessions === null ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-500">No active sessions.</p>
        ) : (
          <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {sessions.map((s) => (
              <li key={s.id} className="py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{deviceName(s.userAgent)}</p>
                  <p className="text-xs text-gray-500">
                    {s.ipAddress || 'IP unknown'} · since {new Date(s.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                {canSessions && (
                  <button
                    aria-label="End this session"
                    onClick={() => revoke(s.id)}
                    disabled={busy === s.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {busy === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserAccountControl;
