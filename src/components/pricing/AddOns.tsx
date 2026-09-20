// src/components/pricing/AddOns.tsx
//
// The add-ons from the approved pricing design, under the plan cards on both
// the landing page and the Billing page.
//
// They raise capacity only - seats, numbers, AI replies. Features always come
// from the plan, so an add-on can never unlock something the tier excludes.
// That was the point of dropping the earlier "channel add-on" idea: an add-on
// that switches features on makes every tier boundary negotiable.
//
// There is no checkout for these yet. The row therefore says to contact
// support rather than offering a button that would fail - advertising a
// purchase that cannot complete is worse than advertising nothing.

import React from 'react';
import { Plus } from 'lucide-react';

export interface AddOn {
  name: string;
  price: string;
  /** Plans it can be bought alongside. */
  availableOn: string;
}

export const ADD_ONS: AddOn[] = [
  {
    name: 'Extra agent seat',
    price: '₹399/mo',
    availableOn: 'Starter, Growth, Pro',
  },
  {
    name: 'AI top-up — 1,000 replies',
    price: '₹499 one-time',
    availableOn: 'Pro, Business',
  },
  {
    name: 'Extra WhatsApp number',
    price: '₹499/mo',
    availableOn: 'Starter, Growth',
  },
];

interface AddOnsProps {
  /** Landing page sits on a tinted section; Billing sits on plain white. */
  tone?: 'light' | 'plain';
}

const AddOns: React.FC<AddOnsProps> = ({ tone = 'plain' }) => (
  <div
    className={`rounded-2xl border p-6 md:p-8 ${
      tone === 'light'
        ? 'bg-white border-gray-200 shadow-sm'
        : 'bg-gray-50 border-gray-200'
    }`}
  >
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
        <Plus className="w-4 h-4 text-green-600" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900">Add-ons</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Available with any plan. They add capacity — features always come
          from your plan.
        </p>
      </div>
    </div>

    <div className="divide-y divide-gray-200 border-t border-gray-200">
      {ADD_ONS.map((addOn) => (
        <div
          key={addOn.name}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{addOn.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              With {addOn.availableOn}
            </p>
          </div>
          <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
            {addOn.price}
          </p>
        </div>
      ))}
    </div>

    <p className="text-xs text-gray-500 mt-5 leading-relaxed">
      To add one, contact support — we will apply it to your account and bill
      it with your plan.
    </p>
  </div>
);

export default AddOns;
