// src/components/common/Dropdown.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ElementType;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[] | string[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onSelect,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to object array
  const normalizedOptions = useMemo<DropdownOption[]>(() => {
    return options.map((opt: DropdownOption | string) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt: DropdownOption) => opt.value === value) || null;
  }, [normalizedOptions, value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled || disabled) return;
    onSelect(option.value);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full h-11 px-4 py-2 text-sm rounded-xl
          border bg-white text-gray-800 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <selectedOption.icon className="w-4 h-4 text-gray-500 shrink-0" />
          )}
          <span className={selectedOption ? 'text-gray-800 font-medium' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-full mt-2 origin-top-right bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="py-1.5" role="menu">
            {normalizedOptions.map((option: DropdownOption) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  className={`
                    flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors
                    ${isSelected ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}
                    ${option.disabled ? 'opacity-40 cursor-not-allowed' : ''}
                  `}
                  role="menuitem"
                >
                  <span className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <option.icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`} />
                    )}
                    <span className="truncate">{option.label}</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;