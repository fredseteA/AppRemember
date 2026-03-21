import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
    return (
        <section
        className="relative py-20 md:py-28 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #ddf0f7 0%, #c8e8f5 40%, #a8d8f0 100%)',
          marginTop: 0, borderTop: 'none',
        }}
        >
            <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <p style={{
                textTransform: 'uppercase', letterSpacing: '0.22em',
                fontSize: '0.68rem', fontWeight: 700,
                color: '#2a3d5e', marginBottom: '16px',
            }}>
                Pronto para começar?
            </p>
            <h2 style={{
                fontFamily: '"Georgia", serif',
                fontSize: 'clamp(2rem, 5vw, 3.8rem)',
                fontWeight: 700, color: '#1a2744',
                lineHeight: 1.18, marginBottom: '20px',
            }}>
                Crie agora,
                <br />
                <span style={{ fontWeight: 400, fontStyle: 'italic', color: '#3a5070' }}>
                gratuitamente.
                </span>
            </h2>
            <Link to="/create-memorial">
                <button
                style={{
                    borderRadius: '999px', padding: '13px 34px',
                    background: '#1a2744', border: 'none',
                    color: 'white', fontFamily: '"Georgia", serif',
                    fontSize: '0.92rem', fontWeight: 700,
                    letterSpacing: '0.04em', cursor: 'pointer',
                    boxShadow: '0 8px 28px rgba(26,39,68,0.2)',
                    transition: 'all 0.3s ease',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
                >
                Começar Agora
                <ArrowRight size={16} />
                </button>
            </Link>
            </div>
        </section>
    )
}

export default CTASection;