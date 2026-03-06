// Shared layout helpers for institutional pages
// Import these in each page to keep styling consistent

export const pageStyle = {
  background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)',
  minHeight: '100vh',
  fontFamily: '"Georgia", serif',
};

export const H1 = ({ children }) => (
  <h1 style={{
    fontFamily: '"Georgia", serif',
    fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
    fontWeight: 700,
    color: '#1a2744',
    lineHeight: 1.2,
    marginBottom: '12px',
  }}>{children}</h1>
);

export const H2 = ({ children }) => (
  <h2 style={{
    fontFamily: '"Georgia", serif',
    fontSize: 'clamp(1.05rem, 3vw, 1.35rem)',
    fontWeight: 700,
    color: '#1a2744',
    lineHeight: 1.3,
    marginTop: '36px',
    marginBottom: '10px',
  }}>{children}</h2>
);

export const P = ({ children }) => (
  <p style={{
    color: '#3a5070',
    fontSize: 'clamp(0.88rem, 2.5vw, 0.98rem)',
    lineHeight: 1.78,
    marginBottom: '14px',
  }}>{children}</p>
);

export const Li = ({ children }) => (
  <li style={{
    color: '#3a5070',
    fontSize: 'clamp(0.88rem, 2.5vw, 0.98rem)',
    lineHeight: 1.72,
    marginBottom: '8px',
    paddingLeft: '8px',
  }}>{children}</li>
);

export const Ul = ({ children }) => (
  <ul style={{
    paddingLeft: '20px',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  }}>{children}</ul>
);

export const Tag = ({ children }) => (
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

export const Divider = () => (
  <hr style={{ border: 'none', borderTop: '1px solid rgba(26,39,68,0.1)', margin: '8px 0 0' }} />
);

export const PageHero = ({ tag, title, subtitle, cloudLeft = '/clouds/cloud1.png', cloudRight = '/clouds/cloud2.png' }) => (
  <section style={{
    background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 50%, #7bbde8 100%)',
    padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 40px) clamp(48px, 8vw, 80px)',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
  }}>
    <div className="inst-cloud-l" style={{
      position: 'absolute', top: 0, left: -40, width: 220, opacity: 0.7, pointerEvents: 'none',
    }}>
      <img src={cloudLeft} alt="" draggable={false} style={{ width: '100%' }} />
    </div>
    <div className="inst-cloud-r" style={{
      position: 'absolute', bottom: 0, right: -30, width: 180, opacity: 0.6, pointerEvents: 'none',
    }}>
      <img src={cloudRight} alt="" draggable={false} style={{ width: '100%' }} />
    </div>
    <div className="inst-hero-content" style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
      <Tag>{tag}</Tag>
      <h1 style={{
        fontFamily: '"Georgia", serif',
        fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
        fontWeight: 700,
        color: '#1a2744',
        lineHeight: 1.2,
        marginBottom: '16px',
      }}>{title}</h1>
      {subtitle && (
        <p style={{ color: '#2a3d5e', fontSize: 'clamp(0.9rem, 3vw, 1.05rem)', lineHeight: 1.72 }}>
          {subtitle}
        </p>
      )}
    </div>
  </section>
);

export const ContentSection = ({ children }) => (
  <section style={{
    maxWidth: 780,
    margin: '0 auto',
    padding: 'clamp(32px, 6vw, 64px) clamp(20px, 5vw, 40px)',
  }}>
    {children}
  </section>
);

export const sharedStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .inst-hero-content { animation: fadeInUp 0.7s cubic-bezier(.22,1,.36,1) both; }
  @media (max-width: 767px) {
    .inst-cloud-l, .inst-cloud-r { display: none !important; }
  }
`;
