import React from 'react';
import { X, Check } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';

const problems = [
  'Campaigns and replies live in different tools',
  'Team handoffs on WhatsApp feel messy',
  'Contact lists stay unorganized',
  'Automation breaks after basic use cases',
  'No clear reporting or delivery visibility',
];

const solutions = [
  'One workspace for campaigns, inbox, and bots',
  'Assign chats, add notes, collaborate cleanly',
  'Import, tag, segment — all built in',
  'Visual flow builder with triggers and conditions',
  'Campaign, delivery, and team analytics in one place',
];

const ProblemSolution: React.FC = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section ref={ref} className="section-padding">
      <div className="max-w-6xl mx-auto px-5">

        <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900
            dark:text-white leading-tight mb-4">
            Most WhatsApp workflows break{' '}
            <span className="gradient-text">as teams scale</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Managing campaigns, replies, and automation across disconnected
            tools creates gaps that slow your team down.
          </p>
        </div>

        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 transition-all duration-700 delay-200
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Problems */}
          <div className="p-7 rounded-2xl bg-red-50/60 dark:bg-red-950/10
            border border-red-100/80 dark:border-red-900/20">
            <p className="text-xs font-bold text-red-500 dark:text-red-400
              uppercase tracking-wider mb-5">The problem</p>
            <ul className="space-y-4">
              {problems.map(p => (
                <li key={p} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30
                    flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="p-7 rounded-2xl bg-primary-50/60 dark:bg-primary-950/10
            border border-primary-100/80 dark:border-primary-900/20">
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400
              uppercase tracking-wider mb-5">How WabMeta solves it</p>
            <ul className="space-y-4">
              {solutions.map(s => (
                <li key={s} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30
                    flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary-600" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
