import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import AutomateBusiness from '../components/landing/AutomateBusiness';
import MetaAdsService from '../components/landing/MetaAdsService';
import HowItWorks from '../components/landing/HowItWorks';
import Pricing from '../components/landing/Pricing';
import Team from '../components/landing/Team';
import WorkShowcase from '../components/landing/WorkShowcase';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <AutomateBusiness />
      <MetaAdsService />
      <HowItWorks />
      <Pricing />
      <Team />
      <WorkShowcase />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;