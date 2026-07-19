import React, { useEffect, useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

// ─── Config ──────────────────────────────────────────────
const STORAGE_KEY = 'wabmeta_social_connect_v1';

const INSTAGRAM_URL =
  'https://www.instagram.com/wabmeta_business?igsh=MW04YTVvb3Qzem5tcg%3D%3D&utm_source=qr';

const FACEBOOK_URL =
  'https://www.facebook.com/share/19Xc9yopfo/?mibextid=wwXIfr';

type SocialState = {
  instagram: boolean;
  facebook: boolean;
};

// ─── Instagram SVG Icon ──────────────────────────────────
const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

// ─── Facebook SVG Icon ───────────────────────────────────
const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// ─── Component ───────────────────────────────────────────
const SocialFollowCard: React.FC = () => {
  const [state, setState] = useState<SocialState>({
    instagram: false,
    facebook: false,
  });
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  // Load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SocialState;
        if (parsed.instagram && parsed.facebook) {
          setVisible(false);
          return;
        }
        setState(parsed);
      }
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  // Auto-hide after both
  const save = (next: SocialState) => {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (next.instagram && next.facebook) {
      setTimeout(() => {
        setClosing(true);
        setTimeout(() => setVisible(false), 500);
      }, 1800);
    }
  };

  const handleConnect = (platform: 'instagram' | 'facebook') => {
    window.open(
      platform === 'instagram' ? INSTAGRAM_URL : FACEBOOK_URL,
      '_blank',
      'noopener,noreferrer'
    );
    save({ ...state, [platform]: true });
  };

  if (!visible) return null;

  const allDone = state.instagram && state.facebook;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        transition-all duration-500 ease-out
        ${closing
          ? 'opacity-0 max-h-0 scale-[0.97] mb-0 pointer-events-none'
          : 'opacity-100 max-h-[250px] scale-100 mb-6'
        }
      `}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 bg-[#0f172a]" />

      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full
                      bg-gradient-to-br from-purple-600/20 to-pink-600/20
                      blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full
                      bg-gradient-to-br from-blue-600/20 to-cyan-600/20
                      blur-3xl pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 px-6 py-5">
        {allDone ? (
          /* ── Success State ── */
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border
                            border-emerald-500/30 flex items-center justify-center
                            shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                You're all connected! 🎉
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                Thanks for joining our community. You'll get the latest
                updates right on your feed.
              </p>
            </div>
          </div>
        ) : (
          /* ── Main State ── */
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            {/* Left */}
            <div className="flex items-start gap-4 flex-1">
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br
                              from-emerald-500/20 to-blue-500/20
                              border border-white/10
                              flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>

              {/* Text */}
              <div>
                <h3 className="text-base font-bold text-white">
                  Stay in the loop with WabMeta
                </h3>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed
                              max-w-xl">
                  Follow our social handles for product updates, WhatsApp
                  growth tips, feature releases, and business automation
                  ideas — straight to your feed.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Instagram */}
              <button
                onClick={() => handleConnect('instagram')}
                disabled={state.instagram}
                className={`
                  group relative inline-flex items-center gap-2
                  px-5 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-300
                  ${state.instagram
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'text-white border border-white/10 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20 hover:-translate-y-0.5 active:translate-y-0'
                  }
                `}
                style={
                  !state.instagram
                    ? {
                        background:
                          'linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%)',
                      }
                    : undefined
                }
              >
                {state.instagram ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <InstagramIcon />
                    <span>Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60
                                            group-hover:opacity-100
                                            transition-opacity" />
                  </>
                )}
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleConnect('facebook')}
                disabled={state.facebook}
                className={`
                  group relative inline-flex items-center gap-2
                  px-5 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-300
                  ${state.facebook
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'text-white border border-[#1877F2] hover:bg-[#166FE5] hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0'
                  }
                `}
              >
                {state.facebook ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <FacebookIcon />
                    <span>Facebook</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60
                                            group-hover:opacity-100
                                            transition-opacity" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {!allDone && (state.instagram || state.facebook) && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400
                           rounded-full transition-all duration-700 ease-out"
                style={{ width: state.instagram || state.facebook ? '50%' : '0%' }}
              />
            </div>
            <span className="text-[11px] font-medium text-gray-500
                             whitespace-nowrap">
              1 of 2
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFollowCard;
