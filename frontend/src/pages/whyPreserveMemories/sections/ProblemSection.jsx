import { useInView }  from '../shared/styles.jsx';
import Clouds         from '../shared/Clouds.jsx';
import IconBox        from '../shared/IconBox.jsx';
import Icons          from '../shared/Icons.js';

const ProblemSection = () => {
  const [ref, visible] = useInView(0.1);

  const cards = [
    { icon: Icons.Mic,   color: '#6b5ea8', title: 'Histórias que nunca foram registradas', text: 'Cada pessoa que parte leva consigo segredos, causos e sabedoria que ninguém teve tempo de guardar.' },
    { icon: Icons.Users, color: '#2a7a6a', title: 'Gerações que não se conhecem',          text: 'Seus netos crescerão sem saber quem foram seus antepassados e o que os tornava especiais.' },
    { icon: Icons.Clock, color: '#2a5d8a', title: 'A memória apaga com o tempo',           text: 'Em menos de 3 gerações, uma vida inteira desaparece. Em 75 anos, só restam as datas.' },
  ];

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #5aa8e0 0%, #7bbde8 20%, #a8d8f0 55%, #c8e8f5 80%, #ddf0f7 100%)' }}>
      <Clouds />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">O problema real</span>
          <h2 className="wpm-h2">As memórias desaparecem.<br className="hidden md:block" />Silenciosamente. Para sempre.</h2>
          <p className="wpm-body" style={{ maxWidth: 500, margin: '0 auto' }}>
            A maioria das famílias só percebe quando já é tarde demais. Quando aquela história que só o avô sabia contar… não existe mais.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(12px,2vw,20px)' }}>
          {cards.map((c, i) => (
            <div key={i} className="wpm-card" style={{ padding: 'clamp(22px,3vw,30px)' }}>
              <IconBox icon={c.icon} color={c.color} />
              <h3 style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#1a2744', fontSize: 'clamp(0.9rem,2.5vw,1.02rem)', marginBottom: 10, lineHeight: 1.3 }}>{c.title}</h3>
              <p style={{ color: '#3a5070', fontSize: 'clamp(0.78rem,2vw,0.85rem)', lineHeight: 1.68, margin: 0, fontFamily: '"Georgia", serif' }}>{c.text}</p>
            </div>
          ))}
        </div>

        {/* Stat emocional */}
        <div style={{ marginTop: 'clamp(32px,5vw,52px)', display: 'flex', justifyContent: 'center' }}>
          <div className="wpm-card" style={{ padding: 'clamp(20px,3vw,28px) clamp(24px,4vw,48px)', textAlign: 'center', maxWidth: 560 }}>
            <p style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.1rem,3.5vw,1.5rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.4, margin: '0 0 10px' }}>
              “Grande parte das histórias familiares se perde após poucas gerações.”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemSection;