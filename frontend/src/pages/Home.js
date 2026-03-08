import { useState, useEffect, useRef, useCallback } from 'react';
import { Link} from 'react-router-dom';
import SecurityBadge from '../components/SecurityBadge';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Star, MessageSquarePlus, User} from 'lucide-react';
import ReviewForm from '../components/ReviewForm';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const defaultReviews = [
  {
    id: 'default-1',
    user_name: "Maria Souza",
    user_photo_url: null,
    rating: 5,
    title: "Super Recomendo",
    comment: "Encontrei por acaso e comprei. Era para preparar a despedida para meu sobrinho. Produto de qualidade e entrega rápida."
  },
  {
    id: 'default-2',
    user_name: "João Carlos",
    user_photo_url: null,
    rating: 5,
    title: "Site confiável",
    comment: "Comprei chegou certinho! Além do ótimo atendimento e preocupação com um assunto tão delicado!"
  },
  {
    id: 'default-3',
    user_name: "Ana Paula",
    user_photo_url: null,
    rating: 5,
    title: "Excelente produto",
    comment: "Além de ser um produto de qualidade tem um atendimento top de linha e empatia. Recomendo!"
  }
];

// ── ReviewCard ──────────────────────────────────────────────────────────────
function ReviewCard({ review, featured = false }) {
  return (
    <div style={{
      borderRadius: "22px",
      padding: featured ? "clamp(22px,3vw,32px)" : "20px 24px",
      background: featured ? "rgba(255,255,255,0.62)" : "rgba(255,255,255,0.38)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: "1px solid rgba(255,255,255,0.8)",
      boxShadow: featured
        ? "0 16px 48px rgba(26,39,68,0.14), inset 0 1px 0 rgba(255,255,255,0.9)"
        : "0 6px 20px rgba(26,39,68,0.07)",
      transition: "all 0.35s ease",
    }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={featured ? 15 : 13}
            className={i < (review.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
      {review.title && (
        <h3 style={{
          fontFamily: '"Georgia", serif',
          fontSize: featured ? "clamp(1rem, 2vw, 1.25rem)" : "0.95rem",
          fontWeight: 700, color: "#1a2744",
          marginBottom: "8px", lineHeight: 1.3,
        }}>
          "{review.title}"
        </h3>
      )}
      {review.comment && (
        <p style={{
          color: "#3a5070",
          fontSize: featured ? "0.9rem" : "0.82rem",
          lineHeight: 1.68, marginBottom: "18px",
          fontFamily: '"Georgia", serif',
        }}>
          {review.comment}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {review.user_photo_url ? (
          <img
            src={review.user_photo_url}
            alt={review.user_name}
            style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(90,168,224,0.3)" }}
          />
        ) : (
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(26,39,68,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <User size={16} style={{ color: "#3a5070" }} />
          </div>
        )}
        <div>
          <p style={{ fontFamily: '"Georgia", serif', fontSize: "0.82rem", fontWeight: 700, color: "#1a2744" }}>
            {review.user_name}
          </p>
          <p style={{ fontSize: "0.68rem", color: "#5aa8e0", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
            Cliente
          </p>
        </div>
      </div>
    </div>
  );
}

// ── TestimonialsSection ─────────────────────────────────────────────────────
function TestimonialsSection({ reviews, loadingReviews, user, showReviewForm, setShowReviewForm, fetchReviews }) {
  const [active, setActive] = useState(0);
  const [animDir, setAnimDir] = useState('next');
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);
  const list = reviews.slice(0, 6);

  const startCarouselTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setAnimDir('next');
      setAnimating(true);
      setTimeout(() => {
        setActive(prev => (prev + 1) % list.length);
        setAnimating(false);
      }, 380);
    }, 5000);
  }, [list.length]);

  const goTo = useCallback((idx, dir = 'next') => {
    if (animating) return;
    clearInterval(timerRef.current);
    setAnimDir(dir);
    setAnimating(true);
    setTimeout(() => {
      setActive(idx);
      setAnimating(false);
      startCarouselTimer();
    }, 380);
  }, [animating, startCarouselTimer]);

  useEffect(() => {
    if (list.length > 0) startCarouselTimer();
    return () => clearInterval(timerRef.current);
  }, [list.length, startCarouselTimer]);

  const prev = () => goTo(active === 0 ? list.length - 1 : active - 1, 'prev');
  const next = () => goTo((active + 1) % list.length, 'next');

  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        // FAQ termina em #b8e0f5 → desce suavemente para um mid-blue → sobe de volta para #b8e0f5 onde Why começa
        background: "linear-gradient(180deg, #b8e0f5 0%, #a8d8f0 18%, #8ecce8 40%, #a8d8f0 75%, #b8e0f5 100%)",
        marginTop: 0,
        borderTop: "none",
      }}
    >
      <style>{`
        @keyframes floatT1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-14px) translateX(8px); }
        }
        @keyframes floatT2 {
          0%,100% { transform: translateY(0) translateX(0); }
          55%     { transform: translateY(-10px) translateX(-7px); }
        }
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(60px) scale(0.97); filter: blur(4px); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    filter: blur(0);   }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-60px) scale(0.97); filter: blur(4px); }
          to   { opacity: 1; transform: translateX(0)     scale(1);    filter: blur(0);   }
        }
        @keyframes slideOutToLeft {
          from { opacity: 1; transform: translateX(0);     filter: blur(0);   }
          to   { opacity: 0; transform: translateX(-60px); filter: blur(4px); }
        }
        @keyframes slideOutToRight {
          from { opacity: 1; transform: translateX(0);    filter: blur(0);   }
          to   { opacity: 0; transform: translateX(60px); filter: blur(4px); }
        }
        .testi-enter-next { animation: slideInFromRight 0.38s cubic-bezier(.22,1,.36,1) both; }
        .testi-enter-prev { animation: slideInFromLeft  0.38s cubic-bezier(.22,1,.36,1) both; }
        .testi-leave-next { animation: slideOutToLeft   0.38s cubic-bezier(.22,1,.36,1) both; }
        .testi-leave-prev { animation: slideOutToRight  0.38s cubic-bezier(.22,1,.36,1) both; }
        .testi-dot {
          width: 8px; height: 8px;
          border-radius: 999px;
          background: rgba(26,39,68,0.2);
          border: none; cursor: pointer;
          transition: all 0.35s cubic-bezier(.22,1,.36,1);
          padding: 0;
        }
        .testi-dot.testi-dot-active {
          width: 24px;
          background: rgba(26,39,68,0.55);
        }
        .testi-arrow {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.45);
          border: 1.5px solid rgba(255,255,255,0.8);
          color: #1a2744;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(26,39,68,0.08);
        }
        .testi-arrow:hover {
          background: rgba(255,255,255,0.7);
          transform: scale(1.08);
          box-shadow: 0 4px 16px rgba(26,39,68,0.12);
        }
        @media (max-width: 767px) {
          .testi-cloud-left  { width: 120px !important; left: -20px !important; }
          .testi-cloud-right { display: none !important; }
        }
      `}</style>

      <div className="testi-cloud-left absolute top-0 left-[-60px] w-44 md:w-60 opacity-70 pointer-events-none select-none"
        style={{ animation: "floatT1 10s ease-in-out infinite" }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="testi-cloud-right absolute bottom-0 right-[-40px] w-40 md:w-52 opacity-60 pointer-events-none select-none hidden md:block"
        style={{ animation: "floatT2 12s ease-in-out infinite" }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-12">

        <div className="text-center mb-10 md:mb-14">
          <p style={{ textTransform: "uppercase", letterSpacing: "0.22em", fontSize: "0.68rem", fontWeight: 700, color: "rgba(42,61,94,0.55)", marginBottom: "12px" }}>
            Avaliações
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.3rem, 5vw, 2.6rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.2 }}>
              O que nossos clientes dizem
            </h2>
            {user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                style={{
                  borderRadius: "999px", padding: "8px 18px",
                  background: "rgba(255,255,255,0.45)", backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,0.75)",
                  color: "#1a2744", fontSize: "0.78rem", fontWeight: 600,
                  fontFamily: '"Georgia", serif', cursor: "pointer",
                  transition: "all 0.25s ease", display: "flex", alignItems: "center", gap: "6px",
                  boxShadow: "0 2px 10px rgba(26,39,68,0.07)",
                }}
              >
                <MessageSquarePlus size={14} />
                {showReviewForm ? 'Fechar' : 'Avaliar'}
              </button>
            )}
          </div>
        </div>

        {showReviewForm && (
          <div className="mb-10 max-w-xl mx-auto">
            <ReviewForm onSuccess={() => { setShowReviewForm(false); fetchReviews(); }} />
          </div>
        )}

        {loadingReviews ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60" />
          </div>
        ) : list.length === 0 ? null : (
          <>
            <div className="hidden md:flex items-center justify-center gap-6 mb-10" style={{ minHeight: 280 }}>
              <div style={{ flex: "0 0 300px", maxWidth: 300, opacity: 0.38, transform: "scale(0.9)", pointerEvents: "none", userSelect: "none" }}>
                <ReviewCard review={list[(active - 1 + list.length) % list.length]} featured={false} />
              </div>
              <div
                key={active}
                className={animating
                  ? (animDir === 'next' ? 'testi-leave-next' : 'testi-leave-prev')
                  : (animDir === 'next' ? 'testi-enter-next' : 'testi-enter-prev')
                }
                style={{ flex: "0 0 400px", maxWidth: 400, zIndex: 2 }}
              >
                <ReviewCard review={list[active]} featured />
              </div>
              <div style={{ flex: "0 0 300px", maxWidth: 300, opacity: 0.38, transform: "scale(0.9)", pointerEvents: "none", userSelect: "none" }}>
                <ReviewCard review={list[(active + 1) % list.length]} featured={false} />
              </div>
            </div>

            <div className="md:hidden mb-8 px-2">
              <div
                key={`mob-${active}`}
                className={animating
                  ? (animDir === 'next' ? 'testi-leave-next' : 'testi-leave-prev')
                  : (animDir === 'next' ? 'testi-enter-next' : 'testi-enter-prev')
                }
              >
                <ReviewCard review={list[active]} featured />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button className="testi-arrow" onClick={prev} aria-label="Anterior">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a2744" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div className="flex items-center gap-2">
                {list.map((_, i) => (
                  <button key={i} className={`testi-dot${active === i ? ' testi-dot-active' : ''}`}
                    onClick={() => goTo(i, i > active ? 'next' : 'prev')} aria-label={`Avaliação ${i + 1}`} />
                ))}
              </div>
              <button className="testi-arrow" onClick={next} aria-label="Próximo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a2744" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

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

// ── HowItWorksSection ───────────────────────────────────────────────────────
function HowItWorksSection() {

  const [activeStep, setActiveStep] = useState(0);
  const [prevStep, setPrevStep] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const sectionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    STEPS.forEach(s => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  const goToStep = useCallback((idx) => {
    if (idx === activeStep || transitioning) return;
    setTransitioning(true);
    setPrevStep(activeStep);
    setActiveStep(idx);
    setTimeout(() => {
      setPrevStep(null);
      setTransitioning(false);
    }, 420);
  }, [activeStep, transitioning]);

  const startTimer = useCallback(() => {
  clearInterval(timerRef.current);
  timerRef.current = setInterval(() => {
      setActiveStep(prev => {
        const next = (prev + 1) % STEPS.length;
        setPrevStep(prev);
        setTransitioning(true);
        setTimeout(() => {
          setPrevStep(null);
          setTransitioning(false);
        }, 420);
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

  return (
    <section
      ref={sectionRef}
      className="relative py-14 md:py-20 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #5aa8e0 0%, #7bbde8 15%, #a8d8f0 38%, #c8e8f5 60%, #ddf0f7 80%, #eef8fb 100%)",
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
          height: 2px;
          border-radius: 2px;
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
          background: #1a2744;
          border-radius: 2px;
          transform-origin: left;
          transform: scaleX(0);
        }
        .howit-progress-bar.howit-running {
          animation: progressFill 4s linear forwards;
        }
        .howit-img-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.18) 25%,
            rgba(255,255,255,0.42) 50%,
            rgba(255,255,255,0.18) 75%
          );
          background-size: 400px 100%;
          animation: shimmer 2.2s ease-in-out infinite;
        }
        .howit-cta-btn {
          border-radius: 999px;
          padding: 9px 24px;
          background: transparent;
          border: 1.5px solid #1a2744;
          color: #1a2744;
          font-family: "Georgia", serif;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.28s ease;
        }
        .howit-cta-btn:hover { background: #1a2744; color: white; }
        .howit-panel-wrap {
          position: relative;
          min-height: clamp(320px, 40vw, 380px);
          will-change: contents;
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
        .howit-panel.is-idle {
          opacity: 1;
          transform: translateY(0);
        }
        @media (max-width: 767px) {
          .howit-cloud-left  { width: 130px !important; left: -15px !important; top: -5px !important; }
          .howit-cloud-right { display: none !important; }
          .howit-cloud-base  { display: none !important; }
          .howit-tabs        { gap: 0 !important; justify-content: space-between !important; }
          .howit-tab-btn     { min-width: 0 !important; flex: 1; padding-bottom: 10px !important; }
          .howit-panel       { position: absolute !important; }
          .howit-panel-wrap  { min-height: clamp(480px, 120vw, 600px) !important; }
          .howit-pill        { max-width: 100% !important; flex: 1 1 100% !important; }
          .howit-img-wrap    { max-width: 100% !important; flex: 1 1 100% !important; height: clamp(160px, 50vw, 240px) !important; border-radius: 12px !important; }
          .howit-footer-pill { font-size: 0.72rem !important; padding: 8px 14px !important; }
        }
      `}</style>

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

        <div
          className="howit-tabs flex items-center justify-center gap-6 md:gap-12 mb-10"
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

        <div className="howit-panel-wrap">
          {previous && transitioning && (
            <div className="howit-panel is-leaving" data-testid={previous.testId} aria-hidden="true">
              <PanelContent step={previous} onScrollToPlans={() => {
                const el = document.getElementById('plans');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }} />
            </div>
          )}
          <div className={`howit-panel ${transitioning ? "is-entering" : "is-idle"}`} data-testid={current.testId}>
            <PanelContent step={current} onScrollToPlans={() => {
              const el = document.getElementById('plans');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }} />
          </div>
        </div>

        <div className="text-center mt-10">
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

function PanelContent({ step, onScrollToPlans }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <>
      <div
        className="howit-pill"
        style={{
          flex: "1 1 260px", maxWidth: "380px", borderRadius: "22px",
          padding: "clamp(20px, 3vw, 32px) clamp(18px, 2.5vw, 28px)",
          background: "rgba(255,255,255,0.58)", backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.82)",
          boxShadow: "0 12px 36px rgba(26,39,68,0.1), 0 2px 6px rgba(26,39,68,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#1a2744", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: '"Georgia", serif', fontSize: "0.85rem", fontWeight: 700,
            flexShrink: 0, animation: "pulseRing 2.5s ease-out infinite",
          }}>
            {parseInt(step.num)}
          </div>
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.22em", color: "#5aa8e0", fontWeight: 700, textTransform: "uppercase" }}>
            Passo {step.num}
          </span>
        </div>
        <h3 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.1rem, 4vw, 1.5rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.22, marginBottom: "4px" }}>
          {step.title}
        </h3>
        <h4 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(0.82rem, 3vw, 0.9rem)", fontWeight: 400, color: "#5aa8e0", marginBottom: "12px" }}>
          {step.subtitle}
        </h4>
        <p style={{ color: "#3a5070", fontSize: "clamp(0.82rem, 3vw, 0.88rem)", lineHeight: 1.68, marginBottom: "22px" }}>
          {step.description}
        </p>
        <button
          className="howit-cta-btn"
          onClick={() => {
            if (step.ctaLink.startsWith('/#')) {
              onScrollToPlans();
            } else {
              navigate(step.ctaLink);
            }
          }}
        >
          {step.cta}
        </button>
      </div>

      <div
        className={`howit-img-wrap${!imgLoaded ? " howit-img-shimmer" : ""}`}
        style={{
          flex: "1 1 260px", maxWidth: "420px",
          height: "clamp(220px, 28vw, 300px)", borderRadius: "18px",
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

// ── FAQSection ──────────────────────────────────────────────────────────────
function FAQSection() {
  const faqs = [
    {
      q: "Como funciona o QR Code?",
      a: "O QR Code é gravado em uma placa de aço inox durável. Quando escaneado com um smartphone, ele direciona automaticamente para o memorial digital da pessoa homenageada.",
    },
    {
      q: "O memorial fica disponível para sempre?",
      a: "Sim! Após a criação e pagamento, seu memorial fica hospedado permanentemente em nossa plataforma, acessível 24/7 de qualquer lugar do mundo.",
    },
    {
      q: "Posso editar o memorial depois de criado?",
      a: "Sim! Após adquirir um plano, você pode editar seu documento gratuitamente e a qualquer momento. Basta acessar a página 'Meus Memoriais' e clicar no botão de edição disponível no card do memorial.",
    },
    {
      q: "Quanto tempo demora a entrega da placa?",
      a: "A produção e envio levam de 7 a 15 dias úteis. Você receberá código de rastreamento assim que o pedido for despachado.",
    },
    {
      q: "A placa resiste às condições do tempo?",
      a: "Sim! Nossa placa é feita em aço inox de alta qualidade, resistente à chuva, sol e variações de temperatura, garantindo durabilidade por muitos anos.",
    },
  ];

  const [open, setOpen] = useState(null);

  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #7bbde8 0%, #8ecce8 30%, #a0d4ee 60%, #b8e0f5 100%)",
        marginTop: 0, borderTop: "none",
      }}
    >
      <style>{`
        @keyframes floatF1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-12px) translateX(7px); }
        }
        @keyframes floatF2 {
          0%,100% { transform: translateY(0) translateX(0); }
          50%     { transform: translateY(-16px) translateX(-8px); }
        }
        @keyframes faqOpen {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .faq-item {
          transition: box-shadow 0.3s ease, transform 0.3s cubic-bezier(.22,1,.36,1);
        }
        .faq-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(26,39,68,0.13), inset 0 1px 0 rgba(255,255,255,0.9) !important;
        }
        .faq-answer { animation: faqOpen 0.32s cubic-bezier(.22,1,.36,1) both; }
        .faq-plus { transition: transform 0.35s cubic-bezier(.22,1,.36,1); flex-shrink: 0; }
        .faq-plus.open { transform: rotate(45deg); }
        @media (max-width: 767px) {
          .faq-cloud-left  { width: 120px !important; left: -15px !important; }
          .faq-cloud-right { display: none !important; }
        }
      `}</style>

      <div className="faq-cloud-left absolute top-[-10px] left-[-50px] w-48 md:w-64 opacity-80 pointer-events-none select-none"
        style={{ animation: "floatF1 10s ease-in-out infinite" }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="faq-cloud-right absolute bottom-[-10px] right-[-40px] w-44 md:w-56 opacity-70 pointer-events-none select-none hidden md:block"
        style={{ animation: "floatF2 12s ease-in-out infinite" }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
          <div className="md:w-72 lg:w-80 flex-shrink-0">
            <p style={{ textTransform: "uppercase", letterSpacing: "0.22em", fontSize: "0.68rem", fontWeight: 700, color: "#2a3d5e", marginBottom: "14px" }}>
              FAQ
            </p>
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.8rem, 6vw, 3rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.18, marginBottom: "16px" }}>
              Todas as respostas.
            </h2>
            <p style={{ color: "#3a5070", fontSize: "clamp(0.85rem, 3vw, 1rem)", lineHeight: 1.65, fontFamily: '"Georgia", serif' }}>
              Tem uma dúvida? A resposta está aqui.
            </p>
          </div>

          <div className="flex-1 w-full" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="faq-item"
                style={{
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.52)", backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.78)",
                  boxShadow: "0 4px 18px rgba(26,39,68,0.07), inset 0 1px 0 rgba(255,255,255,0.85)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "space-between", padding: "18px 22px",
                    background: "transparent", border: "none", cursor: "pointer",
                    textAlign: "left", gap: "12px",
                  }}
                >
                  <span style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(0.85rem, 3vw, 1rem)", fontWeight: 600, color: "#1a2744", lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <div
                    className={`faq-plus${open === i ? ' open' : ''}`}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: open === i ? "#1a2744" : "rgba(26,39,68,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.3s ease, transform 0.35s cubic-bezier(.22,1,.36,1)",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                      stroke={open === i ? "white" : "#1a2744"} strokeWidth="2" strokeLinecap="round">
                      <line x1="6" y1="1" x2="6" y2="11"/>
                      <line x1="1" y1="6" x2="11" y2="6"/>
                    </svg>
                  </div>
                </button>
                {open === i && (
                  <div className="faq-answer" style={{ padding: "0 22px 18px", borderTop: "1px solid rgba(26,39,68,0.06)" }}>
                    <p style={{ paddingTop: "14px", color: "#3a5070", fontSize: "clamp(0.82rem, 2.8vw, 0.92rem)", lineHeight: 1.72, fontFamily: '"Georgia", serif' }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PhotoPlaceholder({ label, icon, size = "normal", className = "", style = {} }) {
  const isLarge = size === "large";
  return (
    <div
      className={className}
      style={{
        position: 'relative', borderRadius: isLarge ? '28px' : '20px', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(200,232,245,0.6) 0%, rgba(168,216,240,0.5) 40%, rgba(123,189,232,0.4) 100%)',
        border: '1.5px dashed rgba(90,168,224,0.45)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: isLarge ? '16px' : '10px', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        boxShadow: isLarge
          ? '0 24px 72px rgba(26,39,68,0.12), inset 0 1px 0 rgba(255,255,255,0.7)'
          : '0 8px 28px rgba(26,39,68,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        ...style,
      }}
    >
      <div style={{ position: 'absolute', inset: '12px', borderRadius: isLarge ? '20px' : '14px', border: '1px solid rgba(255,255,255,0.55)', pointerEvents: 'none' }} />
      <div style={{
        width: isLarge ? 64 : 44, height: isLarge ? 64 : 44, borderRadius: '50%',
        background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 16px rgba(26,39,68,0.1)', flexShrink: 0,
      }}>
        {icon || (
          <svg width={isLarge ? 28 : 20} height={isLarge ? 28 : 20} viewBox="0 0 24 24" fill="none" stroke="#3a7fb5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        )}
      </div>
      <div style={{ textAlign: 'center', padding: '0 16px' }}>
        <p style={{ fontFamily: '"Georgia", serif', fontSize: isLarge ? '0.92rem' : '0.78rem', fontWeight: 600, color: '#2a4d70', letterSpacing: '0.03em', lineHeight: 1.4, margin: 0 }}>
          {label}
        </p>
        <p style={{ fontSize: isLarge ? '0.72rem' : '0.65rem', color: 'rgba(58,80,112,0.65)', marginTop: '4px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          {isLarge ? 'Foto do produto real em breve' : 'Inserir foto aqui'}
        </p>
      </div>
    </div>
  );
}

// ── ProductShowcaseSection ──────────────────────────────────────────────────
function ProductShowcaseSection() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const benefits = [
    {
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
      title: 'Produzido com cuidado e respeito',
      desc: 'Cada peça é feita com atenção ao detalhe e ao que ela representa.',
    },
    {
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
      title: 'Material de alta qualidade',
      desc: 'Aço inox resistente ao tempo, preservando a memória por décadas.',
    },
    {
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
      title: 'Uma lembrança eterna para a família',
      desc: 'Um ponto de encontro físico para homenagear e lembrar quem partiu.',
    },
  ];

  const secondaryCards = [
    {
      label: 'Detalhe do acabamento',
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a7fb5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
    },
    {
      label: 'Como ele chega embalado',
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a7fb5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>),
    },
    {
      label: 'Exemplo de homenagem pronta',
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a7fb5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        padding: 'clamp(64px, 10vw, 112px) 0',
        // Planos termina em #b8e0f0 → desce suave → entrega #8ecce8 para Trust Badges
        background: 'linear-gradient(180deg, #b8e0f0 0%, #c8e8f5 25%, #ddeef8 50%, #c8e8f5 75%, #8ecce8 100%)',
        margin: 0,
        borderTop: 'none',
        borderBottom: 'none',
        display: 'block',
      }}
    >
      <style>{`
        @keyframes floatProd1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-14px) translateX(8px); }
        }
        @keyframes floatProd2 {
          0%,100% { transform: translateY(0) translateX(0); }
          55%     { transform: translateY(-10px) translateX(-7px); }
        }
        @keyframes floatProd3 {
          0%,100% { transform: translateY(0) translateX(0); }
          40%     { transform: translateY(-8px) translateX(5px); }
        }
        @keyframes prodFadeUp {
          from { opacity: 0; transform: translateY(40px) scale(0.97); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0);   }
        }
        @keyframes prodFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes prodScaleIn {
          from { opacity: 0; transform: scale(0.93) translateY(20px); filter: blur(4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    filter: blur(0); }
        }
        @keyframes placeholderShimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .prod-placeholder-shimmer::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0.38) 50%, rgba(255,255,255,0.22) 55%, transparent 100%);
          background-size: 600px 100%;
          animation: placeholderShimmer 3s ease-in-out infinite;
          border-radius: inherit;
          pointer-events: none;
        }
        @keyframes gentlePulse {
          0%,100% { box-shadow: 0 24px 72px rgba(26,39,68,0.12), 0 0 0 0 rgba(90,168,224,0); }
          50%     { box-shadow: 0 32px 80px rgba(26,39,68,0.16), 0 0 0 12px rgba(90,168,224,0.06); }
        }
        .prod-secondary-card {
          transition: transform 0.38s cubic-bezier(.22,1,.36,1), box-shadow 0.38s ease;
          cursor: pointer;
        }
        .prod-secondary-card:hover {
          transform: translateY(-6px) scale(1.025);
          box-shadow: 0 20px 52px rgba(26,39,68,0.14), inset 0 1px 0 rgba(255,255,255,0.9) !important;
        }
        .prod-benefit-card {
          transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease, background 0.35s ease;
        }
        .prod-benefit-card:hover {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.72) !important;
          box-shadow: 0 14px 40px rgba(26,39,68,0.11), inset 0 1px 0 rgba(255,255,255,0.95) !important;
        }
        .prod-cta-btn {
          transition: transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, background 0.3s ease, color 0.3s ease;
        }
        .prod-cta-btn:hover {
          transform: translateY(-2px) scale(1.04);
          background: #1a2744 !important;
          color: white !important;
          box-shadow: 0 10px 32px rgba(26,39,68,0.22) !important;
        }
        @media (max-width: 767px) {
          .prod-cloud-left  { width: 120px !important; left: -15px !important; }
          .prod-cloud-right { display: none !important; }
          .prod-secondary-grid { grid-template-columns: 1fr !important; }
          .prod-benefits-row   { flex-direction: column !important; gap: 12px !important; }
        }
      `}</style>

      <div
        className="prod-cloud-left absolute pointer-events-none select-none"
        style={{ top: '-20px', left: '-55px', width: 'clamp(130px, 15vw, 220px)', opacity: 0.85, animation: 'floatProd1 10s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div
        className="prod-cloud-right absolute pointer-events-none select-none hidden md:block"
        style={{ top: '8%', right: '-45px', width: 'clamp(130px, 12vw, 200px)', opacity: 0.75, animation: 'floatProd2 13s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div
        className="absolute pointer-events-none select-none hidden lg:block"
        style={{ bottom: '12%', left: '5%', width: 'clamp(80px, 7vw, 120px)', opacity: 0.55, animation: 'floatProd3 8s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-12">

        <div className="text-center mb-14 md:mb-20" style={{ opacity: visible ? 1 : 0, animation: visible ? 'prodFadeIn 0.75s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.24em', fontSize: '0.66rem', fontWeight: 700, color: '#2a3d5e', marginBottom: '14px' }}>
            Produto físico
          </p>
          <h2 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.5rem, 5.5vw, 2.9rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.2, marginBottom: '16px' }}>
            Veja como sua homenagem
            <br className="hidden md:block" /> ganha vida
          </h2>
          <p style={{ color: '#3a5070', fontSize: 'clamp(0.88rem, 3.5vw, 1.05rem)', lineHeight: 1.72, maxWidth: '520px', margin: '0 auto', fontFamily: '"Georgia", serif' }}>
            Após contar a história do seu ente querido, criamos uma homenagem
            física única — feita com cuidado para eternizar memórias.
          </p>
        </div>

        <div style={{ opacity: visible ? 1 : 0, animation: visible ? 'prodScaleIn 0.9s cubic-bezier(.22,1,.36,1) 0.15s both' : 'none', marginBottom: 'clamp(32px, 5vw, 56px)', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', borderRadius: '32px', padding: '10px', background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(168,216,240,0.5) 100%)', boxShadow: '0 0 0 1px rgba(255,255,255,0.9), 0 0 48px rgba(90,168,224,0.2)', width: '100%', maxWidth: '680px' }}>
            <PhotoPlaceholder
              label="Foto do produto final"
              size="large"
              className="prod-placeholder-shimmer"
              style={{ width: '100%', height: 'clamp(260px, 38vw, 420px)', animation: visible ? 'gentlePulse 4s ease-in-out 1s infinite' : 'none' }}
            />
            <div style={{ position: 'absolute', bottom: '24px', right: '24px', background: 'rgba(26,39,68,0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: '14px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 24px rgba(26,39,68,0.25)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#5aa8e0', boxShadow: '0 0 8px rgba(90,168,224,0.8)' }} />
              <span style={{ fontFamily: '"Georgia", serif', fontSize: '0.72rem', fontWeight: 600, color: 'white', letterSpacing: '0.05em' }}>Aço inox gravado</span>
            </div>
            <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '7px', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 16px rgba(26,39,68,0.09)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a2744" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 14h3M17 17v3M20 17h-3v3"/>
              </svg>
              <span style={{ fontFamily: '"Georgia", serif', fontSize: '0.7rem', fontWeight: 700, color: '#1a2744', letterSpacing: '0.06em' }}>QR Code</span>
            </div>
          </div>
        </div>

        <div
          className="prod-secondary-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(12px, 2vw, 22px)', marginBottom: 'clamp(40px, 7vw, 72px)' }}
        >
          {secondaryCards.map((card, i) => (
            <div
              key={card.label}
              className="prod-secondary-card prod-placeholder-shimmer"
              style={{ opacity: visible ? 1 : 0, animation: visible ? `prodFadeUp 0.7s cubic-bezier(.22,1,.36,1) ${0.35 + i * 0.12}s both` : 'none' }}
            >
              <PhotoPlaceholder
                label={card.label}
                icon={card.icon}
                style={{ width: '100%', height: 'clamp(150px, 22vw, 210px)', boxShadow: '0 8px 28px rgba(26,39,68,0.09), inset 0 1px 0 rgba(255,255,255,0.7)' }}
              />
            </div>
          ))}
        </div>

        <div
          className="prod-benefits-row"
          style={{ display: 'flex', gap: 'clamp(10px, 2vw, 20px)', justifyContent: 'center', marginBottom: 'clamp(40px, 6vw, 64px)', flexWrap: 'wrap', opacity: visible ? 1 : 0, animation: visible ? 'prodFadeIn 0.7s cubic-bezier(.22,1,.36,1) 0.65s both' : 'none' }}
        >
          {benefits.map((b) => (
            <div
              key={b.title}
              className="prod-benefit-card"
              style={{ flex: '1 1 220px', maxWidth: '320px', borderRadius: '20px', padding: 'clamp(16px, 2.5vw, 24px) clamp(18px, 2.5vw, 28px)', background: 'rgba(255,255,255,0.52)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 6px 22px rgba(26,39,68,0.07), inset 0 1px 0 rgba(255,255,255,0.85)', display: 'flex', alignItems: 'flex-start', gap: '14px' }}
            >
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(90,168,224,0.18) 0%, rgba(123,189,232,0.12) 100%)', border: '1px solid rgba(90,168,224,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#3a7fb5' }}>
                {b.icon}
              </div>
              <div>
                <p style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.82rem, 2.5vw, 0.9rem)', fontWeight: 700, color: '#1a2744', marginBottom: '4px', lineHeight: 1.3 }}>{b.title}</p>
                <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.8rem)', color: '#3a5070', lineHeight: 1.65, fontFamily: '"Georgia", serif' }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', opacity: visible ? 1 : 0, animation: visible ? 'prodFadeIn 0.7s cubic-bezier(.22,1,.36,1) 0.8s both' : 'none' }}>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, rgba(90,168,224,0.5), transparent)', margin: '0 auto 24px' }} />
          <Link to="/create-memorial">
            <button
              className="prod-cta-btn"
              style={{ borderRadius: '999px', padding: 'clamp(12px, 2vw, 15px) clamp(28px, 5vw, 44px)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1.5px solid rgba(26,39,68,0.22)', color: '#1a2744', fontFamily: '"Georgia", serif', fontSize: 'clamp(0.82rem, 3vw, 0.95rem)', fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '0 6px 22px rgba(26,39,68,0.1)', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
              Começar minha homenagem
            </button>
          </Link>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <SecurityBadge variant="minimal" />
          </div>
          <p style={{ marginTop: '12px', fontSize: '0.72rem', color: 'rgba(58,80,112,0.65)', fontFamily: '"Georgia", serif', letterSpacing: '0.05em' }}>
            ✨ Criar é gratuito · Você só paga ao publicar
          </p>
        </div>
      </div>
    </section>
  );
}

// ── TrustBadgesSection ──────────────────────────────────────────────────────
const TrustBadgesSection = () => (
  <section
    className="trust-section relative py-8 md:py-10 overflow-hidden"
    style={{
      // Recebe #8ecce8 do ProductShowcase e entrega #7bbde8 para o FAQ
      background: "linear-gradient(180deg, #8ecce8 0%, #7bbde8 100%)",
      marginTop: 0,
      borderTop: "none",
    }}
  >
    <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
      <div className="trust-badges flex flex-wrap justify-center items-center gap-5 sm:gap-8 md:gap-12">
        {[{ label: "Site Seguro" }, { label: "Compra pelo Mercado Pago" }, { label: "Entrega Rastreável" }].map(({ label }) => (
          <div
            key={label}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 18px", borderRadius: "999px",
              background: "rgba(255,255,255,0.52)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.75)",
              boxShadow: "0 2px 12px rgba(26,39,68,0.07)",
            }}
          >
            <svg style={{ width: 16, height: 16, color: "#3a9e6e", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(0.72rem, 3vw, 0.82rem)", fontWeight: 600, color: "#1a2744" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Home ────────────────────────────────────────────────────────────────────
const Home = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await axios.get(`${API}/reviews`);
        if (response.data && response.data.length > 0) {
          setReviews(response.data);
        } else {
          setReviews(defaultReviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews(defaultReviews);
      } finally {
        setLoadingReviews(false);
      }
    };
    loadReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews`);
      if (response.data && response.data.length > 0) {
        setReviews(response.data);
      } else {
        setReviews(defaultReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(defaultReviews);
    }
  };

  return (
    <div
      data-testid="home-page"
      className="overflow-x-hidden"
      style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)' }}
    >
      <style>{`
        @media (max-width: 767px) {
          .hero-section {
            min-height: unset !important;
            padding-top: 80px !important;
            padding-bottom: 32px !important;
          }
          .hero-content {
            flex-direction: column !important;
            gap: 24px !important;
            padding: 0 4px !important;
          }
          .hero-text { text-align: center !important; }
          .hero-video-wrap {
            width: clamp(200px, 70vw, 300px) !important;
            height: clamp(240px, 84vw, 360px) !important;
            border-radius: 16px !important;
            align-self: center !important;
          }
          .hero-cloud-1-wrap { width: 130px !important; left: -15px !important; top: 6px !important; }
          .hero-cloud-2-wrap { width: 110px !important; right: -15px !important; top: 0 !important; }
          .hero-cloud-3-wrap { display: none !important; }
          .hero-cloud-4-wrap { display: none !important; }
          .plans-cloud-left  { width: 110px !important; left: -10px !important; }
          .plans-cloud-right { display: none !important; }
          .plans-grid        { gap: 12px !important; }
          .trust-section { padding-top: 20px !important; padding-bottom: 20px !important; }
          .trust-badges  { gap: 8px !important; }
          .why-section       { padding-top: 40px !important; padding-bottom: 40px !important; }
          .why-cloud-left    { width: 110px !important; left: -10px !important; }
          .why-cloud-right   { display: none !important; }
        }
      `}</style>

      {/* ── 1. Hero ── */}
      <section
        className="hero-section relative pt-24 md:pt-28 min-h-[600px] md:min-h-[750px] flex items-center justify-center overflow-hidden px-4"
        style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 30%, #7bbde8 60%, #5aa8e0 100%)' }}
      >
        <style>{`
          @keyframes floatCloud1 { 0%, 100% { transform: translateY(0px) translateX(0px); } 33% { transform: translateY(-12px) translateX(6px); } 66% { transform: translateY(-6px) translateX(-4px); } }
          @keyframes floatCloud2 { 0%, 100% { transform: translateY(0px) translateX(0px); } 40% { transform: translateY(-10px) translateX(-8px); } 70% { transform: translateY(-16px) translateX(4px); } }
          @keyframes floatCloud3 { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-8px) translateX(5px); } }
          @keyframes floatCloud4 { 0%, 100% { transform: translateY(0px) translateX(0px); } 45% { transform: translateY(-14px) translateX(-6px); } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-24px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
          .hero-cloud-1 { animation: floatCloud1 7s ease-in-out infinite; }
          .hero-cloud-2 { animation: floatCloud2 9s ease-in-out infinite; }
          .hero-cloud-3 { animation: floatCloud3 6s ease-in-out infinite; }
          .hero-cloud-4 { animation: floatCloud4 8s ease-in-out infinite; }
          .anim-fade-down  { animation: fadeInDown  0.7s ease both; }
          .anim-fade-up-1  { animation: fadeInUp    0.7s ease 0.2s both; }
          .anim-fade-up-2  { animation: fadeInUp    0.7s ease 0.4s both; }
          .anim-fade-up-3  { animation: fadeInUp    0.7s ease 0.6s both; }
          .anim-fade-right { animation: fadeInRight 0.8s ease 0.5s both; }
        `}</style>

        <div className="hero-cloud-1-wrap anim-fade-down absolute top-4 left-[-50px] w-64 md:w-80 opacity-95 pointer-events-none select-none">
          <div className="hero-cloud-1"><img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} /></div>
        </div>
        <div className="hero-cloud-2-wrap anim-fade-down absolute top-2 right-[-40px] w-56 md:w-72 opacity-95 pointer-events-none select-none" style={{ animationDelay: '0.15s' }}>
          <div className="hero-cloud-2"><img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} /></div>
        </div>
        <div className="hero-cloud-3-wrap anim-fade-down absolute top-[38%] right-6 w-28 md:w-36 opacity-75 pointer-events-none select-none hidden md:block" style={{ animationDelay: '0.3s' }}>
          <div className="hero-cloud-3"><img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} /></div>
        </div>
        <div className="hero-cloud-4-wrap anim-fade-down absolute bottom-[28%] left-4 w-24 md:w-32 opacity-65 pointer-events-none select-none hidden md:block" style={{ animationDelay: '0.25s' }}>
          <div className="hero-cloud-4"><img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} /></div>
        </div>

        <div className="hero-content relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 px-4 md:px-8">
          <div className="hero-text flex-1 text-center md:text-left">
            <h1
              className="anim-fade-up-1 font-bold tracking-tight leading-tight mb-4 md:mb-6"
              data-testid="hero-title"
              style={{ fontSize: 'clamp(1.7rem, 6vw, 3.2rem)', color: '#1a2744', fontFamily: '"Georgia", serif', lineHeight: 1.15 }}
            >
              Transforme lembranças<br />em homenagens.
            </h1>
            <p
              className="anim-fade-up-2 font-light mb-8 md:mb-10 max-w-xl mx-auto md:mx-0"
              style={{ fontSize: 'clamp(0.88rem, 3.5vw, 1.05rem)', color: '#2a3d5e', lineHeight: 1.7 }}
            >
              Mantenha as histórias de quem você ama vivas, acessível a qualquer momento, de qualquer lugar.
            </p>

            {/* ── Hero CTA + SecurityBadge minimal ── */}
            <div className="anim-fade-up-3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'inherit' }}>
              <Link to="/create-memorial">
                <Button
                  size="lg"
                  className="rounded-full px-10 py-5 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  data-testid="hero-cta-button"
                  style={{ fontSize: 'clamp(0.82rem, 3.5vw, 1rem)', background: '#1a2744', color: 'white', letterSpacing: '0.05em' }}
                >
                  Criar memorial gratuito
                </Button>
              </Link>
              {/* Badge com margem top menor e alinhada ao botão */}
              <div style={{ marginTop: 14 }}>
                <SecurityBadge variant="minimal" />
              </div>
            </div>
          </div>
          <div className="hero-video-wrap anim-fade-right flex-shrink-0 w-[260px] md:w-[320px] lg:w-[380px] h-[320px] md:h-[400px] lg:h-[440px] rounded-3xl overflow-hidden shadow-2xl relative">
            <video src="/video-hero.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ── 2. Como Funciona ── */}
      <HowItWorksSection />

      {/* ── 3. Planos ── */}
      <section
        className="relative py-16 md:py-24 overflow-hidden"
        id='plans'
        style={{ background: "linear-gradient(180deg, #eef8fb 0%, #ddf0f7 25%, #c8e8f5 60%, #b8e0f0 100%)", marginTop: 0, borderTop: "none" }}
      >
        <style>{`
          @keyframes floatP1 { 0%,100% { transform: translateY(0) translateX(0); } 45% { transform: translateY(-12px) translateX(7px); } }
          @keyframes floatP2 { 0%,100% { transform: translateY(0) translateX(0); } 55% { transform: translateY(-16px) translateX(-8px); } }
          @keyframes revealPlans { from { opacity: 0; transform: translateY(32px); filter: blur(6px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
          .plan-card { transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease; }
          .plan-card:hover { transform: translateY(-6px) scale(1.015); }
          .plan-card-popular:hover { transform: translateY(-8px) scale(1.02); }
          .plan-check-dot { width: 6px; height: 6px; border-radius: 50%; background: #5aa8e0; flex-shrink: 0; margin-right: 10px; margin-top: 5px; }
        `}</style>

        <div className="plans-cloud-left absolute top-[-10px] left-[-50px] w-52 md:w-64 opacity-85 pointer-events-none select-none" style={{ animation: "floatP1 10s ease-in-out infinite" }}>
          <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div className="plans-cloud-right absolute bottom-[10%] right-[-40px] w-44 md:w-56 opacity-75 pointer-events-none select-none hidden md:block" style={{ animation: "floatP2 12s ease-in-out infinite" }}>
          <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12" style={{ animation: "revealPlans 0.8s cubic-bezier(.22,1,.36,1) both" }}>
          <div className="text-center mb-10 md:mb-14">
            <p style={{ textTransform: "uppercase", letterSpacing: "0.22em", fontSize: "0.68rem", fontWeight: 700, color: "#2a3d5e", marginBottom: "12px" }}>Planos</p>
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.3rem, 5vw, 2.6rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.2, marginBottom: "12px" }}>Escolha seu Plano</h2>
            <p style={{ color: "#3a5070", fontSize: "clamp(0.85rem, 3vw, 1rem)", lineHeight: 1.65, maxWidth: "380px", margin: "0 auto" }}>Duas opções para eternizar a memória de quem você ama</p>
          </div>

          <div className="plans-grid grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-3xl mx-auto">
            {/* Plano Digital */}
            <div className="plan-card" style={{ borderRadius: "22px", padding: "clamp(22px, 3vw, 32px)", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 10px 36px rgba(26,39,68,0.09), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
              <h3 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1rem, 4vw, 1.35rem)", fontWeight: 700, color: "#1a2744", marginBottom: "10px" }}>Plano Digital</h3>
              <div style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.8rem, 7vw, 2.8rem)", fontWeight: 700, color: "#5aa8e0", lineHeight: 1, marginBottom: "6px" }}>R$ 29,90</div>
              <p style={{ color: "#3a5070", fontSize: "clamp(0.8rem, 3vw, 0.82rem)", marginBottom: "18px", lineHeight: 1.5 }}>Memorial digital publicado na plataforma</p>
              <ul style={{ marginBottom: "22px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {["Memorial digital completo","Galeria de até 10 fotos","Áudio de homenagem","QR Code digital"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", color: "#3a5070", fontSize: "clamp(0.8rem, 3vw, 0.85rem)", lineHeight: 1.5 }}>
                    <span className="plan-check-dot" />{item}
                  </li>
                ))}
              </ul>
              <Link to="/create-memorial">
                <button
                  style={{ width: "100%", borderRadius: "999px", padding: "11px 0", background: "transparent", border: "1.5px solid #1a2744", color: "#1a2744", fontFamily: '"Georgia", serif', fontSize: "clamp(0.78rem, 3vw, 0.82rem)", fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", transition: "all 0.28s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1a2744"; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1a2744"; }}
                >ESCOLHER PLANO</button>
              </Link>
              {/* Badge minimal sob o botão do plano digital */}
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
                <SecurityBadge variant="minimal" />
              </div>
            </div>

            {/* Plano Placa */}
            <div className="plan-card plan-card-popular" style={{ borderRadius: "22px", padding: "clamp(22px, 3vw, 32px)", background: "rgba(26,39,68,0.88)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(90,168,224,0.35)", boxShadow: "0 16px 48px rgba(26,39,68,0.22), inset 0 1px 0 rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "16px", right: "16px", background: "linear-gradient(135deg, #f5c842, #f0a800)", color: "#1a2744", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", padding: "4px 12px", borderRadius: "999px", textTransform: "uppercase", boxShadow: "0 2px 8px rgba(245,200,66,0.4)" }}>Mais Popular</div>
              <h3 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1rem, 4vw, 1.35rem)", fontWeight: 700, color: "white", marginBottom: "10px" }}>Plano Placa QR Code</h3>
              <div style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.8rem, 7vw, 2.8rem)", fontWeight: 700, color: "#7bbde8", lineHeight: 1, marginBottom: "6px" }}>R$ 149,90</div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(0.8rem, 3vw, 0.82rem)", marginBottom: "18px", lineHeight: 1.5 }}>Memorial + Placa física de aço inox</p>
              <ul style={{ marginBottom: "22px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {["Tudo do Plano Digital","Placa física em aço inox","QR Code gravado permanente","Envio para todo Brasil"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", color: "rgba(255,255,255,0.8)", fontSize: "clamp(0.8rem, 3vw, 0.85rem)", lineHeight: 1.5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7bbde8", flexShrink: 0, marginRight: 10, marginTop: 5 }} />{item}
                  </li>
                ))}
              </ul>
              <Link to="/create-memorial">
                <button
                  style={{ width: "100%", borderRadius: "999px", padding: "11px 0", background: "#5aa8e0", border: "none", color: "white", fontFamily: '"Georgia", serif', fontSize: "clamp(0.78rem, 3vw, 0.82rem)", fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", transition: "all 0.28s ease", boxShadow: "0 4px 16px rgba(90,168,224,0.4)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#7bbde8"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(90,168,224,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#5aa8e0"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(90,168,224,0.4)"; }}
                >ESCOLHER PLANO</button>
              </Link>
              {/* Badge minimal com cores adaptadas para fundo escuro */}
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '6px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(123,189,232,0.8)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span style={{ fontFamily: '"Georgia", serif', fontSize: '0.67rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                    Pagamento seguro via
                  </span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(123,189,232,0.4)', flexShrink: 0 }} />
                  <img
                    src="/mercadopago-logo.webp"
                    alt="Mercado Pago"
                    style={{ height: 13, width: 'auto', opacity: 0.55, display: 'block', flexShrink: 0, filter: 'brightness(0) invert(1)' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'inline';
                    }}
                  />
                  <span style={{ display: 'none', fontFamily: '"Georgia", serif', fontSize: '0.67rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                    Mercado Pago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SecurityBadge bar abaixo dos dois cards — com mais espaçamento */}
        <div style={{ maxWidth: 820, margin: '32px auto 0', padding: '0 20px' }}>
          <SecurityBadge variant="bar" />
        </div>
      </section>


      {/* ── 4. Product Showcase ── */}
      <ProductShowcaseSection />

      {/* ── 5. Trust Badges ── */}
      <TrustBadgesSection />

      {/* ── 6. FAQ ── */}
      <FAQSection />

      {/* ── 7. Testimonials ── */}
      <TestimonialsSection
        reviews={reviews}
        loadingReviews={loadingReviews}
        user={user}
        showReviewForm={showReviewForm}
        setShowReviewForm={setShowReviewForm}
        fetchReviews={fetchReviews}
      />

      {/* ── 8. Why Choose Us ── */}
      <section
        className="why-section relative py-16 md:py-24 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #b8e0f5 0%, #c8e8f5 35%, #ddf0f7 65%, #eef8fb 100%)", marginTop: 0, borderTop: "none" }}
      >
        <style>{`
          @keyframes floatW1 { 0%,100% { transform: translateY(0) translateX(0); } 45% { transform: translateY(-13px) translateX(7px); } }
          @keyframes floatW2 { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-10px) translateX(-6px); } }
          @keyframes revealWhy { from { opacity: 0; transform: translateY(28px); filter: blur(5px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
          .why-btn { transition: transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, background 0.3s ease; }
          .why-btn:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 8px 28px rgba(26,39,68,0.15) !important; background: #1a2744 !important; color: white !important; }
        `}</style>

        <div className="why-cloud-left absolute top-[-10px] left-[-50px] w-44 md:w-60 opacity-80 pointer-events-none select-none" style={{ animation: "floatW1 9s ease-in-out infinite" }}>
          <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div className="why-cloud-right absolute bottom-[-8px] right-[-40px] w-40 md:w-56 opacity-70 pointer-events-none select-none hidden md:block" style={{ animation: "floatW2 11s ease-in-out infinite" }}>
          <img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center" style={{ animation: "revealWhy 0.8s cubic-bezier(.22,1,.36,1) both" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.22em", fontSize: "0.68rem", fontWeight: 700, color: "#2a3d5e", marginBottom: "16px" }}>Por que nos escolher</p>
          <h2 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.6rem, 6.5vw, 3.2rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.18, marginBottom: "20px" }}>
            Por que a<br className="hidden md:block" /> Remember QRCode.
          </h2>
          <p style={{ color: "#3a5070", fontSize: "clamp(0.88rem, 3.5vw, 1.1rem)", lineHeight: 1.72, maxWidth: "520px", margin: "0 auto 36px", fontFamily: '"Georgia", serif' }}>
            Escolha quem entende a importância de preservar memórias. Oferecemos uma tecnologia única de QR Codes personalizados, que conecta o presente ao passado de forma significativa.
          </p>
          <Link to="/how-it-works">
            <button className="why-btn" style={{ borderRadius: "999px", padding: "13px 34px", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1.5px solid rgba(26,39,68,0.2)", color: "#1a2744", fontFamily: '"Georgia", serif', fontSize: "clamp(0.82rem, 3.5vw, 0.95rem)", fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer", boxShadow: "0 4px 18px rgba(26,39,68,0.08)" }}>
              Saiba mais
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;