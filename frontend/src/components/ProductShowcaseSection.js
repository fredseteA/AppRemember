import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// ── Floating cloud helper ────────────────────────────────────────────────────
function Cloud({ src = "/clouds/cloud1.png", className = "", style = {} }) {
  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      style={style}
    >
      <img src={src} alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
    </div>
  );
}

// ── Image Placeholder ────────────────────────────────────────────────────────
function PhotoPlaceholder({ label, icon, size = "normal", className = "", style = {} }) {
  const isLarge = size === "large";

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        borderRadius: isLarge ? '28px' : '20px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(200,232,245,0.6) 0%, rgba(168,216,240,0.5) 40%, rgba(123,189,232,0.4) 100%)',
        border: '1.5px dashed rgba(90,168,224,0.45)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isLarge ? '16px' : '10px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: isLarge
          ? '0 24px 72px rgba(26,39,68,0.12), inset 0 1px 0 rgba(255,255,255,0.7)'
          : '0 8px 28px rgba(26,39,68,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        ...style,
      }}
    >
      {/* Noise texture overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
        pointerEvents: 'none',
      }} />

      {/* Soft inner glow ring */}
      <div style={{
        position: 'absolute', inset: '12px',
        borderRadius: isLarge ? '20px' : '14px',
        border: '1px solid rgba(255,255,255,0.55)',
        pointerEvents: 'none',
      }} />

      {/* Camera icon */}
      <div style={{
        width: isLarge ? 64 : 44,
        height: isLarge ? 64 : 44,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 4px 16px rgba(26,39,68,0.1)',
        flexShrink: 0,
      }}>
        {icon || (
          <svg width={isLarge ? 28 : 20} height={isLarge ? 28 : 20} viewBox="0 0 24 24" fill="none" stroke="#3a7fb5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        )}
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center', padding: '0 16px' }}>
        <p style={{
          fontFamily: '"Georgia", serif',
          fontSize: isLarge ? '0.92rem' : '0.78rem',
          fontWeight: 600,
          color: '#2a4d70',
          letterSpacing: '0.03em',
          lineHeight: 1.4,
          margin: 0,
        }}>
          {label}
        </p>
        <p style={{
          fontSize: isLarge ? '0.72rem' : '0.65rem',
          color: 'rgba(58,80,112,0.65)',
          marginTop: '4px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          {isLarge ? 'Foto do produto real em breve' : 'Inserir foto aqui'}
        </p>
      </div>
    </div>
  );
}

// ── ProductShowcaseSection ────────────────────────────────────────────────────
export default function ProductShowcaseSection() {
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
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ),
      title: 'Produzido com cuidado e respeito',
      desc: 'Cada peça é feita com atenção ao detalhe e ao que ela representa.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      title: 'Material de alta qualidade',
      desc: 'Aço inox resistente ao tempo, preservando a memória por décadas.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      title: 'Uma lembrança eterna para a família',
      desc: 'Um ponto de encontro físico para homenagear e lembrar quem partiu.',
    },
  ];

  const secondaryCards = [
    {
      label: 'Detalhe do acabamento',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a7fb5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
    },
    {
      label: 'Como ele chega embalado',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a7fb5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
    },
    {
      label: 'Exemplo de homenagem pronta',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a7fb5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      ),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        padding: 'clamp(64px, 10vw, 112px) 0',
        background: 'linear-gradient(180deg, #eef8fb 0%, #ddf0f7 20%, #c8e8f5 50%, #ddf0f7 80%, #eef8fb 100%)',
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

        /* Reveal animations */
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

        /* Shimmer on placeholder */
        @keyframes placeholderShimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .prod-placeholder-shimmer::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.22) 45%,
            rgba(255,255,255,0.38) 50%,
            rgba(255,255,255,0.22) 55%,
            transparent 100%
          );
          background-size: 600px 100%;
          animation: placeholderShimmer 3s ease-in-out infinite;
          border-radius: inherit;
          pointer-events: none;
        }

        /* Floating pulse on main product */
        @keyframes gentlePulse {
          0%,100% { box-shadow: 0 24px 72px rgba(26,39,68,0.12), 0 0 0 0 rgba(90,168,224,0); }
          50%     { box-shadow: 0 32px 80px rgba(26,39,68,0.16), 0 0 0 12px rgba(90,168,224,0.06); }
        }

        /* Card hover */
        .prod-secondary-card {
          transition: transform 0.38s cubic-bezier(.22,1,.36,1), box-shadow 0.38s ease;
          cursor: pointer;
        }
        .prod-secondary-card:hover {
          transform: translateY(-6px) scale(1.025);
          box-shadow: 0 20px 52px rgba(26,39,68,0.14), inset 0 1px 0 rgba(255,255,255,0.9) !important;
        }

        /* Benefit card hover */
        .prod-benefit-card {
          transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease, background 0.35s ease;
        }
        .prod-benefit-card:hover {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.72) !important;
          box-shadow: 0 14px 40px rgba(26,39,68,0.11), inset 0 1px 0 rgba(255,255,255,0.95) !important;
        }

        /* CTA button */
        .prod-cta-btn {
          transition: transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, background 0.3s ease;
        }
        .prod-cta-btn:hover {
          transform: translateY(-2px) scale(1.04);
          background: #1a2744 !important;
          color: white !important;
          box-shadow: 0 10px 32px rgba(26,39,68,0.22) !important;
        }

        /* Vertical decorative line */
        @keyframes lineGrow {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }

        /* Mobile */
        @media (max-width: 767px) {
          .prod-cloud-left  { width: 120px !important; left: -15px !important; }
          .prod-cloud-right { display: none !important; }
          .prod-secondary-grid { grid-template-columns: 1fr !important; }
          .prod-benefits-row   { flex-direction: column !important; gap: 12px !important; }
        }
      `}</style>

      {/* Clouds */}
      <Cloud
        src="/clouds/cloud1.png"
        className="prod-cloud-left"
        style={{
          top: '-20px', left: '-55px',
          width: 'clamp(130px, 15vw, 220px)',
          opacity: 0.85,
          animation: 'floatProd1 10s ease-in-out infinite',
        }}
      />
      <Cloud
        src="/clouds/cloud2.png"
        className="prod-cloud-right hidden md:block"
        style={{
          top: '8%', right: '-45px',
          width: 'clamp(130px, 12vw, 200px)',
          opacity: 0.75,
          animation: 'floatProd2 13s ease-in-out infinite',
        }}
      />
      <Cloud
        src="/clouds/cloud3.png"
        className="hidden lg:block"
        style={{
          bottom: '12%', left: '5%',
          width: 'clamp(80px, 7vw, 120px)',
          opacity: 0.55,
          animation: 'floatProd3 8s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-12">

        {/* ── HEADER ── */}
        <div
          className="text-center mb-14 md:mb-20"
          style={{
            opacity: visible ? 1 : 0,
            animation: visible ? 'prodFadeIn 0.75s cubic-bezier(.22,1,.36,1) both' : 'none',
          }}
        >
          <p style={{
            textTransform: 'uppercase', letterSpacing: '0.24em',
            fontSize: '0.66rem', fontWeight: 700,
            color: '#3a7fb5', marginBottom: '14px',
          }}>
            Produto físico
          </p>
          <h2 style={{
            fontFamily: '"Georgia", serif',
            fontSize: 'clamp(1.5rem, 5.5vw, 2.9rem)',
            fontWeight: 700, color: '#1a2744', lineHeight: 1.2, marginBottom: '16px',
          }}>
            Veja como sua homenagem
            <br className="hidden md:block" /> ganha vida
          </h2>
          <p style={{
            color: '#3a5070',
            fontSize: 'clamp(0.88rem, 3.5vw, 1.05rem)',
            lineHeight: 1.72, maxWidth: '520px',
            margin: '0 auto',
            fontFamily: '"Georgia", serif',
          }}>
            Após contar a história do seu ente querido, criamos uma homenagem
            física única — feita com cuidado para eternizar memórias.
          </p>
        </div>

        {/* ── MAIN PRODUCT SHOWCASE ── */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            animation: visible ? 'prodScaleIn 0.9s cubic-bezier(.22,1,.36,1) 0.15s both' : 'none',
            marginBottom: 'clamp(32px, 5vw, 56px)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* Outer glow ring */}
          <div style={{
            position: 'relative',
            borderRadius: '32px',
            padding: '10px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(168,216,240,0.5) 100%)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.9), 0 0 48px rgba(90,168,224,0.2)',
            width: '100%',
            maxWidth: '680px',
          }}>
            <PhotoPlaceholder
              label="Foto do produto final"
              size="large"
              className="prod-placeholder-shimmer"
              style={{
                width: '100%',
                height: 'clamp(260px, 38vw, 420px)',
                animation: visible ? 'gentlePulse 4s ease-in-out 1s infinite' : 'none',
              }}
            />

            {/* Floating badge */}
            <div style={{
              position: 'absolute',
              bottom: '24px', right: '24px',
              background: 'rgba(26,39,68,0.88)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              borderRadius: '14px',
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 8px 24px rgba(26,39,68,0.25)',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#5aa8e0',
                boxShadow: '0 0 8px rgba(90,168,224,0.8)',
                animation: 'gentlePulse 2s ease-in-out infinite',
              }} />
              <span style={{
                fontFamily: '"Georgia", serif',
                fontSize: '0.72rem', fontWeight: 600, color: 'white',
                letterSpacing: '0.05em',
              }}>
                Aço inox gravado
              </span>
            </div>

            {/* QR hint badge */}
            <div style={{
              position: 'absolute',
              top: '24px', left: '24px',
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              borderRadius: '12px',
              padding: '8px 14px',
              display: 'flex', alignItems: 'center', gap: '7px',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 4px 16px rgba(26,39,68,0.09)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a2744" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 14h3M17 17v3M20 17h-3v3"/>
              </svg>
              <span style={{
                fontFamily: '"Georgia", serif',
                fontSize: '0.7rem', fontWeight: 700, color: '#1a2744', letterSpacing: '0.06em',
              }}>
                QR Code
              </span>
            </div>
          </div>
        </div>

        {/* ── 3 SECONDARY CARDS ── */}
        <div
          className="prod-secondary-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(12px, 2vw, 22px)',
            marginBottom: 'clamp(40px, 7vw, 72px)',
          }}
        >
          {secondaryCards.map((card, i) => (
            <div
              key={card.label}
              className="prod-secondary-card prod-placeholder-shimmer"
              style={{
                opacity: visible ? 1 : 0,
                animation: visible
                  ? `prodFadeUp 0.7s cubic-bezier(.22,1,.36,1) ${0.35 + i * 0.12}s both`
                  : 'none',
              }}
            >
              <PhotoPlaceholder
                label={card.label}
                icon={card.icon}
                style={{
                  width: '100%',
                  height: 'clamp(150px, 22vw, 210px)',
                  boxShadow: '0 8px 28px rgba(26,39,68,0.09), inset 0 1px 0 rgba(255,255,255,0.7)',
                }}
              />
            </div>
          ))}
        </div>

        {/* ── BENEFITS ROW ── */}
        <div
          className="prod-benefits-row"
          style={{
            display: 'flex',
            gap: 'clamp(10px, 2vw, 20px)',
            justifyContent: 'center',
            marginBottom: 'clamp(40px, 6vw, 64px)',
            flexWrap: 'wrap',
            opacity: visible ? 1 : 0,
            animation: visible ? 'prodFadeIn 0.7s cubic-bezier(.22,1,.36,1) 0.65s both' : 'none',
          }}
        >
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className="prod-benefit-card"
              style={{
                flex: '1 1 220px',
                maxWidth: '320px',
                borderRadius: '20px',
                padding: 'clamp(16px, 2.5vw, 24px) clamp(18px, 2.5vw, 28px)',
                background: 'rgba(255,255,255,0.52)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 6px 22px rgba(26,39,68,0.07), inset 0 1px 0 rgba(255,255,255,0.85)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}
            >
              {/* Icon circle */}
              <div style={{
                width: 42, height: 42,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(90,168,224,0.18) 0%, rgba(123,189,232,0.12) 100%)',
                border: '1px solid rgba(90,168,224,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                color: '#3a7fb5',
              }}>
                {b.icon}
              </div>
              <div>
                <p style={{
                  fontFamily: '"Georgia", serif',
                  fontSize: 'clamp(0.82rem, 2.5vw, 0.9rem)',
                  fontWeight: 700, color: '#1a2744', marginBottom: '4px', lineHeight: 1.3,
                }}>
                  {b.title}
                </p>
                <p style={{
                  fontSize: 'clamp(0.75rem, 2vw, 0.8rem)',
                  color: '#3a5070', lineHeight: 1.65,
                  fontFamily: '"Georgia", serif',
                }}>
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div
          style={{
            textAlign: 'center',
            opacity: visible ? 1 : 0,
            animation: visible ? 'prodFadeIn 0.7s cubic-bezier(.22,1,.36,1) 0.8s both' : 'none',
          }}
        >
          {/* Subtle decorative separator */}
          <div style={{
            width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, rgba(90,168,224,0.5), transparent)',
            margin: '0 auto 24px',
          }} />

          <Link to="/create-memorial">
            <button
              className="prod-cta-btn"
              style={{
                borderRadius: '999px',
                padding: 'clamp(12px, 2vw, 15px) clamp(28px, 5vw, 44px)',
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(26,39,68,0.22)',
                color: '#1a2744',
                fontFamily: '"Georgia", serif',
                fontSize: 'clamp(0.82rem, 3vw, 0.95rem)',
                fontWeight: 700,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                boxShadow: '0 6px 22px rgba(26,39,68,0.1)',
                display: 'inline-flex', alignItems: 'center', gap: '10px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
              Começar minha homenagem
            </button>
          </Link>

          <p style={{
            marginTop: '14px',
            fontSize: '0.72rem', color: 'rgba(58,80,112,0.65)',
            fontFamily: '"Georgia", serif',
            letterSpacing: '0.05em',
          }}>
            ✨ Criar é gratuito · Você só paga ao publicar
          </p>
        </div>
      </div>
    </section>
  );
}