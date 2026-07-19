// src/components/dashboard/SocialFollowCard.tsx

import React, { useEffect, useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Heart,
} from 'lucide-react';

const STORAGE_KEY = 'wabmeta_social_connect_v1';

const INSTAGRAM_URL =
  'https://www.instagram.com/wabmeta_business?igsh=MW04YTVvb3Qzem5tcg%3D%3D&utm_source=qr';

const FACEBOOK_URL =
  'https://www.facebook.com/share/19Xc9yopfo/?mibextid=wwXIfr';

type SocialState = {
  instagram: boolean;
  facebook: boolean;
};

const InstagramIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const SocialFollowCard: React.FC = () => {
  const [state, setState] = useState<SocialState>({
    instagram: false,
    facebook: false,
  });
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

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
      {/* ── Light Background ── */}
      <div className="absolute inset-0 bg-white border border-gray-200 rounded-2xl" />

      {/* Soft gradient accent on left */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl
                      bg-gradient-to-b from-pink-500 via-purple-500 to-blue-500" />

      {/* Subtle decorative circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full
                      bg-gradient-to-br from-pink-50 to-purple-50
                      pointer-events-none" />
      <div className="absolute -bottom-8 right-24 w-28 h-28 rounded-full
                      bg-gradient-to-br from-blue-50 to-cyan-50
                      pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 px-6 py-5">
        {allDone ? (
          /* ── Success ── */
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-50 border border-green-200
                            flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">
                You're all connected! 🎉
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Thanks for joining our community — updates coming your way!
              </p>
            </div>
          </div>
        ) : (
          /* ── Main ── */
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            {/* Left */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br
                              from-purple-50 to-pink-50
                              border border-purple-100
                              flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>

              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-gray-900">
                  Stay in the loop with WabMeta
                </h3>
                <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                  Follow us for product updates, WhatsApp growth tips,
                  feature releases & business automation ideas.
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
                  group inline-flex items-center gap-2
                  px-5 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-300
                  ${state.instagram
                    ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                    : 'text-white shadow-md shadow-pink-200/50 hover:shadow-lg hover:shadow-pink-300/60 hover:-translate-y-0.5 active:translate-y-0'
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
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <InstagramIcon />
                    <span>Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70
                                            group-hover:opacity-100" />
                  </>
                )}
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleConnect('facebook')}
                disabled={state.facebook}
                className={`
                  group inline-flex items-center gap-2
                  px-5 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-300
                  ${state.facebook
                    ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                    : 'bg-[#1877F2] text-white shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-300/60 hover:bg-[#166FE5] hover:-translate-y-0.5 active:translate-y-0'
                  }
                `}
              >
                {state.facebook ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <FacebookIcon />
                    <span>Facebook</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70
                                            group-hover:opacity-100" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Progress */}
        {!allDone && (state.instagram || state.facebook) && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500
                           rounded-full transition-all duration-700"
                style={{ width: '50%' }}
              />
            </div>
            <span className="text-[11px] font-semibold text-gray-400
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