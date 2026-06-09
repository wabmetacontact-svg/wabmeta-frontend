import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ShowcaseItem {
  id: number;
  title: string;
  tag: string;
  tagColor: string;
  image: string;
  bgColor: string;
  link?: string;
}

const showcaseItems: ShowcaseItem[] = [
  {
    id: 1,
    title: 'WhatsApp Business Platform',
    tag: 'Excellent Performance',
    tagColor: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
    bgColor: 'from-emerald-900/40 to-emerald-700/20',
  },
  {
    id: 2,
    title: 'Website & App Development',
    tag: 'Excellent Performance',
    tagColor: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80',
    bgColor: 'from-green-900/40 to-emerald-700/20',
  },
  {
    id: 3,
    title: 'Lead Generation & Ads Automation',
    tag: 'Excellent Performance',
    tagColor: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    bgColor: 'from-blue-900/40 to-indigo-700/20',
  },
  {
    id: 4,
    title: 'Ecommerce Platform (with Admin Panel)',
    tag: 'Excellent Performance',
    tagColor: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    bgColor: 'from-purple-900/40 to-pink-700/20',
  },
  {
    id: 5,
    title: 'Jewellery CRM System',
    tag: 'Coming Soon 🚀',
    tagColor: 'bg-amber-500',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
    bgColor: 'from-gray-800/40 to-gray-700/20',
  },
  {
    id: 6,
    title: 'AI Chatbot Builder',
    tag: 'Excellent Performance',
    tagColor: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    bgColor: 'from-cyan-900/40 to-blue-700/20',
  },
  {
    id: 7,
    title: 'Instagram Automation Suite',
    tag: 'Excellent Performance',
    tagColor: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80',
    bgColor: 'from-pink-900/40 to-rose-700/20',
  },
  {
    id: 8,
    title: 'Meta Cloud API Integration',
    tag: 'Excellent Performance',
    tagColor: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800&q=80',
    bgColor: 'from-indigo-900/40 to-purple-700/20',
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

    const cardWidth = 340; // card width + gap
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

  return (
    <section className="relative w-full py-20 overflow-hidden bg-gradient-to-b from-[#0a1929] via-[#0d2438] to-[#0a1929]">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center mb-16">
        <div className="inline-block px-5 py-2 mb-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <span className="text-sm font-medium text-gray-300">Work Showcase</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
          Powering your business
          <br />
          <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            with smart automation
          </span>{' '}
          & integrated
          <br />
          solutions
        </h2>
      </div>

      {/* Sliding Cards Container */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a1929] to-transparent z-20 pointer-events-none" />

        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a1929] to-transparent z-20 pointer-events-none" />

        {/* Scrolling track */}
        <div
          ref={scrollRef}
          className="flex gap-6 will-change-transform"
          style={{ width: 'max-content' }}
        >
          {duplicatedItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="group relative w-[320px] h-[400px] flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
            >
              {/* Card Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} backdrop-blur-sm border border-white/10`}
              />

              {/* Image */}
              <div className="relative h-[75%] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Arrow Button */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-lg group-hover:rotate-45 transition-transform duration-300">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <span
                  className={`inline-block px-3 py-1 rounded-md text-xs font-semibold text-white ${item.tagColor} mb-2`}
                >
                  {item.tag}
                </span>
                <h3 className="text-white font-semibold text-lg leading-snug">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkShowcase;
