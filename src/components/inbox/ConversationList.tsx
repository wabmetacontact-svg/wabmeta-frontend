// src/components/inbox/ConversationList.tsx
import React, { useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  Filter,
  X,
  Trash2,
  Archive,
  ArchiveRestore,
  CheckSquare,
  Square,
  Check,
} from 'lucide-react';
import ConversationItem from './ConversationItem';
import type { ContactLike } from '../../utils/inboxHelpers';

interface Conversation {
  id: string;
  contact: ContactLike;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  lastMessageType?: string;
  lastMessageDirection?: 'INBOUND' | 'OUTBOUND';
  lastMessageStatus?: string;
  unreadCount: number;
  isArchived?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  isWindowOpen?: boolean;
  labels?: string[];
  isTyping?: boolean;
}

type FilterTab = 'all' | 'unread' | 'archived' | string;

interface Props {
  conversations: Conversation[];
  labels: { label: string; count: number; color?: string }[];
  selectedId?: string | null;
  loading?: boolean;
  refreshing?: boolean;
  filter: FilterTab;
  searchQuery: string;
  onFilterChange: (filter: FilterTab) => void;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onSelectConversation: (conv: Conversation) => void;
  onPinConversation: (conv: Conversation, e: React.MouseEvent) => void;
  onArchiveConversation: (conv: Conversation, e: React.MouseEvent) => void;
  onAddLabel: (conv: Conversation, label: string) => void;
  onRemoveLabel: (conv: Conversation, label: string, e: React.MouseEvent) => void;
  onCreateCustomLabel: (label: string, color?: string) => void;
  onNewChat?: () => void;
  onDeleteAll?: () => void;
  selectedConversationIds?: string[];
  onToggleSelection?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  onClearSelection?: () => void;
  onBulkArchive?: (isArchived: boolean) => void;
  onBulkDelete?: () => void;
}

const ConversationList: React.FC<Props> = ({
  conversations,
  labels,
  selectedId,
  loading,
  refreshing,
  filter,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onRefresh,
  onSelectConversation,
  onPinConversation,
  onArchiveConversation,
  onAddLabel,
  onRemoveLabel,
  onCreateCustomLabel,
  onNewChat,
  onDeleteAll,
  selectedConversationIds = [],
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onBulkArchive,
  onBulkDelete,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Check if we are in selection mode
  const isSelectionMode = selectedConversationIds.length > 0;
  
  // Combine pinned and regular for select all logic
  const allCurrentIds = useMemo(() => {
    return conversations.map(c => c.id);
  }, [conversations]);
  const isAllSelected = allCurrentIds.length > 0 && selectedConversationIds.length === allCurrentIds.length;


  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const unread = conversations.filter((c) => c.unreadCount > 0 && !c.isArchived).length;
    const total = conversations.filter((c) => !c.isArchived).length;
    const archived = conversations.filter((c) => c.isArchived).length;
    return { unread, total, archived };
  }, [conversations]);

  // ── Group: pinned vs regular ───────────────────────────────────────────
  const { pinned, regular } = useMemo(() => {
    const pinned: Conversation[] = [];
    const regular: Conversation[] = [];
    conversations.forEach((c) => {
      if (c.isPinned) pinned.push(c);
      else regular.push(c);
    });
    return { pinned, regular };
  }, [conversations]);

  return (
    <div className="flex flex-col h-full bg-[#0a0e1c]/60 backdrop-blur-xl border-r border-white/[0.06]">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className={`flex-shrink-0 px-4 pt-4 pb-3 border-b border-white/[0.06] transition-colors ${isSelectionMode ? 'bg-emerald-500/10' : ''}`}>
        {isSelectionMode ? (
          <div className="flex items-center justify-between mb-4 h-8">
            <div className="flex items-center gap-3">
              <button onClick={onClearSelection} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-emerald-400">{selectedConversationIds.length} Selected</span>
            </div>
            <div className="flex items-center gap-1">
              {filter === 'archived' ? (
                <button
                  onClick={() => onBulkArchive?.(false)}
                  className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 transition-all"
                  title="Unarchive"
                >
                  <ArchiveRestore className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => onBulkArchive?.(true)}
                  className="p-1.5 rounded-lg hover:bg-[#0a0e27]/[0.06] text-gray-400 hover:text-white transition-all"
                  title="Archive"
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onBulkDelete}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4 h-8">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Inbox</h2>
              {stats.total > 0 && (
                <span className="text-[10px] font-mono text-gray-500 bg-[#0a0e27]/[0.04] px-2 py-0.5 rounded-md">
                  {stats.total}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {onNewChat && (
                <button
                  onClick={onNewChat}
                  className="p-1.5 rounded-lg hover:bg-[#0a0e27]/[0.06] text-gray-400 hover:text-emerald-400 transition-all"
                  title="New conversation"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="p-1.5 rounded-lg hover:bg-[#0a0e27]/[0.06] text-gray-400 hover:text-white transition-all"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              {onDeleteAll && (
                <button
                  onClick={onDeleteAll}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all ml-1"
                  title="Delete all conversations"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search & Select All */}
        <div className="relative mb-3 flex items-center gap-2">
          {isSelectionMode && (
            <button
              onClick={() => onSelectAll?.(isAllSelected ? [] : allCurrentIds)}
              className="flex-shrink-0 p-2 rounded hover:bg-[#0a0e27]/[0.06] transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="w-5 h-5 text-emerald-500" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="
                w-full pl-9 pr-9 py-2.5
                bg-[#0a0e27]/[0.04] border border-white/[0.06]
                focus:bg-[#0a0e27]/[0.06] focus:border-emerald-500/50
                text-sm text-white placeholder-gray-500
                rounded-xl outline-none transition-all
              "
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-full"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-[#0a0e27]/[0.03] border border-white/[0.06] p-1 rounded-xl">
          {[
            { key: 'all' as FilterTab, label: 'All', count: stats.total },
            { key: 'unread' as FilterTab, label: 'Unread', count: stats.unread },
            { key: 'archived' as FilterTab, label: 'Archived', count: stats.archived },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`
                flex-1 py-1.5 px-2 text-xs font-medium rounded-lg
                transition-all flex items-center justify-center gap-1.5
                ${
                  filter === f.key
                    ? 'bg-[#0a0e27]/[0.08] text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }
              `}
            >
              {f.label}
              {f.count > 0 && (
                <span
                  className={`
                    px-1.5 py-0.5 text-[9px] font-bold rounded-full
                    ${
                      f.key === 'unread' && filter === f.key
                        ? 'bg-emerald-500 text-white'
                        : filter === f.key
                        ? 'bg-[#0a0e27]/[0.1] text-white'
                        : 'bg-[#0a0e27]/[0.06] text-gray-400'
                    }
                  `}
                >
                  {f.count > 99 ? '99+' : f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Labels Scrollable Bar */}
        {labels && labels.filter(l => l.count > 0).length > 0 && (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto inbox-scroll pb-1">
            {labels.filter(l => l.count > 0).map((l) => (
              <button
                key={l.label}
                onClick={() => onFilterChange(filter === l.label ? 'all' : l.label)}
                className={`
                  flex-shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all flex items-center gap-1.5
                  ${
                    filter === l.label
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-[#0a0e27]/[0.04] border-white/[0.06] text-gray-400 hover:text-gray-200 hover:border-white/[0.1]'
                  }
                `}
              >
                {l.label}
                <span className="opacity-50 text-[9px]">{l.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Conversation List ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto inbox-scroll">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="
              w-16 h-16 rounded-full
              bg-[#0a0e27]/[0.04] border border-white/[0.06]
              flex items-center justify-center mb-4
            ">
              <InboxIcon className="w-7 h-7 text-gray-500" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              {searchQuery
                ? 'No matches found'
                : filter === 'unread'
                ? 'All caught up!'
                : filter === 'archived'
                ? 'No archived chats'
                : 'No conversations yet'}
            </h3>
            <p className="text-xs text-gray-500 max-w-[200px]">
              {searchQuery
                ? 'Try a different search term'
                : filter === 'unread'
                ? "You've read all your messages"
                : 'New messages will appear here'}
            </p>
          </div>
        ) : (
          <div className="pb-4">
            {/* Pinned section */}
            {pinned.length > 0 && filter !== 'archived' && (
              <div>
                <div className="flex items-center gap-1.5 px-4 py-2 mt-1">
                  <Pin className="w-3 h-3 text-gray-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Pinned
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {pinned.length}
                  </span>
                </div>
                {pinned.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isSelected={selectedId === conv.id}
                    onSelect={() => onSelectConversation(conv)}
                    onPin={(e) => onPinConversation(conv, e)}
                    onArchive={(e) => onArchiveConversation(conv, e)}
                    onAddLabel={(label) => onAddLabel(conv, label)}
                    onRemoveLabel={(label, e) => onRemoveLabel(conv, label, e)}
                    onCreateCustomLabel={onCreateCustomLabel}
                    allLabels={labels.map(l => ({ label: l.label, color: l.color }))}
                    searchQuery={searchQuery}
                    isSelectionMode={isSelectionMode}
                    isSelectedForAction={selectedConversationIds.includes(conv.id)}
                    onToggleSelection={onToggleSelection}
                  />
                ))}
              </div>
            )}

            {/* Regular conversations */}
            {regular.length > 0 && (
              <div>
                {pinned.length > 0 && filter !== 'archived' && (
                  <div className="flex items-center gap-1.5 px-4 py-2 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      All Chats
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {regular.length}
                    </span>
                  </div>
                )}
                {regular.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isSelected={selectedId === conv.id}
                    onSelect={() => onSelectConversation(conv)}
                    onPin={(e) => onPinConversation(conv, e)}
                    onArchive={(e) => onArchiveConversation(conv, e)}
                    onAddLabel={(label) => onAddLabel(conv, label)}
                    onRemoveLabel={(label, e) => onRemoveLabel(conv, label, e)}
                    onCreateCustomLabel={onCreateCustomLabel}
                    allLabels={labels.map(l => ({ label: l.label, color: l.color }))}
                    searchQuery={searchQuery}
                    isSelectionMode={isSelectionMode}
                    isSelectedForAction={selectedConversationIds.includes(conv.id)}
                    onToggleSelection={onToggleSelection}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer Stats ──────────────────────────────────────────────── */}
      {stats.total > 0 && !loading && (
        <div className="flex-shrink-0 px-4 py-2.5 border-t border-white/[0.06] bg-[#0a0e27]/[0.02]">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
            <span>{stats.total} total</span>
            <span className="flex items-center gap-3">
              {stats.unread > 0 && (
                <span className="text-emerald-400">{stats.unread} unread</span>
              )}
              {pinned.length > 0 && <span>{pinned.length} pinned</span>}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;