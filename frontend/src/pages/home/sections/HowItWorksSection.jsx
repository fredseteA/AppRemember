import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
{/*import { useTranslation } from 'react-i18next';*/}

// ── STEPS ───────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    label: "Crie o memorial",
    title: "Crie o memorial",
    subtitle: "Como preencher?",
    description: "Preencha as informações da homenagem: dados pessoais, uma frase especial, biografia, fotos e até um áudio. Tudo de forma simples e carinhosa.",
    cta: "Começar agora",
    ctaLink: "/create-memorial",
    testId: "step-1",
    image: "/step1.png"
  },
  {
    num: "02",
    label: "Veja o resultado",
    title: "Veja o resultado",
    subtitle: "Como fica o memorial?",
    description: "O memorial é exibido pronto na tela para você ver como ficou. Ele fica salvo no seu perfil, pronto para ser publicado quando você decidir.",
    cta: "Ver exemplo",
    ctaLink: "/explore",
    testId: "step-2",
    image: "/step2.png"
  },
  {
    num: "03",
    label: "Escolha um plano",
    title: "Escolha um plano",
    subtitle: "Como publicar?",
    description: "Se gostar do resultado, escolha um plano para publicar o memorial online e/ou receber a placa física com QR Code para o túmulo.",
    cta: "Ver planos",
    ctaLink: "/#plans",
    testId: "step-3",
    image: "/step3.png"
  },
];

function PanelContent({ step, onScrollToPlans }) {
  const [imgLoaded, setImgLoaded] = useState(false);
 
  const isScrollLink = step.ctaLink.startsWith('/#');
 
  return (
    <>
      {/* ── Card de texto ── */}
      <div
        className="howit-pill"
        style={{
          flex: "1 1 260px", maxWidth: "380px", borderRadius: "22px",
          padding: "clamp(18px, 3vw, 32px) clamp(16px, 2.5vw, 28px)",
          background: "rgba(255,255,255,0.58)", backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.82)",
          boxShadow: "0 12px 36px rgba(26,39,68,0.1), 0 2px 6px rgba(26,39,68,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Número + label */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#1a2744", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: '"Georgia", serif', fontSize: "0.8rem", fontWeight: 700,
            flexShrink: 0, animation: "pulseRing 2.5s ease-out infinite",
          }}>
            {parseInt(step.num)}
          </div>
          <span style={{ fontSize: "0.58rem", letterSpacing: "0.22em", color: "#5aa8e0", fontWeight: 700, textTransform: "uppercase" }}>
            Passo {step.num}
          </span>
        </div>
 
        {/* Título */}
        <h3 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1rem, 4vw, 1.5rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.22, marginBottom: "3px" }}>
          {step.title}
        </h3>
 
        {/* Subtítulo */}
        <h4 className="howit-subtitle" style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(0.78rem, 3vw, 0.9rem)", fontWeight: 400, color: "#5aa8e0", marginBottom: "10px" }}>
          {step.subtitle}
        </h4>
 
        {/* Descrição */}
        <p style={{ color: "#3a5070", fontSize: "clamp(0.8rem, 3vw, 0.88rem)", lineHeight: 1.65, marginBottom: "18px" }}>
          {step.description}
        </p>
 
        {/* CTA corrigido */}
        {isScrollLink ? (
          <button className="howit-cta-btn" onClick={onScrollToPlans}>
            {step.cta}
          </button>
        ) : (
          <Link to={step.ctaLink} className="howit-cta-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
            {step.cta}
          </Link>
        )}
      </div>
 
      {/* ── Imagem ── */}
      <div
        className={`howit-img-wrap${!imgLoaded ? " howit-img-shimmer" : ""}`}
        style={{
          flex: "1 1 260px", maxWidth: "420px",
          height: "clamp(200px, 28vw, 300px)", borderRadius: "18px",
          border: "1.5px dashed rgba(26,39,68,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", boxShadow: "0 6px 24px rgba(26,39,68,0.07)",
        }}
      >
        <img
          src={step.image} alt={step.title}
          onLoad={() => setImgLoaded(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.4s ease", opacity: imgLoaded ? 1 : 0 }}
        />
      </div>
    </>
  );
}

const HowItWorksSection = () => {
  const [activeStep, setActiveStep]       = useState(0);
  const [prevStep, setPrevStep]           = useState(null);
  const [isVisible, setIsVisible]         = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const sectionRef                        = useRef(null);
  const timerRef                          = useRef(null);
  {/*const { t } = useTranslation();*/}
  

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    STEPS.forEach(s => { const img = new Image(); img.src = s.image; });
  }, []);

  const goToStep = useCallback((idx) => {
    if (idx === activeStep || transitioning) return;
    setTransitioning(true);
    setPrevStep(activeStep);
    setActiveStep(idx);
    setTimeout(() => { setPrevStep(null); setTransitioning(false); }, 420);
  }, [activeStep, transitioning]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveStep(prev => {
        const next = (prev + 1) % STEPS.length;
        setPrevStep(prev);
        setTransitioning(true);
        setTimeout(() => { setPrevStep(null); setTransitioning(false); }, 420);
        return next;
      });
    }, 4000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const handleTabClick = (idx) => {
    clearInterval(timerRef.current);
    goToStep(idx);
    setTimeout(() => startTimer(), 450);
  };

  const current = STEPS[activeStep];
  const previous = prevStep !== null ? STEPS[prevStep] : null;

  const scrollToPlans = () => {
    const el = document.getElementById('plans');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #5aa8e0 0%, #7bbde8 15%, #a8d8f0 38%, #c8e8f5 60%, #ddf0f7 80%, #eef8fb 100%)",
        padding: "clamp(48px, 8vw, 80px) 0 clamp(40px, 7vw, 72px)",
        marginTop: 0,
        borderTop: "none",
      }}
    >
      <style>{`
        @keyframes revealSection {
          from { opacity: 0; transform: translateY(32px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
        }
        @keyframes panelEnter {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes panelLeave {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-14px); }
        }
        @keyframes floatS1 {
          0%,100% { transform: translateY(0) translateX(0); }
          40%     { transform: translateY(-14px) translateX(8px); }
          70%     { transform: translateY(-7px) translateX(-5px); }
        }
        @keyframes floatS2 {
          0%,100% { transform: translateY(0) translateX(0); }
          50%     { transform: translateY(-18px) translateX(-10px); }
        }
        @keyframes floatS3 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-10px) translateX(6px); }
        }
        @keyframes progressFill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0    rgba(90,168,224,0.55); }
          70%  { box-shadow: 0 0 0 10px rgba(90,168,224,0);    }
          100% { box-shadow: 0 0 0 0    rgba(90,168,224,0);    }
        }

        .howit-pill {
          transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease;
        }
        .howit-pill:hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 20px 48px rgba(26,39,68,0.14), 0 4px 12px rgba(26,39,68,0.07) !important;
        }
        .howit-tab-btn {
          position: relative;
          background: transparent;
          border: none;
          cursor: pointer;
          padding-bottom: 12px;
          transition: color 0.3s ease;
        }
        .howit-tab-btn::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px; border-radius: 2px;
          background: #1a2744;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(.22,1,.36,1);
        }
        .howit-tab-btn.howit-tab-active { color: #1a2744 !important; }
        .howit-tab-btn.howit-tab-active::after { transform: scaleX(1); }
        .howit-progress-bar {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px; width: 100%;
          background: #1a2744; border-radius: 2px;
          transform-origin: left; transform: scaleX(0);
        }
        .howit-progress-bar.howit-running {
          animation: progressFill 4s linear forwards;
        }
        .howit-img-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.42) 50%, rgba(255,255,255,0.18) 75%);
          background-size: 400px 100%;
          animation: shimmer 2.2s ease-in-out infinite;
        }
        .howit-cta-btn {
          border-radius: 999px; padding: 9px 24px;
          background: transparent; border: 1.5px solid #1a2744;
          color: #1a2744; font-family: "Georgia", serif;
          font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: all 0.28s ease;
        }
        .howit-cta-btn:hover { background: #1a2744; color: white; }
        .howit-panel-wrap {
          position: relative;
          /* Desktop: altura fixa para o absolute funcionar */
          min-height: clamp(280px, 35vw, 340px);
        }
        .howit-panel {
          position: absolute;
          top: 0; left: 0; right: 0;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: clamp(1rem, 2.5vw, 2.5rem);
          will-change: opacity, transform;
        }
        .howit-panel.is-entering {
          animation: panelEnter 0.42s cubic-bezier(.22,1,.36,1) both;
        }
        .howit-panel.is-leaving {
          animation: panelLeave 0.35s cubic-bezier(.22,1,.36,1) both;
          pointer-events: none;
        }
        .howit-panel.is-idle { opacity: 1; transform: translateY(0); }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          /* Nuvens */
          .howit-cloud-left  { width: 110px !important; left: -10px !important; top: -5px !important; opacity: 0.65 !important; }
          .howit-cloud-right { display: none !important; }
          .howit-cloud-base  { display: none !important; }

          /* Tabs mais compactas */
          .howit-tabs        { gap: 0 !important; justify-content: space-between !important; }
          .howit-tab-btn     { min-width: 0 !important; flex: 1; padding-bottom: 10px !important; }

          /* Imagem escondida — só card de texto no mobile */
          .howit-img-wrap    { display: none !important; }

          /* Subtitle escondida no mobile */
          .howit-subtitle    { display: none !important; }

          /* Panel em flow normal (não absolute) no mobile */
          .howit-panel-wrap  { min-height: 0 !important; }
          .howit-panel       {
            position: relative !important;
            top: auto !important; left: auto !important; right: auto !important;
          }
          .howit-panel.is-leaving { display: none !important; }

          /* Card ocupa largura total, sem maxWidth */
          .howit-pill        { max-width: 100% !important; flex: 1 1 100% !important; }

          /* Footer pill menor */
          .howit-footer-pill { font-size: 0.72rem !important; padding: 8px 14px !important; }
        }
      `}</style>

      {/* Nuvens */}
      <div className="howit-cloud-left absolute top-[-20px] left-[-60px] w-56 md:w-72 opacity-90 pointer-events-none select-none"
        style={{ animation: "floatS1 9s ease-in-out infinite" }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="howit-cloud-right absolute top-[10%] right-[-40px] w-48 md:w-64 opacity-85 pointer-events-none select-none hidden md:block"
        style={{ animation: "floatS2 11s ease-in-out infinite" }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="howit-cloud-base absolute bottom-[6%] right-[3%] w-36 opacity-60 pointer-events-none select-none hidden lg:block"
        style={{ animation: "floatS3 7s ease-in-out infinite" }}>
        <img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{
          opacity: isVisible ? 1 : 0,
          animation: isVisible ? "revealSection 0.8s cubic-bezier(.22,1,.36,1) both" : "none",
        }}
      >
        {/* Cabeçalho */}
        <div className="text-center mb-8 md:mb-12">
          <p style={{ textTransform: "uppercase", letterSpacing: "0.22em", fontSize: "0.68rem", fontWeight: 700, color: "#2a3d5e", marginBottom: "12px" }}>
            Como Funciona
          </p>
          <h2 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.3rem, 5vw, 2.6rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.2, marginBottom: "12px" }}>
            Em apenas 3 passos simples,
            <br className="hidden md:block" /> crie uma homenagem eterna.
          </h2>
          <p style={{ color: "#3a5070", fontSize: "clamp(0.85rem, 3vw, 1rem)", lineHeight: 1.65, maxWidth: "420px", margin: "0 auto" }}>
            Do início ao memorial publicado, tudo pensado para ser simples, bonito e significativo.
          </p>
        </div>

        {/* Tabs */}
        <div
          className="howit-tabs flex items-center justify-center gap-6 md:gap-12 mb-8 md:mb-10"
          style={{ borderBottom: "1px solid rgba(26,39,68,0.12)" }}
        >
          {STEPS.map((s, i) => (
            <button
              key={i}
              className={`howit-tab-btn${activeStep === i ? " howit-tab-active" : ""}`}
              onClick={() => handleTabClick(i)}
              style={{
                color: activeStep === i ? "#1a2744" : "#7a9bb5",
                fontFamily: '"Georgia", serif',
                fontSize: "clamp(0.7rem, 2.5vw, 0.88rem)",
                fontWeight: 600,
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "3px",
                minWidth: "72px",
              }}
            >
              <span style={{ fontSize: "0.58rem", letterSpacing: "0.18em", opacity: activeStep === i ? 0.8 : 0.5 }}>
                {s.num}
              </span>
              <span>{s.label}</span>
              <span
                key={`bar-${activeStep}-${i}`}
                className={`howit-progress-bar${activeStep === i && !transitioning ? " howit-running" : ""}`}
              />
            </button>
          ))}
        </div>

        {/* Painel */}
        <div className="howit-panel-wrap">
          {previous && transitioning && (
            <div className="howit-panel is-leaving" data-testid={previous.testId} aria-hidden="true">
              <PanelContent step={previous} onScrollToPlans={scrollToPlans} />
            </div>
          )}
          <div className={`howit-panel ${transitioning ? "is-entering" : "is-idle"}`} data-testid={current.testId}>
            <PanelContent step={current} onScrollToPlans={scrollToPlans} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 md:mt-10">
          <p className="howit-footer-pill" style={{
            display: "inline-block", padding: "10px 24px", borderRadius: "999px",
            background: "rgba(255,255,255,0.55)", backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.85)",
            color: "#2a3d5e", fontSize: "0.82rem", fontFamily: '"Georgia", serif',
            boxShadow: "0 3px 14px rgba(26,39,68,0.07)",
          }}>
            ✨ Criar o memorial é gratuito · Você só paga se quiser publicar
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;