// src/components/templates/TemplatePreview.tsx - FIXED
import React, { useState } from 'react';
import {
  X, CheckCheck, Phone, ExternalLink,
  Image as ImageIcon, File, Play, Download,
} from 'lucide-react';
import type { TemplateFormData, TemplateButton } from '../../types/template';

interface TemplatePreviewProps {
  template: Partial<TemplateFormData> & {
    name?: string;
    body?: string;
    footer?: string;
    header?: any;
    buttons?: any[];
  };
  sampleVariables?: Record<string, string>;
  isModal?: boolean;
  onClose?: () => void;
}

// ✅ Fixed priority order
const getMediaUrl = (header: any): string | null => {
  if (!header) return null;
  const SCONTENT = 'scontent.whatsapp';

  // 1. Local blob (freshly uploaded - best quality preview)
  const localUrl = header.localPreviewUrl || header.mediaUrl;
  if (localUrl?.startsWith('blob:')) return localUrl;

  // 2. Cloudinary (permanent)
  if (header.cloudinaryUrl?.startsWith('http') &&
    !header.cloudinaryUrl.includes(SCONTENT)) {
    return header.cloudinaryUrl;
  }

  // 3. mediaUrl (http, not scontent)
  if (localUrl?.startsWith('http') && !localUrl.includes(SCONTENT)) {
    return localUrl;
  }

  // 4. Never use mediaHandle as URL
  return null;
};

// ─── Preview Content ──────────────────────────────────────────
const PreviewContent: React.FC<{
  template: TemplatePreviewProps['template'];
  sampleVariables: Record<string, string>;
}> = ({ template, sampleVariables }) => {
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // ✅ Fixed variable replacement
  const replaceBodyVars = (text: string): string => {
    if (!text) return '';
    return text.replace(/\{\{(\d+)\}\}/g, (_, num) =>
      sampleVariables[`body_${num}`] ||
      sampleVariables[num] ||
      `[var ${num}]`
    );
  };

  const replaceHeaderVars = (text: string): string => {
    if (!text) return '';
    return text.replace(/\{\{(\d+)\}\}/g, (_, num) =>
      sampleVariables[`header_${num}`] ||
      sampleVariables[num] ||
      `[var ${num}]`
    );
  };

  const header = template.header || { type: 'none' };
  const body = template.body || '';
  const footer = template.footer || '';
  const buttons = template.buttons || [];
  const mediaUrl = getMediaUrl(header);

  const renderButton = (btn: TemplateButton, i: number) => (
    <button
      key={btn.id || i}
      className="w-full py-2.5 text-[#00a884] font-medium text-sm
                 border-t border-gray-200 flex items-center
                 justify-center gap-2 hover:bg-gray-50 transition-colors"
    >
      {btn.type === 'phone' && <Phone className="w-4 h-4" />}
      {btn.type === 'url' && <ExternalLink className="w-4 h-4" />}
      <span>{btn.text}</span>
    </button>
  );

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Phone frame */}
      <div className="bg-[#0b141a] rounded-[2.5rem] p-3 shadow-2xl">
        {/* Notch */}
        <div className="bg-[#0b141a] h-6 flex items-center justify-center mb-1">
          <div className="w-20 h-4 bg-black rounded-full" />
        </div>

        {/* WA header bar */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full
                          flex items-center justify-center">
            <span className="text-white text-sm font-semibold">WA</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">Your Business</p>
            <p className="text-gray-400 text-xs">Online</p>
          </div>
        </div>

        {/* Chat bg */}
        <div
          className="min-h-[500px] p-4 relative"
          style={{ backgroundColor: '#0b141a' }}
        >
          {/* Message bubble */}
          <div className="max-w-[85%] ml-auto">
            <div className="bg-[#005c4b] rounded-lg overflow-hidden shadow-md">

              {/* ── Header ── */}
              {header.type !== 'none' && (
                <div className="relative">
                  {/* Image */}
                  {header.type === 'image' && (
                    <div className="aspect-video bg-gray-800 overflow-hidden">
                      {mediaUrl && !imgError ? (
                        <img
                          src={mediaUrl}
                          alt="Header"
                          className="w-full h-full object-cover"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col
                                        items-center justify-center
                                        text-gray-400 gap-2">
                          <ImageIcon className="w-12 h-12" />
                          <p className="text-xs font-semibold uppercase tracking-wider">
                            Image Header
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Upload to preview
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video */}
                  {header.type === 'video' && (
                    <div className="aspect-video bg-black overflow-hidden">
                      {mediaUrl && !videoError ? (
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                          playsInline
                          onError={() => setVideoError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col
                                        items-center justify-center
                                        text-gray-400 gap-2">
                          <div className="w-16 h-16 bg-white/10 rounded-full
                                          flex items-center justify-center">
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                          </div>
                          <p className="text-xs font-semibold uppercase tracking-wider mt-2">
                            Video Header
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Document */}
                  {header.type === 'document' && (
                    <div className="p-3 bg-[#1f2c34] flex items-center gap-3">
                      <div className="w-12 h-14 bg-red-500/20 border border-red-500/40
                                      rounded flex flex-col items-center justify-center shrink-0">
                        <File className="w-5 h-5 text-red-400" />
                        <span className="text-[8px] font-black text-red-400 mt-0.5">
                          PDF
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {header.fileName || 'Document.pdf'}
                        </p>
                        <p className="text-gray-400 text-xs">PDF Document</p>
                      </div>
                      {mediaUrl && (
                        <a href={mediaUrl} target="_blank" rel="noopener noreferrer"
                          className="p-2 bg-white/10 hover:bg-white/20
                                      rounded-full transition-colors shrink-0">
                          <Download className="w-4 h-4 text-white" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Text header */}
                  {header.type === 'text' && header.text && (
                    <div className="px-3 pt-3">
                      <p className="text-white font-semibold">
                        {replaceHeaderVars(header.text)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Body ── */}
              <div className="p-3">
                <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                  {replaceBodyVars(body) || 'Your message body will appear here...'}
                </p>

                {footer && (
                  <p className="text-gray-400 text-xs mt-2">{footer}</p>
                )}

                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-gray-400">12:00 PM</span>
                  <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                </div>
              </div>

              {/* ── Buttons ── */}
              {buttons.length > 0 && (
                <div className="bg-[#005c4b] border-t border-[#0a3d33]">
                  {buttons.map((b, i) => renderButton(b, i))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3">
          <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
            <span className="text-gray-500 text-sm">Type a message</span>
          </div>
          <div className="w-10 h-10 bg-[#00a884] rounded-full
                          flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Export ──────────────────────────────────────────────
const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  sampleVariables = {},
  isModal = false,
  onClose,
}) => {
  if (!isModal) {
    return (
      <PreviewContent
        template={template}
        sampleVariables={sampleVariables}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gray-900 rounded-3xl p-6 animate-fade-in
                      max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20
                     rounded-full text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <PreviewContent
          template={template}
          sampleVariables={sampleVariables}
        />
      </div>
    </div>
  );
};

export default TemplatePreview;