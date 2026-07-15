import React, { useState, useRef } from 'react';
import { Upload, Image, Video, File, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import type { HeaderType } from '../../types/template';
import toast from 'react-hot-toast';
import { templates as templatesApi } from '../../services/api';

interface MediaUploaderProps {
  headerType: HeaderType;
  mediaUrl?: string;
  fileName?: string;
  whatsappAccountId?: string;
  onMediaChange: (url: string, fileName?: string, metaHandle?: string, metaId?: string) => void;
  onRemove: () => void;
}

const getIcon = (headerType: HeaderType) => {
  switch (headerType) {
    case 'image': return Image;
    case 'video': return Video;
    case 'document': return File;
    default: return Upload;
  }
};

// ✅ META HARD LIMITS
const META_LIMITS = {
  image: { size: 5 * 1024 * 1024, label: '5 MB' },
  video: { size: 16 * 1024 * 1024, label: '16 MB' },
  document: { size: 100 * 1024 * 1024, label: '100 MB' },
};

// ✅ ABSOLUTE UPLOAD LIMITS (before compression)
const UPLOAD_LIMITS = {
  image: { size: 15 * 1024 * 1024, label: '15 MB' },
  video: { size: 100 * 1024 * 1024, label: '100 MB' },
  document: { size: 100 * 1024 * 1024, label: '100 MB' },
};

const formatBytes = (bytes: number): string => {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const MediaUploader: React.FC<MediaUploaderProps> = ({
  headerType,
  mediaUrl,
  fileName,
  whatsappAccountId,
  onMediaChange,
  onRemove,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getAcceptedTypes = () => {
    switch (headerType) {
      case 'image': return 'image/jpeg,image/png,image/webp';
      case 'video': return 'video/mp4';
      case 'document': return 'application/pdf,application/msword,.doc,.docx,.xls,.xlsx,.txt';
      default: return '';
    }
  };

  const Icon = getIcon(headerType);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // ✅ VALIDATE FILE BEFORE UPLOAD
  const validateFile = (file: File): { valid: boolean; error?: string; warning?: string } => {
    if (headerType === 'none' || headerType === 'text') {
      return { valid: false, error: 'Unsupported file type' };
    }
    const uploadLimit = UPLOAD_LIMITS[headerType as 'image' | 'video' | 'document'];
    const metaLimit = META_LIMITS[headerType as 'image' | 'video' | 'document'];

    // ❌ ABSOLUTE MAX EXCEEDED
    if (file.size > uploadLimit.size) {
      return {
        valid: false,
        error: `File too large (${formatBytes(file.size)}). Maximum allowed: ${uploadLimit.label}. Please compress your file first.`,
      };
    }

    // ⚠️ WARNING - Will be compressed
    if (file.size > metaLimit.size) {
      return {
        valid: true,
        warning: `File is ${formatBytes(file.size)} - larger than WhatsApp's ${metaLimit.label} limit. It will be automatically compressed.`,
      };
    }

    return { valid: true };
  };

  const handleFile = async (file: File) => {
    setError(null);

    // ✅ Step 1: Frontend validation
    const validation = validateFile(file);
    
    if (!validation.valid) {
      setError(validation.error!);
      toast.error(validation.error!, { duration: 6000 });
      return;
    }

    if (validation.warning) {
      toast(validation.warning, { 
        duration: 5000, 
        icon: '📦',
        style: {
          background: '#FEF3C7',
          color: '#92400E',
          border: '1px solid #FCD34D',
        },
      });
    }

    // ✅ Step 2: Upload to backend
    setUploading(true);
    setUploadProgress('Preparing upload...');

    try {
      // Show progress based on file size
      if (file.size > 20 * 1024 * 1024) {
        setUploadProgress('Uploading large file, this may take a while...');
      } else if (file.size > 5 * 1024 * 1024) {
        setUploadProgress('Uploading and compressing...');
      } else {
        setUploadProgress('Uploading...');
      }

      const response = await templatesApi.uploadMedia(file, whatsappAccountId);

      if (response.data.success) {
        const data = response.data.data;
        
        console.log('✅ Upload successful:', {
          url: data.cloudinaryUrl?.substring(0, 60),
          size: data.size,
          compressed: data.compressionApplied,
        });

        // Show success message with compression info
        if (data.compressionApplied && data.originalSize) {
          const savedMB = ((data.originalSize - data.size) / 1024 / 1024).toFixed(2);
          toast.success(
            `File compressed! Saved ${savedMB} MB (${formatBytes(data.size)} final)`,
            { duration: 4000 }
          );
        } else {
          toast.success('File uploaded successfully!');
        }

        onMediaChange(
          data.cloudinaryUrl || data.url,
          file.name,
          data.mediaHandle,
          data.metaNumericId
        );
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Upload failed';
      console.error('❌ Upload error:', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg, { duration: 8000 });
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
      e.target.value = ''; // Reset for re-upload
    }
  };

  if (mediaUrl) {
    return (
      <div className="relative bg-gray-100 rounded-xl overflow-hidden">
        {headerType === 'image' && (
          <img
            src={mediaUrl}
            alt="Header preview"
            className="w-full h-48 object-cover"
          />
        )}
        {headerType === 'video' && (
          <video
            src={mediaUrl}
            className="w-full h-48 object-cover"
            controls
          />
        )}
        {headerType === 'document' && (
          <div className="flex items-center space-x-3 p-4">
            <div className="w-12 h-14 bg-red-100 rounded flex items-center justify-center">
              <File className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{fileName || 'Document'}</p>
              <p className="text-sm text-gray-500">PDF Document</p>
            </div>
          </div>
        )}

        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Uploaded</span>
        </div>
      </div>
    );
  }

  if (headerType === 'none' || headerType === 'text') {
    return null;
  }

  const metaLimit = META_LIMITS[headerType as 'image' | 'video' | 'document'];
  const uploadLimit = UPLOAD_LIMITS[headerType as 'image' | 'video' | 'document'];

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={getAcceptedTypes()}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary-100 flex items-center justify-center animate-pulse">
              <Icon className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-sm text-gray-700 font-medium">{uploadProgress}</p>
            <div className="w-40 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full animate-pulse w-2/3"></div>
            </div>
            <p className="text-xs text-gray-500">Please wait, do not close this window</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                dragActive ? 'bg-primary-100' : 'bg-gray-200'
              }`}
            >
              <Icon className={`w-6 h-6 ${dragActive ? 'text-primary-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {dragActive ? 'Drop file here' : `Upload ${headerType}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {headerType === 'image' && `JPG, PNG, WebP - Max ${uploadLimit.label} (auto-optimized)`}
                {headerType === 'video' && `MP4 - Max ${uploadLimit.label} (auto-compressed to ${metaLimit.label})`}
                {headerType === 'document' && `PDF, DOC, XLS, TXT - Max ${uploadLimit.label}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Choose File
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center justify-center space-x-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-left">{error}</span>
          </div>
        )}
      </div>

      {/* ✅ WhatsApp Limits Info */}
      <div className="flex items-start gap-2 text-xs text-gray-500 px-1">
        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <p>
          WhatsApp {headerType} limit: <strong>{metaLimit.label}</strong>.
          {headerType === 'video' && ' Large videos will be auto-compressed to 720p.'}
          {headerType === 'image' && ' Large images will be auto-optimized.'}
        </p>
      </div>
    </div>
  );
};

export default MediaUploader;