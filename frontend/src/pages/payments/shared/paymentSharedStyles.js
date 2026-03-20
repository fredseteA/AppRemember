export const paymentSharedStyles = `
  @keyframes floatPR1 {
    0%,100% { transform: translateY(0) translateX(0); }
    45%     { transform: translateY(-14px) translateX(8px); }
  }
  @keyframes floatPR2 {
    0%,100% { transform: translateY(0) translateX(0); }
    55%     { transform: translateY(-9px) translateX(-6px); }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.88) translateY(24px); }
    60%  { transform: scale(1.02) translateY(-4px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  .pr-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px 28px; border-radius: 999px; background: #1a2744; color: white;
    font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.06em; border: none; cursor: pointer;
    transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
    box-shadow: 0 6px 20px rgba(26,39,68,0.18); min-height: 48px;
    -webkit-tap-highlight-color: transparent;
  }
  .pr-btn-primary:hover { background: #2a3d5e; transform: translateY(-2px); }
  .pr-btn-outline {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 14px 28px; border-radius: 999px; background: transparent; color: #2a3d5e;
    font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.06em; border: 1.5px solid rgba(26,39,68,0.18); cursor: pointer;
    transition: all 0.25s ease; min-height: 48px;
    -webkit-tap-highlight-color: transparent;
  }
  .pr-btn-outline:hover { border-color: rgba(90,168,224,0.5); background: rgba(90,168,224,0.06); color: #1a2744; }
  @media (max-width: 480px) {
    .pr-btns { flex-direction: column !important; }
    .pr-btn-primary, .pr-btn-outline { width: 100%; }
  }
`;