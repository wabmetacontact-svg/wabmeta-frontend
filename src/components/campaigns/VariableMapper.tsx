import React, { useState, useEffect } from 'react';
import {
  Info, User, Phone, Mail, Building2,
  CheckCircle2, AlertCircle, Type, Zap,
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
    description: "Recipient's first name",
    icon: User,
    placeholder: 'John',
  },
  {
    value: '{{contact.lastName}}',
    label: 'Last Name',
    description: "Recipient's last name",
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
    description: "Recipient's phone number",
    icon: Phone,
    placeholder: '+919876543210',
  },
  {
    value: '{{contact.email}}',
    label: 'Email',
    description: "Recipient's email address",
    icon: Mail,
    placeholder: 'john@example.com',
  },
  {
    value: '{{contact.company}}',
    label: 'Company',
    description: 'Organization name',
    icon: Building2,
    placeholder: 'Acme Corp',
  },
];

const VariableMapper: React.FC<VariableMapperProps> = ({
  variables,
  mapping,
  onMappingChange,
}) => {
  const [modeMap, setModeMap] = useState<Record<string, 'field' | 'custom'>>({});

  useEffect(() => {
    const initial: Record<string, 'field' | 'custom'> = {};
    variables.forEach(v => {
      const current = mapping[v] || '';
      if (modeMap[v]) {
        initial[v] = modeMap[v];
      } else {
        initial[v] = current.startsWith('{{contact.') ? 'field' : 'custom';
      }
    });
    setModeMap(initial);
  }, [variables]);

  const updateValue = (variable: string, value: string) => {
    onMappingChange({ ...mapping, [variable]: value });
  };

  const setMode = (variable: string, mode: 'field' | 'custom') => {
    setModeMap(prev => ({ ...prev, [variable]: mode }));
    updateValue(variable, '');
  };

  const getVarLabel = (v: string): string => {
    if (/^\d+$/.test(v)) return `{{${v}}}`;
    if (v.startsWith('{{')) return v;
    return `{{${v}}}`;
  };

  const getCustomValue = (value: string): string => {
    if (!value || value.startsWith('{{contact.')) return '';
    return value;
  };

  if (variables.length === 0) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3.5 text-emerald-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-emerald-950 mb-1">
          No Dynamic Variables Required
        </h4>
        <p className="text-xs font-semibold text-emerald-800 max-w-sm mx-auto">
          This template sends uniform static text to all broadcast targets.
        </p>
      </div>
    );
  }

  const mappedCount = variables.filter(v => mapping[v]?.trim()).length;
  const allMapped = mappedCount === variables.length;

  return (
    <div className="space-y-5">
      {/* ── Guidance Banner ── */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-900 space-y-1 font-semibold leading-relaxed">
            <p className="font-bold text-sm text-blue-950">Dynamic Variable Mapping Guide</p>
            <p>
              • <strong>Auto Field:</strong> Pulls custom recipient data dynamically (e.g. First Name changes per recipient).
            </p>
            <p>
              • <strong>Fixed Text:</strong> Sends identical static text to everyone (e.g. Discount Code "WELCOME20").
            </p>
          </div>
        </div>
      </div>

      {/* ── Status Header ── */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500">
          {mappedCount} of {variables.length} variables mapped
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${allMapped ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'
          }`}>
          {allMapped ? '✓ All Mapped' : `${variables.length - mappedCount} Remaining`}
        </span>
      </div>

      {/* ── Mapping Cards List ── */}
      <div className="space-y-3.5">
        {variables.map(variable => {
          const currentMode = modeMap[variable] || 'custom';
          const currentValue = mapping[variable] || '';
          const isValid = currentValue.trim().length > 0;

          return (
            <div
              key={variable}
              className={`bg-white border rounded-2xl p-4 transition-all duration-200 ${isValid ? 'border-emerald-300 bg-emerald-50/30 shadow-sm' : 'border-gray-200 shadow-sm'
                }`}
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-lg text-xs">
                    {getVarLabel(variable)}
                  </span>
                  {isValid && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>

                {/* Mode Toggles */}
                <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setMode(variable, 'field')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${currentMode === 'field'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-600" /> Auto Field
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode(variable, 'custom')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${currentMode === 'custom'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    <Type className="w-3.5 h-3.5 text-emerald-600" /> Fixed Text
                  </button>
                </div>
              </div>

              {/* Selector vs Input */}
              {currentMode === 'field' ? (
                <div className="space-y-2">
                  <select
                    value={currentValue.startsWith('{{contact.') ? currentValue : ''}
                    onChange={e => updateValue(variable, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="">-- Choose Contact Field --</option>
                    {CONTACT_FIELDS.map(field => (
                      <option key={field.value} value={field.value}>
                        {field.label} — {field.description}
                      </option>
                    ))}
                  </select>

                  {currentValue?.startsWith('{{contact.') && (
                    <p className="text-xs font-semibold text-emerald-800 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200">
                      Sample Value: "{CONTACT_FIELDS.find(f => f.value === currentValue)?.placeholder}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={getCustomValue(currentValue)}
                    onChange={e => updateValue(variable, e.target.value)}
                    placeholder={`Type fixed text for ${getVarLabel(variable)}`}
                    maxLength={200}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1">
                    <span>Static value sent to all recipients</span>
                    <span>{getCustomValue(currentValue).length}/200</span>
                  </div>
                </div>
              )}

              {!isValid && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  Required field — please complete mapping to proceed
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VariableMapper;