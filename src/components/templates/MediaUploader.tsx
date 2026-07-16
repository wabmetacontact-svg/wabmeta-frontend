// src/components/templates/MediaUploader.tsx
import React, { useState, useRef } from 'react';
import {
  Upload, Image, Video, File, X,
  CheckCircle2, AlertCircle, Info, Loader2
} from 'lucide-react';
import type { HeaderType } from '../../types/template';
import { templates as templatesApi } from '../../services/api';

// ─── Props ───────────────────────────────────────────────────
interface MediaUploaderProps {
  headerType: HeaderType;
  cloudinaryUrl?: string;     // Permanent URL for display
  localPreviewUrl?: string;   // Blob URL for local preview
  fileName?: string;
  whatsappAccountId?: string;
  onUploadSuccess: (data: {
    mediaHandle: string;
    cloudinaryUrl: string;
    localPreviewUrl: string;
    fileName: string;
    whatsappAccountId: string;
  }) => void;
  onRemove: () => void;
}

// ─── Constants ────────────────────────────────────────────────
const META_LIMITS: Record<string, { size: number; label: string }> = {
  image: { size: 5 * 1024 * 1024, label: '5 MB' },
  video: { size: 16 * 1024 * 1024, label: '16 MB' },
  document: { size: 100 * 1024 * 1024, label: '100 MB' },
};

const UPLOAD_LIMITS: Record<string, { size: number; label: string }> = {
  image: { size: 15 * 1024 * 1024, label: '15 MB' },
  video: { size: 100 * 1024 * 1024, label: '100 MB' },
  document: { size: 100 * 1024 * 1024, label: '100 MB' },
};

const ACCEPTED_TYPES: Record<string, string> = {
  image: 'image/jpeg,image/jpg,image/png,image/webp',
  video: 'video/mp4,video/3gpp',
  document: 'application/pdf,.doc,.docx,.xls,.xlsx,.txt',
};

const TYPE_LABELS: Record<string, string> = {
  image: 'Image',
  video: 'Video',
  document: 'Document',
};

const formatBytes = (bytes: number): string =>
  `${(bytes / 1024 / 1024).toFixed(2)} MB`;

// ─── Handle Validator ─────────────────────────────────────────
const isValidMetaHandle = (handle: string): boolean => {
  if (!handle || handle.trim().length < 10) return false;
  if (handle.startsWith('http')) return false;
  if (handle.includes('\n') || handle.includes(',')) return false;
  if (handle.includes(':::')) return false;
  return true;
};

// ─── Icon Helper ──────────────────────────────────────────────
const getIcon = (type: HeaderType) => {
  if (type === 'image') return Image;
  if (type === 'video') return Video;
  if (type === 'document') return File;
  return Upload;
};

// ─── Component ────────────────────────────────────────────────
const MediaUploader: React.FC<MediaUploaderProps> = ({
  headerType,
  cloudinaryUrl,
  localPreviewUrl,
  fileName,
  whatsappAccountId,
  onUploadSuccess,
  onRemove,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const Icon = getIcon(headerType);
  const metaLimit = META_LIMITS[headerType];
  const uploadLimit = UPLOAD_LIMITS[headerType];
  const displayUrl = localPreviewUrl || cloudinaryUrl; // blob first, then permanent

  // ─── Validate ───────────────────────────────────────────────
  const validateFile = (file: File): string | null => {
    if (!uploadLimit) return 'Unsupported file type';
    if (file.size === 0) return 'File is empty';
    if (file.size > uploadLimit.size) {
      return (
        `File too large (${formatBytes(file.size)}). ` +
        `Maximum: ${uploadLimit.label}. Please compress first.`
      );
    }
    return null; // valid
  };

  // ─── Upload ─────────────────────────────────────────────────
  const handleFile = async (file: File) => {
    setError(null);

    // Frontend validation
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Warn about compression
    const willCompress = metaLimit && file.size > metaLimit.size;

    if (!whatsappAccountId) {
      setError('Please select a WhatsApp account first (Settings tab).');
      return;
    }

    setUploading(true);
    setUploadStatus(
      willCompress
        ? 'Uploading and compressing...'
        : file.size > 10 * 1024 * 1024
          ? 'Uploading large file...'
          : 'Uploading...'
    );

    // Create local preview immediately
    const localUrl = URL.createObjectURL(file);

    try {
      const response = await templatesApi.uploadMedia(file, whatsappAccountId);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Upload failed');
      }

      const data = response.data.data;

      // ✅ Extract and validate handle
      const rawHandle = String(
        data.mediaHandle || data.mediaId || ''
      ).trim();

      if (!isValidMetaHandle(rawHandle)) {
        throw new Error(
          'Server returned invalid media handle. Please try again.'
        );
      }

      const permanentUrl = String(
        data.cloudinaryUrl || data.permanentUrl || data.url || ''
      ).trim();

      if (!permanentUrl || !permanentUrl.startsWith('http')) {
        throw new Error(
          'Server did not return a valid permanent URL. Please try again.'
        );
      }

      console.log('✅ Media upload success:', {
        handle: rawHandle.substring(0, 30) + '...',
        cloudinaryUrl: permanentUrl.substring(0, 60),
      });

      onUploadSuccess({
        mediaHandle: rawHandle,
        cloudinaryUrl: permanentUrl,
        localPreviewUrl: localUrl,
        fileName: file.name,
        whatsappAccountId: data.whatsappAccountId || whatsappAccountId,
      });

    } catch (err: any) {
      URL.revokeObjectURL(localUrl); // cleanup blob
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Upload failed. Please try again.';
      setError(msg);
      console.error('❌ Media upload failed:', msg);
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  };

  // ─── Drag handlers ──────────────────────────────────────────
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // allow re-upload of same file
  };

  // ─── Uploaded State ─────────────────────────────────────────
  if (displayUrl && !uploading) {
    return (
      <div className="relative bg-gray-100 rounded-xl overflow-hidden">
        {/* Preview */}
        {headerType === 'image' && (
          <img
            src={displayUrl}
            alt="Header preview"
            className="w-full h-48 object-cover"
          />
        )}
        {headerType === 'video' && (
          <video
            src={displayUrl}
            className="w-full h-48 object-cover"
            controls
          />
        )}
        {headerType === 'document' && (
          <div className="flex items-center space-x-3 p-4">
            <div className="w-12 h-14 bg-red-100 rounded flex items-center justify-center">
              <File className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {fileName || 'Document'}
              </p>
              <p className="text-sm text-gray-500">PDF Document</p>
            </div>
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-2 bg-white/90
                     hover:bg-white rounded-full shadow-md
                     transition-colors"
          title="Remove media"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Uploaded badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1
                        bg-green-100 text-green-700 rounded-full
                        text-xs font-medium flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>
            {cloudinaryUrl ? 'Saved' : 'Uploaded'}
          </span>
        </div>
      </div>
    );
  }

  // ─── Upload Zone ─────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6
                    text-center transition-all
                    ${dragActive
            ? 'border-primary-500 bg-primary-50'
            : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES[headerType] || '*'}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        {uploading ? (
          /* ── Uploading State ── */
          <div className="space-y-3 pointer-events-none">
            <div className="w-12 h-12 mx-auto rounded-full
                            bg-primary-100 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            </div>
            <p className="text-sm text-gray-700 font-medium">
              {uploadStatus}
            </p>
            <div className="w-40 h-1.5 bg-gray-200 rounded-full
                            mx-auto overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full
                              animate-pulse w-2/3" />
            </div>
            <p className="text-xs text-gray-500">
              Please wait, do not close this window
            </p>
          </div>
        ) : (
          /* ── Idle State ── */
          <div className="space-y-3">
            <div className={`w-12 h-12 mx-auto rounded-full
                             flex items-center justify-center
                             ${dragActive ? 'bg-primary-100' : 'bg-gray-200'}`}>
              <Icon className={`w-6 h-6 ${dragActive ? 'text-primary-600' : 'text-gray-500'
                }`} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">
                {dragActive
                  ? 'Drop file here'
                  : `Upload ${TYPE_LABELS[headerType] || 'File'}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {headerType === 'image' &&
                  `JPG, PNG, WebP — Max ${uploadLimit?.label}`}
                {headerType === 'video' &&
                  `MP4 — Max ${uploadLimit?.label} (auto-compressed to ${metaLimit?.label})`}
                {headerType === 'document' &&
                  `PDF, DOC, XLS, TXT — Max ${uploadLimit?.label}`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-white border border-gray-300
                         rounded-lg text-sm font-medium text-gray-700
                         hover:bg-gray-50 transition-colors"
            >
              Choose File
            </button>
          </div>
        )}

        {/* Error */}
        {error && !uploading && (
          <div className="mt-3 flex items-start justify-center
                          space-x-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-left">{error}</span>
          </div>
        )}
      </div>

      {/* Limits info */}
      {metaLimit && (
        <div className="flex items-start gap-2 text-xs text-gray-500 px-1">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <p>
            WhatsApp {TYPE_LABELS[headerType]} limit:{' '}
            <strong>{metaLimit.label}</strong>.
            {headerType === 'video' &&
              ' Videos larger than 16 MB will be auto-compressed.'}
            {headerType === 'image' &&
              ' Images larger than 5 MB will be auto-optimized.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;