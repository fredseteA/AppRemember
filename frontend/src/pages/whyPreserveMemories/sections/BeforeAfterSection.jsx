import { useInView }  from '../shared/styles.jsx';
import Clouds         from '../shared/Clouds.jsx';
import Icons          from '../shared/Icons.js';
import { Link }       from 'react-router-dom';

const BeforeAfterSection = () => {
  const [ref, visible] = useInView(0.08);

  const beforeItems = [
    { icon: Icons.Box,      text: 'Fotos guardadas em caixas e gavetas' },
    { icon: Icons.Feather,  text: 'Histórias perdidas para sempre' },
    { icon: Icons.Users,    text: 'Família se lembrando cada vez menos' },
    { icon: Icons.Clock,    text: 'Uma vida apagada com o passar do tempo' },
    { icon: Icons.Globe,    text: 'Filhos que nunca conhecerão o avô de verdade' },
    { icon: Icons.Mic,      text: 'Voz, personalidade e risada esquecidas' },
  ];
  const afterItems = [
    { icon: Icons.Globe,    text: 'Memorial digital acessível de qualquer lugar' },
    { icon: Icons.Book,     text: 'História de vida completa e preservada' },
    { icon: Icons.Heart,    text: 'Família reconectada às memórias a qualquer hora' },
    { icon: Icons.Sunrise,  text: 'Filhos e netos conhecendo o legado familiar' },
    { icon: Icons.Infinity, text: 'Memórias preservadas para gerações futuras' },
    { icon: Icons.QrCode,   text: 'QR Code na lápide conecta físico e digital' },
  ];

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #ddf0f7 0%, #c8e8f5 35%, #b8e0f0 65%, #a8d8f0 100%)' }}>
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
          <span className="wpm-label">A transformação</span>
          <h2 className="wpm-h2">O que muda com um<br className="hidden md:block" /> memorial digital</h2>
          <p className="wpm-body" style={{ maxWidth: 440, margin: '0 auto' }}>Uma decisão simples. Uma diferença que dura para sempre.</p>
        </div>

        <div className="ba-cols" style={{ display: 'flex', gap: 'clamp(12px,2.5vw,20px)', alignItems: 'stretch' }}>
          {/* BEFORE */}
          <div className="ba-left" style={{ flex: 1, borderRadius: 22, padding: 'clamp(22px,3vw,32px)', background: 'rgba(255,255,255,0.42)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1.5px solid rgba(255,255,255,0.7)', boxShadow: '0 8px 28px rgba(26,39,68,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(26,39,68,0.08)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(180,180,180,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9ca3af' }}>
                {Icons.X}
              </div>
              <div>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#8a9baa', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 2px' }}>Sem memorial</p>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#6b7f99', fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', margin: 0 }}>A memória se perde</p>
              </div>
            </div>
            {beforeItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(200,200,200,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#b0bec5', marginTop: 1 }}>
                  {item.icon}
                </div>
                <span style={{ color: '#8a9baa', fontSize: 'clamp(0.8rem,2vw,0.88rem)', lineHeight: 1.55, fontFamily: '"Georgia", serif', textDecoration: 'line-through', textDecorationColor: 'rgba(138,155,170,0.35)' }}>
                  {item.text}
                </span>
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
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(90,168,224,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#5aa8e0' }}>
                {Icons.Check}
              </div>
              <div>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#5aa8e0', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 2px' }}>Com memorial digital</p>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: 'white', fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', margin: 0 }}>A memória vive para sempre</p>
              </div>
            </div>
            {afterItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(90,168,224,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#7bbde8', marginTop: 1 }}>
                  {item.icon}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(0.8rem,2vw,0.88rem)', lineHeight: 1.55, fontFamily: '"Georgia", serif' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 'clamp(28px,4vw,40px)' }}>
          <Link to="/create-memorial" className="wpm-btn-primary">Criar memorial agora — é gratuito</Link>
        </div>
      </div>
    </section>
  );
}

export default BeforeAfterSection;