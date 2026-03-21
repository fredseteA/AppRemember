import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config';
import { paymentSharedStyles } from './shared/paymentSharedStyles';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');           
  const collectionId = searchParams.get('collection_id');     
  const collectionStatus = searchParams.get('collection_status');

  useEffect(() => {
    console.log('=== PAGAMENTO APROVADO ===');
    console.log('Payment ID (external_reference):', paymentId);
    console.log('Collection ID (MP):', collectionId);
    console.log('Status:', collectionStatus);

    // Chama o backend para confirmar e publicar o memorial
    if (paymentId) {
      axios.post(`${API}/payments/confirm`, {
        payment_id: paymentId,
        mp_payment_id: collectionId || null,
      })
        .then((res) => {
          console.log('✅ Confirmação enviada ao backend:', res.data);
        })
        .catch((err) => {
          console.error('❌ Erro ao confirmar pagamento:', err);
        });
    }
  }, [paymentId, collectionId, collectionStatus]);

  return (
    <div
      data-testid="payment-success-page"
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
          background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle2 size={38} style={{ color: '#15803d' }} />
        </div>
        <h1 data-testid="success-title" style={{
          fontFamily: '"Georgia", serif', fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
          fontWeight: 700, color: '#1a2744', lineHeight: 1.15, marginBottom: 14,
        }}>
          Pagamento Aprovado!
        </h1>
        <p style={{
          fontFamily: '"Georgia", serif', fontSize: '0.95rem', color: '#3a5070',
          lineHeight: 1.7, maxWidth: 320, margin: '0 auto 20px',
        }}>
          Seu memorial foi publicado com sucesso e já está disponível.
        </p>
        {collectionId && (
          <p style={{
            fontFamily: '"Georgia", serif', fontSize: '0.72rem',
            color: 'rgba(58,80,112,0.5)', marginBottom: 28, letterSpacing: '0.05em',
          }}>
            ID do Pagamento: {collectionId}
          </p>
        )}
        <div className="pr-btns" style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="pr-btn-primary" onClick={() => navigate('/my-memorials')} data-testid="button-view-memorials">
            Ver Meus Memoriais
          </button>
          <button className="pr-btn-outline" onClick={() => navigate('/')} data-testid="button-home">
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;