import {
  HeroSection,
  HowItWorksSection,
  PlansSection,
  FAQSection,
  ProductShowcaseSection,
  TestimonialsSection,
  WhySection,
  TrustBadgesSection,
} from './sections/index.js';

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