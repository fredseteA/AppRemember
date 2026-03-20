import { useInView }  from '../shared/styles.jsx';
import Clouds         from '../shared/Clouds.jsx';
import Icons          from '../shared/Icons.js';
import IconBox        from '../shared/IconBox.jsx';

const HowItWorksSection = () => {
  const [ref, visible] = useInView(0.08);

  const steps = [
    { n: '01', icon: Icons.Edit,    color: '#2a5d8a', title: 'Crie o memorial',          desc: 'Preencha o nome, datas, história de vida, fotos e momentos especiais. Tudo simples e guiado.' },
    { n: '02', icon: Icons.Upload,  color: '#2a7a6a', title: 'Adicione memórias',        desc: 'Envie fotos, áudios e mensagens. A galeria é montada automaticamente de forma bonita e emocional.' },
    { n: '03', icon: Icons.Package, color: '#6b5ea8', title: 'Receba a placa QR Code',   desc: 'Após escolher um plano, você recebe uma placa de aço inox com QR Code gravado permanentemente.' },
    { n: '04', icon: Icons.Infinity,color: '#1a2744', title: 'Família acessa para sempre', desc: 'Qualquer pessoa com um celular pode escanear e acessar o memorial. Para sempre. Em qualquer lugar.' },
  ];

  return (
    <section id="como-funciona" ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #eef8fb 0%, #ddf0f7 25%, #c8e8f5 60%, #b8e0f0 100%)' }}>
      <Clouds />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">Processo</span>
          <h2 className="wpm-h2">Em 4 passos simples,<br className="hidden md:block" /> um legado eterno.</h2>
          <p className="wpm-body" style={{ maxWidth: 420, margin: '0 auto' }}>
            Pensado para ser simples, bonito e significativo. Do início ao memorial publicado.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 'clamp(12px,2vw,20px)' }}>
          {steps.map((step, i) => (
            <div key={i} className="wpm-card" style={{ padding: 'clamp(22px,3vw,30px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a2744', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Georgia", serif', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, animation: 'wpm-pulseRing 2.5s ease-out infinite', animationDelay: `${i * 0.5}s` }}>
                  {parseInt(step.n)}
                </div>
                <span style={{ fontSize: '0.58rem', letterSpacing: '0.22em', color: '#5aa8e0', fontWeight: 700, textTransform: 'uppercase' }}>Passo {step.n}</span>
              </div>
              <IconBox icon={step.icon} color={step.color} />
              <h3 style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#1a2744', fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', marginBottom: 10, lineHeight: 1.3 }}>{step.title}</h3>
              <p style={{ color: '#3a5070', fontSize: 'clamp(0.78rem,2vw,0.85rem)', lineHeight: 1.68, margin: 0, fontFamily: '"Georgia", serif' }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-10">
          <span className="wpm-pill">Criar o memorial é gratuito · Você só paga se quiser publicar</span>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;