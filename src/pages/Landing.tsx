import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Pricing from '../components/landing/Pricing';
import Team from '../components/landing/Team';
import WorkShowcase from '../components/landing/WorkShowcase';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const Landing: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <Hero />
      <Features />
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