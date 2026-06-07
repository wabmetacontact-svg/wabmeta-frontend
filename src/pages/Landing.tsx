import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Pricing from '../components/landing/Pricing';
import Testimonials from '../components/landing/Testimonials';
import Team from '../components/landing/Team';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Team />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Landing;