import { useInView }  from '../shared/styles.jsx';
import Clouds         from '../shared/Clouds.jsx';
import Icons          from '../shared/Icons.js';

const TestimonialsSection = () => {
  const [ref, visible] = useInView(0.08);

  const testimonials = [
    { name: 'Maria Souza', role: 'Filha', stars: 5, text: 'Agora meus netos podem conhecer a história do bisavô deles. O memorial virou um tesouro da nossa família.' },
    { name: 'João Carlos', role: 'Filho', stars: 5, text: 'O QR Code na lápide do meu pai é algo que não tem preço. Cada visita se tornou especial de um jeito diferente.' },
    { name: 'Ana Paula',   role: 'Neta',  stars: 5, text: 'Criei o memorial para minha avó e toda a família ficou emocionada. Deu pra sentir ela presente de novo.' },
  ];

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #b8e0f0 0%, #a8d8f0 20%, #8ecce8 45%, #a8d8f0 75%, #b8e0f5 100%)' }}>
      <Clouds />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">Avaliações</span>
          <h2 className="wpm-h2">O que as famílias dizem</h2>
          <p className="wpm-body" style={{ maxWidth: 400, margin: '0 auto' }}>Histórias reais de quem escolheu preservar para sempre.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(12px,2vw,20px)' }}>
          {testimonials.map((t, i) => (
            <div key={i} className="wpm-card" style={{ padding: 'clamp(20px,3vw,28px)' }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="13" height="13" viewBox="0 0 24 24" fill={j < t.stars ? '#facc15' : 'none'} stroke={j < t.stars ? '#facc15' : '#d1d5db'} strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.85rem,2.5vw,0.95rem)', color: '#1a2744', lineHeight: 1.65, marginBottom: 18, fontStyle: 'italic' }}>
                "{t.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(26,39,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#3a5070' }}>
                  {Icons.UserCircle}
                </div>
                <div>
                  <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.82rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: '0.68rem', color: '#5aa8e0', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;