import { useInView }  from '../shared/styles.jsx';
import Clouds         from '../shared/Clouds.jsx';
import IconBox        from '../shared/IconBox.jsx';
import Icons          from '../shared/Icons.js';

const MomentsSection = () => {
  const [ref, visible] = useInView(0.08);

  const moments = [
    { icon: Icons.Sunrise,  color: '#c47a2a', label: 'Infância',   desc: 'As primeiras memórias, brincadeiras e descobertas que formaram quem ela era.' },
    { icon: Icons.Heart,    color: '#a82a4a', label: 'Amor',       desc: 'Encontros, casamentos e os laços que definiram uma vida inteira.' },
    { icon: Icons.Award,    color: '#2a7a6a', label: 'Conquistas', desc: 'Formatura, carreira e os sonhos que um dia se tornaram realidade.' },
    { icon: Icons.Users,    color: '#2a5d8a', label: 'Família',    desc: 'Os filhos, netos e gerações que vieram depois e carregam seu legado.' },
    { icon: Icons.Globe,    color: '#6b5ea8', label: 'Aventuras',  desc: 'Viagens, novas descobertas e experiências que ela escolheu vivenciar.' },
    { icon: Icons.Shield,   color: '#2a6a4a', label: 'Fé',         desc: 'As crenças e valores espirituais que guiaram cada passo da vida.' },
    { icon: Icons.Users,    color: '#5a7a2a', label: 'Amizades',   desc: 'Os amigos verdadeiros que estiveram ao lado nos momentos mais importantes.' },
    { icon: Icons.Star,     color: '#8a5a1a', label: 'Legado',     desc: 'O que ela deixou no mundo: amor, inspiração e diferença.' },
  ];

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #a8d8f0 0%, #c8e8f5 30%, #ddf0f7 65%, #eef8fb 100%)' }}>
      <style>{`@media(max-width:767px){ .moments-grid{ grid-template-columns:repeat(2,1fr) !important; } }`}</style>
      <Clouds />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">Cada vida</span>
          <h2 className="wpm-h2">Pense em todos os momentos<br className="hidden md:block" /> que compõem uma vida.</h2>
          <p className="wpm-body" style={{ maxWidth: 460, margin: '0 auto' }}>
            Cada um deles é único. Cada um deles merece ser lembrado. E agora, todos podem ser preservados.
          </p>
        </div>

        <div className="moments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(10px,2vw,18px)' }}>
          {moments.map((m, i) => (
            <div key={i} className="wpm-card" style={{ padding: 'clamp(18px,2.5vw,24px)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <IconBox icon={m.icon} color={m.color} />
              </div>
              <h4 style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#1a2744', fontSize: 'clamp(0.82rem,2.5vw,0.95rem)', marginBottom: 8 }}>{m.label}</h4>
              <p style={{ color: '#3a5070', fontSize: 'clamp(0.7rem,1.8vw,0.78rem)', lineHeight: 1.62, margin: 0, fontFamily: '"Georgia", serif' }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MomentsSection;