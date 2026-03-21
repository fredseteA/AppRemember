/*import { useTranslation } from 'react-i18next';*/
import { HeroSection, StepsSection, IncludedSection, CTASection } from './sections/index.js';

const HowItWorks = () => {
  /*const { t } = useTranslation();*/

  return (
    <div
      className="overflow-x-hidden"
      data-testid="how-it-works-page"
      style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)' }}
    >
      <HeroSection />
      <StepsSection />
      <CTASection />
      <IncludedSection />
    </div>
  );
};

export default HowItWorks;