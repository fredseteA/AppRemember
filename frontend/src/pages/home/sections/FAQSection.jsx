import { useState } from 'react';


const FAQSection = () => {
const faqs = [
    {
      q: "Como funciona o QR Code?",
      a: "O QR Code é gravado em uma placa de aço inox durável. Quando escaneado com um smartphone, ele direciona automaticamente para o memorial digital da pessoa homenageada.",
    },
    {
      q: "O memorial fica disponível para sempre?",
      a: "Sim! Após a criação e pagamento, seu memorial fica hospedado permanentemente em nossa plataforma, acessível 24/7 de qualquer lugar do mundo.",
    },
    {
      q: "Posso editar o memorial depois de criado?",
      a: "Sim! Após adquirir um plano, você pode editar seu documento gratuitamente e a qualquer momento. Basta acessar a página 'Meus Memoriais' e clicar no botão de edição disponível no card do memorial.",
    },
    {
      q: "Quanto tempo demora a entrega da placa?",
      a: "A produção e envio levam de 7 a 15 dias úteis. Você receberá código de rastreamento assim que o pedido for despachado.",
    },
    {
      q: "A placa resiste às condições do tempo?",
      a: "Sim! Nossa placa é feita em aço inox de alta qualidade, resistente à chuva, sol e variações de temperatura, garantindo durabilidade por muitos anos.",
    },
  ];

  const [open, setOpen] = useState(null);

  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #7bbde8 0%, #8ecce8 30%, #a0d4ee 60%, #b8e0f5 100%)",
        marginTop: 0, borderTop: "none",
      }}
    >
      <style>{`
        @keyframes floatF1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-12px) translateX(7px); }
        }
        @keyframes floatF2 {
          0%,100% { transform: translateY(0) translateX(0); }
          50%     { transform: translateY(-16px) translateX(-8px); }
        }
        @keyframes faqOpen {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .faq-item {
          transition: box-shadow 0.3s ease, transform 0.3s cubic-bezier(.22,1,.36,1);
        }
        .faq-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(26,39,68,0.13), inset 0 1px 0 rgba(255,255,255,0.9) !important;
        }
        .faq-answer { animation: faqOpen 0.32s cubic-bezier(.22,1,.36,1) both; }
        .faq-plus { transition: transform 0.35s cubic-bezier(.22,1,.36,1); flex-shrink: 0; }
        .faq-plus.open { transform: rotate(45deg); }
        @media (max-width: 767px) {
          .faq-cloud-left  { width: 120px !important; left: -15px !important; }
          .faq-cloud-right { display: none !important; }
        }
      `}</style>

      <div className="faq-cloud-left absolute top-[-10px] left-[-50px] w-48 md:w-64 opacity-80 pointer-events-none select-none"
        style={{ animation: "floatF1 10s ease-in-out infinite" }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="faq-cloud-right absolute bottom-[-10px] right-[-40px] w-44 md:w-56 opacity-70 pointer-events-none select-none hidden md:block"
        style={{ animation: "floatF2 12s ease-in-out infinite" }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
          <div className="md:w-72 lg:w-80 flex-shrink-0">
            <p style={{ textTransform: "uppercase", letterSpacing: "0.22em", fontSize: "0.68rem", fontWeight: 700, color: "#2a3d5e", marginBottom: "14px" }}>
              FAQ
            </p>
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.8rem, 6vw, 3rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.18, marginBottom: "16px" }}>
              Todas as respostas.
            </h2>
            <p style={{ color: "#3a5070", fontSize: "clamp(0.85rem, 3vw, 1rem)", lineHeight: 1.65, fontFamily: '"Georgia", serif' }}>
              Tem uma dúvida? A resposta está aqui.
            </p>
          </div>

          <div className="flex-1 w-full" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="faq-item"
                style={{
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.52)", backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.78)",
                  boxShadow: "0 4px 18px rgba(26,39,68,0.07), inset 0 1px 0 rgba(255,255,255,0.85)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "space-between", padding: "18px 22px",
                    background: "transparent", border: "none", cursor: "pointer",
                    textAlign: "left", gap: "12px",
                  }}
                >
                  <span style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(0.85rem, 3vw, 1rem)", fontWeight: 600, color: "#1a2744", lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <div
                    className={`faq-plus${open === i ? ' open' : ''}`}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: open === i ? "#1a2744" : "rgba(26,39,68,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.3s ease, transform 0.35s cubic-bezier(.22,1,.36,1)",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                      stroke={open === i ? "white" : "#1a2744"} strokeWidth="2" strokeLinecap="round">
                      <line x1="6" y1="1" x2="6" y2="11"/>
                      <line x1="1" y1="6" x2="11" y2="6"/>
                    </svg>
                  </div>
                </button>
                {open === i && (
                  <div className="faq-answer" style={{ padding: "0 22px 18px", borderTop: "1px solid rgba(26,39,68,0.06)" }}>
                    <p style={{ paddingTop: "14px", color: "#3a5070", fontSize: "clamp(0.82rem, 2.8vw, 0.92rem)", lineHeight: 1.72, fontFamily: '"Georgia", serif' }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
