import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';

const CTA: React.FC = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section ref={ref} className="section-padding">
      <div className="max-w-4xl mx-auto px-5">
        <div className={`relative overflow-hidden rounded-3xl bg-primary-600 dark:bg-primary-700
          p-10 lg:p-16 text-center transition-all duration-700
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px]
            bg-white/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white
              leading-tight mb-4">
              Start building on WhatsApp today
            </h2>
            <p className="text-primary-100 text-base lg:text-lg mb-8 max-w-xl mx-auto">
              2-day free trial. No credit card. Up and running in minutes.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/signup"
                className="group inline-flex items-center gap-2 px-7 py-3.5
                  bg-white text-primary-700 text-sm font-semibold rounded-xl
                  hover:bg-primary-50 transition-colors shadow-lg shadow-primary-900/20">
                Start free trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href="https://wa.me/919211938200?text=Hi, I'd like a demo of WabMeta!"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5
                  bg-primary-500 hover:bg-primary-400 text-white text-sm font-semibold
                  rounded-xl border border-white/20 transition-colors">
                Book a demo
              </a>
            </div>

            <p className="mt-6 text-xs text-primary-200">
              No credit card required · Cancel anytime · Official WhatsApp API
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;