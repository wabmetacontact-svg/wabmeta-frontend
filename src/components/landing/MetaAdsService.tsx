import { Link } from 'react-router-dom';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import preferencesIllustration from '../../assets/images/preferences-illustration.png';

const MetaAdsService = () => {
  return (
    <section id="meta-ads-service" className="relative py-24 bg-gradient-to-br from-[#0a331c] via-[#062413] to-[#03140b] overflow-hidden">
      {/* Subtle Dot Grid Background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-80" />

      {/* Decorative background glows */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* ═══════ LEFT: Content ═══════ */}
          <div className="space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
              <ShieldCheck size={16} className="text-green-400" />
              <span className="text-green-200 text-sm font-semibold">
                NEW SERVICE
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15] tracking-tight">
              We also run your{' '}
              <br />
              <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                Meta Ads
              </span>
            </h2>

            {/* Subheading */}
            <p className="text-green-100/80 text-lg leading-relaxed max-w-xl">
              Beyond automation, our expert team manages your Facebook & Instagram 
              ad campaigns end-to-end. Get more leads, better ROAS, and faster growth — 
              all from the same team you trust.
            </p>

            {/* Features List */}
            <div className="space-y-3.5 pt-2">
              {[
                'Complete ad campaign management',
                'Creative design & ad copywriting',
                'Audience targeting & optimization',
                'Weekly performance reports',
                'Click-to-WhatsApp ad integration',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-green-400" strokeWidth={3} />
                  </div>
                  <span className="text-green-100 text-base">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-green-500/20 hover:-translate-y-0.5"
              >
                Get Free Consultation
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/919211938200?text=Hi, I want to inquire about Meta Ads Agency services!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/20 hover:border-white transition-all duration-200"
              >
                Talk to Expert
              </a>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                {['from-green-400 to-green-600', 'from-teal-400 to-teal-600', 'from-emerald-400 to-emerald-600'].map((grad, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} border-2 border-[#0a331c]`} />
                ))}
              </div>
              <p className="text-sm text-green-200/80">
                <span className="font-bold text-white">200+ businesses</span> trust us with their ads
              </p>
            </div>
          </div>

          {/* ═══════ RIGHT: Preference Illustration ═══════ */}
          <div className="relative flex justify-center items-center lg:justify-end">
            
            {/* Glowing backdrop blur */}
            <div className="absolute w-[80%] h-[80%] bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Illustration Frame */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 p-2.5 bg-white/5 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:border-white/20 max-w-[480px]">
              <img 
                src={preferencesIllustration} 
                alt="WabMeta Preferences & Campaign Performance Illustration" 
                className="w-full h-auto rounded-[1.6rem] object-cover"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default MetaAdsService;
