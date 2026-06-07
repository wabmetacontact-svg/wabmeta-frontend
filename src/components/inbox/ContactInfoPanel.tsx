// src/components/inbox/ContactInfoPanel.tsx
import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  StickyNote,
  Star,
  Hash,
  User,
  Calendar,
  Copy,
  ExternalLink,
  Shield,
  Archive,
  Trash2,
  Tag,
} from 'lucide-react';
import {
  getContactName,
  getContactInitial,
  getAvatarColor,
  formatChatTime,
  type ContactLike,
} from '../../utils/inboxHelpers';
import LabelManager from './LabelManager';
import MediaGallery from './MediaGallery';
import ConversationNotes, { type Note } from './ConversationNotes';
import type { Message } from './MessageBubble';
import toast from 'react-hot-toast';

interface ConversationData {
  id: string;
  contact: ContactLike;
  labels?: string[];
  isWindowOpen?: boolean;
  windowExpiresAt?: string | null;
  createdAt?: string;
  lastMessageAt?: string;
  assignedTo?: { id: string; name: string } | null;
}

interface Props {
  conversation: ConversationData;
  messages: Message[];
  notes?: Note[];
  allLabels?: { label: string; color?: string }[];
  isMobile?: boolean;
  onClose: () => void;
  onAddLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
  onAddNote?: (text: string) => Promise<void> | void;
  onUpdateNote?: (id: string, text: string) => Promise<void> | void;
  onDeleteNote?: (id: string) => Promise<void> | void;
  onBlock?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onViewProfile?: () => void;
}

type Section = 'info' | 'media' | 'notes' | 'labels' | 'settings';

const ContactInfoPanel: React.FC<Props> = ({
  conversation,
  messages,
  notes = [],
  allLabels = [],
  isMobile = false,
  onClose,
  onAddLabel,
  onRemoveLabel,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onBlock,
  onArchive,
  onDelete,
  onViewProfile,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<Section>>(
    new Set(['info', 'labels'])
  );

  const name = getContactName(conversation.contact);
  const initial = getContactInitial(conversation.contact);
  const avatarColor = getAvatarColor(name);

  const toggleSection = (section: Section) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  // ── Window status info ──────────────────────────────────────────────────
  const getWindowStatus = () => {
    if (!conversation.windowExpiresAt) {
      return {
        color: 'text-gray-400',
        bg: 'bg-[#050816]0/10',
        border: 'border-gray-500/20',
        icon: AlertTriangle,
        label: 'No active session',
      };
    }
    const expiresAt = new Date(conversation.windowExpiresAt);
    const diff = expiresAt.getTime() - Date.now();
    if (diff <= 0) {
      return {
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        icon: AlertTriangle,
        label: 'Window closed',
      };
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: CheckCircle2,
      label: `Active • ${hours}h ${minutes}m left`,
    };
  };

  const windowStatus = getWindowStatus();
  const WindowIcon = windowStatus.icon;

  // ── Message stats ───────────────────────────────────────────────────────
  const stats = {
    total: messages.length,
    inbound: messages.filter((m) => m.direction === 'INBOUND').length,
    outbound: messages.filter((m) => m.direction === 'OUTBOUND').length,
    media: messages.filter((m) => ['image', 'video', 'audio', 'document'].includes((m.type || '').toLowerCase())).length,
  };

  return (
    <div className={`
      ${isMobile ? 'fixed inset-0 z-50' : 'w-80 flex-shrink-0'}
      bg-white
      ${!isMobile && 'border-l border-gray-200'}
      flex flex-col h-full
      animate-slide-right
    `}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm">Contact Info</h3>
        <button
          onClick={onClose}
          className="
            p-1.5 rounded-lg
            hover:bg-gray-100
            text-gray-500 hover:text-gray-900
            transition-colors
          "
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto inbox-scroll">
        {/* Avatar & Name */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-gray-200">
          <button
            onClick={onViewProfile}
            className="relative inline-block mb-3 group"
          >
            <div className={`
              w-24 h-24 rounded-full overflow-hidden
              bg-gradient-to-br ${avatarColor}
              flex items-center justify-center
              text-white text-3xl font-bold
              shadow-lg ring-4 ring-gray-100
              group-hover:ring-emerald-450/30
              transition-all
            `}>
              {conversation.contact.avatar ? (
                <img src={conversation.contact.avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            {conversation.isWindowOpen && (
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full ring-4 ring-white" />
            )}
          </button>

          <h2 className="text-lg font-bold text-gray-900 tracking-tight">{name}</h2>
          <p className="text-xs text-gray-500 mt-1">{conversation.contact.phone}</p>

          {/* Window status badge */}
          <div className={`
            inline-flex items-center gap-1.5 mt-3 px-3 py-1
            ${windowStatus.bg} ${windowStatus.border} border
            rounded-full
          `}>
            <WindowIcon className={`w-3 h-3 ${windowStatus.color}`} />
            <span className={`text-[10px] font-medium ${windowStatus.color}`}>
              {windowStatus.label}
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-gray-200">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-800' },
            { label: 'Received', value: stats.inbound, color: 'text-blue-600' },
            { label: 'Sent', value: stats.outbound, color: 'text-emerald-600' },
          ].map((s) => (
            <div key={s.label} className="text-center p-2 rounded-lg bg-gray-50">
              <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[9px] uppercase tracking-wider text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ─── SECTION: Contact Info ─────────────────────────────────── */}
        <Section
          title="Contact Information"
          icon={User}
          isExpanded={expandedSections.has('info')}
          onToggle={() => toggleSection('info')}
        >
          {/* Phone */}
          <InfoRow
            icon={Phone}
            label="Phone"
            value={conversation.contact.phone}
            onCopy={() => copyToClipboard(conversation.contact.phone, 'Phone')}
            actionIcon={Copy}
          />

          {/* Email */}
          {conversation.contact.email && (
            <InfoRow
              icon={Mail}
              label="Email"
              value={conversation.contact.email}
              onCopy={() => copyToClipboard(conversation.contact.email!, 'Email')}
              actionIcon={Copy}
            />
          )}

          {/* WhatsApp Profile */}
          {conversation.contact.whatsappProfileName && (
            <InfoRow
              icon={MessageSquare}
              label="WhatsApp Name"
              value={conversation.contact.whatsappProfileName}
            />
          )}

          {/* Conversation Created */}
          {conversation.createdAt && (
            <InfoRow
              icon={Calendar}
              label="Conversation Started"
              value={formatChatTime(conversation.createdAt)}
            />
          )}

          {/* Last Activity */}
          {conversation.lastMessageAt && (
            <InfoRow
              icon={Clock}
              label="Last Activity"
              value={formatChatTime(conversation.lastMessageAt)}
            />
          )}

          {/* Assigned To */}
          {conversation.assignedTo && (
            <InfoRow
              icon={User}
              label="Assigned To"
              value={conversation.assignedTo.name}
            />
          )}

          {onViewProfile && (
            <button
              onClick={onViewProfile}
              className="
                w-full mt-3 py-2
                bg-gray-50 hover:bg-gray-100
                border border-gray-200
                rounded-lg
                text-xs font-medium text-gray-650 hover:text-gray-900
                flex items-center justify-center gap-1.5
                transition-colors
              "
            >
              <ExternalLink className="w-3 h-3" />
              View Full Profile
            </button>
          )}
        </Section>

        {/* ─── SECTION: Labels ──────────────────────────────────────── */}
        <Section
          title="Labels"
          icon={Tag}
          isExpanded={expandedSections.has('labels')}
          onToggle={() => toggleSection('labels')}
          count={conversation.labels?.length || 0}
        >
          <LabelManager
            labels={conversation.labels || []}
            allLabels={allLabels}
            onAddLabel={onAddLabel}
            onRemoveLabel={onRemoveLabel}
          />
        </Section>

        {/* ─── SECTION: Notes ──────────────────────────────────────── */}
        {(onAddNote || notes.length > 0) && (
          <Section
            title="Internal Notes"
            icon={StickyNote}
            isExpanded={expandedSections.has('notes')}
            onToggle={() => toggleSection('notes')}
            count={notes.length}
          >
            <ConversationNotes
              notes={notes}
              onAdd={onAddNote || (() => {})}
              onUpdate={onUpdateNote || (() => {})}
              onDelete={onDeleteNote || (() => {})}
            />
          </Section>
        )}

        {/* ─── SECTION: Media ──────────────────────────────────────── */}
        <Section
          title="Shared Media"
          icon={ImageIcon}
          isExpanded={expandedSections.has('media')}
          onToggle={() => toggleSection('media')}
          count={stats.media}
        >
          <MediaGallery messages={messages} />
        </Section>

        {/* ─── SECTION: Settings ───────────────────────────────────── */}
        <Section
          title="Privacy & Settings"
          icon={Shield}
          isExpanded={expandedSections.has('settings')}
          onToggle={() => toggleSection('settings')}
        >
          <div className="space-y-1">
            {onArchive && (
              <button
                onClick={onArchive}
                className="
                  w-full flex items-center gap-2.5 px-3 py-2
                  text-sm text-gray-700 hover:text-gray-950
                  hover:bg-gray-55 rounded-lg
                  transition-colors
                "
              >
                <Archive className="w-4 h-4 text-gray-500" />
                <span className="text-xs">Archive conversation</span>
              </button>
            )}

            {onBlock && (
              <button
                onClick={onBlock}
                className="
                  w-full flex items-center gap-2.5 px-3 py-2
                  text-sm text-orange-600 hover:text-orange-700
                  hover:bg-orange-50 rounded-lg
                  transition-colors
                "
              >
                <Shield className="w-4 h-4 text-orange-500" />
                <span className="text-xs">Block contact</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                className="
                  w-full flex items-center gap-2.5 px-3 py-2
                  text-sm text-red-600 hover:text-red-700
                  hover:bg-red-50 rounded-lg
                  transition-colors
                "
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="text-xs">Delete conversation</span>
              </button>
            )}
          </div>
        </Section>

        {/* Bottom padding */}
        <div className="h-6" />
      </div>
    </div>
  );
};

// ─── Section Component ───────────────────────────────────────────────────────
interface SectionProps {
  title: string;
  icon: React.ElementType;
  isExpanded: boolean;
  onToggle: () => void;
  count?: number;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  count,
  children,
}) => {
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={onToggle}
        className="
          w-full flex items-center justify-between
          px-4 py-3
          hover:bg-gray-50/50
          transition-colors
        "
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </span>
          {count !== undefined && count > 0 && (
            <span className="
              text-[9px] font-mono font-bold
              bg-gray-100 text-gray-500
              px-1.5 py-0.5 rounded-md
            ">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 animate-fade-in">{children}</div>
      )}
    </div>
  );
};

// ─── InfoRow Component ───────────────────────────────────────────────────────
interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  onCopy?: () => void;
  actionIcon?: React.ElementType;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value, onCopy, actionIcon: ActionIcon }) => {
  return (
    <div className="
      group flex items-start gap-2.5 py-2
      hover:bg-gray-50 rounded-lg px-2 -mx-2
      transition-colors
    ">
      <div className="
        w-7 h-7 rounded-lg
        bg-gray-100 border border-gray-200
        flex items-center justify-center flex-shrink-0
      ">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-xs text-gray-800 break-words">{value}</p>
      </div>
      {ActionIcon && onCopy && (
        <button
          onClick={onCopy}
          className="
            p-1.5 rounded-md
            hover:bg-gray-150
            text-gray-500 hover:text-gray-900
            opacity-0 group-hover:opacity-100
            transition-all flex-shrink-0
          "
        >
          <ActionIcon className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default ContactInfoPanel;
