import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ShoppingCart, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Quantos dias o cliente tem para solicitar cancelamento
const CANCEL_WINDOW_DAYS = 7;

const canRequestCancel = (createdAt, status) => {
  if (['cancelled', 'entregue', 'shipped'].includes(status)) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffDays <= CANCEL_WINDOW_DAYS;
};

const daysRemaining = (createdAt) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(CANCEL_WINDOW_DAYS - diffDays));
};

// ─── Modal de confirmação de cancelamento ────────────────────────────────────
const CancelRequestModal = ({ purchase, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    style={{ fontFamily: '"Georgia", serif' }}>
    <div style={{
      background: 'rgba(255,255,255,0.97)',
      borderRadius: 20,
      padding: 'clamp(24px,4vw,36px)',
      maxWidth: 440,
      width: '90%',
      boxShadow: '0 24px 64px rgba(26,39,68,0.18)',
      border: '1px solid rgba(239,68,68,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <XCircle size={24} color="#ef4444" />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a2744' }}>
          Solicitar Cancelamento
        </h3>
      </div>
      <p style={{ fontSize: '0.88rem', color: '#3a5070', lineHeight: 1.7, marginBottom: 8 }}>
        Você está solicitando o cancelamento do pedido{' '}
        <strong>#{purchase.id.substring(0, 8)}</strong> — Plano {purchase.plan_type}.
      </p>
      <p style={{ fontSize: '0.88rem', color: '#3a5070', lineHeight: 1.7, marginBottom: 20 }}>
        Após a confirmação pelo administrador, o reembolso de{' '}
        <strong>R$ {purchase.amount.toFixed(2).replace('.', ',')}</strong> será
        processado em até <strong>7 dias úteis</strong>.
      </p>
      <div style={{
        background: 'rgba(251,191,36,0.1)',
        border: '1px solid rgba(251,191,36,0.3)',
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 24,
        fontSize: '0.78rem',
        color: '#92400e',
      }}>
        ⚠️ Seu memorial será removido após a confirmação do cancelamento.
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1, padding: '11px 0', borderRadius: 999,
            background: 'transparent', border: '1.5px solid rgba(26,39,68,0.18)',
            color: '#2a3d5e', fontFamily: '"Georgia", serif',
            fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Voltar
        </button>
        <button
          onClick={() => { onConfirm(purchase.id); onClose(); }}
          style={{
            flex: 1, padding: '11px 0', borderRadius: 999,
            background: '#ef4444', border: 'none',
            color: 'white', fontFamily: '"Georgia", serif',
            fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Confirmar Solicitação
        </button>
      </div>
    </div>
  </div>
);

const MyPurchases = () => {
  const { token } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null); // purchase object

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

  const handleRequestCancel = async (paymentId) => {
    try {
      await axios.post(
        `${API}/payments/${paymentId}/request-cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPurchases(prev => prev.map(p =>
        p.id === paymentId ? { ...p, cancel_requested: true } : p
      ));
      toast.success('Solicitação enviada! Você receberá um email de confirmação.');
    } catch (error) {
      const msg = error.response?.data?.detail || 'Erro ao solicitar cancelamento.';
      toast.error(msg);
    }
  };

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
        background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 35%, #eef8fb 70%, #eef8fb 100%)',
        fontFamily: '"Georgia", serif',
        minHeight: '100vh',
      }}
    >
      <style>{`
        @keyframes floatMP1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-14px) translateX(8px); }
        }
        @keyframes floatMP2 {
          0%,100% { transform: translateY(0) translateX(0); }
          55%     { transform: translateY(-9px) translateX(-6px); }
        }
        @keyframes revealMP {
          from { opacity: 0; transform: translateY(24px); filter: blur(5px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes revealRow {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mp-row {
          transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease;
        }
        .mp-row:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(26,39,68,0.11) !important;
        }
        .mp-cancel-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 999px;
          background: rgba(239,68,68,0.08);
          border: 1.5px solid rgba(239,68,68,0.25);
          color: #ef4444;
          font-family: "Georgia", serif;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .mp-cancel-btn:hover {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.4);
        }
      `}</style>

      {/* Modal */}
      {cancelModal && (
        <CancelRequestModal
          purchase={cancelModal}
          onConfirm={handleRequestCancel}
          onClose={() => setCancelModal(null)}
        />
      )}

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
              Painel do usuário
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
            Minhas Compras
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
              Nenhuma compra ainda
            </h2>
            <p style={{
              fontFamily: '"Georgia", serif',
              fontSize: '0.9rem', color: '#3a5070', lineHeight: 1.7, maxWidth: 300,
            }}>
              Você ainda não realizou nenhuma compra
            </p>
          </div>

        ) : (
          <div
            data-testid="purchases-list"
            style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vw, 14px)' }}
          >
            {purchases.map((purchase, index) => {
              const showCancel = canRequestCancel(purchase.created_at, purchase.status);
              const days = daysRemaining(purchase.created_at);
              const alreadyRequested = purchase.cancel_requested;
              const isCancelled = purchase.status === 'cancelled';

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
                          Plano {purchase.plan_type}
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

                        {/* Badge de cancelamento solicitado */}
                        {alreadyRequested && !isCancelled && (
                          <span style={{
                            display: 'inline-block', padding: '3px 11px', borderRadius: 999,
                            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
                            textTransform: 'uppercase', fontFamily: '"Georgia", serif',
                            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.25)',
                          }}>
                            Cancelamento Solicitado
                          </span>
                        )}
                      </div>

                      <p style={{
                        fontFamily: '"Georgia", serif',
                        fontSize: '0.78rem', color: 'rgba(58,80,112,0.65)',
                        marginBottom: purchase.mercadopago_payment_id ? 4 : 0,
                      }}>
                        Pedido #{purchase.id.substring(0, 8)}
                      </p>

                      {purchase.mercadopago_payment_id && (
                        <p style={{
                          fontFamily: '"Georgia", serif',
                          fontSize: '0.72rem', color: 'rgba(58,80,112,0.5)',
                        }}>
                          ID Mercado Pago: {purchase.mercadopago_payment_id}
                        </p>
                      )}

                      {/* Botão cancelar ou aviso */}
                      {!isCancelled && !alreadyRequested && (
                        <div style={{ marginTop: 12 }}>
                          {showCancel ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              <button
                                className="mp-cancel-btn"
                                onClick={() => setCancelModal(purchase)}
                              >
                                <XCircle size={13} />
                                Solicitar Cancelamento
                              </button>
                              <span style={{
                                fontSize: '0.68rem', color: 'rgba(58,80,112,0.5)',
                                fontFamily: '"Georgia", serif',
                              }}>
                                {days === 1 ? 'Último dia' : `${days} dias restantes`}
                              </span>
                            </div>
                          ) : (
                            <p style={{
                              fontSize: '0.7rem', color: 'rgba(58,80,112,0.45)',
                              fontFamily: '"Georgia", serif', marginTop: 4,
                            }}>
                              Prazo de cancelamento encerrado
                            </p>
                          )}
                        </div>
                      )}

                      {isCancelled && (
                        <p style={{
                          fontSize: '0.72rem', color: '#ef4444',
                          fontFamily: '"Georgia", serif', marginTop: 8,
                        }}>
                          Reembolso em até 7 dias úteis
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