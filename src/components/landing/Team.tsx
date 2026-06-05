// src/components/landing/Team.tsx
import React from 'react';
import { Linkedin, Twitter, Mail, Github, Code, Briefcase } from 'lucide-react';

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
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
  icon: React.ElementType;
  accentColor: string;
  initials: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Ankit Verma',
    role: 'CEO & Co-founder',
    title: 'Strategy · Vision · Sales',
    image: ankitPhoto,
    description: "Built and sold two SaaS products before this. Knows WhatsApp Business API better than most people at Meta (we joke about this). Talks to customers every single day.",
    funFact: "Replies to support emails on Sundays — for fun.",
    skills: ['Business Strategy', 'Product Vision', 'Customer Success', 'Growth'],
    social: {
      linkedin: 'https://linkedin.com/in/ankitverma',
      twitter: 'https://twitter.com/ankitverma',
      email: 'ankit@wabmeta.com',
    },
    icon: Briefcase,
    accentColor: '#2883CF',
    initials: 'AV',
  },
  {
    name: 'Samir Thakur',
    role: 'CTO & Co-founder',
    title: 'Code · Architecture · Infra',
    image: samirPhoto,
    description: "Full-stack engineer who actually enjoys debugging webhook payloads at 2 AM. Writes the kind of code other engineers screenshot and share. Shipped the entire MVP in 6 weeks.",
    funFact: "Once rebuilt the entire chatbot engine in a single weekend.",
    skills: ['React/TypeScript', 'Node.js', 'System Design', 'Meta API'],
    social: {
      linkedin: 'https://www.linkedin.com/in/samir-thakur-354a9a392',
      github: 'https://github.com/Samir-Thakur',
      email: 'samirthakur@wabmeta.com',
    },
    icon: Code,
    accentColor: '#a855f7',
    initials: 'ST',
  },
];

const Team: React.FC = () => {
  return (
    <section id="team" className="relative py-24 lg:py-32 overflow-hidden bg-white">

      {/* ✅ Light Mode Background with grid & soft blobs */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 25% 30%, rgba(40, 131, 207, 0.05) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 75% 70%, rgba(168, 85, 247, 0.05) 0%, transparent 60%)
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
                The humans behind it
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-gray-950">
              <span>Two people.</span>{' '}
              <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent italic font-light">
                One product.
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#2883CF] to-sky-500 bg-clip-text text-transparent">
                No middle layer.
              </span>
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:pt-16">
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
              We're a 2-person team. The founder ships the code. The other founder talks to you. When you email support, one of us replies — usually within an hour.
            </p>
          </div>
        </div>

        {/* ✅ TEAM CARDS - alternating layout */}
        <div className="space-y-6 lg:space-y-8 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => {
            const isReverse = index % 2 === 1;
            return (
              <div
                key={member.name}
                className={`group relative rounded-3xl overflow-hidden
                  bg-white
                  border border-gray-200
                  hover:border-gray-300
                  shadow-[0_20px_40px_rgba(0,0,0,0.04)]
                  transition-all duration-500
                  hover:-translate-y-1`}
                style={{
                  animation: `fadeIn 0.7s ease-out ${index * 200}ms backwards`,
                }}
              >
                {/* Accent gradient bg */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 80% 60% at ${isReverse ? '80%' : '20%'} 30%, ${member.accentColor}10 0%, transparent 60%)`,
                  }}
                />

                {/* Shimmer */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%)',
                  }}
                />

                {/* Top edge */}
                <div className="absolute top-0 left-[15%] right-[15%] h-px 
                  bg-gradient-to-r from-transparent via-gray-200/40 to-transparent" />

                <div className={`relative grid grid-cols-12 gap-6 lg:gap-10 p-6 lg:p-10 items-center
                  ${isReverse ? 'lg:[direction:rtl]' : ''}
                `}>

                  {/* PHOTO column */}
                  <div className={`col-span-12 lg:col-span-4 ${isReverse ? 'lg:[direction:ltr]' : ''}`}>
                    <div className="relative w-full max-w-[280px] mx-auto lg:mx-0">

                      {/* Glow ring */}
                      <div className="absolute inset-0 rounded-3xl blur-2xl opacity-60 -z-0"
                        style={{
                          background: `radial-gradient(circle, ${member.accentColor}40 0%, transparent 70%)`,
                        }}
                      />

                      {/* Photo frame */}
                      <div className="relative rounded-3xl overflow-hidden
                        bg-gray-50 border border-gray-200
                        p-2 transform transition-transform duration-700
                        group-hover:scale-[1.02]">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full aspect-square object-cover rounded-2xl"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=400&background=${member.accentColor.replace('#', '')}&color=fff&bold=true`;
                          }}
                        />
                      </div>

                      {/* Floating role badge */}
                      <div className={`absolute -bottom-3 ${isReverse ? '-left-3' : '-right-3'}
                        px-4 py-2 rounded-full text-xs font-semibold text-white
                        border flex items-center gap-2 shadow-xl`}
                        style={{
                          background: `linear-gradient(135deg, ${member.accentColor}, ${member.accentColor}aa)`,
                          borderColor: `${member.accentColor}80`,
                          boxShadow: `0 8px 24px ${member.accentColor}30`,
                        }}
                      >
                        <member.icon className="w-3.5 h-3.5" />
                        <span>{member.initials}</span>
                      </div>
                    </div>
                  </div>

                  {/* CONTENT column */}
                  <div className={`col-span-12 lg:col-span-8 ${isReverse ? 'lg:[direction:ltr] lg:text-right' : ''}`}>

                    {/* Role tag */}
                    <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-gray-50 border border-gray-200/80">
                      <span className="text-xs font-mono uppercase tracking-wider font-bold"
                        style={{ color: member.accentColor }}
                      >
                        {member.role}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-3xl lg:text-4xl font-bold text-gray-950 mb-2 tracking-tight">
                      {member.name}
                    </h3>

                    {/* Title */}
                    <p className="text-sm font-mono text-gray-400 mb-5">
                      {member.title}
                    </p>

                    {/* Description */}
                    <p className="text-base lg:text-lg text-gray-600 leading-relaxed mb-5">
                      {member.description}
                    </p>

                    {/* Fun fact - handwritten feel */}
                    <div className={`flex items-start gap-3 mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 ${isReverse ? 'lg:flex-row-reverse' : ''}`}>
                      <div className="text-2xl flex-shrink-0">💡</div>
                      <p className={`text-sm text-gray-500 italic leading-snug ${isReverse ? 'lg:text-right' : ''}`}
                        style={{ fontFamily: 'Caveat, cursive', fontSize: '1.15rem' }}
                      >
                        {member.funFact}
                      </p>
                    </div>

                    {/* Skills */}
                    <div className={`flex flex-wrap gap-2 mb-6 ${isReverse ? 'lg:justify-end' : ''}`}>
                      {member.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 text-xs font-medium rounded-full
                            bg-gray-50 border border-gray-200 text-gray-600
                            hover:bg-gray-100 hover:border-gray-300
                            transition-all duration-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Social links */}
                    <div className={`flex items-center gap-2 pt-5 border-t border-gray-100 ${isReverse ? 'lg:justify-end' : ''}`}>
                      {member.social.linkedin && (
                        <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200
                            hover:bg-blue-500/10 hover:border-blue-400/40 hover:text-blue-500
                            text-gray-500 flex items-center justify-center
                            transition-all duration-300">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {member.social.twitter && (
                        <a href={member.social.twitter} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200
                            hover:bg-sky-500/10 hover:border-sky-400/40 hover:text-sky-500
                            text-gray-500 flex items-center justify-center
                            transition-all duration-300">
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {member.social.github && (
                        <a href={member.social.github} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200
                            hover:bg-gray-500/10 hover:border-gray-400/40 hover:text-gray-900
                            text-gray-500 flex items-center justify-center
                            transition-all duration-300">
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {member.social.email && (
                        <a href={`mailto:${member.social.email}`}
                          className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200
                            hover:bg-blue-500/10 hover:border-blue-400/40 hover:text-[#2883CF]
                            text-gray-500 flex items-center justify-center
                            transition-all duration-300">
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Team;