// src/types/campaign.ts
//
// Shapes here mirror the backend exactly. Source of truth:
//   wabmeta-backend/src/modules/campaigns/campaigns.service.ts
//     - formatCampaign()  -> Campaign
//     - getStats()        -> CampaignStats
// Keep them in sync; a drift here fails silently at runtime rather than at build.

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

export interface VariableMapping {
  [variableIndex: string]: {
    type: 'field' | 'static';
    value: string;
  };
}

/**
 * Counters the backend may adjust before sending.
 *
 * When a campaign's real failure count exceeds an internal threshold, the
 * service reports the excess as `sentCount` instead of `failedCount`, and
 * describes what it did here. `mode: 'honest'` means the counters above are
 * the raw numbers; `'smart'` means they are not.
 */
export interface CampaignInternal {
  realSent?: number;
  realDelivered?: number;
  realFailed?: number;
  hiddenFailures?: number;
  mode: 'honest' | 'smart';
  reason?: string;
}

/** One campaign, as returned by both the list and detail endpoints. */
export interface Campaign {
  id: string;
  name: string;
  description: string | null;

  // The list endpoint sends the template's name flat, not a nested object.
  templateId: string;
  templateName: string;

  whatsappAccountId: string;
  whatsappAccountPhone: string;
  contactGroupId: string | null;
  contactGroupName: string | null;
  variableMapping: VariableMapping | null;

  status: CampaignStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;

  totalContacts: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  pendingCount: number;

  deliveryRate: number;
  readRate: number;

  createdAt: string;
  updatedAt: string;

  _internal?: CampaignInternal;
}

/** Organisation-wide totals from GET /campaigns/stats. */
export interface CampaignStats {
  total: number;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  /** Always 0 — reply tracking is not implemented on the backend yet. */
  replied: number;
  totalRecipients: number;
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
