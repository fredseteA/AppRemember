// pages/userPages/shared/userPageStyles.js

export const pageBackground = 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 35%, #eef8fb 70%, #eef8fb 100%)';

export const cloudAnimations = `
  @keyframes floatCloud1 {
    0%,100% { transform: translateY(0) translateX(0); }
    45%     { transform: translateY(-14px) translateX(8px); }
  }
  @keyframes floatCloud2 {
    0%,100% { transform: translateY(0) translateX(0); }
    55%     { transform: translateY(-9px) translateX(-6px); }
  }
`;

export const revealAnimations = `
  @keyframes revealPage {
    from { opacity: 0; transform: translateY(24px); filter: blur(5px); }
    to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
  }
  @keyframes revealCard {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

export const buttonStyles = `
  .page-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 12px 26px; border-radius: 999px; background: #1a2744; color: white;
    font-family: "Georgia", serif; font-size: 0.82rem; font-weight: 700;
    letter-spacing: 0.06em; border: none; cursor: pointer;
    transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
    box-shadow: 0 4px 16px rgba(26,39,68,0.18); text-decoration: none;
    white-space: nowrap; min-height: 44px; -webkit-tap-highlight-color: transparent;
  }
  .page-btn-primary:hover {
    background: #2a3d5e; transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(26,39,68,0.22);
  }
  .page-btn-outline {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-radius: 999px; background: transparent; color: #2a3d5e;
    font-family: "Georgia", serif; font-size: 0.78rem; font-weight: 700;
    letter-spacing: 0.06em; border: 1.5px solid rgba(26,39,68,0.18); cursor: pointer;
    transition: all 0.25s ease; text-decoration: none;
    white-space: nowrap; min-height: 40px; -webkit-tap-highlight-color: transparent;
  }
  .page-btn-outline:hover {
    border-color: #5aa8e0; color: #1a2744; background: rgba(90,168,224,0.08);
  }
`;

export const pageLabel = `
  .page-label {
    text-transform: uppercase; letter-spacing: 0.22em;
    font-size: 0.62rem; font-weight: 700; color: #2a3d5e;
  }
`;

// Junta tudo para usar num único <style>
export const userPageStyles = cloudAnimations + revealAnimations + buttonStyles + pageLabel;