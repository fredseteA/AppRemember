import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config';
import { useAuth } from '../../contexts/AuthContext';
import { paymentSharedStyles } from './shared/paymentSharedStyles';
import { useTranslation } from 'react-i18next';

const POLL_INTERVAL = 4000;        // verifica a cada 4 segundos
const POLL_TIMEOUT  = 10 * 60 * 1000; // para após 10 minutos

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const navigate     = useNavigate();
  const { t }        = useTranslation();
  const { getToken } = useAuth();

  const paymentId    = searchParams.get('payment_id');
  const collectionId = searchParams.get('collection_id');

  const [approved, setApproved] = useState(false);
  const intervalRef = useRef(null);
  const startedAt   = useRef(Date.now());

  // ── Polling: verifica status até aprovação ou timeout ──────────────────
  useEffect(() => {
    if (!paymentId) return;

    const poll = async () => {
      // Para de tentar após 10 minutos
      if (Date.now() - startedAt.current > POLL_TIMEOUT) {
        clearInterval(intervalRef.current);
        return;
      }
      try {
        const res = await axios.get(`${API}/payments/${paymentId}/status`);
        if (res.data?.status === 'approved') {
          clearInterval(intervalRef.current);
          setApproved(true);
          // Pequena pausa para o usuário ver o feedback antes de redirecionar
          setTimeout(() => {
            navigate(`/payment/success?payment_id=${paymentId}`, { replace: true });
          }, 1800);
        }
      } catch (err) {
        // Silencia erros de rede — continua tentando
        console.warn('Polling status:', err?.response?.status);
      }
    };

    // Primeira checagem imediata (webhook pode já ter processado)
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [paymentId]);

  return (
    <div
      data-testid="payment-pending-page"
      style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 35%, #eef8fb 70%, #eef8fb 100%)',
        fontFamily: '"Georgia", serif',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(100px, 16vw, 160px) 20px clamp(60px, 10vw, 120px)',
      }}
    >
      <style>{paymentSharedStyles}</style>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ps-approved-in {
          from { opacity:0; transform:scale(0.8); }
          to   { opacity:1; transform:scale(1); }
        }
        .poll-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #d97706;
          animation: poll-bounce 1.2s ease-in-out infinite;
        }
        .poll-dot:nth-child(2) { animation-delay: 0.2s; }
        .poll-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes poll-bounce {
          0%,100% { opacity: 0.3; transform: translateY(0); }
          50%      { opacity: 1;   transform: translateY(-5px); }
        }
      `}</style>

      {/* Clouds */}
      <div className="absolute top-[-10px] left-[-50px] w-44 md:w-64 opacity-55 pointer-events-none select-none"
        style={{ animation: 'floatPR1 11s ease-in-out infinite' }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="absolute top-[5%] right-[-40px] w-36 md:w-56 opacity-40 pointer-events-none select-none hidden md:block"
        style={{ animation: 'floatPR2 8s ease-in-out infinite' }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="relative z-10" style={{
        width: '100%', maxWidth: 480, textAlign: 'center',
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.9)',
        borderRadius: 28, boxShadow: '0 20px 60px rgba(26,39,68,0.1)',
        padding: 'clamp(36px, 6vw, 56px)',
        animation: 'popIn 0.7s cubic-bezier(.22,1,.36,1) both',
        transition: 'all 0.4s ease',
      }}>

        {/* ── Estado: Aprovado ── */}
        {approved ? (
          <div style={{ animation: 'ps-approved-in 0.5s cubic-bezier(.22,1,.36,1) both' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 28px',
              background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle2 size={40} style={{ color: '#16a34a' }} />
            </div>
            <h1 style={{
              fontFamily: '"Georgia", serif', fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
              fontWeight: 700, color: '#15803d', lineHeight: 1.15, marginBottom: 12,
            }}>
              Pagamento Aprovado!
            </h1>
            <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.95rem', color: '#3a5070', lineHeight: 1.7 }}>
              Redirecionando para o seu memorial...
            </p>
          </div>

        ) : (
          /* ── Estado: Aguardando ── */
          <>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 28px',
              background: 'rgba(251,191,36,0.12)', border: '2px solid rgba(251,191,36,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Clock size={38} style={{ color: '#d97706' }} />
            </div>

            <h1 data-testid="pending-title" style={{
              fontFamily: '"Georgia", serif', fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
              fontWeight: 700, color: '#1a2744', lineHeight: 1.15, marginBottom: 14,
            }}>
              {t('paymentPending.title')}
            </h1>

            <p style={{
              fontFamily: '"Georgia", serif', fontSize: '0.95rem', color: '#3a5070',
              lineHeight: 1.7, maxWidth: 340, margin: '0 auto 24px',
            }}>
              {t('paymentPending.description')}
            </p>

            {/* Indicador de polling */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, marginBottom: 24,
            }}>
              <span style={{ fontFamily: '"Georgia", serif', fontSize: '0.78rem', color: '#92400e' }}>
                Verificando pagamento
              </span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <div className="poll-dot" />
                <div className="poll-dot" />
                <div className="poll-dot" />
              </div>
            </div>

            <div style={{
              borderRadius: 16, padding: '14px 18px', marginBottom: 32,
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
              display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: '#d97706',
                flexShrink: 0, marginTop: 7,
              }} />
              <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.82rem', color: '#92400e', lineHeight: 1.6, margin: 0 }}>
                {t('paymentPending.notice')}
              </p>
            </div>

            <div className="pr-btns" style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="pr-btn-primary" onClick={() => navigate('/my-memorials')} data-testid="button-view-memorials">
                {t('paymentPending.btnMemorials')}
              </button>
              <button className="pr-btn-outline" onClick={() => navigate('/')} data-testid="button-home">
                {t('paymentPending.btnHome')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentPending;