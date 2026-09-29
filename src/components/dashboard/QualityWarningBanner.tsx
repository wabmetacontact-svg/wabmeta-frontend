// src/components/dashboard/QualityWarningBanner.tsx
//
// Dashboard caution: koi connected number Medium (YELLOW) ya Low (RED) quality
// par ho to warning + number warm-up guide dikhao.
//
// Rating /meta/accounts se aati hai, jahan admin ka display override pehle hi
// laga hota hai (backend accountView.ts) - isliye yahan wahi dikhta hai jo
// Settings me dikhta hai. Backend rating girne par notification bhi bhejta hai
// (wabmeta-backend src/modules/meta/qualityAlert.ts).

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronDown,
  FileText,
  Bot,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { whatsapp } from '../../services/api';

type Level = 'MEDIUM' | 'LOW';

interface FlaggedAccount {
  id: string;
  phoneNumber: string;
  name: string;
  level: Level;
}

const levelOf = (rating?: string | null): Level | null => {
  switch (String(rating || '').toUpperCase()) {
    case 'YELLOW':
    case 'MEDIUM':
      return 'MEDIUM';
    case 'RED':
    case 'LOW':
      return 'LOW';
    default:
      return null;
  }
};

const STEPS = [
  {
    icon: FileText,
    title: 'Create a Utility template first',
    body: (
      <>
        Start with a <strong>Utility</strong> template (order updates, reminders, confirmations). You can
        draft one with an AI tool like ChatGPT - ask it to keep the wording safe and compliant. Avoid risky
        terms, fake guarantees, promotional language or anything harmful.
      </>
    ),
    link: { to: '/dashboard/templates/new', label: 'Create template' },
  },
  {
    icon: ShieldCheck,
    title: 'Stick to genuine business messaging',
    body: <>Every template should match a real, legitimate business use case your customers expect.</>,
  },
  {
    icon: Bot,
    title: 'Set up an automated chatbot',
    body: (
      <>
        Let an AI agent answer incoming chats automatically so no customer is left waiting. You can ask
        ChatGPT to draft an effective system prompt for it.
      </>
    ),
    link: { to: '/dashboard/ai-agent', label: 'Set up AI Agent' },
  },
  {
    icon: TrendingUp,
    title: 'Follow a gradual campaign schedule',
    body: (
      <>
        Build trust slowly: <strong>Day 1 - maximum 25 contacts</strong>, then increase the volume a little
        every day. Keep this warm-up strictly for <strong>at least 1 week</strong>.
      </>
    ),
  },
];

const QualityWarningBanner: React.FC = () => {
  const [flagged, setFlagged] = useState<FlaggedAccount[]>([]);
  const [open, setOpen] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await whatsapp.accounts();
      const list: any[] = res?.data?.data?.accounts || [];
      setFlagged(
        list
          .filter((a) => ['CONNECTED', 'RESTRICTED'].includes(String(a?.status || '').toUpperCase()))
          .map((a) => ({
            id: a.id,
            phoneNumber: a.phoneNumber,
            name: a.verifiedName || a.displayName || a.phoneNumber,
            level: levelOf(a.qualityRating),
          }))
          .filter((a): a is FlaggedAccount => a.level !== null)
      );
    } catch {
      // Banner optional hai - dashboard ko isse rukna nahi chahiye
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const recheck = async () => {
    setSyncing(true);
    try {
      await Promise.all(flagged.map((a) => whatsapp.syncAccountQuality(a.id)));
      await load();
      toast.success('Quality rating refreshed from Meta');
    } catch {
      toast.error('Could not refresh the rating. Try again later.');
    } finally {
      setSyncing(false);
    }
  };

  if (flagged.length === 0) return null;

  const isLow = flagged.some((a) => a.level === 'LOW');
  const tone = isLow
    ? { box: 'bg-red-50 border-red-200', icon: 'bg-red-100 text-red-600', title: 'text-red-900', text: 'text-red-800', pill: 'bg-red-100 text-red-700' }
    : { box: 'bg-amber-50 border-amber-200', icon: 'bg-amber-100 text-amber-600', title: 'text-amber-900', text: 'text-amber-800', pill: 'bg-amber-100 text-amber-800' };

  return (
    <div className={`rounded-2xl border shadow-sm ${tone.box}`} role="alert">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${tone.icon}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className={`text-sm sm:text-base font-bold ${tone.title}`}>
            {isLow ? 'Your WhatsApp number quality is Low' : 'Your WhatsApp number quality dropped to Medium'}
          </h2>
          <p className={`mt-1 text-xs sm:text-sm ${tone.text}`}>
            {isLow
              ? 'Meta may limit or block this number if quality stays low. Pause large campaigns and warm the number up using the steps below.'
              : 'Meta has flagged this number. Act now before it drops to Low - slow down campaigns and follow the steps below.'}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {flagged.map((a) => (
              <span
                key={a.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${a.level === 'LOW' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}
              >
                {a.name !== a.phoneNumber ? `${a.name} · ` : ''}
                {a.phoneNumber} · {a.level === 'LOW' ? 'Low' : 'Medium'}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-start">
          <button
            onClick={recheck}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            Re-check
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${tone.pill}`}
          >
            {open ? 'Hide guide' : 'How to fix'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 sm:px-5 pb-5">
          <div className="rounded-xl bg-white border border-gray-200 p-4 sm:p-5">
            <h3 className="text-sm font-bold text-gray-900">How to warm up your WhatsApp number</h3>
            <ol className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">
                      {i + 1}. {s.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600 leading-relaxed">{s.body}</p>
                    {s.link && (
                      <Link
                        to={s.link.to}
                        className="mt-1.5 inline-block text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        {s.link.label} →
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityWarningBanner;
