import React from 'react';
import { Send, MessageSquare, Bot, BarChart3 } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';

const sections = [
  {
    badge: 'Campaigns',
    icon: Send,
    title: 'Launch campaigns without manual chaos',
    description: 'Upload contacts, personalize with variables, schedule broadcasts, and monitor delivery — all from one screen.',
    points: ['CSV contact upload with smart mapping', 'Template-based personalization', 'Schedule or send instantly', 'Real-time delivery tracking'],
    visual: {
      stats: [
        { label: 'Total sent', value: '48,291' },
        { label: 'Delivered', value: '98.4%' },
        { label: 'Read rate', value: '76%' },
      ],
      rows: [
        { name: 'Diwali Sale',     sent: '12,000', status: 'Completed' },
        { name: 'Product Launch',  sent: '8,400',  status: 'Completed' },
        { name: 'Weekly Update',   sent: '—',      status: 'Scheduled' },
      ],
    },
  },
  {
    badge: 'Team Inbox',
    icon: MessageSquare,
    title: 'Handle replies in a shared inbox',
    description: 'Every WhatsApp conversation in one place. Assign to agents, use quick replies, keep full customer context.',
    points: ['Multi-agent assignment', 'Quick reply templates', 'Customer context sidebar', 'Real-time sync across team'],
    visual: {
      conversations: [
        { name: 'Ravi Kumar',  msg: 'When will my order arrive?',          time: '2m',  unread: true  },
        { name: 'Sneha Jain',  msg: 'Thanks for the quick response!',      time: '8m',  unread: false },
        { name: 'Amit Singh',  msg: 'I need help with my subscription',    time: '14m', unread: true  },
      ],
    },
  },
  {
    badge: 'Chatbot & Automation',
    icon: Bot,
    title: 'Automate repetitive conversations',
    description: 'Build chatbot flows visually. Capture leads, trigger follow-ups, and route users to the right team — no code needed.',
    points: ['Visual drag-and-drop builder', 'Conditional branching logic', 'Lead capture & qualification', 'Auto-assign to agents'],
    visual: {
      nodes: [
        { label: 'Welcome Message', type: 'start'   },
        { label: 'Ask for query',   type: 'message' },
        { label: 'Route to agent',  type: 'action'  },
      ],
    },
  },
  {
    badge: 'Analytics',
    icon: BarChart3,
    title: 'Track what is working',
    description: 'Campaign performance, delivery trends, team activity, and usage visibility — everything in one dashboard.',
    points: ['Campaign-level analytics', 'Delivery and read tracking', 'Agent response time metrics', 'Export reports as CSV'],
    visual: {
      metrics: [
        { label: 'Avg response',    value: '< 3min' },
        { label: 'Resolution rate', value: '94%'    },
        { label: 'Active agents',   value: '12'     },
      ],
    },
  },
];

const ProductShowcase: React.FC = () => (
  <section id="product" className="section-padding bg-gray-50/50 dark:bg-white/[0.01]">
    <div className="max-w-6xl mx-auto px-5 space-y-24 lg:space-y-32">
      {sections.map((s, i) => (
        <ShowcaseBlock key={s.badge} section={s} flipped={i % 2 === 1} index={i} />
      ))}
    </div>
  </section>
);

/* ── Individual Block ──────────────────── */
const ShowcaseBlock: React.FC<{
  section: typeof sections[0];
  flipped: boolean;
  index: number;
}> = ({ section: s, flipped, index }) => {
  const { ref, visible } = useScrollReveal();

  return (
    <div ref={ref}
      className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center`}
      style={flipped ? { direction: 'rtl' } : {}}>

      {/* Text */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        style={{ direction: 'ltr' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/40
            flex items-center justify-center">
            <s.icon className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400
            uppercase tracking-wider">{s.badge}</span>
        </div>

        <h3 className="text-2xl lg:text-3xl font-extrabold text-gray-900
          dark:text-white leading-tight mb-4">{s.title}</h3>

        <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          {s.description}
        </p>

        <ul className="space-y-3">
          {s.points.map(p => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-gray-600
              dark:text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Visual */}
      <div className={`transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ direction: 'ltr' }}>
        <ProductVisual section={s} index={index} />
      </div>
    </div>
  );
};

/* ── Visual per section ────── */
const ProductVisual: React.FC<{ section: typeof sections[0]; index: number }> = ({ section: s, index }) => (
  <div className="bg-white dark:bg-[#111118] rounded-2xl border border-gray-200
    dark:border-white/8 shadow-card overflow-hidden">

    {/* Mini toolbar */}
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100
      dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-white/10" />
        <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-white/10" />
        <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-white/10" />
      </div>
      <div className="flex-1 mx-auto max-w-[140px] h-3 bg-gray-100 dark:bg-white/5 rounded" />
    </div>

    <div className="p-5 space-y-3">

      {/* Campaigns */}
      {index === 0 && s.visual.stats && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {s.visual.stats.map(st => (
              <div key={st.label} className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]
                border border-gray-100 dark:border-white/5 text-center">
                <p className="text-[10px] text-gray-400 mb-0.5">{st.label}</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{st.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {s.visual.rows?.map(r => (
              <div key={r.name} className="flex items-center justify-between p-2.5
                rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100
                dark:border-white/5 text-xs">
                <span className="font-medium text-gray-700 dark:text-gray-300">{r.name}</span>
                <div className="flex items-center gap-3 text-gray-400">
                  <span>{r.sent}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    r.status === 'Completed'
                      ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600'
                      : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
                  }`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Inbox */}
      {index === 1 && s.visual.conversations && (
        <div className="space-y-1.5">
          {s.visual.conversations.map(c => (
            <div key={c.name} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              c.unread
                ? 'bg-primary-50/50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/30'
                : 'bg-gray-50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5'
            }`}>
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10
                flex items-center justify-center text-[10px] font-bold
                text-gray-500 dark:text-gray-400 flex-shrink-0">
                {c.name.split(' ').map((w: string) => w[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400 flex-shrink-0">{c.time}</p>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{c.msg}</p>
              </div>
              {c.unread && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}

      {/* Bot */}
      {index === 2 && s.visual.nodes && (
        <div className="flex flex-col items-center gap-3 py-4">
          {s.visual.nodes.map((n, ni) => (
            <React.Fragment key={n.label}>
              <div className={`w-full max-w-[200px] p-3 rounded-xl text-center text-xs font-semibold border ${
                n.type === 'start'
                  ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-200 dark:border-primary-800/40 text-primary-700 dark:text-primary-300'
                  : n.type === 'action'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300'
              }`}>
                {n.label}
              </div>
              {ni < s.visual.nodes!.length - 1 && (
                <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Analytics */}
      {index === 3 && s.visual.metrics && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {s.visual.metrics.map(m => (
              <div key={m.label} className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]
                border border-gray-100 dark:border-white/5 text-center">
                <p className="text-[10px] text-gray-400 mb-0.5">{m.label}</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{m.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-2 h-24 px-4 pt-4">
            {[65, 80, 55, 90, 70, 85, 95].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-primary-200 dark:bg-primary-800/40 transition-all duration-500"
                style={{ height: `${h}%` }} />
            ))}
          </div>
        </>
      )}
    </div>
  </div>
);

export default ProductShowcase;
