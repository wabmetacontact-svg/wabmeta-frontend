import React from 'react';
import { Link2, Upload, Send, MessageSquare, Users, Zap } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';

const steps = [
  { icon: Link2,         label: 'Connect number'     },
  { icon: Upload,        label: 'Import contacts'    },
  { icon: Send,          label: 'Launch campaign'    },
  { icon: MessageSquare, label: 'Capture replies'    },
  { icon: Users,         label: 'Assign to team'     },
  { icon: Zap,           label: 'Automate follow-ups'},
];

const Workflow: React.FC = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section ref={ref} className="section-padding bg-gray-50/50 dark:bg-white/[0.01]">
      <div className="max-w-6xl mx-auto px-5">

        <div className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-700
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-xs font-bold text-primary-600 dark:text-primary-400
            uppercase tracking-wider mb-3">Workflow</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900
            dark:text-white leading-tight mb-4">
            From first contact to conversion —{' '}
            <span className="gradient-text">one connected flow</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Every step of your WhatsApp workflow, connected and visible.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-7 left-0 right-0
            h-px bg-gradient-to-r from-transparent via-primary-200
            dark:via-primary-800/40 to-transparent" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {steps.map((s, i) => (
              <div key={s.label}
                className={`relative flex flex-col items-center text-center transition-all duration-700
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: visible ? `${i * 100}ms` : '0ms' }}>

                {/* Icon circle */}
                <div className="relative z-10 w-14 h-14 rounded-2xl
                  bg-white dark:bg-[#111118]
                  border-2 border-primary-200 dark:border-primary-800/40
                  flex items-center justify-center mb-3 shadow-sm">
                  <s.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>

                <span className="text-[10px] font-bold text-primary-500 mb-1">Step {i + 1}</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;
