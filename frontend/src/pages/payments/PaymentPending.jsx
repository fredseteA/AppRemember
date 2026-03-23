import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config';
import { paymentSharedStyles } from './shared/paymentSharedStyles';
import { useTranslation } from 'react-i18next';

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const paymentId = searchParams.get('payment_id');
  const collectionId = searchParams.get('collection_id');

  useEffect(() => {
    console.log('=== PAGAMENTO PENDENTE ===');
    console.log('Payment ID:', paymentId);
    console.log('Collection ID:', collectionId);

    if (paymentId) {
      axios.post(`${API}/payments/confirm`, {
        payment_id: paymentId,
        mp_payment_id: collectionId || null,
      })
        .then((res) => {
          console.log('✅ Status pendente registrado no backend:', res.data);
        })
        .catch((err) => {
          console.error('❌ Erro ao registrar status pendente:', err);
        });
    }
  }, [paymentId, collectionId]);

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
      }}>
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
      </div>
    </div>
  );
};

export default PaymentPending;