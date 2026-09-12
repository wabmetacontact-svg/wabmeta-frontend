// Telegram/Instagram DM se CRM lead banna on/off (backend:
// OrganizationSettings.autoLeadFromSocial).
//
// WhatsApp par lead tab banta hai jab chatbot ya AI agent customer ko qualify
// karta hai. Telegram/Instagram par koi qualify karne wala nahi hai, isliye
// lead customer ke pehle asli message par banta hai - bare /start, button tap
// ya akela "hi" par nahi. Jo org sirf inbox use karta hai, CRM nahi, wo ise
// yahan se band kar sakta hai.

import React, { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { FaInstagram, FaTelegram } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { crm as crmApi } from '../../services/api';

const SocialLeadsCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    let cancelled = false;
    crmApi
      .getSettings()
      .then((res) => {
        if (cancelled || !res.data.success) return;
        // Backend ka default true hai - purana record jisme field hi nahi,
        // usse bhi true hi padhna chahiye.
        const next = res.data.data?.autoLeadFromSocial !== false;
        setEnabled(next);
        setSaved(next);
      })
      .catch(() => {
        // Card default par rehta hai; save karne par asli error dikh jayega.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = enabled !== saved;

  const save = async () => {
    setSaving(true);
    try {
      await crmApi.updateSettings({ autoLeadFromSocial: enabled });
      setSaved(enabled);
      toast.success(
        enabled
          ? 'Telegram and Instagram chats will create leads'
          : 'Telegram and Instagram chats will no longer create leads'
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not save this setting');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-sky-100 text-sky-600 rounded-xl shrink-0 flex items-center gap-1">
            <FaTelegram className="w-4 h-4" />
            <FaInstagram className="w-4 h-4 text-pink-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Leads from Telegram &amp; Instagram</h3>
            <p className="text-sm text-gray-500">
              A lead is created when someone sends their first real message on Telegram or an
              Instagram DM. A bare <code className="px-1 bg-gray-100 rounded">/start</code>, a button
              tap or just &ldquo;hi&rdquo; does not create one. Turn this off if you only use these
              channels in the inbox.
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Create leads from Telegram and Instagram"
          disabled={loading}
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none disabled:opacity-60 ${
            enabled ? 'bg-emerald-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {dirty && (
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialLeadsCard;
