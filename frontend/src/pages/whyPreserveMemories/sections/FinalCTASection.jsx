import { useInView } from '../shared/styles.jsx';
import Clouds from '../shared/Clouds.jsx';
import { Link } from 'react-router-dom';
import SecurityBadge from '@/components/shared/SecurityBadge.jsx';
import { useTranslation } from 'react-i18next';

const FinalCTASection = () => {
  const { t } = useTranslation();
  const [ref, visible] = useInView(0.1);
  const stats = t('whyPreservePage.finalCta.stats', { returnObjects: true });

  return (
    <section ref={ref} className="relative py-20 md:py-32 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #eef8fb 0%, #ddf0f7 20%, #c8e8f5 50%, #e8f4fc 80%, #ffffff 100%)' }}>
      <style>{`
        .cta-p-btn { transition: transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, background 0.3s ease; }
        .cta-p-btn:hover { transform: translateY(-3px) scale(1.05); background: #2a3d5e !important; box-shadow: 0 12px 36px rgba(26,39,68,0.3) !important; }
        .cta-s-btn { transition: transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, background 0.3s ease; }
        .cta-s-btn:hover { transform: translateY(-2px) scale(1.04); background: #1a2744 !important; color: white !important; box-shadow: 0 8px 28px rgba(26,39,68,0.2) !important; }
      `}</style>
      <Clouds />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>

        <span className="wpm-label" style={{ display: 'block', marginBottom: 20 }}>{t('whyPreservePage.finalCta.eyebrow')}</span>

        <h2 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.8rem, 7vw, 3.6rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.12, marginBottom: 22, whiteSpace: 'pre-line' }}>
          {t('whyPreservePage.finalCta.title')}
        </h2>

        <p className="wpm-body" style={{ maxWidth: 520, margin: '0 auto 40px', fontSize: 'clamp(0.95rem,3.5vw,1.12rem)' }}>
          {t('whyPreservePage.finalCta.description')}
        </p>

        <div className="wpm-btns" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
          <Link to="/create-memorial" className="cta-p-btn"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, padding: '15px 40px', background: '#1a2744', color: 'white', border: 'none', fontFamily: '"Georgia", serif', fontSize: 'clamp(0.88rem,3.5vw,1rem)', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 8px 28px rgba(26,39,68,0.28)', textDecoration: 'none' }}>
            {t('whyPreservePage.finalCta.cta')}
          </Link>
          <Link to="/explore" className="cta-s-btn"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, padding: '14px 36px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1.5px solid rgba(26,39,68,0.2)', color: '#1a2744', fontFamily: '"Georgia", serif', fontSize: 'clamp(0.88rem,3.5vw,1rem)', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 4px 18px rgba(26,39,68,0.08)', textDecoration: 'none' }}>
            {t('whyPreservePage.finalCta.ctaSecondary')}
          </Link>
        </div>

        <SecurityBadge variant="bar" />

        <div style={{ marginTop: 36, display: 'flex', gap: 'clamp(16px,4vw,40px)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.2rem,3.5vw,1.6rem)', fontWeight: 700, color: '#1a2744', margin: '0 0 4px' }}>{s.n}</p>
              <p style={{ color: '#3a5070', fontSize: 'clamp(0.7rem,2vw,0.78rem)', fontFamily: '"Georgia", serif', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FinalCTASection;