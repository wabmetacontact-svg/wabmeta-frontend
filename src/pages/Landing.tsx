import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      {/* Add more sections here later */}
    </div>
  );
};

export default Landing;