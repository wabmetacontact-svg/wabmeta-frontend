import React from 'react';
import { useScrollReveal } from './useScrollReveal';

const FounderNote: React.FC = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section ref={ref} className="section-padding bg-gray-50/50 dark:bg-white/[0.01]">
      <div className="max-w-3xl mx-auto px-5">
        <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Quote mark */}
          <div className="text-6xl font-serif text-primary-200 dark:text-primary-900/60 leading-none mb-4">
            "
          </div>

          <blockquote className="text-xl lg:text-2xl font-medium text-gray-700 dark:text-gray-200
            leading-relaxed mb-8">
            We built WabMeta because we were frustrated with how complicated it was to use WhatsApp
            Business API for real campaigns. Most tools were either too basic or too complex.
            We wanted something that just worked — for campaigns, conversations, and automation
            all in one place.
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
              flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Sameer Thakur</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Founder, WabMeta</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderNote;
