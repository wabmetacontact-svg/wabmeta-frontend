// src/pages/admin/OrganizationOverview.tsx
//
// One organization end to end: who is in it, what it pays, how it sends,
// what admins have said and done about it.

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Building2, Loader2, Pin, PinOff, Shield, SlidersHorizontal, StickyNote, Tag, Trash2, Wallet, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import PageLoader from '../../components/common/PageLoader';
import { adminCan } from '../../utils/adminPermissions';

const inr = (paise: number | null | undefined) =>
  `₹${((paise ?? 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const dt = (v?: string | null) => (v ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const d = (v?: string | null) => (v ? new Date(v).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—');

const statusTone: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  READ_ONLY: 'bg-amber-50 text-amber-700 border-amber-200',
  SUSPENDED: 'bg-red-50 text-red-700 border-red-200',
};

const Card: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <div className="flex items-center justify-between gap-3 mb-3">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-semibold text-gray-900 mt-0.5">{value}</p>
  </div>
);

const OrganizationOverview: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // An onboarder may keep notes and tags on their own clients.
  const canWrite = adminCan('orgs.write') || adminCan('clients.own');

  const load = useCallback(async () => {
    if (!organizationId) return;
    try {
      const res = await admin.getOrganizationOverview(organizationId);
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not load organization');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveTags = async (tags: string[]) => {
    try {
      const res = await admin.setTags(organizationId!, tags);
      setData((prev: any) => ({ ...prev, organization: { ...prev.organization, adminTags: res.data.data.adminTags } }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not save tags');
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await admin.addNote(organizationId!, { body: noteText.trim() });
      setNoteText('');
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not add note');
    } finally {
      setSavingNote(false);
    }
  };

  const pin = async (noteId: string, pinned: boolean) => {
    await admin.pinNote(organizationId!, noteId, pinned).catch(() => toast.error('Could not update note'));
    load();
  };

  const removeNote = async (noteId: string) => {
    await admin.deleteNote(organizationId!, noteId).catch(() => toast.error('Could not delete note'));
    load();
  };

  if (loading) return <PageLoader />;
  if (!data) return <div className="text-center py-20 text-gray-500">Organization not found.</div>;

  const { organization: org, owner, members, subscription, whatsappAccounts, wallet, counts, usage, payments, notes } = data;
  const tags: string[] = org.adminTags || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-start gap-4 flex-wrap">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shrink-0">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-[220px]">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{org.name}</h1>
            <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${statusTone[org.status] || statusTone.ACTIVE}`}>{org.status}</span>
            {org.deletedAt && <span className="px-2 py-0.5 rounded-md border text-xs bg-gray-100 text-gray-600">Deleted</span>}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Created {d(org.createdAt)} · Owner {owner?.email} {owner?.phone ? `· ${owner.phone}` : ''}
          </p>
          {org.statusReason && <p className="text-xs text-gray-500 mt-1">Reason: {org.statusReason}</p>}

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            <Tag className="w-3.5 h-3.5 text-gray-400" />
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs">
                {t}
                {canWrite && (
                  <button aria-label={`Remove ${t}`} onClick={() => saveTags(tags.filter((x) => x !== t))}>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {canWrite && (
              <input
                aria-label="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    saveTags([...tags, tagInput.trim()]);
                    setTagInput('');
                  }
                }}
                placeholder="+ tag"
                className="w-24 px-2 py-0.5 rounded-md border border-dashed border-gray-300 text-xs focus:outline-none focus:border-gray-500"
              />
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {adminCan('orgs.read') && (
            <Link to={`/manage-wabmeta-admin/organizations/${org.id}/control`} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-black">
              <Shield className="w-4 h-4" /> Control
            </Link>
          )}
          <Link to={`/manage-wabmeta-admin/organizations/${org.id}/billing`} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
            <Wallet className="w-4 h-4" /> Billing
          </Link>
          <Link to={`/manage-wabmeta-admin/organizations/${org.id}/features`} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
            <SlidersHorizontal className="w-4 h-4" /> Features
          </Link>
        </div>
      </div>

      {/* Usage */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Stat label="Plan" value={subscription?.plan?.name || org.planType} />
        <Stat label="Plan ends" value={d(subscription?.currentPeriodEnd)} />
        <Stat label="Messages today" value={usage.messagesToday.toLocaleString('en-IN')} />
        <Stat label="Messages this month" value={usage.messagesThisMonth.toLocaleString('en-IN')} />
        <Stat label="Contacts" value={counts.contacts.toLocaleString('en-IN')} />
        <Stat label="Campaigns" value={counts.campaigns} />
        <Stat label="Last message sent" value={<span className="text-sm">{dt(usage.lastOutboundAt)}</span>} />
        <Stat label="Total paid (last 10)" value={inr(data.totalPaidPaise)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={`Members (${members.length})`}>
          <ul className="divide-y divide-gray-100">
            {members.map((m: any) => (
              <li key={m.id} className="py-2 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Link to={`/manage-wabmeta-admin/users/${m.id}`} className="text-sm text-gray-900 hover:text-primary-600 truncate block">
                    {[m.firstName, m.lastName].filter(Boolean).join(' ') || m.email}
                  </Link>
                  <p className="text-xs text-gray-500">{m.email} · last login {dt(m.lastLoginAt)}</p>
                </div>
                <span className="text-xs text-gray-500">{m.role}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={`WhatsApp numbers (${whatsappAccounts.length})`}>
          {whatsappAccounts.length === 0 ? (
            <p className="text-sm text-gray-500">None connected.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {whatsappAccounts.map((w: any) => (
                <li key={w.id} className="py-2 text-sm flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-gray-900">{w.displayName || w.phoneNumber}</p>
                    <p className="text-xs text-gray-500">{w.phoneNumber} · {w.messagingLimit || 'tier ?'}</p>
                  </div>
                  <span className="text-xs text-gray-600">{w.status}</span>
                  <span className={`text-xs font-medium ${String(w.qualityRating).toUpperCase() === 'RED' ? 'text-red-600' : String(w.qualityRating).toUpperCase() === 'YELLOW' ? 'text-amber-600' : 'text-green-600'}`}>
                    {w.qualityRating || '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Wallet">
          {!wallet ? (
            <p className="text-sm text-gray-500">No wallet.</p>
          ) : (
            <div className="text-sm space-y-1 text-gray-700">
              <p>Status: <strong>{wallet.isActive ? 'Active' : 'Inactive'}</strong></p>
              <p>Balance: <strong>{inr(wallet.balancePaise)}</strong> (alert below {inr(wallet.lowThresholdPaise)})</p>
              {wallet.creditEnabled && <p>Credit: {inr(wallet.creditUsedPaise)} used of {inr(wallet.creditLimitPaise)}</p>}
            </div>
          )}
        </Card>

        <Card title="Payments">
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">No payments.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {payments.map((p: any) => (
                <li key={p.id} className="py-2 flex items-center gap-3">
                  <span className="flex-1 text-gray-700">{p.planName || 'Payment'} · {p.billingCycle || ''}</span>
                  <span className="text-gray-500 text-xs">{d(p.paidAt || p.createdAt)}</span>
                  <span className={`text-xs font-medium ${p.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>{p.status}</span>
                  <span className="font-medium text-gray-900">{inr(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Notes */}
      <Card title="Internal notes" action={<StickyNote className="w-4 h-4 text-gray-400" />}>
        {canWrite && (
          <div className="flex gap-2 mb-3">
            <textarea
              aria-label="New note"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={2}
              maxLength={5000}
              placeholder="Only admins see this. e.g. Promised a 10% discount on renewal."
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button onClick={addNote} disabled={savingNote || !noteText.trim()} className="self-end px-4 py-2 rounded-xl bg-gray-900 text-white text-sm disabled:opacity-50">
              {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
            </button>
          </div>
        )}
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((n: any) => (
              <li key={n.id} className={`rounded-xl border p-3 ${n.pinned ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
                <p className="text-sm text-gray-800 whitespace-pre-line">{n.body}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{n.adminEmail || 'admin'} · {dt(n.createdAt)}</span>
                  {canWrite && (
                    <>
                      <button onClick={() => pin(n.id, !n.pinned)} className="flex items-center gap-1 hover:text-gray-800">
                        {n.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                        {n.pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button onClick={() => removeNote(n.id)} className="flex items-center gap-1 hover:text-red-600">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Recent admin actions">
          {data.recentAdminActions.length === 0 ? (
            <p className="text-sm text-gray-500">None.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-xs">
              {data.recentAdminActions.map((a: any) => (
                <li key={a.id} className="py-2">
                  <code className="text-gray-800">{a.action}</code> · {a.adminEmail} · {dt(a.createdAt)}
                  {a.reason && <span className="text-gray-500"> · “{a.reason}”</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Security events">
          {data.securityEvents.length === 0 ? (
            <p className="text-sm text-gray-500">None.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-xs">
              {data.securityEvents.map((e: any) => (
                <li key={e.id} className="py-2">{e.type} · {e.email || '—'} · {e.ip || '—'} · {dt(e.createdAt)}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default OrganizationOverview;
