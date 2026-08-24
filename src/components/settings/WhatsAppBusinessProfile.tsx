// src/components/settings/WhatsAppBusinessProfile.tsx
// WhatsApp Business Profile - what customers see on WhatsApp.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Loader2, Camera, Save, AlertCircle, Building2, BadgeCheck, Clock, XCircle, Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, {
  businessProfile,
  handleApiError,
  type BusinessProfile,
} from '../../services/api';

interface ConnectedAccount {
  id: string;
  phoneNumber: string;
  verifiedName?: string;
  status: string;
}

// Meta ki fixed list - inke alawa koi value accept nahi hoti
const VERTICALS: { value: string; label: string }[] = [
  { value: 'UNDEFINED', label: 'Not set' },
  { value: 'OTHER', label: 'Other' },
  { value: 'AUTO', label: 'Automotive' },
  { value: 'BEAUTY', label: 'Beauty & Spa' },
  { value: 'APPAREL', label: 'Clothing & Apparel' },
  { value: 'EDU', label: 'Education' },
  { value: 'ENTERTAIN', label: 'Entertainment' },
  { value: 'EVENT_PLAN', label: 'Event Planning' },
  { value: 'FINANCE', label: 'Finance & Banking' },
  { value: 'GROCERY', label: 'Food & Grocery' },
  { value: 'GOVT', label: 'Public Service' },
  { value: 'HOTEL', label: 'Hotel & Lodging' },
  { value: 'HEALTH', label: 'Medical & Health' },
  { value: 'NONPROFIT', label: 'Non-profit' },
  { value: 'PROF_SERVICES', label: 'Professional Services' },
  { value: 'RETAIL', label: 'Shopping & Retail' },
  { value: 'TRAVEL', label: 'Travel & Transport' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'NOT_A_BIZ', label: 'Not a business' },
];

const nameStatusBadge = (status?: string | null) => {
  switch ((status || '').toUpperCase()) {
    case 'APPROVED':
      return { label: 'Approved', className: 'bg-emerald-50 text-emerald-700', Icon: BadgeCheck };
    case 'PENDING_REVIEW':
      return { label: 'Pending review', className: 'bg-amber-50 text-amber-700', Icon: Clock };
    case 'DECLINED':
      return { label: 'Declined', className: 'bg-red-50 text-red-700', Icon: XCircle };
    default:
      return null;
  }
};

export default function WhatsAppBusinessProfile() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [accountId, setAccountId] = useState<string>('');
  const [accountsLoading, setAccountsLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [form, setForm] = useState({
    about: '',
    description: '',
    address: '',
    email: '',
    website: '',
    vertical: 'UNDEFINED',
  });

  const [nameOpen, setNameOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameSubmitting, setNameSubmitting] = useState(false);

  const applyProfile = (p: BusinessProfile) => {
    setProfile(p);
    setForm({
      about: p.about || '',
      description: p.description || '',
      address: p.address || '',
      email: p.email || '',
      website: p.websites?.[0] || '',
      vertical: p.vertical || 'UNDEFINED',
    });
  };

  // Connected accounts laao. Ek se zyada hon to user choose kar sake.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get('/meta/accounts');
        const list: ConnectedAccount[] = (res.data?.data || []).filter(
          (a: ConnectedAccount) => a.status === 'CONNECTED'
        );
        if (cancelled) return;

        setAccounts(list);
        if (list.length > 0) setAccountId(list[0].id);
      } catch {
        // account list fail ho to profile fetch waise bhi error dikha dega
      } finally {
        if (!cancelled) setAccountsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!accountId) return;

    try {
      setError(null);
      const res = await businessProfile.get(accountId);
      const data = res.data?.data;
      if (data) applyProfile(data);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (accountId) fetchProfile();
  }, [accountId, fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await businessProfile.update(accountId, {
        about: form.about,
        description: form.description,
        address: form.address,
        email: form.email,
        // Meta websites array leta hai (max 2)
        websites: form.website.trim() ? [form.website.trim()] : [],
        vertical: form.vertical,
      });
      const data = res.data?.data;
      if (data) applyProfile(data);
      toast.success('Business profile updated');
    } catch (err: any) {
      toast.error(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\/(jpeg|jpg|png)$/.test(file.type)) {
      toast.error('Profile picture must be a JPEG or PNG image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }

    setUploading(true);
    try {
      const res = await businessProfile.uploadPicture(accountId, file);
      const data = res.data?.data;
      if (data) applyProfile(data);
      toast.success('Profile picture updated');
    } catch (err: any) {
      toast.error(handleApiError(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submitDisplayName = async () => {
    const name = newName.trim();
    if (name.length < 3) {
      toast.error('Display name must be at least 3 characters');
      return;
    }

    setNameSubmitting(true);
    try {
      const res = await businessProfile.requestDisplayNameChange(accountId, name);
      toast.success(res.data?.message || 'Display name submitted for review');
      setNameOpen(false);
      fetchProfile();
    } catch (err: any) {
      toast.error(handleApiError(err));
    } finally {
      setNameSubmitting(false);
    }
  };

  const badge = nameStatusBadge(profile?.nameStatus);

  const selected = accounts.find((a) => a.id === accountId);

  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <Heading />
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium text-sm">
              No connected WhatsApp number
            </p>
            <p className="text-amber-700 text-xs mt-1">
              Connect a WhatsApp Business number first — your business profile
              lives on that number.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Heading />

      {/* Account picker - sirf tab jab ek se zyada number ho */}
      {accounts.length > 1 && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            WhatsApp number
          </label>
          <select
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              setLoading(true);
            }}
            className="w-full sm:w-auto px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.phoneNumber}
                {a.verifiedName ? ` — ${a.verifiedName}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
          <Phone className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">
            {selected?.phoneNumber || ''}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
            <p className="text-sm text-slate-500">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-slate-600 text-center">{error}</p>
            <button
              onClick={fetchProfile}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 py-5 space-y-5">
              {/* Picture + display name */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="relative">
                  {profile?.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-slate-400" />
                    </div>
                  )}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-60"
                    title="Change profile picture"
                  >
                    {uploading ? (
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePictureChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 truncate">
                      {profile?.displayName || 'Not set'}
                    </p>
                    {badge && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${badge.className}`}
                      >
                        <badge.Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setNewName(profile?.displayName || '');
                      setNameOpen(true);
                    }}
                    className="mt-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Change display name
                  </button>
                </div>
              </div>

              {/* Display name change */}
              {nameOpen && (
                <div className="p-4 border border-amber-200 bg-amber-50 rounded-xl space-y-3">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    This is the name customers see. Meta reviews every change, and once
                    it is approved you need to reconnect the number before the new name
                    takes effect. Meta allows 10 changes per 30 days.
                  </p>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={75}
                    placeholder="Your business name"
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitDisplayName}
                      disabled={nameSubmitting}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {nameSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Submit for review
                    </button>
                    <button
                      onClick={() => setNameOpen(false)}
                      className="px-3 py-1.5 text-slate-600 rounded-lg text-sm font-medium hover:bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500">
                These details appear on your WhatsApp business profile, where customers can see them.
              </p>

              <Field
                label="About"
                value={form.about}
                onChange={(v) => setForm({ ...form, about: v })}
                placeholder="Short status line"
                maxLength={139}
              />

              <Field
                label="Description"
                value={form.description}
                onChange={(v) => setForm({ ...form, description: v })}
                placeholder="What your business does"
                maxLength={512}
                textarea
              />

              <Field
                label="Address"
                value={form.address}
                onChange={(v) => setForm({ ...form, address: v })}
                placeholder="Business address"
                maxLength={256}
                textarea
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="contact@company.com"
                  maxLength={128}
                  type="email"
                />
                <Field
                  label="Website"
                  value={form.website}
                  onChange={(v) => setForm({ ...form, website: v })}
                  placeholder="https://company.com"
                  maxLength={256}
                  type="url"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Category
                </label>
                <select
                  value={form.vertical}
                  onChange={(e) => setForm({ ...form, vertical: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {VERTICALS.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
        <Building2 className="w-6 h-6 text-slate-400" />
        WhatsApp Business Profile
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        This is how your business appears to customers on WhatsApp
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  textarea,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  textarea?: boolean;
  type?: string;
}) {
  const base =
    'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-600">{label}</label>
        {maxLength && (
          <span className="text-[11px] text-slate-400">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={base}
        />
      )}
    </div>
  );
}
