// src/components/campaigns/CsvAudienceUploader.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  X,
  Info
} from 'lucide-react';
import { campaigns as campaignApi } from '../../services/api';
import toast from 'react-hot-toast';

interface UploadedContact {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface UploadResult {
  total: number;
  successful: number;
  failed: number;
  duplicates: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  contacts: UploadedContact[];
  errors?: Array<{
    row: number;
    phone: string;
    error: string;
  }>;
}

interface Props {
  onImported: (contacts: UploadedContact[]) => void;
}

export const CsvAudienceUploader: React.FC<Props> = ({ onImported }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const isMountedRef = useRef(true);

  // ✅ Memory leak prevention
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const handleDownloadSample = () => {
    const csvContent = [
      'phone,firstName,lastName,email,tags',
      '+911234567890,John,Doe,john@example.com,customer',
      '+919876543210,Jane,Smith,jane@example.com,premium',
      '+919123456789,Bob,Johnson,bob@example.com,vip',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-contacts.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Sample CSV downloaded');
  };

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Please upload a valid CSV file (.csv)';
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File size exceeds 5MB limit';
    }

    if (file.size === 0) {
      return 'File is empty';
    }

    return null;
  };

  const handleFileSelect = () => {
    inputRef.current?.click();
  };

  // ✅ Client-side pre-parsing validation before pushing to backend
  const preValidateCsvHeaders = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) {
          resolve(false);
          return;
        }
        const firstLine = text.split('\n')[0]?.toLowerCase() || '';
        const headers = firstLine.split(',').map(h => h.trim());

        // Mandatory field check
        if (!headers.includes('phone')) {
          toast.error("Invalid CSV: Missing mandatory 'phone' header column!");
          resolve(false);
        } else {
          resolve(true);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file.slice(0, 1024)); // Read first 1KB only for performance
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      e.target.value = '';
      return;
    }

    // Pre-validate headers
    const isValidCSV = await preValidateCsvHeaders(file);
    if (!isValidCSV) {
      e.target.value = '';
      return;
    }

    setUploading(true);
    setResult(null);
    setShowErrors(false);

    try {
      console.log('📤 Uploading CSV file:', file.name);
      const response = await campaignApi.uploadContacts(file);

      if (!isMountedRef.current) return;

      if (response.data.success) {
        const data: UploadResult = response.data.data;
        setResult(data);

        if (data.successful > 0) {
          toast.success(`✅ ${data.successful} contacts uploaded successfully!`, { duration: 5000 });
          if (data.contacts && data.contacts.length > 0) {
            onImported(data.contacts);
          }
        } else {
          toast.error('No valid contacts found in CSV');
        }

        if (data.duplicates > 0) {
          toast(`ℹ️ ${data.duplicates} duplicate contacts skipped`, {
            icon: '⚠️',
            duration: 4000,
          });
        }

        if (data.failed > 0) {
          toast.error(`❌ ${data.failed} contacts failed to upload`);
        }
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('❌ CSV upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload CSV';
      if (isMountedRef.current) {
        toast.error(errorMessage);
        setResult(null);
      }
    } finally {
      if (isMountedRef.current) {
        setUploading(false);
        e.target.value = '';
      }
    }
  };

  const handleClearResults = () => {
    setResult(null);
    setShowErrors(false);
  };

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">
            Upload Contacts via CSV
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Import multiple contacts at once using a CSV file
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-2 px-3.5 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-semibold shadow-sm"
        >
          <Download className="w-4 h-4" />
          Sample CSV
        </button>
      </div>

      {/* ✅ FIXED: Styled upload box strictly using emerald brand variables */}
      <div
        onClick={!uploading ? handleFileSelect : undefined}
        className={`relative flex flex-col items-center justify-center w-full h-40 px-4 transition bg-white border-2 border-dashed rounded-2xl ${uploading
            ? 'border-emerald-500 bg-emerald-50/20'
            : 'border-gray-200 hover:border-emerald-500 cursor-pointer shadow-sm'
          }`}
      >
        <div className="flex flex-col items-center justify-center">
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-gray-700">
                Uploading and processing...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This may take a few moments
              </p>
            </>
          ) : (
            <>
              <div className="p-3 bg-emerald-50 rounded-full mb-3 border border-emerald-100">
                <Upload className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">
                Click to upload CSV file
              </p>
              <p className="text-xs text-gray-400">
                or drag and drop (Max 5MB)
              </p>
              <div className="flex items-center gap-1.5 mt-2.5 text-xs text-gray-400 font-medium">
                <FileText className="w-3.5 h-3.5" />
                <span>Supported: .csv</span>
              </div>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".csv,text/csv"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </div>

      {/* Info Card */}
      <div className="flex items-start gap-2 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs text-blue-800 leading-relaxed font-semibold">
          <p className="font-bold text-blue-900 mb-1">CSV Format Guidelines:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-blue-900">phone</strong> (required): +country_code + number (e.g., +911234567890)</li>
            <li><strong>firstName</strong> (optional): Contact's first name</li>
            <li><strong>lastName</strong> (optional): Contact's last name</li>
            <li><strong>email</strong> (optional): Contact's email address</li>
            <li><strong>tags</strong> (optional): Comma-separated tags</li>
          </ul>
        </div>
      </div>

      {/* Upload Results */}
      {result && (
        <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">
                  Upload Complete
                </h4>
                <p className="text-xs text-gray-450 font-bold mt-0.5">
                  {result.total} rows processed
                </p>
              </div>
            </div>
            <button
              onClick={handleClearResults}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="text-2xl font-black text-emerald-700">
                {result.successful}
              </div>
              <div className="text-[10px] font-bold text-emerald-800 mt-1 uppercase tracking-wider">
                Successful
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
              <div className="text-2xl font-black text-yellow-700">
                {result.duplicates || result.duplicateRows || 0}
              </div>
              <div className="text-[10px] font-bold text-yellow-800 mt-1 uppercase tracking-wider">
                Duplicates
              </div>
            </div>

            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <div className="text-2xl font-black text-red-700">
                {result.failed}
              </div>
              <div className="text-[10px] font-bold text-red-800 mt-1 uppercase tracking-wider">
                Failed
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="text-2xl font-black text-gray-500">
                {result.total}
              </div>
              <div className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                Total Rows
              </div>
            </div>
          </div>

          {/* Errors list */}
          {result.errors && result.errors.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700"
              >
                <AlertCircle className="w-4 h-4" />
                <span>
                  {showErrors ? 'Hide' : 'Show'} {result.errors.length} errors
                </span>
              </button>

              {showErrors && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-2xl max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {result.errors.slice(0, 10).map((error, index) => (
                      <div
                        key={index}
                        className="text-xs text-red-700 flex items-start gap-2 font-semibold"
                      >
                        <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded font-black">
                          Row {error.row}
                        </span>
                        <span className="flex-1">
                          {error.phone && <span className="font-bold">{error.phone}:</span>}{' '}
                          {error.error}
                        </span>
                      </div>
                    ))}
                    {result.errors.length > 10 && (
                      <p className="text-xs text-red-500 italic font-bold">
                        ... and {result.errors.length - 10} more errors occurred
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CsvAudienceUploader;