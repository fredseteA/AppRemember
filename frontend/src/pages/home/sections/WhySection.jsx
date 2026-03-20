import { Link} from 'react-router-dom';

const WhySection = () => {

  return (
    <section
        className="why-section relative py-16 md:py-24 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #b8e0f5 0%, #c8e8f5 35%, #ddf0f7 65%, #eef8fb 100%)", marginTop: 0, borderTop: "none" }}
      >
        <style>{`
          @keyframes floatW1 { 0%,100% { transform: translateY(0) translateX(0); } 45% { transform: translateY(-13px) translateX(7px); } }
          @keyframes floatW2 { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-10px) translateX(-6px); } }
          @keyframes revealWhy { from { opacity: 0; transform: translateY(28px); filter: blur(5px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
          .why-btn { transition: transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, background 0.3s ease; }
          .why-btn:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 8px 28px rgba(26,39,68,0.15) !important; background: #1a2744 !important; color: white !important; }
        `}</style>

        <div className="why-cloud-left absolute top-[-10px] left-[-50px] w-44 md:w-60 opacity-80 pointer-events-none select-none" style={{ animation: "floatW1 9s ease-in-out infinite" }}>
          <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div className="why-cloud-right absolute bottom-[-8px] right-[-40px] w-40 md:w-56 opacity-70 pointer-events-none select-none hidden md:block" style={{ animation: "floatW2 11s ease-in-out infinite" }}>
          <img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center" style={{ animation: "revealWhy 0.8s cubic-bezier(.22,1,.36,1) both" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.22em", fontSize: "0.68rem", fontWeight: 700, color: "#2a3d5e", marginBottom: "16px" }}>Por que nos escolher</p>
          <h2 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.6rem, 6.5vw, 3.2rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.18, marginBottom: "20px" }}>
            Por que a<br className="hidden md:block" /> Remember QRCode.
          </h2>
          <p style={{ color: "#3a5070", fontSize: "clamp(0.88rem, 3.5vw, 1.1rem)", lineHeight: 1.72, maxWidth: "520px", margin: "0 auto 36px", fontFamily: '"Georgia", serif' }}>
            Escolha quem entende a importância de preservar memórias. Oferecemos uma tecnologia única de QR Codes personalizados, que conecta o presente ao passado de forma significativa.
          </p>
          <Link to="/sobre">
            <button className="why-btn" style={{ borderRadius: "999px", padding: "13px 34px", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1.5px solid rgba(26,39,68,0.2)", color: "#1a2744", fontFamily: '"Georgia", serif', fontSize: "clamp(0.82rem, 3.5vw, 0.95rem)", fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer", boxShadow: "0 4px 18px rgba(26,39,68,0.08)" }}>
              Sobre a Remember QRCode
            </button>
          </Link>
        </div>
      </section>
  );
}

export default WhySection;
