// src/components/inbox/QuickRepliesPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Check, Zap, Search, Save } from 'lucide-react';

export interface QuickReply {
  id: string;
  shortcut: string;
  text: string;
  category?: string;
  usageCount?: number;
}

interface Props {
  isOpen: boolean;
  quickReplies: QuickReply[];
  onClose: () => void;
  onSelect: (qr: QuickReply) => void;
  onAdd?: (qr: Omit<QuickReply, 'id'>) => Promise<void> | void;
  onUpdate?: (id: string, qr: Partial<QuickReply>) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}

const QuickRepliesPanel: React.FC<Props> = ({
  isOpen,
  quickReplies,
  onClose,
  onSelect,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ shortcut: '', text: '', category: '' });
  const [saving, setSaving] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  // Reset form when closing
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setEditingId(null);
      setIsCreating(false);
      setForm({ shortcut: '', text: '', category: '' });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        if (!isCreating && !editingId) onClose();
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, isCreating, editingId, onClose]);

  // Filter
  const filtered = quickReplies.filter((qr) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      qr.shortcut.toLowerCase().includes(q) ||
      qr.text.toLowerCase().includes(q) ||
      qr.category?.toLowerCase().includes(q)
    );
  });

  // Group by category
  const grouped = filtered.reduce<Record<string, QuickReply[]>>((acc, qr) => {
    const cat = qr.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(qr);
    return acc;
  }, {});

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setForm({ shortcut: '', text: '', category: '' });
  };

  const startEdit = (qr: QuickReply) => {
    setEditingId(qr.id);
    setIsCreating(false);
    setForm({ shortcut: qr.shortcut, text: qr.text, category: qr.category || '' });
  };

  const handleSave = async () => {
    if (!form.shortcut.trim() || !form.text.trim()) return;
    setSaving(true);
    try {
      if (isCreating && onAdd) {
        await onAdd({
          shortcut: form.shortcut.trim().replace(/^\//, ''),
          text: form.text.trim(),
          category: form.category.trim() || undefined,
        });
        setIsCreating(false);
      } else if (editingId && onUpdate) {
        await onUpdate(editingId, {
          shortcut: form.shortcut.trim().replace(/^\//, ''),
          text: form.text.trim(),
          category: form.category.trim() || undefined,
        });
        setEditingId(null);
      }
      setForm({ shortcut: '', text: '', category: '' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm({ shortcut: '', text: '', category: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 glass-backdrop flex items-center justify-center p-4 animate-fade-in">
      <div
        ref={panelRef}
        className="
          w-full max-w-2xl max-h-[85vh] overflow-hidden
          bg-white
          border border-gray-200
          rounded-2xl shadow-2xl
          flex flex-col
        "
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="
              w-9 h-9 rounded-xl
              bg-emerald-50 border border-emerald-500/20
              flex items-center justify-center
            ">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Quick Replies</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Save time with pre-written responses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-550 hover:text-gray-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search + Add */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-gray-200 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search replies..."
              className="
                w-full pl-9 pr-3 py-2
                bg-gray-50 border border-gray-200
                rounded-lg text-sm text-gray-900 placeholder:text-gray-500
                focus:outline-none focus:bg-white focus:border-emerald-500/30
              "
            />
          </div>
          {onAdd && (
            <button
              onClick={startCreate}
              className="
                flex items-center gap-1.5 px-3 py-2
                bg-emerald-500 hover:bg-emerald-600
                text-white text-xs font-medium rounded-lg
                transition-all shadow-sm
              "
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          )}
        </div>

        {/* Create/Edit form */}
        {(isCreating || editingId) && (
          <div className="
            flex-shrink-0 px-5 py-4
            bg-emerald-50/30 border-b border-emerald-500/20
            animate-fade-in
          ">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-550 uppercase tracking-wider">
                    Shortcut
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-mono text-sm">/</span>
                    <input
                      type="text"
                      value={form.shortcut}
                      onChange={(e) => setForm({ ...form, shortcut: e.target.value.replace(/^\//, '') })}
                      placeholder="welcome"
                      className="
                        w-full pl-7 pr-3 py-2
                        bg-white border border-gray-200
                        rounded-lg text-sm text-gray-900 placeholder:text-gray-500
                        focus:outline-none focus:border-emerald-500/35 focus:ring-1 focus:ring-emerald-500/10
                      "
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-550 uppercase tracking-wider">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Greetings"
                    className="
                      w-full px-3 py-2 mt-1
                      bg-white border border-gray-200
                      rounded-lg text-sm text-gray-900 placeholder:text-gray-505
                      focus:outline-none focus:border-emerald-500/35 focus:ring-1 focus:ring-emerald-500/10
                    "
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-550 uppercase tracking-wider">
                  Reply Text
                </label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Hello! Thanks for reaching out. How can I help you today?"
                  rows={3}
                  className="
                    w-full px-3 py-2 mt-1
                    bg-white border border-gray-200
                    rounded-lg text-sm text-gray-900 placeholder:text-gray-550
                    focus:outline-none focus:border-emerald-500/35 focus:ring-1 focus:ring-emerald-500/10
                    resize-none
                  "
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.shortcut.trim() || !form.text.trim() || saving}
                  className="
                    flex items-center gap-1.5 px-3 py-1.5
                    bg-emerald-500 hover:bg-emerald-600
                    text-white text-xs font-medium rounded-lg
                    transition-colors disabled:opacity-50
                  "
                >
                  <Save className="w-3 h-3" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto inbox-scroll">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="
                w-14 h-14 rounded-full
                bg-gray-100 border border-gray-250
                flex items-center justify-center mb-3
              ">
                <Zap className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {search ? 'No matches' : 'No quick replies yet'}
              </h3>
              <p className="text-xs text-gray-505 text-center max-w-xs">
                {search
                  ? 'Try a different search term'
                  : 'Create reusable responses to send messages faster'}
              </p>
              {!search && onAdd && (
                <button
                  onClick={startCreate}
                  className="
                    mt-3 flex items-center gap-1.5 px-3 py-1.5
                    bg-emerald-500 hover:bg-emerald-600
                    text-white text-xs font-medium rounded-lg
                    transition-colors
                  "
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create First Reply
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 space-y-4">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    {category}
                  </p>
                  <div className="space-y-1.5">
                    {items.map((qr) => (
                      <div
                        key={qr.id}
                        className="
                          group flex items-start gap-3 p-3
                          bg-gray-50 hover:bg-gray-100
                          border border-gray-200 hover:border-emerald-500/20
                          rounded-lg transition-all
                          cursor-pointer
                        "
                        onClick={() => {
                          onSelect(qr);
                          onClose();
                        }}
                      >
                        <span className="
                          flex-shrink-0
                          text-[10px] font-mono font-bold
                          text-emerald-700 bg-emerald-50
                          border border-emerald-500/20
                          px-2 py-0.5 rounded-md
                        ">
                          /{qr.shortcut}
                        </span>
                        <p className="flex-1 text-xs text-gray-700 leading-relaxed">
                          {qr.text}
                        </p>
                        {(onUpdate || onDelete) && (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onUpdate && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(qr);
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-200 text-gray-550 hover:text-gray-900 transition-colors"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(qr.id);
                                }}
                                className="p-1.5 rounded-md hover:bg-red-50 text-gray-550 hover:text-red-650 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-[10px] text-gray-500 text-center">
            💡 Tip: Type <kbd className="px-1 py-0.5 bg-gray-200 border border-gray-300 rounded font-mono">/</kbd> in chat to use shortcuts
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickRepliesPanel;
