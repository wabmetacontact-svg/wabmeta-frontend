// src/components/wallet/MetaRatesCard.tsx
//
// What a message costs, by country.
//
// This card used to hold its own copy of the rate table. It drifted: it
// quoted India's utility at 0.19 while the wallet was charging 0.145, so the
// page told the customer one number and their balance told them another. The
// rates now come from GET /wallet/rates, which reads the very table the
// deduction uses.

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Info, Search } from 'lucide-react';
import { wallet as walletApi } from '../../services/api';

interface CountryRate {
  code: string;
  name: string;
  marketing: number;
  utility: number;
  authentication: number;
  service: number;
}

// Shown only until the request lands, and if it never lands. Kept to one
// country on purpose - a longer list here is a second price table waiting to
// go stale.
const INDIA_FALLBACK: CountryRate = {
  code: '91',
  name: 'India',
  marketing: 1.0,
  utility: 0.145,
  authentication: 0.12,
  service: 0,
};

const FLAGS: Record<string, string> = {
  '91': '\u{1F1EE}\u{1F1F3}',
  '1': '\u{1F1FA}\u{1F1F8}',
  '44': '\u{1F1EC}\u{1F1E7}',
  '971': '\u{1F1E6}\u{1F1EA}',
  '55': '\u{1F1E7}\u{1F1F7}',
  '966': '\u{1F1F8}\u{1F1E6}',
  '65': '\u{1F1F8}\u{1F1EC}',
  '61': '\u{1F1E6}\u{1F1FA}',
  '49': '\u{1F1E9}\u{1F1EA}',
  '92': '\u{1F1F5}\u{1F1F0}',
  '880': '\u{1F1E7}\u{1F1E9}',
  '62': '\u{1F1EE}\u{1F1E9}',
};

const MetaRatesCard: React.FC = () => {
  const [countries, setCountries] = useState<CountryRate[]>([INDIA_FALLBACK]);
  const [selectedCode, setSelectedCode] = useState('91');
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let alive = true;

    walletApi
      .getRates()
      .then((res) => {
        const list = res?.data?.data?.countries;
        if (alive && Array.isArray(list) && list.length > 0) {
          setCountries(list as CountryRate[]);
        }
      })
      .catch(() => {
        // The fallback is already on screen.
      });

    return () => {
      alive = false;
    };
  }, []);

  const selected =
    countries.find((c) => c.code === selectedCode) || countries[0] || INDIA_FALLBACK;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.includes(q)
    );
  }, [countries, query]);

  const rows = [
    { label: 'Marketing', rate: selected.marketing, color: 'text-orange-600', bg: 'bg-orange-50/70' },
    { label: 'Utility', rate: selected.utility, color: 'text-blue-600', bg: 'bg-blue-50/70' },
    { label: 'Authentication', rate: selected.authentication, color: 'text-green-600', bg: 'bg-green-50/70' },
    { label: 'Service', rate: selected.service, color: 'text-gray-600', bg: 'bg-gray-50/70' },
  ];

  const closeDropdown = () => {
    setShowDropdown(false);
    setQuery('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          <span className="p-1.5 bg-green-100 rounded-lg text-green-600">&#128179;</span>
          Template Charges
        </h3>

        {/* Country selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium transition-all"
          >
            <span className="text-base">{FLAGS[selected.code] || '\u{1F310}'}</span>
            <span>{selected.name}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeDropdown} />
              <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                {countries.length > 8 && (
                  <div className="p-2 border-b border-gray-100">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
                      <Search className="w-3 h-3 text-gray-400" />
                      <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search country"
                        className="bg-transparent text-xs outline-none w-full"
                      />
                    </div>
                  </div>
                )}

                <div className="max-h-64 overflow-y-auto">
                  {visible.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setSelectedCode(c.code);
                        closeDropdown();
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 ${
                        selected.code === c.code ? 'bg-green-50 text-green-700' : ''
                      }`}
                    >
                      <span className="text-base">{FLAGS[c.code] || '\u{1F310}'}</span>
                      <span className="font-medium truncate">{c.name}</span>
                      <span className="text-gray-400 ml-auto">+{c.code}</span>
                    </button>
                  ))}

                  {visible.length === 0 && (
                    <p className="px-3 py-4 text-xs text-gray-400 text-center">
                      No country matches "{query}"
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between px-3 py-2 rounded-xl ${item.bg}`}
          >
            <span className="text-xs font-medium text-slate-700">{item.label}</span>
            <span className={`text-sm font-bold ${item.color}`}>
              {item.rate === 0 ? 'FREE' : `\u20B9${item.rate.toFixed(3).replace(/0$/, '')}`}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-1.5 text-[10px] text-slate-500 leading-tight">
        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
        <span>
          Charged per message sent to {selected.name}, on the country of the
          number you message. Replies inside the 24-hour window are free.
        </span>
      </div>
    </div>
  );
};

export default MetaRatesCard;
