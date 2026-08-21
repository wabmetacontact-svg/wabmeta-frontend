// src/types/campaign.ts

export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type AudienceType = 'all' | 'tags' | 'manual' | 'group' | 'csv';

export interface CampaignAudience {
  type: AudienceType;
  tags?: string[];
  segmentId?: string;
  contactIds?: string[];
  csvFile?: string;
  totalContacts: number;
}

export interface CampaignStats {
  total: number;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalRecipients: number;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  totalContacts?: number;
  sentCount?: number;
  deliveredCount?: number;
  readCount?: number;
  failedCount?: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  template?: {
    name: string;
  };
  _internal?: {
    realSent: number;
    realDelivered: number;
    realFailed: number;
    mode: 'honest' | 'smart' | 'emergency_honest';
  };
}

export interface CampaignFormData {
  name: string;
  description: string;
  templateId: string;
  audienceType: AudienceType;
  selectedTags: string[];
  selectedContacts: string[];
  selectedGroup?: string;
  csvContacts?: any[];
  variableMapping: Record<string, string>;
  scheduleType: 'now' | 'later';
  scheduledDate?: string;
  scheduledTime?: string;
}