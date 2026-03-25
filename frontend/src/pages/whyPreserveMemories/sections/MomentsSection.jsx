import { useInView } from '../shared/styles.jsx';
import Clouds from '../shared/Clouds.jsx';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import PhotoCard from '../shared/PhotoCard.jsx';


const CARD_W = 280;   
const CARD_MARGIN = 10; 
const CARD_FULL = CARD_W + CARD_MARGIN * 2;

function MomentsCarousel({ items }) {
  const total = items.length;
  const cloned = useMemo(() => [...items, ...items, ...items], [items]);

  const [active, setActive] = useState(total); // começa no meio
  const [animated, setAnimated] = useState(true);
  const outerRef = useRef(null);
  const paused = useRef(false);
  const dragStartX = useRef(null);
  const isDragging = useRef(false);
  const autoTimer = useRef(null);

  const imageMap = {
    infancia: '/card-image/moments-section/infancia.png',
    amor: '/card-image/moments-section/amor.png',
    conquistas: '/card-image/moments-section/conquistas.png',
    familia: '/card-image/moments-section/familia.png',
    aventuras: '/card-image/moments-section/aventuras.png',
    fe: '/card-image/moments-section/fe.png',
    amizades: '/card-image/moments-section/amizades.png',
    legado: '/card-image/moments-section/legado.png',
  };

  const getOffset = useCallback((idx) => {
    if (!outerRef.current) return 0;
    const outerW = outerRef.current.offsetWidth;
    return (outerW / 2) - (idx * CARD_FULL + CARD_FULL / 2);
  }, []);

  const goTo = useCallback((idx, animate = true) => {
    setAnimated(animate);
    setActive(idx);
  }, []);

  // Quando chega no clone do fim/início, teleporta silenciosamente para o meio
  useEffect(() => {
    if (active < total) {
      // chegou nos clones do início → teleporta para o final do bloco do meio
      const timer = setTimeout(() => {
        goTo(active + total, false);
      }, 480); // após a transição terminar
      return () => clearTimeout(timer);
    }
    if (active >= total * 2) {
      const timer = setTimeout(() => {
        goTo(active - total, false);
      }, 480);
      return () => clearTimeout(timer);
    }
  }, [active, total, goTo]);

  // Auto-play
  const scheduleAuto = useCallback(() => {
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      if (!paused.current) goTo(active + 1);
    }, 3800);
  }, [active, goTo]);

  useEffect(() => {
    scheduleAuto();
    return () => clearTimeout(autoTimer.current);
  }, [scheduleAuto]);

  // Drag handlers
  const onMouseDown = (e) => {
    dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX;
    isDragging.current = false;
  };
  const onMouseMove = (e) => {
    if (dragStartX.current === null) return;
    if (Math.abs((e.clientX ?? e.touches?.[0]?.clientX) - dragStartX.current) > 8)
      isDragging.current = true;
  };
  const onMouseUp = (e) => {
    if (dragStartX.current === null) return;
    const dx = (e.clientX ?? e.changedTouches?.[0]?.clientX) - dragStartX.current;
    dragStartX.current = null;
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dx < -40) goTo(active + 1);
    else if (dx > 40) goTo(active - 1);
  };

  const realActive = ((active % total) + total) % total;

  return (
    <div
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; scheduleAuto(); }}
      style={{ position: 'relative', userSelect: 'none' }}
    >
      <style>{`
        .mc-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.72); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 4px 16px rgba(26,39,68,0.12);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 20; color: #1a2744;
          transition: background 0.2s, transform 0.2s;
        }
        .mc-arrow:hover { background: rgba(255,255,255,0.95); transform: translateY(-50%) scale(1.08); }
        .mc-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(26,39,68,0.25); border: none; padding: 0; cursor: pointer; transition: background 0.3s, transform 0.3s; }
        .mc-dot.active { background: #1a2744; transform: scale(1.35); }
      `}</style>

      <button className="mc-arrow" style={{ left: -6 }} onClick={() => goTo(active - 1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      {/* Overflow hidden no outer */}
      <div ref={outerRef} style={{ overflow: 'hidden', padding: '24px 0' }}>
        <div
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseUp}
          style={{
            display: 'flex',
            alignItems: 'center',
            transform: `translateX(${getOffset(active)}px)`,
            transition: animated ? 'transform 0.48s cubic-bezier(.22,1,.36,1)' : 'none',
            willChange: 'transform',
            cursor: 'grab',
          }}
        >
          {cloned.map((item, i) => {
            const dist = Math.abs(i - active);
            const scale   = dist === 0 ? 1 : dist === 1 ? 0.88 : 0.72;
            const opacity = dist === 0 ? 1 : dist === 1 ? 0.72 : dist === 2 ? 0.45 : 0.2;
            const blur    = dist <= 1 ? 0 : 2;

            return (
              <div
                key={i}
                onClick={() => dist > 0 && dist <= 2 && goTo(i)}
                style={{
                  flexShrink: 0,
                  width: CARD_W,           
                  margin: `0 ${CARD_MARGIN}px`,
                  transform: `scale(${scale})`,
                  opacity,
                  filter: blur > 0 ? `blur(${blur}px)` : 'none',
                  zIndex: 10 - dist,
                  transition: 'transform 0.48s cubic-bezier(.22,1,.36,1), opacity 0.48s ease, filter 0.48s ease',
                  transformOrigin: 'center center',
                  cursor: dist === 0 ? 'default' : 'pointer',
                }}
              >
                <PhotoCard
                  image={imageMap[item.key]}
                  title={item.label}
                  subtitle={item.desc}
                  badge= {undefined}        
                />
              </div>
            );
          })}
        </div>
      </div>

      <button className="mc-arrow" style={{ right: -6 }} onClick={() => goTo(active + 1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* Dots — baseado no índice real */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4 }}>
        {items.map((_, i) => (
          <button
            key={i}
            className={`mc-dot${i === realActive ? ' active' : ''}`}
            onClick={() => goTo(total + i)} 
          />
        ))}
      </div>
    </div>
  );
}

const MomentsSection = () => {
  const { t }         = useTranslation();
  const [ref, visible] = useInView(0.08);
  const items          = t('whyPreservePage.moments.items', { returnObjects: true });

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #a8d8f0 0%, #c8e8f5 30%, #ddf0f7 65%, #eef8fb 100%)' }}
    >
      <Clouds />
      <div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-12"
        style={{
          opacity:   visible ? 1 : 0,
          animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none',
        }}
      >
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">{t('whyPreservePage.moments.eyebrow')}</span>
          <h2 className="wpm-h2" style={{ whiteSpace: 'pre-line' }}>{t('whyPreservePage.moments.title')}</h2>
          <p className="wpm-body" style={{ maxWidth: 460, margin: '0 auto' }}>{t('whyPreservePage.moments.description')}</p>
        </div>

        <MomentsCarousel items={Array.isArray(items) ? items : []} />
      </div>
    </section>
  );
};

export default MomentsSection;