import React from 'react';
import { 
  MessageCircle, Bot, MessageSquare, Instagram, 
  Users, BarChart3, Check, Send, TrendingUp,
  Zap, Image as ImageIcon, Hash, Smile, Mic
} from 'lucide-react';

const Features = () => {
  return (
    <section id="features" className="relative py-24 bg-gradient-to-b from-amber-50/30 via-white to-amber-50/30 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* ═══════ Section Header ═══════ */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <Zap size={14} className="text-orange-500" />
            <span className="text-gray-700 text-sm font-semibold tracking-wide">
              POWERFUL FEATURES
            </span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-4">
            Everything you need to{' '}
            <span className="text-green-500">grow</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            From WhatsApp campaigns to AI chatbots — all the tools you need 
            to scale your business, beautifully designed in one place.
          </p>
        </div>

        {/* ═══════ Bento Grid ═══════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          
          {/* ━━━ Card 1: WhatsApp Campaigns (Tall, 1 col x 2 rows) ━━━ */}
          <div className="md:col-span-1 md:row-span-2 bg-purple-200 rounded-3xl p-7 lg:p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 min-h-[400px] lg:min-h-[520px] flex flex-col">
            <h3 className="font-heading font-bold text-2xl lg:text-3xl text-purple-900 mb-6">
              WhatsApp<br />Campaigns
            </h3>
            
            {/* Visual: Stacked message cards */}
            <div className="flex-1 relative my-4">
              {/* Background card */}
              <div className="absolute top-4 left-4 w-44 lg:w-52 bg-white rounded-2xl shadow-lg p-3 rotate-[-8deg]">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-3 mb-2 h-16 flex items-center justify-center">
                  <span className="text-3xl">🎉</span>
                </div>
                <div className="text-[10px] font-bold text-gray-800">Summer Sale Live!</div>
                <div className="text-[9px] text-gray-500">Flat 50% off →</div>
              </div>

              {/* Middle card */}
              <div className="absolute top-12 left-8 w-44 lg:w-52 bg-white rounded-2xl shadow-xl p-3 rotate-[3deg] z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle size={14} className="text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-900">WhatsApp Business</div>
                    <div className="text-[8px] text-green-600">Sent to 45,230 users</div>
                  </div>
                </div>
                <div className="space-y-1">
                  {[
                    { label: 'Delivered', val: '44K', color: 'bg-green-500' },
                    { label: 'Read', val: '39K', color: 'bg-blue-500' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`w-1 h-3 ${s.color} rounded-full`} />
                      <span className="text-[8px] text-gray-600 flex-1">{s.label}</span>
                      <span className="text-[8px] font-bold">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Front card */}
              <div className="absolute top-20 left-12 w-44 lg:w-52 bg-white rounded-2xl shadow-2xl p-3 rotate-[-2deg] z-20">
                <div className="text-[10px] text-gray-500 mb-1">Campaign Performance</div>
                <div className="font-heading font-bold text-2xl text-gray-900 mb-1">5.2x</div>
                <div className="text-[9px] text-green-600 font-semibold">↑ ROI Boost</div>
                <svg className="w-full mt-2" height="20" viewBox="0 0 100 20">
                  <path d="M0,15 Q25,10 50,8 T100,3" stroke="#22c55e" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-purple-800 leading-relaxed mt-auto">
              Send bulk messages, track delivery, and convert with personalized templates.
            </p>
          </div>

          {/* ━━━ Card 2: AI Chatbot (Wide, 2 cols x 1 row) ━━━ */}
          <div className="md:col-span-2 bg-pink-300 rounded-3xl p-7 lg:p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 min-h-[240px] flex flex-col">
            <div className="flex justify-between items-start gap-6">
              <div className="flex-1">
                <h3 className="font-heading font-bold text-2xl lg:text-3xl text-pink-900 mb-3">
                  AI Chatbot
                </h3>
                <p className="text-sm text-pink-800 leading-relaxed max-w-xs">
                  Build smart chatbots with drag & drop. Answer FAQs and close sales automatically.
                </p>
              </div>

              {/* Visual: Chatbot conversation */}
              <div className="flex-shrink-0 w-48 lg:w-56">
                <div className="bg-white rounded-2xl p-3 shadow-xl">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">AI Assistant</div>
                      <div className="text-[9px] text-green-600 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-lg p-2 max-w-[85%]">
                      <p className="text-[10px] text-gray-700">Hi! How can I help you today? 👋</p>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-2 ml-auto max-w-[80%]">
                      <p className="text-[10px] text-purple-900">What's the price?</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 max-w-[85%]">
                      <p className="text-[10px] text-gray-700">Starts at ₹899/mo. Want a demo? 🚀</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ━━━ Card 3: Instagram Automation ━━━ */}
          <div className="md:col-span-1 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-3xl p-7 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 min-h-[240px] flex flex-col">
            <h3 className="font-heading font-bold text-2xl text-orange-900 mb-3">
              Instagram
            </h3>
            <p className="text-sm text-orange-800 leading-relaxed mb-4">
              Auto-reply to DMs and comments.
            </p>
            
            {/* Visual: Instagram comment */}
            <div className="mt-auto bg-white rounded-2xl p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-md flex items-center justify-center">
                  <Instagram size={12} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-gray-900">@user_123</span>
              </div>
              <p className="text-[10px] text-gray-700 mb-2">"What's the price?"</p>
              <div className="flex items-center gap-1 bg-pink-50 rounded-lg p-1.5">
                <Zap size={10} className="text-pink-600" />
                <span className="text-[9px] text-pink-700 font-semibold">Auto-replied in DM ✨</span>
              </div>
            </div>
          </div>

          {/* ━━━ Card 4: Team Inbox (Medium) ━━━ */}
          <div className="md:col-span-1 bg-green-200 rounded-3xl p-7 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 min-h-[240px] flex flex-col">
            <h3 className="font-heading font-bold text-2xl text-green-900 mb-3">
              Team Inbox
            </h3>
            <p className="text-sm text-green-800 leading-relaxed mb-4">
              All chats in one place.
            </p>

            {/* Visual: Chat list */}
            <div className="mt-auto bg-white rounded-2xl p-3 shadow-lg space-y-2">
              {[
                { name: 'Rahul S.', msg: 'Need help...', color: 'bg-blue-500', time: '2m' },
                { name: 'Neha K.', msg: 'Price please', color: 'bg-pink-500', time: '5m' },
                { name: 'Aman P.', msg: 'Thank you!', color: 'bg-purple-500', time: '1h' },
              ].map((chat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-6 h-6 ${chat.color} rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0`}>
                    {chat.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-gray-900 truncate">{chat.name}</div>
                    <div className="text-[9px] text-gray-500 truncate">{chat.msg}</div>
                  </div>
                  <span className="text-[8px] text-gray-400">{chat.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ━━━ Card 5: CRM & Leads (Wide) ━━━ */}
          <div className="md:col-span-2 bg-orange-300 rounded-3xl p-7 lg:p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 min-h-[280px] flex flex-col">
            
            {/* Visual on top */}
            <div className="flex-1 relative mb-5">
              {/* Pipeline cards */}
              <div className="flex gap-2 overflow-hidden">
                {[
                  { stage: 'New', count: '24', color: 'bg-yellow-400', textColor: 'text-yellow-900' },
                  { stage: 'Contacted', count: '18', color: 'bg-blue-400', textColor: 'text-blue-900' },
                  { stage: 'Qualified', count: '12', color: 'bg-purple-400', textColor: 'text-purple-900' },
                  { stage: 'Won', count: '8', color: 'bg-green-400', textColor: 'text-green-900' },
                ].map((stage, i) => (
                  <div key={i} className="flex-1 bg-white rounded-xl p-3 shadow-lg min-w-0">
                    <div className={`w-full h-1 ${stage.color} rounded-full mb-2`} />
                    <div className="text-[9px] text-gray-500 mb-1">{stage.stage}</div>
                    <div className={`font-heading font-bold text-xl ${stage.textColor}`}>{stage.count}</div>
                  </div>
                ))}
              </div>

              {/* Lead card */}
              <div className="mt-3 bg-white rounded-xl p-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    RS
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-900">Rohit Sharma</div>
                    <div className="text-[10px] text-gray-500">Interested in Pro Plan</div>
                  </div>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                    New
                  </span>
                </div>
              </div>
            </div>

            <h3 className="font-heading font-bold text-2xl lg:text-3xl text-orange-950 mb-2">
              CRM & Leads
            </h3>
            <p className="text-sm text-orange-900 leading-relaxed">
              Track leads, manage pipeline, and convert prospects into customers.
            </p>
          </div>

          {/* ━━━ Card 6: Analytics ━━━ */}
          <div className="md:col-span-1 bg-blue-200 rounded-3xl p-7 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 min-h-[280px] flex flex-col">
            <h3 className="font-heading font-bold text-2xl text-blue-900 mb-3">
              Analytics
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed mb-4">
              Real-time insights & reports.
            </p>

            {/* Visual: Stats */}
            <div className="mt-auto bg-white rounded-2xl p-3 shadow-lg">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <div className="text-[9px] text-gray-500">Sent</div>
                  <div className="font-heading font-bold text-base text-gray-900">125K</div>
                  <div className="text-[8px] text-green-600">↑ 12.5%</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500">Reads</div>
                  <div className="font-heading font-bold text-base text-gray-900">98K</div>
                  <div className="text-[8px] text-green-600">↑ 18.3%</div>
                </div>
              </div>
              <svg className="w-full" height="30" viewBox="0 0 120 30">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,25 Q20,20 35,15 T70,10 T105,5 L120,3 L120,30 L0,30 Z" fill="url(#chartGrad)"/>
                <path d="M0,25 Q20,20 35,15 T70,10 T105,5 L120,3" stroke="#3b82f6" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>

          {/* ━━━ Card 7: Wallet & Billing ━━━ */}
          <div className="md:col-span-1 bg-emerald-200 rounded-3xl p-7 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 min-h-[240px] flex flex-col">
            <h3 className="font-heading font-bold text-2xl text-emerald-900 mb-3">
              Wallet
            </h3>
            <p className="text-sm text-emerald-800 leading-relaxed mb-4">
              Manage balance & billing.
            </p>

            {/* Visual: Wallet card */}
            <div className="mt-auto">
              <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-4 shadow-xl text-white">
                <div className="text-[10px] text-gray-300 mb-1">Current Balance</div>
                <div className="font-heading font-bold text-2xl mb-3">₹8,450</div>
                <div className="flex items-center justify-between">
                  <div className="text-[9px] text-gray-400">**** 4242</div>
                  <button className="bg-white text-gray-900 text-[9px] font-bold px-3 py-1 rounded-full">
                    Add Money
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ━━━ Card 8: Automation Workflows (Wide) ━━━ */}
          <div className="md:col-span-2 bg-violet-200 rounded-3xl p-7 lg:p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 min-h-[240px] flex flex-col">
            <div className="flex justify-between items-start gap-6">
              <div className="flex-1">
                <h3 className="font-heading font-bold text-2xl lg:text-3xl text-violet-900 mb-3">
                  Automation Flows
                </h3>
                <p className="text-sm text-violet-800 leading-relaxed max-w-xs">
                  Create powerful workflows with triggers, conditions, delays and actions.
                </p>
              </div>

              {/* Visual: Flow nodes */}
              <div className="flex-shrink-0 w-44 space-y-2">
                {[
                  { label: 'When User Sends', sub: '"Hi"', icon: Zap, color: 'bg-yellow-400', border: 'border-yellow-300' },
                  { label: 'AI Reply', sub: 'Welcome!', icon: Bot, color: 'bg-purple-500', border: 'border-purple-300' },
                  { label: 'Assign Agent', sub: 'Sales Team', icon: Users, color: 'bg-pink-500', border: 'border-pink-300' },
                ].map((node, i) => (
                  <div key={i}>
                    <div className={`bg-white border-2 ${node.border} rounded-xl p-2 shadow-md flex items-center gap-2`}>
                      <div className={`w-7 h-7 ${node.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <node.icon size={12} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-gray-500">{node.label}</div>
                        <div className="text-[10px] font-bold text-gray-900 truncate">{node.sub}</div>
                      </div>
                    </div>
                    {i < 2 && (
                      <div className="flex justify-center my-1">
                        <div className="w-px h-2 bg-violet-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;