import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { CheckCircle2, FileText, Eye, CreditCard, ArrowRight } from 'lucide-react';

function StepsSection({ steps }) {
  const [visibleSteps, setVisibleSteps] = useState([]);
  const stepRefs = useRef([]);

  useEffect(() => {
    const observers = stepRefs.current.map((ref, index) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleSteps(prev =>
                prev.includes(index) ? prev : [...prev, index]
              );
            }, index * 180);
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(ref);
      return observer;
    });
    return () => observers.forEach(obs => obs && obs.disconnect());
  }, []);

  const stepColors = ['#f5a623', '#4a90d9', '#7dc242'];

  const stepIcons = [
    // Ícone estilo "app mobile" — passo 1
    (color) => (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect x="8" y="4" width="34" height="44" rx="6" fill={color} />
        <rect x="12" y="8" width="26" height="36" rx="4" fill="white" opacity="0.25" />
        <circle cx="25" cy="26" r="7" fill="white" opacity="0.9" />
        <rect x="16" y="14" width="14" height="2.5" rx="1.25" fill="white" opacity="0.7" />
        <rect x="16" y="19" width="10" height="2" rx="1" fill="white" opacity="0.5" />
        <rect x="8" y="4" width="34" height="44" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        {/* Bolinha azul no canto */}
        <circle cx="38" cy="10" r="6" fill="#4a90d9" />
        <circle cx="38" cy="10" r="3" fill="white" />
      </svg>
    ),
    // Ícone estilo "documento médico" — passo 2
    (color) => (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect x="6" y="6" width="34" height="42" rx="6" fill={color} />
        <rect x="10" y="10" width="26" height="34" rx="3" fill="white" opacity="0.2" />
        {/* Cruz */}
        <rect x="19" y="20" width="14" height="4" rx="2" fill="white" opacity="0.95" />
        <rect x="21" y="16" width="4" height="12" rx="2" fill="white" opacity="0.95" />
        <rect x="10" y="36" width="16" height="2.5" rx="1.25" fill="white" opacity="0.5" />
        <rect x="10" y="40" width="11" height="2" rx="1" fill="white" opacity="0.4" />
        {/* Segunda folha atrás */}
        <rect x="14" y="2" width="34" height="42" rx="6" fill={color} opacity="0.5" />
        <rect x="6" y="6" width="34" height="42" rx="6" fill={color} />
        <rect x="19" y="20" width="14" height="4" rx="2" fill="white" opacity="0.95" />
        <rect x="21" y="16" width="4" height="12" rx="2" fill="white" opacity="0.95" />
      </svg>
    ),
    // Ícone estilo "fones de ouvido" — passo 3
    (color) => (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <path d="M14 28 C14 18 42 18 42 28" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="9" y="28" width="10" height="14" rx="5" fill={color} />
        <rect x="37" y="28" width="10" height="14" rx="5" fill={color} />
        <rect x="10" y="30" width="8" height="10" rx="4" fill="white" opacity="0.3" />
        <rect x="38" y="30" width="8" height="10" rx="4" fill="white" opacity="0.3" />
      </svg>
    ),
  ];

  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #5aa8e0 0%, #7bbde8 20%, #a8d8f0 50%, #c8e8f5 75%, #ddf0f7 100%)',
        marginTop: 0,
        borderTop: 'none',
      }}
    >
      <style>{`
        @keyframes floatSt1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-14px) translateX(8px); }
        }
        @keyframes floatSt2 {
          0%,100% { transform: translateY(0) translateX(0); }
          50%     { transform: translateY(-10px) translateX(-7px); }
        }
        @keyframes stepReveal {
          from { opacity: 0; transform: translateY(36px) scale(0.97); filter: blur(5px); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0);   }
        }
        @keyframes lineGrow {
          from { height: 0; }
          to   { height: 56px; }
        }
        @keyframes dotPop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes iconFloat {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-6px); }
        }
        .step-card-inner {
          transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease;
        }
        .step-card-inner:hover {
          transform: translateY(-4px) scale(1.015);
          box-shadow: 0 20px 56px rgba(26,39,68,0.14),
                      inset 0 1px 0 rgba(255,255,255,0.95) !important;
        }
        .step-cta-btn {
          border-radius: 999px;
          padding: 8px 20px;
          background: transparent;
          border: 1.5px solid rgba(26,39,68,0.25);
          color: #1a2744;
          font-family: "Georgia", serif;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .step-cta-btn:hover {
          background: #1a2744;
          color: white;
          border-color: #1a2744;
        }
      `}</style>

      {/* Nuvem esquerda */}
      <div
        className="absolute top-[5%] left-[-50px] w-52 md:w-72 opacity-85 pointer-events-none select-none"
        style={{ animation: 'floatSt1 10s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud1.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* Nuvem direita */}
      <div
        className="absolute top-[35%] right-[-40px] w-44 md:w-64 opacity-75 pointer-events-none select-none hidden md:block"
        style={{ animation: 'floatSt2 12s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud2.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* Nuvem esquerda baixo */}
      <div
        className="absolute bottom-[5%] left-[2%] w-36 opacity-65 pointer-events-none select-none hidden lg:block"
        style={{ animation: 'floatSt1 8s ease-in-out infinite 1.5s' }}
      >
        <img src="/clouds/cloud1.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12">

        {/* Cabeçalho — lado esquerdo + cards lado direito */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">

          {/* Coluna esquerda — título fixo */}
          <div className="md:w-64 lg:w-80 flex-shrink-0 md:sticky md:top-32">
            <p style={{
              textTransform: 'uppercase', letterSpacing: '0.22em',
              fontSize: '0.65rem', fontWeight: 700,
              color: '#2a3d5e', marginBottom: '14px',
            }}>
              O Processo
            </p>
            <h2 style={{
              fontFamily: '"Georgia", serif',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: 700, color: '#1a2744',
              lineHeight: 1.18, marginBottom: '14px',
            }}>
              Criar, visualizar e publicar.
            </h2>
            <p style={{
              color: '#3a5070',
              fontSize: '0.88rem',
              lineHeight: 1.68,
              fontFamily: '"Georgia", serif',
            }}>
              Preencha, veja o resultado e escolha um plano.
              Simples, rápido e feito com respeito.
            </p>
          </div>

          {/* Coluna direita — timeline */}
          <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {steps.map((step, index) => {
              const isVisible = visibleSteps.includes(index);
              const isLast = index === steps.length - 1;
              const color = stepColors[index];

              return (
                <div
                  key={index}
                  style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  {/* Dot numerado no topo da linha */}
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.85)',
                    border: '1.5px solid rgba(26,39,68,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(26,39,68,0.1)',
                    fontFamily: '"Georgia", serif',
                    fontSize: '0.72rem', fontWeight: 700, color: '#1a2744',
                    opacity: isVisible ? 1 : 0,
                    animation: isVisible ? 'dotPop 0.4s cubic-bezier(.22,1,.36,1) both' : 'none',
                    zIndex: 2,
                    flexShrink: 0,
                  }}>
                    {index + 1}
                  </div>

                  {/* Linha entre dot e card */}
                  <div style={{
                    width: 1,
                    height: isVisible ? 40 : 0,
                    background: 'rgba(255,255,255,0.6)',
                    transition: 'height 0.4s ease 0.15s',
                    flexShrink: 0,
                  }} />

                  {/* Card */}
                  <div
                    ref={el => { stepRefs.current[index] = el; }}
                    data-testid={'step-' + index}
                    className="step-card-inner"
                    style={{
                      width: '100%',
                      borderRadius: '20px',
                      padding: '28px 24px 22px',
                      background: 'rgba(255,255,255,0.72)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.88)',
                      boxShadow: '0 8px 32px rgba(26,39,68,0.09), inset 0 1px 0 rgba(255,255,255,0.95)',
                      textAlign: 'center',
                      opacity: isVisible ? 1 : 0,
                      animation: isVisible
                        ? 'stepReveal 0.65s cubic-bezier(.22,1,.36,1) ' + (index * 0.18) + 's both'
                        : 'none',
                    }}
                  >
                    {/* Ícone animado */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center',
                      width: 88, height: 88,
                      borderRadius: '22px',
                      background: color + '18',
                      marginBottom: 16,
                      animation: isVisible ? 'iconFloat 3s ease-in-out infinite ' + (index * 0.5) + 's' : 'none',
                    }}>
                      {stepIcons[index](color)}
                    </div>

                    {/* Label */}
                    <p style={{
                      fontSize: '0.6rem',
                      letterSpacing: '0.2em',
                      color: color,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontFamily: '"Georgia", serif',
                      marginBottom: 6,
                    }}>
                      {'STEP ' + step.number}
                    </p>

                    {/* Título */}
                    <h3 style={{
                      fontFamily: '"Georgia", serif',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.65rem)',
                      fontWeight: 700, color: '#1a2744',
                      lineHeight: 1.2, marginBottom: 10,
                    }}>
                      {step.title}
                    </h3>

                    {/* Descrição */}
                    <p style={{
                      color: '#3a5070',
                      fontSize: '0.84rem',
                      lineHeight: 1.7,
                      fontFamily: '"Georgia", serif',
                      marginBottom: 18,
                      maxWidth: 260,
                      margin: '0 auto 18px',
                    }}>
                      {step.description}
                    </p>

                    {/* Badge highlight */}
                    {step.highlight && (
                      <div style={{ marginBottom: 16 }}>
                        <span style={{
                          padding: '4px 14px', borderRadius: '999px',
                          background: color + '18',
                          border: '1px solid ' + color + '40',
                          color: '#3a5070', fontSize: '0.68rem', fontWeight: 700,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          fontFamily: '"Georgia", serif',
                        }}>
                          {step.highlight}
                        </span>
                      </div>
                    )}

                    {/* CTA */}
                    <Link to={step.ctaLink || '/create-memorial'}>
                      <button className="step-cta-btn">
                        {step.cta || 'Começar agora'}
                      </button>
                    </Link>
                  </div>

                  {/* Linha entre cards */}
                  {!isLast && (
                    <div style={{
                      width: 1,
                      height: isVisible ? 56 : 0,
                      background: 'rgba(255,255,255,0.6)',
                      transition: 'height 0.5s ease 0.3s',
                      flexShrink: 0,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
// ── Fim StepsSection ────────────────────────────────────────────────────────

// ── IncludedSection ─────────────────────────────────────────────────────────
function IncludedSection() {
  const [visibleCards, setVisibleCards] = useState([]);
  const [titleVisible, setTitleVisible] = useState(false);
  const cardRefs = useRef([]);
  const titleRef = useRef(null);

  const items = [
    { title: 'Memorial Digital Completo', desc: 'Página personalizada com fotos, biografia e áudio' },
    { title: 'QR Code Único',             desc: 'Acesso instantâneo ao memorial de qualquer lugar' },
    { title: 'Galeria de Fotos',          desc: 'Até 10 imagens para preservar momentos especiais' },
    { title: 'Placa de Aço Inox (Opcional)', desc: 'Durabilidade e elegância para eternizar a homenagem' },
    { title: 'Hospedagem Eterna',         desc: 'Seu memorial fica disponível para sempre' },
    { title: 'Suporte Dedicado',          desc: 'Atendimento via WhatsApp para qualquer dúvida' },
  ];

  useEffect(() => {
    const titleObs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTitleVisible(true); },
      { threshold: 0.2 }
    );
    if (titleRef.current) titleObs.observe(titleRef.current);

    const cardObs = cardRefs.current.map((ref, i) => {
      if (!ref) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleCards(prev => prev.includes(i) ? prev : [...prev, i]);
            }, i * 100);
          }
        },
        { threshold: 0.15 }
      );
      obs.observe(ref);
      return obs;
    });

    return () => {
      titleObs.disconnect();
      cardObs.forEach(o => o && o.disconnect());
    };
  }, []);

  // Duração e delay únicos por card para parecerem independentes
  const floatParams = [
    { duration: '4.8s', delay: '0s',    distance: '7px'  },
    { duration: '5.6s', delay: '0.6s',  distance: '9px'  },
    { duration: '4.2s', delay: '1.1s',  distance: '6px'  },
    { duration: '6.0s', delay: '0.3s',  distance: '8px'  },
    { duration: '5.0s', delay: '0.9s',  distance: '7px'  },
    { duration: '4.6s', delay: '1.4s',  distance: '10px' },
  ];

  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #a8d8f0 0%, #8ecce8 20%, #7bbde8 40%, #a8d8f0 65%, #c8e8f5 80%, #eef8fb 100%)',
        marginTop: 0,
        borderTop: 'none',
      }}
    >
      <style>{`
        @keyframes floatInc1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-12px) translateX(7px); }
        }
        @keyframes floatInc2 {
          0%,100% { transform: translateY(0) translateX(0); }
          50%     { transform: translateY(-9px) translateX(-6px); }
        }
        @keyframes revealTitle {
          from { opacity: 0; transform: translateY(24px); filter: blur(5px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
        }
        @keyframes revealCard {
          from { opacity: 0; transform: translateY(32px) scale(0.97); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0);   }
        }

        /* Float suave — apenas translateY, sem conflito com outras anims */
        @keyframes floatSmooth {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(var(--float-dist, -7px)); }
        }

        /* Wrapper que carrega o reveal */
        .inc-card-reveal {
          animation: revealCard 0.65s cubic-bezier(.22,1,.36,1) both;
        }

        /* Wrapper interno que carrega o float — separado do reveal */
        .inc-card-float {
          animation: floatSmooth var(--float-dur, 5s) ease-in-out var(--float-delay, 0s) infinite;
          will-change: transform;
        }

        .inc-card {
          transition: box-shadow 0.3s ease;
        }
        .inc-card:hover {
          box-shadow: 0 16px 40px rgba(26,39,68,0.14),
                      inset 0 1px 0 rgba(255,255,255,0.95) !important;
        }
      `}</style>

      {/* Nuvem esquerda */}
      <div
        className="absolute top-[-10px] left-[-50px] w-44 md:w-60 opacity-75 pointer-events-none select-none"
        style={{ animation: 'floatInc1 10s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud1.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* Nuvem direita */}
      <div
        className="absolute bottom-[-10px] right-[-40px] w-40 md:w-56 opacity-65 pointer-events-none select-none hidden md:block"
        style={{ animation: 'floatInc2 12s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud2.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12">

        {/* Título */}
        <div
          ref={titleRef}
          className="text-center mb-12 md:mb-16"
          style={{
            opacity: titleVisible ? 1 : 0,
            animation: titleVisible
              ? 'revealTitle 0.75s cubic-bezier(.22,1,.36,1) both'
              : 'none',
          }}
        >
          <p style={{
            textTransform: 'uppercase', letterSpacing: '0.22em',
            fontSize: '0.68rem', fontWeight: 700,
            color: 'rgba(255,255,255,0.8)', marginBottom: '14px',
          }}>
            Detalhes
          </p>
          <h2 style={{
            fontFamily: '"Georgia", serif',
            fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
            fontWeight: 700, color: '#1a2744', lineHeight: 1.18,
          }}>
            O que está
            <span style={{ fontWeight: 400, fontStyle: 'italic', color: 'white' }}> incluído?</span>
          </h2>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {items.map((item, i) => {
            const isVisible = visibleCards.includes(i);
            const fp = floatParams[i];

            return (
              /* Camada 1 — reveal (entra de baixo, desaparece após completar) */
              <div
                key={i}
                ref={el => { cardRefs.current[i] = el; }}
                className={isVisible ? 'inc-card-reveal' : ''}
                style={{
                  opacity: isVisible ? 1 : 0,
                  animationDelay: isVisible ? `${i * 0.08}s` : '0s',
                }}
              >
                {/* Camada 2 — float contínuo e suave, só começa após o reveal */}
                <div
                  className={isVisible ? 'inc-card-float' : ''}
                  style={{
                    '--float-dur':   fp.duration,
                    '--float-delay': isVisible ? `${parseFloat(fp.delay) + i * 0.08 + 0.65}s` : '0s',
                    '--float-dist':  `-${fp.distance}`,
                  }}
                >
                  <div
                    className="inc-card"
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      padding: 'clamp(16px, 2.5vw, 24px)',
                      borderRadius: '18px',
                      background: 'rgba(255,255,255,0.48)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.75)',
                      boxShadow: '0 4px 18px rgba(26,39,68,0.07)',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(26,39,68,0.08)',
                      border: '1px solid rgba(26,39,68,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: 2,
                    }}>
                      <CheckCircle2 size={16} style={{ color: '#5aa8e0' }} />
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: '"Georgia", serif',
                        fontSize: 'clamp(0.88rem, 1.4vw, 1rem)',
                        fontWeight: 700, color: '#1a2744', marginBottom: 4,
                      }}>
                        {item.title}
                      </h3>
                      <p style={{
                        fontFamily: '"Georgia", serif',
                        fontSize: '0.82rem', color: '#3a5070', lineHeight: 1.6,
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
// ── Fim IncludedSection ─────────────────────────────────────────────────────

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: '01',
      icon: FileText,
      title: 'Crie o Memorial',
      description: 'Preencha as informações da pessoa homenageada com carinho: dados pessoais, uma frase especial, biografia, galeria de fotos e até um áudio de homenagem. Tudo de forma simples e guiada, para que você possa expressar todo o amor que sente.',
      image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80',
      highlight: 'Criar é gratuito!',
      cta: 'Começar agora',
      ctaLink: '/create-memorial',
    },
    {
      number: '02',
      icon: Eye,
      title: 'Veja o Resultado',
      description: 'Assim que você terminar, o memorial será exibido pronto na tela para você visualizar. Veja como ficou a homenagem completa, confira cada detalhe e sinta o resultado. O memorial fica salvo no seu perfil, pronto para quando você decidir publicar.',
      image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80',
      highlight: 'Prévia instantânea',
      cta: 'Ver exemplo',
      ctaLink: '/explore',
    },
    {
      number: '03',
      icon: CreditCard,
      title: 'Escolha um Plano',
      description: 'Se gostar do resultado, escolha o plano que melhor atende suas necessidades: o Plano Digital para publicar o memorial online, ou o Plano Placa QR Code para receber também uma placa física de aço inox com QR Code gravado para colocar no túmulo.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
      highlight: 'Pague só se quiser publicar',
      cta: 'Ver planos',
      ctaLink: '/#plans',
    },
  ];

  return (
    <div
      className="overflow-x-hidden"
      data-testid="how-it-works-page"
      style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)' }}
    >

      {/* ── HERO ── */}
      <section
        className="relative min-h-[88vh] flex items-center justify-center overflow-hidden px-4"
        style={{
          background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 30%, #7bbde8 60%, #5aa8e0 100%)',
          paddingTop: '96px',
        }}
      >
        <style>{`
          @keyframes floatHW1 {
            0%,100% { transform: translateY(0) translateX(0); }
            40%     { transform: translateY(-16px) translateX(8px); }
            70%     { transform: translateY(-8px) translateX(-5px); }
          }
          @keyframes floatHW2 {
            0%,100% { transform: translateY(0) translateX(0); }
            50%     { transform: translateY(-14px) translateX(-9px); }
          }
          @keyframes floatHW3 {
            0%,100% { transform: translateY(0) translateX(0); }
            45%     { transform: translateY(-10px) translateX(6px); }
          }
          @keyframes floatHW4 {
            0%,100% { transform: translateY(0) translateX(0); }
            55%     { transform: translateY(-12px) translateX(-7px); }
          }
          @keyframes fadeInHeroHW {
            from { opacity: 0; transform: translateY(28px); filter: blur(6px); }
            to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
          }
          @keyframes floatBadge1 {
            0%,100% { transform: translateY(0) rotate(-6deg); }
            50%     { transform: translateY(-10px) rotate(-4deg); }
          }
          @keyframes floatBadge2 {
            0%,100% { transform: translateY(0) rotate(4deg); }
            50%     { transform: translateY(-8px) rotate(6deg); }
          }
          @keyframes floatBadge3 {
            0%,100% { transform: translateY(0) rotate(-3deg); }
            55%     { transform: translateY(-12px) rotate(-5deg); }
          }
          .hw-hero-badge {
            padding: 8px 18px;
            border-radius: 999px;
            background: rgba(255,255,255,0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.85);
            box-shadow: 0 4px 18px rgba(26,39,68,0.10);
            font-family: "Georgia", serif;
            font-size: 0.78rem;
            font-weight: 700;
            color: #1a2744;
            white-space: nowrap;
            pointer-events: none;
            user-select: none;
          }
          .hw-hero-cta {
            border-radius: 999px;
            padding: 13px 34px;
            background: rgba(255,255,255,0.32);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1.5px solid rgba(255,255,255,0.7);
            color: #1a2744;
            font-family: "Georgia", serif;
            font-size: 0.92rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            cursor: pointer;
            box-shadow: 0 4px 18px rgba(26,39,68,0.1);
            transition: all 0.3s cubic-bezier(.22,1,.36,1);
          }
          .hw-hero-cta:hover {
            background: #1a2744;
            color: white;
            transform: translateY(-2px) scale(1.03);
            box-shadow: 0 8px 28px rgba(26,39,68,0.18);
          }
        `}</style>

        {/* Nuvem grande esquerda */}
        <div className="absolute top-[8%] left-[-60px] w-64 md:w-80 opacity-95 pointer-events-none select-none"
          style={{ animation: 'floatHW1 9s ease-in-out infinite' }}>
          <img src="/clouds/cloud1.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* Nuvem direita topo */}
        <div className="absolute top-[4%] right-[-40px] w-52 opacity-90 pointer-events-none select-none hidden md:block"
          style={{ animation: 'floatHW2 11s ease-in-out infinite' }}>
          <img src="/clouds/cloud2.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* Nuvem esquerda baixo */}
        <div className="absolute bottom-[10%] left-[2%] w-36 opacity-70 pointer-events-none select-none hidden md:block"
          style={{ animation: 'floatHW3 7s ease-in-out infinite' }}>
          <img src="/clouds/cloud3.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* Nuvem direita baixo */}
        <div className="absolute bottom-[8%] right-[4%] w-28 opacity-65 pointer-events-none select-none hidden lg:block"
          style={{ animation: 'floatHW4 10s ease-in-out infinite' }}>
          <img src="/clouds/cloud2.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* Badges flutuantes */}
        <div className="absolute top-[22%] left-[6%] hidden lg:block"
          style={{ animation: 'floatBadge1 6s ease-in-out infinite' }}>
          <div className="hw-hero-badge" style={{ transform: 'rotate(-6deg)' }}>
            ✦ Passo 01 — Criar
          </div>
        </div>
        <div className="absolute top-[18%] right-[7%] hidden lg:block"
          style={{ animation: 'floatBadge2 8s ease-in-out infinite' }}>
          <div className="hw-hero-badge" style={{ transform: 'rotate(4deg)' }}>
            ✦ Passo 02 — Visualizar
          </div>
        </div>
        <div className="absolute bottom-[22%] right-[9%] hidden lg:block"
          style={{ animation: 'floatBadge3 7s ease-in-out infinite' }}>
          <div className="hw-hero-badge" style={{ transform: 'rotate(-3deg)' }}>
            ✦ Passo 03 — Publicar
          </div>
        </div>

        {/* Conteúdo central */}
        <div
          className="relative z-10 text-center max-w-2xl mx-auto"
          style={{ animation: 'fadeInHeroHW 0.9s cubic-bezier(.22,1,.36,1) both' }}
        >
          <p style={{
            textTransform: 'uppercase', letterSpacing: '0.22em',
            fontSize: '0.68rem', fontWeight: 700,
            color: 'rgba(255,255,255,0.8)', marginBottom: '18px',
          }}>
            Como Funciona
          </p>
          <h1
            data-testid="page-title"
            style={{
              fontFamily: '"Georgia", serif',
              fontSize: 'clamp(2.4rem, 6vw, 4.8rem)',
              fontWeight: 700, color: '#1a2744',
              lineHeight: 1.12, marginBottom: '20px',
            }}
          >
            Simples assim.
            <br />
            <span style={{ color: 'white', fontWeight: 400, fontStyle: 'italic' }}>
              3 passos, eterno.
            </span>
          </h1>
          <p style={{
            color: 'rgba(26,39,68,0.72)',
            fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
            lineHeight: 1.72, maxWidth: '480px',
            margin: '0 auto 36px', fontFamily: '"Georgia", serif',
          }}>
            Criar um memorial eterno é simples, rápido e feito com muito respeito.
            Em apenas 3 passos você homenageia quem você ama.
          </p>
          <Link to="/create-memorial">
            <button className="hw-hero-cta" data-testid="hero-cta-how">
              Criar memorial gratuito
            </button>
          </Link>
        </div>

        {/* Número de página */}
        <div style={{
          position: 'absolute', bottom: 28, right: 32,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Georgia", serif',
          fontSize: '0.75rem', fontWeight: 700, color: '#1a2744',
        }}>
          1
        </div>
      </section>

      {/* ── STEPS ── */}
      <StepsSection steps={steps} />

      {/* ── CTA ── */}
      <section
        className="relative py-20 md:py-28 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #ddf0f7 0%, #c8e8f5 40%, #a8d8f0 100%)',
          marginTop: 0, borderTop: 'none',
        }}
      >
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p style={{
            textTransform: 'uppercase', letterSpacing: '0.22em',
            fontSize: '0.68rem', fontWeight: 700,
            color: '#2a3d5e', marginBottom: '16px',
          }}>
            Pronto para começar?
          </p>
          <h2 style={{
            fontFamily: '"Georgia", serif',
            fontSize: 'clamp(2rem, 5vw, 3.8rem)',
            fontWeight: 700, color: '#1a2744',
            lineHeight: 1.18, marginBottom: '20px',
          }}>
            Crie agora,
            <br />
            <span style={{ fontWeight: 400, fontStyle: 'italic', color: '#3a5070' }}>
              gratuitamente.
            </span>
          </h2>
          <Link to="/create-memorial">
            <button
              style={{
                borderRadius: '999px', padding: '13px 34px',
                background: '#1a2744', border: 'none',
                color: 'white', fontFamily: '"Georgia", serif',
                fontSize: '0.92rem', fontWeight: 700,
                letterSpacing: '0.04em', cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(26,39,68,0.2)',
                transition: 'all 0.3s ease',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              Começar Agora
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* ── O QUE ESTÁ INCLUÍDO ── */}
      <IncludedSection />

    </div>
  );
};

export default HowItWorks;
