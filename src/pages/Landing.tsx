import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import TrustStrip from '../components/landing/TrustStrip';
import ProblemSolution from '../components/landing/ProblemSolution';
import ProductShowcase from '../components/landing/ProductShowcase';
import UseCases from '../components/landing/UseCases';
import Workflow from '../components/landing/Workflow';
import Pricing from '../components/landing/Pricing';
import FounderNote from '../components/landing/FounderNote';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0b11]">
      <Navbar />
      <Hero />
      <TrustStrip />
      <ProblemSolution />
      <ProductShowcase />
      <UseCases />
      <Workflow />
      <Pricing />
      <FounderNote />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;