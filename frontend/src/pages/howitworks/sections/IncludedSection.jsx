import { useState, useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

const IncludedSection = () => {
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

export default IncludedSection;