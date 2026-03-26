import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SecurityBadge from '@/components/shared/SecurityBadge';
import { Button } from '@/components/ui/button';
import { usePageReveal } from '@/hooks/usePageReveal';

const HeroSection = () => {
  const { t } = useTranslation();
  const revealed = usePageReveal();

  return (
    <section
      className={`hero-section relative pt-24 md:pt-28 min-h-[600px] md:min-h-[750px] flex items-center justify-center overflow-hidden px-4${revealed ? ' hero-ready' : ''}`}
      style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 30%, #7bbde8 60%, #5aa8e0 100%)' }}
    >
      <style>
        {`
          @keyframes floatCloud1 { 0%, 100% { transform: translateY(0px) translateX(0px); } 33% { transform: translateY(-12px) translateX(6px); } 66% { transform: translateY(-6px) translateX(-4px); } }
          @keyframes floatCloud2 { 0%, 100% { transform: translateY(0px) translateX(0px); } 40% { transform: translateY(-10px) translateX(-8px); } 70% { transform: translateY(-16px) translateX(4px); } }
          @keyframes floatCloud3 { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-8px) translateX(5px); } }
          @keyframes floatCloud4 { 0%, 100% { transform: translateY(0px) translateX(0px); } 45% { transform: translateY(-14px) translateX(-6px); } }
          @keyframes fadeInUp   { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-24px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }

          .hero-cloud-1 { animation: floatCloud1 7s ease-in-out infinite; }
          .hero-cloud-2 { animation: floatCloud2 9s ease-in-out infinite; }
          .hero-cloud-3 { animation: floatCloud3 6s ease-in-out infinite; }
          .hero-cloud-4 { animation: floatCloud4 8s ease-in-out infinite; }

          /* Elementos ficam invisíveis até hero-ready */
          .anim-fade-down,
          .anim-fade-up-1,
          .anim-fade-up-2,
          .anim-fade-up-3,
          .anim-fade-right { opacity: 0; }

          /* Ao ganhar hero-ready, animações disparam */
          .hero-ready .anim-fade-down   { animation: fadeInDown  0.7s ease           both; }
          .hero-ready .anim-fade-up-1   { animation: fadeInUp    0.7s ease 0.1s      both; }
          .hero-ready .anim-fade-up-2   { animation: fadeInUp    0.7s ease 0.25s     both; }
          .hero-ready .anim-fade-up-3   { animation: fadeInUp    0.7s ease 0.4s      both; }
          .hero-ready .anim-fade-right  { animation: fadeInRight 0.8s ease 0.35s     both; }

          .hero-btn-secondary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            border-radius: 999px;
            padding: 8px 20px;
            font-family: "Georgia", serif;
            font-size: clamp(0.82rem, 3.5vw, 1rem);
            font-weight: 600;
            letter-spacing: 0.04em;
            color: #1a2744;
            background: rgba(255,255,255,0.28);
            border: 1.5px solid rgba(26,39,68,0.3);
            cursor: pointer;
            text-decoration: none;
            transition: all 0.25s ease;
            backdrop-filter: blur(8px);
            white-space: nowrap;
          }
          .hero-btn-secondary:hover {
            background: rgba(255,255,255,0.45);
            border-color: rgba(26,39,68,0.5);
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(26,39,68,0.12);
          }
          .hero-cta-group {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          @media (max-width: 640px) {
            .hero-cta-group {
              flex-direction: column;
              align-items: stretch;
            }
            .hero-cta-group a,
            .hero-cta-group button {
              width: 100%;
              justify-content: center;
            }
          }
        `}
      </style>

      {/* Clouds */}
      <div className="hero-cloud-1-wrap anim-fade-down absolute top-4 left-[-50px] w-64 md:w-80 opacity-95 pointer-events-none select-none">
        <div className="hero-cloud-1"><img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} /></div>
      </div>
      <div className="hero-cloud-2-wrap anim-fade-down absolute top-2 right-[-40px] w-56 md:w-72 opacity-95 pointer-events-none select-none" style={{ animationDelay: '0.15s' }}>
        <div className="hero-cloud-2"><img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} /></div>
      </div>
      <div className="hero-cloud-3-wrap anim-fade-down absolute top-[38%] right-6 w-28 md:w-36 opacity-75 pointer-events-none select-none hidden md:block" style={{ animationDelay: '0.3s' }}>
        <div className="hero-cloud-3"><img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} /></div>
      </div>
      <div className="hero-cloud-4-wrap anim-fade-down absolute bottom-[28%] left-4 w-24 md:w-32 opacity-65 pointer-events-none select-none hidden md:block" style={{ animationDelay: '0.25s' }}>
        <div className="hero-cloud-4"><img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} /></div>
      </div>

      <div className="hero-content relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 px-4 md:px-8">
        <div className="hero-text flex-1 text-center md:text-left">
          <h1
            className="anim-fade-up-1"
            style={{
              fontSize: 'clamp(1.7rem, 6vw, 3.2rem)',
              color: '#1a2744',
              fontFamily: '"Georgia", serif',
              lineHeight: 1.15,
              whiteSpace: 'pre-line'
            }}
          >
            {t('hero.title')}
          </h1>
          <p
            className="anim-fade-up-2 font-light mb-8 md:mb-10 max-w-xl mx-auto md:mx-0"
            style={{ fontSize: 'clamp(0.88rem, 3.5vw, 1.05rem)', color: '#2a3d5e', lineHeight: 1.7 }}
          >
            {t('hero.description')}
          </p>

          <div className="anim-fade-up-3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'inherit' }}>
            <div className="hero-cta-group">
              <Link to="/create-memorial">
                <Button
                  size="lg"
                  className="rounded-full px-10 py-5 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  data-testid="hero-cta-button"
                  style={{ fontSize: 'clamp(0.82rem, 3.5vw, 1rem)', background: '#1a2744', color: 'white', letterSpacing: '0.05em', padding: '20px' }}
                >
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link to="/why-preserve-memories" className="hero-btn-secondary" data-testid="hero-secondary-button">
                {t('hero.ctaSecondary')}
              </Link>
            </div>
            <div style={{ marginTop: 14 }}>
              <SecurityBadge variant="minimal" />
            </div>
          </div>
        </div>

        <div className="hero-video-wrap anim-fade-right flex-shrink-0 w-[260px] md:w-[320px] lg:w-[380px] h-[320px] md:h-[400px] lg:h-[440px] rounded-3xl overflow-hidden shadow-2xl relative">
          <video src="/video-hero.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;