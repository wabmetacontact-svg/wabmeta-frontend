// src/components/wallet/MetaRatesCard.tsx
import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

const COUNTRY_OPTIONS = [
  { code: '91', name: 'India', flag: '🇮🇳', marketing: 1.00, utility: 0.19, auth: 0.12 },
  { code: '1', name: 'USA/Canada', flag: '🇺🇸', marketing: 3.10, utility: 1.29, auth: 1.29 },
  { code: '44', name: 'UK', flag: '🇬🇧', marketing: 5.44, utility: 2.85, auth: 2.85 },
  { code: '971', name: 'UAE', flag: '🇦🇪', marketing: 5.19, utility: 2.32, auth: 2.32 },
  { code: '55', name: 'Brazil', flag: '🇧🇷', marketing: 6.25, utility: 1.57, auth: 1.57 },
  { code: '966', name: 'Saudi Arabia', flag: '🇸🇦', marketing: 5.21, utility: 1.90, auth: 1.90 },
];

const MetaRatesCard: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_OPTIONS[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          <span className="p-1.5 bg-green-100 rounded-lg text-green-600">💳</span>
          Template Charges
        </h3>

        {/* Country Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium transition-all"
          >
            <span className="text-base">{selectedCountry.flag}</span>
            <span>{selectedCountry.name}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                {COUNTRY_OPTIONS.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setSelectedCountry(c);
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 ${
                      selectedCountry.code === c.code ? 'bg-green-50 text-green-700' : ''
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-gray-400 ml-auto">+{c.code}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {[
          { label: 'Marketing', rate: selectedCountry.marketing, color: 'text-orange-600', bg: 'bg-orange-50/70' },
          { label: 'Utility', rate: selectedCountry.utility, color: 'text-blue-600', bg: 'bg-blue-50/70' },
          { label: 'Authentication', rate: selectedCountry.auth, color: 'text-green-600', bg: 'bg-green-50/70' },
          { label: 'Service', rate: 0, color: 'text-gray-600', bg: 'bg-gray-50/70' },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between px-3 py-2 rounded-xl ${item.bg}`}
          >
            <span className="text-xs font-medium text-slate-700">{item.label}</span>
            <span className={`text-sm font-bold ${item.color}`}>
              {item.rate === 0 ? 'FREE' : `₹${item.rate.toFixed(2)}`}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-1.5 text-[10px] text-slate-500 leading-tight">
        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
        <span>
          Rates for {selectedCountry.name}. Select different country to see their pricing. Actual charges may vary.
        </span>
      </div>
    </div>
  );
};

export default MetaRatesCard;
