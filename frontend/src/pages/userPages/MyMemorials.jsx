import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import axios from 'axios';
import { Skeleton } from '../../components/ui/skeleton';
import { Heart, Eye, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import QRCodeModal from '@/components/memorial/QRCodeModal.jsx';
import { QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/config';
import { myMemorialsStyles, pageBackground } from './shared/userPageStyles.js'
import { useTranslation } from 'react-i18next';

// ─── Modal de confirmação de exclusão ────────────────────────────────────────
const DeleteConfirmModal = ({ memorial, onConfirm, onCancel, deleting }) => {
  const {t} = useTranslation();
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,25,50,0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          animation: 'fadeInBd 0.2s ease both',
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.9)',
          borderRadius: 28,
          padding: 'clamp(28px, 5vw, 40px)',
          maxWidth: 420, width: '100%',
          boxShadow: '0 32px 80px rgba(15,25,50,0.18)',
          animation: 'revealModal 0.35s cubic-bezier(.22,1,.36,1) both',
          textAlign: 'center',
        }}
      >
        {/* Ícone */}
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(239,68,68,0.08)',
          border: '1.5px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <AlertTriangle size={26} style={{ color: '#ef4444' }} />
        </div>

        <h2 style={{
          fontFamily: '"Georgia", serif',
          fontSize: '1.25rem', fontWeight: 700,
          color: '#1a2744', marginBottom: 10, lineHeight: 1.25,
        }}>
          {t('userPages.myMemorials.deleteModal.title')}
        </h2>

        <p style={{
          fontFamily: '"Georgia", serif',
          fontSize: '0.9rem', color: '#3a5070',
          lineHeight: 1.7, marginBottom: 6,
        }}>
          {t('userPages.myMemorials.deleteModal.about')}
        </p>
        <p style={{
          fontFamily: '"Georgia", serif',
          fontSize: '1rem', fontWeight: 700,
          color: '#1a2744', marginBottom: 24,
        }}>
          "{memorial.person_data.full_name}"
        </p>

        <div style={{
          background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: 12, padding: '12px 16px',
          marginBottom: 28,
        }}>
          <p style={{
            fontFamily: '"Georgia", serif',
            fontSize: '0.8rem', color: '#b91c1c',
            lineHeight: 1.6, margin: 0,
          }}>
            {t('userPages.myMemorials.deleteModal.warning')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={deleting}
            style={{
              flex: 1, padding: '12px 20px', borderRadius: 999,
              background: 'transparent', color: '#3a5070',
              fontFamily: '"Georgia", serif', fontSize: '0.88rem', fontWeight: 700,
              border: '1.5px solid rgba(26,39,68,0.15)', cursor: 'pointer',
              transition: 'all .2s', minHeight: 48,
            }}
          >
            {t('userPages.myMemorials.deleteModal.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              flex: 1, padding: '12px 20px', borderRadius: 999,
              background: deleting ? 'rgba(239,68,68,0.6)' : '#ef4444',
              color: 'white',
              fontFamily: '"Georgia", serif', fontSize: '0.88rem', fontWeight: 700,
              border: 'none', cursor: deleting ? 'not-allowed' : 'pointer',
              transition: 'all .2s', minHeight: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {deleting
              ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> {t('userPages.myMemorials.deleteModal.deleting')}</>
              : <><Trash2 size={15} /> {t('userPages.myMemorials.deleteModal.confirm')}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
const MyMemorials = () => {
  const { token } = useAuth();
  const [memorials, setMemorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); 
  const [deleting, setDeleting] = useState(false);
  const {t} = useTranslation();

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

  // ─── Excluir memorial ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    const {t} = useTranslation;
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/memorials/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemorials(prev => prev.filter(m => m.id !== deleteModal.id));
      toast.success(t('userPages.myMemorials.toastSuccess'));
      setDeleteModal(null);
    } catch {
      toast.error(t('userPages.myMemorials.toastError'));
    } finally {
      setDeleting(false);
    }
  };

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
          background: pageBackground,
          fontFamily: '"Georgia", serif',
          minHeight: '100vh',
        }}
      >
        <style>{myMemorialsStyles}</style>

        {/* Nuvem esquerda */}
        <div
          className="absolute top-[60px] left-[-50px] w-44 md:w-64 opacity-55 pointer-events-none select-none z-0"
          style={{ animation: 'floatSt1 11s ease-in-out infinite' }}
        >
          <img src="/clouds/cloud1.png" alt="" draggable={false}
            style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* Nuvem direita */}
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
            maxWidth: 1100, margin: '0 auto', padding: '0 20px',
            paddingTop: 'clamp(100px, 16vw, 160px)',
            paddingBottom: 'clamp(60px, 10vw, 120px)',
          }}
        >
          {/* Header */}
          <div
            className="mm-header"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
                  {t('userPages.myMemorials.eyebrow')}
                </span>
              </div>
              <h1
                data-testid="page-title"
                style={{
                  fontFamily: '"Georgia", serif',
                  fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                  fontWeight: 700, color: '#1a2744', lineHeight: 1.1,
                }}
              >
                {t('userPages.myMemorials.title')}
              </h1>
            </div>

            <Link to="/create-memorial" className="mm-btn-primary" data-testid="button-create-new">
              {t('userPages.myMemorials.createBtn')}
            </Link>
          </div>

          {/* Empty state */}
          {memorials.length === 0 ? (
            <div
              data-testid="no-memorials-message"
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', paddingTop: 80, paddingBottom: 80,
                animation: 'revealMM 0.7s cubic-bezier(.22,1,.36,1) 0.15s both',
              }}
            >
              <div style={{
                width: 76, height: 76, borderRadius: '50%',
                background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
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
                {t('userPages.myMemorials.emptyTitle')}
              </h2>
              <p style={{
                fontFamily: '"Georgia", serif',
                fontSize: '0.9rem', color: '#3a5070',
                lineHeight: 1.7, maxWidth: 320, marginBottom: 28,
              }}>
                {t('userPages.myMemorials.emptyDesc')}
              </p>
              <Link to="/create-memorial" className="mm-btn-primary">
                {t('userPages.myMemorials.emptyBtn')}
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
                    borderRadius: 24, overflow: 'hidden',
                    background: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
                    border: '1px solid rgba(255,255,255,0.85)',
                    boxShadow: '0 8px 32px rgba(26,39,68,0.08)',
                    animation: `revealCard 0.6s cubic-bezier(.22,1,.36,1) ${index * 0.08}s both`,
                    display: 'flex', flexDirection: 'column',
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
                        display: 'inline-block', padding: '4px 12px', borderRadius: 999,
                        fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em',
                        textTransform: 'uppercase', fontFamily: '"Georgia", serif',
                        background: memorial.status === 'published'
                          ? 'rgba(34,197,94,0.18)' : 'rgba(251,191,36,0.2)',
                        color: memorial.status === 'published' ? '#15803d' : '#92400e',
                        border: memorial.status === 'published'
                          ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(251,191,36,0.4)',
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
                      fontWeight: 700, color: '#1a2744',
                      marginBottom: 4, lineHeight: 1.25,
                    }}>
                      {memorial.person_data.full_name}
                    </h3>

                    <p style={{
                      fontFamily: '"Georgia", serif', fontSize: '0.78rem',
                      color: '#5aa8e0', letterSpacing: '0.1em',
                      textTransform: 'uppercase', marginBottom: 'auto', paddingBottom: 16,
                    }}>
                      {memorial.person_data.relationship}
                      {memorial.plan_type && (
                        <span style={{ color: 'rgba(58,80,112,0.5)', marginLeft: 8 }}>
                          · Plano {memorial.plan_type}
                        </span>
                      )}
                    </p>

                    {/* ── Ações ── */}
                    <div
                      className="mm-card-actions"
                      style={{
                        display: 'flex', gap: 8, flexWrap: 'wrap',
                        paddingTop: 14,
                        borderTop: '1px solid rgba(26,39,68,0.07)',
                      }}
                    >
                      {/* ── PUBLICADO ── */}
                      {memorial.status === 'published' && (
                        <>
                          <Link to={`/memorial/${memorial.slug || memorial.id}`} style={{ flex: 1 }}>
                            <button className="mm-btn-outline" style={{ width: '100%' }} data-testid="button-view">
                              <Eye size={14} /> {t('userPages.myMemorials.actionView')}
                            </button>
                          </Link>

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

                          <Link to={`/edit-memorial/${memorial.id}`} style={{ flex: 1 }}>
                            <button className="mm-btn-outline" style={{ width: '100%' }}>
                              {t('userPages.myMemorials.actionEdit')}
                            </button>
                          </Link>
                        </>
                      )}

                      {/* ── RASCUNHO ── */}
                      {memorial.status === 'draft' && (
                        <>
                          {/* Editar rascunho */}
                          <Link to={`/edit-memorial/${memorial.id}`} style={{ flex: 1 }}>
                            <button className="mm-btn-outline" style={{ width: '100%' }} data-testid="button-edit-draft">
                              {t('userPages.myMemorials.actionEdit')}
                            </button>
                          </Link>

                          {/* Publicar */}
                          <Link to={`/select-plan/${memorial.id}`} style={{ flex: 1 }}>
                            <button className="mm-btn-primary" style={{ width: '100%' }} data-testid="button-publish">
                              {t('userPages.myMemorials.actionPublish')}
                            </button>
                          </Link>

                          {/* Excluir — linha separada abaixo */}
                          <div style={{ width: '100%', marginTop: 2 }}>
                            <button
                              className="mm-btn-danger"
                              style={{ width: '100%' }}
                              onClick={() => setDeleteModal(memorial)}
                              data-testid="button-delete-draft"
                            >
                              <Trash2 size={13} /> {t('userPages.myMemorials.actionDelete')}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal QR Code */}
      {qrModal && (
        <QRCodeModal
          slug={qrModal.slug}
          name={qrModal.name}
          onClose={() => setQrModal(null)}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {deleteModal && (
        <DeleteConfirmModal
          memorial={deleteModal}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setDeleteModal(null)}
          deleting={deleting}
        />
      )}
    </>
  );
};

export default MyMemorials;