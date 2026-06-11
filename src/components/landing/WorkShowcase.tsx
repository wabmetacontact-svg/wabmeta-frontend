import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface ShowcaseItem {
  id: number;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  image: string;
  bgColor: string;
  glowColor: string;
  dotColor: string;
}

const showcaseItems: ShowcaseItem[] = [
  {
    id: 1,
    title: 'WhatsApp Business Platform',
    description: 'Official API integration, bulk broadcasts, & smart templates.',
    tag: 'Active Now',
    tagColor: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300',
    image: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&q=80',
    bgColor: 'from-emerald-950/80 to-slate-900/40',
    glowColor: 'hover:shadow-[0_0_35px_rgba(16,185,129,0.15)] hover:border-emerald-500/30',
    dotColor: 'bg-emerald-400',
  },
  {
    id: 2,
    title: 'Website & App Development',
    description: 'Bespoke web experiences and native mobile applications.',
    tag: 'Online',
    tagColor: 'border-sky-500/20 bg-sky-950/20 text-sky-300',
    image: 'https://images.unsplash.com/photo-1618005198143-d56637ef8540?w=800&q=80',
    bgColor: 'from-sky-950/80 to-slate-900/40',
    glowColor: 'hover:shadow-[0_0_35px_rgba(14,165,233,0.15)] hover:border-sky-500/30',
    dotColor: 'bg-sky-400',
  },
  {
    id: 3,
    title: 'Lead Generation & Ads',
    description: 'Meta Ads automation & conversion tracking triggers.',
    tag: 'High Yield',
    tagColor: 'border-indigo-500/20 bg-indigo-950/20 text-indigo-300',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
    bgColor: 'from-indigo-950/80 to-slate-900/40',
    glowColor: 'hover:shadow-[0_0_35px_rgba(99,102,241,0.15)] hover:border-indigo-500/30',
    dotColor: 'bg-indigo-400',
  },
  {
    id: 4,
    title: 'Ecommerce Platform',
    description: 'High-performing storefronts with admin analytics panel.',
    tag: 'Verified',
    tagColor: 'border-purple-500/20 bg-purple-950/20 text-purple-300',
    image: 'https://images.unsplash.com/photo-1618005198143-e2efb6b4f4c5?w=800&q=80',
    bgColor: 'from-purple-950/80 to-slate-900/40',
    glowColor: 'hover:shadow-[0_0_35px_rgba(168,85,247,0.15)] hover:border-purple-500/30',
    dotColor: 'bg-purple-400',
  },
  {
    id: 5,
    title: 'Jewellery CRM System',
    description: 'Exclusive luxury CRM & diamond inventory tracker.',
    tag: 'Coming Soon',
    tagColor: 'border-amber-500/20 bg-amber-950/20 text-amber-300',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
    bgColor: 'from-amber-950/80 to-slate-900/40',
    glowColor: 'hover:shadow-[0_0_35px_rgba(245,158,11,0.15)] hover:border-amber-500/30',
    dotColor: 'bg-amber-400',
  },
  {
    id: 6,
    title: 'AI Chatbot Builder',
    description: 'Canvas-based no-code visual chatbot flows.',
    tag: 'AI Powered',
    tagColor: 'border-cyan-500/20 bg-cyan-950/20 text-cyan-300',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    bgColor: 'from-cyan-950/80 to-slate-900/40',
    glowColor: 'hover:shadow-[0_0_35px_rgba(6,182,212,0.15)] hover:border-cyan-500/30',
    dotColor: 'bg-cyan-400',
  },
  {
    id: 7,
    title: 'Instagram Automation',
    description: 'Direct message automation, comments handlers & tracking.',
    tag: 'Active Now',
    tagColor: 'border-rose-500/20 bg-rose-950/20 text-rose-300',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
    bgColor: 'from-rose-950/80 to-slate-900/40',
    glowColor: 'hover:shadow-[0_0_35px_rgba(244,63,94,0.15)] hover:border-rose-500/30',
    dotColor: 'bg-rose-400',
  },
  {
    id: 8,
    title: 'Meta Cloud API Integration',
    description: 'Seamless integration with Meta developer ecosystems.',
    tag: 'Stable Core',
    tagColor: 'border-blue-500/20 bg-blue-950/20 text-blue-300',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
    bgColor: 'from-blue-950/80 to-slate-900/40',
    glowColor: 'hover:shadow-[0_0_35px_rgba(59,130,246,0.15)] hover:border-blue-500/30',
    dotColor: 'bg-blue-400',
  },
];

// Triple the items for seamless infinite scroll
const duplicatedItems = [...showcaseItems, ...showcaseItems, ...showcaseItems];

const WorkShowcase = () => {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const cardWidth = 364; // card width + gap (340 + 24)
    const totalWidth = showcaseItems.length * cardWidth;
    const speed = 0.5; // pixels per frame

    const animate = () => {
      if (!isPaused && scrollContainer) {
        positionRef.current += speed;

        // Reset position seamlessly when first set is scrolled
        if (positionRef.current >= totalWidth) {
          positionRef.current = 0;
        }

        scrollContainer.style.transform = `translateX(-${positionRef.current}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      positionRef.current = Math.max(0, positionRef.current - 364);
      scrollRef.current.style.transform = `translateX(-${positionRef.current}px)`;
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      positionRef.current += 364;
      scrollRef.current.style.transform = `translateX(-${positionRef.current}px)`;
    }
  };

  return (
    <section className="relative w-full py-24 overflow-hidden bg-[#030712]">
      {/* Premium dark grid network background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* High-tech neon mesh gradient lights */}
      <div className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-5 rounded-full border border-indigo-500/20 bg-indigo-950/30 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide uppercase text-indigo-300">Work Showcase</span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Powering your business{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              with smart automation
            </span>{' '}
            & integrated solutions
          </h2>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-3 self-start md:self-end">
          <button
            onClick={scrollLeft}
            className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 active:scale-95 cursor-pointer"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollRight}
            className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 active:scale-95 cursor-pointer"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sliding Cards Track */}
      <div
        className="relative w-full overflow-hidden px-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Soft edge fade overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#030712] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#030712] to-transparent z-20 pointer-events-none" />

        {/* Scrolling list */}
        <div
          ref={scrollRef}
          className="flex gap-6 will-change-transform transition-transform duration-500 ease-out py-4"
          style={{ width: 'max-content' }}
        >
          {duplicatedItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={`group relative w-[340px] h-[440px] flex-shrink-0 rounded-2xl overflow-hidden bg-slate-900/40 border border-white/10 backdrop-blur-md cursor-pointer transition-all duration-500 ${item.glowColor}`}
            >
              {/* Card Image Area */}
              <div className="absolute inset-0 h-[65%] overflow-hidden border-b border-white/5">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1527] to-transparent z-10" />
              </div>

              {/* Status Badge (pulsing dot) */}
              <div className={`absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full border bg-slate-950/60 backdrop-blur-md ${item.tagColor} shadow-lg`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${item.dotColor} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${item.dotColor}`}></span>
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-white">{item.tag}</span>
              </div>

              {/* Arrow Button */}
              <div className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-center backdrop-blur-md text-white shadow-lg transition-all duration-300 group-hover:bg-amber-500 group-hover:border-transparent group-hover:scale-110 group-hover:rotate-45 group-hover:text-white">
                <ArrowUpRight className="w-5 h-5 transition-transform duration-300" />
              </div>

              {/* Text Content Area */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end bg-gradient-to-t from-slate-950 via-[#0d1527] to-transparent pt-12 h-[45%]">
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-indigo-300 transition-colors duration-200 line-clamp-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkShowcase;
