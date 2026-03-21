import { useInView }  from '../shared/styles.jsx';
import Clouds         from '../shared/Clouds.jsx';
import { Link }       from 'react-router-dom';
import SecurityBadge  from '@/components/shared/SecurityBadge.jsx';

const FinalCTASection = () => {
  const [ref, visible] = useInView(0.1);

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

        {/* Ícone SVG no lugar do emoji */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(26,39,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2744', animation: 'wpm-heartbeat 3s ease-in-out infinite' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        </div>

        <span className="wpm-label" style={{ display: 'block', marginBottom: 20 }}>Comece agora</span>

        <h2 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.8rem, 7vw, 3.6rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.12, marginBottom: 22 }}>
          Crie um memorial que<br />dura para sempre.
        </h2>

        <p className="wpm-body" style={{ maxWidth: 520, margin: '0 auto 40px', fontSize: 'clamp(0.95rem,3.5vw,1.12rem)' }}>
          Não espere o tempo apagar as memórias.
          Preserve hoje a história de quem você ama —
          para que as próximas gerações possam conhecer,
          amar e se orgulhar de onde vieram.
        </p>

        <div className="wpm-btns" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
          <Link to="/create-memorial" className="cta-p-btn"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, padding: '15px 40px', background: '#1a2744', color: 'white', border: 'none', fontFamily: '"Georgia", serif', fontSize: 'clamp(0.88rem,3.5vw,1rem)', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 8px 28px rgba(26,39,68,0.28)', textDecoration: 'none' }}>
            Criar memorial gratuito
          </Link>
          <Link to="/explore" className="cta-s-btn"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, padding: '14px 36px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1.5px solid rgba(26,39,68,0.2)', color: '#1a2744', fontFamily: '"Georgia", serif', fontSize: 'clamp(0.88rem,3.5vw,1rem)', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 4px 18px rgba(26,39,68,0.08)', textDecoration: 'none' }}>
            Ver exemplos de memorials
          </Link>
        </div>

        <SecurityBadge variant="bar" />

        {/* Trust stats — sem emojis */}
        <div style={{ marginTop: 36, display: 'flex', gap: 'clamp(16px,4vw,40px)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { n: '100%',  label: 'Gratuito para criar' },
            { n: '∞',     label: 'Disponível para sempre' },
            { n: '24/7',  label: 'Acessível de qualquer lugar' },
          ].map((s, i) => (
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