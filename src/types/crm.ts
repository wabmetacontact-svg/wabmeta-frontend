// src/types/crm.ts - Multi-channel CRM types

export type LeadChannel = 'WHATSAPP' | 'INSTAGRAM' | 'TELEGRAM' | 'MANUAL' | 'WEBSITE' | 'AD';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Lead {
  id: string;
  title: string;
  value?: number;
  currency: string;
  status: LeadStatus;
  priority: LeadPriority;
  source?: string;
  // The backend has no `channel` column; the channel is derived from `source`.
  channel?: LeadChannel;
  score?: number;
  chatbotQualified?: boolean;
  serviceInterest?: string;
  budget?: string;
  city?: string;
  adSource?: string;
  adId?: string;
  campaignId?: string;
  qualificationData?: Record<string, any>;
  conversationId?: string;
  contactId?: string;
  contact?: {
    id: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
    whatsappProfileName?: string;
  };
  pipelineId?: string;
  pipeline?: Pipeline;
  stageId?: string;
  stage?: PipelineStage;
  assignedToId?: string;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: LeadNote[];
  tasks?: LeadTask[];
  activities?: LeadActivity[];
  _count?: {
    activities: number;
    notes: number;
    tasks: number;
  };
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  stages: PipelineStage[];
  _count?: { leads: number };
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  probability: number;
  isWon: boolean;
  isLost: boolean;
}

export interface LeadNote {
  id: string;
  content: string;
  isPinned: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  priority: LeadPriority;
  createdAt: string;
}

export interface LeadActivity {
  id: string;
  type: string;
  title: string;
  description?: string;
  metadata?: any;
  createdAt: string;
}

export interface CRMStats {
  totalLeads: number;
  newLeads: number;
  wonLeads: number;
  lostLeads: number;
  totalValue: number;
  wonValue: number;
  winRate: number;
  chatbotLeads?: number;
  adLeads?: number;
  hotLeads?: number;
  averageScore?: number;
  /** Real per-source counts from the backend, used for the channel tiles. */
  leadsBySource?: { source: string; count: number }[];
  leadsByStage?: { stageId: string; _count: number; _sum: { value: number } }[];
}
