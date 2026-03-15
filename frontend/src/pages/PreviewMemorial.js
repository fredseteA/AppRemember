import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Skeleton } from '../components/ui/skeleton';
import { Heart, ArrowRight, Plus, CheckCircle2, Sparkles, Edit3 } from 'lucide-react';
import MemorialLayout from '../components/MemorialLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ── Loading Skeleton ──────────────────────────────────────────────────────────
function PreviewSkeleton() {
  return (
    <div
      data-testid="preview-loading"
      style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 40%, #eef8fb 100%)',
        minHeight: '100vh',
        paddingTop: 'clamp(100px, 16vw, 140px)',
        paddingBottom: 100,
      }}
    >
      {/* Banner skeleton */}
      <div style={{ maxWidth: 640, margin: '0 auto 24px', padding: '0 20px' }}>
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
      {/* Card skeleton */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ borderRadius: 28, overflow: 'hidden', background: 'rgba(255,255,255,0.6)' }}>
          <Skeleton className="h-40 w-full" />
          <div style={{ padding: '64px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Skeleton className="h-28 w-28 rounded-full" style={{ marginTop: -56, marginBottom: 16 }} />
            <Skeleton className="h-6 w-48 mb-2 rounded-xl" />
            <Skeleton className="h-4 w-32 rounded-xl mb-6" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Not Found ─────────────────────────────────────────────────────────────────
function PreviewNotFound() {
  return (
    <div
      data-testid="memorial-not-found"
      style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 40%, #eef8fb 100%)',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Georgia", serif',
      }}
    >
      <div style={{
        width: 76, height: 76, borderRadius: '50%',
        background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <Heart size={32} style={{ color: '#5aa8e0' }} />
      </div>
      <p style={{ color: '#3a5070', fontSize: '1rem' }}>Memorial não encontrado</p>
    </div>
  );
}

// ── PreviewMemorial ───────────────────────────────────────────────────────────
const PreviewMemorial = () => {
  const { id }     = useParams();
  const { token }  = useAuth();
  const navigate   = useNavigate();
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${API}/memorials/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMemorial(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, token]);

  // Auto-dismiss do banner após 6s
  useEffect(() => {
    if (!loading && memorial) {
      const t = setTimeout(() => setBannerVisible(false), 6000);
      return () => clearTimeout(t);
    }
  }, [loading, memorial]);

  if (loading)  return <PreviewSkeleton />;
  if (!memorial) return <PreviewNotFound />;

  return (
    <div
      className="overflow-x-hidden"
      data-testid="preview-memorial-page"
      style={{ fontFamily: '"Georgia", serif', minHeight: '100vh', position: 'relative' }}
    >
      <style>{`
        /* ── Animations ── */
        @keyframes pv-slideDown {
          from { opacity: 0; transform: translateY(-20px) translateX(-50%); }
          to   { opacity: 1; transform: translateY(0)     translateX(-50%); }
        }
        @keyframes pv-slideUp {
          from { opacity: 1; transform: translateY(0)    translateX(-50%); }
          to   { opacity: 0; transform: translateY(-16px) translateX(-50%); }
        }
        @keyframes pv-barReveal {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pv-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes pv-pulse {
          0%,100% { box-shadow: 0 0 0 0   rgba(34,197,94,0.4); }
          50%     { box-shadow: 0 0 0 8px rgba(34,197,94,0);   }
        }
        @keyframes pv-spin {
          to { transform: rotate(360deg); }
        }

        /* ── Banner ── */
        .pv-banner {
          position: fixed;
          top: clamp(68px, 11vw, 84px);
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 580px;
          z-index: 100;
          animation: pv-slideDown 0.55s cubic-bezier(.22,1,.36,1) both;
        }
        .pv-banner.is-hiding {
          animation: pv-slideUp 0.4s cubic-bezier(.22,1,.36,1) forwards;
        }

        /* ── Action bar ── */
        .pv-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 90;
          animation: pv-barReveal 0.5s cubic-bezier(.22,1,.36,1) 0.3s both;
        }

        /* ── Buttons ── */
        .pv-btn-plan {
          flex: 1.4;
          display: inline-flex; align-items: center; justify-content: center; gap: 9px;
          padding: 15px 28px; border-radius: 999px;
          background: linear-gradient(135deg, #1a2744 0%, #2a3d5e 100%);
          color: white;
          font-family: "Georgia", serif; font-size: clamp(0.82rem, 3vw, 0.92rem);
          font-weight: 700; letter-spacing: 0.07em;
          border: none; cursor: pointer; min-height: 52px;
          box-shadow: 0 6px 24px rgba(26,39,68,0.28), inset 0 1px 0 rgba(255,255,255,0.1);
          transition: all 0.28s cubic-bezier(.22,1,.36,1);
          -webkit-tap-highlight-color: transparent;
          white-space: nowrap;
        }
        .pv-btn-plan:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 32px rgba(26,39,68,0.36), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .pv-btn-plan:active { transform: scale(0.98); }

        .pv-btn-other {
          flex: 1;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 15px 20px; border-radius: 999px;
          background: rgba(255,255,255,0.65);
          backdropFilter: blur(14px); -webkit-backdrop-filter: blur(14px);
          color: #2a3d5e;
          font-family: "Georgia", serif; font-size: clamp(0.78rem, 2.8vw, 0.88rem);
          font-weight: 600; letter-spacing: 0.05em;
          border: 1.5px solid rgba(26,39,68,0.14);
          cursor: pointer; min-height: 52px;
          box-shadow: 0 2px 12px rgba(26,39,68,0.06);
          transition: all 0.25s ease;
          -webkit-tap-highlight-color: transparent;
          white-space: nowrap;
        }
        .pv-btn-other:hover {
          background: rgba(255,255,255,0.85);
          border-color: rgba(26,39,68,0.24);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(26,39,68,0.1);
        }
        .pv-btn-other:active { transform: scale(0.98); }

        /* ── Shimmer on plan button ── */
        .pv-btn-plan::after {
          content: '';
          position: absolute; inset: 0;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
          background-size: 400px 100%;
          animation: pv-shimmer 3s ease-in-out infinite;
          pointer-events: none;
        }
        .pv-btn-plan { position: relative; overflow: hidden; }

        @media (max-width: 420px) {
          .pv-btns { flex-direction: column !important; }
          .pv-btn-plan, .pv-btn-other { flex: unset !important; width: 100% !important; }
        }
      `}</style>

      {/* ── MemorialLayout ── */}
      <div style={{ paddingTop: 'clamp(68px, 11vw, 84px)', paddingBottom: 110 }}>
        <MemorialLayout memorial={memorial} isPreview={true} />
      </div>

      {/* ── Banner de sucesso ── */}
      {bannerVisible && (
        <div className="pv-banner" style={{ pointerEvents: 'none' }}>
          <div style={{
            borderRadius: 20,
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(34,197,94,0.2)',
            boxShadow: '0 8px 32px rgba(26,39,68,0.12), 0 0 0 1px rgba(255,255,255,0.8) inset',
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            {/* Ícone animado */}
            <div style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(34,197,94,0.1)',
              border: '1.5px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pv-pulse 2s ease-in-out infinite',
            }}>
              <CheckCircle2 size={20} style={{ color: '#16a34a' }} />
            </div>

            {/* Texto */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <h3 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.82rem, 3vw, 0.92rem)', fontWeight: 700, color: '#1a2744', margin: 0, whiteSpace: 'nowrap' }}>
                  Memorial criado com sucesso!
                </h3>
                <Sparkles size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
              </div>
              <p style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.7rem, 2.5vw, 0.78rem)', color: '#3a5070', margin: 0, lineHeight: 1.4 }}>
                Veja abaixo como ficou sua homenagem. Escolha um plano para publicar.
              </p>
            </div>

            {/* Barra de progresso auto-dismiss */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, borderRadius: '0 0 20px 20px', overflow: 'hidden', pointerEvents: 'none' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #16a34a, #5aa8e0)',
                animation: 'pv-shimmer 6s linear forwards',
                transformOrigin: 'left',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Action bar fixa ── */}
      <div className="pv-bar">
        {/* Separador com gradiente */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(90,168,224,0.3) 30%, rgba(90,168,224,0.3) 70%, transparent)',
        }} />

        <div style={{
          background: 'rgba(238,248,251,0.92)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          padding: 'clamp(10px, 2vw, 14px) clamp(16px, 4vw, 20px)',
        }}>
          {/* Label no topo da barra */}
          <p style={{
            textAlign: 'center',
            fontFamily: '"Georgia", serif',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(42,61,94,0.45)',
            marginBottom: 10,
          }}>
            Modo de visualização — Rascunho
          </p>

          <div
            className="pv-btns"
            style={{ maxWidth: 560, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'stretch' }}
          >
            {/* Botão principal */}
            <button
              className="pv-btn-plan"
              onClick={() => navigate(`/select-plan/${id}`)}
              data-testid="button-choose-plan"
            >
              <span>Escolher Plano</span>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ArrowRight size={14} />
              </div>
            </button>

            {/* Botão secundário */}
            <button
              className="pv-btn-other"
              onClick={() => navigate('/create-memorial')}
              data-testid="button-create-other"
            >
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(26,39,68,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Plus size={13} />
              </div>
              <span>Criar outro</span>
            </button>
          </div>

          {/* Trust line */}
          <p style={{
            textAlign: 'center',
            fontFamily: '"Georgia", serif',
            fontSize: '0.62rem',
            color: 'rgba(42,61,94,0.4)',
            marginTop: 8,
            letterSpacing: '0.04em',
          }}>
            Criar é gratuito · Pague somente ao publicar
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewMemorial;