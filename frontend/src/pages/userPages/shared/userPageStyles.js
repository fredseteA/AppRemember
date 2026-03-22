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

export const userPageStyles = cloudAnimations + revealAnimations + buttonStyles + pageLabel;

export const profileStyles = `
  @keyframes revealPR { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideCard { from { opacity:0; transform:translateY(16px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes floatPR1 { 0%,100% { transform:translateY(0) translateX(0); } 45% { transform:translateY(-14px) translateX(8px); } }
  @keyframes floatPR2 { 0%,100% { transform:translateY(0) translateX(0); } 55% { transform:translateY(-9px) translateX(-6px); } }

  .pr-card {
    background: rgba(255,255,255,0.62); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,0.85); border-radius: 24px;
    box-shadow: 0 8px 32px rgba(26,39,68,0.07); margin-bottom: 20px; overflow: hidden;
  }
  .pr-card-header {
    display: flex; align-items: center; gap: 14px;
    padding: clamp(18px,3vw,26px) clamp(20px,4vw,32px);
    border-bottom: 1px solid rgba(26,39,68,0.07);
  }
  .pr-card-body { padding: clamp(18px,3vw,26px) clamp(20px,4vw,32px); }
  .pr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  @media (max-width: 600px) { .pr-grid-2 { grid-template-columns: 1fr; } }

  .pr-label {
    display: block; font-family: "Georgia", serif;
    font-size: 0.72rem; font-weight: 700; color: rgba(42,61,94,0.7);
    text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 7px;
  }
  .pr-input {
    display: block; width: 100%; padding: 11px 14px;
    border: 1.5px solid rgba(26,39,68,0.12); border-radius: 12px;
    background: rgba(255,255,255,0.7); font-family: "Georgia", serif;
    font-size: 0.88rem; color: #1a2744; outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    box-sizing: border-box;
  }
  .pr-input:focus { border-color: #5aa8e0; box-shadow: 0 0 0 3px rgba(90,168,224,0.15); }
  .pr-input:disabled { background: rgba(26,39,68,0.04); color: rgba(26,39,68,0.4); cursor: not-allowed; }
  .pr-input-icon { position: relative; }
  .pr-input-icon svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(90,168,224,0.7); pointer-events: none; }
  .pr-input-icon .pr-input { padding-left: 36px; }

  .pr-photo-overlay {
    position: absolute; inset: 0; border-radius: 50%;
    background: rgba(26,39,68,0.45); display: flex;
    align-items: center; justify-content: center; opacity: 0;
    transition: opacity 0.25s ease;
  }
  .pr-photo-wrap:hover .pr-photo-overlay { opacity: 1; }

  .pr-btn-outline {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 999px; background: transparent; color: #2a3d5e;
    font-family: "Georgia", serif; font-size: 0.78rem; font-weight: 700;
    letter-spacing: 0.05em; border: 1.5px solid rgba(26,39,68,0.18); cursor: pointer;
    transition: all 0.25s ease; text-decoration: none; white-space: nowrap;
    min-height: 38px; -webkit-tap-highlight-color: transparent;
  }
  .pr-btn-outline:hover { border-color: #5aa8e0; color: #1a2744; background: rgba(90,168,224,0.08); }
  .pr-btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }

  .pr-btn-save {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 32px; border-radius: 999px; background: #1a2744; color: white;
    font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.06em; border: none; cursor: pointer;
    transition: all 0.25s ease; box-shadow: 0 4px 16px rgba(26,39,68,0.18);
    min-height: 48px;
  }
  .pr-btn-save:hover { background: #2a3d5e; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,39,68,0.22); }
  .pr-btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

export const myMemorialsStyles = `
  @keyframes revealMM { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes floatSt1 { 0%,100% { transform:translateY(0) translateX(0); } 45% { transform:translateY(-14px) translateX(8px); } }
  @keyframes floatSt2 { 0%,100% { transform:translateY(0) translateX(0); } 55% { transform:translateY(-9px) translateX(-6px); } }

  .mm-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
  .mm-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(26,39,68,0.13) !important; }
  .mm-card-img { transition: transform 0.4s ease; }
  .mm-card:hover .mm-card-img { transform: scale(1.04); }

  .mm-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 20px; border-radius: 999px; background: #1a2744; color: white;
    font-family: "Georgia", serif; font-size: 0.78rem; font-weight: 700;
    letter-spacing: 0.05em; border: none; cursor: pointer;
    transition: all 0.25s ease; text-decoration: none; white-space: nowrap;
    min-height: 40px; box-shadow: 0 4px 14px rgba(26,39,68,0.16);
    -webkit-tap-highlight-color: transparent;
  }
  .mm-btn-primary:hover { background: #2a3d5e; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(26,39,68,0.2); }

  .mm-btn-outline {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 16px; border-radius: 999px; background: transparent; color: #2a3d5e;
    font-family: "Georgia", serif; font-size: 0.78rem; font-weight: 700;
    letter-spacing: 0.05em; border: 1.5px solid rgba(26,39,68,0.15); cursor: pointer;
    transition: all 0.25s ease; text-decoration: none; white-space: nowrap;
    min-height: 40px; -webkit-tap-highlight-color: transparent;
  }
  .mm-btn-outline:hover { border-color: #5aa8e0; color: #1a2744; background: rgba(90,168,224,0.08); }

  .mm-btn-danger {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 9px 16px; border-radius: 999px; background: transparent; color: #dc2626;
    font-family: "Georgia", serif; font-size: 0.75rem; font-weight: 700;
    letter-spacing: 0.05em; border: 1.5px solid rgba(220,38,38,0.25); cursor: pointer;
    transition: all 0.25s ease; white-space: nowrap; min-height: 38px;
    -webkit-tap-highlight-color: transparent;
  }
  .mm-btn-danger:hover { background: rgba(220,38,38,0.06); border-color: rgba(220,38,38,0.45); }

  @media (max-width: 600px) {
    .mm-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    .mm-card-actions { flex-wrap: wrap; }
  }
`;