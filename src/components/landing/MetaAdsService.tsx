import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, TrendingUp, Target, Facebook,
  Instagram, Sparkles, BarChart3, Megaphone
} from 'lucide-react';

const MetaAdsService = () => {
  return (
    <section id="meta-ads-service" className="relative py-28 bg-[#f8fafc] overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      
      {/* Sleek Dot Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl pointer-events-none -mr-48 animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-[10000ms]" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* ═══════ LEFT: Content ═══════ */}
          <div className="space-y-8">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white border border-blue-100 rounded-full px-4.5 py-2 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 cursor-default">
              <div className="flex -space-x-1.5">
                <div className="w-5.5 h-5.5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                  <Facebook size={10} className="text-white fill-white" />
                </div>
                <div className="w-5.5 h-5.5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                  <Instagram size={10} className="text-white" />
                </div>
              </div>
              <span className="text-blue-700 text-xs font-extrabold tracking-wider uppercase">
                PREMIUM AD AGENCY
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
              We also run your{' '}
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                Meta Ads
              </span>
            </h2>

            {/* Subheading */}
            <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
              Beyond automation, our expert team manages your Facebook & Instagram 
              ad campaigns end-to-end. Get more leads, better ROAS, and faster growth — 
              all from the same team you trust.
            </p>

            {/* Features List */}
            <div className="space-y-4 pt-2">
              {[
                { title: 'Complete ad campaign management', desc: 'From scaling budgets to bid management & pixel setup.' },
                { title: 'Creative design & ad copywriting', desc: 'High-converting creatives and copy that hook users instantly.' },
                { title: 'Audience targeting & optimization', desc: 'Custom, lookalike & retargeting lists for optimal cost per acquisition.' },
                { title: 'Weekly performance reports', desc: 'Transparent visual dashboards and detailed key KPI reporting.' },
                { title: 'Click-to-WhatsApp ad integration', desc: 'Direct hot leads from ads straight into your WhatsApp automated chat.' },
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 group/item items-start p-3 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-sm transition-all duration-300">
                  <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all duration-300">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover/item:text-blue-700 transition-colors text-base">{feature.title}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-2.5 bg-gray-950 hover:bg-gray-900 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] hover:-translate-y-0.5"
              >
                Get Free Consultation
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <a
                href="https://wa.me/919211938200?text=Hi, I want to inquire about Meta Ads Agency services!"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-900 font-bold px-8 py-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 text-green-500 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.022-.08-.124-.22-.364-.34-.24-.12-1.418-.7-1.638-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-.992-.367-1.89-1.167-.701-.626-1.173-1.402-1.31-1.638-.136-.237-.015-.365.106-.485.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.195-.476-.39-.412-.54-.42-.14-.008-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.581 4.1 3.62.572.247 1.02.395 1.37.508.574.181 1.096.15 1.507.085.458-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14zM12.003 21c-1.65 0-3.26-.43-4.67-1.25l-.34-.2-3.47.91.93-3.39-.22-.35C3.41 15.3 2.98 13.67 2.98 12c0-4.97 4.05-9 9-9 4.97 0 9 4.03 9 9s-4.03 9-9 9zm0-20C5.93 1 1 5.93 1 12c0 1.94.51 3.82 1.49 5.47L1 23l5.64-1.48C8.24 22.48 10.1 23 12 23c6.07 0 11-4.93 11-11S18.07 1 12.003 1z" />
                </svg>
                Talk to Expert
              </a>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
              <div className="flex -space-x-3.5">
                {[
                  { text: 'A', bg: 'from-blue-400 to-indigo-600' },
                  { text: 'S', bg: 'from-purple-400 to-pink-600' },
                  { text: 'K', bg: 'from-pink-400 to-rose-600' },
                  { text: 'M', bg: 'from-teal-400 to-emerald-600' }
                ].map((avatar, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatar.bg} border-2 border-white flex items-center justify-center shadow-md select-none`}>
                    <span className="text-[10px] font-black text-white">{avatar.text}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">200+ businesses</span> trust us with their campaigns
              </p>
            </div>
          </div>

          {/* ═══════ RIGHT: Visual Card ═══════ */}
          <div className="relative">
            
            {/* Main Card */}
            <div className="bg-white rounded-[2rem] shadow-xl hover:shadow-2xl border border-gray-100 p-8 relative overflow-hidden transition-all duration-500 hover:border-blue-200">
              
              {/* Header Decoration */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

              {/* Stats Header */}
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-extrabold mb-1">
                    Verified Average Results
                  </p>
                  <h3 className="font-heading font-black text-2xl text-gray-900">
                    Numbers our clients see
                  </h3>
                </div>
                {/* Live Indicator */}
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200/50 rounded-full px-3 py-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Live tracking</span>
                </div>
              </div>

              {/* Big Stats Grid */}
              <div className="grid grid-cols-2 gap-5 mb-8">
                
                {/* Card 1: ROAS */}
                <div className="group/card bg-gradient-to-br from-blue-50/50 to-blue-100/30 rounded-2xl p-5 border border-blue-100/60 hover:border-blue-300 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">ROAS</span>
                    </div>
                    {/* Mini Sparkline */}
                    <svg viewBox="0 0 60 20" className="w-12 h-5 text-blue-500 overflow-visible opacity-70 group-hover/card:opacity-100 transition-opacity">
                      <path d="M0,18 Q10,12 20,15 T40,6 T60,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="font-heading font-black text-4xl text-gray-900 mb-1 tracking-tight">5X</div>
                  <div className="text-xs text-gray-500 font-medium">Return on Spend</div>
                </div>

                {/* Card 2: CPL */}
                <div className="group/card bg-gradient-to-br from-purple-50/50 to-purple-100/30 rounded-2xl p-5 border border-purple-100/60 hover:border-purple-300 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-purple-600" />
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">CPL</span>
                    </div>
                    {/* Mini downward Sparkline */}
                    <svg viewBox="0 0 60 20" className="w-12 h-5 text-purple-500 overflow-visible opacity-70 group-hover/card:opacity-100 transition-opacity">
                      <path d="M0,2 Q15,8 30,12 T60,18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="font-heading font-black text-4xl text-gray-900 mb-1 tracking-tight">₹42</div>
                  <div className="text-xs text-gray-500 font-medium">Cost per Lead</div>
                </div>

                {/* Card 3: Reach */}
                <div className="group/card bg-gradient-to-br from-pink-50/50 to-pink-100/30 rounded-2xl p-5 border border-pink-100/60 hover:border-pink-300 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Megaphone size={16} className="text-pink-600" />
                      <span className="text-xs font-bold text-pink-700 uppercase tracking-wider">Reach</span>
                    </div>
                    {/* Wave chart */}
                    <svg viewBox="0 0 60 20" className="w-12 h-5 text-pink-500 overflow-visible opacity-70 group-hover/card:opacity-100 transition-opacity">
                      <path d="M0,15 L10,5 L20,12 L30,3 L40,8 L50,2 L60,0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="font-heading font-black text-4xl text-gray-900 mb-1 tracking-tight">10M+</div>
                  <div className="text-xs text-gray-500 font-medium">Monthly Impressions</div>
                </div>

                {/* Card 4: Growth */}
                <div className="group/card bg-gradient-to-br from-green-50/50 to-green-100/30 rounded-2xl p-5 border border-green-100/60 hover:border-green-300 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={16} className="text-green-600" />
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Growth</span>
                    </div>
                    {/* Tiny bars */}
                    <div className="flex items-end gap-0.5 h-5 w-12 text-green-500 opacity-70 group-hover/card:opacity-100 transition-opacity">
                      <span className="w-1.5 h-[35%] bg-current rounded-sm" />
                      <span className="w-1.5 h-[55%] bg-current rounded-sm" />
                      <span className="w-1.5 h-[75%] bg-current rounded-sm" />
                      <span className="w-1.5 h-[90%] bg-current rounded-sm" />
                      <span className="w-1.5 h-[100%] bg-current rounded-sm" />
                    </div>
                  </div>
                  <div className="font-heading font-black text-4xl text-gray-900 mb-1 tracking-tight">+340%</div>
                  <div className="text-xs text-gray-500 font-medium">Revenue Boost</div>
                </div>
              </div>

              {/* Bottom Note */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4.5 flex items-center gap-4 border border-gray-100">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Sparkles size={20} className="text-white animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Managed by Experts</p>
                  <p className="text-xs text-gray-500 font-medium">Certified Meta Marketing professionals</p>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-4.5 shadow-2xl border-2 border-white/20 select-none transition-transform duration-500 hover:scale-105 rotate-6 hover:rotate-2 cursor-default flex flex-col items-center">
              <span className="text-[10px] font-black tracking-widest text-blue-200 uppercase">META BUSINESS</span>
              <span className="text-sm font-black tracking-tight mt-0.5">PARTNER</span>
            </div>

            {/* Floating Tag */}
            <div className="absolute -bottom-5 -left-5 bg-white border border-gray-100 rounded-full px-5 py-2.5 shadow-lg select-none hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-extrabold text-gray-800 tracking-wide">200+ Active Campaigns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetaAdsService;
