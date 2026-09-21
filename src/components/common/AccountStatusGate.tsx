// src/components/common/AccountStatusGate.tsx
//
// Shows the customer what an admin has decided about their account, and
// shows an admin that they are looking at someone else's account.
//
// The API answers with a code (see the response interceptor in api.ts):
//   MAINTENANCE              the whole platform is down for maintenance
//   ORG_SUSPENDED            this account is suspended
//   ORG_READ_ONLY            this account can look but not change or send
//   IMPERSONATION_READ_ONLY  an admin's read-only view tried to change something

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Ban, Eye, Lock, Wrench, X } from 'lucide-react';
import { endImpersonation, getImpersonation } from '../../services/impersonation';

type Blocking = { code: 'MAINTENANCE' | 'ORG_SUSPENDED'; message: string } | null;

const minutesLeft = (iso: string): number =>
  Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000));

const ImpersonationBar: React.FC = () => {
  const info = getImpersonation();
  const [, tick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!info) return null;

  const exit = () => {
    window.location.href = endImpersonation();
  };

  return (
    <div className="fixed top-0 inset-x-0 z-[9998] bg-amber-500 text-amber-950 text-sm">
      <div className="flex items-center justify-center gap-3 px-4 py-2 flex-wrap">
        <Eye className="w-4 h-4 shrink-0" />
        <span>
          Admin view of <strong>{info.userName || info.userEmail}</strong>
          {info.organizationName ? <> · {info.organizationName}</> : null} · read-only ·{' '}
          ends in {minutesLeft(info.expiresAt)} min
        </span>
        <button
          onClick={exit}
          className="px-3 py-1 rounded-lg bg-amber-950 text-amber-50 font-medium hover:bg-black"
        >
          Exit
        </button>
      </div>
    </div>
  );
};

const AccountStatusGate: React.FC = () => {
  const location = useLocation();
  const [blocking, setBlocking] = useState<Blocking>(null);
  const [readOnly, setReadOnly] = useState<string | null>(null);

  useEffect(() => {
    const onStatus = (event: Event) => {
      const { code, message } = (event as CustomEvent).detail || {};

      if (code === 'MAINTENANCE' || code === 'ORG_SUSPENDED') {
        setBlocking({ code, message: message || '' });
      } else if (code === 'ORG_READ_ONLY') {
        setReadOnly(message || 'This account is in read-only mode.');
      } else if (code === 'IMPERSONATION_READ_ONLY') {
        toast('This is a read-only admin view. Changes are not saved.', { icon: '👁️', id: 'impersonation-ro' });
      }
    };

    window.addEventListener('account_status', onStatus);
    return () => window.removeEventListener('account_status', onStatus);
  }, []);

  // The admin panel has its own session and its own errors.
  if (location.pathname.startsWith('/manage-wabmeta-admin')) return null;

  const signOut = () => {
    ['accessToken', 'refreshToken', 'wabmeta_user', 'wabmeta_org', 'currentOrganizationId'].forEach((k) =>
      localStorage.removeItem(k)
    );
    window.location.href = '/login';
  };

  return (
    <>
      <ImpersonationBar />

      {readOnly && !blocking && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9997] max-w-xl w-[calc(100%-2rem)]">
          <div className="flex items-start gap-3 rounded-xl bg-slate-900 text-white shadow-2xl px-4 py-3">
            <Lock className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
            <p className="text-sm flex-1">{readOnly}</p>
            <button onClick={() => setReadOnly(null)} aria-label="Dismiss" className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {blocking && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${
                blocking.code === 'MAINTENANCE' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
              }`}
            >
              {blocking.code === 'MAINTENANCE' ? <Wrench className="w-7 h-7" /> : <Ban className="w-7 h-7" />}
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              {blocking.code === 'MAINTENANCE' ? 'Scheduled maintenance' : 'Account suspended'}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">{blocking.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-black"
              >
                Try again
              </button>
              {blocking.code === 'ORG_SUSPENDED' && (
                <button
                  onClick={signOut}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountStatusGate;
