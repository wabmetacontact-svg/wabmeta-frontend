// src/components/templates/TemplateCard.tsx - MEDIA PREVIEW FIXED

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  File,
  MessageSquare,
  Play,
  Download,
  RefreshCw,
} from 'lucide-react';
import type { Template } from '../../types/template';

interface TemplateCardProps {
  template: Template;
  onDelete: (id: string) => void;
  onDuplicate: (template: Template) => void;
  onPreview: (template: Template) => void;
}

const getStatusConfig = (status: Template['status']) => {
  switch (status) {
    case 'approved':
      return { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Approved' };
    case 'pending':
      return { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pending' };
    case 'rejected':
      return { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Rejected' };
    case 'draft':
      return { icon: FileText, color: 'bg-gray-100 text-gray-700', label: 'Draft' };
    default:
      return { icon: Clock, color: 'bg-gray-100 text-gray-700', label: status };
  }
};

const getCategoryConfig = (category: Template['category']) => {
  switch (category) {
    case 'marketing':
      return { color: 'bg-purple-100 text-purple-700', label: 'Marketing' };
    case 'utility':
      return { color: 'bg-blue-100 text-blue-700', label: 'Utility' };
    case 'authentication':
      return { color: 'bg-orange-100 text-orange-700', label: 'Authentication' };
    default:
      return { color: 'bg-gray-100 text-gray-700', label: category };
  }
};

const getHeaderIcon = (type: Template['header']['type']) => {
  switch (type) {
    case 'image': return ImageIcon;
    case 'video': return VideoIcon;
    case 'document': return File;
    default: return FileText;
  }
};

// ✅ Get best available media URL
const getMediaUrl = (template: Template): string | null => {
  const header = template.header;
  if (!header) return null;

  // Try cloudinaryUrl first (permanent)
  if (header.cloudinaryUrl && header.cloudinaryUrl.startsWith('http')) {
    return header.cloudinaryUrl;
  }

  // Try mediaUrl (could be Cloudinary or blob)
  if (header.mediaUrl && header.mediaUrl.startsWith('http')) {
    // Skip scontent URLs (expired Meta URLs)
    if (!header.mediaUrl.includes('scontent.whatsapp')) {
      return header.mediaUrl;
    }
  }

  // Try mediaId if it's a URL
  if (header.mediaId && typeof header.mediaId === 'string' && header.mediaId.startsWith('http')) {
    if (!header.mediaId.includes('scontent.whatsapp')) {
      return header.mediaId;
    }
  }

  return null;
};

// ✅ Get document filename
const getDocumentName = (template: Template): string => {
  const header = template.header;
  if (header?.fileName) return header.fileName;
  if (header?.mediaUrl) {
    const parts = header.mediaUrl.split('/');
    const last = parts[parts.length - 1]?.split('?')[0];
    if (last && last.includes('.')) return last;
  }
  return template.name + '.pdf';
};

// ✅ Get document extension
const getDocExt = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'file';
};

const isMediaExpired = (template: Template): boolean => {
  const headerType = (template.header?.type || '').toUpperCase();

  if (!['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType)) {
    return false;
  }

  if (template.metaTemplateId) {
    return false;
  }

  const mediaId = template.header?.mediaId;
  const cloudinaryUrl = template.header?.cloudinaryUrl;
  const mediaUrl = template.header?.mediaUrl;
  const metaNumericId = template.header?.metaNumericId;

  if (metaNumericId && /^\d+$/.test(metaNumericId)) return false;
  if (mediaId && /^\d+$/.test(mediaId)) return false;

  if (cloudinaryUrl && cloudinaryUrl.startsWith('http') && !cloudinaryUrl.includes('scontent.whatsapp')) {
    return false;
  }

  if (mediaUrl && mediaUrl.startsWith('http') && !mediaUrl.includes('scontent.whatsapp') && !mediaUrl.startsWith('blob:')) {
    return false;
  }

  if (mediaId && mediaId.startsWith('4:') && !cloudinaryUrl && !metaNumericId) {
    return true;
  }

  if (!mediaId && !cloudinaryUrl && !mediaUrl && !metaNumericId) {
    return true;
  }

  return false;
};

// ═══════════════════════════════════════════════════════════════════
// ✅ NEW: Beautiful Media Preview Component
// ═══════════════════════════════════════════════════════════════════
interface MediaPreviewProps {
  template: Template;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ template }) => {
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const mediaUrl = getMediaUrl(template);
  const headerType = template.header?.type;

  // ─── IMAGE Preview ──────────────────────────────────────────────
  if (headerType === 'image') {
    if (!mediaUrl || imgError) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden h-40 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 flex flex-col items-center justify-center gap-2 relative">
          <ImageIcon className="w-10 h-10 text-emerald-400" />
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Image Header</p>
          <p className="text-[10px] text-emerald-600">Preview unavailable</p>
        </div>
      );
    }

    return (
      <div className="mb-3 rounded-lg overflow-hidden h-40 bg-gray-100 border border-gray-200 relative group/media">
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src={mediaUrl}
          alt={template.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgError(true);
            setImgLoaded(true);
          }}
          loading="lazy"
        />
        {/* Small badge overlay - bottom-left */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md flex items-center gap-1">
          <ImageIcon className="w-3 h-3 text-white" />
          <span className="text-[10px] font-semibold text-white uppercase">Image</span>
        </div>
      </div>
    );
  }

  // ─── VIDEO Preview ──────────────────────────────────────────────
  if (headerType === 'video') {
    if (!mediaUrl || videoError) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden h-40 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 flex flex-col items-center justify-center gap-2 relative">
          <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Play className="w-6 h-6 text-purple-600 ml-1" fill="currentColor" />
          </div>
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Video Header</p>
          <p className="text-[10px] text-purple-600">Preview unavailable</p>
        </div>
      );
    }

    return (
      <div className="mb-3 rounded-lg overflow-hidden h-40 bg-black relative group/media cursor-pointer">
        {/* Video Element - Shows first frame */}
        <video
          src={mediaUrl}
          className="w-full h-full object-cover"
          preload="metadata"
          muted
          playsInline
          onError={() => setVideoError(true)}
          onLoadedMetadata={(e) => {
            // Seek to 1 second to get a better thumbnail
            const vid = e.currentTarget;
            if (vid.duration > 1) {
              vid.currentTime = 1;
            }
          }}
        />

        {/* ✅ Play Button Overlay - Small centered, non-blocking */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover/media:bg-black/20 transition-colors">
          <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover/media:scale-110 transition-transform">
            <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Video badge - bottom-left */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md flex items-center gap-1">
          <VideoIcon className="w-3 h-3 text-white" />
          <span className="text-[10px] font-semibold text-white uppercase">Video</span>
        </div>
      </div>
    );
  }

  // ─── DOCUMENT Preview ───────────────────────────────────────────
  if (headerType === 'document') {
    const fileName = getDocumentName(template);
    const ext = getDocExt(fileName);

    // Color mapping by extension
    const extColors: Record<string, { bg: string; icon: string; label: string }> = {
      pdf: { bg: 'from-red-50 to-red-100 border-red-200', icon: 'text-red-600', label: 'PDF' },
      doc: { bg: 'from-blue-50 to-blue-100 border-blue-200', icon: 'text-blue-600', label: 'DOC' },
      docx: { bg: 'from-blue-50 to-blue-100 border-blue-200', icon: 'text-blue-600', label: 'DOCX' },
      xls: { bg: 'from-green-50 to-green-100 border-green-200', icon: 'text-green-600', label: 'XLS' },
      xlsx: { bg: 'from-green-50 to-green-100 border-green-200', icon: 'text-green-600', label: 'XLSX' },
      ppt: { bg: 'from-orange-50 to-orange-100 border-orange-200', icon: 'text-orange-600', label: 'PPT' },
      pptx: { bg: 'from-orange-50 to-orange-100 border-orange-200', icon: 'text-orange-600', label: 'PPTX' },
      txt: { bg: 'from-gray-50 to-gray-100 border-gray-200', icon: 'text-gray-600', label: 'TXT' },
    };

    const style = extColors[ext] || extColors.pdf;

    return (
      <div className={`mb-3 rounded-lg overflow-hidden bg-gradient-to-br ${style.bg} border p-4`}>
        <div className="flex items-center gap-3">
          {/* Document Icon Card */}
          <div className="w-14 h-16 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-center flex-shrink-0">
            <File className={`w-6 h-6 ${style.icon}`} />
            <span className={`text-[9px] font-black uppercase mt-1 ${style.icon}`}>
              {style.label}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate" title={fileName}>
              {fileName}
            </p>
            <p className="text-xs text-gray-600 mt-0.5 uppercase tracking-wider">
              {style.label} Document
            </p>
            {mediaUrl && (
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <Download className="w-3 h-3" />
                Download
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ═══════════════════════════════════════════════════════════════════
// Main Card Component
// ═══════════════════════════════════════════════════════════════════
const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onDelete,
  onDuplicate,
  onPreview
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = getStatusConfig(template.status);
  const categoryConfig = getCategoryConfig(template.category);
  const HeaderIcon = getHeaderIcon(template.header.type);

  const truncateBody = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const hasMediaHeader = ['image', 'video', 'document'].includes(template.header?.type || '');

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-5 hover:border-emerald-400 hover:shadow-md transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
              {template.name}
            </h3>
            <p className="text-sm text-gray-500">{template.language}</p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20 animate-fade-in">
                <button
                  onClick={() => {
                    onPreview(template);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Preview</span>
                </button>
                <Link
                  to={`/dashboard/templates/edit/${template.id}`}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </Link>
                <button
                  onClick={() => {
                    onDuplicate(template);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Duplicate</span>
                </button>
                {template.status === 'approved' && (
                  <Link
                    to={`/dashboard/campaigns/new?template=${template.id}`}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-sm">Use in Campaign</span>
                  </Link>
                )}
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => {
                    onDelete(template.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center space-x-2 mb-4 flex-wrap gap-y-2">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusConfig.color}`}>
          <statusConfig.icon className="w-3 h-3" />
          <span>{statusConfig.label}</span>
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryConfig.color}`}>
          {categoryConfig.label}
        </span>
        {template.header.type !== 'none' && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex items-center space-x-1">
            <HeaderIcon className="w-3 h-3" />
            <span className="capitalize">{template.header.type}</span>
          </span>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ✅ MEDIA + BODY Preview (Fixed with proper rendering)          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
        {/* Media Preview - Only for media headers */}
        {hasMediaHeader && <MediaPreview template={template} />}

        {/* Text Header */}
        {template.header.type === 'text' && template.header.text && (
          <p className="font-semibold text-gray-900 mb-2">{template.header.text}</p>
        )}

        {/* Body */}
        <p className="text-gray-700 text-sm leading-relaxed">
          {truncateBody(template.body)}
        </p>

        {/* Footer */}
        {template.footer && (
          <p className="text-gray-500 text-xs mt-2">{template.footer}</p>
        )}
      </div>

      {/* Buttons Preview */}
      {template.buttons.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {template.buttons.map((button, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium"
            >
              {button.text}
            </span>
          ))}
        </div>
      )}

      {/* Footer Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center space-x-1">
            <Send className="w-4 h-4" />
            <span>{template.usageCount.toLocaleString()} uses</span>
          </span>
        </div>
        <span className="text-xs text-gray-400">
          Updated {template.updatedAt}
        </span>
      </div>

      {/* Expired Media Warning */}
      {isMediaExpired(template) && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
          <span className="text-sm text-orange-700 font-medium flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Media expired - re-upload required
          </span>
          <Link
            to={`/dashboard/templates/edit/${template.id}`}
            className="text-xs text-blue-600 font-bold hover:underline whitespace-nowrap"
          >
            Fix Now →
          </Link>
        </div>
      )}

      {/* Rejection Reason */}
      {template.status === 'rejected' && template.rejectionReason && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">
            <strong>Rejection Reason:</strong> {template.rejectionReason}
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplateCard;