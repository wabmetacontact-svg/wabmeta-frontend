// src/components/dashboard/ConnectVideoCard.tsx
//
// The "Connect WhatsApp Business API" tutorial, as a dashboard tile (in the
// channel-stats row, styled like those cards) or as a thumbnail card for the
// Settings empty state. Clicking either plays the video in a modal (same
// YouTube video as tutorial #1 on the Help page).

import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import { useModalA11y } from '../../hooks/useModalA11y';

const YOUTUBE_ID = '2Gr_88Wsk5Y';
const TITLE = 'Connect WhatsApp Business API';

const VideoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const panelRef = useModalA11y(true, onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        ref={panelRef}
        className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close video"
          className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="relative pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
            title={TITLE}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

/**
 * 'tile'   - fills a dashboard stats-card slot.
 * 'inline' - a compact video card (thumbnail + title row), for the Settings
 *            empty state where it sits beside the "Connect with Meta" button.
 */
const ConnectVideoCard: React.FC<{ variant?: 'tile' | 'inline' }> = ({ variant = 'tile' }) => {
  const [open, setOpen] = useState(false);

  if (variant === 'inline') {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Play video: ${TITLE}`}
          className="group block w-full text-left bg-white rounded-xl border border-slate-200 overflow-hidden
            shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
        >
          <div className="relative aspect-video overflow-hidden bg-slate-900">
            <img
              src={`https://img.youtube.com/vi/${YOUTUBE_ID}/hqdefault.jpg`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/15 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-11 h-11 rounded-full bg-white/95 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 text-emerald-600 ml-0.5" fill="currentColor" />
              </span>
            </div>
            <span className="absolute bottom-2 right-2 bg-slate-900/85 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded">
              2:09
            </span>
          </div>

          <div className="px-3.5 py-3 border-t border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Video guide</p>
            <p className="text-sm font-semibold text-slate-900 leading-snug mt-0.5">{TITLE}</p>
            <p className="text-xs text-slate-500 mt-0.5">Step-by-step setup · Hindi voiceover</p>
          </div>
        </button>
        {open && <VideoModal onClose={() => setOpen(false)} />}
      </>
    );
  }

  // Styled like the WhatsApp / Instagram / Telegram cards next to it: pastel
  // background, mono label, faded brand icon in the corner.
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Play video: ${TITLE}`}
        className="relative overflow-hidden rounded-2xl bg-red-50/40 border border-red-100 p-6 group shadow-sm
          h-full w-full text-left hover:border-red-200 hover:shadow-md transition-all"
      >
        <div className="absolute top-0 right-0 p-4 opacity-[0.07] text-red-600 group-hover:scale-110 transition-transform">
          <FaYoutube size={80} />
        </div>
        <div className="relative">
          <p className="text-[10px] font-mono text-red-700 uppercase tracking-widest mb-1 font-semibold">Video Tutorial</p>
          <h3 className="text-lg font-bold text-gray-900 leading-snug">Connect WhatsApp API</h3>
          <p className="text-xs text-gray-500 font-normal mt-2">Step-by-step setup guide</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-semibold group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Play className="w-2.5 h-2.5" fill="currentColor" />
              Watch · 2:09
            </span>
          </div>
        </div>
      </button>

      {open && <VideoModal onClose={() => setOpen(false)} />}
    </>
  );
};

export default ConnectVideoCard;
