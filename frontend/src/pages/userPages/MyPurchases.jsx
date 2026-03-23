import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';
import { API } from '@/config';
import { userPageStyles, pageBackground } from './shared/userPageStyles.js'
import { useTranslation } from 'react-i18next';

const MyPurchases = () => {
  const { token } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation()

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get(`${API}/payments/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPurchases(response.data);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [token]);

  if (loading) {
    return (
      <div
        data-testid="my-purchases-loading"
        style={{
          background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 40%, #eef8fb 100%)',
          minHeight: '100vh',
          paddingTop: 'clamp(100px, 16vw, 160px)',
          paddingBottom: 80,
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 120, borderRadius: 20, marginBottom: 14,
              background: 'rgba(255,255,255,0.4)', animation: 'pulse 1.5s infinite'
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-hidden"
      data-testid="my-purchases-page"
      style={{
        background: pageBackground,
        fontFamily: '"Georgia", serif',
        minHeight: '100vh',
      }}
    >
      <style>{userPageStyles}</style>

      {/* Nuvem esquerda */}
      <div
        className="absolute top-[60px] left-[-50px] w-44 md:w-64 opacity-55 pointer-events-none select-none z-0"
        style={{ animation: 'floatMP1 11s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud1.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* Nuvem direita */}
      <div
        className="absolute top-[80px] right-[-40px] w-36 md:w-56 opacity-40 pointer-events-none select-none z-0 hidden md:block"
        style={{ animation: 'floatMP2 8s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud2.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div
        className="relative z-10"
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '0 20px',
          paddingTop: 'clamp(100px, 16vw, 160px)',
          paddingBottom: 'clamp(60px, 10vw, 120px)',
        }}
      >
        {/* Header */}
        <div style={{ animation: 'revealMP 0.75s cubic-bezier(.22,1,.36,1) both', marginBottom: 'clamp(32px, 6vw, 52px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ height: 1, width: 28, background: 'rgba(42,61,94,0.3)', flexShrink: 0 }} />
            <span style={{
              textTransform: 'uppercase', letterSpacing: '0.22em',
              fontSize: '0.62rem', fontWeight: 700, color: '#2a3d5e',
            }}>
              {t('userPages.myPurchases.eyebrow')}
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
            {t('userPages.myPurchases.title')}
          </h1>
        </div>

        {/* Empty state */}
        {purchases.length === 0 ? (
          <div
            data-testid="no-purchases-message"
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', paddingTop: 80, paddingBottom: 80,
              animation: 'revealMP 0.7s cubic-bezier(.22,1,.36,1) 0.15s both',
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
              <ShoppingCart size={32} style={{ color: '#5aa8e0' }} />
            </div>
            <h2 style={{
              fontFamily: '"Georgia", serif',
              fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
              fontWeight: 700, color: '#1a2744', marginBottom: 10,
            }}>
              {t('userPages.myPurchases.emptyTitle')}
            </h2>
            <p style={{
              fontFamily: '"Georgia", serif',
              fontSize: '0.9rem', color: '#3a5070', lineHeight: 1.7, maxWidth: 300,
            }}>
              {t('userPages.myPurchases.emptyDesc')}
            </p>
          </div>

        ) : (
          <div
            data-testid="purchases-list"
            style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vw, 14px)' }}
          >
            {purchases.map((purchase, index) => {
              const isCancelled = purchase.status === 'cancelled';
              const alreadyRequested = purchase.cancel_requested;

              return (
                <div
                  key={purchase.id}
                  className="mp-row"
                  data-testid={`purchase-card-${purchase.id}`}
                  style={{
                    borderRadius: 20,
                    background: isCancelled
                      ? 'rgba(239,68,68,0.04)'
                      : 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    border: isCancelled
                      ? '1px solid rgba(239,68,68,0.2)'
                      : '1px solid rgba(255,255,255,0.85)',
                    boxShadow: '0 6px 24px rgba(26,39,68,0.07)',
                    padding: 'clamp(18px, 3vw, 26px)',
                    animation: `revealRow 0.55s cubic-bezier(.22,1,.36,1) ${index * 0.07}s both`,
                  }}
                >
                  <div style={{
                    display: 'flex', flexWrap: 'wrap',
                    alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
                  }}>
                    {/* Esquerda — info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      {/* Plano + status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <h3 style={{
                          fontFamily: '"Georgia", serif',
                          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                          fontWeight: 700, color: '#1a2744',
                        }}>
                          {t('userPages.myPurchases.plan')} {purchase.plan_type}
                        </h3>

                        {/* Badge de status */}
                        {(() => {
                          const map = {
                            approved:      { label: 'Aprovado',     bg: 'rgba(34,197,94,0.14)',  color: '#15803d', border: 'rgba(34,197,94,0.3)' },
                            paid:          { label: 'Pago',         bg: 'rgba(34,197,94,0.14)',  color: '#15803d', border: 'rgba(34,197,94,0.3)' },
                            pending:       { label: 'Pendente',     bg: 'rgba(251,191,36,0.15)', color: '#92400e', border: 'rgba(251,191,36,0.35)' },
                            rejected:      { label: 'Rejeitado',    bg: 'rgba(239,68,68,0.12)',  color: '#991b1b', border: 'rgba(239,68,68,0.3)' },
                            in_process:    { label: 'Processando',  bg: 'rgba(90,168,224,0.15)', color: '#1e4d7b', border: 'rgba(90,168,224,0.3)' },
                            in_production: { label: 'Em Produção',  bg: 'rgba(139,92,246,0.12)', color: '#6d28d9', border: 'rgba(139,92,246,0.3)' },
                            produced:      { label: 'Produzido',    bg: 'rgba(59,130,246,0.12)', color: '#1d4ed8', border: 'rgba(59,130,246,0.3)' },
                            shipped:       { label: 'Enviado',      bg: 'rgba(34,197,94,0.12)',  color: '#15803d', border: 'rgba(34,197,94,0.3)' },
                            entregue:      { label: 'Entregue',     bg: 'rgba(16,185,129,0.12)', color: '#065f46', border: 'rgba(16,185,129,0.3)' },
                            cancelled:     { label: 'Cancelado',    bg: 'rgba(239,68,68,0.12)',  color: '#991b1b', border: 'rgba(239,68,68,0.3)' },
                          };
                          const s = map[purchase.status] || { label: purchase.status, bg: 'rgba(90,168,224,0.12)', color: '#2a3d5e', border: 'rgba(90,168,224,0.25)' };
                          return (
                            <span style={{
                              display: 'inline-block', padding: '3px 11px', borderRadius: 999,
                              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
                              textTransform: 'uppercase', fontFamily: '"Georgia", serif',
                              background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                            }}>
                              {s.label}
                            </span>
                          );
                        })()}

                        {/* Badge cancelamento solicitado */}
                        {alreadyRequested && !isCancelled && (
                          <span style={{
                            display: 'inline-block', padding: '3px 11px', borderRadius: 999,
                            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
                            textTransform: 'uppercase', fontFamily: '"Georgia", serif',
                            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.25)',
                          }}>
                            {t('userPages.myPurchases.cancelRequested')} 
                          </span>
                        )}
                      </div>

                      <p style={{
                        fontFamily: '"Georgia", serif',
                        fontSize: '0.78rem', color: 'rgba(58,80,112,0.65)',
                        marginBottom: purchase.mercadopago_payment_id ? 4 : 0,
                      }}>
                        {t('userPages.myPurchases.order')}  #{purchase.id.substring(0, 8)}
                      </p>

                      {purchase.mercadopago_payment_id && (
                        <p style={{
                          fontFamily: '"Georgia", serif',
                          fontSize: '0.72rem', color: 'rgba(58,80,112,0.5)',
                        }}>
                          {t('userPages.myPurchases.mpId')} {purchase.mercadopago_payment_id}
                        </p>
                      )}

                      {isCancelled && (
                        <p style={{
                          fontSize: '0.72rem', color: '#ef4444',
                          fontFamily: '"Georgia", serif', marginTop: 8,
                        }}>
                          {t('userPages.myPurchases.refund')}
                        </p>
                      )}
                    </div>

                    {/* Direita — valor + data */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{
                        fontFamily: '"Georgia", serif',
                        fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                        fontWeight: 700, color: '#1a2744', lineHeight: 1.1, marginBottom: 5,
                      }}>
                        R$ {purchase.amount.toFixed(2).replace('.', ',')}
                      </p>
                      <p style={{
                        fontFamily: '"Georgia", serif',
                        fontSize: '0.72rem', color: 'rgba(58,80,112,0.55)',
                      }}>
                        {new Date(purchase.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPurchases;