import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageReveal } from '@/hooks/usePageReveal';

const ProductShowcaseSection = () => {
  const { t }       = useTranslation();
  const PRODUCTS = [
    { src: '/products/main-product.png', ...t('showcase.products.0', { returnObjects: true }) },
    { src: '/products/detail-finish.png', ...t('showcase.products.1', { returnObjects: true }) },
    { src: '/products/packaging-closed.png', ...t('showcase.products.2', { returnObjects: true }) },
  ];

  const revealed    = usePageReveal();
  const sectionRef  = useRef(null);
  const [visible, setVisible]   = useState(false);
  const [active, setActive]     = useState(0);
  const [prev2, setPrev2]       = useState(null);
  const [animating, setAnimating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart               = useRef(null);
  const autoRef                 = useRef(null);
  const total                   = PRODUCTS.length;

  useEffect(() => {
    if (!revealed) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [revealed]);

  const goTo = useCallback((idx) => {
    if (animating) return;
    const next = (idx + total) % total;
    if (next === active) return;
    setPrev2(active);
    setAnimating(true);
    setActive(next);
    setTimeout(() => { setPrev2(null); setAnimating(false); }, 500);
  }, [active, animating, total]);

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  const resetAuto = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(next, 4000);
  }, [next]);

  useEffect(() => { resetAuto(); return () => clearInterval(autoRef.current); }, [resetAuto]);

  const onDragStart = (e) => {
    dragStart.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    setDragging(true);
  };
  const onDragEnd = (e) => {
    if (!dragging || dragStart.current === null) return;
    const end  = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStart.current - end;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); resetAuto(); }
    setDragging(false);
    dragStart.current = null;
  };

  const prod = PRODUCTS[active];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ padding: 'clamp(56px,9vw,100px) 0' }}
    >
      <style>{`
        @keyframes ps-fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ps-imgIn {
          from { opacity:0; transform:translateY(22px) scale(0.96); filter:blur(4px); }
          to   { opacity:1; transform:translateY(0)   scale(1);    filter:blur(0);   }
        }
        @keyframes ps-imgOut {
          from { opacity:1; transform:translateY(0)    scale(1); }
          to   { opacity:0; transform:translateY(-16px) scale(0.97); filter:blur(3px); }
        }
        @keyframes ps-float {
          0%,100% { transform:translateY(0px); }
          50%     { transform:translateY(-12px); }
        }
        @keyframes ps-nameIn {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ps-pulse-glow {
          0%,100% { box-shadow: 0 28px 72px rgba(0,0,0,0.38), 0 0 0 0 rgba(255,255,255,0.06); }
          50%     { box-shadow: 0 36px 88px rgba(0,0,0,0.45), 0 0 48px 8px rgba(255,255,255,0.07); }
        }
        @keyframes ps-halo {
          0%,100% { opacity:0.55; transform:scale(1); }
          50%     { opacity:0.75; transform:scale(1.06); }
        }

        .ps-nav-btn {
          width:44px; height:44px; border-radius:50%;
          background:rgba(255,255,255,0.08);
          border:1px solid rgba(255,255,255,0.16);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.25s ease;
          backdrop-filter:blur(10px);
          color:rgba(255,255,255,0.85);
        }
        .ps-nav-btn:hover {
          background:rgba(255,255,255,0.16);
          border-color:rgba(255,255,255,0.32);
          transform:scale(1.08);
        }
        .ps-thumb {
          width:48px; height:48px; border-radius:12px;
          object-fit:cover;
          border:2px solid transparent;
          cursor:pointer;
          transition:all 0.3s ease;
          opacity:0.55;
          filter:brightness(0.8);
        }
        .ps-thumb.active {
          border-color:rgba(255,255,255,0.7);
          opacity:1;
          filter:brightness(1);
        }
        .ps-thumb:hover { opacity:0.8; transform:scale(1.06); }
        .ps-shop-bar {
          display:flex; align-items:center; gap:10px;
          background:rgba(0,0,0,0.45);
          border:1px solid rgba(255,255,255,0.12);
          backdrop-filter:blur(16px);
          border-radius:56px;
          padding:8px 20px 8px 8px;
        }
        .ps-cart-fab {
          width:52px; height:52px; border-radius:50%;
          background:rgba(0,0,0,0.75);
          border:1px solid rgba(255,255,255,0.18);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer;
          transition:all 0.25s ease;
          backdrop-filter:blur(12px);
          box-shadow:0 8px 24px rgba(0,0,0,0.3);
        }
        .ps-cart-fab:hover { background:rgba(0,0,0,0.9); transform:scale(1.06); }


        @media (max-width:640px) {
          .ps-card-wrap { width:260px !important; }
          .ps-title     { font-size:2rem !important; }
          .ps-float-img { height:230px !important; }
          .ps-card-padtop { padding-top:80px !important; }
          .ps-wrap-padtop { padding-top:110px !important; }
          .ps-cloud { bottom:-28% !important; width:115% !important; }
        }
      `}</style>

      {/* Subtle radial glow behind card */}
      <div
        aria-hidden
        style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          width:'520px', height:'520px',
          borderRadius:'50%',
          background:'radial-gradient(circle, rgba(255,255,255,0.055) 0%, transparent 70%)',
          pointerEvents:'none',
          animation:'ps-halo 6s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8">

        {/* ── Header ── */}
        <div
          className="text-center"
          style={{
            marginBottom:'clamp(36px,6vw,64px)',
            opacity: visible ? 1 : 0,
            animation: visible ? 'ps-fadeUp 0.7s cubic-bezier(.22,1,.36,1) both' : 'none',
          }}
        >
          {/* Eyebrow */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
            <span style={{
              fontSize:'1.5rem', fontWeight:700, letterSpacing:'0.22em',
              textTransform:'uppercase', color:'#2a3d5e',
              fontFamily:'Georgia, serif',
            }}>
              {t('showcase.eyebrow')}
            </span>
          </div>

          {/* Title */}
          <h2
            className="ps-title"
            style={{
              fontFamily:'Georgia, serif',
              fontSize:'clamp(2.2rem,5.5vw,3.2rem)',
              fontWeight:700,
              lineHeight:1.18,
              color:'#1a2744',
              letterSpacing:'-0.01em',
            }}
          >
            {t('showcase.title')}
          </h2>
        </div>

        {/* ── Carousel card ── */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            animation: visible ? 'ps-fadeUp 0.85s cubic-bezier(.22,1,.36,1) 0.18s both' : 'none',
            display:'flex', flexDirection:'column', alignItems:'center', gap:'0',
          }}
        >
          {/* Nav row + card */}
          <div style={{ display:'flex', alignItems:'center', gap:'clamp(16px,3vw,40px)', width:'100%', justifyContent:'center' }}>

            {/* Prev */}
            <button
              className="ps-nav-btn"
              onClick={() => { prev(); resetAuto(); }}
              aria-label="Anterior"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            {/* Card */}
            <div
              className="ps-card-wrap ps-wrap-padtop"
              style={{
                position:'relative',
                width:'clamp(300px,52vw,580px)',
                paddingTop:'clamp(120px,20vw,180px)',
                cursor: dragging ? 'grabbing' : 'grab',
              }}
              onMouseDown={onDragStart}
              onMouseUp={onDragEnd}
              onMouseLeave={(e) => { if (dragging) onDragEnd(e); }}
              onTouchStart={onDragStart}
              onTouchEnd={onDragEnd}
            >

              {/* ── Floating product image — sits ABOVE the white card ── */}
              <div style={{
                position:'absolute',
                top:0,
                left:'50%',
                transform:'translateX(-50%)',
                width:'88%',
                zIndex:20,
                pointerEvents:'none',
              }}>
                {/* Outgoing image */}
                {prev2 !== null && (
                  <img
                    key={`out-${prev2}`}
                    src={PRODUCTS[prev2].src}
                    alt=""
                    draggable={false}
                    className="ps-float-img"
                    style={{
                      position:'absolute', top:0, left:0,
                      width:'100%', height:'clamp(240px,34vw,380px)',
                      objectFit:'contain',
                      animation:'ps-imgOut 0.42s ease forwards',
                      filter:'drop-shadow(0 20px 36px rgba(0,0,0,0.28))',
                    }}
                  />
                )}
                {/* Active image */}
                <img
                  key={`in-${active}`}
                  src={prod.src}
                  alt={prod.name}
                  draggable={false}
                  className="ps-float-img"
                  style={{
                    display:'block',
                    width:'100%',
                    height:'clamp(240px,34vw,380px)',
                    objectFit:'contain',
                    animation:'ps-imgIn 0.5s cubic-bezier(.22,1,.36,1) both, ps-float 5.5s ease-in-out 0.5s infinite',
                    filter:'drop-shadow(0 20px 40px rgba(0,0,0,0.30))',
                    position:'relative', zIndex:2,
                  }}
                />
              </div>

              {/* White card — overflow visible so shadow shows, image floats above */}
              <div 
              className="ps-card-padtop"
              style={{
                borderRadius:'28px',
                background:'rgba(255,255,255,0.97)',
                paddingTop:'clamp(110px,17vw,145px)',
                paddingBottom:'clamp(20px,3vw,28px)',
                paddingLeft:'clamp(16px,3vw,28px)',
                paddingRight:'clamp(16px,3vw,28px)',
                boxShadow:'0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.10)',
                animation:'ps-pulse-glow 5s ease-in-out infinite',
                position:'relative',
                overflow:'visible',
              }}>

                {/* Name + subtitle inside card */}
                <div
                  key={`name-${active}`}
                  style={{
                    textAlign:'center',
                    animation:'ps-nameIn 0.4s cubic-bezier(.22,1,.36,1) 0.15s both',
                  }}
                >
                  <p style={{
                    fontFamily:'Georgia, serif',
                    fontSize:'clamp(1rem,2.5vw,1.2rem)',
                    fontWeight:700, color:'#1a1a1a', marginBottom:'4px',
                  }}>
                    {prod.name}
                  </p>
                  <p style={{
                    fontFamily:'Georgia, serif',
                    fontSize:'clamp(0.8rem,1.8vw,0.9rem)', color:'#777', fontWeight:400,
                  }}>
                    {prod.subtitle}
                  </p>
                </div>

                {/* Cart FAB centered below name */}
                <div style={{ display:'flex', justifyContent:'center', marginTop:'clamp(14px,2.5vw,20px)' }}>
                  <button className="ps-cart-fab" aria-label="Adicionar ao carrinho">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                  </button>
                </div>

              </div>{/* /white card */}
            </div>{/* /card wrap */}

            {/* Next */}
            <button
              className="ps-nav-btn"
              onClick={() => { next(); resetAuto(); }}
              aria-label="Próximo"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* ── Bottom bar: "Shop More" + thumbnails ── */}
          <div style={{ marginTop:'clamp(28px,4vw,44px)' }}>
            <div className="ps-shop-bar">
              {PRODUCTS.map((p, i) => (
                <img
                  key={i}
                  src={p.src}
                  alt={p.name}
                  className={`ps-thumb${i === active ? ' active' : ''}`}
                  onClick={() => { goTo(i); resetAuto(); }}
                  draggable={false}
                />
              ))}
            </div>
          </div>

        </div>{/* /carousel */}
      </div>
    </section>
  );
};

export default ProductShowcaseSection;