import React from 'react';
import { Linkedin, Twitter, Mail, Github, Code, Briefcase, Sparkles, Heart, Coffee, Zap } from 'lucide-react';

import samirPhoto from '../../assets/images/team/samir.png';
import ankitPhoto from '../../assets/images/team/ankit.png';

interface TeamMember {
  name: string;
  role: string;
  title: string;
  image: string;
  description: string;
  funFact: string;
  skills: string[];
  stats: { label: string; value: string }[];
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
  icon: React.ElementType;
  gradient: string;
  bgGlow: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  initials: string;
  emoji: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Ankit Verma',
    role: 'CEO & Co-founder',
    title: 'Strategy · Vision · Sales',
    image: ankitPhoto,
    description: "Built and sold two SaaS products before this. Knows WhatsApp Business API better than most people at Meta. Talks to customers every single day.",
    funFact: "Replies to support emails on Sundays — for fun.",
    skills: ['Business Strategy', 'Product Vision', 'Customer Success', 'Growth'],
    stats: [
      { label: 'Customers talked to', value: '500+' },
      { label: 'Coffee per day', value: '4 cups' },
    ],
    social: {
      linkedin: 'https://linkedin.com/in/ankitverma',
      twitter: 'https://twitter.com/ankitverma',
      email: 'ankit@wabmeta.com',
    },
    icon: Briefcase,
    gradient: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/10',
    accentText: 'text-blue-600',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-200',
    initials: 'AV',
    emoji: '👋',
  },
  {
    name: 'Samir Thakur',
    role: 'CTO & Co-founder',
    title: 'Code · Architecture · Infra',
    image: samirPhoto,
    description: "Full-stack engineer who actually enjoys debugging webhook payloads at 2 AM. Writes the kind of code other engineers screenshot and share. Shipped the entire MVP in 6 weeks.",
    funFact: "Once rebuilt the entire chatbot engine in a single weekend.",
    skills: ['React/TypeScript', 'Node.js', 'System Design', 'Meta API'],
    stats: [
      { label: 'Lines of code', value: '120K+' },
      { label: 'Sleep schedule', value: 'What?' },
    ],
    social: {
      linkedin: 'https://www.linkedin.com/in/samir-thakur-354a9a392',
      github: 'https://github.com/Samir-Thakur',
      email: 'samirthakur@wabmeta.com',
    },
    icon: Code,
    gradient: 'from-purple-500 to-pink-500',
    bgGlow: 'bg-purple-500/10',
    accentText: 'text-purple-600',
    accentBg: 'bg-purple-50',
    accentBorder: 'border-purple-200',
    initials: 'ST',
    emoji: '⚡',
  },
];

const Team: React.FC = () => {
  return (
    <section 
      id="team" 
      className="relative py-24 bg-gradient-to-b from-white via-gray-50/30 to-white overflow-hidden"
    >
      {/* Decorative Background */}
      <div className="absolute top-40 right-10 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />
      
      {/* Dot pattern */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* ═══════ Section Header ═══════ */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-full px-4 py-2 mb-6">
            <Heart size={14} className="text-pink-600 fill-pink-600" />
            <span className="text-pink-700 text-sm font-semibold tracking-wide">
              THE HUMANS BEHIND IT
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-6 max-w-4xl mx-auto">
            Two people.{' '}
            <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent italic font-light">
              One product.
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              No middle layer.
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            We're a 2-person team. One founder ships the code. The other talks to you. 
            When you email support, one of us replies — usually within an hour.
          </p>
        </div>

        {/* ═══════ Team Cards Grid ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto mb-16">
          {teamMembers.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>

        {/* ═══════ Bottom Stats Bar ═══════ */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '2', label: 'Founders', icon: Heart, color: 'text-pink-400' },
              { value: '0', label: 'Middle Managers', icon: Zap, color: 'text-yellow-400' },
              { value: '<1hr', label: 'Support Response', icon: Coffee, color: 'text-orange-400' },
              { value: '100%', label: 'Founder-led', icon: Sparkles, color: 'text-green-400' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mb-3">
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div className="font-heading font-bold text-3xl md:text-4xl text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ Quote / CTA ═══════ */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-base italic mb-4">
            "We built WabMeta because we got tired of bloated tools made by 200-person teams. 
            <br className="hidden md:block" />
            Simple, fast, founder-supported. That's the promise."
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="w-8 h-px bg-gray-300" />
            <span className="font-medium">Ankit & Samir</span>
            <div className="w-8 h-px bg-gray-300" />
          </div>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// Team Card Component
// ═══════════════════════════════════════════════════
const TeamCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-500 hover:-translate-y-1">
      
      {/* Top gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${member.gradient}`} />

      {/* Hover glow effect */}
      <div className={`absolute top-0 right-0 w-64 h-64 ${member.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

      <div className="relative p-6 md:p-8">
        
        {/* ═══════ Top: Photo + Basic Info ═══════ */}
        <div className="flex items-start gap-5 mb-6">
          {/* Photo with glow ring */}
          <div className="relative flex-shrink-0">
            <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity`} />
            <div className={`relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-gradient-to-br ${member.gradient} p-0.5`}>
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=400&background=6366f1&color=fff&bold=true`;
                }}
              />
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          </div>

          {/* Name + Role */}
          <div className="flex-1 min-w-0 pt-1">
            <div className={`inline-flex items-center gap-1.5 ${member.accentBg} ${member.accentBorder} border rounded-full px-3 py-1 mb-2`}>
              <member.icon size={12} className={member.accentText} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${member.accentText}`}>
                {member.role}
              </span>
            </div>
            
            <h3 className="font-heading text-2xl font-bold text-gray-900 mb-1 leading-tight">
              {member.name} <span className="text-xl">{member.emoji}</span>
            </h3>
            
            <p className="text-sm text-gray-500 font-mono">
              {member.title}
            </p>
          </div>
        </div>

        {/* ═══════ Description ═══════ */}
        <p className="text-gray-600 text-base leading-relaxed mb-6">
          {member.description}
        </p>

        {/* ═══════ Fun Fact Box ═══════ */}
        <div className={`flex items-start gap-3 p-4 ${member.accentBg} border ${member.accentBorder} rounded-2xl mb-6`}>
          <div className="text-xl flex-shrink-0">💡</div>
          <p 
            className="text-sm text-gray-700 italic leading-snug"
            style={{ fontFamily: 'Caveat, cursive', fontSize: '1.1rem' }}
          >
            {member.funFact}
          </p>
        </div>

        {/* ═══════ Mini Stats ═══════ */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {member.stats.map((stat, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <div className="font-heading font-bold text-lg text-gray-900">
                {stat.value}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ═══════ Skills ═══════ */}
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Skills & Expertise
          </p>
          <div className="flex flex-wrap gap-1.5">
            {member.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* ═══════ Social Links ═══════ */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Let's connect →
          </p>
          
          <div className="flex items-center gap-2">
            {member.social.linkedin && (
              <a 
                href={member.social.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-blue-500 border border-gray-200 hover:border-blue-500 text-gray-600 hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
            )}
            {member.social.twitter && (
              <a 
                href={member.social.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-sky-500 border border-gray-200 hover:border-sky-500 text-gray-600 hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
            )}
            {member.social.github && (
              <a 
                href={member.social.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-900 border border-gray-200 hover:border-gray-900 text-gray-600 hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
                aria-label="GitHub"
              >
                <Github size={16} />
              </a>
            )}
            {member.social.email && (
              <a 
                href={`mailto:${member.social.email}`}
                className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-green-500 border border-gray-200 hover:border-green-500 text-gray-600 hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;