// 📁 src/pages/CreateTemplate.tsx - FINAL FIXED VERSION

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Info,
  FileText,
  Image,
  Video,
  File,
  Type,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  MessageSquare,
  RefreshCw,
  Upload,
} from 'lucide-react';
import api, { templates as templateApi, handleApiError } from '../services/api';
import TemplatePreview from '../components/templates/TemplatePreview';
import type { TemplateFormData, HeaderType, TemplateCategory } from '../types/template';

interface WhatsAppAccount {
  id: string;
  businessName?: string;
  displayName?: string;
  phoneNumber: string;
  phoneNumberId: string;
  wabaId: string;
  isDefault: boolean;
  status: string;
  qualityRating?: string;
  source?: string;
}

// ============================================
// COMPONENT
// ============================================
const CreateTemplate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const duplicateFrom = location.state?.duplicateFrom;

  // Loading & Status States
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'buttons' | 'settings'>('content');
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // WhatsApp Account States
  const [whatsappAccounts, setWhatsappAccounts] = useState<WhatsAppAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [mediaUploading, setMediaUploading] = useState(false);

  // Form State - Initialize from duplicate if exists
  const [formData, setFormData] = useState<TemplateFormData>({
    name: duplicateFrom ? `${duplicateFrom.name}_copy` : '',
    category: (duplicateFrom?.category?.toLowerCase() as TemplateCategory) || 'utility',
    language: duplicateFrom?.language || 'en',
    header: duplicateFrom?.header || { type: 'none' },
    body: duplicateFrom?.body || '',
    footer: duplicateFrom?.footer || '',
    buttons: duplicateFrom?.buttons || [],
  });

  const [sampleVariables, setSampleVariables] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extract variables from body and header
  const extractedVariables = useMemo(() => {
    const bodyMatches = formData.body.match(/{{(\d+)}}/g) || [];
    const headerMatches =
      (formData.header.type === 'text' ? formData.header.text?.match(/{{(\d+)}}/g) : null) || [];

    const allMatches = [...bodyMatches, ...headerMatches];
    const variables = allMatches.map((m) => m.replace(/{{|}}/g, ''));
    return Array.from(new Set(variables)).sort((a, b) => parseInt(a) - parseInt(b));
  }, [formData.body, formData.header]);

  // ==========================================
  // ✅ ROBUST LOAD WHATSAPP ACCOUNTS
  // ==========================================
  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      setAccountsError(null);
      setApiError(null);

      // ✅ Get organization ID (try multiple sources)
      const orgId =
        localStorage.getItem('currentOrganizationId') ||
        (() => {
          try {
            const stored = localStorage.getItem('wabmeta_org');
            if (stored) {
              const parsed = JSON.parse(stored);
              return parsed?.id || null;
            }
            return null;
          } catch {
            return null;
          }
        })() ||
        (() => {
          try {
            const user = JSON.parse(localStorage.getItem('wabmeta_user') || 'null');
            return user?.organizationId || null;
          } catch {
            return null;
          }
        })();

      if (!orgId) {
        console.error('❌ No organization ID found');
        setAccountsError('Organization not found. Please login again.');
        setLoadingAccounts(false);
        return;
      }

      console.log('📋 Loading accounts for organization:', orgId);

      // ✅ Call API with correct endpoint
      const response = await api.get(`/meta/organizations/${orgId}/accounts`);

      console.log('✅ API Response RAW:', response.data);

      // ✅ Robust response parsing (handles multiple formats)
      let rawAccounts: any[] = [];

      if (response.data?.data?.accounts && Array.isArray(response.data.data.accounts)) {
        // Format: { success: true, data: { accounts: [...] } }
        rawAccounts = response.data.data.accounts;
      } else if (response.data?.accounts && Array.isArray(response.data.accounts)) {
        // Format: { success: true, accounts: [...] }
        rawAccounts = response.data.accounts;
      } else if (Array.isArray(response.data?.data)) {
        // Format: { success: true, data: [...] }
        rawAccounts = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Format: [...]
        rawAccounts = response.data;
      } else {
        console.warn('⚠️ Unexpected response format:', response.data);
        rawAccounts = [];
      }

      console.log('📊 Raw accounts extracted:', rawAccounts.length);

      // ✅ Normalize accounts (handle different field names)
      const normalizedAccounts: WhatsAppAccount[] = rawAccounts.map((account: any) => {
        // Determine status
        let status = 'DISCONNECTED';
        if (account.status) {
          status = String(account.status).toUpperCase();
        } else if (account.isActive === true) {
          status = 'CONNECTED';
        } else if (account.isActive === false) {
          status = 'DISCONNECTED';
        }

        // Determine isDefault
        let isDefault = false;
        if (typeof account.isDefault === 'boolean') {
          isDefault = account.isDefault;
        } else if (typeof account.isPrimary === 'boolean') {
          isDefault = account.isPrimary;
        }

        return {
          id: account.id,
          phoneNumber: account.phoneNumber || account.phone_number || '',
          phoneNumberId: account.phoneNumberId || account.phone_number_id || '',
          wabaId: account.wabaId || account.waba_id || '',
          displayName: account.displayName || account.display_name || account.verifiedName || account.verified_name || '',
          businessName: account.businessName || account.business_name || '',
          status,
          isDefault,
          qualityRating: account.qualityRating || account.quality_rating || '',
          source: account.source || 'WhatsAppAccount',
        };
      });

      console.log('📊 Normalized accounts:', normalizedAccounts);

      // ✅ Filter connected accounts only
      const connectedAccounts = normalizedAccounts.filter(
        (account) => account.status === 'CONNECTED'
      );

      console.log('✅ Total accounts:', normalizedAccounts.length);
      console.log('✅ Connected accounts:', connectedAccounts.length);

      setWhatsappAccounts(connectedAccounts);

      // ✅ Select default account
      if (connectedAccounts.length > 0) {
        const defaultAccount = connectedAccounts.find((a) => a.isDefault) || connectedAccounts[0];
        setSelectedAccountId(defaultAccount.id);
        console.log('✅ Selected account:', defaultAccount.phoneNumber, '(ID:', defaultAccount.id, ')');
      } else {
        console.warn('⚠️ No connected WhatsApp accounts found');
        setSelectedAccountId('');
      }
    } catch (error: any) {
      console.error('❌ Failed to load WhatsApp accounts:', error);

      let errorMessage = 'Failed to load WhatsApp accounts. ';

      if (error.response?.status === 404) {
        errorMessage = 'No WhatsApp accounts found for this organization.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have access to this organization.';
      } else {
        errorMessage += error.response?.data?.message || error.message || 'Please try again.';
      }

      setAccountsError(errorMessage);
      setWhatsappAccounts([]);
      setSelectedAccountId('');
    } finally {
      setLoadingAccounts(false);
    }
  };

  // ✅ HANDLER: Media Upload for Preview
  // ✅ HANDLER: Media Upload for Preview
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = '';

    // Validate file type
    const validTypes: Record<string, string[]> = {
      image: ['image/jpeg', 'image/png', 'image/jpg'],
      video: ['video/mp4', 'video/3gpp'],
      document: ['application/pdf'],
    };

    const allowedTypes = validTypes[formData.header.type] || [];

    if (!allowedTypes.includes(file.type)) {
      setApiError(`Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validate size
    const maxSizes: Record<string, number> = {
      image: 5 * 1024 * 1024,      // 5MB
      video: 16 * 1024 * 1024,     // 16MB
      document: 100 * 1024 * 1024, // 100MB
    };

    const maxSize = maxSizes[formData.header.type] || 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setApiError(`File too large. Maximum size: ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
      return;
    }

    // Check WhatsApp account selected
    if (!selectedAccountId) {
      setApiError('Please select a WhatsApp Business Account first in the Settings tab.');
      setActiveTab('settings');
      return;
    }

    try {
      setMediaUploading(true);
      setApiError(null);

      console.log('📤 Starting media upload:', {
        filename: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type,
        headerType: formData.header.type,
        accountId: selectedAccountId,
      });

      // ✅ Upload to Meta via backend
      const response = await templateApi.uploadMedia(file, selectedAccountId);

      console.log('📥 Upload response:', response.data);

      if (response.data?.success && response.data?.data?.mediaId) {
        const { mediaId, filename } = response.data.data;

        console.log('✅ Media uploaded to Meta successfully:', mediaId);

        // ✅ Store Media ID (NOT blob URL)
        updateFormData('header', {
          ...formData.header,
          mediaId: mediaId,                    // ✅ Meta's ID for API
          mediaUrl: URL.createObjectURL(file), // Local preview only
          fileName: filename || file.name,
        });

        setSuccessMessage('✅ Media uploaded to Meta successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(response.data?.message || 'Upload failed - no media ID returned');
      }
    } catch (error: any) {
      console.error('❌ Media upload failed:', error);

      let errorMessage = 'Failed to upload media. ';

      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid file format or size.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.message || 'Server error. Please try again.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timed out. File may be too large.';
      } else {
        errorMessage += error.response?.data?.message || error.message || 'Please try again.';
      }

      setApiError(errorMessage);
    } finally {
      setMediaUploading(false);
    }
  };

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  // ==========================================
  // CONSTANTS
  // ==========================================
  const categories: { value: TemplateCategory; label: string; description: string }[] = [
    { value: 'marketing', label: 'Marketing', description: 'Promotional messages, offers, updates' },
    { value: 'utility', label: 'Utility', description: 'Order updates, confirmations, alerts' },
    { value: 'authentication', label: 'Authentication', description: 'OTPs, verification codes' },
  ];

  const headerTypes: { value: HeaderType; label: string; icon: React.ElementType }[] = [
    { value: 'none', label: 'None', icon: FileText },
    { value: 'text', label: 'Text', icon: Type },
    { value: 'image', label: 'Image', icon: Image },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'document', label: 'Document', icon: File },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'en_US', label: 'English (US)' },
    { value: 'en_GB', label: 'English (UK)' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'mr', label: 'Marathi' },
    { value: 'gu', label: 'Gujarati' },
    { value: 'bn', label: 'Bengali' },
    { value: 'kn', label: 'Kannada' },
    { value: 'ml', label: 'Malayalam' },
    { value: 'pa', label: 'Punjabi' },
    { value: 'es', label: 'Spanish' },
    { value: 'pt_BR', label: 'Portuguese (Brazil)' },
    { value: 'ar', label: 'Arabic' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
  ];

  // ==========================================
  // VALIDATION
  // ==========================================
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // WhatsApp Account validation
    if (!selectedAccountId) {
      newErrors.account = 'Please select a WhatsApp Business Account';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (!/^[a-z0-9_]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain lowercase letters, numbers, and underscores';
    } else if (formData.name.length > 512) {
      newErrors.name = 'Name is too long (max 512 characters)';
    }

    // Body validation
    if (!formData.body.trim()) {
      newErrors.body = 'Message body is required';
    } else if (formData.body.length < 10) {
      newErrors.body = 'Body must be at least 10 characters';
    } else if (formData.body.length > 1024) {
      newErrors.body = 'Body is too long (max 1024 characters)';
    }

    // Header text validation
    if (formData.header.type === 'text' && !formData.header.text?.trim()) {
      newErrors.headerText = 'Header text is required when header type is text';
    }

    // Footer validation
    if (formData.footer && formData.footer.length > 60) {
      newErrors.footer = 'Footer is too long (max 60 characters)';
    }

    // Button validation
    formData.buttons.forEach((btn, index) => {
      if (!btn.text.trim()) {
        newErrors[`button_${index}_text`] = 'Button text is required';
      } else if (btn.text.length > 25) {
        newErrors[`button_${index}_text`] = 'Button text max 25 characters';
      }

      if (btn.type === 'url') {
        if (!btn.url?.trim()) {
          newErrors[`button_${index}_url`] = 'URL is required';
        } else {
          try {
            new URL(btn.url);
          } catch {
            newErrors[`button_${index}_url`] = 'Invalid URL format';
          }
        }
      }

      if (btn.type === 'phone') {
        if (!btn.phoneNumber?.trim()) {
          newErrors[`button_${index}_phone`] = 'Phone number is required';
        } else if (!/^\+[1-9]\d{10,14}$/.test(btn.phoneNumber)) {
          newErrors[`button_${index}_phone`] = 'Invalid phone format (e.g., +919876543210)';
        }
      }
    });

    // Variable samples validation
    if (extractedVariables.length > 0) {
      const missingSamples = extractedVariables.filter((v: string) => !sampleVariables[v]?.trim());
      if (missingSamples.length > 0) {
        newErrors.variables = `Please provide sample values for variables: {{${missingSamples.join('}}, {{')}}}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // SUBMIT HANDLER
  // ==========================================
  const handleSubmit = async (asDraft: boolean = false) => {
    setApiError(null);
    setSuccessMessage(null);

    // Check if accounts are loaded
    if (loadingAccounts) {
      setApiError('Please wait while accounts are loading...');
      return;
    }

    // Check if there are any connected accounts
    if (whatsappAccounts.length === 0) {
      setApiError(
        'No WhatsApp Business Account connected. Please connect an account in Settings first.'
      );
      return;
    }

    // Validate form (skip for drafts)
    if (!asDraft && !validateForm()) {
      if (errors.account) {
        setActiveTab('settings');
      } else {
        setActiveTab('content');
      }
      const firstError = document.querySelector('.text-red-600');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSaving(true);

    try {
      // Clean name
      const cleanName = formData.name.replace(/_+$/, '');

      // Map buttons
      const mappedButtons = formData.buttons
        .filter((btn) => btn.text.trim())
        .map((btn) => {
          if (btn.type === 'quick_reply') {
            return { type: 'QUICK_REPLY' as const, text: btn.text.trim() };
          } else if (btn.type === 'url') {
            return { type: 'URL' as const, text: btn.text.trim(), url: btn.url?.trim() || '' };
          } else if (btn.type === 'phone') {
            return { type: 'PHONE_NUMBER' as const, text: btn.text.trim(), phoneNumber: btn.phoneNumber?.trim() || '' };
          }
          return null;
        })
        .filter(Boolean);

      // Map variables with examples
      const mappedVariables = extractedVariables.map((v: string) => ({
        index: parseInt(v),
        type: 'text' as const,
        example: sampleVariables[v]?.trim() || 'example',
      }));

      // Build payload
      const payload: Record<string, any> = {
        name: cleanName,
        language: formData.language,
        category: formData.category.toUpperCase(),
        headerType: formData.header.type.toUpperCase(),
        bodyText: formData.body.trim(),
        whatsappAccountId: selectedAccountId,
      };

      // ✅ Handle header content based on type
      if (formData.header.type === 'text') {
        if (formData.header.text?.trim()) {
          payload.headerContent = formData.header.text.trim();
        }
      } 
      else if (['image', 'video', 'document'].includes(formData.header.type)) {
        // ✅ CRITICAL: Check for uploaded Media ID
        if (formData.header.mediaId) {
          payload.headerMediaId = formData.header.mediaId;
          console.log('✅ Using uploaded media ID:', formData.header.mediaId);
        } else {
          // ❌ No media uploaded - show error
          setApiError(
            `Please upload ${formData.header.type} for the header first. ` +
            'Click the upload button to upload media to Meta.'
          );
          setSaving(false);
          return;
        }
      }

      // Footer
      if (formData.footer?.trim()) {
        payload.footerText = formData.footer.trim();
      }

      // Buttons
      if (mappedButtons.length > 0) {
        payload.buttons = mappedButtons;
      }

      // Variables
      if (mappedVariables.length > 0) {
        payload.variables = mappedVariables;
      }

      console.log('📤 Submitting template:', JSON.stringify(payload, null, 2));

      // Call API
      const response = await templateApi.create(payload);

      console.log('✅ Template created:', response.data);

      setSuccessMessage('🎉 Template submitted for Meta approval!');

      // Navigate after short delay
      setTimeout(() => {
        navigate('/dashboard/templates');
      }, 1500);
    } catch (error: any) {
      console.error('❌ Template creation failed:', error);

      let errorMessage = 'Failed to create template. ';
      const errorData = error.response?.data;

      if (errorData?.error?.issues && Array.isArray(errorData.error.issues)) {
        errorMessage = errorData.error.issues
          .map((issue: any) => `${issue.path?.join('.') || 'field'}: ${issue.message}`)
          .join('\n');
      } else if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setApiError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // FORM HELPERS
  // ==========================================
  const updateFormData = <K extends keyof TemplateFormData>(key: K, value: TemplateFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const clearMessages = () => {
    setApiError(null);
    setSuccessMessage(null);
  };

  // Get selected account details
  const selectedAccount = whatsappAccounts.find((a) => a.id === selectedAccountId);

  // Get display name for account
  const getAccountDisplayName = (account: WhatsAppAccount) => {
    return account.displayName || account.businessName || 'WhatsApp Account';
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/templates"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {duplicateFrom ? 'Duplicate Template' : 'Create Template'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Design your WhatsApp message template
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={saving || loadingAccounts || mediaUploading || whatsappAccounts.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : mediaUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading Media...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Submit for Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
            </div>
            <button
              onClick={clearMessages}
              className="text-green-400 hover:text-green-600 dark:hover:text-green-200"
            >
              ×
            </button>
          </div>
        )}

        {/* API Error Banner */}
        {apiError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Submission Failed
              </h3>
              <pre className="text-sm text-red-600 dark:text-red-400 mt-1 whitespace-pre-wrap font-sans">
                {apiError}
              </pre>
            </div>
            <button
              onClick={clearMessages}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-200"
            >
              ×
            </button>
          </div>
        )}

        {/* No Account Warning */}
        {!loadingAccounts && whatsappAccounts.length === 0 && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                No WhatsApp Account Connected
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                {accountsError || 'You need to connect a WhatsApp Business Account before creating templates.'}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <Link
                  to="/dashboard/settings"
                  className="inline-flex items-center text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200"
                >
                  Go to Settings →
                </Link>
                <button
                  onClick={loadAccounts}
                  className="inline-flex items-center text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 shrink-0" />
          <div>
            <p className="text-blue-800 dark:text-blue-200 font-medium">Template Guidelines</p>
            <ul className="text-blue-700 dark:text-blue-300 text-sm mt-1 space-y-1 list-disc list-inside">
              <li>Templates must be approved by Meta before use (usually 24-48 hours)</li>
              <li>Use variables like {'{{1}}'}, {'{{2}}'} for dynamic content</li>
              <li>Marketing templates require opt-in from recipients</li>
              <li>Avoid promotional content in Utility templates</li>
            </ul>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'content', label: 'Content' },
                  { id: 'buttons', label: 'Buttons' },
                  { id: 'settings', label: 'Settings' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border-b-2 border-primary-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Content Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    {/* Template Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          updateFormData(
                            'name',
                            e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, '_')
                              .replace(/[^a-z0-9_]/g, '')
                          )
                        }
                        placeholder="e.g., order_confirmation"
                        maxLength={512}
                        className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${errors.name
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500/20'
                            : 'border-gray-200 dark:border-gray-600 focus:ring-primary-500/20 focus:border-primary-500'
                          }`}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Use lowercase letters, numbers, and underscores only
                      </p>
                    </div>

                    {/* Header Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Header Type
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {headerTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => updateFormData('header', { type: type.value })}
                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${formData.header.type === type.value
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                              }`}
                          >
                            <type.icon className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Header Content */}
                    {formData.header.type === 'text' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Header Text *
                        </label>
                        <input
                          type="text"
                          value={formData.header.text || ''}
                          onChange={(e) =>
                            updateFormData('header', {
                              ...formData.header,
                              text: e.target.value,
                            })
                          }
                          placeholder="Enter header text"
                          maxLength={60}
                          className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${errors.headerText
                              ? 'border-red-300 dark:border-red-600 focus:ring-red-500/20'
                              : 'border-gray-200 dark:border-gray-600 focus:ring-primary-500/20 focus:border-primary-500'
                            }`}
                        />
                        {errors.headerText && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors.headerText}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {(formData.header.text || '').length}/60 characters
                        </p>
                      </div>
                    )}

                    {['image', 'video', 'document'].includes(formData.header.type) && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-dashed border-gray-300 dark:border-gray-600">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                            Upload Media for Approval Sample
                          </label>
                          
                          {/* Upload Button */}
                          <div className="relative">
                            <input
                              type="file"
                              accept={
                                formData.header.type === 'image' ? 'image/*' : 
                                formData.header.type === 'video' ? 'video/*' : 
                                '.pdf,.doc,.docx'
                              }
                              onChange={handleMediaUpload}
                              className="hidden"
                              id="header-media-upload"
                            />
                            <label
                              htmlFor="header-media-upload"
                              className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/10 cursor-pointer transition-all"
                            >
                              {mediaUploading ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  <span>Uploading to Meta...</span>
                                </>
                              ) : formData.header.mediaId ? (
                                <>
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                  <span>✅ Uploaded - {formData.header.fileName}</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-5 h-5" />
                                  <span>Upload {formData.header.type.toUpperCase()}</span>
                                </>
                              )}
                            </label>
                          </div>

                          {/* Preview */}
                          {formData.header.mediaUrl && (
                            <div className="mt-3 relative">
                              {formData.header.type === 'image' && (
                                <img 
                                  src={formData.header.mediaUrl} 
                                  alt="Preview" 
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              )}
                              {formData.header.type === 'video' && (
                                <video 
                                  src={formData.header.mediaUrl} 
                                  className="w-full h-48 object-cover rounded-lg"
                                  controls
                                />
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 flex items-start space-x-2">
                          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            This media is uploaded to Meta and will be used as the approval sample. 
                            Max size: {formData.header.type === 'image' ? '5MB' : '16MB'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Body */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message Body *
                      </label>
                      <textarea
                        value={formData.body}
                        onChange={(e) => updateFormData('body', e.target.value)}
                        placeholder="Enter your message here. Use {{1}}, {{2}}, etc. for variables."
                        rows={6}
                        maxLength={1024}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all resize-none ${errors.body
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500/20'
                            : 'border-gray-200 dark:border-gray-600 focus:ring-primary-500/20 focus:border-primary-500'
                          }`}
                      />
                      {errors.body && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.body}</p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formData.body.length}/1024 characters
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Use {'{{1}}'}, {'{{2}}'} for variables
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Footer (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.footer}
                        onChange={(e) => updateFormData('footer', e.target.value)}
                        placeholder="e.g., Reply STOP to unsubscribe"
                        maxLength={60}
                        className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${errors.footer
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500/20'
                            : 'border-gray-200 dark:border-gray-600 focus:ring-primary-500/20 focus:border-primary-500'
                          }`}
                      />
                      {errors.footer && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {errors.footer}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.footer.length}/60 characters
                      </p>
                    </div>

                    {/* Variables */}
                    {extractedVariables.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sample Variable Values *
                        </label>
                        <div className="space-y-3">
                          {extractedVariables.map((variable: string) => (
                            <div key={variable} className="flex items-center gap-3">
                              <span className="w-16 text-sm text-gray-600 dark:text-gray-400">{`{{${variable}}}`}</span>
                              <input
                                type="text"
                                value={sampleVariables[variable] || ''}
                                onChange={(e) =>
                                  setSampleVariables((prev) => ({
                                    ...prev,
                                    [variable]: e.target.value,
                                  }))
                                }
                                placeholder="Example value"
                                className={`flex-1 px-3 py-1.5 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.variables
                                    ? 'border-red-300 dark:border-red-600'
                                    : 'border-gray-200 dark:border-gray-600'
                                  }`}
                              />
                            </div>
                          ))}
                        </div>
                        {errors.variables && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                            {errors.variables}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Sample values help Meta understand your template during review
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons Tab */}
                {activeTab === 'buttons' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Call-to-Action Buttons
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Add up to 3 buttons to your template
                        </p>
                      </div>
                      {formData.buttons.length < 3 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateFormData('buttons', [
                              ...formData.buttons,
                              {
                                id: Date.now().toString(),
                                type: 'quick_reply',
                                text: '',
                              },
                            ])
                          }
                          className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Button
                        </button>
                      )}
                    </div>

                    {formData.buttons.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm py-8 text-center">
                        No buttons added. You can add up to 3 buttons.
                      </p>
                    )}

                    {formData.buttons.map((button, index) => (
                      <div
                        key={button.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Button {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateFormData(
                                'buttons',
                                formData.buttons.filter((_, i) => i !== index)
                              )
                            }
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Button Type
                            </label>
                            <select
                              value={button.type}
                              onChange={(e) => {
                                const updated = [...formData.buttons];
                                updated[index] = { ...updated[index], type: e.target.value as any };
                                updateFormData('buttons', updated);
                              }}
                              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            >
                              <option value="quick_reply">Quick Reply</option>
                              <option value="url">URL</option>
                              <option value="phone">Phone Number</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Button Text *
                            </label>
                            <input
                              type="text"
                              value={button.text}
                              onChange={(e) => {
                                const updated = [...formData.buttons];
                                updated[index] = { ...updated[index], text: e.target.value };
                                updateFormData('buttons', updated);
                              }}
                              placeholder="Button text"
                              maxLength={25}
                              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors[`button_${index}_text`]
                                  ? 'border-red-300 dark:border-red-600'
                                  : 'border-gray-200 dark:border-gray-600'
                                }`}
                            />
                          </div>
                        </div>

                        {button.type === 'url' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              URL *
                            </label>
                            <input
                              type="url"
                              value={button.url || ''}
                              onChange={(e) => {
                                const updated = [...formData.buttons];
                                updated[index] = { ...updated[index], url: e.target.value };
                                updateFormData('buttons', updated);
                              }}
                              placeholder="https://example.com"
                              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors[`button_${index}_url`]
                                  ? 'border-red-300 dark:border-red-600'
                                  : 'border-gray-200 dark:border-gray-600'
                                }`}
                            />
                          </div>
                        )}

                        {button.type === 'phone' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              value={button.phoneNumber || ''}
                              onChange={(e) => {
                                const updated = [...formData.buttons];
                                updated[index] = { ...updated[index], phoneNumber: e.target.value };
                                updateFormData('buttons', updated);
                              }}
                              placeholder="+1234567890"
                              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors[`button_${index}_phone`]
                                  ? 'border-red-300 dark:border-red-600'
                                  : 'border-gray-200 dark:border-gray-600'
                                }`}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {Object.keys(errors).filter((k) => k.startsWith('button_')).length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                          Button Errors:
                        </p>
                        {Object.entries(errors)
                          .filter(([k]) => k.startsWith('button_'))
                          .map(([key, msg]) => (
                            <p key={key} className="text-sm text-red-600 dark:text-red-400">
                              • {msg}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    {/* WhatsApp Account Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        WhatsApp Business Account *
                      </label>
                      {loadingAccounts ? (
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 py-4">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Loading WhatsApp accounts...</span>
                        </div>
                      ) : whatsappAccounts.length === 0 ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                              No accounts connected
                            </p>
                          </div>
                          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                            {accountsError || 'Please connect a WhatsApp Business Account in Settings.'}
                          </p>
                          <div className="flex items-center space-x-4 mt-3">
                            <Link
                              to="/dashboard/settings"
                              className="inline-flex items-center text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-800"
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Go to Settings
                            </Link>
                            <button
                              onClick={loadAccounts}
                              className="inline-flex items-center text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-800"
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Refresh
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedAccountId}
                            onChange={(e) => {
                              setSelectedAccountId(e.target.value);
                              if (errors.account) {
                                setErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.account;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.account
                                ? 'border-red-300 dark:border-red-600'
                                : 'border-gray-200 dark:border-gray-600'
                              }`}
                          >
                            <option value="">Select an account</option>
                            {whatsappAccounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {getAccountDisplayName(account)} - {account.phoneNumber}
                                {account.isDefault ? ' (Default)' : ''}
                              </option>
                            ))}
                          </select>
                          {errors.account && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              {errors.account}
                            </p>
                          )}
                          {selectedAccount && (
                            <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                  Selected: {getAccountDisplayName(selectedAccount)}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-green-600 dark:text-green-400 space-y-0.5">
                                <p>📱 Phone: {selectedAccount.phoneNumber}</p>
                                {selectedAccount.wabaId && (
                                  <p>🏢 WABA ID: {selectedAccount.wabaId}</p>
                                )}
                                {selectedAccount.qualityRating && (
                                  <p>⭐ Quality: {selectedAccount.qualityRating}</p>
                                )}
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={loadAccounts}
                            className="mt-2 inline-flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Refresh accounts
                          </button>
                        </>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <label
                            key={category.value}
                            className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.category === category.value
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                          >
                            <input
                              type="radio"
                              name="category"
                              value={category.value}
                              checked={formData.category === category.value}
                              onChange={(e) =>
                                updateFormData('category', e.target.value as TemplateCategory)
                              }
                              className="mt-1"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {category.label}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {category.description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language *
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => updateFormData('language', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {languages.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <p className="font-medium mb-1">Review Process</p>
                          <p>
                            After submission, your template will be reviewed by Meta. This usually
                            takes 24-48 hours. You'll be notified once approved.
                          </p>
                          <ul className="mt-2 space-y-1 text-blue-700 dark:text-blue-300">
                            <li>• Marketing templates need clear opt-out option</li>
                            <li>• Utility templates are for transactional messages</li>
                            <li>• Authentication templates are for OTPs only</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:sticky lg:top-36 h-fit">
            <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-6">
              <h3 className="text-white font-medium mb-4 text-center">📱 Live Preview</h3>
              <TemplatePreview template={formData} sampleVariables={sampleVariables} />
            </div>

            {/* Quick Stats */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Template Stats</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <p className="text-gray-500 dark:text-gray-400">Body Length</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formData.body.length}/1024
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <p className="text-gray-500 dark:text-gray-400">Variables</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {extractedVariables.length}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <p className="text-gray-500 dark:text-gray-400">Buttons</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formData.buttons.length}/3
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <p className="text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-semibold capitalize text-gray-900 dark:text-white">
                    {formData.category}
                  </p>
                </div>
              </div>

              {/* Selected Account Info */}
              {selectedAccount && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Submitting to:</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getAccountDisplayName(selectedAccount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedAccount.phoneNumber}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showPreview && (
        <TemplatePreview
          template={formData}
          sampleVariables={sampleVariables}
          isModal
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default CreateTemplate;