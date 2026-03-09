import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Skeleton } from '../components/ui/skeleton';
import { Heart, ArrowRight, CheckCircle, Edit } from 'lucide-react';
import MemorialLayout from '../components/MemorialLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PreviewMemorial = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemorial = async () => {
      try {
        const response = await axios.get(`${API}/memorials/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMemorial(response.data);
      } catch (error) {
        console.error('Error fetching memorial:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMemorial();
  }, [id, token]);

  if (loading) {
    return (
      <div
        data-testid="preview-loading"
        style={{
          background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 40%, #eef8fb 100%)',
          minHeight: '100vh',
          paddingTop: 'clamp(100px, 16vw, 160px)',
          paddingBottom: 80,
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Skeleton className="h-16 w-36 rounded-2xl" />
          </div>
          <div style={{ borderRadius: 28, overflow: 'hidden', background: 'rgba(255,255,255,0.6)' }}>
            <Skeleton className="h-48 w-full" />
            <div style={{ padding: '80px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Skeleton className="h-28 w-28 rounded-full" style={{ marginTop: -56, marginBottom: 16 }} />
              <Skeleton className="h-6 w-48 mb-2 rounded-xl" />
              <Skeleton className="h-4 w-32 rounded-xl" />
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              <Skeleton className="h-36 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!memorial) {
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
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(12px)',
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

  // ── Quando carregado: MemorialLayout ocupa 100% da tela com seu próprio fundo.
  // O wrapper aqui é apenas posicionamento — sem background próprio.
  return (
    <div
      className="overflow-x-hidden"
      data-testid="preview-memorial-page"
      style={{ fontFamily: '"Georgia", serif', minHeight: '100vh', position: 'relative' }}
    >
      <style>{`
        @keyframes floatPV1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-14px) translateX(8px); }
        }
        @keyframes floatPV2 {
          0%,100% { transform: translateY(0) translateX(0); }
          55%     { transform: translateY(-9px) translateX(-6px); }
        }
        @keyframes revealPV {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pv-btn-primary {
          flex: 1;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 24px; border-radius: 999px;
          background: #1a2744; color: white;
          font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 700;
          letter-spacing: 0.08em; border: none; cursor: pointer;
          transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 6px 20px rgba(26,39,68,0.2); min-height: 50px;
          -webkit-tap-highlight-color: transparent;
        }
        .pv-btn-primary:hover { background: #2a3d5e; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(26,39,68,0.25); }
        .pv-btn-outline {
          flex: 1;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 24px; border-radius: 999px;
          background: transparent; color: #2a3d5e;
          font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 700;
          letter-spacing: 0.06em; border: 1.5px solid rgba(26,39,68,0.2);
          cursor: pointer; transition: all 0.25s ease; min-height: 50px;
          -webkit-tap-highlight-color: transparent;
        }
        .pv-btn-outline:hover { border-color: rgba(90,168,224,0.5); background: rgba(90,168,224,0.06); color: #1a2744; }
        @media (max-width: 480px) {
          .pv-action-bar-inner { flex-direction: column !important; }
          .pv-btn-primary, .pv-btn-outline { flex: unset; width: 100%; }
        }
      `}</style>

      {/* ── MemorialLayout traz seu próprio fundo completo ── */}
      <MemorialLayout
        memorial={memorial}
        isPreview={true}
        // Slot extra: banner de sucesso injetado via prop ou renderizado internamente abaixo
      />

      {/* ── Banner de sucesso — flutuante sobre o memorial ── */}
      <div
        style={{
          position: 'fixed',
          top: 'clamp(60px, 10vw, 80px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 600,
          zIndex: 60,
          animation: 'revealPV 0.6s cubic-bezier(.22,1,.36,1) both',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          borderRadius: 18, padding: '14px 18px',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(90,168,224,0.25)',
          boxShadow: '0 4px 20px rgba(26,39,68,0.1)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle size={17} style={{ color: '#15803d' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: '"Georgia", serif', fontSize: '0.9rem', fontWeight: 700, color: '#1a2744', marginBottom: 1 }}>
              Memorial criado com sucesso!
            </h3>
            <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.75rem', color: '#3a5070' }}>
              Veja abaixo como ficou sua homenagem.
            </p>
          </div>
        </div>
      </div>

      {/* Espaço para a action bar fixa */}
      <div style={{ height: 90 }} />

      {/* ── Action bar fixa ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(238,248,251,0.9)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(90,168,224,0.2)',
        boxShadow: '0 -8px 30px rgba(26,39,68,0.08)',
        padding: 'clamp(12px, 2vw, 16px) 20px',
      }}>
        <div
          className="pv-action-bar-inner"
          style={{ maxWidth: 600, margin: '0 auto', display: 'flex', gap: 10 }}
        >
          <button
            className="pv-btn-primary"
            onClick={() => navigate(`/select-plan/${id}`)}
            data-testid="button-choose-plan"
          >
            Escolher Plano
            <ArrowRight size={16} />
          </button>
          <button
            className="pv-btn-outline"
            onClick={() => navigate('/create-memorial')}
            data-testid="button-edit"
          >
            <Edit size={15} />
            Criar Outro
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewMemorial;