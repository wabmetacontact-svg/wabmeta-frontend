// src/components/dashboard/AnnouncementBar.tsx
//
// Announcements an admin has published for this organization. Each can be
// dismissed; the dismissal is remembered in this browser only.

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, Megaphone, X } from 'lucide-react';
import { announcements } from '../../services/api';

interface Announcement {
  id: string;
  title: string;
  message: string;
  level: 'INFO' | 'WARNING' | 'CRITICAL';
}

const DISMISSED_KEY = 'wabmeta_dismissed_announcements';

const readDismissed = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
};

const STYLE: Record<Announcement['level'], { box: string; icon: typeof Info }> = {
  INFO: { box: 'bg-blue-50 border-blue-200 text-blue-900', icon: Megaphone },
  WARNING: { box: 'bg-amber-50 border-amber-200 text-amber-900', icon: AlertTriangle },
  CRITICAL: { box: 'bg-red-50 border-red-200 text-red-900', icon: AlertTriangle },
};

const AnnouncementBar: React.FC = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);

  useEffect(() => {
    let alive = true;
    announcements
      .active()
      .then((res) => alive && setItems(res.data?.data || []))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const dismiss = (id: string) => {
    const next = [...dismissed, id].slice(-50);
    setDismissed(next);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // Private mode: it just comes back next visit.
    }
  };

  // Critical ones cannot be dismissed.
  const visible = items.filter((a) => a.level === 'CRITICAL' || !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visible.map((a) => {
        const { box, icon: Icon } = STYLE[a.level] || STYLE.INFO;
        return (
          <div key={a.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${box}`}>
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-sm mt-0.5 whitespace-pre-line opacity-90">{a.message}</p>
            </div>
            {a.level !== 'CRITICAL' && (
              <button aria-label="Dismiss" onClick={() => dismiss(a.id)} className="opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBar;
