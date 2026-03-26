import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageReveal } from '@/hooks/usePageReveal';

function PanelContent({ step, onScrollToPlans, t }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isScrollLink = step.ctaLink.startsWith('/#');

  return (
    <>
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
            {t('howItWorks.step')} {step.num}
          </span>
        </div>

        <h3 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1rem, 4vw, 1.5rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.22, marginBottom: "3px" }}>
          {step.title}
        </h3>
        <h4 className="howit-subtitle" style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(0.78rem, 3vw, 0.9rem)", fontWeight: 400, color: "#5aa8e0", marginBottom: "10px" }}>
          {step.subtitle}
        </h4>
        <p style={{ color: "#3a5070", fontSize: "clamp(0.8rem, 3vw, 0.88rem)", lineHeight: 1.65, marginBottom: "18px" }}>
          {step.description}
        </p>

        {isScrollLink ? (
          <button className="howit-cta-btn" onClick={onScrollToPlans}>{step.cta}</button>
        ) : (
          <Link to={step.ctaLink} className="howit-cta-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>{step.cta}</Link>
        )}
      </div>

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
  const transitionTimerRef                = useRef(null);
  const { t }                             = useTranslation();
  const revealed                          = usePageReveal(); // ← novo

  const STEPS = useMemo(() =>
    t('howItWorks.steps', { returnObjects: true }).map((s, i) => ({
      ...s,
      ctaLink: ['/create-memorial', '/explore', '/#plans'][i],
      testId: `step-${i + 1}`,
      image: `/step${i + 1}.webp`,
    }))
  , [t]);

  useEffect(() => {
    STEPS.forEach(s => { const img = new Image(); img.src = s.image; });
  }, [STEPS]);

  useEffect(() => {
    // Só observa após o loading ter terminado
    if (!revealed) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [revealed]); // ← depende de revealed

  const triggerTransition = useCallback((from, to) => {
    clearTimeout(transitionTimerRef.current);
    setPrevStep(from);
    setActiveStep(to);
    setTransitioning(true);
    transitionTimerRef.current = setTimeout(() => {
      setPrevStep(null);
      setTransitioning(false);
    }, 420);
  }, []);

  const goToStep = useCallback((idx) => {
    setActiveStep(current => {
      if (idx === current || transitioning) return current;
      triggerTransition(current, idx);
      return current;
    });
  }, [transitioning, triggerTransition]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveStep(prev => {
        const next = (prev + 1) % STEPS.length;
        triggerTransition(prev, next);
        return prev;
      });
    }, 4000);
  }, [STEPS.length, triggerTransition]);

  useEffect(() => {
    startTimer();
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(transitionTimerRef.current);
    };
  }, [startTimer]);

  const handleTabClick = useCallback((idx) => {
    clearInterval(timerRef.current);
    goToStep(idx);
    setTimeout(() => startTimer(), 450);
  }, [goToStep, startTimer]);

  useEffect(() => () => clearTimeout(transitionTimerRef.current), []);

  const current  = STEPS[activeStep];
  const previous = prevStep !== null ? STEPS[prevStep] : null;

  const scrollToPlans = useCallback(() => {
    document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

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

        @media (max-width: 767px) {
          .howit-cloud-left  { width: 110px !important; left: -10px !important; top: -5px !important; opacity: 0.65 !important; }
          .howit-cloud-right { display: none !important; }
          .howit-cloud-base  { display: none !important; }
          .howit-tabs        { gap: 0 !important; justify-content: space-between !important; }
          .howit-tab-btn     { min-width: 0 !important; flex: 1; padding-bottom: 10px !important; }
          .howit-subtitle    { display: none !important; }
          .howit-panel-wrap  { min-height: 0 !important; }
          .howit-panel {
            position: relative !important;
            top: auto !important; left: auto !important; right: auto !important;
            flex-wrap: nowrap !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .howit-panel.is-leaving { display: none !important; }
          .howit-pill {
            max-width: none !important;
            flex: 1 1 0 !important;
            min-width: 0 !important;
            padding: 14px 12px !important;
          }
          .howit-img-wrap {
            display: flex !important;
            flex: 1 1 0 !important;
            max-width: none !important;
            min-width: 0 !important;
            height: auto !important;
            min-height: 180px !important;
            aspect-ratio: 3/4;
            border-radius: 14px !important;
          }
          .howit-footer-pill { font-size: 0.72rem !important; padding: 8px 14px !important; }
        }

        @media (max-width: 400px) {
          .howit-pill { padding: 10px 8px !important; }
          .howit-img-wrap { min-height: 150px !important; }
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
            {t('howItWorks.eyebrow')}
          </p>
          <h2 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.3rem, 5vw, 2.6rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.2, marginBottom: "12px", whiteSpace: 'pre-line' }}>
            {t('howItWorks.title')}
          </h2>
          <p style={{ color: "#3a5070", fontSize: "clamp(0.85rem, 3vw, 1rem)", lineHeight: 1.65, maxWidth: "420px", margin: "0 auto" }}>
            {t('howItWorks.description')}
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
              <PanelContent step={previous} onScrollToPlans={scrollToPlans} t={t} />
            </div>
          )}
          <div className={`howit-panel ${transitioning ? "is-entering" : "is-idle"}`} data-testid={current.testId}>
            <PanelContent step={current} onScrollToPlans={scrollToPlans} t={t} />
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
            {t('howItWorks.footer')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;