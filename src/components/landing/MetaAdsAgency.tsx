import React from 'react';
import { Check, ArrowRight, Megaphone, Target, TrendingUp, Sparkles } from 'lucide-react';

const MetaAdsAgency = () => {
  const deliverables = [
    {
      title: 'Targeted Campaign Setup',
      desc: 'Advanced pixel tracking, custom & lookalike audiences to target high-intent buyers.',
      icon: Target,
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Scroll-Stopping Ad Creatives',
      desc: 'High-converting copywriting and custom graphics designed to maximize CTR.',
      icon: Sparkles,
      iconBg: 'bg-pink-100 text-pink-600',
    },
    {
      title: 'Continuous Optimization',
      desc: 'A/B testing, budget scaling, and daily tweaks to lower your Cost Per Acquisition (CPA).',
      icon: TrendingUp,
      iconBg: 'bg-green-100 text-green-600',
    },
  ];

  return (
    <section id="meta-ads-agency" className="relative py-24 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-green-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* ═══════ Left Column: Service Details ═══════ */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-gray-200" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-blue-600 font-bold flex items-center gap-1.5">
                <Megaphone size={14} /> Meta Ads Agency Service
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-950 leading-tight">
              Scale your brand with <br />
              <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 bg-clip-text text-transparent">
                High-ROI Meta Campaigns
              </span>
            </h2>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Struggling to get sales or quality leads from your ads? Our Meta-certified ads team designs, targets, and optimizes Facebook & Instagram campaigns to generate consistent, profitable conversions.
            </p>

            {/* Deliverables List */}
            <div className="space-y-4 pt-4">
              {deliverables.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-shadow duration-300">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">{item.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <a
                href="https://wa.me/919211938200?text=Hi, I want to inquire about Meta Ads Agency services!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Free Ads Consultation <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* ═══════ Right Column: Visual Previews ═══════ */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Background elements */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-teal-50 rounded-[2.5rem] blur-2xl opacity-70 -z-10" />

            {/* Main Mockup Box */}
            <div className="w-full max-w-[440px] bg-slate-900 rounded-[2rem] p-4 shadow-2xl border border-white/10 relative">
              
              {/* Instagram/Facebook Mock Ad */}
              <div className="bg-white rounded-2xl p-3.5 text-gray-900 shadow-lg relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-inner">
                      f
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                        WabMeta Ads <span className="text-[10px] text-blue-500">✔</span>
                      </p>
                      <p className="text-[9px] text-gray-400">Sponsored</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm cursor-pointer">⋯</span>
                </div>

                {/* Ad text */}
                <p className="text-[11px] text-gray-700 leading-normal mb-2">
                  Stop burning money on unprofitable campaigns. Our Meta certified experts build campaigns that scale sales and drive up to 5x ROAS. 🚀
                </p>

                {/* Mock Image Placeholder */}
                <div className="w-full h-44 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl relative overflow-hidden flex items-center justify-center text-white mb-2">
                  <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-[9px] text-white px-2 py-0.5 rounded-full">
                    Instagram Feed
                  </div>
                  <div className="text-center p-4">
                    <Megaphone size={36} className="mx-auto mb-2 opacity-90 text-blue-200" />
                    <p className="text-sm font-extrabold tracking-wide uppercase leading-tight">Scale Your Store Sales</p>
                    <p className="text-[9px] text-blue-200 mt-1">Setup & Optimized by Meta Experts</p>
                  </div>
                </div>

                {/* Footer with Shop Now CTA */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-[8px] text-gray-400 uppercase tracking-wider">WABMETA.COM</p>
                    <p className="text-[11px] font-bold text-gray-950">Scale Sales up to 5x ROAS</p>
                  </div>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 text-[10px] font-bold px-3 py-2 rounded-lg transition-colors border border-gray-200">
                    Book Now
                  </button>
                </div>
              </div>

              {/* Floating Analytics Card */}
              <div className="absolute -bottom-6 -left-6 bg-slate-950 border border-white/10 rounded-2xl p-4 w-48 shadow-2xl z-20 animate-float">
                <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mb-2">Campaign Performance</p>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-[8px] text-gray-500">ROAS</p>
                    <p className="text-base font-extrabold text-green-400">5.2x</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-500">Conversions</p>
                    <p className="text-base font-extrabold text-white">+340%</p>
                  </div>
                </div>
                
                <svg className="w-full" height="30" viewBox="0 0 100 30">
                  <path 
                    d="M0,25 Q15,22 30,15 T60,10 T80,3 T100,5" 
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="2" 
                  />
                  <circle cx="80" cy="3" r="2.5" fill="#22c55e" />
                </svg>
              </div>

              {/* Floating Leads Counter */}
              <div className="absolute -top-4 -right-4 bg-blue-600 rounded-2xl p-3 text-white shadow-2xl z-20 flex items-center gap-2.5">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Target size={14} />
                </div>
                <div>
                  <p className="text-[8px] text-blue-100 uppercase tracking-widest font-bold">Total Leads</p>
                  <p className="text-sm font-extrabold">1,248</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MetaAdsAgency;
