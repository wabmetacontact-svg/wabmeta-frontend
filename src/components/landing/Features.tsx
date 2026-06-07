import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, MessageCircle, Bot, Workflow,
  MessageSquare, Users, Instagram, BarChart3, Wallet,
  Zap, Send, Check
} from 'lucide-react';

const Features = () => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-gray-50/30 to-white overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-green-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* ═══════ Section Header ═══════ */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-6">
            <Sparkles size={16} className="text-green-600" />
            <span className="text-green-700 text-sm font-semibold tracking-wide">
              POWERFUL FEATURES
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-6 max-w-4xl mx-auto">
            Everything you need to{' '}
            <br className="hidden md:block" />
            <span className="text-green-500">automate</span>
            <span className="text-gray-900">, </span>
            <span className="text-blue-500">engage</span>
            <span className="text-gray-900"> & </span>
            <span className="text-pink-500">grow</span>
          </h2>

          {/* Subheading */}
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            All the tools you need to build stronger relationships, 
            delight customers and scale your business.
          </p>
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
              <div className="relative w-48 h-48 bg-white border-2 border-gray-100 rounded-full shadow-2xl flex flex-col items-center justify-center">
                {/* Logo */}
                <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                  <MessageCircle size={36} className="text-white" />
                </div>
                <div className="font-heading font-bold text-xl text-gray-900">
                  WabMeta
                </div>
                <div className="text-xs text-green-600 font-medium italic mt-0.5">
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
                <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Send size={12} className="text-green-500" />
                      <span className="text-xs font-semibold text-gray-900">Summer Sale Campaign</span>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Completed
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Delivered', value: '45,000', percent: 98, color: 'bg-green-500' },
                      { label: 'Read', value: '39,000', percent: 83, color: 'bg-green-400' },
                      { label: 'Replies', value: '8,200', percent: 18, color: 'bg-green-300' },
                    ].map((stat, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-gray-500">{stat.label}</span>
                          <span className="font-semibold text-gray-900">{stat.value}</span>
                          <span className="text-gray-400">{stat.percent}%</span>
                        </div>
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
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
                <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-purple-100 rounded-md flex items-center justify-center">
                        <Bot size={10} className="text-purple-600" />
                      </div>
                      <span className="text-xs font-semibold text-gray-900">AI Assistant</span>
                    </div>
                    <span className="text-gray-400">⋯</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-[11px] text-gray-700">Hi there! 👋</p>
                      <p className="text-[11px] text-gray-700">How can I help you today?</p>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-2 ml-auto w-fit">
                      <p className="text-[11px] text-purple-900">What is the price?</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-[11px] text-gray-700">The price starts from ₹999. Would you like to see our catalog?</p>
                      <div className="flex items-center justify-end gap-0.5 mt-1">
                        <span className="text-[8px] text-gray-400">11:30 AM</span>
                        <Check size={8} className="text-blue-500" />
                        <Check size={8} className="text-blue-500 -ml-1.5" />
                      </div>
                    </div>
                  </div>
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
                <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="w-6 h-6 bg-yellow-400 rounded-md flex items-center justify-center flex-shrink-0">
                      <Zap size={12} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">When User Sends</p>
                      <p className="text-xs font-semibold text-gray-900">"Hi / Hello"</p>
                    </div>
                  </div>
                  <div className="flex justify-center text-gray-300 text-xs">↓</div>
                  <div className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center flex-shrink-0">
                      <Bot size={12} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-purple-600 font-medium">AI Reply</p>
                      <p className="text-xs font-semibold text-gray-900">Welcome! How can I help you?</p>
                    </div>
                  </div>
                  <div className="flex justify-center text-gray-300 text-xs">↓</div>
                  <div className="flex items-center gap-2 p-2 bg-pink-50 border border-pink-200 rounded-lg">
                    <div className="w-6 h-6 bg-pink-500 rounded-md flex items-center justify-center flex-shrink-0">
                      <Users size={12} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-pink-600 font-medium">Assign to Agent</p>
                      <p className="text-xs font-semibold text-gray-900">Sales Team</p>
                    </div>
                  </div>
                </div>
              }
            />

            {/* ━━━ Card 4: Shared Team Inbox ━━━ */}
            <FeatureCard
              icon={<MessageSquare size={24} className="text-white" />}
              iconBg="bg-blue-500"
              title="Shared Team Inbox"
              description="Manage all conversations in one place. Assign, reply and collaborate in real-time."
              arrowColor="text-blue-500"
              preview={
                <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-900">All Conversations</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">12</span>
                    </div>
                  </div>
                  <div className="flex gap-3 text-[10px] mb-3 pb-2 border-b border-gray-100">
                    <span className="text-gray-900 font-semibold">Mine <span className="text-gray-400">8</span></span>
                    <span className="text-gray-500">Unassigned <span className="text-gray-400">12</span></span>
                    <span className="text-gray-500">Team <span className="text-gray-400">24</span></span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Rahul Verma', msg: 'Hi, I want to know...', time: '2m', color: 'bg-blue-500' },
                      { name: 'Neha Singh', msg: 'Please share the price', time: '5m', color: 'bg-pink-500' },
                      { name: 'Aman Khan', msg: 'Thank you!', time: '1h', color: 'bg-purple-500' },
                    ].map((chat, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-6 h-6 ${chat.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                          {chat.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-gray-900 truncate">{chat.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{chat.msg}</p>
                        </div>
                        <span className="text-[9px] text-gray-400">{chat.time}</span>
                      </div>
                    ))}
                  </div>
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
                <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      New Lead
                    </span>
                    <span className="text-[10px] text-gray-400">2m ago</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">
                      RS
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Rohit Sharma</p>
                      <p className="text-[10px] text-gray-500">+91 98765 43210</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-700 mb-3 pb-3 border-b border-gray-100">
                    Interested in Gold Plan
                  </p>
                  <div className="flex items-center gap-2">
                    {[
                      { label: 'New', active: true, color: 'bg-orange-400' },
                      { label: 'Contacted', active: true, color: 'bg-yellow-400' },
                      { label: 'Qualified', active: true, color: 'bg-blue-400' },
                      { label: 'Won', active: false, color: 'bg-gray-300' },
                    ].map((stage, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 ${stage.color} rounded-full`} />
                        <span className={`text-[9px] ${stage.active ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                          {stage.label}
                        </span>
                      </div>
                    ))}
                  </div>
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
                <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full" />
                      <span className="text-xs font-semibold text-gray-900">krrish.store</span>
                    </div>
                    <span className="text-[10px] text-gray-400">2h</span>
                  </div>
                  <div className="space-y-2 mb-3">
                    <p className="text-[11px] text-gray-700">
                      <span className="font-semibold">Comment:</span> Price?
                    </p>
                    <p className="text-[11px] text-pink-600">
                      <span className="font-semibold">✨ Auto-reply:</span> Check your DM 📩
                    </p>
                    <p className="text-[10px] text-gray-400">Just now</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-[9px] text-gray-500">Replies</p>
                      <p className="text-sm font-bold text-gray-900">1,234</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500">Engagement</p>
                      <p className="text-sm font-bold text-gray-900">18.7%</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500">New Leads</p>
                      <p className="text-sm font-bold text-gray-900">342</p>
                    </div>
                  </div>
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
                <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                  <p className="text-[10px] text-gray-500 mb-2">Overview (This Month)</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'Sent', value: '125K', change: '+12.5%' },
                      { label: 'Delivered', value: '122K', change: '+11.8%' },
                      { label: 'Read', value: '98K', change: '+18.3%' },
                    ].map((stat, i) => (
                      <div key={i}>
                        <p className="text-[9px] text-gray-500">{stat.label}</p>
                        <p className="text-xs font-bold text-gray-900">{stat.value}</p>
                        <p className="text-[8px] text-green-500 font-semibold">↑ {stat.change}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pb-2 border-t border-gray-100 pt-2">
                    <div>
                      <p className="text-[9px] text-gray-500">Replies</p>
                      <p className="text-xs font-bold text-gray-900">24K</p>
                      <p className="text-[8px] text-green-500 font-semibold">↑ +19.6%</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500">Conversions</p>
                      <p className="text-xs font-bold text-gray-900">4.6K</p>
                      <p className="text-[8px] text-green-500 font-semibold">↑ +13.7%</p>
                    </div>
                  </div>
                  {/* Mini chart */}
                  <svg className="w-full mt-2" height="30" viewBox="0 0 120 30">
                    <polyline
                      points="0,25 15,20 30,22 45,15 60,18 75,10 90,12 105,5 120,8"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              }
            />

            {/* ━━━ Card 8: Wallet & Billing ━━━ */}
            <FeatureCard
              icon={<Wallet size={24} className="text-white" />}
              iconBg="bg-green-600"
              title="Wallet & Billing"
              description="Load wallet, manage balance, view transactions and monitor usage in real-time."
              arrowColor="text-green-600"
              preview={
                <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-500">Current Balance</p>
                      <p className="text-lg font-bold text-gray-900">₹8,450.00</p>
                    </div>
                    <button className="bg-green-500 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg">
                      Add Money
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-2">Recent Transaction</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Campaign - Summer Sale</p>
                      <p className="text-[10px] text-gray-400">Today, 11:30 AM</p>
                    </div>
                    <span className="text-sm font-bold text-red-500">- ₹2,450.00</span>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* ═══════ CTA Button ═══════ */}
        <div className="flex justify-center mt-16">
          <Link
            to="/features"
            className="group inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3.5 rounded-full transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
          >
            <Zap size={18} className="text-green-400" />
            Explore All Features
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
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
  return (
    <div className={`group ${cardBg} border border-gray-200/80 rounded-2xl p-5 hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1`}>
      <div className="grid grid-cols-2 gap-4 items-start">
        
        {/* Left: Icon + Title + Description */}
        <div>
          <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center shadow-md mb-3`}>
            {icon}
          </div>
          <h3 className="font-heading font-bold text-base text-gray-900 mb-1.5 leading-tight">
            {title}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            {description}
          </p>
          <button className={`w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center group-hover:border-current transition-all hover:scale-110 ${arrowColor}`}>
            <ArrowRight size={14} className="text-current" />
          </button>
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