import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, MessageCircle, Bot, Workflow,
  MessageSquare, Users, Instagram, BarChart3, Wallet,
  Zap, Send, Check, Megaphone, ShieldCheck, Headphones, BookOpen
} from 'lucide-react';
import Logo from '../common/Logo';

// Import Campaign PNG Mockups
import whatsappCampaign from '../../assets/images/Whatsapp campaign.png';
import aiChatbot from '../../assets/images/AI chatbot.png';
import automatedWorkflow from '../../assets/images/Automated workflow.png';
import metaAdsCampaign from '../../assets/images/Meta Ads campaign.png';
import crmAndLead from '../../assets/images/CRM and lead.png';
import instagramAutomation from '../../assets/images/Instagram automation.png';
import analyticsAndReports from '../../assets/images/Analytics & Reports.png';
import sharedTeamInbox from '../../assets/images/Shared team inbox.png';

const Features = () => {
  return (
    <section className="relative pt-24 pb-12 bg-gradient-to-b from-white via-gray-50/30 to-white overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-green-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* ═══════ Section Header ═══════ */}
        <div className="grid grid-cols-12 gap-6 mb-16 lg:mb-24">
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gray-200" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 font-bold">
                Powerful Features
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-gray-950">
              <span>Everything you need to</span>{' '}
              <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent italic font-light">
                automate,
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 bg-clip-text text-transparent">
                engage & grow.
              </span>
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:pt-16">
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
              All the tools you need to build stronger relationships, delight customers and scale your business.
            </p>
          </div>
        </div>

        {/* ═══════ Hub & Spoke Layout ═══════ */}
        <div className="relative">
          
          {/* Connecting Dotted Lines (Desktop Only) */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block z-0" 
            style={{ minHeight: '900px' }}
            viewBox="0 0 1200 900"
            preserveAspectRatio="none"
          >
            {/* Top Left → Center */}
            <line x1="350" y1="200" x2="600" y2="450" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4" />
            {/* Top Right → Center */}
            <line x1="850" y1="200" x2="600" y2="450" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4" />
            {/* Middle Left → Center */}
            <line x1="280" y1="450" x2="600" y2="450" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4" />
            {/* Middle Right → Center */}
            <line x1="920" y1="450" x2="600" y2="450" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4" />
            {/* Bottom Left → Center */}
            <line x1="350" y1="700" x2="600" y2="450" stroke="#f97316" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4" />
            {/* Bottom Right → Center */}
            <line x1="850" y1="700" x2="600" y2="450" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4" />
            
            {/* Connection dots */}
            <circle cx="600" cy="450" r="4" fill="#22c55e" />
          </svg>

          {/* ═══════ Center Logo (Desktop) ═══════ */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center">
            <div className="relative">
              {/* Outer ring */}
              <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl scale-150 opacity-50" />
              
              {/* Main circle */}
              <div className="relative w-48 h-48 bg-white border-2 border-gray-100 rounded-full shadow-2xl flex flex-col items-center justify-center p-4">
                {/* Logo */}
                <Logo variant="full" theme="light" className="scale-110" />
                <div className="text-xs text-green-600 font-medium italic mt-2">
                  All-in-One Platform
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ Feature Cards Grid ═══════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-x-[280px] lg:gap-y-8 relative z-10">
            
            {/* ━━━ Card 1: WhatsApp Campaigns ━━━ */}
            <FeatureCard
              icon={<MessageCircle size={24} className="text-white" />}
              iconBg="bg-green-500"
              title="WhatsApp Campaigns"
              description="Send bulk messages, run targeted campaigns and track real-time results."
              arrowColor="text-green-500"
              preview={
                <div className="relative flex items-center justify-center h-[210px] w-full">
                  <img 
                    src={whatsappCampaign} 
                    alt="WhatsApp Campaign Preview" 
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              }
            />

            {/* ━━━ Card 2: AI Chatbot Builder ━━━ */}
            <FeatureCard
              icon={<Bot size={24} className="text-white" />}
              iconBg="bg-purple-500"
              title="AI Chatbot Builder"
              description="Build smart AI chatbots with drag & drop. Answer FAQs and close sales automatically."
              arrowColor="text-purple-500"
              cardBg="bg-purple-50/40"
              preview={
                <div className="relative flex items-center justify-center h-[280px] w-full">
                  <img 
                    src={aiChatbot} 
                    alt="AI Chatbot Preview" 
                    className="max-w-full max-h-full object-contain transition-transform duration-500 scale-110 group-hover:scale-115"
                  />
                </div>
              }
            />

            {/* ━━━ Card 3: Workflow Automation ━━━ */}
            <FeatureCard
              icon={<Workflow size={24} className="text-white" />}
              iconBg="bg-teal-500"
              title="Workflow Automation"
              description="Create powerful automation workflows with triggers, conditions, delays and actions."
              arrowColor="text-teal-500"
              preview={
                <div className="relative flex items-center justify-center h-[280px] w-full">
                  <img 
                    src={automatedWorkflow} 
                    alt="Automated Workflow Preview" 
                    className="max-w-full max-h-full object-contain transition-transform duration-500 scale-110 group-hover:scale-115"
                  />
                </div>
              }
            />

            {/* ━━━ Card 4: Meta Ads Agency ━━━ */}
            <FeatureCard
              icon={<Megaphone size={24} className="text-white" />}
              iconBg="bg-gradient-to-br from-[#0064E0] to-[#0080FF]"
              title="Meta Ads Agency"
              description="Boost your sales & brand with high-performing Facebook and Instagram ads managed by Meta certified marketing experts."
              arrowColor="text-blue-600"
              cardBg="bg-blue-50/20"
              preview={
                <div className="relative flex items-center justify-center h-[280px] w-full">
                  <img 
                    src={metaAdsCampaign} 
                    alt="Meta Ads Campaign Preview" 
                    className="max-w-full max-h-full object-contain transition-transform duration-500 scale-110 group-hover:scale-115"
                  />
                </div>
              }
            />

            {/* ━━━ Card 5: CRM & Lead Management ━━━ */}
            <FeatureCard
              icon={<Users size={24} className="text-white" />}
              iconBg="bg-orange-500"
              title="CRM & Lead Management"
              description="Organize contacts, track leads, set reminders and manage your sales pipeline easily."
              arrowColor="text-orange-500"
              cardBg="bg-orange-50/40"
              preview={
                <div className="relative flex items-center justify-center h-[280px] w-full">
                  <img 
                    src={crmAndLead} 
                    alt="CRM and Lead Preview" 
                    className="max-w-full max-h-full object-contain transition-transform duration-500 scale-110 group-hover:scale-115"
                  />
                </div>
              }
            />

            {/* ━━━ Card 6: Instagram Automation ━━━ */}
            <FeatureCard
              icon={<Instagram size={24} className="text-white" />}
              iconBg="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
              title="Instagram Automation"
              description="Automate DMs, comments, story replies and grow your Instagram engagement."
              arrowColor="text-pink-500"
              cardBg="bg-pink-50/40"
              preview={
                <div className="relative flex items-center justify-center h-[280px] w-full">
                  <img 
                    src={instagramAutomation} 
                    alt="Instagram Automation Preview" 
                    className="max-w-full max-h-full object-contain transition-transform duration-500 scale-110 group-hover:scale-115"
                  />
                </div>
              }
            />

            {/* ━━━ Card 7: Analytics & Reports ━━━ */}
            <FeatureCard
              icon={<BarChart3 size={24} className="text-white" />}
              iconBg="bg-blue-600"
              title="Analytics & Reports"
              description="Get detailed insights on delivery, reads, replies, conversions and more."
              arrowColor="text-blue-600"
              preview={
                <div className="relative flex items-center justify-center h-[280px] w-full">
                  <img 
                    src={analyticsAndReports} 
                    alt="Analytics and Reports Preview" 
                    className="max-w-full max-h-full object-contain transition-transform duration-500 scale-110 group-hover:scale-115"
                  />
                </div>
              }
            />

            {/* ━━━ Card 8: Shared Team Inbox ━━━ */}
            <FeatureCard
              icon={<MessageSquare size={24} className="text-white" />}
              iconBg="bg-blue-500"
              title="Shared Team Inbox"
              description="Manage all conversations in one place. Assign, reply and collaborate in real-time."
              arrowColor="text-blue-500"
              preview={
                <div className="relative flex items-center justify-center h-[280px] w-full">
                  <img 
                    src={sharedTeamInbox} 
                    alt="Shared Team Inbox Preview" 
                    className="max-w-full max-h-full object-contain transition-transform duration-500 scale-110 group-hover:scale-115"
                  />
                </div>
              }
            />
          </div>
        </div>

      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// Feature Card Component
// ═══════════════════════════════════════════════════
interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  arrowColor: string;
  preview: React.ReactNode;
  cardBg?: string;
}

const FeatureCard = ({ icon, iconBg, title, description, arrowColor, preview, cardBg = 'bg-white' }: FeatureCardProps) => {
  const getWatermarkColorClass = (bg: string) => {
    if (bg.includes('bg-green')) return 'text-green-500/10';
    if (bg.includes('bg-purple')) return 'text-purple-500/10';
    if (bg.includes('bg-teal')) return 'text-teal-500/10';
    if (bg.includes('bg-orange')) return 'text-orange-500/10';
    if (bg.includes('bg-pink')) return 'text-pink-500/10';
    if (bg.includes('bg-blue')) return 'text-blue-500/10';
    if (bg.includes('from-')) return 'text-blue-500/10';
    return 'text-gray-500/10';
  };

  const watermarkColorClass = getWatermarkColorClass(iconBg);

  const watermarkIcon = React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<any>, {
        size: 140,
        className: `${watermarkColorClass} absolute -left-6 -bottom-6 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`
      })
    : null;

  return (
    <div className={`group ${cardBg} border border-gray-200/80 rounded-2xl p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden`}>
      {/* Background Watermark Icon */}
      {watermarkIcon}

      <div className="grid grid-cols-2 gap-4 items-start relative z-10">
        {/* Left: Title + Description + Action */}
        <div className="flex flex-col h-full justify-between min-h-[150px]">
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-900 mb-2 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
          <div className="pt-3">
            <button className={`w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center group-hover:border-current transition-all hover:scale-110 shadow-sm ${arrowColor}`}>
              <ArrowRight size={16} className="text-current" />
            </button>
          </div>
        </div>

        {/* Right: Mini Preview */}
        <div className="relative">
          {preview}
        </div>
      </div>
    </div>
  );
};

export default Features;