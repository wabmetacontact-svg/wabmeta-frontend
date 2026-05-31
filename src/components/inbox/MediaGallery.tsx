// src/components/inbox/MediaGallery.tsx
import React, { useState, useMemo } from 'react';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Mic,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { formatMessageTime, formatFileSize } from '../../utils/inboxHelpers';
import type { Message } from './MessageBubble';

const API_BASE = 'https://wabmeta-api.onrender.com/api';

interface Props {
  messages: Message[];
  loading?: boolean;
}

type TabType = 'media' | 'docs' | 'links' | 'voice';

const getMediaSrc = (msg: Message): string | null => {
  const url = msg.mediaUrl;
  if (!url) return null;
  if (url.startsWith('data:') || url.includes('cloudinary.com')) return url;
  if (url.startsWith('https://') && !url.includes('lookaside.fbsbx.com') && !url.includes('mmg.whatsapp.net')) return url;
  if (msg.mediaId && /^\d+$/.test(msg.mediaId.trim())) return `${API_BASE}/inbox/media/${msg.mediaId.trim()}`;
  if (url && !url.startsWith('http') && /^\d+$/.test(url.trim())) return `${API_BASE}/inbox/media/${url.trim()}`;
  return null;
};

const MediaGallery: React.FC<Props> = ({ messages, loading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('media');
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // ── Filter messages by tab ──────────────────────────────────────────────
  const grouped = useMemo(() => {
    const media: Message[] = [];
    const docs: Message[] = [];
    const links: Message[] = [];
    const voice: Message[] = [];

    messages.forEach((m) => {
      const type = (m.type || '').toLowerCase();
      if (type === 'image' || type === 'video' || type === 'sticker') {
        media.push(m);
      } else if (type === 'document') {
        docs.push(m);
      } else if (type === 'audio' || type === 'voice' || type === 'ptt') {
        voice.push(m);
      }

      // Detect URLs in text messages
      if (type === 'text' && m.content) {
        const urlMatch = m.content.match(/(https?:\/\/[^\s]+)/g);
        if (urlMatch) links.push(m);
      }
    });

    // Sort newest first
    const sortDesc = (a: Message, b: Message) =>
      new Date(b.createdAt || b.timestamp).getTime() -
      new Date(a.createdAt || a.timestamp).getTime();

    return {
      media: media.sort(sortDesc),
      docs: docs.sort(sortDesc),
      links: links.sort(sortDesc),
      voice: voice.sort(sortDesc),
    };
  }, [messages]);

  const currentList =
    activeTab === 'media' ? grouped.media :
    activeTab === 'docs' ? grouped.docs :
    activeTab === 'links' ? grouped.links :
    grouped.voice;

  const tabs: Array<{ key: TabType; label: string; icon: React.ElementType; count: number }> = [
    { key: 'media', label: 'Media', icon: ImageIcon, count: grouped.media.length },
    { key: 'docs', label: 'Docs', icon: FileText, count: grouped.docs.length },
    { key: 'links', label: 'Links', icon: ExternalLink, count: grouped.links.length },
    { key: 'voice', label: 'Voice', icon: Mic, count: grouped.voice.length },
  ];

  // ── Image preview navigation ───────────────────────────────────────────
  const nextMedia = () => {
    if (previewIndex === null) return;
    setPreviewIndex((previewIndex + 1) % grouped.media.length);
  };

  const prevMedia = () => {
    if (previewIndex === null) return;
    setPreviewIndex(previewIndex === 0 ? grouped.media.length - 1 : previewIndex - 1);
  };

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#0a0e27]/[0.03] border border-white/[0.06] rounded-xl mb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 flex flex-col items-center gap-1 py-2 px-1
                rounded-lg transition-all
                ${isActive
                  ? 'bg-[#0a0e27]/[0.08] text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#0a0e27]/[0.03]'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`
                    text-[9px] font-mono font-bold px-1 rounded
                    ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#0a0e27]/[0.05] text-gray-500'}
                  `}>
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        </div>
      ) : currentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="
            w-12 h-12 rounded-full
            bg-[#0a0e27]/[0.03] border border-white/[0.05]
            flex items-center justify-center mb-2
          ">
            {React.createElement(
              tabs.find((t) => t.key === activeTab)?.icon || ImageIcon,
              { className: 'w-5 h-5 text-gray-500' }
            )}
          </div>
          <p className="text-xs text-gray-500 text-center">
            No {activeTab === 'docs' ? 'documents' : activeTab} shared yet
          </p>
        </div>
      ) : (
        <>
          {/* Media grid (images/videos) */}
          {activeTab === 'media' && (
            <div className="grid grid-cols-3 gap-1.5">
              {grouped.media.slice(0, 9).map((msg, idx) => {
                const src = getMediaSrc(msg);
                const isVideo = (msg.type || '').toLowerCase() === 'video';
                return (
                  <button
                    key={msg.id}
                    onClick={() => setPreviewIndex(idx)}
                    className="
                      aspect-square rounded-lg overflow-hidden
                      bg-[#0a0e27]/[0.04] border border-white/[0.05]
                      hover:border-emerald-400/30 hover:scale-105
                      transition-all relative group
                    "
                  >
                    {src ? (
                      isVideo ? (
                        <>
                          <video
                            src={src}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Video className="w-5 h-5 text-white drop-shadow-lg" />
                          </div>
                        </>
                      ) : (
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </button>
                );
              })}
              {grouped.media.length > 9 && (
                <button className="
                  aspect-square rounded-lg
                  bg-[#0a0e27]/[0.04] border border-white/[0.05]
                  hover:bg-[#0a0e27]/[0.06]
                  transition-all
                  flex items-center justify-center
                  text-xs font-bold text-gray-400
                ">
                  +{grouped.media.length - 9}
                </button>
              )}
            </div>
          )}

          {/* Documents list */}
          {activeTab === 'docs' && (
            <div className="space-y-1.5">
              {grouped.docs.slice(0, 10).map((msg) => {
                const fileName = msg.fileName || 'Document';
                const ext = fileName.split('.').pop()?.toLowerCase() || '';
                const src = getMediaSrc(msg);
                const extColors: Record<string, string> = {
                  pdf: 'text-red-400 bg-red-500/10 border-red-500/20',
                  doc: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  docx: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  xls: 'text-green-400 bg-green-500/10 border-green-500/20',
                  xlsx: 'text-green-400 bg-green-500/10 border-green-500/20',
                };
                const color = extColors[ext] || 'text-gray-400 bg-[#050816]0/10 border-gray-500/20';
                return (
                  <div
                    key={msg.id}
                    className="
                      flex items-center gap-2.5 p-2
                      bg-[#0a0e27]/[0.03] hover:bg-[#0a0e27]/[0.05]
                      border border-white/[0.05]
                      rounded-lg transition-colors group
                    "
                  >
                    <div className={`
                      w-9 h-10 rounded-md border
                      flex flex-col items-center justify-center flex-shrink-0
                      ${color}
                    `}>
                      <FileText className="w-3.5 h-3.5" />
                      {ext && (
                        <span className="text-[8px] font-bold uppercase mt-0.5">{ext}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{fileName}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {formatMessageTime(msg.createdAt || msg.timestamp)}
                      </p>
                    </div>
                    {src && (
                      <a
                        href={src}
                        download={fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          p-1.5 rounded-md
                          hover:bg-[#0a0e27]/[0.08]
                          text-gray-400 hover:text-white
                          opacity-0 group-hover:opacity-100
                          transition-all flex-shrink-0
                        "
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Links list */}
          {activeTab === 'links' && (
            <div className="space-y-1.5">
              {grouped.links.slice(0, 10).map((msg) => {
                const url = msg.content.match(/(https?:\/\/[^\s]+)/)?.[0];
                if (!url) return null;
                let domain = '';
                try {
                  domain = new URL(url).hostname.replace('www.', '');
                } catch {}
                return (
                  <a
                    key={msg.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex items-start gap-2.5 p-2
                      bg-[#0a0e27]/[0.03] hover:bg-[#0a0e27]/[0.05]
                      border border-white/[0.05]
                      rounded-lg transition-colors group
                    "
                  >
                    <div className="
                      w-9 h-9 rounded-lg
                      bg-blue-500/10 border border-blue-500/20
                      flex items-center justify-center flex-shrink-0
                    ">
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-blue-300 truncate">
                        {domain}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {url}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatMessageTime(msg.createdAt || msg.timestamp)}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Voice messages */}
          {activeTab === 'voice' && (
            <div className="space-y-1.5">
              {grouped.voice.slice(0, 10).map((msg) => {
                const src = getMediaSrc(msg);
                return (
                  <div
                    key={msg.id}
                    className="
                      flex items-center gap-2.5 p-2
                      bg-[#0a0e27]/[0.03] hover:bg-[#0a0e27]/[0.05]
                      border border-white/[0.05]
                      rounded-lg transition-colors
                    "
                  >
                    <div className="
                      w-9 h-9 rounded-full
                      bg-emerald-500/15 border border-emerald-500/30
                      flex items-center justify-center flex-shrink-0
                    ">
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white">Voice message</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {formatMessageTime(msg.createdAt || msg.timestamp)}
                      </p>
                    </div>
                    {src && (
                      <audio
                        src={src}
                        controls
                        className="h-7 w-24"
                        style={{ filter: 'invert(0.85) hue-rotate(180deg)' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Image/Video Preview Modal */}
      {previewIndex !== null && grouped.media[previewIndex] && (
        <div
          className="fixed inset-0 z-[70] glass-backdrop flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewIndex(null)}
        >
          {/* Close */}
          <button
            onClick={() => setPreviewIndex(null)}
            className="absolute top-4 right-4 p-2.5 bg-[#0a0e27]/10 hover:bg-[#0a0e27]/20 rounded-full text-white backdrop-blur-sm z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev */}
          {grouped.media.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevMedia();
              }}
              className="absolute left-4 p-3 bg-[#0a0e27]/10 hover:bg-[#0a0e27]/20 rounded-full text-white backdrop-blur-sm z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Media */}
          <div onClick={(e) => e.stopPropagation()} className="max-w-full max-h-[90vh] image-zoom-enter">
            {(grouped.media[previewIndex].type || '').toLowerCase() === 'video' ? (
              <video
                src={getMediaSrc(grouped.media[previewIndex]) || ''}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              />
            ) : (
              <img
                src={getMediaSrc(grouped.media[previewIndex]) || ''}
                alt=""
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>

          {/* Next */}
          {grouped.media.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextMedia();
              }}
              className="absolute right-4 p-3 bg-[#0a0e27]/10 hover:bg-[#0a0e27]/20 rounded-full text-white backdrop-blur-sm z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-mono">
            {previewIndex + 1} / {grouped.media.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
