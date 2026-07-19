import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, ExternalLink, X } from 'lucide-react';

/* ── constants ─────────────────────────────────────────── */
const KEY = 'wm_social_v2';

const LINKS = {
  instagram:
    'https://www.instagram.com/wabmeta_business?igsh=MW04YTVvb3Qzem5tcg%3D%3D&utm_source=qr',
  facebook:
    'https://www.facebook.com/share/19Xc9yopfo/?mibextid=wwXIfr',
} as const;

type Platform = keyof typeof LINKS;
type State = Record<Platform, boolean>;

/* ── icons ─────────────────────────────────────────────── */
const IgIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <radialGradient id="ig" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig)" strokeWidth="2" />
    <circle cx="12" cy="12" r="5" stroke="url(#ig)" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig)" />
  </svg>
);

const FbIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877F2"
    />
  </svg>
);

/* ── component ─────────────────────────────────────────── */
const SocialFollowCard: React.FC = () => {
  const [done, setDone] = useState<State>({ instagram: false, facebook: false });
  const [show, setShow] = useState(false);
  const [exit, setExit] = useState(false);

  /* hydrate */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s: State = JSON.parse(raw);
        if (s.instagram && s.facebook) return;
        setDone(s);
      }
      setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  /* persist + auto-dismiss */
  const persist = useCallback((next: State) => {
    setDone(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    if (next.instagram && next.facebook) {
      setTimeout(() => {
        setExit(true);
        setTimeout(() => setShow(false), 420);
      }, 2200);
    }
  }, []);

  const open = useCallback(
    (p: Platform) => {
      window.open(LINKS[p], '_blank', 'noopener');
      persist({ ...done, [p]: true });
    },
    [done, persist],
  );

  const dismiss = useCallback(() => {
    persist({ instagram: true, facebook: true });
  }, [persist]);

  if (!show) return null;

  const both = done.instagram && done.facebook;
  const oneDown = done.instagram || done.facebook;

  return (
    <div
      className={`
        mb-6 transition-all duration-[420ms] ease-[cubic-bezier(.4,0,.2,1)]
        ${exit ? 'opacity-0 -translate-y-2 max-h-0 mb-0' : 'opacity-100 translate-y-0 max-h-60'}
      `}
    >
      <div className="relative rounded-2xl bg-white border border-gray-200/80
                      shadow-[0_1px_3px_rgba(0,0,0,.04)] overflow-hidden">

        {/* accent stripe */}
        <div className="absolute inset-y-0 left-0 w-[3px]
                        bg-gradient-to-b from-[#E1306C] via-[#833AB4] to-[#1877F2]" />

        <div className="pl-5 pr-4 py-4 flex items-center gap-4 flex-wrap
                        sm:flex-nowrap">

          {/* ── icon ── */}
          <div
            className={`
              w-10 h-10 rounded-[12px] shrink-0
              flex items-center justify-center
              transition-colors duration-300
              ${both
                ? 'bg-emerald-50 ring-1 ring-emerald-200'
                : 'bg-gray-50 ring-1 ring-gray-200/70'}
            `}
          >
            {both ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              /* tiny social duo */
              <div className="flex -space-x-1">
                <IgIcon className="w-4 h-4" />
                <FbIcon className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* ── copy ── */}
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold text-gray-900 leading-snug">
              {both
                ? "You're connected — thank you!"
                : 'Stay in the loop with WabMeta'}
            </p>
            <p className="text-[12.5px] text-gray-500 leading-relaxed mt-0.5">
              {both
                ? 'Catch the latest updates, tips & releases on your feed.'
                : 'Product updates · growth tips · feature releases'}
            </p>
          </div>

          {/* ── actions ── */}
          {!both && (
            <div className="flex items-center gap-2 shrink-0">
              <Pill
                done={done.instagram}
                onClick={() => open('instagram')}
                icon={<IgIcon className="w-[15px] h-[15px]" />}
                label="Instagram"
                gradient="bg-gradient-to-tr from-[#833AB4] via-[#E1306C] to-[#F77737]"
              />
              <Pill
                done={done.facebook}
                onClick={() => open('facebook')}
                icon={<FbIcon className="w-[15px] h-[15px]" />}
                label="Facebook"
                solid="bg-[#1877F2] hover:bg-[#166FE5]"
              />
            </div>
          )}

          {/* ── dismiss ── */}
          {!both && (
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="p-1.5 -mr-1 rounded-lg text-gray-300
                         hover:text-gray-500 hover:bg-gray-100
                         transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── progress micro-bar ── */}
        {oneDown && !both && (
          <div className="h-[2px] bg-gray-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: '50%' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ── pill sub-component ────────────────────────────────── */
interface PillProps {
  done: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  gradient?: string;
  solid?: string;
}

const Pill: React.FC<PillProps> = ({
  done, onClick, icon, label, gradient, solid,
}) => {
  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5
                        rounded-lg bg-emerald-50 text-emerald-600
                        text-xs font-medium ring-1 ring-emerald-200/60
                        select-none">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        group inline-flex items-center gap-1.5
        px-3.5 py-[7px] rounded-lg text-xs font-semibold text-white
        shadow-sm transition-all duration-200
        hover:shadow-md hover:-translate-y-[1px]
        active:translate-y-0 active:shadow-sm
        ${gradient || solid || ''}
      `}
    >
      {icon}
      <span>{label}</span>
      <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-80
                               transition-opacity" />
    </button>
  );
};

export default SocialFollowCard;
