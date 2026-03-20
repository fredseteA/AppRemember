import { useState, useEffect, useRef } from 'react';

export const GLOBAL_STYLES = `
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

const useInView = (threshold = 0.12) => {
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

export { useInView };