import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Skeleton } from '../components/ui/skeleton';
import { Heart, Eye } from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';
import { QrCode } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyMemorials = () => {
  const { token } = useAuth();
  const [memorials, setMemorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState(null); // { slug, name }

  useEffect(() => {
    const fetchMemorials = async () => {
      try {
        const response = await axios.get(`${API}/memorials/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMemorials(response.data);
      } catch (error) {
        console.error('Error fetching memorials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemorials();
  }, [token]);

  if (loading) {
    return (
      <div
        data-testid="my-memorials-loading"
        style={{
          background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 40%, #eef8fb 100%)',
          minHeight: '100vh',
          paddingTop: 'clamp(100px, 16vw, 160px)',
          paddingBottom: 80,
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <Skeleton className="h-12 w-64 mb-8" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 rounded-3xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div
      className="overflow-x-hidden"
      data-testid="my-memorials-page"
      style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 35%, #eef8fb 70%, #eef8fb 100%)',
        fontFamily: '"Georgia", serif',
        minHeight: '100vh',
      }}
    >
      <style>{`
        @keyframes floatSt1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-14px) translateX(8px); }
        }
        @keyframes floatSt2 {
          0%,100% { transform: translateY(0) translateX(0); }
          55%     { transform: translateY(-9px) translateX(-6px); }
        }
        @keyframes revealMM {
          from { opacity: 0; transform: translateY(24px); filter: blur(5px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes revealCard {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mm-card {
          transition: transform 0.38s cubic-bezier(.22,1,.36,1), box-shadow 0.38s ease;
        }
        .mm-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 56px rgba(26,39,68,0.13) !important;
        }
        .mm-card:hover .mm-card-img {
          transform: scale(1.05);
        }
        .mm-card-img {
          transition: transform 0.55s cubic-bezier(.22,1,.36,1);
        }
        .mm-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 12px 26px;
          border-radius: 999px;
          background: #1a2744;
          color: white;
          font-family: "Georgia", serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          border: none;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 4px 16px rgba(26,39,68,0.18);
          text-decoration: none;
          white-space: nowrap;
          min-height: 44px;
          -webkit-tap-highlight-color: transparent;
        }
        .mm-btn-primary:hover {
          background: #2a3d5e;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(26,39,68,0.22);
        }
        .mm-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: 999px;
          background: transparent;
          color: #2a3d5e;
          font-family: "Georgia", serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          border: 1.5px solid rgba(26,39,68,0.18);
          cursor: pointer;
          transition: all 0.25s ease;
          text-decoration: none;
          white-space: nowrap;
          min-height: 40px;
          -webkit-tap-highlight-color: transparent;
        }
        .mm-btn-outline:hover {
          border-color: #5aa8e0;
          color: #1a2744;
          background: rgba(90,168,224,0.08);
        }
        @media (max-width: 480px) {
          .mm-header { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .mm-card-actions { flex-direction: column !important; }
          .mm-card-actions a { width: 100% !important; }
          .mm-btn-outline, .mm-btn-primary { width: 100% !important; }
        }
      `}</style>

      {/* Nuvem esquerda — mais lenta, vai pra cima-direita */}
      <div
        className="absolute top-[60px] left-[-50px] w-44 md:w-64 opacity-55 pointer-events-none select-none z-0"
        style={{ animation: 'floatSt1 11s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud1.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* Nuvem direita — mais rápida, vai pra cima-esquerda */}
      <div
        className="absolute top-[80px] right-[-40px] w-36 md:w-56 opacity-40 pointer-events-none select-none z-0 hidden md:block"
        style={{ animation: 'floatSt2 8s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud2.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div
        className="relative z-10"
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 20px',
          paddingTop: 'clamp(100px, 16vw, 160px)',
          paddingBottom: 'clamp(60px, 10vw, 120px)',
        }}
      >

        {/* Header */}
        <div
          className="mm-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'clamp(32px, 6vw, 56px)',
            animation: 'revealMM 0.75s cubic-bezier(.22,1,.36,1) both',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ height: 1, width: 28, background: 'rgba(42,61,94,0.3)', flexShrink: 0 }} />
              <span style={{
                textTransform: 'uppercase', letterSpacing: '0.22em',
                fontSize: '0.62rem', fontWeight: 700, color: '#2a3d5e',
              }}>
                Painel do usuário
              </span>
            </div>
            <h1
              data-testid="page-title"
              style={{
                fontFamily: '"Georgia", serif',
                fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                fontWeight: 700,
                color: '#1a2744',
                lineHeight: 1.1,
              }}
            >
              Meus Memoriais
            </h1>
          </div>

          <Link to="/create-memorial" className="mm-btn-primary" data-testid="button-create-new">
            + Criar Novo Memorial
          </Link>
        </div>

        {/* Empty state */}
        {memorials.length === 0 ? (
          <div
            data-testid="no-memorials-message"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              paddingTop: 80,
              paddingBottom: 80,
              animation: 'revealMM 0.7s cubic-bezier(.22,1,.36,1) 0.15s both',
            }}
          >
            <div style={{
              width: 76, height: 76, borderRadius: '50%',
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 4px 20px rgba(26,39,68,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24,
            }}>
              <Heart size={32} style={{ color: '#5aa8e0' }} />
            </div>
            <h2 style={{
              fontFamily: '"Georgia", serif',
              fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
              fontWeight: 700, color: '#1a2744', marginBottom: 10,
            }}>
              Nenhum memorial ainda
            </h2>
            <p style={{
              fontFamily: '"Georgia", serif',
              fontSize: '0.9rem', color: '#3a5070',
              lineHeight: 1.7, maxWidth: 320, marginBottom: 28,
            }}>
              Você ainda não criou nenhum memorial. Comece agora a preservar memórias.
            </p>
            <Link to="/create-memorial" className="mm-btn-primary">
              Criar Primeiro Memorial
            </Link>
          </div>

        ) : (

          /* Grid de memoriais */
          <div
            data-testid="memorials-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 'clamp(14px, 2vw, 22px)',
            }}
          >
            {memorials.map((memorial, index) => (
              <div
                key={memorial.id}
                className="mm-card"
                data-testid={`memorial-card-${memorial.id}`}
                style={{
                  borderRadius: 24,
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: '1px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 8px 32px rgba(26,39,68,0.08)',
                  animation: `revealCard 0.6s cubic-bezier(.22,1,.36,1) ${index * 0.08}s both`,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Imagem */}
                <div style={{ height: 200, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  {memorial.person_data.photo_url ? (
                    <img
                      src={memorial.person_data.photo_url}
                      alt={memorial.person_data.full_name}
                      className="mm-card-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      background: 'linear-gradient(135deg, #b8e0f5 0%, #7bbde8 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Heart size={36} style={{ color: 'rgba(255,255,255,0.55)' }} />
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(26,39,68,0.45) 0%, transparent 55%)',
                  }} />
                  {/* Badge status */}
                  <div style={{ position: 'absolute', top: 14, left: 14 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      fontFamily: '"Georgia", serif',
                      background: memorial.status === 'published'
                        ? 'rgba(34,197,94,0.18)'
                        : 'rgba(251,191,36,0.2)',
                      color: memorial.status === 'published' ? '#15803d' : '#92400e',
                      border: memorial.status === 'published'
                        ? '1px solid rgba(34,197,94,0.35)'
                        : '1px solid rgba(251,191,36,0.4)',
                      backdropFilter: 'blur(8px)',
                    }}>
                      {memorial.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                </div>

                {/* Conteúdo */}
                <div style={{ padding: 'clamp(16px, 3vw, 22px)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{
                    fontFamily: '"Georgia", serif',
                    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                    fontWeight: 700,
                    color: '#1a2744',
                    marginBottom: 4,
                    lineHeight: 1.25,
                  }}>
                    {memorial.person_data.full_name}
                  </h3>

                  <p style={{
                    fontFamily: '"Georgia", serif',
                    fontSize: '0.78rem',
                    color: '#5aa8e0',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 'auto',
                    paddingBottom: 16,
                  }}>
                    {memorial.person_data.relationship}
                    {memorial.plan_type && (
                      <span style={{ color: 'rgba(58,80,112,0.5)', marginLeft: 8 }}>
                        · Plano {memorial.plan_type}
                      </span>
                    )}
                  </p>

                  {/* Ações */}
                  <div
                    className="mm-card-actions"
                    style={{
                      display: 'flex',
                      gap: 8,
                      paddingTop: 14,
                      borderTop: '1px solid rgba(26,39,68,0.07)',
                    }}
                  >
                    <Link to={`/memorial/${memorial.slug || memorial.id}`} style={{ flex: 1 }}>
                      <button className="mm-btn-outline" style={{ width: '100%' }} data-testid="button-view">
                        <Eye size={14} />
                        Ver
                      </button>
                    </Link>

                    {memorial.status === 'published' && (
                      <button
                        className="mm-btn-outline"
                        onClick={() => setQrModal({
                          slug: memorial.slug || memorial.id,
                          name: memorial.person_data.full_name,
                        })}
                        title="Ver QR Code"
                        style={{ minWidth: 44, padding: '10px 14px' }}
                      >
                        <QrCode size={14} />
                      </button>
                    )}

                    {memorial.status === 'published' && (
                      <Link to={`/edit-memorial/${memorial.id}`} style={{ flex: 1 }}>
                        <button className="mm-btn-outline" style={{ width: '100%' }}>
                          ✏️ Editar
                        </button>
                      </Link>
                    )}

                    {memorial.status === 'draft' && (
                      <Link to={`/select-plan/${memorial.id}`} style={{ flex: 1 }}>
                        <button className="mm-btn-primary" style={{ width: '100%' }} data-testid="button-publish">
                          Publicar
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {qrModal && (
      <QRCodeModal
        slug={qrModal.slug}
        name={qrModal.name}
        onClose={() => setQrModal(null)}
      />
    )}
  </>
  );
};

export default MyMemorials;