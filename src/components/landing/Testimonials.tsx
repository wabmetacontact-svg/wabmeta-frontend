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
      accentColor: '#2883CF',
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
      accentColor: '#0ea5e9',
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
      accentColor: '#3b82f6',
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
      accentColor: '#2563eb',
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
    <section className="relative py-24 lg:py-32 overflow-hidden bg-white">

      {/* ✅ Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="absolute inset-0 transition-all duration-1000"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 20% 30%, ${current.accentColor}10 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 70%, ${current.accentColor}08 0%, transparent 60%)
            `,
          }}
        />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ✅ EDITORIAL HEADER */}
        <div className="grid grid-cols-12 gap-6 mb-16 lg:mb-20">
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gray-200" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 font-bold">
                Real talk from real customers
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="text-gray-950">847 businesses</span>
              <br />
              <span className="bg-gradient-to-r from-gray-500 to-gray-600 bg-clip-text text-transparent italic font-light">
                already switched.
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#2883CF] to-sky-500 bg-clip-text text-transparent">
                Here's why.
              </span>
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:pt-16">
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
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
                bg-white
                border border-gray-200/80
                shadow-[0_20px_50px_rgba(0,0,0,0.05)]
                p-8 lg:p-12 min-h-[480px] flex flex-col
                transition-all duration-700"
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
            >
              {/* Gradient bg based on current */}
              <div className="absolute inset-0 transition-all duration-700"
                style={{
                  background: `radial-gradient(ellipse 70% 60% at 30% 20%, ${current.accentColor}12 0%, transparent 60%)`,
                }}
              />

              {/* Shimmer */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%)',
                }}
              />

              {/* Top edge */}
              <div className="absolute top-0 left-[15%] right-[15%] h-px 
                bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              {/* Giant watermark quote */}
              <Quote 
                className="absolute top-8 right-8 w-32 h-32 lg:w-48 lg:h-48 opacity-[0.05] -z-0"
                style={{ color: current.accentColor }}
                strokeWidth={1}
              />

              <div className="relative z-10 flex flex-col h-full" key={currentIndex}>

                {/* Top meta */}
                <div className="flex items-center justify-between mb-8 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider backdrop-blur-xl"
                      style={{
                        backgroundColor: `${current.accentColor}12`,
                        border: `1px solid ${current.accentColor}25`,
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

                  <span className="text-xs font-mono text-gray-400 font-medium">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Quote */}
                <blockquote className="text-xl lg:text-2xl xl:text-3xl text-gray-900 leading-relaxed font-light mb-8 flex-1 animate-fadeIn"
                  style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
                >
                  <span className="text-3xl lg:text-4xl text-gray-300 leading-none align-top mr-1">"</span>
                  {current.text}
                  <span className="text-3xl lg:text-4xl text-gray-300 leading-none align-bottom ml-1">"</span>
                </blockquote>

                {/* Author + Metrics */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pt-6 border-t border-gray-100 animate-fadeIn"
                  style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
                >
                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                      style={{
                        background: `linear-gradient(135deg, ${current.accentColor}, ${current.accentColor}aa)`,
                        boxShadow: `0 8px 20px ${current.accentColor}30`,
                      }}
                    >
                      {current.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-950">{current.name}</div>
                      <div className="text-sm text-gray-600">{current.role}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{current.company}</div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex gap-4 lg:gap-6 text-right">
                    <div>
                      <div className="text-lg lg:text-xl font-bold text-gray-950">{current.metrics.messages}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Messages</div>
                    </div>
                    <div className="w-px bg-gray-150" />
                    <div>
                      <div className="text-lg lg:text-xl font-bold text-gray-950">{current.metrics.response}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Delivered</div>
                    </div>
                    <div className="w-px bg-gray-150" />
                    <div>
                      <div className="text-lg lg:text-xl font-bold text-gray-950">{current.metrics.saved}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Saved</div>
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
                    className="h-1.5 rounded-full transition-all duration-500 overflow-hidden bg-gray-100"
                    style={{
                      width: i === currentIndex ? '32px' : '8px',
                      backgroundColor: i === currentIndex ? t.accentColor : 'rgba(0,0,0,0.1)',
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
                  className="w-11 h-11 rounded-full bg-white border border-gray-200
                    hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm
                    flex items-center justify-center text-gray-500 hover:text-gray-800
                    transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { 
                    setCurrentIndex((p) => (p + 1) % testimonials.length); 
                    setIsAutoPlay(false); 
                  }}
                  className="w-11 h-11 rounded-full bg-white border border-gray-200
                    hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm
                    flex items-center justify-center text-gray-500 hover:text-gray-800
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
              <div className="text-xs font-mono uppercase tracking-widest text-gray-400 font-bold mb-4">
                More stories
              </div>
              {testimonials.map((t, i) => {
                if (i === currentIndex) return null;
                return (
                  <button
                    key={i}
                    onClick={() => { setCurrentIndex(i); setIsAutoPlay(false); }}
                    className="group w-full text-left p-4 rounded-2xl
                      bg-white border border-gray-200/60
                      hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm
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
                        <div className="text-sm font-medium text-gray-950 group-hover:text-[#2883CF] transition-colors truncate">{t.name}</div>
                        <div className="text-xs text-gray-400 truncate">{t.company}</div>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
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
        <div className="mt-20 lg:mt-24 pt-12 border-t border-gray-200">
          <div className="text-center mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-400 font-bold">
              And trusted by teams at
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-14">
            {['Flipkart', 'Zomato', 'Swiggy', 'PhonePe', 'Razorpay', 'Paytm'].map((company, i) => (
              <div 
                key={company} 
                className="text-xl lg:text-2xl font-bold text-gray-400 hover:text-gray-800
                  transition-all duration-500 cursor-default
                  hover:scale-105"
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