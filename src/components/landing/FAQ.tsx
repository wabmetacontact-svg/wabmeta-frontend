import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';

const faqs = [
  {
    q: 'What is WabMeta and how does it work?',
    a: 'WabMeta is a WhatsApp Business API platform that lets you send bulk campaigns, automate conversations, manage a shared team inbox, and track analytics — all in one workspace connected to Meta\'s official WhatsApp API.',
  },
  {
    q: 'Do I need a WhatsApp Business Account?',
    a: 'Yes. You need a WhatsApp Business Account linked to the API. If you don\'t have one, our team will guide you through the setup process — it typically takes 24–48 hours.',
  },
  {
    q: 'What does "Unlimited Messages" mean?',
    a: 'Unlimited messages means no per-message cap from our side. Standard WhatsApp API rate limits and Meta conversation pricing still apply based on your messaging tier.',
  },
  {
    q: 'Can I import my existing contacts?',
    a: 'Yes. You can import contacts via CSV with automatic duplicate detection, phone validation, and tag assignment for easy segmentation.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes — a 2-day free trial with 100 messages. No credit card required. Sign up and start testing immediately.',
  },
  {
    q: 'Can I use WabMeta with my existing tools?',
    a: 'WabMeta offers webhooks and a REST API for integrations. Common use cases include connecting your CRM, e-commerce store, or helpdesk to trigger automated WhatsApp messages.',
  },
];

const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  const { ref, visible } = useScrollReveal();

  return (
    <section ref={ref} className="section-padding bg-gray-50/50 dark:bg-white/[0.01]">
      <div className="max-w-2xl mx-auto px-5">

        <div className={`text-center mb-12 transition-all duration-700
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-xs font-bold text-primary-600 dark:text-primary-400
            uppercase tracking-wider mb-3">FAQ</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900
            dark:text-white leading-tight">
            Common <span className="gradient-text">questions</span>
          </h2>
        </div>

        <div className={`space-y-2 transition-all duration-700 delay-150
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {faqs.map((faq, i) => (
            <div key={i}
              className={`rounded-xl border transition-all duration-200 ${
                open === i
                  ? 'bg-white dark:bg-[#111118] border-primary-200 dark:border-primary-800/40'
                  : 'bg-white dark:bg-[#111118] border-gray-100 dark:border-white/5'
              }`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-4">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                  open === i ? 'rotate-180 text-primary-500' : ''
                }`} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;