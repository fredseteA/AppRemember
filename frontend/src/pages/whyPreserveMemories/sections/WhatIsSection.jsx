import { useInView }  from '../shared/styles.jsx';
import Clouds         from '../shared/Clouds.jsx';
import IconBox         from '../shared/IconBox.jsx';
import Icons           from '../shared/Icons.js';

const WhatIsSection = () => {
  const [ref, visible] = useInView(0.08);

  const features = [
    { icon: Icons.Book,      color: '#2a5d8a', title: 'História de vida',    desc: 'Uma biografia completa com os momentos mais importantes, escrita com carinho pela família.' },
    { icon: Icons.Image,     color: '#2a7a6a', title: 'Galeria de fotos',    desc: 'Dezenas de fotos organizadas, acessíveis de qualquer celular com um simples escaneamento.' },
    { icon: Icons.Music,     color: '#6b5ea8', title: 'Áudio de homenagem',  desc: 'Uma música especial, uma oração ou mensagem de voz que representa quem partiu.' },
    { icon: Icons.MessageSq, color: '#c47a2a', title: 'Mensagens da família', desc: 'Familiares e amigos podem deixar mensagens eternas de amor, saudade e gratidão.' },
    { icon: Icons.Pin,       color: '#a82a4a', title: 'Momentos especiais',  desc: 'Datas, conquistas e marcos da vida registrados de forma visual e emocional.' },
    { icon: Icons.QrCode,    color: '#1a2744', title: 'QR Code na lápide',   desc: 'Uma placa de aço inox com QR Code que conecta quem visita o túmulo ao memorial digital.' },
  ];

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #a8d8f0 0%, #8ecce8 25%, #7bbde8 55%, #8ecce8 80%, #a8d8f0 100%)' }}>
      <Clouds />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">O produto</span>
          <h2 className="wpm-h2">O que existe dentro<br className="hidden md:block" /> de um memorial digital</h2>
          <p className="wpm-body" style={{ maxWidth: 480, margin: '0 auto' }}>
            Muito mais do que uma página. Um lugar onde uma vida inteira é preservada, revisitada e amada.
          </p>
        </div>

        {/* Browser mockup */}
        <div style={{ marginBottom: 'clamp(28px,4vw,48px)', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 560, borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 72px rgba(26,39,68,0.16)', border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <div style={{ background: 'rgba(26,39,68,0.06)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(26,39,68,0.06)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff5f57','#febc2e','#28c840'].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, background: 'rgba(26,39,68,0.06)', borderRadius: 6, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#6b7f99', letterSpacing: '0.05em' }}>remember.com.br/memorial/joao-silva</span>
              </div>
            </div>
            <div style={{ padding: 'clamp(16px,3vw,28px)' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #c8e8f5, #7bbde8)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 16px rgba(26,39,68,0.12)', color: '#3a7fb5' }}>
                  {Icons.UserCircle}
                </div>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#1a2744', fontSize: '1.05rem', margin: '0 0 2px' }}>João Silva</p>
                <p style={{ color: '#5aa8e0', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>1948 – 2024</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ borderRadius: 10, background: 'linear-gradient(135deg, rgba(200,232,245,0.6), rgba(123,189,232,0.4))', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(90,168,224,0.2)', color: '#3a7fb5', opacity: 0.6 }}>
                    {Icons.Image}
                  </div>
                ))}
              </div>
              <div style={{ borderRadius: 10, background: 'rgba(26,39,68,0.04)', padding: '10px 14px', border: '1px solid rgba(26,39,68,0.06)' }}>
                <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.78rem', color: '#3a5070', lineHeight: 1.6, margin: 0 }}>
                  "Um homem de família, pai dedicado, amigo para sempre lembrado por todos que tiveram o privilégio de conhecê-lo..."
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(10px,2vw,16px)' }}>
          {features.map((f, i) => (
            <div key={i} className="wpm-card" style={{ padding: 'clamp(18px,2.5vw,24px)' }}>
              <IconBox icon={f.icon} color={f.color} />
              <h4 style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#1a2744', fontSize: 'clamp(0.85rem,2vw,0.95rem)', marginBottom: 8 }}>{f.title}</h4>
              <p style={{ color: '#3a5070', fontSize: 'clamp(0.72rem,1.8vw,0.8rem)', lineHeight: 1.65, margin: 0, fontFamily: '"Georgia", serif' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhatIsSection;