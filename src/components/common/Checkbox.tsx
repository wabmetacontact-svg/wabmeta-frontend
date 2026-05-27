import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  error?: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  error,
  disabled = false,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className={`inline-flex items-start gap-3 cursor-pointer group
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Hidden native checkbox */}
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />

        {/* Custom checkbox */}
        <div className={`relative flex items-center justify-center 
          w-5 h-5 rounded-md flex-shrink-0 mt-0.5
          border transition-all duration-300
          ${checked
            ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-green-400 shadow-[0_4px_12px_rgba(16,185,129,0.4)]'
            : error
              ? 'bg-white/[0.04] border-red-400/40'
              : 'bg-white/[0.04] border-white/[0.15] group-hover:border-white/[0.3] group-hover:bg-white/[0.08]'
          }
        `}>
          <Check 
            className={`w-3 h-3 text-white transition-all duration-200
              ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
            `}
            strokeWidth={3}
          />
        </div>

        {label && (
          <span className="text-sm text-gray-300 select-none leading-tight">
            {label}
          </span>
        )}
      </label>

      {error && (
        <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-red-400" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Checkbox;