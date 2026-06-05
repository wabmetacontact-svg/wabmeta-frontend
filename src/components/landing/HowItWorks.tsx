import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  Link2, 
  MessageSquare, 
  Rocket,
  ArrowRight,
  Check,
  Clock,
} from 'lucide-react';

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      step: '01',
      icon: UserPlus,
      time: '~2 min',
      title: 'Create your account',
      shortTitle: 'Sign up',
      description: 'No credit card. No "talk to sales". Just an email, a password, and you\'re in.',
      details: [
        'Email + password, that\'s it',
        '2-day free trial unlocked instantly',
        'Skip onboarding if you want'
      ],
      accentColor: '#2883CF',
      gradientFrom: 'from-blue-500/10',
      gradientTo: 'to-sky-500/2',
      iconBg: 'from-[#2883CF] to-sky-600',
    },
    {
      step: '02',
      icon: Link2,
      time: '~3 min',
      title: 'Connect WhatsApp',
      shortTitle: 'Connect',
      description: 'Embedded Meta signup. Click, login to Facebook, done. We handle the API headaches.',
      details: [
        'Official Meta embedded signup',
        'Auto phone number verification',
        'No webhook config needed'
      ],
      accentColor: '#2563eb',
      gradientFrom: 'from-blue-500/10',
      gradientTo: 'to-cyan-500/2',
      iconBg: 'from-blue-500 to-cyan-600',
    },
    {
      step: '03',
      icon: MessageSquare,
      time: '~1 min',
      title: 'Bring your contacts',
      shortTitle: 'Import',
      description: 'Drop a CSV. Paste numbers. Or sync from your CRM. We figure out the rest.',
      details: [
        'CSV / Excel drag & drop',
        'Smart duplicate detection',
        'Auto-tag by source'
      ],
      accentColor: '#9333ea',
      gradientFrom: 'from-purple-500/10',
      gradientTo: 'to-pink-500/2',
      iconBg: 'from-purple-500 to-pink-600',
    },
    {
      step: '04',
      icon: Rocket,
      time: 'now',
      title: 'Send your first campaign',
      shortTitle: 'Launch',
      description: 'Pick a template, hit send. Track opens, replies, and conversions in real-time.',
      details: [
        'Pre-approved templates ready',
        'Variable personalization',
        'Live delivery tracking'
      ],
      accentColor: '#d97706',
      gradientFrom: 'from-amber-500/10',
      gradientTo: 'to-orange-500/2',
      iconBg: 'from-amber-500 to-orange-600',
    }
  ];

  // ✅ Auto-cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden bg-white">

      {/* ✅ Light Mode Background with soft radial blobs & grid lines */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 50% 40% at 80% 20%, rgba(40, 131, 207, 0.05) 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 20% 80%, rgba(59, 130, 246, 0.04) 0%, transparent 60%)
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
        <div className="grid grid-cols-12 gap-6 mb-16 lg:mb-24">
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gray-200" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 font-bold">
                The setup
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="text-gray-950">From signup to first send</span>
              <br />
              <span className="bg-gradient-to-r from-[#2883CF] to-sky-500 bg-clip-text text-transparent italic">
                in under 6 minutes.
              </span>
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:pt-16">
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed mb-4">
              We've watched 800+ businesses go through onboarding. We timed every step. We removed every friction point.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Avg. total time: 5m 47s</span>
            </div>
          </div>
        </div>

        {/* ✅ INTERACTIVE STEPS */}
        <div className="grid grid-cols-12 gap-6 lg:gap-10">

          {/* LEFT: Step navigator */}
          <div className="col-span-12 lg:col-span-5">
            <div className="space-y-3">
              {steps.map((step, index) => {
                const isActive = activeStep === index;
                return (
                  <button
                    key={step.step}
                    onClick={() => setActiveStep(index)}
                    className={`group w-full text-left relative
                      rounded-2xl overflow-hidden
                      transition-all duration-500 ease-out
                      ${isActive 
                        ? 'bg-white shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-gray-200 scale-[1.02]' 
                        : 'bg-white border border-gray-200/60 hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    {/* Active gradient bg */}
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.gradientFrom} ${step.gradientTo} opacity-100 transition-opacity`} />
                    )}

                    {/* Active left bar */}
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-500`}
                      style={{ 
                        backgroundColor: step.accentColor,
                        opacity: isActive ? 1 : 0,
                        boxShadow: isActive ? `0 0 20px ${step.accentColor}80` : 'none',
                      }}
                    />

                    <div className="relative flex items-center gap-4 p-5">

                      {/* Step number / Icon */}
                      <div className="flex-shrink-0">
                        <div className={`relative w-12 h-12 rounded-xl 
                          flex items-center justify-center transition-all duration-500
                          ${isActive 
                            ? `bg-gradient-to-br ${step.iconBg} shadow-lg` 
                            : 'bg-gray-50 border border-gray-100'
                          }
                        `}
                        style={{
                          boxShadow: isActive ? `0 8px 24px ${step.accentColor}30` : 'none',
                        }}
                        >
                          {isActive ? (
                            <step.icon className="w-5 h-5 text-white" />
                          ) : (
                            <span className="text-xs font-mono font-bold text-gray-400">
                              {step.step}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-mono uppercase tracking-wider transition-colors
                            ${isActive ? 'text-gray-500' : 'text-gray-400'}
                          `}>
                            Step {step.step}
                          </span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className={`text-xs font-mono transition-colors
                            ${isActive ? 'text-gray-500' : 'text-gray-400'}
                          `}>
                            {step.time}
                          </span>
                        </div>
                        <h3 className={`text-base lg:text-lg font-semibold transition-colors
                          ${isActive ? 'text-gray-950' : 'text-gray-500 group-hover:text-gray-700'}
                        `}>
                          {step.title}
                        </h3>
                      </div>

                      {/* Active indicator dot */}
                      {isActive && (
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <span className="absolute inset-0 rounded-full animate-ping"
                              style={{ backgroundColor: step.accentColor, opacity: 0.4 }}
                            />
                            <span className="relative block w-2 h-2 rounded-full"
                              style={{ backgroundColor: step.accentColor }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progress indicator */}
            <div className="mt-8 flex items-center gap-2">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full flex-1 overflow-hidden bg-gray-100"
                >
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                      width: activeStep === i ? '100%' : activeStep > i ? '100%' : '0%',
                      backgroundColor: step.accentColor,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Active step detail card */}
          <div className="col-span-12 lg:col-span-7">
            <div className="sticky top-32">
              {steps.map((step, index) => {
                const isActive = activeStep === index;
                if (!isActive) return null;

                return (
                  <div
                    key={step.step}
                    className="relative rounded-3xl overflow-hidden
                      bg-white
                      border border-gray-200
                      shadow-[0_20px_40px_rgba(0,0,0,0.06)]
                      p-8 lg:p-10
                      animate-fadeIn"
                  >
                    {/* Gradient bg */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradientFrom} ${step.gradientTo} opacity-100`} />

                    {/* Shimmer */}
                    <div className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%)',
                      }}
                    />

                    {/* Top edge */}
                    <div className="absolute top-0 left-[10%] right-[10%] h-px 
                      bg-gradient-to-r from-transparent via-white/80 to-transparent" />

                    <div className="relative">

                      {/* Big step number watermark */}
                      <div className="absolute top-0 right-0 text-[8rem] lg:text-[10rem] font-bold 
                        bg-gradient-to-br from-gray-900/[0.06] to-transparent bg-clip-text text-transparent
                        leading-none select-none pointer-events-none">
                        {step.step}
                      </div>

                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.iconBg}
                        flex items-center justify-center mb-6
                        shadow-lg`}
                        style={{
                          boxShadow: `0 12px 32px ${step.accentColor}40`,
                        }}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-3xl lg:text-4xl font-bold text-gray-950 mb-4 tracking-tight">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-base lg:text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
                        {step.description}
                      </p>

                      {/* Detail checkmarks */}
                      <div className="space-y-3">
                        {step.details.map((detail, i) => (
                          <div
                            key={detail}
                            className="flex items-center gap-3 text-gray-700"
                            style={{
                              animation: `slideUp 0.4s ease-out ${i * 100}ms backwards`,
                            }}
                          >
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${step.accentColor}15`, border: `1px solid ${step.accentColor}30` }}
                            >
                              <Check className="w-3 h-3" style={{ color: step.accentColor }} strokeWidth={3} />
                            </div>
                            <span className="text-sm lg:text-base font-medium">{detail}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom meta */}
                      <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          Takes about {step.time}
                        </div>
                        <div className="text-xs font-mono text-gray-400">
                          {step.step} / 04
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ✅ Bottom CTA - minimal */}
        <div className="mt-20 lg:mt-24 flex flex-col items-center text-center">
          <p className="text-sm font-mono text-gray-600 mb-6 max-w-md">
            Watch a real founder go through this entire flow on a screen recording.
          </p>

          <Link
            to="/signup"
            className="group inline-flex items-center gap-3 
              bg-gradient-to-r from-[#2883CF] to-sky-500
              text-white px-8 py-4 rounded-full text-[15px] font-semibold
              shadow-[0_8px_32px_rgba(40,131,207,0.25)]
              hover:shadow-[0_12px_40px_rgba(40,131,207,0.45)]
              hover:-translate-y-0.5
              transition-all duration-500 ease-out
              border border-blue-500/30
              overflow-hidden relative"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent
              -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative">Try the whole flow yourself</span>
            <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="mt-4 text-xs text-gray-500">
            No card. No commitment. 2 days free.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;