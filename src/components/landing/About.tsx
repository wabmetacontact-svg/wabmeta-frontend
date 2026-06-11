// src/components/landing/About.tsx
// Compact About Us section for landing page

import { Link } from 'react-router-dom';
import { 
  Sparkles, Rocket, Target, Heart, Shield, 
  ArrowRight, Check, Users, Award, TrendingUp, Lightbulb
} from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="relative py-24 bg-gradient-to-b from-white via-gray-50/40 to-white overflow-hidden">
      
      {/* Background decorative blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-green-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* ═══════ Section Header ═══════ */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <Sparkles size={14} className="text-orange-500" />
            <span className="text-gray-700 text-sm font-semibold tracking-wide">
              ABOUT WABMETA
            </span>
          </div>

          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-4">
            Built for businesses that{' '}
            <span className="text-green-500">refuse to settle</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            We're on a mission to automate every business conversation — 
            making powerful tools accessible, affordable, and beautifully simple.
          </p>
        </div>

        {/* ═══════ Main Content Grid ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          
          {/* ━━━ LEFT: Our Story Card (Tall) ━━━ */}
          <div className="lg:col-span-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 lg:p-10 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500 shadow-xl shadow-green-500/20 min-h-[500px] flex flex-col">
            
            {/* Decorative pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1.5 mb-5 w-fit">
                <Lightbulb size={12} className="text-white" />
                <span className="text-[10px] font-bold text-white tracking-wider uppercase">
                  Our Story
                </span>
              </div>

              <h3 className="font-heading font-bold text-3xl lg:text-4xl text-white leading-tight mb-4">
                From a simple idea to powering thousands
              </h3>
              
              <p className="text-green-50 leading-relaxed mb-6">
                WabMeta was born when our founders saw businesses struggling with 
                disconnected tools. We built one platform where WhatsApp, Instagram, 
                and Meta Ads work seamlessly together.
              </p>

              {/* Mini visual stack */}
              <div className="flex-1 relative mt-2">
                
                {/* Stats card */}
                <div className="absolute top-0 right-0 w-44 bg-white rounded-2xl p-3 shadow-2xl rotate-[6deg] border border-white/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-green-600" />
                    <span className="text-[10px] font-bold text-gray-900">Growth</span>
                  </div>
                  <div className="font-heading font-bold text-2xl text-gray-900">340%</div>
                  <div className="text-[9px] text-green-600 font-semibold">YoY increase</div>
                  <svg className="w-full mt-1" height="18" viewBox="0 0 80 18">
                    <path d="M0,14 Q20,10 40,6 T80,2" stroke="#1b8b4b" strokeWidth="1.5" fill="none" />
                  </svg>
                </div>

                {/* Verified card */}
                <div className="absolute bottom-0 left-0 w-44 bg-white rounded-2xl p-3 shadow-2xl rotate-[-4deg] border border-white/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={14} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-gray-900">Meta Partner</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-50 rounded-lg p-1.5">
                    <Shield size={10} className="text-green-600" />
                    <span className="text-[9px] text-green-700 font-bold">VERIFIED 2024</span>
                  </div>
                </div>
              </div>

              {/* Bottom feature list */}
              <div className="space-y-2 mt-6 relative z-10">
                {[
                  'Official Meta Business Partner',
                  '10,000+ active businesses',
                  'Founded 2023, growing fast',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-white/95">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ━━━ RIGHT: Mission + Vision + Values Grid ━━━ */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Mission */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200/60 rounded-3xl p-6 group hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-200/60 transition-all duration-500">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
                <Rocket size={20} className="text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl text-purple-955 mb-2">
                Our Mission
              </h3>
              <p className="text-sm text-purple-800/80 leading-relaxed">
                Empower every business with smart, affordable automation tools — 
                no enterprise budget required.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-100 border border-pink-200/60 rounded-3xl p-6 group hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-200/60 transition-all duration-500">
              <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30 mb-4">
                <Target size={20} className="text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl text-pink-955 mb-2">
                Our Vision
              </h3>
              <p className="text-sm text-pink-800/80 leading-relaxed">
                A world where every conversation drives growth. AI handles the routine, 
                humans focus on what truly matters.
              </p>
            </div>

            {/* Customer First */}
            <div className="bg-gradient-to-br from-blue-50 to-sky-100 border border-blue-200/60 rounded-3xl p-6 group hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-200/60 transition-all duration-500">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                <Users size={20} className="text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl text-blue-955 mb-2">
                Customer First
              </h3>
              <p className="text-sm text-blue-800/80 leading-relaxed">
                Every feature, every decision starts with one question: 
                "How does this help our users grow?"
              </p>
            </div>

            {/* Trust & Transparency */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200/60 rounded-3xl p-6 group hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-200/60 transition-all duration-500">
              <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
                <Heart size={20} className="text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl text-orange-955 mb-2">
                Built with Heart
              </h3>
              <p className="text-sm text-orange-800/80 leading-relaxed">
                No hidden fees, no shady tactics. We earn your trust through 
                transparency and genuine care.
              </p>
            </div>
          </div>
        </div>

        {/* ═══════ Bottom Stats + CTA Bar ═══════ */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Stats */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '10K+', label: 'Active Users', color: 'text-green-600' },
                { value: '50M+', label: 'Messages Sent', color: 'text-blue-600' },
                { value: '99.9%', label: 'Uptime', color: 'text-purple-600' },
                { value: '2023', label: 'Founded', color: 'text-orange-600' },
              ].map((stat, i) => (
                <div key={i} className="text-center md:text-left">
                  <div className={`font-heading font-bold text-3xl md:text-4xl ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Right: CTA */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 w-full lg:w-auto"
              >
                Join Our Journey
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-xs text-gray-500 text-center lg:text-right">
                Trusted by thousands across India 🇮🇳
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
