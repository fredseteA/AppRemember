import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, ArrowLeft } from 'lucide-react';
import MemorialLayout from '../../components/memorial/MemorialLayout';
import { API } from '@/config';

// ── Skeleton shimmer ─────────────────────────────────────────────────────────
function MemorialSkeleton() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start overflow-hidden"
      data-testid="memorial-view-loading"
      style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)',
        paddingTop: 'clamp(80px, 12vw, 120px)',
        paddingBottom: 48,
      }}
    >
      <style>{`
        @keyframes skimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        @keyframes floatSk1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-14px) translateX(8px); }
        }
        @keyframes floatSk2 {
          0%,100% { transform: translateY(0) translateX(0); }
          50%     { transform: translateY(-10px) translateX(-7px); }
        }
        @keyframes skFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sk-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.25) 25%,
            rgba(255,255,255,0.55) 50%,
            rgba(255,255,255,0.25) 75%
          );
          background-size: 600px 100%;
          animation: skimmer 1.8s ease-in-out infinite;
          border-radius: 12px;
        }
        .sk-card { animation: skFadeIn 0.6s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div className="absolute top-0 left-[-30px] w-36 md:w-64 opacity-90 pointer-events-none select-none"
        style={{ animation: 'floatSk1 9s ease-in-out infinite' }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="absolute top-[5%] right-[-30px] w-32 md:w-56 opacity-80 pointer-events-none select-none hidden md:block"
        style={{ animation: 'floatSk2 11s ease-in-out infinite' }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="sk-card relative z-10 w-full" style={{
        maxWidth: 560, margin: '0 16px', borderRadius: 24,
        background: 'rgba(255,255,255,0.52)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.82)',
        boxShadow: '0 16px 48px rgba(26,39,68,0.12)', overflow: 'hidden',
      }}>
        <div className="sk-shimmer" style={{ height: 'clamp(120px, 22vw, 180px)', borderRadius: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 0 }}>
          <div className="sk-shimmer" style={{
            width: 'clamp(80px, 18vw, 112px)', height: 'clamp(80px, 18vw, 112px)',
            borderRadius: '50%', marginTop: 'clamp(-40px, -9vw, -56px)',
            border: '4px solid rgba(255,255,255,0.9)', flexShrink: 0,
          }} />
          <div className="sk-shimmer" style={{ height: 22, width: 'clamp(140px, 38vw, 200px)', marginTop: 16, marginBottom: 8 }} />
          <div className="sk-shimmer" style={{ height: 14, width: 'clamp(100px, 26vw, 140px)', marginBottom: 24 }} />
          <div style={{ width: '100%', padding: '0 clamp(16px, 5vw, 32px)', marginBottom: 24 }}>
            <div className="sk-shimmer" style={{ height: 14, width: '90%', marginBottom: 8 }} />
            <div className="sk-shimmer" style={{ height: 14, width: '70%', margin: '0 auto' }} />
          </div>
        </div>
        <div style={{ padding: '0 clamp(16px, 5vw, 32px) 32px' }}>
          <div className="sk-shimmer" style={{ height: 'clamp(100px, 22vw, 140px)', borderRadius: 16 }} />
        </div>
      </div>

      <p style={{
        marginTop: 24, fontFamily: '"Georgia", serif', fontSize: '0.8rem',
        color: 'rgba(26,39,68,0.55)', letterSpacing: '0.08em',
        animation: 'skFadeIn 0.8s 0.3s both',
      }}>
        Carregando memorial…
      </p>
    </div>
  );
}

// ── Not Found ────────────────────────────────────────────────────────────────
function MemorialNotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center overflow-hidden px-4"
      data-testid="memorial-not-found"
      style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 30%, #7bbde8 60%, #5aa8e0 100%)',
      }}
    >
      <style>{`
        @keyframes floatNf1 { 0%,100% { transform: translateY(0) translateX(0); } 45% { transform: translateY(-14px) translateX(8px); } }
        @keyframes floatNf2 { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-10px) translateX(-7px); } }
        @keyframes nfReveal {
          from { opacity: 0; transform: translateY(28px); filter: blur(5px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes heartPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        .nf-card { animation: nfReveal 0.7s cubic-bezier(.22,1,.36,1) both; }
        .nf-heart { animation: heartPulse 2.8s ease-in-out infinite; }
      `}</style>

      <div className="absolute top-0 left-[-30px] w-36 md:w-64 opacity-90 pointer-events-none select-none"
        style={{ animation: 'floatNf1 9s ease-in-out infinite' }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="absolute bottom-[5%] right-[-30px] w-32 md:w-52 opacity-75 pointer-events-none select-none hidden md:block"
        style={{ animation: 'floatNf2 11s ease-in-out infinite' }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="nf-card relative z-10 text-center" style={{
        maxWidth: 420, width: '100%', borderRadius: 24,
        padding: 'clamp(32px, 8vw, 56px) clamp(24px, 6vw, 48px)',
        background: 'rgba(255,255,255,0.58)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.85)',
        boxShadow: '0 20px 56px rgba(26,39,68,0.13)',
      }}>
        <div className="nf-heart" style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(26,39,68,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
        }}>
          <Heart size={32} style={{ color: '#5aa8e0' }} />
        </div>
        <h2 style={{
          fontFamily: '"Georgia", serif', fontSize: 'clamp(1.2rem, 4vw, 1.7rem)',
          fontWeight: 700, color: '#1a2744', lineHeight: 1.25, marginBottom: 12,
        }}>
          Memorial não encontrado
        </h2>
        <p style={{
          fontFamily: '"Georgia", serif', fontSize: 'clamp(0.85rem, 3vw, 0.95rem)',
          color: '#3a5070', lineHeight: 1.68, marginBottom: 32,
        }}>
          Este memorial pode ter sido removido ou o link está incorreto. Verifique o endereço e tente novamente.
        </p>
        <Link to="/explore">
          <button style={{
            borderRadius: '999px', padding: '11px 28px',
            background: '#1a2744', border: 'none', color: 'white',
            fontFamily: '"Georgia", serif', fontSize: '0.85rem', fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.05em',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            transition: 'all 0.25s ease', boxShadow: '0 4px 16px rgba(26,39,68,0.2)',
          }}>
            <ArrowLeft size={15} />
            Explorar memoriais
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── MemorialView ─────────────────────────────────────────────────────────────
const MemorialView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detecta se veio do histórico interno do site (para mostrar botão de voltar)
  const canGoBack = window.history.length > 1;

  useEffect(() => {
  const fetchMemorial = async () => {
    try {
      // Tenta buscar por slug primeiro, fallback para UUID
      let response;
      try {
        response = await axios.get(`${API}/memorials/by-slug/${id}`);
      } catch {
        response = await axios.get(`${API}/memorials/${id}`);
      }
      setMemorial(response.data);
    } catch (error) {
      console.error('Error fetching memorial:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchMemorial();
}, [id]);

  if (loading) return <MemorialSkeleton />;
  if (!memorial) return <MemorialNotFound />;

  return (
    <div data-testid="memorial-view-page" style={{ position: 'relative' }}>

      {/* ── Botão discreto de voltar ── */}
      {canGoBack && (
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'fixed',
            top: 'clamp(14px, 3vw, 20px)',
            left: 'clamp(14px, 3vw, 20px)',
            zIndex: 50,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 16px 9px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.88)',
            boxShadow: '0 4px 18px rgba(26,39,68,0.12)',
            cursor: 'pointer',
            fontFamily: '"Georgia", serif',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#2a3d5e',
            letterSpacing: '0.05em',
            transition: 'background 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.92)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 22px rgba(26,39,68,0.16)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.72)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(26,39,68,0.12)';
          }}
        >
          <ArrowLeft size={15} style={{ flexShrink: 0 }} />
          Voltar
        </button>
      )}

      <MemorialLayout memorial={memorial} />
    </div>
  );
};

export default MemorialView;