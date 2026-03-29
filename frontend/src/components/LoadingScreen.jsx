import { useEffect, useState, useRef } from 'react';
import skyBg from '../assets/sky-bg.jpg'

const LoadingScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('idle');
  const [flyKeyframe, setFlyKeyframe] = useState('');
  const [flyStyle, setFlyStyle]       = useState({});
  const [overlayOut, setOverlayOut]   = useState(false);
  const [bgVisible, setBgVisible]     = useState(false); // novo

  const logoRef = useRef(null);

  useEffect(() => {
    // Fase 1 — logo aparece, fundo ainda branco
    const t1 = setTimeout(() => {
      document.getElementById('root').style.visibility = 'visible';
      setPhase('float');
    }, 100);
    // Fase 1.5 — fundo transiciona para sky-bg
    const t2 = setTimeout(() => setBgVisible(true), 700);

    // Fase 2 — medir posições e disparar o voo
    const t3 = setTimeout(() => {
      const logoEl   = logoRef.current;
      const targetEl =
        document.querySelector('[data-header-logo]') ||
        document.querySelector('header img')         ||
        document.querySelector('header .logo')       ||
        document.querySelector('nav img');

      if (logoEl && targetEl) {
        const from = logoEl.getBoundingClientRect();
        const to   = targetEl.getBoundingClientRect();

        const fromCX = from.left + from.width  / 2;
        const fromCY = from.top  + from.height / 2;
        const toCX   = to.left   + to.width    / 2;
        const toCY   = to.top    + to.height   / 2;

        const kfCSS = `
          @keyframes ls-fly-anim {
            0% {
              left:      ${fromCX}px;
              top:       ${fromCY}px;
              transform: translate(-50%, -50%) scale(1);
              opacity:   1;
            }
            100% {
              left:      ${toCX}px;
              top:       ${toCY}px;
              transform: translate(-50%, -50%) scale(1);
              opacity:   1;
            }
          }
        `;

        setFlyKeyframe(kfCSS);
        setFlyStyle({
          left:      `${fromCX}px`,
          top:       `${fromCY}px`,
          transform: `translate(-50%, -50%) scale(1)`,
          animation: `ls-fly-anim 1s cubic-bezier(0.76, 0, 0.24, 1) forwards`,
        });
      }

      // Overlay some junto com o início do voo
      setOverlayOut(true);
      setPhase('fly');
    }, 2400); // um pouco depois do bg aparecer

    // Fase 3 — voo acabou, conteúdo aparece
    const t4 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 3500);

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <>
      <style>{baseCSS}{flyKeyframe}</style>

      {/* Camada do background — sky-bg aparece com fade */}
      <div className={`ls-bg${bgVisible ? ' ls-bg--in' : ''}`}
           style={{ backgroundImage: `url(${skyBg})` }} />

      {/* Overlay branco que some revelando o bg */}
      <div className={`ls-overlay${overlayOut ? ' ls-overlay--out' : ''}`} />

      {/* Logo centralizada */}
      {phase !== 'fly' && (
        <div
          ref={logoRef}
          className={`ls-center-logo${phase === 'float' ? ' ls-center-logo--in' : ''}`}
        >
          <img
            src="/logo-transparent.svg"
            alt="Remember"
            className="ls-logo-img"
            draggable={false}
          />
          <span className="ls-tagline">histórias que vivem</span>
        </div>
      )}

      {/* Logo voando */}
      {phase === 'fly' && (
        <div className="ls-flying-logo ls-flying-logo--active" style={flyStyle}>
          <img
            src="/logo-transparent.svg"
            alt=""
            className="ls-logo-img"
            draggable={false}
          />
        </div>
      )}
    </>
  );
};

const baseCSS = `
  /* ---------- bg com sky-bg ---------- */
  .ls-bg {
    position: fixed;
    inset: 0;
    z-index: 9989;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 1.5s ease;
  }
  .ls-bg--in {
    opacity: 1;
  }

  /* ---------- overlay branco ---------- */
  .ls-overlay {
    position: fixed;
    inset: 0;
    z-index: 9990;
    background: #ffffff;
    opacity: 1;
    transition: opacity 0.8s ease;
    pointer-events: all;
  }
  .ls-overlay--out {
    opacity: 0;
    pointer-events: none;
  }

  /* ---------- logo centralizada ---------- */
  .ls-center-logo {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 9999;
    transform: translate(-50%, calc(-50% + 20px));
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    opacity: 0;
    pointer-events: none;
  }
  .ls-center-logo--in {
    animation:
      ls-appear  0.7s  cubic-bezier(.22,1,.36,1) forwards,
      ls-breathe 3.5s  ease-in-out 0.7s infinite;
  }

  /* ---------- logo voando ---------- */
  .ls-flying-logo {
    position: fixed;
    z-index: 9999;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  /* ---------- imagem da logo ---------- */
  .ls-logo-img {
    height: 60px;
    width: auto;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
  }
  @media (max-width: 768px) {
    .ls-logo-img { height: 60px; }
  }
  .ls-flying-logo--active .ls-logo-img {
    filter: brightness(0) invert(1);
    transition: filter 1s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
  }

  /* ---------- tagline ---------- */
  .ls-tagline {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 0.58rem;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
    font-weight: 700;
    white-space: nowrap;
  }

  /* ---------- keyframes ---------- */
  @keyframes ls-appear {
    from {
      opacity: 0;
      transform: translate(-50%, calc(-50% + 20px));
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }

  @keyframes ls-breathe {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50%       { transform: translate(-50%, calc(-50% - 7px)) scale(1.045); }
  }

  /* ---------- stagger reveal ---------- */
  .ls-reveal {
    opacity: 0 !important;
    transform: translateY(22px) !important;
    transition:
      opacity   0.6s cubic-bezier(.22,1,.36,1),
      transform 0.6s cubic-bezier(.22,1,.36,1) !important;
  }
  .ls-reveal--in {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
  .ls-reveal-main {
    opacity: 0;
    transition: opacity 0.7s cubic-bezier(.22,1,.36,1);
  }
  .ls-reveal-main--in {
    opacity: 1;
  }
`;

export default LoadingScreen;

export const useRevealContent = () => {
  const triggerReveal = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Header e Footer
        const els = document.querySelectorAll('.ls-reveal');
        els.forEach((el, i) => {
          setTimeout(() => el.classList.add('ls-reveal--in'), i * 150);
        });
        // Evento global para os componentes internos
        window.dispatchEvent(new CustomEvent('ls:revealed'));
      });
    });
  };
  return { triggerReveal };
};