// src/components/admin/AdminSearch.tsx
//
// One box that finds a user (email, name, phone), an organization (name,
// slug, id), a WhatsApp number, or a payment (Razorpay payment/order id).

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CreditCard, Loader2, Phone, Search, User } from 'lucide-react';
import { admin } from '../../services/api';

type Results = { users: any[]; organizations: any[]; whatsappAccounts: any[]; payments: any[] };
const EMPTY: Results = { users: [], organizations: [], whatsappAccounts: [], payments: [] };

const AdminSearch: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results>(EMPTY);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(EMPTY);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      admin
        .search(q.trim())
        .then((r) => setResults(r.data.data || EMPTY))
        .catch(() => setResults(EMPTY))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    setQ('');
    navigate(path);
  };

  const total =
    results.users.length + results.organizations.length + results.whatsappAccounts.length + results.payments.length;

  const Item: React.FC<{ icon: typeof User; title: string; sub?: string; onClick: () => void }> = ({ icon: Icon, title, sub, onClick }) => (
    <button onClick={onClick} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <span className="min-w-0">
        <span className="block text-sm text-gray-900 truncate">{title}</span>
        {sub && <span className="block text-xs text-gray-500 truncate">{sub}</span>}
      </span>
    </button>
  );

  return (
    <div ref={box} className="relative w-full max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        aria-label="Search everything"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search users, organizations, numbers, payment ids…"
        className="w-full pl-9 pr-9 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}

      {open && q.trim().length >= 2 && !loading && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-[70vh] overflow-y-auto py-1">
          {total === 0 && <p className="px-3 py-4 text-sm text-gray-400 text-center">Nothing found.</p>}
          {results.organizations.map((o) => (
            <Item key={`o${o.id}`} icon={Building2} title={o.name} sub={`${o.planType} · ${o.status}`} onClick={() => go(`/manage-wabmeta-admin/organizations/${o.id}`)} />
          ))}
          {results.users.map((u) => (
            <Item key={`u${u.id}`} icon={User} title={[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email} sub={`${u.email}${u.phone ? ` · ${u.phone}` : ''} · ${u.status}`} onClick={() => go(`/manage-wabmeta-admin/users/${u.id}`)} />
          ))}
          {results.whatsappAccounts.map((w) => (
            <Item key={`w${w.id}`} icon={Phone} title={`${w.displayName || ''} ${w.phoneNumber}`.trim()} sub={`${w.organization?.name || ''} · ${w.status}`} onClick={() => go(`/manage-wabmeta-admin/organizations/${w.organization?.id}`)} />
          ))}
          {results.payments.map((p) => (
            <Item key={`p${p.id}`} icon={CreditCard} title={`₹${(p.amount / 100).toLocaleString('en-IN')} · ${p.planName || 'Payment'} · ${p.status}`} sub={`${p.organization?.name || ''} · ${p.razorpayPaymentId || p.id}`} onClick={() => go(`/manage-wabmeta-admin/organizations/${p.organization?.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSearch;
