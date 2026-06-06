import React from 'react';
import {
  Bot,
  Zap,
  Send,
  Instagram,
  Sparkles,
} from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden bg-white">
      
      {/* ✅ Premium Background with dot grid & radial glow blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        
        {/* Dot grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: `radial-gradient(rgba(40, 131, 207, 0.15) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Soft floating blur blobs */}
        <div
          className="absolute top-1/4 left-10 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, rgba(40,131,207,0.3) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-10 w-[700px] h-[700px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Badge & Editorial Header */}
        <div className="text-center mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2883CF]/10 border border-[#2883CF]/20 text-[#2883CF] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Capabilities
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-950 max-w-3xl mx-auto leading-[1.1]">
            Tons of features to grow your business
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
            Seven powerful tools deeply integrated into one central dashboard. Configure once, run forever.
          </p>
        </div>

        {/* Bento Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          
          {/* 1. BULK MESSAGING (2 columns wide) */}
          <div className="relative md:col-span-2 rounded-3xl overflow-hidden border border-gray-200/80 bg-white/70 backdrop-blur-md p-8 flex flex-col justify-between min-h-[460px] shadow-[0_12px_30px_rgba(0,0,0,0.03)] group transition-all duration-500 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1">
            
            {/* Visual Header */}
            <div className="relative h-56 w-full bg-slate-50/50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-sky-500/2 to-transparent" />
              
              {/* Campaign Status Card Mockup */}
              <div className="relative bg-white border border-gray-200/80 rounded-2xl shadow-lg p-5 w-full max-w-[380px] transform group-hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#2883CF]/15 flex items-center justify-center">
                      <Send className="w-4.5 h-4.5 text-[#2883CF]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">Festival Promo Campaign</div>
                      <div className="text-[9px] text-gray-400 font-mono">ID: WAB-9043</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[9px] font-bold text-[#2883CF] animate-pulse">Sending</span>
                </div>
                
                {/* Stats Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Progress: 84% completed</span>
                    <span className="font-bold text-gray-800">42,000 / 50,000 sent</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#2883CF] to-sky-500 rounded-full transition-all duration-1000" style={{ width: '84%' }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                    <div>
                      <div className="text-xs font-bold text-gray-900">99.2%</div>
                      <div className="text-[8px] text-gray-500 uppercase font-bold">Delivery</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">76.4%</div>
                      <div className="text-[8px] text-gray-500 uppercase font-bold">Read rate</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">18.5%</div>
                      <div className="text-[8px] text-gray-500 uppercase font-bold">Replies</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#2883CF] uppercase">Campaigns</span>
                <span className="text-xs font-mono font-bold text-gray-400">2.1M Sent · +18%</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-950 mb-2 group-hover:text-[#2883CF] transition-colors">
                Bulk Messaging
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                Send personalized messages to thousands of contacts instantly. Smart rate limiting ensures safe, high-speed delivery of 50,000+ messages per hour.
              </p>
            </div>
          </div>

          {/* 2. LIVE INBOX (1 column wide) */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 bg-white/70 backdrop-blur-md p-8 flex flex-col justify-between min-h-[460px] shadow-[0_12px_30px_rgba(0,0,0,0.03)] group transition-all duration-500 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1">
            
            {/* Visual Header */}
            <div className="relative h-56 w-full bg-slate-50/50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-sky-500/2 to-transparent" />
              
              {/* Inbox Mockup */}
              <div className="relative w-full max-w-[220px] bg-white border border-gray-200/80 rounded-xl shadow-md p-3 space-y-2.5 transform group-hover:scale-[1.03] transition-transform duration-500">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                  <span className="text-[10px] font-bold text-gray-900">Active Conversations</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                
                {/* Chat items */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-1.5 bg-blue-50/50 rounded-lg border border-blue-100/30">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#2883CF] to-sky-500 text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0">RV</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-bold text-gray-900 truncate">Rahul Verma</div>
                      <div className="text-[8px] text-[#2883CF] truncate font-medium">Assigned to you</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 opacity-60">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-500 to-gray-600 text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0">PS</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-bold text-gray-900 truncate">Priya Sharma</div>
                      <div className="text-[8px] text-gray-500 truncate">Quick reply sent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#2883CF] uppercase">Conversations</span>
                <span className="text-xs font-mono font-bold text-gray-400">16 Agents · Live</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-950 mb-2 group-hover:text-[#2883CF] transition-colors">
                Live Inbox
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                A collaborative team inbox for your entire support staff. Assign chats to agents, add internal notes, and use pre-saved quick replies.
              </p>
            </div>
          </div>

          {/* 3. AI CHATBOT (1 column wide) */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 bg-white/70 backdrop-blur-md p-8 flex flex-col justify-between min-h-[460px] shadow-[0_12px_30px_rgba(0,0,0,0.03)] group transition-all duration-500 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1">
            
            {/* Visual Header */}
            <div className="relative h-56 w-full bg-slate-50/50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-sky-500/2 to-transparent" />
              
              {/* Chatbot flow */}
              <div className="relative w-full max-w-[220px] space-y-2 transform group-hover:scale-[1.03] transition-transform duration-500">
                <div className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-md flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-900">AI Prompt Router</div>
                    <div className="text-[8px] text-gray-500 font-mono">OpenAI GPT-4o</div>
                  </div>
                </div>
                {/* Connection Line */}
                <div className="w-0.5 h-4 bg-gradient-to-b from-indigo-500 to-[#2883CF] mx-auto" />
                <div className="bg-white border border-gray-200/80 rounded-xl p-2.5 shadow-md text-center text-[9px] font-semibold text-[#2883CF] border-dashed border-[#2883CF]/40">
                  🎯 Qualify Prospect
                </div>
              </div>
            </div>

            {/* Content info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#2883CF] uppercase">Automation</span>
                <span className="text-xs font-mono font-bold text-gray-400">24/7 · AI Powered</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-950 mb-2 group-hover:text-[#2883CF] transition-colors">
                AI Chatbot
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Visual drag-and-drop conversational chatbot builder. Easily connect OpenAI, Gemini, or custom webhook models to handle complex customer queries.
              </p>
            </div>
          </div>

          {/* 4. SMART WORKFLOWS (1 column wide) */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 bg-white/70 backdrop-blur-md p-8 flex flex-col justify-between min-h-[460px] shadow-[0_12px_30px_rgba(0,0,0,0.03)] group transition-all duration-500 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1">
            
            {/* Visual Header */}
            <div className="relative h-56 w-full bg-slate-50/50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-sky-500/2 to-transparent" />
              
              {/* Trigger diagram */}
              <div className="relative w-full max-w-[220px] bg-white border border-gray-200/80 rounded-xl shadow-md p-3.5 space-y-3 transform group-hover:scale-[1.03] transition-transform duration-500">
                <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100 text-[10px] font-bold text-gray-900">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                  <span>Workflow Trigger</span>
                </div>
                <div className="space-y-2 text-[9px]">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Trigger: Keyword 'Price'</span>
                    <span className="text-emerald-500 font-bold">Active</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-gray-100 rounded-lg font-mono text-gray-500">
                    Action: Send price_list template
                  </div>
                </div>
              </div>
            </div>

            {/* Content info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#2883CF] uppercase">Automation</span>
                <span className="text-xs font-mono font-bold text-gray-400">90% Saved · +42%</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-950 mb-2 group-hover:text-[#2883CF] transition-colors">
                Smart Workflows
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Trigger automations based on keywords, schedules, or API hooks. Create advanced branches with if-then-else conditions using 50+ templates.
              </p>
            </div>
          </div>

          {/* 5. ANALYTICS (1 column wide) */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 bg-white/70 backdrop-blur-md p-8 flex flex-col justify-between min-h-[460px] shadow-[0_12px_30px_rgba(0,0,0,0.03)] group transition-all duration-500 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1">
            
            {/* Visual Header */}
            <div className="relative h-56 w-full bg-slate-50/50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-sky-500/2 to-transparent" />
              
              {/* Graphic Chart */}
              <div className="relative w-full max-w-[220px] bg-white border border-gray-200/80 rounded-xl shadow-md p-4 space-y-3 transform group-hover:scale-[1.03] transition-transform duration-500">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-gray-900">Campaign Performance</span>
                  <span className="text-[9px] text-emerald-500 font-bold font-mono">+2.3%</span>
                </div>
                
                {/* SVG Curve Line Graph */}
                <svg className="w-full h-16" viewBox="0 0 100 40">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2883CF" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#2883CF" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0,35 Q15,30 30,20 T60,15 T90,5 L100,2 L100,40 L0,40 Z" fill="url(#chartGrad)" />
                  <path d="M0,35 Q15,30 30,20 T60,15 T90,5 L100,2" fill="none" stroke="#2883CF" strokeWidth="2" />
                  <circle cx="100" cy="2" r="2.5" fill="#2883CF" className="animate-pulse" />
                </svg>
              </div>
            </div>

            {/* Content info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#2883CF] uppercase">Insights</span>
                <span className="text-xs font-mono font-bold text-gray-400">99.7% Deliv · +2.3%</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-950 mb-2 group-hover:text-[#2883CF] transition-colors">
                Analytics
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Real-time delivery performance statistics. Monitor campaign delivery statuses, read receipts, and agent reply speeds instantly.
              </p>
            </div>
          </div>

          {/* 6. TEAM CRM (1 column wide) */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 bg-white/70 backdrop-blur-md p-8 flex flex-col justify-between min-h-[460px] shadow-[0_12px_30px_rgba(0,0,0,0.03)] group transition-all duration-500 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1">
            
            {/* Visual Header */}
            <div className="relative h-56 w-full bg-slate-50/50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-sky-500/2 to-transparent" />
              
              {/* Stacks profiles */}
              <div className="relative w-full max-w-[200px] space-y-2 transform group-hover:scale-[1.03] transition-transform duration-500">
                <div className="bg-white border border-gray-200/80 rounded-xl p-2.5 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-[9px] flex items-center justify-center">Ankit</div>
                    <span className="text-[9px] font-bold text-gray-800">Admin Role</span>
                  </div>
                  <span className="text-[8px] text-gray-400">Owner</span>
                </div>
                <div className="bg-white border border-gray-200/80 rounded-xl p-2.5 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-[9px] flex items-center justify-center">Priya</div>
                    <span className="text-[9px] font-bold text-gray-800">Agent Role</span>
                  </div>
                  <span className="text-[8px] text-[#2883CF] font-bold">12 Chats</span>
                </div>
              </div>
            </div>

            {/* Content info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#2883CF] uppercase">Collaboration</span>
                <span className="text-xs font-mono font-bold text-gray-400">12+ Team · Pro</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-950 mb-2 group-hover:text-[#2883CF] transition-colors">
                Team CRM
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Manage your leads, team members, and customer relations in one central database. Assign agent permissions and roles dynamically.
              </p>
            </div>
          </div>

          {/* 7. INSTAGRAM DMs (2 columns wide - Dark Blue Bento Card) */}
          <div className="relative md:col-span-2 rounded-3xl overflow-hidden border border-[#2883CF]/20 bg-gradient-to-br from-[#0a0e27] via-[#0c1233] to-[#0a0e27] p-8 flex flex-col justify-between min-h-[460px] shadow-[0_20px_50px_rgba(40,131,207,0.15)] group transition-all duration-500 hover:shadow-2xl">
            
            {/* Visual Header */}
            <div className="relative h-56 w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-center overflow-hidden mb-6">
              {/* Neon background glows */}
              <div className="absolute w-40 h-40 rounded-full bg-[#e1306c]/10 filter blur-xl opacity-60 top-5 left-10" />
              <div className="absolute w-40 h-40 rounded-full bg-[#2883CF]/15 filter blur-xl opacity-60 bottom-5 right-10" />
              
              {/* Instagram Feed / DM Mockup */}
              <div className="relative w-full max-w-[400px] grid grid-cols-12 gap-4 items-center px-4 transform group-hover:scale-[1.02] transition-transform duration-500">
                {/* Left Side: DM window */}
                <div className="col-span-7 bg-[#0f172a]/95 border border-white/[0.1] rounded-xl p-3 shadow-lg">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08] mb-2">
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span className="text-[9px] font-bold text-white font-mono">Instagram Direct</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-1.5 bg-white/5 rounded-lg text-[9px] text-gray-300">
                      "Loved your post! Can I get price?"
                    </div>
                    <div className="p-1.5 bg-[#e1306c]/15 border border-[#e1306c]/30 text-white rounded-lg text-[9px] text-right font-medium">
                      "Sure! Sent details to DMs 📩"
                    </div>
                  </div>
                </div>

                {/* Right Side: Stat metrics */}
                <div className="col-span-5 space-y-2">
                  <div className="bg-white/95 rounded-lg p-2.5 shadow-md">
                    <div className="text-[8px] font-bold text-gray-500 uppercase">Auto answered</div>
                    <div className="text-sm font-bold text-gray-900 mt-0.5">3.2K/day</div>
                  </div>
                  <div className="bg-white/95 rounded-lg p-2.5 shadow-md">
                    <div className="text-[8px] font-bold text-gray-500 uppercase">Growth rate</div>
                    <div className="text-sm font-bold text-gray-[#2883CF] mt-0.5">+67%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#e1306c] uppercase">Social Integration</span>
                <span className="text-xs font-mono font-bold text-white/50">3.2K Replies · +67%</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                Instagram DMs
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed max-w-2xl">
                Automatically reply to DMs, story mentions, and post comments. Seamlessly manage Instagram customer engagement and queries alongside WhatsApp in one unified workspace.
              </p>
            </div>
          </div>

        </div>

        {/* Minimal Bottom Tagline */}
        <div className="mt-20 text-center">
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Configure automated responses, keyword triggers, and team permissions directly inside your settings.
          </p>
        </div>

      </div>
    </section>
  );
};

export default Features;