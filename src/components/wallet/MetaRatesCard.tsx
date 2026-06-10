import React from 'react';

// Rates display card
const MetaRatesCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
    <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
      <span className="p-1.5 bg-green-100 rounded-lg text-green-600">
        💳
      </span>
      Template Charges (per message)
    </h3>
    <div className="space-y-2">
      {[
        { label: 'Marketing',       rate: '₹0.90', color: 'text-orange-600', bg: 'bg-orange-50/70' },
        { label: 'Utility',         rate: '₹0.15', color: 'text-blue-600',   bg: 'bg-blue-50/70'   },
        { label: 'Authentication',  rate: '₹0.15', color: 'text-green-600',  bg: 'bg-green-50/70' },
        { label: 'Auth Intl',       rate: '₹2.50', color: 'text-red-600',    bg: 'bg-red-50/70'     },
      ].map(item => (
        <div key={item.label}
          className={`flex items-center justify-between px-3 py-2 rounded-xl ${item.bg}`}>
          <span className="text-xs font-medium text-slate-700">
            {item.label}
          </span>
          <span className={`text-sm font-bold ${item.color}`}>
            {item.rate}
          </span>
        </div>
      ))}
    </div>
    <p className="text-[10px] text-slate-500 mt-3 text-center leading-tight">
      These are estimated rates. Actual charges may vary based on Meta's region-specific pricing policies.
    </p>
  </div>
);

export default MetaRatesCard;
