// src/pages/telegram/telegramShared.ts
// Shared theme tokens + types for the Telegram channel pages.

// Telegram brand blue — the accent for every Telegram page (WhatsApp uses emerald).
export const TG = {
  blue: '#229ED9',
  blueDark: '#1b87ba',
  blueSoft: '#eaf6fc',
  blueBorder: '#c7e6f6',
};

export type TriggerType = 'COMMAND' | 'KEYWORD' | 'FALLBACK';
export type MatchType = 'exact' | 'contains' | 'starts_with';

export interface ButtonDef {
  text: string;
  type: 'callback' | 'url';
  value: string;
}

export interface TelegramBotRow {
  id: string;
  username: string;
  firstName?: string | null;
  botUserId: string;
  status: string;
  connectedAt: string;
}

export interface AutomationRow {
  id: string;
  name: string;
  triggerType: TriggerType;
  pattern: string | null;
  matchType: MatchType;
  responseText: string;
  buttons?: ButtonDef[] | null;
  isActive: boolean;
  triggerCount: number;
}

export interface TelegramStats {
  bots: number;
  conversations: number;
  contacts: number;
  messages: { inbound: number; outbound: number; total: number };
  autoReplies: { rules: number; triggered: number };
  topRules: { id: string; name: string; triggerType: TriggerType; pattern: string | null; triggerCount: number }[];
  daily: { date: string; label: string; inbound: number; outbound: number }[];
}

export const TRIGGER_LABEL: Record<TriggerType, string> = {
  COMMAND: 'Command',
  KEYWORD: 'Keyword',
  FALLBACK: 'Fallback',
};
