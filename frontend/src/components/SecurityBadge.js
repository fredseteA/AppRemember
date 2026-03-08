import { Lock, ShieldCheck, CreditCard } from 'lucide-react';

/**
 * SecurityBadge
 * @param {'card' | 'minimal' | 'bar'} variant
 */
const SecurityBadge = ({ variant = 'card' }) => {

  // ── variant="card" ── usado no AddressCheckStep
  if (variant === 'card') {
    return (
      <>
        <style>{`
          @keyframes sb-card-in {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .sb-card-root {
            animation: sb-card-in 0.45s cubic-bezier(.22,1,.36,1) both;
          }
          .sb-card-divider {
            width: 1px;
            height: 18px;
            background: rgba(90,168,224,0.25);
            flex-shrink: 0;
          }
        `}</style>
        <div
          className="sb-card-root"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 10,
            padding: '11px 18px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(240,249,255,0.95) 0%, rgba(224,242,254,0.9) 100%)',
            border: '1px solid rgba(90,168,224,0.28)',
            boxShadow: '0 2px 12px rgba(26,39,68,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
            marginTop: 6,
          }}
        >
          {/* Lock icon */}
          <div style={{
            width: 26, height: 26, borderRadius: 8,
            background: 'rgba(21,128,61,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(21,128,61,0.15)',
          }}>
            <Lock size={12} style={{ color: '#15803d' }} />
          </div>

          <span style={{
            fontFamily: '"Georgia", serif',
            fontSize: '0.76rem',
            color: '#374151',
            letterSpacing: '0.01em',
            lineHeight: 1.4,
          }}>
            Você será redirecionado para o pagamento seguro via
          </span>

          <div className="sb-card-divider" />

          {/* Logo MP */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img
              src="/mercadopago-logo.webp"
              alt="Mercado Pago"
              style={{ height: 17, width: 'auto', opacity: 0.85, display: 'block' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback text badge */}
            <div style={{
              display: 'none', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 6,
              background: 'rgba(26,39,68,0.06)',
              border: '1px solid rgba(26,39,68,0.1)',
            }}>
              <CreditCard size={11} style={{ color: '#3a5070' }} />
              <span style={{ fontFamily: '"Georgia", serif', fontSize: '0.72rem', fontWeight: 700, color: '#2a3d5e' }}>
                Mercado Pago
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── variant="minimal" ── usado abaixo de cada botão no SelectPlan / Hero
  if (variant === 'minimal') {
    return (
      <>
        <style>{`
          @keyframes sb-min-in {
            from { opacity: 0; transform: translateY(4px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .sb-minimal-root {
            animation: sb-min-in 0.5s cubic-bezier(.22,1,.36,1) 0.2s both;
          }
        `}</style>
        <div
          className="sb-minimal-root"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.7)',
            boxShadow: '0 1px 8px rgba(26,39,68,0.06)',
          }}
        >
          <Lock size={10} style={{ color: 'rgba(21,128,61,0.7)', flexShrink: 0 }} />

          <span style={{
            fontFamily: '"Georgia", serif',
            fontSize: '0.67rem',
            color: 'rgba(42,61,94,0.65)',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}>
            Pagamento seguro via
          </span>

          {/* Separador ponto */}
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(90,168,224,0.5)', flexShrink: 0 }} />

          <img
            src="/mercadopago-logo.webp"
            alt="Mercado Pago"
            style={{ height: 13, width: 'auto', opacity: 0.7, display: 'block', flexShrink: 0 }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline';
            }}
          />
          <span style={{
            display: 'none',
            fontFamily: '"Georgia", serif',
            fontSize: '0.67rem',
            fontWeight: 700,
            color: 'rgba(42,61,94,0.65)',
            letterSpacing: '0.04em',
          }}>
            Mercado Pago
          </span>
        </div>
      </>
    );
  }

  // ── variant="bar" ── pills de segurança abaixo dos cards de planos
  if (variant === 'bar') {
    return (
      <>
        <style>{`
          @keyframes revealSP {
            from { opacity: 0; transform: translateY(12px); filter: blur(4px); }
            to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
          }
          @keyframes sb-bar-line {
            from { transform: scaleX(0); opacity: 0; }
            to   { transform: scaleX(1); opacity: 1; }
          }
          .sb-bar-root {
            animation: revealSP 0.75s cubic-bezier(.22,1,.36,1) 0.3s both;
          }
          .sb-pill {
            transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s ease, background 0.28s ease;
          }
          .sb-pill:hover {
            transform: translateY(-3px);
            background: rgba(255,255,255,0.78) !important;
            box-shadow: 0 8px 24px rgba(26,39,68,0.12), inset 0 1px 0 rgba(255,255,255,1) !important;
          }
          .sb-bar-sep {
            width: 4px; height: 4px;
            border-radius: 50%;
            background: rgba(90,168,224,0.4);
            flex-shrink: 0;
          }
        `}</style>

        <div
          className="sb-bar-root"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            margin: '28px auto 0',
          }}
        >
          {/* Linha decorativa superior */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 32, height: 1, background: 'linear-gradient(to right, transparent, rgba(90,168,224,0.4))', animation: 'sb-bar-line 0.8s cubic-bezier(.22,1,.36,1) 0.5s both', transformOrigin: 'right' }} />
            <span style={{ fontFamily: '"Georgia", serif', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(42,61,94,0.45)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Compra 100% segura
            </span>
            <div style={{ width: 32, height: 1, background: 'linear-gradient(to left, transparent, rgba(90,168,224,0.4))', animation: 'sb-bar-line 0.8s cubic-bezier(.22,1,.36,1) 0.5s both', transformOrigin: 'left' }} />
          </div>

          {/* Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}>

            {/* Pill — Ambiente seguro */}
            <div
              className="sb-pill"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.82)',
                boxShadow: '0 2px 10px rgba(26,39,68,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                cursor: 'default',
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(21,128,61,0.12)',
                border: '1px solid rgba(21,128,61,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ShieldCheck size={11} style={{ color: '#15803d' }} />
              </div>
              <span style={{
                fontFamily: '"Georgia", serif', fontSize: '0.72rem',
                fontWeight: 600, color: '#2a3d5e',
                letterSpacing: '0.02em', whiteSpace: 'nowrap',
              }}>Ambiente seguro</span>
            </div>

            <div className="sb-bar-sep" />

            {/* Pill — SSL */}
            <div
              className="sb-pill"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.82)',
                boxShadow: '0 2px 10px rgba(26,39,68,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                cursor: 'default',
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(58,80,112,0.08)',
                border: '1px solid rgba(58,80,112,0.13)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Lock size={10} style={{ color: '#3a5070' }} />
              </div>
              <span style={{
                fontFamily: '"Georgia", serif', fontSize: '0.72rem',
                fontWeight: 600, color: '#2a3d5e',
                letterSpacing: '0.02em', whiteSpace: 'nowrap',
              }}>SSL 256-bit</span>
            </div>

            <div className="sb-bar-sep" />

            {/* Pill — Mercado Pago */}
            <div
              className="sb-pill"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.82)',
                boxShadow: '0 2px 10px rgba(26,39,68,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                cursor: 'default',
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(90,168,224,0.12)',
                border: '1px solid rgba(90,168,224,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <CreditCard size={10} style={{ color: '#3a7fb5' }} />
              </div>
              <span style={{
                fontFamily: '"Georgia", serif', fontSize: '0.72rem',
                fontWeight: 600, color: '#2a3d5e',
                letterSpacing: '0.02em', whiteSpace: 'nowrap',
              }}>Pago com</span>
              <div style={{ width: 1, height: 12, background: 'rgba(90,168,224,0.3)', flexShrink: 0 }} />
              <img
                src="/mercadopago-logo.webp"
                alt="Mercado Pago"
                style={{ height: 14, width: 'auto', opacity: 0.8, display: 'block', flexShrink: 0 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline';
                }}
              />
              <span style={{
                display: 'none',
                fontFamily: '"Georgia", serif', fontSize: '0.72rem',
                fontWeight: 700, color: '#2a3d5e',
              }}>Mercado Pago</span>
            </div>

          </div>
        </div>
      </>
    );
  }

  return null;
};

export default SecurityBadge;