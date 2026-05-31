// src/components/inbox/ConversationNotes.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, StickyNote } from 'lucide-react';
import { formatChatTime } from '../../utils/inboxHelpers';

export interface Note {
  id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  author?: string;
}

interface Props {
  notes: Note[];
  onAdd: (text: string) => Promise<void> | void;
  onUpdate: (id: string, text: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

const ConversationNotes: React.FC<Props> = ({ notes, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  const addRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isAdding) addRef.current?.focus();
  }, [isAdding]);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      await onAdd(newNote.trim());
      setNewNote('');
      setIsAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !editText.trim()) return;
    setSaving(true);
    try {
      await onUpdate(editingId, editText.trim());
      setEditingId(null);
      setEditText('');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  return (
    <div className="space-y-2">
      {/* Add note button / input */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="
            w-full flex items-center justify-center gap-1.5 py-2
            bg-[#0a0e27]/[0.03] hover:bg-[#0a0e27]/[0.06]
            border border-dashed border-white/[0.1] hover:border-emerald-400/30
            rounded-lg
            text-xs font-medium text-gray-400 hover:text-emerald-400
            transition-all
          "
        >
          <Plus className="w-3.5 h-3.5" />
          Add a note
        </button>
      ) : (
        <div className="
          bg-[#0a0e27]/[0.04] border border-emerald-400/30
          rounded-lg p-2 animate-fade-in
        ">
          <textarea
            ref={addRef}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewNote('');
              } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleAdd();
              }
            }}
            placeholder="Write a note (internal only)..."
            rows={3}
            className="
              w-full bg-transparent text-xs text-white placeholder:text-gray-500
              focus:outline-none resize-none
            "
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06]">
            <p className="text-[10px] text-gray-500">
              <kbd className="px-1 bg-[#0a0e27]/[0.05] rounded">Ctrl+Enter</kbd> to save
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewNote('');
                }}
                disabled={saving}
                className="px-2 py-1 text-[10px] text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newNote.trim() || saving}
                className="
                  px-2.5 py-1 text-[10px] font-medium
                  bg-emerald-500 hover:bg-emerald-600
                  text-white rounded
                  transition-colors disabled:opacity-50
                "
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        !isAdding && (
          <div className="flex flex-col items-center py-4 text-center">
            <StickyNote className="w-6 h-6 text-gray-400 mb-2" />
            <p className="text-[10px] text-gray-500">
              No notes yet. Add internal notes about this conversation.
            </p>
          </div>
        )
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            className="
              group p-2.5
              bg-amber-500/[0.05] hover:bg-amber-500/[0.08]
              border-l-2 border-amber-400/60
              rounded-r-lg transition-colors
            "
          >
            {editingId === note.id ? (
              <div>
                <textarea
                  ref={editRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setEditingId(null);
                    else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleUpdate();
                  }}
                  rows={3}
                  className="
                    w-full bg-[#0a0e27]/[0.04] text-xs text-white
                    border border-emerald-400/30 rounded p-2
                    focus:outline-none focus:border-emerald-400 resize-none
                  "
                />
                <div className="flex items-center justify-end gap-1 mt-1.5">
                  <button
                    onClick={() => setEditingId(null)}
                    disabled={saving}
                    className="p-1 hover:bg-[#0a0e27]/[0.06] rounded text-gray-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={!editText.trim() || saving}
                    className="p-1 bg-emerald-500 hover:bg-emerald-600 rounded text-white transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-amber-100 whitespace-pre-wrap leading-relaxed">
                  {note.text}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-amber-400/10">
                  <p className="text-[10px] text-amber-300/60">
                    {note.author && `${note.author} • `}
                    {formatChatTime(note.createdAt)}
                    {note.updatedAt && note.updatedAt !== note.createdAt && ' (edited)'}
                  </p>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(note)}
                      className="p-1 hover:bg-[#0a0e27]/[0.06] rounded text-amber-300/70 hover:text-amber-200 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDelete(note.id)}
                      className="p-1 hover:bg-red-500/15 rounded text-amber-300/70 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ConversationNotes;
