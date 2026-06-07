import { Link } from 'react-router-dom';
import { 
  ArrowRight, Check, ShieldCheck, MessageCircle, 
  Instagram, Bot, TrendingUp, Send, 
  Paperclip, Camera, Mic, Users, MessageSquare, Headphones
} from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-white pt-28 pb-12 overflow-hidden">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-green-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-pink-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Main Grid: Left Content + Right Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          
          {/* ═══════ LEFT SIDE - Content ═══════ */}
          <div className="space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
              <ShieldCheck size={16} className="text-green-600" />
              <span className="text-green-700 text-sm font-medium">
                Official Meta Business Partner
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] tracking-tight">
              One Platform for{' '}
              <span className="text-green-500">WhatsApp</span>{' '}
              &{' '}
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Instagram
              </span>{' '}
              Automation Powered by AI
            </h1>

            {/* Subheading */}
            <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
              Automate conversations, run targeted campaigns, build AI chatbots, 
              capture leads and grow your business — all from one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-7 py-3.5 rounded-xl border-2 border-gray-200 hover:border-green-500 transition-all duration-200">
                Book a Demo
              </button>
            </div>

            {/* Trust Points */}
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                'No credit card required',
                '14-day free trial',
                'Cancel anytime'
              ].map((point) => (
                <div key={point} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-gray-600 text-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════ RIGHT SIDE - Phone Mockup with Floating Cards ═══════ */}
          <div className="relative h-[600px] lg:h-[700px]">
            
            {/* Decorative connecting lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 700">
              <line x1="180" y1="200" x2="280" y2="280" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
              <line x1="420" y1="180" x2="380" y2="240" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
              <line x1="200" y1="540" x2="280" y2="500" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
              <line x1="420" y1="600" x2="380" y2="540" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
            </svg>

            {/* Floating Icon Circles */}
            <div className="absolute top-[25%] left-[5%] w-14 h-14 bg-white border-2 border-green-200 rounded-full flex items-center justify-center shadow-lg z-10 animate-float-slow">
              <MessageCircle size={22} className="text-green-500" />
            </div>

            <div className="absolute top-[10%] right-[15%] w-14 h-14 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center shadow-lg z-10 animate-float">
              <Bot size={22} className="text-blue-500" />
            </div>

            <div className="absolute bottom-[20%] left-[15%] w-14 h-14 bg-white border-2 border-pink-200 rounded-full flex items-center justify-center shadow-lg z-10 animate-float-delay">
              <Instagram size={22} className="text-pink-500" />
            </div>

            <div className="absolute bottom-[5%] right-[20%] w-14 h-14 bg-white border-2 border-purple-200 rounded-full flex items-center justify-center shadow-lg z-10 animate-float-slow">
              <TrendingUp size={22} className="text-purple-500" />
            </div>

            {/* ═══════ PHONE MOCKUP (Center) ═══════ */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="relative w-[280px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-full z-30" />
                
                {/* Screen */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold text-gray-900">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px]">•••</span>
                      <span className="text-[10px]">📶</span>
                      <span className="text-[10px]">🔋</span>
                    </div>
                  </div>

                  {/* WhatsApp Header */}
                  <div className="bg-white px-3 py-2.5 flex items-center gap-2 border-b border-gray-100">
                    <ArrowRight size={16} className="text-gray-700 rotate-180" />
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      W
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">WabMeta Store</span>
                        <ShieldCheck size={12} className="text-green-500 fill-green-500" />
                      </div>
                      <span className="text-[10px] text-gray-500">Business Account</span>
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="bg-[#ECE5DD] p-3 space-y-2 min-h-[400px]">
                    
                    {/* Message Bubble */}
                    <div className="bg-white rounded-2xl rounded-tl-sm p-3 max-w-[85%] shadow-sm">
                      <p className="text-xs text-gray-800 mb-1">Hi there! 👋</p>
                      <p className="text-xs text-gray-800 mb-2">Check out our latest products.</p>
                      <span className="text-[9px] text-gray-400 float-right">11:30 AM</span>
                    </div>

                    {/* Product Cards */}
                    <div className="bg-white rounded-2xl rounded-tl-sm p-2 max-w-[90%] shadow-sm space-y-2">
                      
                      {[
                        { name: 'Sneakers', price: '₹1,299', emoji: '👟' },
                        { name: 'Smart Watch', price: '₹2,999', emoji: '⌚' },
                        { name: 'Backpack', price: '₹899', emoji: '🎒' },
                      ].map((product, i) => (
                        <div key={i} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm">
                            {product.emoji}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-600">{product.price}</p>
                          </div>
                        </div>
                      ))}

                      <button className="w-full text-center text-xs text-blue-500 font-medium py-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                        View More
                      </button>
                    </div>
                  </div>

                  {/* Input Bar */}
                  <div className="bg-gray-50 px-3 py-2 flex items-center gap-2">
                    <div className="flex-1 bg-white rounded-full px-3 py-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Type a message</span>
                      <div className="flex items-center gap-2">
                        <Paperclip size={12} className="text-gray-500" />
                        <Camera size={12} className="text-gray-500" />
                      </div>
                    </div>
                    <button className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center">
                      <Mic size={14} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════ FLOATING CARD 1: AI Assistant (Top Right) ═══════ */}
            <div className="absolute top-[8%] right-0 w-64 z-30 animate-float-slow hidden md:block">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                    <Bot size={14} className="text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">AI Assistant</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">Customer:</span> What is the price?
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <span className="font-semibold">AI:</span> The price starts from ₹999. Would you like a product catalog?
                  </p>
                  <div className="flex items-center justify-end gap-1 pt-1">
                    <span className="text-[10px] text-gray-500">11:30 AM</span>
                    <Check size={10} className="text-blue-500" />
                    <Check size={10} className="text-blue-500 -ml-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════ FLOATING CARD 2: Campaign Report (Middle Right) ═══════ */}
            <div className="absolute top-[45%] right-0 w-64 z-30 animate-float hidden md:block">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Send size={14} className="text-green-500" />
                  <span className="text-sm font-semibold text-gray-900">Summer Sale Campaign</span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { label: 'Delivered', value: '45,000', progress: 100, color: 'bg-green-500' },
                    { label: 'Read', value: '39,000', progress: 87, color: 'bg-green-400' },
                    { label: 'Replies', value: '8,200', progress: 18, color: 'bg-green-300' },
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">{stat.label}</span>
                        <span className="text-xs font-semibold text-gray-900">{stat.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${stat.color} rounded-full transition-all`}
                          style={{ width: `${stat.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full text-center text-xs text-green-600 font-medium mt-4 py-2 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                  Open Report
                </button>
              </div>
            </div>

            {/* ═══════ FLOATING CARD 3: Instagram Comment (Bottom Left) ═══════ */}
            <div className="absolute bottom-[15%] left-0 w-60 z-30 animate-float-delay hidden md:block">
              <div className="bg-white border border-pink-200 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                    <Instagram size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Instagram Comment</span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">User:</span> Price?
                  </p>
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">Auto Reply:</span> Check your DM 📩
                  </p>
                </div>

                <button className="w-full text-center text-xs text-pink-600 font-medium py-2 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors flex items-center justify-center gap-1">
                  View in Inbox
                  <ArrowRight size={10} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ STATS BAR ═══════ */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {[
              { 
                icon: Users, 
                value: '10,000+', 
                label: 'Businesses Trust Us',
                bg: 'bg-green-100',
                color: 'text-green-600'
              },
              { 
                icon: MessageSquare, 
                value: '50M+', 
                label: 'Messages Delivered',
                bg: 'bg-blue-100',
                color: 'text-blue-600'
              },
              { 
                icon: ShieldCheck, 
                value: '99.9%', 
                label: 'Uptime & Reliability',
                bg: 'bg-purple-100',
                color: 'text-purple-600'
              },
              { 
                icon: Headphones, 
                value: '24/7', 
                label: 'AI Support',
                bg: 'bg-orange-100',
                color: 'text-orange-600'
              },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ═══════ TRUSTED BY BRANDS ═══════ */}
      <div className="mt-16 bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 py-6 overflow-hidden shadow-2xl border-y border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-4 text-center">
          <p className="text-green-100/75 text-xs font-bold uppercase tracking-[0.2em]">
            Trusted by growing businesses worldwide
          </p>
        </div>
        
        <div className="group relative w-full overflow-hidden flex select-none py-2">
          {/* Left and Right Fade Overlays for Premium Depth */}
          <div className="absolute top-0 bottom-0 left-0 w-20 md:w-40 bg-gradient-to-r from-green-700 to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-20 md:w-40 bg-gradient-to-l from-green-700 to-transparent z-20 pointer-events-none" />

          {/* Marquee Group 1 */}
          <div className="flex shrink-0 gap-16 items-center min-w-full animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused] py-1">
            {['CERA', 'boAt', 'AJIO', 'OYO', 'HDFC BANK', 'Levis', 'lenskart', 'TATA'].map((brand, idx) => (
              <div key={`brand-1-${idx}`} className="flex items-center gap-16">
                <span className="text-white/90 hover:text-white hover:scale-105 transition-all duration-300 font-extrabold text-xl md:text-2xl tracking-widest cursor-default select-none">
                  {brand}
                </span>
                <span className="text-green-300/40 text-xl font-light select-none">✦</span>
              </div>
            ))}
          </div>
          
          {/* Marquee Group 2 (Duplicate for Seamless Loop) */}
          <div className="flex shrink-0 gap-16 items-center min-w-full animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused] py-1" aria-hidden="true">
            {['CERA', 'boAt', 'AJIO', 'OYO', 'HDFC BANK', 'Levis', 'lenskart', 'TATA'].map((brand, idx) => (
              <div key={`brand-2-${idx}`} className="flex items-center gap-16">
                <span className="text-white/90 hover:text-white hover:scale-105 transition-all duration-300 font-extrabold text-xl md:text-2xl tracking-widest cursor-default select-none">
                  {brand}
                </span>
                <span className="text-green-300/40 text-xl font-light select-none">✦</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;