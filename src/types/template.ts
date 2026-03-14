export type TemplateCategory = 'marketing' | 'utility' | 'authentication';
export type TemplateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'draft';
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
  mediaUrl?: string;   // For local preview only
  mediaId?: string;    // ✅ Meta's uploaded media ID
  fileName?: string;
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
  headerType: string | null;
  headerContent: string | null;
  headerMediaId: string | null;
  bodyText: string;
  footerText: string | null;
  buttons: TemplateButton[];
  variables: any[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  metaTemplateId: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}