import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Marketing Director',
    company: 'TechStart India',
    avatar: 'PS',
    rating: 5,
    text: 'WabMeta has transformed how we communicate with our customers. We\'ve seen a 40% increase in customer engagement since we started using the platform.',
    metric: { label: 'Engagement', value: '+40%' },
  },
  {
    name: 'Rahul Verma',
    role: 'CEO',
    company: 'QuickCommerce',
    avatar: 'RV',
    rating: 5,
    text: 'The chatbot builder is incredibly intuitive. We set up our entire customer support automation in just one afternoon. Our team can now focus on complex queries.',
    metric: { label: 'Time saved', value: '40hrs/week' },
  },
  {
    name: 'Anjali Patel',
    role: 'Operations Head',
    company: 'FoodExpress',
    avatar: 'AP',
    rating: 5,
    text: 'Best WhatsApp API platform we\'ve used. Real-time analytics, reliable delivery, and excellent support — everything we needed in one place.',
    metric: { label: 'Delivery rate', value: '99%' },
  },
  {
    name: 'Vikram Singh',
    role: 'Founder',
    company: 'EduLearn',
    avatar: 'VS',
    rating: 5,
    text: 'WabMeta exceeded our expectations. The team collaboration features are fantastic for managing student queries at scale without losing the personal touch.',
    metric: { label: 'Messages sent', value: '75K+' },
  },
];

const Testimonials: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const { ref, visible } = useScrollReveal();
  const t = testimonials[idx];

  return (
    <section ref={ref} className="section-padding">
      <div className="max-w-6xl mx-auto px-5">

        <div className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-700
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-xs font-bold text-primary-600 dark:text-primary-400
            uppercase tracking-wider mb-3">Customer stories</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900
            dark:text-white leading-tight mb-4">
            Loved by growing <span className="gradient-text">teams</span>
          </h2>
        </div>

        <div className={`max-w-2xl mx-auto transition-all duration-700 delay-150
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Card */}
          <div className="bg-white dark:bg-[#111118] rounded-2xl border border-gray-100
            dark:border-white/5 shadow-card p-8">

            {/* Stars */}
            <div className="flex gap-0.5 mb-5">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>

            <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed mb-8">
              "{t.text}"
            </p>

            <div className="flex items-center justify-between">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                  flex items-center justify-center text-white text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}, {t.company}</p>
                </div>
              </div>

              {/* Metric */}
              <div className="text-right">
                <p className="text-xl font-extrabold text-primary-600">{t.metric.value}</p>
                <p className="text-xs text-gray-400">{t.metric.label}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === idx ? 'bg-primary-500 w-6' : 'bg-gray-200 dark:bg-white/10 w-1.5'
                  }`} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIdx((idx - 1 + testimonials.length) % testimonials.length)}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10
                  flex items-center justify-center text-gray-500 hover:border-primary-300
                  hover:text-primary-600 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setIdx((idx + 1) % testimonials.length)}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10
                  flex items-center justify-center text-gray-500 hover:border-primary-300
                  hover:text-primary-600 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;