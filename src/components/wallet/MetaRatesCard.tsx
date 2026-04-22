import React from 'react';

// Rates display card
const MetaRatesCard: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border 
                  border-gray-200 dark:border-gray-700 p-5 shadow-sm">
    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
      <span className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
        💳
      </span>
      Template Charges (per message)
    </h3>
    <div className="space-y-2">
      {[
        { label: 'Marketing',       rate: '₹0.90', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { label: 'Utility',         rate: '₹0.15', color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20'   },
        { label: 'Authentication',  rate: '₹0.15', color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Auth Intl',       rate: '₹2.50', color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20'     },
      ].map(item => (
        <div key={item.label}
          className={`flex items-center justify-between 
                      px-3 py-2 rounded-xl ${item.bg}`}>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {item.label}
          </span>
          <span className={`text-sm font-bold ${item.color}`}>
            {item.rate}
          </span>
        </div>
      ))}
    </div>
    <p className="text-[10px] text-gray-400 mt-3 text-center leading-tight">
      These are estimated rates. Actual charges may vary based on Meta's region-specific pricing policies.
    </p>
  </div>
);

export default MetaRatesCard;
