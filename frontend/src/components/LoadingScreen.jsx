import { useEffect, useState } from 'react';
import skyBg from '../assets/sky-bg.jpg'

const LoadingScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState(1);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 300);
    const t2 = setTimeout(() => setPhase(3), 1900);
    const t3 = setTimeout(() => {
      setVisible(false); 
      setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 400); 
    }, 2200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: `url(${skyBg}) center/cover no-repeat`,
      transition: 'opacity 0.4s ease',
      transition: 'background 1s ease-in-out, opacity 0.4s ease',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'all' : 'none',
    }}>
      <style>{`
        @keyframes cloudGrow2 {
          from { transform: scale(0.15); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes cloudGrow3 {
          from { transform: scale(1); }
          to   { transform: scale(32); }
        }
        @keyframes logoFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>

      {/* Nuvem */}
      <div style={{
        animation: phase === 2
          ? 'cloudGrow2 0.9s cubic-bezier(.22,1,.36,1) forwards'
          : phase === 3
          ? 'cloudGrow3 2s cubic-bezier(.16,1,.3,1) forwards'
          : 'none',
        transformOrigin: 'center center',
        opacity: phase === 1 ? 0 : 1,
        width: 180,
        height: 100,
        position: 'relative',
        zIndex: 2,
      }}>
        <img
          src="/clouds/cloudLoad.png"
          alt=""
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' }}
        />
      </div>

      {/* Logo fase 2 */}
      {phase === 2 && (
        <div style={{
          marginTop: 16, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          animation: 'logoFadeIn 0.7s cubic-bezier(.22,1,.36,1) 0.3s both',
          zIndex: 3,
        }}>
          <img src="/logo-transparent.svg" alt="Remember" style={{ height: 48, width: 'auto' }} />
          <span style={{
            fontFamily: '"Georgia", serif',
            fontSize: '0.62rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(42,61,94,0.55)',
            fontWeight: 700,
          }}>histórias que vivem</span>
        </div>
      )}

      {/* Logo fase 3 — some */}
      {phase === 3 && (
        <div style={{
          marginTop: 16, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          animation: 'logoFadeOut 0.3s ease forwards',
          zIndex: 3,
        }}>
          <img src="/logo-transparent.svg" alt="" style={{ height: 48, width: 'auto' }} />
          <span style={{
            fontFamily: '"Georgia", serif',
            fontSize: '0.62rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(42,61,94,0.55)',
            fontWeight: 700,
          }}>histórias que vivem</span>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;