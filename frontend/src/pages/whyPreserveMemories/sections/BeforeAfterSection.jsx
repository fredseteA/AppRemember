import { useInView } from '../shared/styles.jsx';
import Clouds from '../shared/Clouds.jsx';
import Icons from '../shared/Icons.js';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BeforeAfterSection = () => {
  const { t } = useTranslation();
  const [ref, visible] = useInView(0.08);
  const beforeItems = t('whyPreservePage.beforeAfter.beforeItems', { returnObjects: true });
  const afterItems  = t('whyPreservePage.beforeAfter.afterItems',  { returnObjects: true });
  const beforeIconList = [Icons.Box, Icons.Feather, Icons.Users, Icons.Clock, Icons.Globe, Icons.Mic];
  const afterIconList  = [Icons.Globe, Icons.Book, Icons.Heart, Icons.Sunrise, Icons.Infinity, Icons.QrCode];

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #b8d8e8 35%, #8ec8e0 65%, #6ab4d8 100%)' }}
    >
      <style>{`
        .ba-left  { animation: wpm-fadeLeft  0.8s cubic-bezier(.22,1,.36,1) 0.2s  both; }
        .ba-right { animation: wpm-fadeRight 0.8s cubic-bezier(.22,1,.36,1) 0.35s both; }
        .ba-vs    { animation: wpm-scaleIn   0.6s cubic-bezier(.22,1,.36,1) 0.1s  both; }
        @media(max-width:767px){ .ba-cols{ flex-direction:column !important; } }
      `}</style>
      <Clouds />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.75s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">{t('whyPreservePage.beforeAfter.eyebrow')}</span>
          <h2 className="wpm-h2" style={{ whiteSpace: 'pre-line' }}>{t('whyPreservePage.beforeAfter.title')}</h2>
          <p className="wpm-body" style={{ maxWidth: 440, margin: '0 auto' }}>{t('whyPreservePage.beforeAfter.description')}</p>
        </div>

        <div className="ba-cols" style={{ display: 'flex', gap: 'clamp(12px,2.5vw,20px)', alignItems: 'stretch' }}>
          {/* BEFORE */}
          <div className="ba-left" style={{ flex: 1, borderRadius: 22, padding: 'clamp(22px,3vw,32px)', background: 'rgba(255,255,255,0.42)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1.5px solid rgba(255,255,255,0.7)', boxShadow: '0 8px 28px rgba(26,39,68,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(26,39,68,0.08)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(180,180,180,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9ca3af' }}>{Icons.X}</div>
              <div>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#8a9baa', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 2px' }}>{t('whyPreservePage.beforeAfter.beforeLabel')}</p>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#6b7f99', fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', margin: 0 }}>{t('whyPreservePage.beforeAfter.beforeTitle')}</p>
              </div>
            </div>
            {beforeItems.map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(200,200,200,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#b0bec5', marginTop: 1 }}>{beforeIconList[i]}</div>
                <span style={{ color: '#8a9baa', fontSize: 'clamp(0.8rem,2vw,0.88rem)', lineHeight: 1.55, fontFamily: '"Georgia", serif', textDecoration: 'line-through', textDecorationColor: 'rgba(138,155,170,0.35)' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* VS */}
          <div className="ba-vs hidden md:flex" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a2744', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Georgia", serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', boxShadow: '0 4px 16px rgba(26,39,68,0.25)' }}>VS</div>
          </div>

          {/* AFTER */}
          <div className="ba-right wpm-card-dark" style={{ flex: 1, padding: 'clamp(22px,3vw,32px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(90,168,224,0.2)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(90,168,224,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#5aa8e0' }}>{Icons.Check}</div>
              <div>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#5aa8e0', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 2px' }}>{t('whyPreservePage.beforeAfter.afterLabel')}</p>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: 'white', fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', margin: 0 }}>{t('whyPreservePage.beforeAfter.afterTitle')}</p>
              </div>
            </div>
            {afterItems.map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(90,168,224,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#7bbde8', marginTop: 1 }}>{afterIconList[i]}</div>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(0.8rem,2vw,0.88rem)', lineHeight: 1.55, fontFamily: '"Georgia", serif' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 'clamp(28px,4vw,40px)' }}>
          <Link to="/create-memorial" className="wpm-btn-primary">{t('whyPreservePage.beforeAfter.cta')}</Link>
        </div>
      </div>
    </section>
  );
}

export default BeforeAfterSection;