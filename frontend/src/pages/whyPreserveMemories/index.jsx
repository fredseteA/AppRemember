import { GLOBAL_STYLES } from './shared/styles.jsx'
import {
  HeroSection,
  ProblemSection,
  BeforeAfterSection,
  WhatIsSection,
  MomentsSection,
  HowItWorksSection,
  TestimonialsSection,
  MeaningSection,
  FinalCTASection,
} from './sections/index.js';

const WhyPreserveMemories = () => (
  <div
    data-testid="por-que-preservar-page"
    className="overflow-x-hidden"
    style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)' }}
  >
    <style>{GLOBAL_STYLES}</style>
    <HeroSection />
    <ProblemSection />
    <BeforeAfterSection />
    <WhatIsSection />
    <MomentsSection />
    <HowItWorksSection />
    <TestimonialsSection />
    <MeaningSection />
    <FinalCTASection />
  </div>
);

export default WhyPreserveMemories;