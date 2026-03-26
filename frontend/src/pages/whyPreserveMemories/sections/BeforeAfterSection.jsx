import { useInView } from '../shared/styles.jsx';
import Clouds from '../shared/Clouds.jsx';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef, useCallback } from 'react';

const BEFORE_IMAGES = {
  main: '/card-image/before-after/before-main.jpg',
  s1:   '/card-image/before-after/before-s1.jpg',
  s2:   '/card-image/before-after/before-s2.jpg',
  s3:   '/card-image/before-after/before-s3.jpg',
  s4:   '/card-image/before-after/before-s4.jpg',
  s5:   '/card-image/before-after/before-s5.jpg',
};
const AFTER_IMAGES = {
  main: '/card-image/before-after/after-main.jpg',
  s1:   '/card-image/before-after/after-s1.jpg',
  s2:   '/card-image/before-after/after-s2.jpg',
  s3:   '/card-image/before-after/after-s3.jpg',
  s4:   '/card-image/before-after/after-s4.jpg',
  s5:   '/card-image/before-after/after-s5.jpg',
};

/* ─── Orbitais
   Desktop: posições bem abertas, tamanhos generosos
   Mobile:  sobrescritas via nth-child no CSS
────────────────────────────────────────────────── */
const ORBITALS = [
  { top: '4%',  left: '-52%', wD: 158, hD: 118, float: 'ba-f1', floatDur: '5.2s', floatDelay: '0s'   },
  { top: '38%', left: '-56%', wD: 144, hD: 144, float: 'ba-f2', floatDur: '6.1s', floatDelay: '0.7s' },
  { top: '70%', left: '-48%', wD: 150, hD: 110, float: 'ba-f3', floatDur: '5.7s', floatDelay: '1.3s' },
  { top: '8%',  right: '-50%', wD: 152, hD: 118, float: 'ba-f2', floatDur: '5.9s', floatDelay: '0.4s' },
  { top: '56%', right: '-48%', wD: 144, hD: 128, float: 'ba-f1', floatDur: '6.4s', floatDelay: '1s'   },
];
const ORB_KEYS = ['s1', 's2', 's3', 's4', 's5'];

const STYLES = `
  @keyframes ba-f1 {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    30%     { transform: translateY(-11px) rotate(1.4deg); }
    65%     { transform: translateY(7px) rotate(-1deg); }
  }
  @keyframes ba-f2 {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    40%     { transform: translateY(10px) rotate(-1.6deg); }
    72%     { transform: translateY(-8px) rotate(1.2deg); }
  }
  @keyframes ba-f3 {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    25%     { transform: translateY(-9px) rotate(0.9deg); }
    78%     { transform: translateY(12px) rotate(-1.4deg); }
  }

  .ba-scene {
    position: relative;
    width: 100%;
    max-width: 360px;
    margin: 0 auto;
    overflow: visible;
  }

  .ba-stage {
    position: relative;
    width: 100%;
    aspect-ratio: 3/4;
    cursor: grab;
    user-select: none;
    overflow: visible;
  }
  .ba-stage:active { cursor: grabbing; }

  .ba-card {
    position: absolute; inset: 0;
    border-radius: 26px; overflow: hidden;
    will-change: transform, opacity, filter, z-index;
    transition:
      transform  0.9s cubic-bezier(.22,1,.36,1),
      opacity    0.9s cubic-bezier(.22,1,.36,1),
      filter     0.9s cubic-bezier(.22,1,.36,1),
      box-shadow 0.9s cubic-bezier(.22,1,.36,1);
  }

  /* BEFORE — apenas escuro, sem azul */
  .ba-card-before.is-front {
    transform: scale(1) translateY(0) translateZ(0);
    opacity: 1; z-index: 4;
    filter: brightness(0.72) saturate(0.8);
    box-shadow: 0 32px 80px rgba(26,39,68,0.35), 0 0 0 1.5px rgba(255,255,255,0.18);
  }
  .ba-card-before.is-back {
    transform: scale(0.82) translateY(32px) translateZ(0);
    opacity: 0.22; z-index: 1;
    filter: brightness(0.45) saturate(0.5);
    box-shadow: none;
  }

  .ba-card-after.is-front {
    transform: scale(1) translateY(0) translateZ(0);
    opacity: 1; z-index: 4;
    filter: brightness(1.06) saturate(1.18);
    box-shadow: 0 32px 80px rgba(255,180,60,0.3), 0 0 0 1.5px rgba(255,220,120,0.4);
  }
  .ba-card-after.is-back {
    transform: scale(0.82) translateY(32px) translateZ(0);
    opacity: 0.22; z-index: 1;
    filter: brightness(0.8) saturate(0.65);
    box-shadow: none;
  }

  /* Overlay vazio — a cobertura fica toda no ::after */
  .ba-ov-before,
  .ba-ov-after {
    position: absolute; inset: 0;
  }

  /* Overlay forte para legibilidade — cobre 65% do card vindo de baixo */
  .ba-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 26px;
    background: linear-gradient(
      to top,
      rgba(0,0,0,0.93) 0%,
      rgba(0,0,0,0.78) 28%,
      rgba(0,0,0,0.42) 50%,
      rgba(0,0,0,0.10) 68%,
      transparent 82%
    );
    z-index: 2;
  }
  .ba-card-after::after {
    background: linear-gradient(
      to top,
      rgba(50,14,0,0.96) 0%,
      rgba(80,26,0,0.80) 28%,
      rgba(80,26,0,0.40) 50%,
      rgba(80,26,0,0.08) 68%,
      transparent 82%
    );
  }

  /* Conteúdo sobre o overlay */
  .ba-content {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: clamp(18px,3vw,28px);
    padding-top: 0;
    z-index: 3;
  }

  /* Badge — legível sobre qualquer foto */
  .ba-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 13px; border-radius: 999px; margin-bottom: 10px;
    font-family: "Georgia", serif; font-size: 0.6rem;
    font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  }
  .ba-badge-b {
    background: rgba(0,0,0,0.52);
    border: 1px solid rgba(255,255,255,0.35);
    color: rgba(255,255,255,0.88);
  }
  /* After badge: fundo sólido escuro + texto amarelo brilhante */
  .ba-badge-a {
    background: rgba(0,0,0,0.62);
    border: 1px solid rgba(255,198,75,0.7);
    color: #ffe084;
    text-shadow: 0 0 8px rgba(255,200,60,0.5);
  }

  .ba-title {
    font-family: "Georgia", serif; font-weight: 700; color: #fff; margin: 0 0 10px;
    font-size: clamp(1rem,2.8vw,1.3rem); line-height: 1.2;
    text-shadow: 0 2px 10px rgba(0,0,0,0.9);
  }
  .ba-row {
    display: flex; align-items: flex-start; gap: 7px;
    margin-bottom: 5px;
    font-family: "Georgia", serif;
    font-size: clamp(0.68rem,1.6vw,0.78rem);
    line-height: 1.45;
  }
  .ba-row-b { color: rgba(255,255,255,0.6); text-decoration: line-through; text-decoration-color: rgba(255,255,255,0.25); }
  .ba-row-a { color: rgba(255,255,255,0.94); }
  .ba-pip-b { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.35); flex-shrink: 0; margin-top: 5px; }
  .ba-pip-a { width: 4px; height: 4px; border-radius: 50%; background: #ffd580; flex-shrink: 0; margin-top: 5px; }

  /* ── Orbitais ── */
  .ba-orb-wrap {
    position: absolute;
    z-index: 5;
    opacity: 0;
    transition: opacity 0.6s ease;
  }
  .ba-orb-wrap.visible { opacity: 1; }
  .ba-orb-wrap.recede  { opacity: 0.18 !important; transition: opacity 0.7s ease 0s; }

  .ba-orb-inner {
    width: 100%; height: 100%;
    border-radius: 14px; overflow: hidden;
    border: 2.5px solid rgba(255,255,255,0.7);
    transition: filter 0.7s ease, box-shadow 0.7s ease;
  }
  .ba-orb-inner img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* Orbital before — só escuro, sem tint azul */
  .ba-orb-inner.orb-before {
    filter: brightness(0.80) saturate(0.75);
    box-shadow: 0 8px 24px rgba(0,0,0,0.32);
  }
  .ba-orb-inner.orb-after {
    filter: brightness(1.05) saturate(1.1);
    box-shadow: 0 8px 24px rgba(255,155,38,0.28);
  }

  /* ── Toggle pill ── */
  .ba-toggle {
    display: flex; align-items: center;
    background: rgba(255,255,255,0.22); backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.45);
    border-radius: 999px; padding: 4px;
    margin: 0 auto 44px; width: fit-content;
  }
  .ba-tbtn {
    padding: 8px 18px; border-radius: 999px; border: none; cursor: pointer;
    font-family: "Georgia", serif; font-size: 0.76rem; font-weight: 700;
    letter-spacing: 0.04em; transition: all 0.35s cubic-bezier(.22,1,.36,1);
  }
  .ba-tbtn.on-b { background: rgba(65,85,115,0.78); color: white; box-shadow: 0 2px 10px rgba(26,39,68,0.22); }
  .ba-tbtn.on-a { background: linear-gradient(135deg,#e8a020,#f5c842); color: #3a1a00; box-shadow: 0 2px 10px rgba(215,135,8,0.35); }
  .ba-tbtn.off  { background: transparent; color: rgba(255,255,255,0.58); }
  .ba-tbtn.off:hover { color: rgba(255,255,255,0.9); }

  /* ── Dots ── */
  .ba-dots { display: flex; justify-content: center; gap: 8px; margin-top: 22px; }
  .ba-dot  { width: 7px; height: 7px; border-radius: 50%; border: none; padding: 0; cursor: pointer; transition: background 0.3s, transform 0.3s; }
  .ba-db   { background: rgba(255,255,255,0.32); }
  .ba-db.on { background: rgba(255,255,255,0.88); transform: scale(1.35); }
  .ba-da   { background: rgba(255,196,72,0.32); }
  .ba-da.on { background: #ffd580; transform: scale(1.35); }

  @keyframes ba-pulse {
    0%,100% { box-shadow: 0 4px 24px rgba(26,39,68,0.22); }
    50%      { box-shadow: 0 4px 36px rgba(26,39,68,0.42), 0 0 0 6px rgba(26,39,68,0.08); }
  }
  .ba-cta { animation: ba-pulse 2.8s ease-in-out infinite; }

  /* ══ MOBILE ══ */
  @media (max-width: 600px) {
    .ba-scene { max-width: 210px; }

    .ba-orb-inner {
      border-radius: 9px;
      border-width: 2px;
    }

    .ba-orb-wrap:nth-child(1) { width: 74px !important; height: 58px !important; left: -40% !important; }
    .ba-orb-wrap:nth-child(2) { width: 70px !important; height: 70px !important; left: -44% !important; }
    .ba-orb-wrap:nth-child(3) { width: 72px !important; height: 54px !important; left: -38% !important; }
    .ba-orb-wrap:nth-child(4) { width: 72px !important; height: 58px !important; right: -40% !important; left: auto !important; }
    .ba-orb-wrap:nth-child(5) { width: 70px !important; height: 64px !important; right: -38% !important; left: auto !important; }

    .ba-title   { font-size: 0.95rem !important; }
    .ba-row     { font-size: 0.65rem !important; }
    .ba-content { padding: 14px !important; }
  }
`;

/* ─── Componente ─────────────────────────────────────────── */
const BeforeAfterSection = () => {
  const { t } = useTranslation();
  const [ref, visible] = useInView(0.08);
  const beforeItems = t('whyPreservePage.beforeAfter.beforeItems', { returnObjects: true });
  const afterItems  = t('whyPreservePage.beforeAfter.afterItems',  { returnObjects: true });

  const [active, setActive]         = useState('before');
  const [orbVisible, setOrbVisible] = useState([false,false,false,false,false]);
  const autoRef   = useRef(null);
  const orbTimers = useRef([]);
  const dragX     = useRef(null);
  const isManual  = useRef(false);

  const triggerOrbSurge = useCallback(() => {
    orbTimers.current.forEach(clearTimeout);
    setOrbVisible([false,false,false,false,false]);
    orbTimers.current = ORBITALS.map((_, i) =>
      setTimeout(() => {
        setOrbVisible(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 180 + i * 220)
    );
  }, []);

  const scheduleAuto = useCallback(() => {
    clearTimeout(autoRef.current);
    autoRef.current = setTimeout(() => {
      setActive(p => p === 'before' ? 'after' : 'before');
    }, 10000);
  }, []);

  useEffect(() => {
    if (visible) {
      triggerOrbSurge();
      if (!isManual.current) scheduleAuto();
      isManual.current = false;
    }
    return () => clearTimeout(autoRef.current);
  }, [active, visible, triggerOrbSurge, scheduleAuto]);

  const onDragStart = (e) => { dragX.current = e.clientX ?? e.touches?.[0]?.clientX; };
  const onDragEnd   = (e) => {
    if (dragX.current === null) return;
    const dx = (e.clientX ?? e.changedTouches?.[0]?.clientX) - dragX.current;
    dragX.current = null;
    if (Math.abs(dx) < 40) return;
    isManual.current = true;
    clearTimeout(autoRef.current);
    setActive(dx < 0 ? 'after' : 'before');
    autoRef.current = setTimeout(() => {
      isManual.current = false;
      setActive(p => p === 'before' ? 'after' : 'before');
    }, 8000);
  };

  const switchTo = (state) => {
    isManual.current = true;
    clearTimeout(autoRef.current);
    setActive(state);
    autoRef.current = setTimeout(() => {
      isManual.current = false;
      setActive(p => p === 'before' ? 'after' : 'before');
    }, 8000);
  };

  const isBefore = active === 'before';
  const orbImgs  = isBefore ? BEFORE_IMAGES : AFTER_IMAGES;

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #b8d8e8 35%, #8ec8e0 65%, #6ab4d8 100%)' }}
    >
      <style>{STYLES}</style>
      <Clouds />

      <div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.75s cubic-bezier(.22,1,.36,1) both' : 'none' }}
      >
        {/* Cabeçalho */}
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">{t('whyPreservePage.beforeAfter.eyebrow')}</span>
          <h2 className="wpm-h2" style={{ whiteSpace: 'pre-line' }}>{t('whyPreservePage.beforeAfter.title')}</h2>
          <p className="wpm-body" style={{ maxWidth: 440, margin: '0 auto' }}>{t('whyPreservePage.beforeAfter.description')}</p>
        </div>

        {/* Toggle pill */}
        <div className="ba-toggle">
          <button className={`ba-tbtn ${isBefore ? 'on-b' : 'off'}`} onClick={() => switchTo('before')}>
            ✕ {t('whyPreservePage.beforeAfter.beforeLabel')}
          </button>
          <button className={`ba-tbtn ${!isBefore ? 'on-a' : 'off'}`} onClick={() => switchTo('after')}>
            ✓ {t('whyPreservePage.beforeAfter.afterLabel')}
          </button>
        </div>

        {/* ── Scene ── */}
        <div className="ba-scene">

          {/* Orbitais */}
          {ORBITALS.map((orb, i) => {
            const isVisible = orbVisible[i];
            return (
              <div
                key={i}
                className={`ba-orb-wrap ${isVisible ? 'visible' : ''}`}
                style={{
                  top:    orb.top,
                  left:   orb.left  ?? undefined,
                  right:  orb.right ?? undefined,
                  width:  orb.wD,
                  height: orb.hD,
                  animation: `${orb.float} ${orb.floatDur} ease-in-out ${orb.floatDelay} infinite`,
                }}
              >
                <div
                  className={`ba-orb-inner ${isBefore ? 'orb-before' : 'orb-after'}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <img src={orbImgs[ORB_KEYS[i]]} alt={`orbital-${i + 1}`} />
                </div>
              </div>
            );
          })}

          {/* Card central */}
          <div
            className="ba-stage"
            onMouseDown={onDragStart} onMouseUp={onDragEnd}
            onTouchStart={onDragStart} onTouchEnd={onDragEnd}
          >
            {/* BEFORE */}
            <div className={`ba-card ba-card-before ${isBefore ? 'is-front' : 'is-back'}`}>
              <img
                src={BEFORE_IMAGES.main} alt="before"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div className="ba-ov-before" />
              <div className="ba-content">
                <div className="ba-badge ba-badge-b">✕ {t('whyPreservePage.beforeAfter.beforeLabel')}</div>
                <p className="ba-title">{t('whyPreservePage.beforeAfter.beforeTitle')}</p>
                {Array.isArray(beforeItems) && beforeItems.slice(0, 3).map((text, i) => (
                  <div key={i} className="ba-row ba-row-b"><div className="ba-pip-b" />{text}</div>
                ))}
              </div>
            </div>

            {/* AFTER */}
            <div className={`ba-card ba-card-after ${!isBefore ? 'is-front' : 'is-back'}`}>
              <img
                src={AFTER_IMAGES.main} alt="after"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div className="ba-ov-after" />
              <div className="ba-content">
                <div className="ba-badge ba-badge-a">✓ {t('whyPreservePage.beforeAfter.afterLabel')}</div>
                <p className="ba-title">{t('whyPreservePage.beforeAfter.afterTitle')}</p>
                {Array.isArray(afterItems) && afterItems.slice(0, 3).map((text, i) => (
                  <div key={i} className="ba-row ba-row-a"><div className="ba-pip-a" />{text}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="ba-dots">
            <button className={`ba-dot ba-db ${isBefore ? 'on' : ''}`}  onClick={() => switchTo('before')} />
            <button className={`ba-dot ba-da ${!isBefore ? 'on' : ''}`} onClick={() => switchTo('after')}  />
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(40px,6vw,64px)' }}>
          <Link to="/create-memorial" className="wpm-btn-primary ba-cta">
            {t('whyPreservePage.beforeAfter.cta')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;