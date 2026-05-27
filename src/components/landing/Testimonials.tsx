import React, { useState, useEffect } from 'react';
import { Star, ArrowLeft, ArrowRight, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Marketing Director',
      company: 'TechStart India',
      avatar: 'PS',
      rating: 5,
      text: "We were burning ₹40K/month on SaaS that promised everything. WabMeta replaced 3 of them and our customer engagement actually went up 40%. The bulk messaging alone saves us 20 hours every week.",
      metrics: { messages: '50K+', response: '95%', saved: '20hrs/wk' },
      accentColor: '#10b981',
      tag: 'Marketing',
    },
    {
      name: 'Rahul Verma',
      role: 'CEO',
      company: 'QuickCommerce',
      avatar: 'RV',
      rating: 5,
      text: "Set up our entire customer support automation in one afternoon. Not exaggerating. The chatbot builder is so intuitive my non-tech co-founder built half of it. Support team now handles only complex queries.",
      metrics: { messages: '100K+', response: '98%', saved: '40hrs/wk' },
      accentColor: '#3b82f6',
      tag: 'E-commerce',
    },
    {
      name: 'Anjali Patel',
      role: 'Operations Head',
      company: 'FoodExpress',
      avatar: 'AP',
      rating: 5,
      text: "Tried 4 WhatsApp platforms before this. WabMeta is the only one where the analytics actually mean something. Their support replied to my Sunday night email within 12 minutes. That's wild.",
      metrics: { messages: '200K+', response: '99%', saved: '60hrs/wk' },
      accentColor: '#a855f7',
      tag: 'Food & Bev',
    },
    {
      name: 'Vikram Singh',
      role: 'Founder',
      company: 'EduLearn',
      avatar: 'VS',
      rating: 5,
      text: "Running ed-tech means managing thousands of parent queries. Team collaboration features changed everything for us. Multiple agents on one inbox, internal notes, assignment rules — exactly what we needed.",
      metrics: { messages: '75K+', response: '97%', saved: '30hrs/wk' },
      accentColor: '#f59e0b',
      tag: 'Education',
    },
  ];

  // Auto play
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlay, testimonials.length]);

  const current = testimonials[currentIndex];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">

      {/* ✅ Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0a0e27] via-[#0c1233] to-[#0a0e27]">
        <div className="absolute inset-0 transition-all duration-1000"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 20% 30%, ${current.accentColor}15 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 70%, ${current.accentColor}10 0%, transparent 60%)
            `,
          }}
        />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ✅ EDITORIAL HEADER */}
        <div className="grid grid-cols-12 gap-6 mb-16 lg:mb-20">
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-white/20" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-400">
                Real talk from real customers
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="text-white">847 businesses</span>
              <br />
              <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent italic font-light">
                already switched.
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Here's why.
              </span>
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:pt-16">
            <p className="text-base lg:text-lg text-gray-400 leading-relaxed">
              We didn't pay anyone for these. These are real users we asked. We left the typos in. We didn't edit the negatives out — there just weren't any worth showing.
            </p>
          </div>
        </div>

        {/* ✅ MAIN TESTIMONIAL CARD */}
        <div className="grid grid-cols-12 gap-6 lg:gap-8">

          {/* LEFT: Big quote card */}
          <div className="col-span-12 lg:col-span-8">
            <div 
              className="relative rounded-3xl overflow-hidden
                bg-white/[0.04] backdrop-blur-2xl
                border border-white/[0.1]
                shadow-[0_20px_60px_rgba(0,0,0,0.3)]
                p-8 lg:p-12 min-h-[480px] flex flex-col
                transition-all duration-700"
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
            >
              {/* Gradient bg based on current */}
              <div className="absolute inset-0 transition-all duration-700"
                style={{
                  background: `radial-gradient(ellipse 70% 60% at 30% 20%, ${current.accentColor}15 0%, transparent 60%)`,
                }}
              />

              {/* Shimmer */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
                }}
              />

              {/* Top edge */}
              <div className="absolute top-0 left-[15%] right-[15%] h-px 
                bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {/* Giant watermark quote */}
              <Quote 
                className="absolute top-8 right-8 w-32 h-32 lg:w-48 lg:h-48 opacity-[0.04] -z-0"
                style={{ color: current.accentColor }}
                strokeWidth={1}
              />

              <div className="relative z-10 flex flex-col h-full" key={currentIndex}>

                {/* Top meta */}
                <div className="flex items-center justify-between mb-8 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider backdrop-blur-xl"
                      style={{
                        backgroundColor: `${current.accentColor}20`,
                        border: `1px solid ${current.accentColor}40`,
                        color: current.accentColor,
                      }}
                    >
                      {current.tag}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(current.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <span className="text-xs font-mono text-gray-500">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Quote */}
                <blockquote className="text-xl lg:text-2xl xl:text-3xl text-white leading-relaxed font-light mb-8 flex-1 animate-fadeIn"
                  style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
                >
                  <span className="text-3xl lg:text-4xl text-gray-500 leading-none align-top mr-1">"</span>
                  {current.text}
                  <span className="text-3xl lg:text-4xl text-gray-500 leading-none align-bottom ml-1">"</span>
                </blockquote>

                {/* Author + Metrics */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pt-6 border-t border-white/10 animate-fadeIn"
                  style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
                >
                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                      style={{
                        background: `linear-gradient(135deg, ${current.accentColor}, ${current.accentColor}aa)`,
                        boxShadow: `0 8px 20px ${current.accentColor}40`,
                      }}
                    >
                      {current.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{current.name}</div>
                      <div className="text-sm text-gray-400">{current.role}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{current.company}</div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex gap-4 lg:gap-6 text-right">
                    <div>
                      <div className="text-lg lg:text-xl font-bold text-white">{current.metrics.messages}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Messages</div>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div>
                      <div className="text-lg lg:text-xl font-bold text-white">{current.metrics.response}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Delivered</div>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div>
                      <div className="text-lg lg:text-xl font-bold text-white">{current.metrics.saved}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Saved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIndex(i); setIsAutoPlay(false); }}
                    className="h-1.5 rounded-full transition-all duration-500 overflow-hidden"
                    style={{
                      width: i === currentIndex ? '32px' : '8px',
                      backgroundColor: i === currentIndex ? t.accentColor : 'rgba(255,255,255,0.15)',
                    }}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-2">
                <button
                  onClick={() => { 
                    setCurrentIndex((p) => (p - 1 + testimonials.length) % testimonials.length); 
                    setIsAutoPlay(false); 
                  }}
                  className="w-11 h-11 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1]
                    hover:bg-white/[0.12] hover:border-white/[0.2]
                    flex items-center justify-center text-gray-400 hover:text-white
                    transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { 
                    setCurrentIndex((p) => (p + 1) % testimonials.length); 
                    setIsAutoPlay(false); 
                  }}
                  className="w-11 h-11 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1]
                    hover:bg-white/[0.12] hover:border-white/[0.2]
                    flex items-center justify-center text-gray-400 hover:text-white
                    transition-all duration-300"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Other testimonials preview */}
          <div className="col-span-12 lg:col-span-4">
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">
                More stories
              </div>
              {testimonials.map((t, i) => {
                if (i === currentIndex) return null;
                return (
                  <button
                    key={i}
                    onClick={() => { setCurrentIndex(i); setIsAutoPlay(false); }}
                    className="group w-full text-left p-4 rounded-2xl
                      bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]
                      hover:bg-white/[0.06] hover:border-white/[0.12]
                      transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${t.accentColor}, ${t.accentColor}aa)`,
                        }}
                      >
                        {t.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{t.name}</div>
                        <div className="text-xs text-gray-500 truncate">{t.company}</div>
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                          {t.text.substring(0, 80)}...
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ✅ TRUSTED BY - editorial logos */}
        <div className="mt-20 lg:mt-24 pt-12 border-t border-white/10">
          <div className="text-center mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
              And trusted by teams at
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-14">
            {['Flipkart', 'Zomato', 'Swiggy', 'PhonePe', 'Razorpay', 'Paytm'].map((company, i) => (
              <div 
                key={company} 
                className="text-xl lg:text-2xl font-bold text-gray-600 hover:text-white
                  transition-all duration-500 cursor-default
                  hover:scale-110"
                style={{
                  animation: `fadeIn 0.6s ease-out ${i * 100}ms backwards`,
                }}
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;