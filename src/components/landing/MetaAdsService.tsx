import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, ShieldCheck, Target, TrendingUp,
  Sparkles, Megaphone, Facebook, Instagram, MessageCircle
} from 'lucide-react';

const MetaAdsService = () => {
  return (
    <section id="meta-ads-service" className="relative py-24 bg-white overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-green-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* ═══════ LEFT: Content ═══════ */}
          <div className="space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
              <ShieldCheck size={16} className="text-green-600" />
              <span className="text-green-700 text-sm font-semibold">
                NEW SERVICE
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] tracking-tight">
              We also run your{' '}
              <span className="bg-gradient-to-r from-green-600 via-teal-500 to-blue-600 bg-clip-text text-transparent">
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
            <div className="space-y-3 pt-2">
              {[
                { title: 'Complete ad campaign management', desc: 'From scaling budgets to bid management & pixel setup.' },
                { title: 'Creative design & ad copywriting', desc: 'High-converting creatives and copy that hook users instantly.' },
                { title: 'Audience targeting & optimization', desc: 'Custom, lookalike & retargeting lists for optimal cost per acquisition.' },
                { title: 'Weekly performance reports', desc: 'Transparent visual dashboards and detailed key KPI reporting.' },
                { title: 'Click-to-WhatsApp ad integration', desc: 'Direct hot leads from ads straight into your WhatsApp automated chat.' },
              ].map((feature, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 text-base">{feature.title}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5"
              >
                Get Free Consultation
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/919211938200?text=Hi, I want to inquire about Meta Ads Agency services!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-7 py-3.5 rounded-xl border-2 border-gray-200 hover:border-green-500 transition-all duration-200"
              >
                Talk to Expert
              </a>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                {['from-green-400 to-green-600', 'from-blue-400 to-blue-600', 'from-purple-400 to-purple-600'].map((grad, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} border-2 border-white`} />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">200+ businesses</span> trust us with their ads
              </p>
            </div>
          </div>

          {/* ═══════ RIGHT: Performance & Ad Preview Illustration ═══════ */}
          <div className="relative">
            
            {/* Connecting schematic dotted lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 500 500">
              <path d="M 80,180 C 120,80 380,80 420,180" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
              <path d="M 400,320 C 350,420 150,420 80,320" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
            </svg>

            {/* Floating Brand Icons */}
            <div className="absolute top-[8%] left-[4%] w-11 h-11 bg-white border border-green-200 rounded-2xl flex items-center justify-center shadow-lg z-20 animate-float-slow">
              <Facebook size={18} className="text-blue-600 fill-blue-600" />
            </div>

            <div className="absolute top-[5%] right-[25%] w-11 h-11 bg-white border border-blue-200 rounded-2xl flex items-center justify-center shadow-lg z-20 animate-float">
              <Instagram size={18} className="text-pink-500" />
            </div>

            <div className="absolute bottom-[28%] left-[2%] w-11 h-11 bg-white border border-pink-200 rounded-2xl flex items-center justify-center shadow-lg z-20 animate-float-delay">
              <MessageCircle size={18} className="text-green-500 fill-green-50" />
            </div>

            <div className="absolute bottom-[2%] right-[15%] w-11 h-11 bg-white border border-purple-200 rounded-2xl flex items-center justify-center shadow-lg z-20 animate-float-slow">
              <Megaphone size={18} className="text-purple-500" />
            </div>

            {/* ━━━ Main FB / IG Sponsored Ad Preview Card ━━━ */}
            <div className="relative mx-auto max-w-[380px] bg-white rounded-[2rem] shadow-2xl border border-gray-200/80 p-5 z-10 transition-transform duration-500 hover:scale-[1.02] overflow-hidden">
              
              {/* Header: Profile */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-sm select-none">
                  W
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-gray-900 leading-none">WabMeta Automation</span>
                    <ShieldCheck size={12} className="text-blue-500 fill-blue-500" />
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium tracking-wide">Sponsored • 🌐</span>
                </div>
                <div className="text-gray-400 cursor-pointer hover:text-gray-600 text-sm font-bold">•••</div>
              </div>

              {/* Text caption */}
              <p className="text-[11px] text-gray-700 leading-relaxed mb-3">
                🚀 Grow your sales by 3X! Our certified Meta Ads experts build high-converting Facebook & Instagram campaigns, integrated directly with WhatsApp.
              </p>

              {/* Ad Image / Graphic (Sleek vector/graphical illustration) */}
              <div className="relative h-44 rounded-xl bg-gradient-to-br from-green-50 via-emerald-100/30 to-blue-50/50 border border-green-100 flex items-center justify-center overflow-hidden mb-3.5 group/adimg">
                {/* Decorative background vectors */}
                <div className="absolute inset-0 bg-[radial-gradient(#d1fae5_1.5px,transparent_1.5px)] bg-[size:16px_16px] opacity-40" />
                
                {/* Vector Grid/Chart Representation */}
                <svg className="w-full h-full p-4 overflow-visible z-10" viewBox="0 0 200 120">
                  {/* Grid Lines */}
                  <line x1="10" y1="10" x2="10" y2="100" stroke="#a7f3d0" strokeWidth="1" />
                  <line x1="10" y1="100" x2="190" y2="100" stroke="#a7f3d0" strokeWidth="1" />
                  
                  {/* Performance Curve path */}
                  <path 
                    d="M 10,90 Q 50,85 80,55 T 140,25 T 190,12" 
                    fill="none" 
                    stroke="url(#adChartGrad)" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className="[stroke-dasharray:300] [stroke-dashoffset:300] animate-[dash_3s_ease-out_forwards]"
                  />
                  
                  {/* Shadow Area beneath line */}
                  <path 
                    d="M 10,90 Q 50,85 80,55 T 140,25 T 190,12 L 190,100 L 10,100 Z" 
                    fill="url(#adChartBgGrad)" 
                    opacity="0.2"
                  />

                  {/* Pulsing end point */}
                  <circle cx="190" cy="12" r="5" fill="#10b981" className="animate-ping" />
                  <circle cx="190" cy="12" r="3" fill="#10b981" />
                  
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="adChartGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="adChartBgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Micro illustration card: Meta pixel */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-lg p-2 shadow-md flex items-center gap-1.5 z-20 transition-transform duration-300 group-hover/adimg:translate-x-1">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Check size={9} className="text-white" strokeWidth={3} />
                  </div>
                  <span className="text-[8px] font-extrabold text-gray-800 tracking-wide uppercase">Meta Pixel Active</span>
                </div>
              </div>

              {/* Call to Action Bar */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">WABMETA.COM</p>
                  <p className="text-[11px] font-bold text-gray-900 mt-0.5">Scale Campaigns with 5X ROAS</p>
                </div>
                <a
                  href="https://wa.me/919211938200?text=Hi, I want to inquire about Meta Ads Agency services!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  Send Inquiry
                  <ArrowRight size={10} />
                </a>
              </div>

            </div>

            {/* ━━━ Floating Performance Badges ━━━ */}

            {/* Badge 1: ROAS (Top Right) */}
            <div className="absolute top-[12%] -right-[6%] w-40 bg-white/90 backdrop-blur-md border border-green-200/50 rounded-2xl p-3 shadow-xl z-20 animate-float">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={12} className="text-green-600" />
                <span className="text-[9px] font-extrabold text-green-700 uppercase tracking-wider">ROAS Metric</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-black text-2xl text-gray-900">5.2X</span>
                <span className="text-[9px] text-green-500 font-bold">↑ +24%</span>
              </div>
              <p className="text-[9px] text-gray-500">Average Return on Spend</p>
            </div>

            {/* Badge 2: Targeting / CPL (Bottom Left) */}
            <div className="absolute bottom-[8%] -left-[4%] w-40 bg-white/90 backdrop-blur-md border border-blue-200/50 rounded-2xl p-3 shadow-xl z-20 animate-float-delay">
              <div className="flex items-center gap-1.5 mb-1">
                <Target size={12} className="text-blue-600" />
                <span className="text-[9px] font-extrabold text-blue-700 uppercase tracking-wider">Cost Per Lead</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-black text-2xl text-gray-900">₹42</span>
                <span className="text-[9px] text-blue-500 font-bold">↓ -18%</span>
              </div>
              <p className="text-[9px] text-gray-500">Highly-targeted lead acquisition</p>
            </div>

            {/* Badge 3: Active Campaigns Pulse (Bottom Right) */}
            <div className="absolute -bottom-2 right-[2%] bg-white border border-gray-100 rounded-full px-4.5 py-2 shadow-lg z-20 select-none hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-extrabold text-gray-800 tracking-wide uppercase">200+ Active Campaigns</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default MetaAdsService;
