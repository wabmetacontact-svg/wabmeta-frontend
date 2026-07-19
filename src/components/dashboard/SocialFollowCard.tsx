import React, { useEffect, useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Instagram,
  Facebook,
  HeartHandshake,
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

  const saveState = (next: SocialState) => {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    if (next.instagram && next.facebook) {
      setTimeout(() => {
        setClosing(true);
        setTimeout(() => setVisible(false), 450);
      }, 1200);
    }
  };

  const handleConnect = (platform: 'instagram' | 'facebook') => {
    const url = platform === 'instagram' ? INSTAGRAM_URL : FACEBOOK_URL;

    window.open(url, '_blank', 'noopener,noreferrer');

    const next = {
      ...state,
      [platform]: true,
    };

    saveState(next);
  };

  if (!visible) return null;

  const completed = state.instagram && state.facebook;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-500
        ${closing
          ? 'opacity-0 max-h-0 scale-[0.98] mb-0'
          : 'opacity-100 max-h-[280px] scale-100 mb-6'
        }
        ${completed
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-gradient-to-r from-emerald-50 via-white to-blue-50 border-emerald-100'
        }
      `}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-500 blur-2xl" />
      </div>

      <div className="relative z-10 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left Content */}
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                ${completed
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-white border border-emerald-100 text-emerald-600 shadow-sm'
                }
              `}
            >
              {completed ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <HeartHandshake className="w-6 h-6" />
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                {completed
                  ? 'Thanks for staying connected with WabMeta!'
                  : 'Stay connected with WabMeta'}
              </h3>

              <p className="text-sm text-gray-600 mt-1 leading-relaxed max-w-2xl">
                {completed
                  ? 'You’ll now be able to catch our latest updates, feature tips, and helpful resources on social media.'
                  : 'Connect with our official social media handles for product updates, WhatsApp growth tips, feature announcements, and helpful business automation ideas.'}
              </p>

              {!completed && (
                <p className="text-xs text-gray-500 mt-2">
                  This is optional, but it helps you stay updated with new WabMeta improvements.
                </p>
              )}
            </div>
          </div>

          {/* Right Actions */}
          {!completed ? (
            <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[360px]">
              <button
                type="button"
                onClick={() => handleConnect('instagram')}
                disabled={state.instagram}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${state.instagram
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                  }
                `}
              >
                {state.instagram ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <Instagram className="w-4 h-4" />
                    Instagram
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleConnect('facebook')}
                disabled={state.facebook}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${state.facebook
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'bg-[#1877F2] text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                  }
                `}
              >
                {state.facebook ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <Facebook className="w-4 h-4" />
                    Facebook
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="lg:min-w-[220px]">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                All set
              </div>
            </div>
          )}
        </div>

        {/* Progress */}
        {!completed && (state.instagram || state.facebook) && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width:
                    state.instagram && state.facebook
                      ? '100%'
                      : state.instagram || state.facebook
                        ? '50%'
                        : '0%',
                }}
              />
            </div>

            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
              {state.instagram && state.facebook ? 'Completed' : '1 of 2 connected'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFollowCard;
