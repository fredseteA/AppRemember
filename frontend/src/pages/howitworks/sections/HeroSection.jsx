import { Link } from 'react-router-dom';

const HowItWorksHeroSection = () => {
    return (
        <section
        className="relative min-h-[88vh] flex items-center justify-center overflow-hidden px-4"
        style={{
          background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 30%, #7bbde8 60%, #5aa8e0 100%)',
          paddingTop: '96px',
        }}
        >
            <style>{`
            @keyframes floatHW1 {
                0%,100% { transform: translateY(0) translateX(0); }
                40%     { transform: translateY(-16px) translateX(8px); }
                70%     { transform: translateY(-8px) translateX(-5px); }
            }
            @keyframes floatHW2 {
                0%,100% { transform: translateY(0) translateX(0); }
                50%     { transform: translateY(-14px) translateX(-9px); }
            }
            @keyframes floatHW3 {
                0%,100% { transform: translateY(0) translateX(0); }
                45%     { transform: translateY(-10px) translateX(6px); }
            }
            @keyframes floatHW4 {
                0%,100% { transform: translateY(0) translateX(0); }
                55%     { transform: translateY(-12px) translateX(-7px); }
            }
            @keyframes fadeInHeroHW {
                from { opacity: 0; transform: translateY(28px); filter: blur(6px); }
                to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
            }
            @keyframes floatBadge1 {
                0%,100% { transform: translateY(0) rotate(-6deg); }
                50%     { transform: translateY(-10px) rotate(-4deg); }
            }
            @keyframes floatBadge2 {
                0%,100% { transform: translateY(0) rotate(4deg); }
                50%     { transform: translateY(-8px) rotate(6deg); }
            }
            @keyframes floatBadge3 {
                0%,100% { transform: translateY(0) rotate(-3deg); }
                55%     { transform: translateY(-12px) rotate(-5deg); }
            }
            .hw-hero-badge {
                padding: 8px 18px;
                border-radius: 999px;
                background: rgba(255,255,255,0.65);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255,255,255,0.85);
                box-shadow: 0 4px 18px rgba(26,39,68,0.10);
                font-family: "Georgia", serif;
                font-size: 0.78rem;
                font-weight: 700;
                color: #1a2744;
                white-space: nowrap;
                pointer-events: none;
                user-select: none;
            }
            .hw-hero-cta {
                border-radius: 999px;
                padding: 13px 34px;
                background: rgba(255,255,255,0.32);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                border: 1.5px solid rgba(255,255,255,0.7);
                color: #1a2744;
                font-family: "Georgia", serif;
                font-size: 0.92rem;
                font-weight: 700;
                letter-spacing: 0.04em;
                cursor: pointer;
                box-shadow: 0 4px 18px rgba(26,39,68,0.1);
                transition: all 0.3s cubic-bezier(.22,1,.36,1);
            }
            .hw-hero-cta:hover {
                background: #1a2744;
                color: white;
                transform: translateY(-2px) scale(1.03);
                box-shadow: 0 8px 28px rgba(26,39,68,0.18);
            }
            `}</style>

            {/* Nuvem grande esquerda */}
            <div className="absolute top-[8%] left-[-60px] w-64 md:w-80 opacity-95 pointer-events-none select-none"
            style={{ animation: 'floatHW1 9s ease-in-out infinite' }}>
            <img src="/clouds/cloud1.png" alt="" draggable={false}
            style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            {/* Nuvem direita topo */}
            <div className="absolute top-[4%] right-[-40px] w-52 opacity-90 pointer-events-none select-none hidden md:block"
            style={{ animation: 'floatHW2 11s ease-in-out infinite' }}>
            <img src="/clouds/cloud2.png" alt="" draggable={false}
            style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            {/* Nuvem esquerda baixo */}
            <div className="absolute bottom-[10%] left-[2%] w-36 opacity-70 pointer-events-none select-none hidden md:block"
            style={{ animation: 'floatHW3 7s ease-in-out infinite' }}>
            <img src="/clouds/cloud3.png" alt="" draggable={false}
            style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            {/* Nuvem direita baixo */}
            <div className="absolute bottom-[8%] right-[4%] w-28 opacity-65 pointer-events-none select-none hidden lg:block"
            style={{ animation: 'floatHW4 10s ease-in-out infinite' }}>
            <img src="/clouds/cloud2.png" alt="" draggable={false}
            style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            {/* Badges flutuantes */}
            <div className="absolute top-[22%] left-[6%] hidden lg:block"
            style={{ animation: 'floatBadge1 6s ease-in-out infinite' }}>
            <div className="hw-hero-badge" style={{ transform: 'rotate(-6deg)' }}>
                ✦ Passo 01 — Criar
            </div>
            </div>
            <div className="absolute top-[18%] right-[7%] hidden lg:block"
            style={{ animation: 'floatBadge2 8s ease-in-out infinite' }}>
            <div className="hw-hero-badge" style={{ transform: 'rotate(4deg)' }}>
                ✦ Passo 02 — Visualizar
            </div>
            </div>
            <div className="absolute bottom-[22%] right-[9%] hidden lg:block"
            style={{ animation: 'floatBadge3 7s ease-in-out infinite' }}>
            <div className="hw-hero-badge" style={{ transform: 'rotate(-3deg)' }}>
                ✦ Passo 03 — Publicar
            </div>
            </div>

            {/* Conteúdo central */}
            <div
            className="relative z-10 text-center max-w-2xl mx-auto"
            style={{ animation: 'fadeInHeroHW 0.9s cubic-bezier(.22,1,.36,1) both' }}
            >
            <p style={{
                textTransform: 'uppercase', letterSpacing: '0.22em',
                fontSize: '0.68rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.8)', marginBottom: '18px',
            }}>
                Como Funciona
            </p>
            <h1
                data-testid="page-title"
                style={{
                fontFamily: '"Georgia", serif',
                fontSize: 'clamp(2.4rem, 6vw, 4.8rem)',
                fontWeight: 700, color: '#1a2744',
                lineHeight: 1.12, marginBottom: '20px',
                }}
            >
                Simples assim.
                <br />
                <span style={{ color: 'white', fontWeight: 400, fontStyle: 'italic' }}>
                3 passos, eterno.
                </span>
            </h1>
            <p style={{
                color: 'rgba(26,39,68,0.72)',
                fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
                lineHeight: 1.72, maxWidth: '480px',
                margin: '0 auto 36px', fontFamily: '"Georgia", serif',
            }}>
                Criar um memorial eterno é simples, rápido e feito com muito respeito.
                Em apenas 3 passos você homenageia quem você ama.
            </p>
            <Link to="/create-memorial">
                <button className="hw-hero-cta" data-testid="hero-cta-how">
                Criar memorial gratuito
                </button>
            </Link>
            </div>

            {/* Número de página */}
            <div style={{
            position: 'absolute', bottom: 28, right: 32,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Georgia", serif',
            fontSize: '0.75rem', fontWeight: 700, color: '#1a2744',
            }}>
            1
            </div>
        </section>
    )
}

export default HowItWorksHeroSection;