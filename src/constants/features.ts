// src/constants/features.ts
//
// Ek hi jagah jahan har lockable feature likha hai. Admin panel ka Feature
// Access Control, sidebar ke lock icons aur usePlanAccess - teeno yahin se
// chalte hain, isliye naya feature add karne par teen jagah edit nahi karni.
//
// Backend ka mirror: wabmeta-backend src/middleware/featureLock.ts ka
// FEATURE_REGISTRY. `key` wahan ka LockableFeature hai, `orgFlag` wo column
// jo org payload me aata hai, aur `wireKey` admin API ka field naam.
// Dono repos me nothing links them - ek taraf naam badla to doosri taraf
// chup-chaap band ho jaayega.

import {
  Inbox,
  Users,
  Contact,
  Send,
  FileText,
  Bot,
  Zap,
  Sparkles,
  Instagram,
  BarChart3,
  Wallet,
  Link2Off,
  type LucideIcon,
} from 'lucide-react';

export type FeatureKey =
  | 'inbox'
  | 'contacts'
  | 'crm'
  | 'campaigns'
  | 'templates'
  | 'chatbot'
  | 'automation'
  | 'aiAgent'
  | 'telegram'
  | 'instagram'
  | 'reports'
  | 'wallet'
  | 'connection';

export type FeatureGroup = 'Core' | 'Messaging' | 'Channels' | 'Account';

export interface FeatureDefinition {
  key: FeatureKey;
  label: string;
  description: string;
  group: FeatureGroup;
  icon: LucideIcon;
  /** Organization payload ka field (auth/me se aata hai) */
  orgFlag: string;
  /** Admin features API ka field */
  wireKey: string;
  /** true = naye account par ye feature by default locked banta hai */
  lockedByDefault?: boolean;
}

const define = (
  key: FeatureKey,
  label: string,
  description: string,
  group: FeatureGroup,
  icon: LucideIcon,
  orgFlag: string,
  lockedByDefault = false
): FeatureDefinition => ({
  key,
  label,
  description,
  group,
  icon,
  orgFlag,
  wireKey: `${key}Locked`,
  lockedByDefault,
});

export const FEATURES: FeatureDefinition[] = [
  define('inbox', 'Inbox', 'Shared conversations across every channel', 'Core', Inbox, 'featureInboxLocked'),
  define('contacts', 'Contacts', 'Contact list, import and export', 'Core', Contact, 'featureContactsLocked'),
  define('crm', 'CRM', 'Leads, pipelines and deal stages', 'Core', Users, 'featureCrmLocked'),
  define('campaigns', 'Campaigns', 'Bulk broadcast campaigns', 'Messaging', Send, 'featureCampaignsLocked'),
  define('templates', 'Templates', 'WhatsApp message templates', 'Messaging', FileText, 'featureTemplatesLocked'),
  define('chatbot', 'Chatbots', 'Flow builder chatbots', 'Messaging', Bot, 'featureChatbotLocked'),
  define('automation', 'Automations', 'Trigger-based automation sequences', 'Messaging', Zap, 'featureAutomationLocked'),
  define('aiAgent', 'AI Agent', 'AI powered auto-replies and handover', 'Messaging', Sparkles, 'featureAiAgentLocked'),
  define('telegram', 'Telegram', 'Telegram bots, broadcasts and auto-replies', 'Channels', Send, 'featureTelegramLocked', true),
  define('instagram', 'Instagram', 'Instagram DM, comment and story automation', 'Channels', Instagram, 'featureInstagramLocked', true),
  define('reports', 'Reports', 'Analytics dashboards and exports', 'Account', BarChart3, 'featureReportsLocked'),
  define('wallet', 'Wallet', 'Wallet balance, top-ups and usage', 'Account', Wallet, 'featureWalletLocked'),
  define('connection', 'Account Connection', 'Connect or disconnect WhatsApp / Meta / Instagram accounts', 'Account', Link2Off, 'featureConnectionLocked'),
];

export const FEATURE_GROUPS: FeatureGroup[] = ['Core', 'Messaging', 'Channels', 'Account'];

export const FEATURE_BY_KEY: Record<FeatureKey, FeatureDefinition> = FEATURES.reduce(
  (acc, f) => {
    acc[f.key] = f;
    return acc;
  },
  {} as Record<FeatureKey, FeatureDefinition>
);

/** Feature key -> org payload ka lock flag, sidebar/usePlanAccess ke liye */
export const ORG_FLAG_BY_KEY: Record<string, string> = FEATURES.reduce(
  (acc, f) => {
    acc[f.key] = f.orgFlag;
    return acc;
  },
  {} as Record<string, string>
);

export type FeatureLockState = Partial<Record<string, boolean>>;

/** Sab locks off - admin panel ka starting state */
export const emptyLockState = (): Record<string, boolean> =>
  FEATURES.reduce(
    (acc, f) => {
      acc[f.wireKey] = false;
      return acc;
    },
    {} as Record<string, boolean>
  );
