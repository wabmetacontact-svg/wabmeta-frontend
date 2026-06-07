import { useState } from 'react';
import { Star, Quote, MessageCircle, Instagram, Bot } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  metric: string;
  metricLabel: string;
  avatar: string;
  bgGradient: string;
  category: 'whatsapp' | 'instagram' | 'chatbot';
  featured?: boolean;
}

const testimonials: Testimonial[] = [
  {
    name: 'Rahul Sharma',
    role: 'Founder',
    company: 'QuickMart',
    content: 'WabMeta transformed how we handle customer support. Our response time dropped from 4 hours to instant. The AI chatbot handles 80% of queries automatically — game changer!',
    metric: '80%',
    metricLabel: 'queries automated',
    avatar: 'RS',
    bgGradient: 'from-green-400 to-emerald-600',
    category: 'whatsapp',
    featured: true,
  },
  {
    name: 'Priya Mehta',
    role: 'Marketing Head',
    company: 'EduLearn',
    content: 'Instagram DM automation is a game-changer. When someone comments on our reel, they automatically get course details. Enrollment went up 3x in just 2 months.',
    metric: '3x',
    metricLabel: 'course enrollment',
    avatar: 'PM',
    bgGradient: 'from-purple-400 to-pink-600',
    category: 'instagram',
  },
  {
    name: 'Arjun Patel',
    role: 'CEO',
    company: 'TravelEasy',
    content: 'We send 15,000+ WhatsApp messages monthly for tour packages. WabMeta makes it seamless. The campaign analytics help us optimize every send.',
    metric: '15K+',
    metricLabel: 'monthly messages',
    avatar: 'AP',
    bgGradient: 'from-blue-400 to-cyan-600',
    category: 'whatsapp',
  },
  {
    name: 'Sneha Gupta',
    role: 'Owner',
    company: 'FashionHub',
    content: 'The chatbot builder is incredibly intuitive. I built a complete order-tracking bot in one afternoon. My team is now free to focus on actual sales.',
    metric: '1 day',
    metricLabel: 'to build bot',
    avatar: 'SG',
    bgGradient: 'from-orange-400 to-red-600',
    category: 'chatbot',
  },
  {
    name: 'Mohammed Khan',
    role: 'Digital Manager',
    company: 'RealEstate Pro',
    content: 'Lead qualification via WhatsApp chatbot is brilliant. Prospects answer questions, get tagged in CRM automatically. Our sales cycle shortened by 40%.',
    metric: '40%',
    metricLabel: 'shorter sales cycle',
    avatar: 'MK',
    bgGradient: 'from-teal-400 to-green-600',
    category: 'chatbot',
  },
  {
    name: 'Anjali Singh',
    role: 'Co-founder',
    company: 'HealthFirst',
    content: 'Patient appointment reminders via WhatsApp have cut no-shows by 65%. Setup was super easy and the support team is always responsive.',
    metric: '65%',
    metricLabel: 'fewer no-shows',
    avatar: 'AS',
    bgGradient: 'from-indigo-400 to-purple-600',
    category: 'whatsapp',
    featured: true,
  },
  {
    name: 'Vikram Singh',
    role: 'Marketing Lead',
    company: 'FitGym',
    content: 'Story reply automation on Instagram brings 200+ leads weekly. Our gym memberships have doubled since we started using WabMeta.',
    metric: '200+',
    metricLabel: 'leads per week',
    avatar: 'VS',
    bgGradient: 'from-pink-400 to-rose-600',
    category: 'instagram',
  },
  {
    name: 'Kavita Reddy',
    role: 'Founder',
    company: 'BeautyBox',
    content: 'WhatsApp catalog feature is amazing! Customers browse products and order directly in chat. Our conversion rate is 4x higher than our website.',
    metric: '4x',
    metricLabel: 'higher conversion',
    avatar: 'KR',
    bgGradient: 'from-fuchsia-400 to-purple-600',
    category: 'whatsapp',
  },
  {
    name: 'Rohit Verma',
    role: 'Operations',
    company: 'FoodieDelights',
    content: 'Order confirmations, delivery updates, feedback collection — all automated via WabMeta. Saved us 20+ hours per week on customer communication.',
    metric: '20hr',
    metricLabel: 'saved weekly',
    avatar: 'RV',
    bgGradient: 'from-amber-400 to-orange-600',
    category: 'chatbot',
  },
];

const categoryConfig = {
  all: { label: 'All Stories', icon: Star, color: 'text-gray-700' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600' },
  instagram: { label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  chatbot: { label: 'AI Chatbot', icon: Bot, color: 'text-purple-600' },
};

const Testimonials = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'whatsapp' | 'instagram' | 'chatbot'>('all');

  const filteredTestimonials = activeCategory === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.category === activeCategory);

  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-gray-50/30 to-white overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute top-40 right-10 w-96 h-96 bg-green-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* ═══════ Section Header ═══════ */}
        <div className="grid grid-cols-12 gap-6 mb-16 lg:mb-24">
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gray-200" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 font-bold">
                Loved by businesses
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-gray-950">
              <span>Real businesses.</span>{' '}
              <br />
              <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 bg-clip-text text-transparent">
                Real results.
              </span>
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:pt-12 flex flex-col items-start gap-6">
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
              Join 10,000+ growing businesses who are automating conversations and scaling their growth with WabMeta.
            </p>
            
            {/* Category Filter Tabs */}
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm flex-wrap">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon;
                const isActive = activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key as any)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={12} className={isActive ? 'text-white' : config.color} />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════ Stats Bar ═══════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          {[
            { value: '10,000+', label: 'Happy Businesses' },
            { value: '50M+', label: 'Messages Sent' },
            { value: '4.9/5', label: 'Average Rating' },
            { value: '98%', label: 'Would Recommend' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-heading font-bold text-2xl md:text-3xl bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ═══════ Masonry Grid of Testimonials ═══════ */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {filteredTestimonials.map((testimonial, i) => (
            <TestimonialCard key={`${testimonial.name}-${i}`} testimonial={testimonial} />
          ))}
        </div>

        {/* ═══════ Bottom CTA ═══════ */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm mb-4">
            Want to share your story?
          </p>
          <a 
            href="mailto:hello@wabmeta.com"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm group"
          >
            Send us your testimonial 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// Testimonial Card Component
// ═══════════════════════════════════════════════════
const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const categoryIcons = {
    whatsapp: { Icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-50' },
    instagram: { Icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-50' },
    chatbot: { Icon: Bot, color: 'text-purple-500', bg: 'bg-purple-50' },
  };

  const { Icon, color, bg } = categoryIcons[testimonial.category];

  return (
    <div 
      className={`break-inside-avoid group relative ${
        testimonial.featured 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200 hover:border-gray-300'
      } rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden`}
    >
      {/* Quote icon (background) */}
      <Quote 
        size={80} 
        className={`absolute -top-2 -right-2 opacity-[0.06] ${
          testimonial.featured ? 'text-white' : 'text-gray-900'
        }`}
        strokeWidth={1}
      />

      {/* Category badge */}
      <div className={`inline-flex items-center gap-1.5 ${
        testimonial.featured 
          ? 'bg-white/10 border-white/20' 
          : `${bg} border-transparent`
      } border rounded-full px-2.5 py-1 mb-4`}>
        <Icon size={12} className={testimonial.featured ? 'text-white' : color} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${
          testimonial.featured ? 'text-white' : color
        }`}>
          {testimonial.category}
        </span>
      </div>

      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, j) => (
          <Star 
            key={j} 
            size={14} 
            className={`fill-yellow-400 text-yellow-400`}
          />
        ))}
      </div>

      {/* Content */}
      <p className={`text-sm leading-relaxed mb-5 ${
        testimonial.featured ? 'text-gray-100' : 'text-gray-700'
      }`}>
        "{testimonial.content}"
      </p>

      {/* Metric Badge */}
      <div className={`inline-flex items-center gap-2 mb-5 px-3 py-2 rounded-xl ${
        testimonial.featured 
          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30' 
          : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
      }`}>
        <span className="text-lg">📈</span>
        <div>
          <div className={`font-heading font-bold text-base leading-none ${
            testimonial.featured ? 'text-green-300' : 'text-green-700'
          }`}>
            {testimonial.metric}
          </div>
          <div className={`text-[10px] ${
            testimonial.featured ? 'text-green-200/80' : 'text-green-600'
          } mt-0.5`}>
            {testimonial.metricLabel}
          </div>
        </div>
      </div>

      {/* Author */}
      <div className={`flex items-center gap-3 pt-4 border-t ${
        testimonial.featured ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.bgGradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md`}>
          {testimonial.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-bold ${
            testimonial.featured ? 'text-white' : 'text-gray-900'
          }`}>
            {testimonial.name}
          </div>
          <div className={`text-xs ${
            testimonial.featured ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {testimonial.role} · {testimonial.company}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;