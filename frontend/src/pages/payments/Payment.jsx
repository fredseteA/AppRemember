import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { CheckCircle2} from 'lucide-react';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const { qrCode, qrCodeBase64, amount } = location.state || {};
  const payStyles = `
          @keyframes floatPay1 {
            0%,100% { transform: translateY(0) translateX(0); }
            45%     { transform: translateY(-14px) translateX(8px); }
          }
          @keyframes floatPay2 {
            0%,100% { transform: translateY(0) translateX(0); }
            55%     { transform: translateY(-9px) translateX(-6px); }
          }
          @keyframes successPop {
            0%   { opacity: 0; transform: scale(0.85) translateY(20px); }
            60%  { transform: scale(1.03) translateY(-4px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .pay-btn-primary {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            padding: 13px 28px; border-radius: 999px; background: #1a2744; color: white;
            font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 700;
            letter-spacing: 0.06em; border: none; cursor: pointer;
            transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
            box-shadow: 0 6px 20px rgba(26,39,68,0.18); min-height: 48px;
            -webkit-tap-highlight-color: transparent;
          }
          .pay-btn-primary:hover { background: #2a3d5e; transform: translateY(-2px); }
          .pay-btn-outline {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            padding: 13px 28px; border-radius: 999px; background: transparent; color: #2a3d5e;
            font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 700;
            letter-spacing: 0.06em; border: 1.5px solid rgba(26,39,68,0.18); cursor: pointer;
            transition: all 0.25s ease; min-height: 48px;
            -webkit-tap-highlight-color: transparent;
          }
          .pay-btn-outline:hover { border-color: rgba(90,168,224,0.5); background: rgba(90,168,224,0.06); color: #1a2744; }
          @media (max-width: 480px) {
            .pay-success-btns { flex-direction: column !important; }
            .pay-btn-primary, .pay-btn-outline { width: 100%; }
          }
        `;

  useEffect(() => {
    const timer = setTimeout(() => {
      setPaymentStatus('approved');
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (paymentStatus === 'approved') {
    return (
      <div
        data-testid="payment-success-page"
        style={{
          background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 35%, #eef8fb 70%, #eef8fb 100%)',
          fontFamily: '"Georgia", serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(100px, 16vw, 160px) 20px clamp(60px, 10vw, 120px)',
        }}
      >
        <style>{payStyles}</style>

        {/* Nuvem esquerda */}
        <div className="absolute top-[60px] left-[-50px] w-44 md:w-64 opacity-50 pointer-events-none select-none z-0"
          style={{ animation: 'floatPay1 11s ease-in-out infinite' }}>
          <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div className="absolute top-[80px] right-[-40px] w-36 md:w-56 opacity-35 pointer-events-none select-none z-0 hidden md:block"
          style={{ animation: 'floatPay2 8s ease-in-out infinite' }}>
          <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div
          className="relative z-10"
          style={{
            width: '100%', maxWidth: 520,
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.9)',
            borderRadius: 28,
            boxShadow: '0 20px 60px rgba(26,39,68,0.1)',
            padding: 'clamp(36px, 6vw, 56px)',
            textAlign: 'center',
            animation: 'successPop 0.7s cubic-bezier(.22,1,.36,1) both',
          }}
        >
          {/* Ícone de sucesso */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(34,197,94,0.12)',
            border: '2px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}>
            <CheckCircle2 size={38} style={{ color: '#15803d' }} />
          </div>

          <h1
            data-testid="success-title"
            style={{
              fontFamily: '"Georgia", serif',
              fontSize: 'clamp(1.7rem, 5vw, 2.4rem)',
              fontWeight: 700, color: '#1a2744', lineHeight: 1.15, marginBottom: 14,
            }}
          >
            Pagamento Aprovado!
          </h1>
          <p style={{
            fontFamily: '"Georgia", serif',
            fontSize: '0.95rem', color: '#3a5070', lineHeight: 1.7,
            marginBottom: 36, maxWidth: 340, margin: '0 auto 36px',
          }}>
            Seu memorial foi publicado com sucesso e já está disponível.
          </p>

          <div className="pay-success-btns" style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="pay-btn-primary" onClick={() => navigate('/my-memorials')} data-testid="button-view-memorials">
              Ver Meus Memoriais
            </button>
            <button className="pay-btn-outline" onClick={() => navigate('/')} data-testid="button-home">
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-hidden"
      data-testid="payment-page"
      style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 35%, #eef8fb 70%, #eef8fb 100%)',
        fontFamily: '"Georgia", serif',
        minHeight: '100vh',
        paddingTop: 'clamp(100px, 16vw, 160px)',
        paddingBottom: 'clamp(60px, 10vw, 120px)',
      }}
    >
      <style>{payStyles}</style>

      {/* Nuvem esquerda */}
      <div className="fixed top-[60px] left-[-50px] w-44 md:w-64 opacity-50 pointer-events-none select-none z-0"
        style={{ animation: 'floatPay1 11s ease-in-out infinite' }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="fixed top-[80px] right-[-40px] w-36 md:w-56 opacity-35 pointer-events-none select-none z-0 hidden md:block"
        style={{ animation: 'floatPay2 8s ease-in-out infinite' }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div
        className="relative z-10"
        style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px' }}
      >

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28, animation: 'revealPay 0.7s cubic-bezier(.22,1,.36,1) both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ height: 1, width: 28, background: 'rgba(42,61,94,0.3)' }} />
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '0.62rem', fontWeight: 700, color: '#2a3d5e' }}>
              Pagamento
            </span>
            <div style={{ height: 1, width: 28, background: 'rgba(42,61,94,0.3)' }} />
          </div>
          <h1
            data-testid="payment-title"
            style={{
              fontFamily: '"Georgia", serif',
              fontSize: 'clamp(1.7rem, 5vw, 2.6rem)',
              fontWeight: 700, color: '#1a2744', lineHeight: 1.1, marginBottom: 10,
            }}
          >
            Finalize seu Pagamento
          </h1>
          <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.95rem', color: '#3a5070', lineHeight: 1.6 }}>
            Escaneie o QR Code do Pix para pagar
          </p>
        </div>

        {/* Card principal */}
        <div style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.9)',
          borderRadius: 28,
          boxShadow: '0 16px 56px rgba(26,39,68,0.09)',
          overflow: 'hidden',
          animation: 'revealPay 0.7s cubic-bezier(.22,1,.36,1) 0.1s both',
        }}>

          {/* QR Code */}
          <div style={{
            padding: 'clamp(28px, 5vw, 40px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottom: '1px solid rgba(26,39,68,0.07)',
          }}>
            <div style={{
              background: 'white',
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 4px 24px rgba(26,39,68,0.08)',
              border: '1px solid rgba(26,39,68,0.06)',
            }}>
              {qrCodeBase64 ? (
                <img
                  src={`data:image/png;base64,${qrCodeBase64}`}
                  alt="QR Code PIX"
                  data-testid="qr-code-image"
                  style={{ maxWidth: 220, display: 'block' }}
                />
              ) : qrCode ? (
                <QRCode value={qrCode} size={220} data-testid="qr-code" />
              ) : (
                <div style={{
                  width: 220, height: 220, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(58,80,112,0.4)', fontSize: '0.85rem',
                  fontFamily: '"Georgia", serif',
                }}>
                  QR Code não disponível
                </div>
              )}
            </div>
          </div>

          {/* Valor + status */}
          <div style={{
            padding: 'clamp(20px, 4vw, 28px)',
            textAlign: 'center',
            borderBottom: '1px solid rgba(26,39,68,0.07)',
          }}>
            <p style={{
              fontFamily: '"Georgia", serif',
              fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
              fontWeight: 700, color: '#1a2744', lineHeight: 1.1, marginBottom: 12,
            }}>
              R$ {amount ? amount.toFixed(2).replace('.', ',') : '0,00'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#5aa8e0',
                animation: 'pulseDot 1.4s ease-in-out infinite',
                flexShrink: 0,
              }} />
              <span style={{ fontFamily: '"Georgia", serif', fontSize: '0.82rem', color: '#3a5070' }}>
                Aguardando confirmação do pagamento...
              </span>
            </div>
          </div>

          {/* Instruções */}
          <div style={{ padding: 'clamp(20px, 4vw, 28px)' }}>
            <p style={{
              fontFamily: '"Georgia", serif',
              fontSize: '0.68rem', fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#2a3d5e', marginBottom: 14,
            }}>
              Instruções
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Abra o aplicativo do seu banco',
                'Escolha a opção Pix',
                'Escaneie o QR Code acima',
                'Confirme o pagamento',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(90,168,224,0.12)',
                    border: '1px solid rgba(90,168,224,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: '"Georgia", serif', fontSize: '0.72rem', fontWeight: 700,
                    color: '#5aa8e0',
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontFamily: '"Georgia", serif', fontSize: '0.85rem', color: '#3a5070', lineHeight: 1.5 }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;