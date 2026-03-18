import HeroSection from './sections/HeroSection';
import HowItWorksSection from './sections/HowItWorksSection';
import PlansSection from './sections/PlansSection';
import ProductShowcaseSection from './sections/ProductShowcaseSection';
import TrustBadgesSection from './sections/TrustBadgesSection';
import FAQSection from './sections/FAQSection';
import TestimonialsSection from './sections/TestimonialsSection';
import WhySection from './sections/WhySection';

const Home = () => (
  <div data-testid="home-page" className="overflow-x-hidden"
    style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)' }}>
    <HeroSection />
    <HowItWorksSection />
    <PlansSection />
    <ProductShowcaseSection />
    <TrustBadgesSection />
    <FAQSection />
    <TestimonialsSection />
    <WhySection />
  </div>
);

export default Home;