// src/components/campaigns/VariableMapper.tsx - FINAL FIX
// ✅ FIX 1: CSV customData variables support karo ({{1}}, {{2}} format)
// ✅ FIX 2: modeMap initial state bug fix (variables change pe reset)
// ✅ FIX 3: Custom text input value bug (contact field switch)
// ✅ FIX 4: Variable label properly show karo ({{1}} not {{1}})

import React, { useState, useEffect } from 'react';
import {
  Info, User, Phone, Mail, Building2,
  CheckCircle2, AlertCircle, Type, Zap,
  Hash,
} from 'lucide-react';

interface VariableMapperProps {
  variables: string[];
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
}

interface ContactField {
  value: string;
  label: string;
  description: string;
  icon: React.ElementType;
  placeholder: string;
}

const CONTACT_FIELDS: ContactField[] = [
  {
    value: '{{contact.firstName}}',
    label: 'First Name',
    description: "Contact's first name",
    icon: User,
    placeholder: 'John',
  },
  {
    value: '{{contact.lastName}}',
    label: 'Last Name',
    description: "Contact's last name",
    icon: User,
    placeholder: 'Doe',
  },
  {
    value: '{{contact.fullName}}',
    label: 'Full Name',
    description: 'First + Last name combined',
    icon: User,
    placeholder: 'John Doe',
  },
  {
    value: '{{contact.phone}}',
    label: 'Phone Number',
    description: "Contact's phone number",
    icon: Phone,
    placeholder: '+919876543210',
  },
  {
    value: '{{contact.email}}',
    label: 'Email',
    description: "Contact's email address",
    icon: Mail,
    placeholder: 'john@example.com',
  },
  {
    value: '{{contact.company}}',
    label: 'Company',
    description: 'Company/organization name',
    icon: Building2,
    placeholder: 'Acme Corp',
  },
];

const VariableMapper: React.FC<VariableMapperProps> = ({
  variables,
  mapping,
  onMappingChange,
}) => {
  // ✅ FIX 2: modeMap ko variables change pe reinitialize karo
  const [modeMap, setModeMap] = useState<Record<string, 'field' | 'custom'>>({});

  useEffect(() => {
    const initial: Record<string, 'field' | 'custom'> = {};
    variables.forEach(v => {
      const current = mapping[v] || '';
      // ✅ FIX 4: Agar already mapped hai toh mode preserve karo
      if (modeMap[v]) {
        initial[v] = modeMap[v];
      } else {
        initial[v] = current.startsWith('{{contact.') ? 'field' : 'custom';
      }
    });
    setModeMap(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variables]);

  const updateValue = (variable: string, value: string) => {
    onMappingChange({ ...mapping, [variable]: value });
  };

  const setMode = (variable: string, mode: 'field' | 'custom') => {
    setModeMap(prev => ({ ...prev, [variable]: mode }));
    // ✅ FIX 3: Mode switch pe value clear karo
    updateValue(variable, '');
  };

  // ✅ FIX 4: Display variable name properly
  const getVarLabel = (v: string): string => {
    // Numeric variable: "1" -> "{{1}}"
    if (/^\d+$/.test(v)) return `{{${v}}}`;
    // Already has braces
    if (v.startsWith('{{')) return v;
    return `{{${v}}}`;
  };

  const getDisplayValue = (value: string): string => {
    if (!value) return 'Not mapped';
    if (value.startsWith('{{contact.')) {
      const field = CONTACT_FIELDS.find(f => f.value === value);
      return field ? `Auto: ${field.label}` : value;
    }
    return `Fixed: "${value}"`;
  };

  // ✅ FIX 3: Get safe custom value (not a contact field)
  const getCustomValue = (value: string): string => {
    if (!value || value.startsWith('{{contact.')) return '';
    return value;
  };

  if (variables.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl
                      p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center
                        justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="text-lg font-semibold text-green-800 mb-2">
          No Variables Required
        </h4>
        <p className="text-sm text-green-700 max-w-sm mx-auto">
          This template sends the same message to all recipients.
        </p>
      </div>
    );
  }

  const mappedCount = variables.filter(v => mapping[v]?.trim()).length;
  const allMapped = mappedCount === variables.length;

  return (
    <div className="space-y-5">

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-700 space-y-1">
            <p className="font-semibold text-blue-900">Variable Mapping</p>
            <p>
              <strong>Auto Field:</strong> Uses each contact's data
              (e.g., their name changes per recipient)
            </p>
            <p>
              <strong>Custom Text:</strong> Same value for every
              recipient (e.g., "SALE20", "₹500 OFF")
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {mappedCount}/{variables.length} mapped
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                          ${allMapped
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'}`}>
          {allMapped
            ? '✓ All mapped'
            : `${variables.length - mappedCount} remaining`}
        </span>
      </div>

      {/* Variable Cards */}
      <div className="space-y-3">
        {variables.map(variable => {
          const currentMode = modeMap[variable] || 'custom';
          const currentValue = mapping[variable] || '';
          const isValid = currentValue.trim().length > 0;
          const isNumeric = /^\d+$/.test(variable);

          return (
            <div
              key={variable}
              className={`bg-white border-2 rounded-xl p-4 transition-all
                          ${isValid
                  ? 'border-green-300 bg-green-50/20'
                  : 'border-gray-200'}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {isNumeric
                    ? <Hash className="w-4 h-4 text-primary-500" />
                    : <Info className="w-4 h-4 text-primary-500" />
                  }
                  <span className="font-mono font-bold text-primary-700
                                   bg-primary-50 border border-primary-200
                                   px-2.5 py-1 rounded-lg text-sm">
                    {getVarLabel(variable)}
                  </span>
                  {isValid && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>

                {/* Mode Toggle */}
                <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setMode(variable, 'field')}
                    className={`flex items-center gap-1.5 px-3 py-1.5
                                text-xs font-medium rounded-md transition-all
                                ${currentMode === 'field'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <Zap className="w-3 h-3" />
                    Auto Field
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode(variable, 'custom')}
                    className={`flex items-center gap-1.5 px-3 py-1.5
                                text-xs font-medium rounded-md transition-all
                                ${currentMode === 'custom'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <Type className="w-3 h-3" />
                    Fixed Text
                  </button>
                </div>
              </div>

              {/* Input */}
              {currentMode === 'field' ? (
                <div className="space-y-2">
                  <select
                    value={currentValue.startsWith('{{contact.')
                      ? currentValue
                      : ''}
                    onChange={e => updateValue(variable, e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200
                               rounded-xl text-gray-900 text-sm focus:outline-none
                               focus:ring-2 focus:ring-primary-500/20
                               focus:border-primary-500 transition-all"
                  >
                    <option value="">-- Select contact field --</option>
                    {CONTACT_FIELDS.map(field => (
                      <option key={field.value} value={field.value}>
                        {field.label} — {field.description}
                      </option>
                    ))}
                  </select>

                  {/* Preview */}
                  {currentValue?.startsWith('{{contact.') && (
                    <div className="flex items-center gap-2 px-3 py-2
                                    bg-blue-50 border border-blue-100
                                    rounded-lg text-xs text-blue-700">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Each recipient gets their own{' '}
                        <strong>
                          {CONTACT_FIELDS.find(f => f.value === currentValue)
                            ?.label}
                        </strong>
                        {' '}— e.g.,{' '}
                        <em>
                          "{CONTACT_FIELDS.find(f => f.value === currentValue)
                            ?.placeholder}"
                        </em>
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    // ✅ FIX 3: Safe value
                    value={getCustomValue(currentValue)}
                    onChange={e => updateValue(variable, e.target.value)}
                    placeholder={`Enter fixed text for ${getVarLabel(variable)}`}
                    maxLength={200}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200
                               rounded-xl text-gray-900 text-sm
                               placeholder:text-gray-400 focus:outline-none
                               focus:ring-2 focus:ring-primary-500/20
                               focus:border-primary-500 transition-all"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Same value sent to all recipients</span>
                    <span>
                      {getCustomValue(currentValue).length}/200
                    </span>
                  </div>
                </div>
              )}

              {/* Warning */}
              {!isValid && (
                <div className="mt-2 flex items-center gap-2 text-xs
                                text-amber-700 bg-amber-50 border
                                border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Required — fill this to proceed
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="font-semibold text-gray-800 mb-3 text-sm flex
                        items-center gap-2">
          <Info className="w-4 h-4 text-gray-400" />
          Mapping Summary
        </h4>
        <div className="space-y-1.5">
          {variables.map(variable => {
            const value = mapping[variable] || '';
            const valid = value.trim().length > 0;
            return (
              <div
                key={variable}
                className={`flex items-center justify-between text-xs
                            py-2 px-3 rounded-lg
                            ${valid ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <span className="font-mono font-bold text-primary-700">
                  {getVarLabel(variable)}
                </span>
                <span className={`font-medium truncate max-w-[200px] ml-2
                                  ${valid
                    ? 'text-green-700'
                    : 'text-red-500 italic'}`}>
                  {getDisplayValue(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VariableMapper;