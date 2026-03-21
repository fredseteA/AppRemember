import { Link } from 'react-router-dom';
import SecurityBadge from '../../../components/shared/SecurityBadge';

const PlansSection = () => {

  return (
    <section
        className="relative py-16 md:py-24 overflow-hidden"
        id='plans'
        style={{ background: "linear-gradient(180deg, #eef8fb 0%, #ddf0f7 25%, #c8e8f5 60%, #b8e0f0 100%)", marginTop: 0, borderTop: "none" }}
      >
        <style>{`
          @keyframes floatP1 { 0%,100% { transform: translateY(0) translateX(0); } 45% { transform: translateY(-12px) translateX(7px); } }
          @keyframes floatP2 { 0%,100% { transform: translateY(0) translateX(0); } 55% { transform: translateY(-16px) translateX(-8px); } }
          @keyframes revealPlans { from { opacity: 0; transform: translateY(32px); filter: blur(6px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
          .plan-card { transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease; }
          .plan-card:hover { transform: translateY(-6px) scale(1.015); }
          .plan-card-popular:hover { transform: translateY(-8px) scale(1.02); }
          .plan-check-dot { width: 6px; height: 6px; border-radius: 50%; background: #5aa8e0; flex-shrink: 0; margin-right: 10px; margin-top: 5px; }

          /* ── MOBILE ── */
          @media (max-width: 767px) {
            /* Grid: badge externo + 2 cards */
            .plans-grid {
              grid-template-columns: 1fr 1fr !important;
              grid-template-rows: auto 1fr !important;
              gap: 0 10px !important;
              align-items: start !important;
            }
            /* Card digital: linha 2, coluna 1 */
            .plan-card-digital  { grid-column: 1; grid-row: 2; }
            /* Badge externo: linha 1, coluna 2 */
            .plan-badge-external {
              display: flex !important;
              grid-column: 2; grid-row: 1;
              justify-content: center;
              margin-bottom: 6px;
            }
            /* Card popular: linha 2, coluna 2 */
            .plan-card-popular  { grid-column: 2; grid-row: 2; }

            /* Padding interno menor */
            .plan-card-inner {
              padding: 13px 11px !important;
            }
            /* Título menor */
            .plan-title {
              font-size: 0.77rem !important;
              font-weight: 700 !important;
              margin-bottom: 6px !important;
              line-height: 1.25 !important;
            }
            /* Preço menor */
            .plan-price {
              font-size: 1.15rem !important;
              margin-bottom: 6px !important;
            }
            /* Subtítulo oculto */
            .plan-subtitle { display: none !important; }
            /* Lista mais compacta */
            .plan-list {
              gap: 5px !important;
              margin-bottom: 12px !important;
            }
            .plan-list li { font-size: 0.7rem !important; }
            .plan-check-dot {
              width: 5px !important; height: 5px !important;
              margin-right: 6px !important; margin-top: 4px !important;
            }
            /* Botão menor */
            .plan-btn {
              padding: 8px 0 !important;
              font-size: 0.67rem !important;
              letter-spacing: 0.03em !important;
            }
            /* Badge dentro dos cards: oculto */
            .plan-badge-inner { display: none !important; }
            /* Badge absoluto dentro do card: oculto (substituído pelo externo) */
            .plan-popular-badge { display: none !important; }
            /* Spacer: desnecessário agora */
            .plan-popular-spacer { display: none !important; }
            /* SecurityBadge bar abaixo */
            .plan-security-bar { margin-top: 14px !important; }
          }
        `}</style>

        <div className="plans-cloud-left absolute top-[-10px] left-[-50px] w-52 md:w-64 opacity-85 pointer-events-none select-none" style={{ animation: "floatP1 10s ease-in-out infinite" }}>
          <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div className="plans-cloud-right absolute bottom-[10%] right-[-40px] w-44 md:w-56 opacity-75 pointer-events-none select-none hidden md:block" style={{ animation: "floatP2 12s ease-in-out infinite" }}>
          <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12" style={{ animation: "revealPlans 0.8s cubic-bezier(.22,1,.36,1) both" }}>
          <div className="text-center mb-10 md:mb-14">
            <p style={{ textTransform: "uppercase", letterSpacing: "0.22em", fontSize: "0.68rem", fontWeight: 700, color: "#2a3d5e", marginBottom: "12px" }}>Planos</p>
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.3rem, 5vw, 2.6rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.2, marginBottom: "12px" }}>Escolha seu Plano</h2>
            <p style={{ color: "#3a5070", fontSize: "clamp(0.85rem, 3vw, 1rem)", lineHeight: 1.65, maxWidth: "380px", margin: "0 auto" }}>Duas opções para eternizar a memória de quem você ama</p>
          </div>

          <div className="plans-grid grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-3xl mx-auto">

            {/* Plano Digital */}
            <div className="plan-card plan-card-digital" style={{ borderRadius: "22px", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 10px 36px rgba(26,39,68,0.09), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
              <div className="plan-card-inner" style={{ padding: "clamp(22px, 3vw, 32px)" }}>
                <h3 className="plan-title" style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1rem, 4vw, 1.35rem)", fontWeight: 700, color: "#1a2744", marginBottom: "10px" }}>Plano Digital</h3>
                <div className="plan-price" style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.8rem, 7vw, 2.8rem)", fontWeight: 700, color: "#5aa8e0", lineHeight: 1, marginBottom: "6px" }}>R$ 29,90</div>
                <p className="plan-subtitle" style={{ color: "#3a5070", fontSize: "clamp(0.8rem, 3vw, 0.82rem)", marginBottom: "18px", lineHeight: 1.5 }}>Memorial digital publicado na plataforma</p>
                <ul className="plan-list" style={{ marginBottom: "22px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {["Memorial digital completo","Galeria de até 10 fotos","Áudio de homenagem","QR Code digital"].map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", color: "#3a5070", fontSize: "clamp(0.8rem, 3vw, 0.85rem)", lineHeight: 1.5 }}>
                      <span className="plan-check-dot" />{item}
                    </li>
                  ))}
                </ul>
                <Link to="/create-memorial">
                  <button
                    className="plan-btn"
                    style={{ width: "100%", borderRadius: "999px", padding: "11px 0", background: "transparent", border: "1.5px solid #1a2744", color: "#1a2744", fontFamily: '"Georgia", serif', fontSize: "clamp(0.78rem, 3vw, 0.82rem)", fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", transition: "all 0.28s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#1a2744"; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1a2744"; }}
                  >ESCOLHER PLANO</button>
                </Link>
                <div className="plan-badge-inner" style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
                  <SecurityBadge variant="minimal" />
                </div>
              </div>
            </div>

            {/* Badge externo — visível só no mobile via CSS, fica na row 1 col 2 da grid */}
            <div className="plan-badge-external" style={{ display: 'none' }}>
              <span style={{ background: "linear-gradient(135deg, #f5c842, #f0a800)", color: "#1a2744", fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.1em", padding: "4px 10px", borderRadius: "999px", textTransform: "uppercase", boxShadow: "0 2px 8px rgba(245,200,66,0.35)", whiteSpace: 'nowrap' }}>
                Mais Popular
              </span>
            </div>

            {/* Plano Placa */}
            <div className="plan-card plan-card-popular" style={{ borderRadius: "22px", background: "rgba(26,39,68,0.88)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(90,168,224,0.35)", boxShadow: "0 16px 48px rgba(26,39,68,0.22), inset 0 1px 0 rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}>
              <div className="plan-card-inner" style={{ padding: "clamp(22px, 3vw, 32px)" }}>
                {/* Badge absoluto no desktop, espaçador no mobile via CSS */}
                <div className="plan-popular-badge" style={{ position: "absolute", top: "16px", right: "16px", background: "linear-gradient(135deg, #f5c842, #f0a800)", color: "#1a2744", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", padding: "4px 12px", borderRadius: "999px", textTransform: "uppercase", boxShadow: "0 2px 8px rgba(245,200,66,0.4)" }}>Mais Popular</div>
                <div className="plan-popular-spacer" />
                <h3 className="plan-title" style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1rem, 4vw, 1.35rem)", fontWeight: 700, color: "white", marginBottom: "10px" }}>Plano Placa QR Code</h3>
                <div className="plan-price" style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.8rem, 7vw, 2.8rem)", fontWeight: 700, color: "#7bbde8", lineHeight: 1, marginBottom: "6px" }}>R$ 149,90</div>
                <p className="plan-subtitle" style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(0.8rem, 3vw, 0.82rem)", marginBottom: "18px", lineHeight: 1.5 }}>Memorial + Placa física de aço inox</p>
                <ul className="plan-list" style={{ marginBottom: "22px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {["Tudo do Plano Digital","Placa física em aço inox","QR Code gravado permanente","Envio para todo Brasil"].map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", color: "rgba(255,255,255,0.8)", fontSize: "clamp(0.8rem, 3vw, 0.85rem)", lineHeight: 1.5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7bbde8", flexShrink: 0, marginRight: 10, marginTop: 5 }} />{item}
                    </li>
                  ))}
                </ul>
                <Link to="/create-memorial">
                  <button
                    className="plan-btn"
                    style={{ width: "100%", borderRadius: "999px", padding: "11px 0", background: "#5aa8e0", border: "none", color: "white", fontFamily: '"Georgia", serif', fontSize: "clamp(0.78rem, 3vw, 0.82rem)", fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", transition: "all 0.28s ease", boxShadow: "0 4px 16px rgba(90,168,224,0.4)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#7bbde8"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(90,168,224,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#5aa8e0"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(90,168,224,0.4)"; }}
                  >ESCOLHER PLANO</button>
                </Link>
                <div className="plan-badge-inner" style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '6px 14px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(123,189,232,0.8)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span style={{ fontFamily: '"Georgia", serif', fontSize: '0.67rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                      Pagamento seguro via
                    </span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(123,189,232,0.4)', flexShrink: 0 }} />
                    <img
                      src="/mercadopago-logo.webp"
                      alt="Mercado Pago"
                      style={{ height: 13, width: 'auto', opacity: 0.55, display: 'block', flexShrink: 0, filter: 'brightness(0) invert(1)' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline';
                      }}
                    />
                    <span style={{ display: 'none', fontFamily: '"Georgia", serif', fontSize: '0.67rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                      Mercado Pago
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SecurityBadge bar abaixo dos dois cards */}
        <div className="plan-security-bar" style={{ maxWidth: 820, margin: '32px auto 0', padding: '0 20px' }}>
          <SecurityBadge variant="bar" />
        </div>
      </section>
  );
}

export default PlansSection;