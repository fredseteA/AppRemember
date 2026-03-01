import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');
  const collectionId = searchParams.get('collection_id');

  const sharedStyles = `
    @keyframes floatPR1 {
      0%,100% { transform: translateY(0) translateX(0); }
      45%     { transform: translateY(-14px) translateX(8px); }
    }
    @keyframes floatPR2 {
      0%,100% { transform: translateY(0) translateX(0); }
      55%     { transform: translateY(-9px) translateX(-6px); }
    }
    @keyframes popIn {
      0%   { opacity: 0; transform: scale(0.88) translateY(24px); }
      60%  { transform: scale(1.02) translateY(-4px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .pr-btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 14px 28px; border-radius: 999px; background: #1a2744; color: white;
      font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 700;
      letter-spacing: 0.06em; border: none; cursor: pointer;
      transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
      box-shadow: 0 6px 20px rgba(26,39,68,0.18); min-height: 48px;
      -webkit-tap-highlight-color: transparent;
    }
    .pr-btn-primary:hover { background: #2a3d5e; transform: translateY(-2px); }
    .pr-btn-outline {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 14px 28px; border-radius: 999px; background: transparent; color: #2a3d5e;
      font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 700;
      letter-spacing: 0.06em; border: 1.5px solid rgba(26,39,68,0.18); cursor: pointer;
      transition: all 0.25s ease; min-height: 48px;
      -webkit-tap-highlight-color: transparent;
    }
    .pr-btn-outline:hover { border-color: rgba(90,168,224,0.5); background: rgba(90,168,224,0.06); color: #1a2744; }
    @media (max-width: 480px) {
      .pr-btns { flex-direction: column !important; }
      .pr-btn-primary, .pr-btn-outline { width: 100%; }
    }
  `;

  useEffect(() => {
    console.log('=== PAGAMENTO FALHOU ===');
    console.log('Payment ID:', paymentId);
    console.log('Collection ID:', collectionId);

    // Registra o status de falha no backend
    if (paymentId) {
      axios.post(`${API}/payments/confirm`, {
        payment_id: paymentId,
        mp_payment_id: collectionId || null,
      })
        .then((res) => {
          console.log('✅ Status de falha registrado no backend:', res.data);
        })
        .catch((err) => {
          console.error('❌ Erro ao registrar falha:', err);
        });
    }
  }, [paymentId, collectionId]);

  return (
    <div
      data-testid="payment-failure-page"
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
      <style>{sharedStyles}</style>

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
          background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <XCircle size={38} style={{ color: '#dc2626' }} />
        </div>
        <h1 data-testid="failure-title" style={{
          fontFamily: '"Georgia", serif', fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
          fontWeight: 700, color: '#1a2744', lineHeight: 1.15, marginBottom: 14,
        }}>
          Pagamento Não Realizado
        </h1>
        <p style={{
          fontFamily: '"Georgia", serif', fontSize: '0.95rem', color: '#3a5070',
          lineHeight: 1.7, maxWidth: 320, margin: '0 auto 32px',
        }}>
          O pagamento não foi concluído. Você pode tentar novamente.
        </p>
        <div className="pr-btns" style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="pr-btn-primary" onClick={() => navigate('/my-memorials')} data-testid="button-try-again">
            Tentar Novamente
          </button>
          <button className="pr-btn-outline" onClick={() => navigate('/')} data-testid="button-home">
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;