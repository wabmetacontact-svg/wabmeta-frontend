// src/components/campaigns/VariableMapper.tsx - FIXED
import React, { useState } from 'react';
import {
  Info, User, Phone, Mail, Building2,
  CheckCircle2, AlertCircle, Type, Zap,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────
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

// ─── Predefined Contact Fields ─────────────────────────────
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
    description: 'First + Last name',
    icon: User,
    placeholder: 'John Doe',
  },
  {
    value: '{{contact.phone}}',
    label: 'Phone',
    description: "Contact's phone",
    icon: Phone,
    placeholder: '+919876543210',
  },
  {
    value: '{{contact.email}}',
    label: 'Email',
    description: "Contact's email",
    icon: Mail,
    placeholder: 'john@example.com',
  },
  {
    value: '{{contact.company}}',
    label: 'Company',
    description: 'Company name',
    icon: Building2,
    placeholder: 'Acme Corp',
  },
];

// ─── Component ────────────────────────────────────────────────
const VariableMapper: React.FC<VariableMapperProps> = ({
  variables,
  mapping,
  onMappingChange,
}) => {
  // Track which mode each variable is in (field vs custom)
  const [modeMap, setModeMap] = useState<Record<string, 'field' | 'custom'>>(
    () => {
      const initial: Record<string, 'field' | 'custom'> = {};
      variables.forEach(v => {
        const current = mapping[v] || '';
        initial[v] = current.startsWith('{{contact.') ? 'field' : 'custom';
      });
      return initial;
    }
  );

  const updateValue = (variable: string, value: string) => {
    onMappingChange({ ...mapping, [variable]: value });
  };

  const setMode = (variable: string, mode: 'field' | 'custom') => {
    setModeMap(prev => ({ ...prev, [variable]: mode }));
    // Clear value when switching modes
    if (mode !== modeMap[variable]) {
      updateValue(variable, '');
    }
  };

  // Get display label for mapped value
  const getDisplayValue = (value: string): string => {
    if (!value) return 'Not mapped';
    if (value.startsWith('{{contact.')) {
      const field = CONTACT_FIELDS.find(f => f.value === value);
      return field ? `Auto: ${field.label}` : value;
    }
    return `Text: "${value}"`;
  };

  // ─── Empty state ─────────────────────────────────────────
  if (variables.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center
                        justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="text-lg font-semibold text-green-800 mb-2">
          No Variables Required
        </h4>
        <p className="text-sm text-green-700 max-w-sm mx-auto">
          This template doesn't have any variables. It will be sent as-is to all
          recipients.
        </p>
      </div>
    );
  }

  const mappedCount = variables.filter(v => mapping[v]?.trim()).length;
  const allMapped = mappedCount === variables.length;

  return (
    <div className="space-y-6">

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              How Variable Mapping Works
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>
                <strong>Auto Field:</strong> Uses recipient's contact info
                (e.g., their name)
              </li>
              <li>
                <strong>Custom Text:</strong> Same text for all recipients
                (e.g., "10% OFF")
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-gray-600">
          {mappedCount} of {variables.length} variables mapped
        </span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                          ${allMapped
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'}`}>
          {allMapped ? '✓ Ready' : `${variables.length - mappedCount} pending`}
        </span>
      </div>

      {/* Variable Cards */}
      <div className="space-y-3">
        {variables.map(variable => {
          const currentMode = modeMap[variable] || 'field';
          const currentValue = mapping[variable] || '';
          const isValid = currentValue.trim().length > 0;

          return (
            <div
              key={variable}
              className={`bg-white border-2 rounded-xl p-4 transition-all
                          ${isValid
                  ? 'border-green-300 bg-green-50/30'
                  : 'border-gray-200'}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1.5
                                   bg-primary-100 text-primary-700 rounded-lg
                                   font-mono font-semibold text-sm">
                    {`{{${variable}}}`}
                  </span>
                  {isValid && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
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
                    Custom Text
                  </button>
                </div>
              </div>

              {/* Input based on mode */}
              {currentMode === 'field' ? (
                /* Field Selector */
                <div className="space-y-2">
                  <select
                    value={currentValue}
                    onChange={e => updateValue(variable, e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200
                               rounded-xl text-gray-900 focus:outline-none
                               focus:ring-2 focus:ring-primary-500/20
                               focus:border-primary-500 transition-all"
                  >
                    <option value="">-- Select a contact field --</option>
                    {CONTACT_FIELDS.map(field => (
                      <option key={field.value} value={field.value}>
                        {field.label} — {field.description}
                      </option>
                    ))}
                  </select>

                  {currentValue && (
                    <div className="flex items-center gap-2 px-3 py-2
                                    bg-blue-50 border border-blue-100
                                    rounded-lg text-xs">
                      <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-blue-700">
                        Example: "
                        <span className="font-medium">
                          {CONTACT_FIELDS.find(f => f.value === currentValue)?.placeholder || 'value'}
                        </span>
                        " will be used for each recipient
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Custom Text Input */
                <div className="space-y-2">
                  <input
                    type="text"
                    value={currentValue.startsWith('{{contact.') ? '' : currentValue}
                    onChange={e => updateValue(variable, e.target.value)}
                    placeholder={`Enter custom text for {{${variable}}}`}
                    maxLength={200}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200
                               rounded-xl text-gray-900 placeholder:text-gray-400
                               focus:outline-none focus:ring-2
                               focus:ring-primary-500/20 focus:border-primary-500
                               transition-all"
                  />

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Same text will be used for all recipients
                    </p>
                    <span className="text-xs text-gray-400">
                      {currentValue.startsWith('{{contact.') ? 0 : currentValue.length}/200
                    </span>
                  </div>
                </div>
              )}

              {/* Warning if empty */}
              {!isValid && (
                <div className="mt-2 flex items-center gap-2 text-xs
                                text-amber-700 bg-amber-50 border border-amber-200
                                rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  This variable needs a value to send the campaign
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-500" />
          Mapping Summary
        </h4>
        <div className="space-y-2">
          {variables.map(variable => {
            const value = mapping[variable] || '';
            const valid = value.trim().length > 0;
            return (
              <div
                key={variable}
                className={`flex items-center justify-between text-sm
                            py-2 px-3 rounded-lg
                            ${valid ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <span className="font-mono font-medium text-primary-700">
                  {`{{${variable}}}`}
                </span>
                <span className={`font-medium truncate max-w-[200px] ml-2
                                  ${valid ? 'text-green-700' : 'text-red-600'}`}>
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