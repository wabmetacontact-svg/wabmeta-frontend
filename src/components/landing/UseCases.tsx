import React from 'react';
import { Megaphone, ShoppingBag, Headphones, Building2, GraduationCap, Package } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';

const cases = [
  { icon: Megaphone,     title: 'Marketing Teams',  desc: 'Run promotional campaigns, product launches, and seasonal offers at scale.' },
  { icon: ShoppingBag,   title: 'Sales Teams',       desc: 'Follow up on leads, share catalogs, and close deals faster on WhatsApp.' },
  { icon: Headphones,    title: 'Support Teams',     desc: 'Resolve customer queries quickly with team inbox and automated responses.' },
  { icon: Building2,     title: 'Agencies',          desc: 'Manage multiple client accounts and campaigns from a single dashboard.' },
  { icon: GraduationCap, title: 'Education',         desc: 'Send updates, handle admissions queries, and engage students and parents.' },
  { icon: Package,       title: 'D2C & Commerce',    desc: 'Order confirmations, shipping updates, abandoned cart recovery, and more.' },
];

const UseCases: React.FC = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="usecases" ref={ref} className="section-padding">
      <div className="max-w-6xl mx-auto px-5">

        <div className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-700
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-xs font-bold text-primary-600 dark:text-primary-400
            uppercase tracking-wider mb-3">Use cases</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900
            dark:text-white leading-tight mb-4">
            How teams use <span className="gradient-text">WabMeta</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            From marketing to support, WabMeta fits into the way your team already works.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c, i) => (
            <div key={c.title}
              className={`group p-6 rounded-2xl bg-white dark:bg-[#111118]
                border border-gray-100 dark:border-white/5
                hover:border-primary-200 dark:hover:border-primary-800/40
                hover:shadow-card transition-all duration-500
                ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: visible ? `${i * 80}ms` : '0ms' }}>
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30
                flex items-center justify-center mb-4
                group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
                <c.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                {c.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
