// src/components/common/UpgradeModal.tsx
import { X, Crown, Check, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useModalA11y } from '../../hooks/useModalA11y';
interface Props {
    isOpen: boolean;
    onClose: () => void;
    feature?: string;
    minimumPlan?: string;
    limitType?: string;
    used?: number;
    limit?: number;
    message?: string;
}

export default function UpgradeModal({ isOpen, onClose, feature, minimumPlan, message }: Props) {
    const panelRef = useModalA11y(isOpen, onClose);

    if (!isOpen) return null;

    const plans = [
        {
            id: 'MONTHLY',
            name: 'Monthly',
            price: '₹899',
            period: '/month',
            features: [
                'Bulk CSV Import (Unlimited)',
                'Automated Message Queue',
                '2,500 Contacts Limit',
                '5,000 Messages/month',
                '1 WhatsApp Account'
            ],
            highlight: minimumPlan === 'MONTHLY'
        },
        {
            id: 'QUARTERLY',
            name: 'Quarterly',
            price: '₹2,500',
            period: '/3 months',
            features: [
                'Unlimited CSV Imports',
                'Smart Bulk Paste Enabled',
                '10,000 Contacts Limit',
                '25,000 Messages/month',
                '2 WhatsApp Accounts',
                'Priority Support'
            ],
            highlight: minimumPlan === 'QUARTERLY' || !minimumPlan,
            popular: true
        },
        {
            id: 'ANNUAL',
            name: 'Annual',
            price: '₹8,000',
            period: '/year',
            features: [
                'Enterprise Scale Limits',
                'Unlimited Contacts',
                'Unlimited Messages',
                '5 WhatsApp Accounts',
                'Dedicated Support',
                'API Access'
            ],
            highlight: minimumPlan === 'ANNUAL'
        }
    ];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div ref={panelRef}
                className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10 animate-in zoom-in-95 duration-200">

                {/* Header - Styled using the brand emerald scheme */}
                <div className="text-center p-8 bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-600 text-white relative">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20">
                        <Crown className="w-8 h-8 text-yellow-300" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Upgrade Your Plan</h2>
                    <p className="text-emerald-50 text-sm max-w-md mx-auto">
                        {message ? message : (
                            <>Unlock <span className="font-bold text-yellow-300">{feature || 'powerful features'}</span> to level up your business operations</>
                        )}
                    </p>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Plans Grid */}
                <div className="p-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${plan.popular
                                        ? 'border-emerald-500 bg-emerald-50/40 shadow-lg md:scale-105'
                                        : plan.highlight
                                            ? 'border-green-400 bg-green-50/20'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-bold rounded-full shadow-md">
                                        <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                                        MOST POPULAR
                                    </div>
                                )}

                                {plan.highlight && !plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-[10px] font-bold rounded-full shadow-sm">
                                        MINIMUM REQUIRED
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        {plan.name}
                                    </h3>
                                    <div className="mb-4">
                                        <span className="text-2xl font-black text-gray-900">
                                            {plan.price}
                                        </span>
                                        <span className="text-gray-500 text-xs">{plan.period}</span>
                                    </div>

                                    <ul className="space-y-2.5 mb-6">
                                        {plan.features.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs">
                                                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <span className="text-gray-600">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link
                                    to="/dashboard/settings/billing"
                                    onClick={onClose}
                                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${plan.popular
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md active:scale-95'
                                            : plan.highlight
                                                ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-95'
                                        }`}
                                >
                                    Select Plan
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 text-center bg-gray-50">
                    <p className="text-xs text-gray-400">
                        💳 Secure payment verification via Razorpay • 📧 Need custom limits? <a href="mailto:support@wabmeta.com" className="text-emerald-600 hover:underline font-semibold">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}