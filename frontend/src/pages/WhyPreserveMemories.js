import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SecurityBadge from '../components/SecurityBadge';

// ─── useInView ───────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const Icons = {
  Box:        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Mic:        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Users:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Clock:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Book:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Image:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Music:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  MessageSq:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Star:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  QrCode:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 14h3M17 17v3M20 17h-3v3"/></svg>,
  Pin:        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Edit:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Upload:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  Package:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  Infinity:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z"/><path d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z"/></svg>,
  Heart:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Shield:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Award:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Sunrise:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>,
  Feather:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17" y1="15" x2="9" y2="15"/></svg>,
  Globe:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Check:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X:          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  UserCircle: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

// ─── IconBox — bloco de ícone flutuante no topo do card (estilo referência) ──
function IconBox({ icon, color = '#1a2744', bg }) {
  const bgColor = bg || `${color}18`;
  return (
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: bgColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 20, flexShrink: 0,
      color: color,
      boxShadow: `0 4px 16px ${color}22`,
    }}>
      {icon}
    </div>
  );
}

// ─── Global Styles ────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes wpm-float1 { 0%,100%{transform:translateY(0) translateX(0);}33%{transform:translateY(-14px) translateX(7px);}66%{transform:translateY(-7px) translateX(-5px);} }
  @keyframes wpm-float2 { 0%,100%{transform:translateY(0) translateX(0);}40%{transform:translateY(-11px) translateX(-9px);}70%{transform:translateY(-17px) translateX(5px);} }
  @keyframes wpm-float3 { 0%,100%{transform:translateY(0) translateX(0);}50%{transform:translateY(-9px) translateX(6px);} }
  @keyframes wpm-fadeDown  { from{opacity:0;transform:translateY(-28px);}to{opacity:1;transform:translateY(0);} }
  @keyframes wpm-fadeUp    { from{opacity:0;transform:translateY(36px);}to{opacity:1;transform:translateY(0);} }
  @keyframes wpm-fadeLeft  { from{opacity:0;transform:translateX(-40px);}to{opacity:1;transform:translateX(0);} }
  @keyframes wpm-fadeRight { from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);} }
  @keyframes wpm-reveal    { from{opacity:0;transform:translateY(32px);filter:blur(6px);}to{opacity:1;transform:translateY(0);filter:blur(0);} }
  @keyframes wpm-scaleIn   { from{opacity:0;transform:scale(0.94);}to{opacity:1;transform:scale(1);} }
  @keyframes wpm-pulseRing { 0%{box-shadow:0 0 0 0 rgba(90,168,224,0.55);}70%{box-shadow:0 0 0 10px rgba(90,168,224,0);}100%{box-shadow:0 0 0 0 rgba(90,168,224,0);} }
  @keyframes wpm-heartbeat { 0%,100%{transform:scale(1);}14%{transform:scale(1.1);}28%{transform:scale(1);} }
  @keyframes wpm-tickerL   { 0%{transform:translateX(0);}100%{transform:translateX(-50%);} }

  .wpm-cloud-1 { animation: wpm-float1 7s  ease-in-out infinite; }
  .wpm-cloud-2 { animation: wpm-float2 9s  ease-in-out infinite; }
  .wpm-cloud-3 { animation: wpm-float3 6s  ease-in-out infinite; }

  /* Card base — glassmorphism igual à home */
  .wpm-card {
    background: rgba(255,255,255,0.62);
    backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,0.85);
    box-shadow: 0 8px 28px rgba(26,39,68,0.08), inset 0 1px 0 rgba(255,255,255,0.95);
    border-radius: 22px;
    transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease;
  }
  .wpm-card:hover {
    transform: translateY(-6px) scale(1.015);
    box-shadow: 0 20px 52px rgba(26,39,68,0.14), inset 0 1px 0 rgba(255,255,255,0.95);
  }
  .wpm-card-dark {
    background: rgba(26,39,68,0.88);
    backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(90,168,224,0.3);
    box-shadow: 0 16px 48px rgba(26,39,68,0.22), inset 0 1px 0 rgba(255,255,255,0.07);
    border-radius: 22px;
    transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease;
  }
  .wpm-card-dark:hover {
    transform: translateY(-5px) scale(1.01);
    box-shadow: 0 24px 60px rgba(26,39,68,0.3);
  }

  .wpm-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    border-radius: 999px; padding: 13px 34px;
    background: #1a2744; color: white; border: none;
    font-family: "Georgia", serif; font-size: clamp(0.82rem, 3.5vw, 0.96rem);
    font-weight: 700; letter-spacing: 0.05em; cursor: pointer; text-decoration: none;
    box-shadow: 0 6px 24px rgba(26,39,68,0.28);
    transition: all 0.28s cubic-bezier(.22,1,.36,1);
  }
  .wpm-btn-primary:hover { transform: translateY(-2px) scale(1.04); background: #2a3d5e; box-shadow: 0 10px 32px rgba(26,39,68,0.36); }

  .wpm-btn-secondary {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    border-radius: 999px; padding: 12px 28px;
    background: rgba(255,255,255,0.28); color: #1a2744;
    border: 1.5px solid rgba(26,39,68,0.25);
    font-family: "Georgia", serif; font-size: clamp(0.82rem, 3.5vw, 0.96rem);
    font-weight: 600; letter-spacing: 0.04em; cursor: pointer; text-decoration: none;
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    transition: all 0.25s ease;
  }
  .wpm-btn-secondary:hover { background: rgba(255,255,255,0.45); border-color: rgba(26,39,68,0.45); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(26,39,68,0.12); }

  .wpm-label { display: block; text-transform: uppercase; letter-spacing: 0.22em; font-size: 0.68rem; font-weight: 700; color: #2a3d5e; margin-bottom: 12px; }
  .wpm-h2 { font-family: "Georgia", serif; font-size: clamp(1.3rem, 5vw, 2.6rem); font-weight: 700; color: #1a2744; line-height: 1.2; margin-bottom: 12px; }
  .wpm-body { color: #3a5070; font-size: clamp(0.85rem, 3vw, 1rem); line-height: 1.72; font-family: "Georgia", serif; }
  .wpm-pill { display: inline-block; padding: 10px 24px; border-radius: 999px; background: rgba(255,255,255,0.55); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.85); color: #2a3d5e; font-size: 0.82rem; font-family: "Georgia", serif; box-shadow: 0 3px 14px rgba(26,39,68,0.07); }

  @media(max-width:767px){
    .wpm-cloud-r { display: none !important; }
    .wpm-cloud-l { width: 120px !important; left: -14px !important; }
    .wpm-btns    { flex-direction: column !important; align-items: stretch !important; }
    .wpm-btns a, .wpm-btns button { width: 100% !important; justify-content: center !important; }
  }
`;

// ─── Clouds ───────────────────────────────────────────────────────────────────
function Clouds() {
  return (
    <>
      <div className="wpm-cloud-l absolute pointer-events-none select-none"
        style={{ top: '-10px', left: '-55px', width: 'clamp(120px,15vw,220px)', opacity: 0.88, zIndex: 0 }}>
        <div className="wpm-cloud-1"><img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%' }} /></div>
      </div>
      <div className="wpm-cloud-r absolute pointer-events-none select-none hidden md:block"
        style={{ bottom: '-10px', right: '-45px', width: 'clamp(120px,13vw,200px)', opacity: 0.72, zIndex: 0 }}>
        <div className="wpm-cloud-2"><img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%' }} /></div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 1. HERO
// ════════════════════════════════════════════════════════════════════════════
function HeroSection() {
  return (
    <section
      className="relative flex items-center justify-center overflow-hidden px-4"
      style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 30%, #7bbde8 60%, #5aa8e0 100%)',
        minHeight: 'clamp(520px, 75vh, 720px)',
        paddingTop: 'clamp(96px, 15vw, 136px)',
        paddingBottom: 'clamp(56px, 9vw, 88px)',
      }}
    >
      <style>{`
        .hero-af1 { animation: wpm-fadeDown 0.7s ease 0.1s  both; }
        .hero-af2 { animation: wpm-fadeUp   0.7s ease 0.25s both; }
        .hero-af3 { animation: wpm-fadeUp   0.7s ease 0.4s  both; }
        .hero-af4 { animation: wpm-fadeUp   0.7s ease 0.55s both; }
        .hero-af5 { animation: wpm-fadeUp   0.7s ease 0.7s  both; }
      `}</style>

      <div className="hero-af1 wpm-cloud-l absolute pointer-events-none select-none"
        style={{ top: 8, left: -50, width: 'clamp(200px,22vw,320px)', opacity: 0.95 }}>
        <div className="wpm-cloud-1"><img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%' }} /></div>
      </div>
      <div className="hero-af1 wpm-cloud-r absolute pointer-events-none select-none"
        style={{ top: 4, right: -40, width: 'clamp(160px,18vw,260px)', opacity: 0.95 }}>
        <div className="wpm-cloud-2"><img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%' }} /></div>
      </div>
      <div className="absolute pointer-events-none select-none hidden md:block"
        style={{ top: '40%', right: 24, width: 120, opacity: 0.65 }}>
        <div className="wpm-cloud-3"><img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%' }} /></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
        {/* Datas simbólicas com ícone SVG */}
        <div className="hero-af1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{ flex: 1, maxWidth: 72, height: '1.5px', background: 'rgba(26,39,68,0.28)', borderRadius: 2 }} />
          <div style={{ color: '#2a5d8a', animation: 'wpm-heartbeat 3s ease-in-out infinite' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <span style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', color: 'rgba(26,39,68,0.48)', letterSpacing: '0.18em', fontWeight: 500 }}>
            1948 · 2024
          </span>
          <div style={{ color: '#2a5d8a', animation: 'wpm-heartbeat 3s ease-in-out infinite', animationDelay: '0.5s' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div style={{ flex: 1, maxWidth: 72, height: '1.5px', background: 'rgba(26,39,68,0.28)', borderRadius: 2 }} />
        </div>

        <h1 className="hero-af2" style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(2rem, 6.5vw, 3.8rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.12, marginBottom: 22 }}>
          Quantas histórias dos seus bisavós você realmente conhece?
        </h1>

        <p className="hero-af3" style={{ color: '#2a3d5e', fontSize: 'clamp(0.95rem, 3.2vw, 1.15rem)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto 16px', fontFamily: '"Georgia", serif' }}>
          Uma lápide mostra apenas um nome e duas datas.
          Mas entre essas datas existe uma vida inteira — histórias, conquistas,
          amor e memórias que merecem ser preservadas para sempre.
        </p>

        {/* Ticker emocional */}
        <div className="hero-af4" style={{ overflow: 'hidden', margin: '0 auto 32px', maxWidth: 520, maskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)' }}>
          <div style={{ display: 'flex', gap: 32, whiteSpace: 'nowrap', animation: 'wpm-tickerL 18s linear infinite' }}>
            {['infância · ', 'amor · ', 'conquistas · ', 'família · ', 'aventuras · ', 'legado · ', 'amizades · ', 'fé · ',
              'infância · ', 'amor · ', 'conquistas · ', 'família · ', 'aventuras · ', 'legado · ', 'amizades · ', 'fé · '].map((t, i) => (
              <span key={i} style={{ fontFamily: '"Georgia", serif', fontSize: '0.82rem', color: 'rgba(26,39,68,0.42)', letterSpacing: '0.1em', fontStyle: 'italic' }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="hero-af5 wpm-btns" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <Link to="/create-memorial" className="wpm-btn-primary">Criar um memorial</Link>
          <Link to="/explore" className="wpm-btn-secondary">Ver exemplos</Link>
        </div>

        <div className="hero-af5" style={{ display: 'flex', justifyContent: 'center' }}>
          <SecurityBadge variant="minimal" />
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. O PROBLEMA
// ════════════════════════════════════════════════════════════════════════════
function ProblemSection() {
  const [ref, visible] = useInView(0.1);

  const cards = [
    { icon: Icons.Mic,   color: '#6b5ea8', title: 'Histórias que nunca foram registradas', text: 'Cada pessoa que parte leva consigo segredos, causos e sabedoria que ninguém teve tempo de guardar.' },
    { icon: Icons.Users, color: '#2a7a6a', title: 'Gerações que não se conhecem',          text: 'Seus netos crescerão sem saber quem foram seus antepassados e o que os tornava especiais.' },
    { icon: Icons.Clock, color: '#2a5d8a', title: 'A memória apaga com o tempo',           text: 'Em menos de 3 gerações, uma vida inteira desaparece. Em 75 anos, só restam as datas.' },
  ];

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #5aa8e0 0%, #7bbde8 20%, #a8d8f0 55%, #c8e8f5 80%, #ddf0f7 100%)' }}>
      <Clouds />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">O problema real</span>
          <h2 className="wpm-h2">As memórias desaparecem.<br className="hidden md:block" />Silenciosamente. Para sempre.</h2>
          <p className="wpm-body" style={{ maxWidth: 500, margin: '0 auto' }}>
            A maioria das famílias só percebe quando já é tarde demais. Quando aquela história que só o avô sabia contar… não existe mais.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(12px,2vw,20px)' }}>
          {cards.map((c, i) => (
            <div key={i} className="wpm-card" style={{ padding: 'clamp(22px,3vw,30px)' }}>
              <IconBox icon={c.icon} color={c.color} />
              <h3 style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#1a2744', fontSize: 'clamp(0.9rem,2.5vw,1.02rem)', marginBottom: 10, lineHeight: 1.3 }}>{c.title}</h3>
              <p style={{ color: '#3a5070', fontSize: 'clamp(0.78rem,2vw,0.85rem)', lineHeight: 1.68, margin: 0, fontFamily: '"Georgia", serif' }}>{c.text}</p>
            </div>
          ))}
        </div>

        {/* Stat emocional */}
        <div style={{ marginTop: 'clamp(32px,5vw,52px)', display: 'flex', justifyContent: 'center' }}>
          <div className="wpm-card" style={{ padding: 'clamp(20px,3vw,28px) clamp(24px,4vw,48px)', textAlign: 'center', maxWidth: 560 }}>
            <p style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.1rem,3.5vw,1.5rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.4, margin: '0 0 10px' }}>
              “Grande parte das histórias familiares se perde após poucas gerações.”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. BEFORE vs AFTER
// ════════════════════════════════════════════════════════════════════════════
function BeforeAfterSection() {
  const [ref, visible] = useInView(0.08);

  const beforeItems = [
    { icon: Icons.Box,      text: 'Fotos guardadas em caixas e gavetas' },
    { icon: Icons.Feather,  text: 'Histórias perdidas para sempre' },
    { icon: Icons.Users,    text: 'Família se lembrando cada vez menos' },
    { icon: Icons.Clock,    text: 'Uma vida apagada com o passar do tempo' },
    { icon: Icons.Globe,    text: 'Filhos que nunca conhecerão o avô de verdade' },
    { icon: Icons.Mic,      text: 'Voz, personalidade e risada esquecidas' },
  ];
  const afterItems = [
    { icon: Icons.Globe,    text: 'Memorial digital acessível de qualquer lugar' },
    { icon: Icons.Book,     text: 'História de vida completa e preservada' },
    { icon: Icons.Heart,    text: 'Família reconectada às memórias a qualquer hora' },
    { icon: Icons.Sunrise,  text: 'Filhos e netos conhecendo o legado familiar' },
    { icon: Icons.Infinity, text: 'Memórias preservadas para gerações futuras' },
    { icon: Icons.QrCode,   text: 'QR Code na lápide conecta físico e digital' },
  ];

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #ddf0f7 0%, #c8e8f5 35%, #b8e0f0 65%, #a8d8f0 100%)' }}>
      <style>{`
        .ba-left  { animation: wpm-fadeLeft  0.8s cubic-bezier(.22,1,.36,1) 0.2s  both; }
        .ba-right { animation: wpm-fadeRight 0.8s cubic-bezier(.22,1,.36,1) 0.35s both; }
        .ba-vs    { animation: wpm-scaleIn   0.6s cubic-bezier(.22,1,.36,1) 0.1s  both; }
        @media(max-width:767px){ .ba-cols{ flex-direction:column !important; } }
      `}</style>
      <Clouds />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.75s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">A transformação</span>
          <h2 className="wpm-h2">O que muda com um<br className="hidden md:block" /> memorial digital</h2>
          <p className="wpm-body" style={{ maxWidth: 440, margin: '0 auto' }}>Uma decisão simples. Uma diferença que dura para sempre.</p>
        </div>

        <div className="ba-cols" style={{ display: 'flex', gap: 'clamp(12px,2.5vw,20px)', alignItems: 'stretch' }}>
          {/* BEFORE */}
          <div className="ba-left" style={{ flex: 1, borderRadius: 22, padding: 'clamp(22px,3vw,32px)', background: 'rgba(255,255,255,0.42)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1.5px solid rgba(255,255,255,0.7)', boxShadow: '0 8px 28px rgba(26,39,68,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(26,39,68,0.08)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(180,180,180,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9ca3af' }}>
                {Icons.X}
              </div>
              <div>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#8a9baa', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 2px' }}>Sem memorial</p>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#6b7f99', fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', margin: 0 }}>A memória se perde</p>
              </div>
            </div>
            {beforeItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(200,200,200,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#b0bec5', marginTop: 1 }}>
                  {item.icon}
                </div>
                <span style={{ color: '#8a9baa', fontSize: 'clamp(0.8rem,2vw,0.88rem)', lineHeight: 1.55, fontFamily: '"Georgia", serif', textDecoration: 'line-through', textDecorationColor: 'rgba(138,155,170,0.35)' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* VS */}
          <div className="ba-vs hidden md:flex" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a2744', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Georgia", serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', boxShadow: '0 4px 16px rgba(26,39,68,0.25)' }}>VS</div>
          </div>

          {/* AFTER */}
          <div className="ba-right wpm-card-dark" style={{ flex: 1, padding: 'clamp(22px,3vw,32px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(90,168,224,0.2)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(90,168,224,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#5aa8e0' }}>
                {Icons.Check}
              </div>
              <div>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#5aa8e0', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 2px' }}>Com memorial digital</p>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: 'white', fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', margin: 0 }}>A memória vive para sempre</p>
              </div>
            </div>
            {afterItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(90,168,224,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#7bbde8', marginTop: 1 }}>
                  {item.icon}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(0.8rem,2vw,0.88rem)', lineHeight: 1.55, fontFamily: '"Georgia", serif' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 'clamp(28px,4vw,40px)' }}>
          <Link to="/create-memorial" className="wpm-btn-primary">Criar memorial agora — é gratuito</Link>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. O QUE É UM MEMORIAL DIGITAL
// ════════════════════════════════════════════════════════════════════════════
function WhatIsSection() {
  const [ref, visible] = useInView(0.08);

  const features = [
    { icon: Icons.Book,      color: '#2a5d8a', title: 'História de vida',    desc: 'Uma biografia completa com os momentos mais importantes, escrita com carinho pela família.' },
    { icon: Icons.Image,     color: '#2a7a6a', title: 'Galeria de fotos',    desc: 'Dezenas de fotos organizadas, acessíveis de qualquer celular com um simples escaneamento.' },
    { icon: Icons.Music,     color: '#6b5ea8', title: 'Áudio de homenagem',  desc: 'Uma música especial, uma oração ou mensagem de voz que representa quem partiu.' },
    { icon: Icons.MessageSq, color: '#c47a2a', title: 'Mensagens da família', desc: 'Familiares e amigos podem deixar mensagens eternas de amor, saudade e gratidão.' },
    { icon: Icons.Pin,       color: '#a82a4a', title: 'Momentos especiais',  desc: 'Datas, conquistas e marcos da vida registrados de forma visual e emocional.' },
    { icon: Icons.QrCode,    color: '#1a2744', title: 'QR Code na lápide',   desc: 'Uma placa de aço inox com QR Code que conecta quem visita o túmulo ao memorial digital.' },
  ];

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #a8d8f0 0%, #8ecce8 25%, #7bbde8 55%, #8ecce8 80%, #a8d8f0 100%)' }}>
      <Clouds />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">O produto</span>
          <h2 className="wpm-h2">O que existe dentro<br className="hidden md:block" /> de um memorial digital</h2>
          <p className="wpm-body" style={{ maxWidth: 480, margin: '0 auto' }}>
            Muito mais do que uma página. Um lugar onde uma vida inteira é preservada, revisitada e amada.
          </p>
        </div>

        {/* Browser mockup */}
        <div style={{ marginBottom: 'clamp(28px,4vw,48px)', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 560, borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 72px rgba(26,39,68,0.16)', border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <div style={{ background: 'rgba(26,39,68,0.06)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(26,39,68,0.06)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff5f57','#febc2e','#28c840'].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, background: 'rgba(26,39,68,0.06)', borderRadius: 6, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#6b7f99', letterSpacing: '0.05em' }}>remember.com.br/memorial/joao-silva</span>
              </div>
            </div>
            <div style={{ padding: 'clamp(16px,3vw,28px)' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #c8e8f5, #7bbde8)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 16px rgba(26,39,68,0.12)', color: '#3a7fb5' }}>
                  {Icons.UserCircle}
                </div>
                <p style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#1a2744', fontSize: '1.05rem', margin: '0 0 2px' }}>João Silva</p>
                <p style={{ color: '#5aa8e0', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>1948 – 2024</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ borderRadius: 10, background: 'linear-gradient(135deg, rgba(200,232,245,0.6), rgba(123,189,232,0.4))', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(90,168,224,0.2)', color: '#3a7fb5', opacity: 0.6 }}>
                    {Icons.Image}
                  </div>
                ))}
              </div>
              <div style={{ borderRadius: 10, background: 'rgba(26,39,68,0.04)', padding: '10px 14px', border: '1px solid rgba(26,39,68,0.06)' }}>
                <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.78rem', color: '#3a5070', lineHeight: 1.6, margin: 0 }}>
                  "Um homem de família, pai dedicado, amigo para sempre lembrado por todos que tiveram o privilégio de conhecê-lo..."
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(10px,2vw,16px)' }}>
          {features.map((f, i) => (
            <div key={i} className="wpm-card" style={{ padding: 'clamp(18px,2.5vw,24px)' }}>
              <IconBox icon={f.icon} color={f.color} />
              <h4 style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#1a2744', fontSize: 'clamp(0.85rem,2vw,0.95rem)', marginBottom: 8 }}>{f.title}</h4>
              <p style={{ color: '#3a5070', fontSize: 'clamp(0.72rem,1.8vw,0.8rem)', lineHeight: 1.65, margin: 0, fontFamily: '"Georgia", serif' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. MOMENTOS DE UMA VIDA
// ════════════════════════════════════════════════════════════════════════════
function MomentsSection() {
  const [ref, visible] = useInView(0.08);

  const moments = [
    { icon: Icons.Sunrise,  color: '#c47a2a', label: 'Infância',   desc: 'As primeiras memórias, brincadeiras e descobertas que formaram quem ela era.' },
    { icon: Icons.Heart,    color: '#a82a4a', label: 'Amor',       desc: 'Encontros, casamentos e os laços que definiram uma vida inteira.' },
    { icon: Icons.Award,    color: '#2a7a6a', label: 'Conquistas', desc: 'Formatura, carreira e os sonhos que um dia se tornaram realidade.' },
    { icon: Icons.Users,    color: '#2a5d8a', label: 'Família',    desc: 'Os filhos, netos e gerações que vieram depois e carregam seu legado.' },
    { icon: Icons.Globe,    color: '#6b5ea8', label: 'Aventuras',  desc: 'Viagens, novas descobertas e experiências que ela escolheu vivenciar.' },
    { icon: Icons.Shield,   color: '#2a6a4a', label: 'Fé',         desc: 'As crenças e valores espirituais que guiaram cada passo da vida.' },
    { icon: Icons.Users,    color: '#5a7a2a', label: 'Amizades',   desc: 'Os amigos verdadeiros que estiveram ao lado nos momentos mais importantes.' },
    { icon: Icons.Star,     color: '#8a5a1a', label: 'Legado',     desc: 'O que ela deixou no mundo: amor, inspiração e diferença.' },
  ];

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #a8d8f0 0%, #c8e8f5 30%, #ddf0f7 65%, #eef8fb 100%)' }}>
      <style>{`@media(max-width:767px){ .moments-grid{ grid-template-columns:repeat(2,1fr) !important; } }`}</style>
      <Clouds />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">Cada vida</span>
          <h2 className="wpm-h2">Pense em todos os momentos<br className="hidden md:block" /> que compõem uma vida.</h2>
          <p className="wpm-body" style={{ maxWidth: 460, margin: '0 auto' }}>
            Cada um deles é único. Cada um deles merece ser lembrado. E agora, todos podem ser preservados.
          </p>
        </div>

        <div className="moments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(10px,2vw,18px)' }}>
          {moments.map((m, i) => (
            <div key={i} className="wpm-card" style={{ padding: 'clamp(18px,2.5vw,24px)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <IconBox icon={m.icon} color={m.color} />
              </div>
              <h4 style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#1a2744', fontSize: 'clamp(0.82rem,2.5vw,0.95rem)', marginBottom: 8 }}>{m.label}</h4>
              <p style={{ color: '#3a5070', fontSize: 'clamp(0.7rem,1.8vw,0.78rem)', lineHeight: 1.62, margin: 0, fontFamily: '"Georgia", serif' }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. COMO FUNCIONA
// ════════════════════════════════════════════════════════════════════════════
function HowItWorksSection() {
  const [ref, visible] = useInView(0.08);

  const steps = [
    { n: '01', icon: Icons.Edit,    color: '#2a5d8a', title: 'Crie o memorial',          desc: 'Preencha o nome, datas, história de vida, fotos e momentos especiais. Tudo simples e guiado.' },
    { n: '02', icon: Icons.Upload,  color: '#2a7a6a', title: 'Adicione memórias',        desc: 'Envie fotos, áudios e mensagens. A galeria é montada automaticamente de forma bonita e emocional.' },
    { n: '03', icon: Icons.Package, color: '#6b5ea8', title: 'Receba a placa QR Code',   desc: 'Após escolher um plano, você recebe uma placa de aço inox com QR Code gravado permanentemente.' },
    { n: '04', icon: Icons.Infinity,color: '#1a2744', title: 'Família acessa para sempre', desc: 'Qualquer pessoa com um celular pode escanear e acessar o memorial. Para sempre. Em qualquer lugar.' },
  ];

  return (
    <section id="como-funciona" ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #eef8fb 0%, #ddf0f7 25%, #c8e8f5 60%, #b8e0f0 100%)' }}>
      <Clouds />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">Processo</span>
          <h2 className="wpm-h2">Em 4 passos simples,<br className="hidden md:block" /> um legado eterno.</h2>
          <p className="wpm-body" style={{ maxWidth: 420, margin: '0 auto' }}>
            Pensado para ser simples, bonito e significativo. Do início ao memorial publicado.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 'clamp(12px,2vw,20px)' }}>
          {steps.map((step, i) => (
            <div key={i} className="wpm-card" style={{ padding: 'clamp(22px,3vw,30px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a2744', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Georgia", serif', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, animation: 'wpm-pulseRing 2.5s ease-out infinite', animationDelay: `${i * 0.5}s` }}>
                  {parseInt(step.n)}
                </div>
                <span style={{ fontSize: '0.58rem', letterSpacing: '0.22em', color: '#5aa8e0', fontWeight: 700, textTransform: 'uppercase' }}>Passo {step.n}</span>
              </div>
              <IconBox icon={step.icon} color={step.color} />
              <h3 style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#1a2744', fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', marginBottom: 10, lineHeight: 1.3 }}>{step.title}</h3>
              <p style={{ color: '#3a5070', fontSize: 'clamp(0.78rem,2vw,0.85rem)', lineHeight: 1.68, margin: 0, fontFamily: '"Georgia", serif' }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-10">
          <span className="wpm-pill">Criar o memorial é gratuito · Você só paga se quiser publicar</span>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. DEPOIMENTOS
// ════════════════════════════════════════════════════════════════════════════
function TestimonialsSection() {
  const [ref, visible] = useInView(0.08);

  const testimonials = [
    { name: 'Maria Souza', role: 'Filha', stars: 5, text: 'Agora meus netos podem conhecer a história do bisavô deles. O memorial virou um tesouro da nossa família.' },
    { name: 'João Carlos', role: 'Filho', stars: 5, text: 'O QR Code na lápide do meu pai é algo que não tem preço. Cada visita se tornou especial de um jeito diferente.' },
    { name: 'Ana Paula',   role: 'Neta',  stars: 5, text: 'Criei o memorial para minha avó e toda a família ficou emocionada. Deu pra sentir ela presente de novo.' },
  ];

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #b8e0f0 0%, #a8d8f0 20%, #8ecce8 45%, #a8d8f0 75%, #b8e0f5 100%)' }}>
      <Clouds />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div className="text-center mb-10 md:mb-14">
          <span className="wpm-label">Avaliações</span>
          <h2 className="wpm-h2">O que as famílias dizem</h2>
          <p className="wpm-body" style={{ maxWidth: 400, margin: '0 auto' }}>Histórias reais de quem escolheu preservar para sempre.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(12px,2vw,20px)' }}>
          {testimonials.map((t, i) => (
            <div key={i} className="wpm-card" style={{ padding: 'clamp(20px,3vw,28px)' }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="13" height="13" viewBox="0 0 24 24" fill={j < t.stars ? '#facc15' : 'none'} stroke={j < t.stars ? '#facc15' : '#d1d5db'} strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.85rem,2.5vw,0.95rem)', color: '#1a2744', lineHeight: 1.65, marginBottom: 18, fontStyle: 'italic' }}>
                "{t.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(26,39,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#3a5070' }}>
                  {Icons.UserCircle}
                </div>
                <div>
                  <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.82rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: '0.68rem', color: '#5aa8e0', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 8. SIGNIFICADO PROFUNDO
// ════════════════════════════════════════════════════════════════════════════
function MeaningSection() {
  const [ref, visible] = useInView(0.1);

  const pillars = [
    { icon: Icons.Shield, color: '#2a5d8a', title: 'Um legado',         desc: 'O que uma pessoa construiu ao longo de toda uma vida, preservado e transmitido para as gerações futuras.' },
    { icon: Icons.Heart,  color: '#a82a4a', title: 'Uma homenagem',     desc: 'A mais bela forma de dizer que uma vida importou. Que aquela pessoa fez diferença. Que ela é amada.' },
    { icon: Icons.Star,   color: '#8a5a1a', title: 'Uma memória eterna', desc: 'Não importa quanto tempo passe. O amor registrado em um memorial nunca se apaga. Nunca some.' },
  ];

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #b8e0f5 0%, #c8e8f5 35%, #ddf0f7 65%, #eef8fb 100%)' }}>
      <Clouds />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,64px)' }}>
          <span className="wpm-label">O que é um memorial</span>
          <blockquote style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.2rem,4.5vw,2.2rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.3, maxWidth: 640, margin: '0 auto 20px', fontStyle: 'italic' }}>
            "Não é apenas uma página.<br />É um ato de amor que dura para sempre."
          </blockquote>
          <p className="wpm-body" style={{ maxWidth: 460, margin: '0 auto' }}>
            Um memorial digital é a decisão de não deixar que o tempo apague uma vida. É escolher que aquela história continue sendo contada.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(12px,2vw,20px)' }}>
          {pillars.map((p, i) => (
            <div key={i} className="wpm-card" style={{ padding: 'clamp(24px,3vw,36px)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <IconBox icon={p.icon} color={p.color} />
              </div>
              <h3 style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#1a2744', fontSize: 'clamp(1rem,3vw,1.2rem)', marginBottom: 12 }}>{p.title}</h3>
              <p style={{ color: '#3a5070', fontSize: 'clamp(0.8rem,2vw,0.88rem)', lineHeight: 1.7, margin: 0, fontFamily: '"Georgia", serif' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 9. CTA FINAL
// ════════════════════════════════════════════════════════════════════════════
function FinalCTASection() {
  const [ref, visible] = useInView(0.1);

  return (
    <section ref={ref} className="relative py-20 md:py-32 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #eef8fb 0%, #ddf0f7 20%, #c8e8f5 50%, #e8f4fc 80%, #ffffff 100%)' }}>
      <style>{`
        .cta-p-btn { transition: transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, background 0.3s ease; }
        .cta-p-btn:hover { transform: translateY(-3px) scale(1.05); background: #2a3d5e !important; box-shadow: 0 12px 36px rgba(26,39,68,0.3) !important; }
        .cta-s-btn { transition: transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, background 0.3s ease; }
        .cta-s-btn:hover { transform: translateY(-2px) scale(1.04); background: #1a2744 !important; color: white !important; box-shadow: 0 8px 28px rgba(26,39,68,0.2) !important; }
      `}</style>
      <Clouds />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center"
        style={{ opacity: visible ? 1 : 0, animation: visible ? 'wpm-reveal 0.8s cubic-bezier(.22,1,.36,1) both' : 'none' }}>

        {/* Ícone SVG no lugar do emoji */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(26,39,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2744', animation: 'wpm-heartbeat 3s ease-in-out infinite' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        </div>

        <span className="wpm-label" style={{ display: 'block', marginBottom: 20 }}>Comece agora</span>

        <h2 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.8rem, 7vw, 3.6rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.12, marginBottom: 22 }}>
          Crie um memorial que<br />dura para sempre.
        </h2>

        <p className="wpm-body" style={{ maxWidth: 520, margin: '0 auto 40px', fontSize: 'clamp(0.95rem,3.5vw,1.12rem)' }}>
          Não espere o tempo apagar as memórias.
          Preserve hoje a história de quem você ama —
          para que as próximas gerações possam conhecer,
          amar e se orgulhar de onde vieram.
        </p>

        <div className="wpm-btns" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
          <Link to="/create-memorial" className="cta-p-btn"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, padding: '15px 40px', background: '#1a2744', color: 'white', border: 'none', fontFamily: '"Georgia", serif', fontSize: 'clamp(0.88rem,3.5vw,1rem)', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 8px 28px rgba(26,39,68,0.28)', textDecoration: 'none' }}>
            Criar memorial gratuito
          </Link>
          <Link to="/explore" className="cta-s-btn"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, padding: '14px 36px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1.5px solid rgba(26,39,68,0.2)', color: '#1a2744', fontFamily: '"Georgia", serif', fontSize: 'clamp(0.88rem,3.5vw,1rem)', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 4px 18px rgba(26,39,68,0.08)', textDecoration: 'none' }}>
            Ver exemplos de memorials
          </Link>
        </div>

        <SecurityBadge variant="bar" />

        {/* Trust stats — sem emojis */}
        <div style={{ marginTop: 36, display: 'flex', gap: 'clamp(16px,4vw,40px)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { n: '100%',  label: 'Gratuito para criar' },
            { n: '∞',     label: 'Disponível para sempre' },
            { n: '24/7',  label: 'Acessível de qualquer lugar' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.2rem,3.5vw,1.6rem)', fontWeight: 700, color: '#1a2744', margin: '0 0 4px' }}>{s.n}</p>
              <p style={{ color: '#3a5070', fontSize: 'clamp(0.7rem,2vw,0.78rem)', fontFamily: '"Georgia", serif', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════
const WhyPreserveMemories = () => (
  <div data-testid="por-que-preservar-page" className="overflow-x-hidden"
    style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)' }}>
    <style>{GLOBAL_STYLES}</style>
    <HeroSection />
    <ProblemSection />
    <BeforeAfterSection />
    <WhatIsSection />
    <MomentsSection />
    <HowItWorksSection />
    <TestimonialsSection />
    <MeaningSection />
    <FinalCTASection />
  </div>
);

export default WhyPreserveMemories;