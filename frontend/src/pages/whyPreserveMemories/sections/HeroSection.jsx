import { Link } from 'react-router-dom';
import SecurityBadge from '@/components/shared/SecurityBadge';

const HeroSection = () => { 
    return (
        <section
        className="relative flex items-center justify-center overflow-hidden px-4"
        style={{
            background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 30%, #7bbde8 60%, #5aa8e0 100%)',
            minHeight: 'clamp(520px, 75vh, 720px)',
            paddingTop: 'clamp(96px, 15vw, 136px)',
            paddingBottom: 'clamp(56px, 9vw, 88px)',
        }}
        >
            <style>{`
                .hero-af1 { animation: wpm-fadeDown 0.7s ease 0.1s  both; }
                .hero-af2 { animation: wpm-fadeUp   0.7s ease 0.25s both; }
                .hero-af3 { animation: wpm-fadeUp   0.7s ease 0.4s  both; }
                .hero-af4 { animation: wpm-fadeUp   0.7s ease 0.55s both; }
                .hero-af5 { animation: wpm-fadeUp   0.7s ease 0.7s  both; }
            `}</style>

            <div className="hero-af1 wpm-cloud-l absolute pointer-events-none select-none"
                style={{ top: 8, left: -50, width: 'clamp(200px,22vw,320px)', opacity: 0.95 }}>
                <div className="wpm-cloud-1"><img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%' }} /></div>
            </div>
            <div className="hero-af1 wpm-cloud-r absolute pointer-events-none select-none"
                style={{ top: 4, right: -40, width: 'clamp(160px,18vw,260px)', opacity: 0.95 }}>
                <div className="wpm-cloud-2"><img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%' }} /></div>
            </div>
            <div className="absolute pointer-events-none select-none hidden md:block"
                style={{ top: '40%', right: 24, width: 120, opacity: 0.65 }}>
                <div className="wpm-cloud-3"><img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%' }} /></div>
            </div>

            <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
                <div className="hero-af1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{ flex: 1, maxWidth: 72, height: '1.5px', background: 'rgba(26,39,68,0.28)', borderRadius: 2 }} />
                <div style={{ color: '#2a5d8a', animation: 'wpm-heartbeat 3s ease-in-out infinite' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </div>
                <span style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', color: 'rgba(26,39,68,0.48)', letterSpacing: '0.18em', fontWeight: 500 }}>
                    1948 · 2024
                </span>
                <div style={{ color: '#2a5d8a', animation: 'wpm-heartbeat 3s ease-in-out infinite', animationDelay: '0.5s' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </div>
                <div style={{ flex: 1, maxWidth: 72, height: '1.5px', background: 'rgba(26,39,68,0.28)', borderRadius: 2 }} />
                </div>

                <h1 className="hero-af2" style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(2rem, 6.5vw, 3.8rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.12, marginBottom: 22 }}>
                Quantas histórias dos seus bisavós você realmente conhece?
                </h1>

                <p className="hero-af3" style={{ color: '#2a3d5e', fontSize: 'clamp(0.95rem, 3.2vw, 1.15rem)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto 16px', fontFamily: '"Georgia", serif' }}>
                Uma lápide mostra apenas um nome e duas datas.
                Mas entre essas datas existe uma vida inteira — histórias, conquistas,
                amor e memórias que merecem ser preservadas para sempre.
                </p>

                {/* Ticker emocional */}
                <div className="hero-af4" style={{ overflow: 'hidden', margin: '0 auto 32px', maxWidth: 520, maskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)' }}>
                <div style={{ display: 'flex', gap: 32, whiteSpace: 'nowrap', animation: 'wpm-tickerL 18s linear infinite' }}>
                    {['infância · ', 'amor · ', 'conquistas · ', 'família · ', 'aventuras · ', 'legado · ', 'amizades · ', 'fé · ',
                    'infância · ', 'amor · ', 'conquistas · ', 'família · ', 'aventuras · ', 'legado · ', 'amizades · ', 'fé · '].map((t, i) => (
                    <span key={i} style={{ fontFamily: '"Georgia", serif', fontSize: '0.82rem', color: 'rgba(26,39,68,0.42)', letterSpacing: '0.1em', fontStyle: 'italic' }}>{t}</span>
                    ))}
                </div>
                </div>

                <div className="hero-af5 wpm-btns" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                <Link to="/create-memorial" className="wpm-btn-primary">Criar um memorial</Link>
                <Link to="/explore" className="wpm-btn-secondary">Ver exemplos</Link>
                </div>

                <div className="hero-af5" style={{ display: 'flex', justifyContent: 'center' }}>
                <SecurityBadge variant="minimal" />
                </div>
            </div>
        </section>
    );
}

export default HeroSection;