import { useInView } from '../shared/styles.jsx';
import { useTranslation } from 'react-i18next';

const MeaningSection = () => {
  const { t } = useTranslation();
  const [ref, visible] = useInView(0.1);

  return (
    <section ref={ref} className="relative py-12 md:py-18 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #d8eff8 35%, #e4f4fa 65%, #eef8fb 100%)' }}
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="wpm-label">{t('whyPreservePage.meaning.eyebrow')}</span>
          <blockquote style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.2rem,4.5vw,2.2rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.3, maxWidth: 640, margin: '0 auto 20px', fontStyle: 'italic', whiteSpace: 'pre-line' }}>
            {t('whyPreservePage.meaning.quote')}
          </blockquote>
          <p className="wpm-body" style={{ maxWidth: 460, margin: '0 auto' }}>{t('whyPreservePage.meaning.description')}</p>
        </div>
      </div>
    </section>
  );
}

export default MeaningSection;