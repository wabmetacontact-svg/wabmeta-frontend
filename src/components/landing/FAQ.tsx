// src/components/landing/FAQ.tsx
import React, { useState } from 'react';
import { Plus, MessageCircle, ArrowUpRight, Search } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', count: 8 },
    { id: 'general', label: 'General', count: 2 },
    { id: 'pricing', label: 'Pricing', count: 2 },
    { id: 'setup', label: 'Setup', count: 2 },
    { id: 'security', label: 'Security', count: 2 },
  ];

  const faqs = [
    {
      category: 'general',
      question: 'What is WabMeta and how does it work?',
      answer: "WabMeta is a WhatsApp Business platform built on Meta's official Cloud API. You sign up, connect your WhatsApp Business account (we handle the API setup), upload contacts, and start sending — campaigns, automated replies, chatbot flows, the whole thing. One dashboard for everything.",
      tag: '01',
    },
    {
      category: 'setup',
      question: "Do I need a WhatsApp Business Account?",
      answer: "Yes. But don't worry — if you don't have one, we walk you through creating it during signup. Takes about 5 minutes. You'll need a phone number that isn't currently active on WhatsApp (or you can disconnect it first).",
      tag: '02',
    },
    {
      category: 'pricing',
      question: 'How much does it cost to send messages?',
      answer: "Two layers: our platform fee (₹0 to ₹899/mo based on plan) and Meta's conversation charges (₹0.18 to ₹0.65 per conversation depending on type and country). We don't take a cut from Meta's charges — you pay them directly. Full breakdown on /pricing.",
      tag: '03',
    },
    {
      category: 'setup',
      question: 'Can I import my existing contacts?',
      answer: "Yes — CSV, Excel, or paste them in. We auto-detect duplicates, validate phone numbers, and let you tag everyone by source (e.g., 'imported-from-shopify' or 'event-attendees'). Largest import we've seen so far: 2.4 lakh contacts in one go.",
      tag: '04',
    },
    {
      category: 'pricing',
      question: 'Is there a free trial?',
      answer: "Yes. 2-day free trial, no credit card. You get 100 messages to play with, can connect your real WhatsApp number, and test all the features. If you don't upgrade, your account just becomes read-only — we don't delete your data.",
      tag: '05',
    },
    {
      category: 'security',
      question: 'How secure is my data?',
      answer: "Messages are encrypted in transit (TLS 1.3) and at rest (AES-256). We're hosted on AWS Mumbai, GDPR compliant, and we never share your contact data with anyone — not even other WabMeta customers. You can export or delete everything anytime.",
      tag: '06',
    },
    {
      category: 'general',
      question: 'Can I use WabMeta with my existing CRM?',
      answer: "Yes — native integrations with HubSpot, Zoho, Salesforce, and Shopify. For everything else, we have a REST API and webhooks. Some customers run their entire stack on our API without ever logging into our dashboard. Docs at /documentation.",
      tag: '07',
    },
    {
      category: 'security',
      question: 'What kind of support do you offer?',
      answer: "Email + WhatsApp chat support for everyone, included in every plan. Median response time last month was 14 minutes. Founders read every message — Ankit usually replies to escalations personally. No tiered support, no 'enterprise only' help.",
      tag: '08',
    },
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-white">

      {/* ✅ Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 50% 40% at 30% 20%, rgba(40, 131, 207, 0.05) 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 70% 80%, rgba(59, 130, 246, 0.04) 0%, transparent 60%)
            `,
          }}
        />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ✅ EDITORIAL HEADER */}
        <div className="grid grid-cols-12 gap-6 mb-12 lg:mb-16">
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gray-200" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 font-bold">
                Things people actually ask
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="text-gray-950">Questions you'd ask</span>
              <br />
              <span className="bg-gradient-to-r from-gray-500 to-gray-600 bg-clip-text text-transparent italic font-light">
                if we were on a call.
              </span>
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:pt-16">
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
              We pulled the top 8 questions our team gets every week. Answered honestly, no marketing fluff. Still confused? Hit us up below.
            </p>
          </div>
        </div>

        {/* ✅ CATEGORY FILTERS */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
                className={`group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  border backdrop-blur-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-[#2883CF] border-blue-500/20 text-white shadow-[0_8px_20px_rgba(40,131,207,0.2)]' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                <span>{cat.label}</span>
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full
                  ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}
                `}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ✅ FAQ ACCORDION */}
        <div className="space-y-3 mb-16">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={`${activeCategory}-${index}`}
                className={`group relative rounded-2xl overflow-hidden
                  backdrop-blur-xl border transition-all duration-500
                  ${isOpen
                    ? 'bg-white border-gray-200 shadow-[0_12px_30px_rgba(0,0,0,0.04)]'
                    : 'bg-white/60 border-gray-200/60 hover:bg-white hover:border-gray-300 hover:shadow-sm'
                  }
                `}
              >
                {isOpen && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(40, 131, 207, 0.04) 0%, transparent 70%)',
                    }}
                  />
                )}

                {isOpen && (
                  <div className="absolute top-0 left-[15%] right-[15%] h-px 
                    bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
                )}

                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="relative w-full px-6 py-5 flex items-center gap-5 text-left"
                >
                  <span className={`text-xs font-mono font-semibold flex-shrink-0 transition-colors
                    ${isOpen ? 'text-[#2883CF]' : 'text-gray-400 group-hover:text-gray-600'}
                  `}>
                    {faq.tag}
                  </span>

                  <span className={`flex-1 text-base lg:text-lg font-medium transition-colors
                    ${isOpen ? 'text-gray-950 font-semibold' : 'text-gray-700 group-hover:text-gray-950'}
                  `}>
                    {faq.question}
                  </span>

                  <div className={`relative w-8 h-8 rounded-full flex items-center justify-center
                    border backdrop-blur-xl transition-all duration-500
                    ${isOpen 
                      ? 'bg-blue-50 border-blue-200/50 rotate-45' 
                      : 'bg-gray-50 border-gray-200 group-hover:bg-gray-100'
                    }
                  `}>
                    <Plus className={`w-4 h-4 transition-colors
                      ${isOpen ? 'text-[#2883CF]' : 'text-gray-500'}
                    `} />
                  </div>
                </button>

                <div 
                  className={`grid transition-all duration-500 ease-out
                    ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                  `}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pl-[3.5rem]">
                      <div className="h-px bg-gradient-to-r from-gray-100 to-transparent mb-4" />

                      <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>

                      <div className="mt-5 flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-mono">Was this helpful?</span>
                        <button className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200
                          hover:bg-blue-50 hover:border-blue-200 hover:text-[#2883CF]
                          text-gray-500 transition-all duration-300">
                          👍 Yes
                        </button>
                        <button className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200
                          hover:bg-red-50 hover:border-red-200 hover:text-red-500
                          text-gray-500 transition-all duration-300">
                          👎 No
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ STILL HAVE QUESTIONS */}
        <div className="relative rounded-3xl overflow-hidden
          bg-white border border-gray-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)]
          p-8 lg:p-12">

          <div className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 60% 50% at 20% 50%, rgba(40, 131, 207, 0.08) 0%, transparent 60%),
                radial-gradient(ellipse 50% 40% at 80% 50%, rgba(59, 130, 246, 0.06) 0%, transparent 60%)
              `,
            }}
          />

          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%)',
            }}
          />

          <div className="relative grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 lg:col-span-8">

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4
                bg-gray-50 border border-gray-200">
                <Search className="w-3 h-3 text-[#2883CF]" />
                <span className="text-xs font-mono uppercase tracking-wider text-gray-600">
                  Couldn't find it?
                </span>
              </div>

              <h3 className="text-2xl lg:text-3xl font-bold text-gray-950 mb-3">
                Ask us anything. <span className="italic font-light text-gray-500">Anything.</span>
              </h3>
              <p className="text-gray-600 text-sm lg:text-base max-w-lg">
                A real human replies, usually within an hour. No bots, no ticket systems, no "we'll get back to you in 3-5 business days".
              </p>
            </div>

            <div className="col-span-12 lg:col-span-4 lg:text-right">
              <a
                href="https://wa.me/919310010763"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 
                  bg-gradient-to-r from-[#2883CF] to-sky-500
                  text-white px-6 py-3.5 rounded-full text-sm font-semibold
                  shadow-[0_8px_24px_rgba(40,131,207,0.25)]
                  hover:shadow-[0_12px_32px_rgba(40,131,207,0.45)]
                  hover:-translate-y-0.5
                  transition-all duration-500"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with us
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <p className="text-xs text-gray-400 mt-3 font-mono">
                Usually replies in ~14 min
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;