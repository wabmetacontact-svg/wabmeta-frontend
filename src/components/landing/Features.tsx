import React from 'react';
import {
  Send,
  CheckCircle2,
  Check,
} from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden bg-white">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, rgba(40,131,207,0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Badge & Header */}
        <div className="text-center mb-16 lg:mb-20">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#2883CF]/15 text-[#2883CF] text-xs font-semibold uppercase tracking-wider mb-4">
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-950 max-w-3xl mx-auto leading-[1.15]">
            Tons of features to grow your business
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          
          {/* CARD 1: Track the progress */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 bg-gradient-to-br from-blue-50/40 via-white to-sky-50/20 p-8 flex flex-col justify-between min-h-[380px] shadow-[0_12px_30px_rgba(0,0,0,0.03)] group transition-all duration-500 hover:border-gray-300 hover:shadow-lg">
            
            {/* Visual Section */}
            <div className="relative h-48 flex items-center justify-center overflow-hidden mb-6">
              {/* Radial glow background */}
              <div className="absolute w-36 h-36 rounded-full bg-gradient-to-br from-blue-200/40 to-sky-100/10 filter blur-xl opacity-80" />
              
              {/* Outer circle lines */}
              <div className="absolute w-40 h-40 rounded-full border border-blue-100/80 flex items-center justify-center animate-spin-slow">
                {/* Floating nodes */}
                <div className="absolute -top-2 bg-white rounded-lg shadow-md border border-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-800 flex items-center gap-1.5 transform hover:scale-105 transition-transform duration-300">
                  <Send className="w-3 h-3 text-[#2883CF]" />
                  <span>Campaigns</span>
                </div>
                <div className="absolute -bottom-2 bg-white rounded-lg shadow-md border border-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-800 flex items-center gap-1.5 transform hover:scale-105 transition-transform duration-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Delivered</span>
                </div>
              </div>

              <div className="absolute w-28 h-28 rounded-full border border-blue-50/50 flex items-center justify-center" />

              {/* Center avatar */}
              <div className="relative w-16 h-16 rounded-full border-4 border-white bg-gradient-to-br from-[#2883CF] to-sky-500 shadow-lg flex items-center justify-center overflow-hidden">
                <span className="text-white font-bold text-lg">WM</span>
              </div>
            </div>

            {/* Content Section */}
            <div className="relative z-10">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-950 mb-2 group-hover:text-[#2883CF] transition-colors">
                Track the progress
              </h3>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                Monitor delivery stats, open rates, and user replies in real-time right inside your dashboard.
              </p>
            </div>
          </div>

          {/* CARD 2: Manage the process */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 bg-gradient-to-br from-blue-50/40 via-white to-sky-50/20 p-8 flex flex-col justify-between min-h-[380px] shadow-[0_12px_30px_rgba(0,0,0,0.03)] group transition-all duration-500 hover:border-gray-300 hover:shadow-lg">
            
            {/* Visual Section */}
            <div className="relative h-48 flex items-center justify-center overflow-hidden mb-6">
              {/* Radial glow background */}
              <div className="absolute w-36 h-36 rounded-full bg-gradient-to-br from-sky-200/40 to-blue-100/10 filter blur-xl opacity-80" />
              
              {/* Stacked floating segments & Pie Chart */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* SVG Pie Chart */}
                <svg className="w-24 h-24 transform -rotate-95" viewBox="0 0 32 32">
                  <circle r="16" cx="16" cy="16" fill="transparent" stroke="#e2e8f0" strokeWidth="32" />
                  <circle r="16" cx="16" cy="16" fill="transparent" stroke="#2883CF" strokeWidth="32" strokeDasharray="60 100" />
                  <circle r="16" cx="16" cy="16" fill="transparent" stroke="#3b82f6" strokeWidth="32" strokeDasharray="25 100" strokeDashoffset="-60" />
                  <circle r="16" cx="16" cy="16" fill="transparent" stroke="#1d4ed8" strokeWidth="32" strokeDasharray="15 100" strokeDashoffset="-85" />
                </svg>
                
                {/* Overlay card */}
                <div className="absolute -bottom-2 bg-white rounded-xl shadow-lg border border-gray-150/60 p-2.5 flex items-center gap-2 max-w-[170px] transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-[10px]">📊</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-900 truncate">CSV Contacts</div>
                    <div className="text-[8px] text-gray-400">1,248 imported</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="relative z-10">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-950 mb-2 group-hover:text-[#2883CF] transition-colors">
                Manage the process
              </h3>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                Organize contact databases independently. Upload sheets, clean duplicates, and tag prospects.
              </p>
            </div>
          </div>

          {/* CARD 3: Collaborate on chats */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 bg-gradient-to-br from-blue-50/40 via-white to-sky-50/20 p-8 flex flex-col justify-between min-h-[380px] shadow-[0_12px_30px_rgba(0,0,0,0.03)] group transition-all duration-500 hover:border-gray-300 hover:shadow-lg">
            
            {/* Visual Section */}
            <div className="relative h-48 flex items-center justify-center overflow-hidden mb-6">
              {/* Radial glow background */}
              <div className="absolute w-36 h-36 rounded-full bg-gradient-to-br from-blue-200/30 to-sky-100/10 filter blur-xl opacity-80" />
              
              {/* Floating Chat Bubble Mockup */}
              <div className="relative bg-white border border-gray-200/80 rounded-2xl shadow-lg p-3.5 max-w-[260px] transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-[9px] flex items-center justify-center">SM</div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-900">Sergio Moreni</div>
                    <div className="text-[8px] text-gray-500">Assigned to Sales Team</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-1.5">
                  <div className="px-2 py-1 bg-blue-50 border border-blue-200/50 rounded-lg text-[9px] font-medium text-blue-700 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5 text-blue-500" />
                    <span>Lead Qualified</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                  "Auto-replies sent. Assigned back to support team for final closing."
                </p>
              </div>

              {/* Stacked team avatars */}
              <div className="absolute bottom-4 right-10 flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-[9px] font-bold">A</div>
                <div className="w-7 h-7 rounded-full bg-[#2883CF] border-2 border-white text-white flex items-center justify-center text-[9px] font-bold">P</div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center text-[9px] font-bold">V</div>
              </div>
            </div>

            {/* Content Section */}
            <div className="relative z-10">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-950 mb-2 group-hover:text-[#2883CF] transition-colors">
                Collaborate on chats
              </h3>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                Work together with multiple support agents on the same official WhatsApp number smoothly.
              </p>
            </div>
          </div>

          {/* CARD 4: Automatically reply (Dark Blue Theme Card) */}
          <div className="relative rounded-3xl overflow-hidden border border-[#2883CF]/20 bg-gradient-to-br from-[#0a0e27] via-[#0c1233] to-[#0a0e27] p-8 flex flex-col justify-between min-h-[380px] shadow-[0_20px_50px_rgba(40,131,207,0.15)] group transition-all duration-500 hover:shadow-2xl">
            
            {/* Visual Section */}
            <div className="relative h-48 grid grid-cols-12 gap-4 items-center mb-6">
              
              {/* Left Widget: Trigger List */}
              <div className="col-span-7 bg-[#0f172a] border border-white/[0.08] rounded-xl p-3 shadow-md max-h-[145px] overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Bot Triggers</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Keywords', val: 90, color: 'bg-[#2883CF]' },
                    { label: 'Auto-Replies', val: 75, color: 'bg-sky-400' },
                    { label: 'Buttons', val: 40, color: 'bg-blue-600' },
                    { label: 'API Triggers', val: 60, color: 'bg-indigo-500' },
                  ].map((trig) => (
                    <div key={trig.label} className="space-y-0.5">
                      <div className="flex justify-between text-[8px] text-gray-500">
                        <span>{trig.label}</span>
                        <span>{trig.val}%</span>
                      </div>
                      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className={`h-full ${trig.color} rounded-full`} style={{ width: `${trig.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Widget: Stacked stat chips */}
              <div className="col-span-5 space-y-2">
                {[
                  { label: 'Satisfaction', val: '98%', icon: '⭐' },
                  { label: 'Approved', val: '95%', icon: '📋' },
                  { label: 'Time saved', val: '40hrs', icon: '⏱️' },
                ].map((stat, i) => (
                  <div 
                    key={stat.label} 
                    className="bg-white/95 rounded-lg border border-gray-150/60 p-2 shadow-sm flex items-center justify-between gap-1.5 transform hover:-translate-x-1 transition-transform duration-300"
                    style={{ marginLeft: `${i * 6}px` }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs">{stat.icon}</span>
                      <div className="truncate">
                        <div className="text-[8px] font-bold text-gray-900 leading-none">{stat.label}</div>
                        <div className="text-[9px] text-gray-500 font-bold mt-0.5 leading-none">{stat.val}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Content Section */}
            <div className="relative z-10">
              <h3 className="text-xl lg:text-2xl font-bold text-emerald-400 mb-2">
                Automatically reply
              </h3>
              <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
                Build drag-and-drop conversational bots that qualify leads and respond to common queries instantly.
              </p>
            </div>
          </div>

        </div>

        {/* Minimal Bottom Tagline */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            Customize notifications, bot behaviors, and automation delays directly from your workspace.
          </p>
        </div>

      </div>
    </section>
  );
};

export default Features;