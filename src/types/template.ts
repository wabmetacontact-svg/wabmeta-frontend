export type TemplateCategory = 'marketing' | 'utility' | 'authentication';
export type TemplateStatus = 'approved' | 'pending' | 'rejected' | 'draft';
export type HeaderType = 'none' | 'text' | 'image' | 'video' | 'document';
export type ButtonType = 'quick_reply' | 'url' | 'phone';

export interface TemplateButton {
  id: string;
  type: ButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface TemplateHeader {
  type: HeaderType;
  text?: string;

  // Meta template creation ke liye (handle ya numeric ID)
  mediaId?: string;

  // ✅ NEW: Permanent numeric Meta ID (campaigns ke liye best)
  metaNumericId?: string | null;

  // ✅ NEW: Permanent Cloudinary URL (DB storage + campaign fallback)
  cloudinaryUrl?: string;
  permanentUrl?: string;

  // Local preview only (blob URL - expire hota hai)
  mediaUrl?: string;

  fileName?: string;
  uploadedAccountId?: string;
}

export interface TemplateFormData {
  name: string;
  category: TemplateCategory;
  language: string;
  header: TemplateHeader;
  body: string;
  footer: string;
  buttons: TemplateButton[];
}

export interface Template {
  id: string;
  name: string;
  language: string;
  category: TemplateCategory;
  header: TemplateHeader;
  body: string;
  footer: string;
  buttons: TemplateButton[];
  variables: any[];
  status: TemplateStatus;
  metaTemplateId: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}