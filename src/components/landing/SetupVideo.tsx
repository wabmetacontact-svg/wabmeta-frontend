// src/components/landing/SetupVideo.tsx
//
// "WabMeta setup A to Z" walkthrough under the How It Works steps. Only the
// thumbnail loads with the page; YouTube's player (~1 MB of script) is added
// when someone presses play or picks a chapter, so the landing page stays fast.

import { useState } from 'react';
import { Play, Clock, Youtube, Headphones } from 'lucide-react';

const VIDEO_ID = 'FIbL1pRFv5U';
const TITLE = 'WabMeta setup A to Z for beginners';

// Chapter start times in the video, in seconds.
const CHAPTERS = [
  { at: 28, label: 'Create your account' },
  { at: 71, label: 'Business App vs Cloud API' },
  { at: 178, label: 'Meta verification documents' },
  { at: 273, label: 'Connect your WhatsApp number' },
  { at: 337, label: 'Create your first template' },
  { at: 400, label: 'Import your contacts' },
  { at: 443, label: 'Send your first campaign' },
];

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const SetupVideo = () => {
  // null = show the thumbnail; a number = player running from that second
  const [start, setStart] = useState<number | null>(null);
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`);

  return (
    <div className="mb-12 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Chapters */}
        <div className="p-6 md:p-8 lg:p-10 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Play size={12} fill="currentColor" /> Watch the full setup
          </div>
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-gray-950 leading-tight tracking-tight">
            From sign-up to your first campaign,{' '}
            <span className="text-green-600">step by step.</span>
          </h3>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            New to WhatsApp Business API? This walkthrough covers everything, including which documents Meta asks
            for to verify your business.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
            <span className="inline-flex items-center gap-1.5"><Clock size={13} /> 8:46</span>
            <span className="inline-flex items-center gap-1.5"><Headphones size={13} /> Hindi voiceover</span>
          </div>

          <ol className="mt-6 space-y-1">
            {CHAPTERS.map((c, i) => {
              const playing = start !== null && start === c.at;
              return (
                <li key={c.at}>
                  <button
                    type="button"
                    onClick={() => setStart(c.at)}
                    className={`group w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                      playing ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                        playing ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-700'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-gray-800">{c.label}</span>
                    <span className="text-xs font-mono text-gray-400 group-hover:text-green-600">{clock(c.at)}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <a
            href="https://www.youtube.com/@wabmeta"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors"
          >
            <Youtube size={18} className="text-red-600" /> More tutorials on our YouTube channel
          </a>
        </div>

        {/* Player */}
        <div className="order-1 lg:order-2 flex items-center p-3 sm:p-5 lg:p-8 bg-gradient-to-br from-green-50 via-emerald-50/60 to-blue-50 lg:border-l border-gray-200">
          <div className="relative w-full aspect-video rounded-xl lg:rounded-2xl overflow-hidden bg-gray-900 shadow-xl ring-1 ring-black/5">
            {start === null ? (
              <button
                type="button"
                onClick={() => setStart(0)}
                aria-label={`Play video: ${TITLE}`}
                className="group absolute inset-0 w-full h-full"
              >
                <img
                  src={thumb}
                  onError={() => setThumb(`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`)}
                  alt={TITLE}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-20 h-20 rounded-full bg-white/95 shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={30} className="text-green-600 ml-1" fill="currentColor" />
                  </span>
                </span>
              </button>
            ) : (
              <iframe
                key={start}
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&start=${start}`}
                title={TITLE}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupVideo;
