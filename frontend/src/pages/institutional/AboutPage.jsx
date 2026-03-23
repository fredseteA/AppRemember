import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const pageStyle = {
  background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 18%, #7bbde8 32%, #b8e0f5 55%, #eef8fb 100%)',
  minHeight: '100vh',
  fontFamily: '"Georgia", serif',
};

const Section = ({ children, style = {} }) => (
  <section style={{
    maxWidth: 780,
    margin: '0 auto',
    padding: 'clamp(32px, 6vw, 64px) clamp(20px, 5vw, 40px)',
    ...style,
  }}>
    {children}
  </section>
);

const H1 = ({ children }) => (
  <h1 style={{
    fontFamily: '"Georgia", serif',
    fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
    fontWeight: 700,
    color: '#1a2744',
    lineHeight: 1.2,
    marginBottom: '12px',
  }}>{children}</h1>
);

const H2 = ({ children }) => (
  <h2 style={{
    fontFamily: '"Georgia", serif',
    fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
    fontWeight: 700,
    color: '#1a2744',
    lineHeight: 1.3,
    marginTop: '36px',
    marginBottom: '10px',
  }}>{children}</h2>
);

const P = ({ children }) => (
  <p style={{
    color: '#3a5070',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    lineHeight: 1.78,
    marginBottom: '14px',
  }}>{children}</p>
);

const Tag = ({ children }) => (
  <span style={{
    display: 'inline-block',
    padding: '3px 14px',
    borderRadius: '999px',
    background: 'rgba(90,168,224,0.15)',
    border: '1px solid rgba(90,168,224,0.3)',
    color: '#2a6090',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    marginBottom: '18px',
  }}>{children}</span>
);

const Divider = () => (
  <hr style={{ border: 'none', borderTop: '1px solid rgba(26,39,68,0.1)', margin: '8px 0 0' }} />
);

const ValueCard = ({ icon, title, text }) => (
  <div style={{
    borderRadius: '18px',
    padding: '22px 24px',
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.8)',
    boxShadow: '0 6px 20px rgba(26,39,68,0.07)',
    flex: '1 1 220px',
  }}>
    <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>{icon}</div>
    <p style={{ fontWeight: 700, color: '#1a2744', fontSize: '0.95rem', marginBottom: '6px' }}>{title}</p>
    <p style={{ color: '#3a5070', fontSize: '0.85rem', lineHeight: 1.65 }}>{text}</p>
  </div>
);

export default function AboutPage() {
  const { t } = useTranslation();
  const values = t('institutional.about.values', { returnObjects: true });

  return (
    <div style={pageStyle}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sobre-hero { animation: fadeInUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        @media (max-width: 767px) {
          .sobre-cloud { display: none !important; }
        }
      `}</style>

      {/* Hero */}
      <section style={{
        background: 'transparent',
        padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 40px) clamp(48px, 8vw, 80px)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        <div className="sobre-cloud" style={{
          position: 'absolute', top: 0, left: -40, width: 220, opacity: 0.7, pointerEvents: 'none',
        }}>
          <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%' }} />
        </div>
        <div className="sobre-cloud" style={{
          position: 'absolute', bottom: 0, right: -30, width: 180, opacity: 0.6, pointerEvents: 'none',
        }}>
          <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%' }} />
        </div>

        <div className="sobre-hero" style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <Tag>{t('institutional.about.heroTag')}</Tag>
          <H1>{t('institutional.about.heroTitle')}</H1>
          <p style={{
            color: '#2a3d5e',
            fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
            lineHeight: 1.72,
            marginTop: '16px',
          }}>
            {t('institutional.about.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Content */}
      <Section>
        <H2>{t('institutional.about.whoWeAreTitle')}</H2>
        <P>{t('institutional.about.whoWeAre1')}</P>
        <P>{t('institutional.about.whoWeAre2')}</P>

        <Divider />
        <H2>{t('institutional.about.missionTitle')}</H2>
        <P>{t('institutional.about.mission')}</P>

        <Divider />
        <H2>{t('institutional.about.visionTitle')}</H2>
        <P>{t('institutional.about.vision')}</P>

        <Divider />
        <H2>{t('institutional.about.valuesTitle')}</H2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px' }}>
          {Array.isArray(values) && values.map((v, i) => (
            <ValueCard key={i} icon={v.icon} title={v.title} text={v.text} />
          ))}
        </div>

        <Divider />
        <H2>{t('institutional.about.howItWorksTitle')}</H2>
        <P>{t('institutional.about.howItWorks1')}</P>
        <P dangerouslySetInnerHTML={{ __html: t('institutional.about.howItWorks2') }} />

        <Divider />
        <H2>{t('institutional.about.affiliatesTitle')}</H2>
        <P>{t('institutional.about.affiliates')}</P>

        <div style={{ marginTop: '36px', textAlign: 'center' }}>
          <Link to="/create-memorial">
            <button style={{
              borderRadius: '999px',
              padding: '13px 34px',
              background: '#1a2744',
              border: 'none',
              color: 'white',
              fontFamily: '"Georgia", serif',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 18px rgba(26,39,68,0.18)',
            }}>
              {t('institutional.about.cta')}
            </button>
          </Link>
        </div>
      </Section>
    </div>
  );
}