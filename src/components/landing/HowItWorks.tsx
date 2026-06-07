import { 
  Zap, ChevronRight, Check, MessageCircle, Instagram, 
  Bot, ShieldCheck, BookOpen, Headphones, Sparkles,
  ArrowRight
} from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      title: 'Connect',
      description: 'Link your WhatsApp or Instagram account',
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      number: '2',
      title: 'Set Up',
      description: 'Create your profile and configure your preferences',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      number: '3',
      title: 'Automate',
      description: 'Build your chatbot or choose from ready-made templates',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      number: '4',
      title: 'Engage',
      description: 'Launch campaigns and start conversations instantly',
      color: 'bg-pink-500',
      lightColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
    {
      number: '5',
      title: 'Grow',
      description: 'Track performance and scale your business',
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  return (
    <section className="relative pt-12 pb-24 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 overflow-hidden">
      
      {/* Decorative dots pattern */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* ═══════ Section Header ═══════ */}
        <div className="relative mb-20">
          
          {/* LEFT: Decorative Icons (Hidden on mobile) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="relative w-64 h-48">
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 256 192">
                <ellipse cx="128" cy="96" rx="100" ry="70" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
              
              {/* WhatsApp */}
              <div className="absolute top-2 left-12 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-float-slow">
                <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
                  <MessageCircle size={20} className="text-white fill-white" />
                </div>
              </div>
              
              {/* Instagram */}
              <div className="absolute bottom-4 left-0 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-float">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center">
                  <Instagram size={20} className="text-white" />
                </div>
              </div>
              
              {/* Bot */}
              <div className="absolute bottom-12 left-32 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-float-delay">
                <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
              </div>
              
              {/* Green dot */}
              <div className="absolute top-12 right-4 w-3 h-3 bg-green-500 rounded-full" />
            </div>
          </div>

          {/* CENTER: Heading */}
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-6">
              <Zap size={16} className="text-green-600 fill-green-600" />
              <span className="text-green-700 text-sm font-semibold tracking-wide">
                QUICK & EASY SETUP
              </span>
            </div>

            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-6">
              Get WabMeta up and running in just{' '}
              <span className="text-green-500">a few minutes</span>
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed">
              Connect your channels, set up automation and start engaging with 
              your customers — all in just a few simple steps.
            </p>
          </div>

          {/* RIGHT: Setup Complete Card (Hidden on mobile) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="relative">
              {/* Floating dots */}
              <div className="absolute -top-4 -left-8 w-3 h-3 bg-purple-400 rotate-45" />
              <div className="absolute -top-2 right-0 w-2.5 h-2.5 bg-yellow-400 rounded-full" />
              <div className="absolute top-12 -right-6 w-3 h-3 bg-blue-400 rounded-full" />
              <div className="absolute bottom-8 -right-8 w-3 h-3 bg-yellow-400 rotate-45" />
              <div className="absolute -bottom-2 left-4 w-3 h-3 bg-pink-400 rotate-45" />
              <div className="absolute top-1/2 -left-12 w-2.5 h-2.5 bg-pink-300 rounded-full" />
              <div className="absolute -bottom-4 right-12 w-3 h-3 bg-green-400 rounded-sm" />
              
              {/* Card */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 w-56 rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Check size={28} className="text-white" strokeWidth={3} />
                </div>
                <h4 className="font-heading font-bold text-base text-gray-900 text-center mb-1">
                  Setup Complete!
                </h4>
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  You're all set to engage and grow your business.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ Steps Header Row ═══════ */}
        <div className="hidden lg:grid grid-cols-5 gap-4 mb-8 relative">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Step Header */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0`}>
                  {step.number}
                </div>
                <div className="flex-1 pt-0.5">
                  <h3 className="font-heading font-bold text-base text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-snug">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Arrow Connector */}
              {index < steps.length - 1 && (
                <div className="absolute top-5 -right-2 flex items-center z-10">
                  <div className="w-6 border-t border-dashed border-gray-300" />
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ═══════ Mobile Steps Header ═══════ */}
        <div className="lg:hidden space-y-4 mb-8">
          {steps.map((step) => (
            <div key={step.number} className="flex items-start gap-3 bg-white border border-gray-200 rounded-2xl p-4">
              <div className={`w-10 h-10 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0`}>
                {step.number}
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-600 leading-snug">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════ Step Cards Row (Interactive Previews) ═══════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          
          {/* ━━━ Card 1: Connect Channel ━━━ */}
          <div className="bg-green-100/50 border-2 border-green-300/70 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-green-400 transition-all duration-300">
            <h4 className="font-heading font-bold text-base text-gray-900 mb-1">Connect Your Channel</h4>
            <p className="text-xs text-gray-500 mb-4">Choose a channel to get started</p>
            
            <div className="space-y-3 mb-4">
              {/* WhatsApp Option (Selected) */}
              <div className="border-2 border-green-400 bg-green-50/40 rounded-xl p-3 flex items-center gap-3 relative">
                <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-white fill-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                  <p className="text-[10px] text-gray-500 truncate">Connect your WhatsApp Business account</p>
                </div>
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </div>
              </div>

              {/* Instagram Option */}
              <div className="border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Instagram size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Instagram</p>
                  <p className="text-[10px] text-gray-500 truncate">Connect your Instagram Business account</p>
                </div>
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
              </div>
            </div>

            <button className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5">
              Connect Now <ArrowRight size={14} />
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-2">It only takes a few seconds</p>
          </div>

          {/* ━━━ Card 2: Business Profile ━━━ */}
          <div className="bg-purple-100/50 border-2 border-purple-300/70 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-purple-400 transition-all duration-300">
            <h4 className="font-heading font-bold text-base text-gray-900 mb-1">Business Profile</h4>
            <p className="text-xs text-gray-500 mb-4">Set up your business details</p>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Business Name</label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 bg-gray-50">
                  Acme Store
                </div>
              </div>
              
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Business Category</label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 bg-gray-50 flex items-center justify-between">
                  <span>E-commerce</span>
                  <ChevronRight size={12} className="text-gray-400 rotate-90" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Time Zone</label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 bg-gray-50">
                  (GMT+05:30) Asia/Kolkata
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Language</label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 bg-gray-50 flex items-center justify-between">
                  <span>English</span>
                  <ChevronRight size={12} className="text-gray-400 rotate-90" />
                </div>
              </div>
            </div>

            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5">
              Save & Continue <ArrowRight size={14} />
            </button>
          </div>

          {/* ━━━ Card 3: Choose Bot ━━━ */}
          <div className="bg-blue-100/50 border-2 border-blue-300/70 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-300">
            <h4 className="font-heading font-bold text-base text-gray-900 mb-1">Choose Your Bot</h4>
            <p className="text-xs text-gray-500 mb-4">Build or choose a chatbot</p>
            
            <div className="space-y-2 mb-4">
              {/* AI Chatbot (Selected) */}
              <div className="border-2 border-blue-400 bg-blue-50/30 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={14} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-gray-900">AI Chatbot</p>
                      <span className="text-[9px] text-blue-600 italic">(Recommended)</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-snug mt-0.5">
                      Smart AI-powered chatbot that can understand and reply automatically.
                    </p>
                  </div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              {/* Template Bots */}
              <div className="border border-gray-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen size={14} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">Template Bots</p>
                    <p className="text-[10px] text-gray-500 leading-snug mt-0.5">
                      Choose from our ready-made chatbot templates.
                    </p>
                  </div>
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                </div>
              </div>

              {/* Custom Bot */}
              <div className="border border-gray-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles size={14} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">Custom Bot</p>
                    <p className="text-[10px] text-gray-500 leading-snug mt-0.5">
                      Build your own chatbot from scratch.
                    </p>
                  </div>
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                </div>
              </div>
            </div>

            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5">
              Create Bot <ArrowRight size={14} />
            </button>
          </div>

          {/* ━━━ Card 4: Launch Campaign ━━━ */}
          <div className="bg-pink-100/50 border-2 border-pink-300/70 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-pink-400 transition-all duration-300">
            <h4 className="font-heading font-bold text-base text-gray-900 mb-1">Launch Campaign</h4>
            <p className="text-xs text-gray-500 mb-4">Send messages to your audience</p>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Campaign Name</label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 bg-gray-50">
                  Summer Sale 2024
                </div>
              </div>
              
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Audience</label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 bg-gray-50 flex items-center justify-between">
                  <span>All Customers (45,230)</span>
                  <ChevronRight size={12} className="text-gray-400 rotate-90" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Message Preview</label>
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-base">🎉</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Summer Sale is Live!</p>
                      <p className="text-[10px] text-gray-700">Get Flat 50% OFF on all products. Shop now!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5">
              Send Campaign 🚀
            </button>
          </div>

          {/* ━━━ Card 5: Track & Grow ━━━ */}
          <div className="bg-green-100/50 border-2 border-green-300/70 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-green-400 transition-all duration-300">
            <h4 className="font-heading font-bold text-base text-gray-900 mb-1">Track & Grow</h4>
            <p className="text-xs text-gray-500 mb-4">Monitor performance in real-time</p>
            
            <div className="space-y-3 mb-4">
              {[
                { label: 'Messages Sent', value: '45,230', change: '+32%' },
                { label: 'Delivered', value: '44,230', change: '+28%' },
                { label: 'Read', value: '31,421', change: '+24%' },
                { label: 'Replies', value: '6,782', change: '+38%' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{stat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{stat.value}</span>
                    <span className="text-green-500 text-[10px] font-semibold">↑ {stat.change}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full bg-green-50 hover:bg-green-100 text-green-600 text-sm font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 mb-3 border border-green-200">
              View Analytics <ArrowRight size={14} />
            </button>

            {/* Growth chart */}
            <svg className="w-full" height="50" viewBox="0 0 200 50">
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d="M0,40 Q20,38 40,32 T80,25 T120,20 T160,12 T200,5 L200,50 L0,50 Z" 
                fill="url(#growthGradient)" 
              />
              <path 
                d="M0,40 Q20,38 40,32 T80,25 T120,20 T160,12 T200,5" 
                fill="none" 
                stroke="#22c55e" 
                strokeWidth="2" 
              />
            </svg>
          </div>
        </div>

        {/* ═══════ Bottom Trust Bar ═══════ */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                bg: 'bg-green-100',
                color: 'text-green-600',
                title: 'Secure & Reliable',
                desc: 'Enterprise-grade security and 99.9% uptime',
              },
              {
                icon: Zap,
                bg: 'bg-blue-100',
                color: 'text-blue-600',
                title: 'No Coding Needed',
                desc: 'Set up everything without any technical skills',
              },
              {
                icon: Headphones,
                bg: 'bg-purple-100',
                color: 'text-purple-600',
                title: '24/7 Support',
                desc: 'Our support team is always here to help you',
              },
              {
                icon: BookOpen,
                bg: 'bg-pink-100',
                color: 'text-pink-600',
                title: 'Free Resources',
                desc: 'Access guides, templates and video tutorials',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon size={22} className={item.color} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-gray-900 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;