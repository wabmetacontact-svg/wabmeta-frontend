// src/pages/Impersonate.tsx
//
// Landing page for an admin's read-only "view as user". The admin panel
// opens /impersonate#<params> in a new tab; the token travels in the URL
// fragment, which browsers never send to a server or put in a Referer.

import React, { useEffect, useState } from 'react';
import { startImpersonation } from '../services/impersonation';

const Impersonate: React.FC = () => {
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('token') || '';

    // Take the token out of the address bar and history straight away.
    window.history.replaceState(null, '', '/impersonate');

    if (token.split('.').length !== 3) {
      setError('This link is not valid. Start the view again from the admin panel.');
      return;
    }

    startImpersonation(token, {
      userName: params.get('name') || '',
      userEmail: params.get('email') || '',
      organizationName: params.get('org') || '',
      expiresAt: params.get('expiresAt') || new Date(Date.now() + 30 * 60_000).toISOString(),
      returnTo: params.get('returnTo') || '/manage-wabmeta-admin/users',
    });

    // Full reload so the app starts up as this user.
    window.location.replace('/dashboard');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <p className="text-sm text-slate-600">{error || 'Opening read-only view…'}</p>
    </div>
  );
};

export default Impersonate;
