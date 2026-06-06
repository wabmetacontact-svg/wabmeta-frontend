// src/components/inbox/LabelManager.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { AVAILABLE_LABELS, getLabelStyle } from '../../utils/inboxHelpers';

interface Props {
  labels: string[];
  allLabels?: { label: string; color?: string }[];
  onAddLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
}

const LabelManager: React.FC<Props> = ({ labels, allLabels = [], onAddLabel, onRemoveLabel }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);

  const mergedLabels = Array.from(new Map(
    [
      ...AVAILABLE_LABELS.map(l => ({ label: l } as { label: string; color?: string })),
      ...allLabels
    ].map(item => [item.label, item])
  ).values());

  const availableToAdd = mergedLabels.filter((l) => !labels.includes(l.label));

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5">
        {labels.map((labelName) => {
          const labelObj = allLabels.find(l => l.label === labelName);
          const style = getLabelStyle(labelName, labelObj?.color);
          return (
            <span
              key={labelName}
              className={`
                inline-flex items-center gap-1 px-2 py-1
                text-[10px] font-medium rounded-md
                ${style.bg} ${style.text} ${style.border} border
                group
              `}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              <span className="capitalize">{labelName}</span>
              <button
                onClick={() => onRemoveLabel(labelName)}
                className="hover:scale-125 transition-transform"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          );
        })}

        {availableToAdd.length > 0 && (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="
              inline-flex items-center gap-1 px-2 py-1
              text-[10px] font-medium rounded-md
              bg-[#0a0e27]/[0.04] hover:bg-[#0a0e27]/[0.08]
              border border-dashed border-white/[0.15]
              text-gray-300 hover:text-white
              transition-all
            "
          >
            <Plus className="w-2.5 h-2.5" />
            Add label
          </button>
        )}

        {labels.length === 0 && availableToAdd.length === 0 && (
          <span className="text-xs text-gray-500 italic">No labels</span>
        )}
      </div>

      {/* Picker dropdown */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="
            absolute left-0 top-full mt-2 z-20
            w-52 py-1.5
            bg-[#0f1729]/98 backdrop-blur-xl
            border border-white/[0.1]
            rounded-xl shadow-2xl
            animate-fade-in
          "
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/[0.06]">
            Choose Label
          </div>
          <div className="max-h-56 overflow-y-auto inbox-scroll py-1">
            {availableToAdd.map(({ label, color }) => {
              const style = getLabelStyle(label, color);
              return (
                <button
                  key={label}
                  onClick={() => {
                    onAddLabel(label);
                    setShowPicker(false);
                  }}
                  className="
                    w-full flex items-center gap-2.5 px-3 py-2
                    text-sm hover:bg-[#0a0e27]/[0.05]
                    transition-colors
                  "
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                  <span className={`capitalize text-xs font-medium ${style.text}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelManager;
