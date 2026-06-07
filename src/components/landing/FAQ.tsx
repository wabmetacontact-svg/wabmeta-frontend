import { useState } from 'react';
import { 
  ChevronDown, HelpCircle, MessageCircle, CreditCard, 
  Settings, Shield, Sparkles, Mail
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // General
  {
    category: 'general',
    question: 'Do I need a WhatsApp Business API account to use WabMeta?',
    answer: 'Yes, WabMeta uses the official WhatsApp Business API (Meta Cloud API). Don\'t worry — we guide you through the entire setup process step-by-step. It typically takes 30-60 minutes to get approved and connected, and our team is available to help if you get stuck anywhere.',
  },
  {
    category: 'general',
    question: 'How is WabMeta different from other tools?',
    answer: 'WabMeta is the only platform that combines WhatsApp + Instagram automation + AI chatbots in one dashboard. We\'re built by founders who use the product daily, and our support response time is under 1 hour. No bloated features, no enterprise sales calls — just powerful tools that work.',
  },
  {
    category: 'general',
    question: 'Is there a free trial?',
    answer: 'Yes! We offer a 2-day free demo with no credit card required. You get access to test all features, send 100 messages, and explore the platform. After that, you can choose any paid plan starting at ₹899/month.',
  },

  // Features
  {
    category: 'features',
    question: 'How does the AI chatbot work?',
    answer: 'Our visual drag-and-drop builder lets you create conversation flows without any coding. Add message nodes, condition checks, delays, buttons, and AI-powered responses. The AI node uses GPT-4 to answer questions intelligently based on your training data and business context.',
  },
  {
    category: 'features',
    question: 'Can I connect multiple WhatsApp numbers?',
    answer: 'Yes! Depending on your plan, you can connect multiple WhatsApp Business numbers to a single dashboard. Each number gets its own inbox, campaigns, contacts, and analytics. The 1-Year plan includes 2 WhatsApp accounts by default.',
  },
  {
    category: 'features',
    question: 'How does Instagram automation work?',
    answer: 'We use the official Instagram Graph API. Connect your Instagram Business account and set up triggers — like "when someone comments a specific keyword, send them a DM automatically." Story reply automation, comment-to-DM, and post management — all within Meta\'s platform policies.',
  },

  // Pricing
  {
    category: 'pricing',
    question: 'What is the pricing for WhatsApp messages?',
    answer: 'Your subscription covers platform features. WhatsApp charges separately per conversation (not per message) — rates vary by country and conversation type. These Meta charges are deducted from your wallet balance which you can top-up anytime via Razorpay.',
  },
  {
    category: 'pricing',
    question: 'Can I switch plans anytime?',
    answer: 'Absolutely! You can upgrade or downgrade your plan anytime from your dashboard. When you upgrade, the new features are unlocked instantly. When you downgrade, the change takes effect at the next billing cycle.',
  },
  {
    category: 'pricing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods through Razorpay — Credit/Debit cards (Visa, Mastercard, RuPay, Amex), UPI, Net Banking, Wallets (Paytm, PhonePe, Amazon Pay), and EMI options. All payments are 100% secure.',
  },

  // Technical
  {
    category: 'technical',
    question: 'Is it safe? Will my WhatsApp account get banned?',
    answer: 'Absolutely safe. We use Meta\'s official Cloud API, not any unofficial methods or third-party bots. Your account is fully compliant with WhatsApp\'s terms of service. We\'ve never had an account banned due to our platform — over 10,000 businesses trust us.',
  },
  {
    category: 'technical',
    question: 'Do you offer API access?',
    answer: 'Yes, our 6-Month and 1-Year plans include full API access. You can integrate WabMeta with your CRM, e-commerce platform, or any custom application. We provide detailed documentation, webhook support, and developer-friendly endpoints.',
  },

  // Support
  {
    category: 'support',
    question: 'What kind of support do you provide?',
    answer: 'All plans include email support with under 1-hour response time during business hours. Priority and Annual plan customers get dedicated Slack/WhatsApp support. Both founders personally help with onboarding for new customers — we believe in founder-led support.',
  },
];

const categories = [
  { id: 'all', label: 'All Questions', icon: HelpCircle, color: 'text-gray-700' },
  { id: 'general', label: 'General', icon: Sparkles, color: 'text-blue-600' },
  { id: 'features', label: 'Features', icon: MessageCircle, color: 'text-green-600' },
  { id: 'pricing', label: 'Pricing', icon: CreditCard, color: 'text-purple-600' },
  { id: 'technical', label: 'Technical', icon: Settings, color: 'text-orange-600' },
  { id: 'support', label: 'Support', icon: Shield, color: 'text-pink-600' },
];

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

  return (
    <section id="faq" className="relative py-24 bg-gradient-to-b from-gray-50/30 via-white to-gray-50/30 overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-green-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* ═══════ Section Header ═══════ */}
        <div className="grid grid-cols-12 gap-6 mb-16 lg:mb-24">
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gray-200" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 font-bold">
                Frequently Asked Questions
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-gray-950">
              <span>Got questions?</span>{' '}
              <br />
              <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 bg-clip-text text-transparent">
                We've got answers.
              </span>
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:pt-16">
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
              Everything you need to know about WabMeta. Can't find what you're looking for? Just{' '}
              <a href="mailto:support@wabmeta.com" className="text-green-700 hover:text-green-800 font-semibold underline">
                email us
              </a>
              .
            </p>
          </div>
        </div>

        {/* ═══════ Main Layout: Sidebar + FAQ Content ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          
          {/* ━━━ LEFT: Category Sidebar ━━━ */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              {/* Mobile: Horizontal scroll */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:overflow-visible">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  const count = cat.id === 'all' 
                    ? faqs.length 
                    : faqs.filter(f => f.category === cat.id).length;
                  
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setOpenIndex(0);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap lg:w-full ${
                        isActive
                          ? 'bg-gray-900 text-white shadow-lg'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-white' : cat.color} />
                      <span className="flex-1 text-left">{cat.label}</span>
                      <span className={`text-xs font-normal ${
                        isActive ? 'text-gray-400' : 'text-gray-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Help Card (Desktop only) */}
              <div className="hidden lg:block mt-6 p-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl text-white shadow-lg">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
                  <Mail size={20} className="text-white" />
                </div>
                <h4 className="font-heading font-bold text-base mb-1">
                  Still have questions?
                </h4>
                <p className="text-xs text-green-50 mb-4 leading-relaxed">
                  Both founders personally reply to support emails — usually within an hour.
                </p>
                <a
                  href="mailto:support@wabmeta.com"
                  className="block text-center bg-white text-green-600 hover:bg-gray-50 text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Email Support
                </a>
              </div>
            </div>
          </div>

          {/* ━━━ RIGHT: FAQ Accordion ━━━ */}
          <div className="lg:col-span-9">
            <div className="space-y-3">
              {filteredFaqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div
                    key={`${faq.category}-${i}`}
                    className={`rounded-2xl transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'bg-white border-2 border-green-500/30 shadow-lg'
                        : 'bg-white border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        {/* Q Badge */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-heading font-bold text-sm transition-colors ${
                          isOpen
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        }`}>
                          Q
                        </div>
                        
                        <span className={`font-semibold text-base md:text-lg leading-snug pt-1 transition-colors ${
                          isOpen ? 'text-gray-900' : 'text-gray-800'
                        }`}>
                          {faq.question}
                        </span>
                      </div>
                      
                      {/* Toggle Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isOpen
                          ? 'bg-green-500 text-white rotate-180'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}>
                        <ChevronDown size={16} strokeWidth={2.5} />
                      </div>
                    </button>
                    
                    {/* Answer */}
                    <div 
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-5">
                        <div className="ml-12 pt-2 border-t border-gray-100">
                          <p className="text-gray-600 leading-relaxed text-sm md:text-base pt-4">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA (Mobile only) */}
            <div className="lg:hidden mt-8 p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl text-white shadow-lg text-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 mx-auto">
                <Mail size={22} className="text-white" />
              </div>
              <h4 className="font-heading font-bold text-lg mb-2">
                Still have questions?
              </h4>
              <p className="text-sm text-green-50 mb-4">
                Both founders personally reply to support emails.
              </p>
              <a
                href="mailto:support@wabmeta.com"
                className="inline-block bg-white text-green-600 hover:bg-gray-50 text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Email Support →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;