import { Link } from 'react-router-dom';

// O hero interno termina em #7bbde8
// O fundo da página continua a partir daí: #7bbde8 → #b8e0f5 → #eef8fb
const pageStyle = {
  background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 18%, #7bbde8 32%, #b8e0f5 55%, #eef8fb 100%)',
  minHeight: '100vh',
  fontFamily: '"Georgia", serif',
};

const Section = ({ children, style = {} }) => (
  <section style={{
    maxWidth: 780,
    margin: '0 auto',
    padding: 'clamp(32px, 6vw, 64px) clamp(20px, 5vw, 40px)',
    ...style,
  }}>
    {children}
  </section>
);

const H1 = ({ children }) => (
  <h1 style={{
    fontFamily: '"Georgia", serif',
    fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
    fontWeight: 700,
    color: '#1a2744',
    lineHeight: 1.2,
    marginBottom: '12px',
  }}>{children}</h1>
);

const H2 = ({ children }) => (
  <h2 style={{
    fontFamily: '"Georgia", serif',
    fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
    fontWeight: 700,
    color: '#1a2744',
    lineHeight: 1.3,
    marginTop: '36px',
    marginBottom: '10px',
  }}>{children}</h2>
);

const P = ({ children }) => (
  <p style={{
    color: '#3a5070',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    lineHeight: 1.78,
    marginBottom: '14px',
  }}>{children}</p>
);

const Tag = ({ children }) => (
  <span style={{
    display: 'inline-block',
    padding: '3px 14px',
    borderRadius: '999px',
    background: 'rgba(90,168,224,0.15)',
    border: '1px solid rgba(90,168,224,0.3)',
    color: '#2a6090',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    marginBottom: '18px',
  }}>{children}</span>
);

const Divider = () => (
  <hr style={{ border: 'none', borderTop: '1px solid rgba(26,39,68,0.1)', margin: '8px 0 0' }} />
);

const ValueCard = ({ icon, title, text }) => (
  <div style={{
    borderRadius: '18px',
    padding: '22px 24px',
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.8)',
    boxShadow: '0 6px 20px rgba(26,39,68,0.07)',
    flex: '1 1 220px',
  }}>
    <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>{icon}</div>
    <p style={{ fontWeight: 700, color: '#1a2744', fontSize: '0.95rem', marginBottom: '6px' }}>{title}</p>
    <p style={{ color: '#3a5070', fontSize: '0.85rem', lineHeight: 1.65 }}>{text}</p>
  </div>
);

export default function AboutPage() {
  return (
    <div style={pageStyle}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sobre-hero { animation: fadeInUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        @media (max-width: 767px) {
          .sobre-cloud { display: none !important; }
        }
      `}</style>

      {/* Hero — fundo transparente para herdar o gradiente da página */}
      <section style={{
        background: 'transparent',
        padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 40px) clamp(48px, 8vw, 80px)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        <div className="sobre-cloud" style={{
          position: 'absolute', top: 0, left: -40, width: 220, opacity: 0.7, pointerEvents: 'none',
        }}>
          <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%' }} />
        </div>
        <div className="sobre-cloud" style={{
          position: 'absolute', bottom: 0, right: -30, width: 180, opacity: 0.6, pointerEvents: 'none',
        }}>
          <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%' }} />
        </div>

        <div className="sobre-hero" style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <Tag>Sobre nós</Tag>
          <H1>Nascemos para preservar o que mais importa.</H1>
          <p style={{
            color: '#2a3d5e',
            fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
            lineHeight: 1.72,
            marginTop: '16px',
          }}>
            A Remember QRCode é uma plataforma brasileira dedicada à criação de memoriais digitais permanentes, conectando histórias de vida ao presente por meio da tecnologia.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <Section>

        <H2>Quem somos</H2>
        <P>
          A Remember QRCode é uma empresa brasileira criada com o propósito de transformar a forma como honramos e lembramos as pessoas que amamos. Acreditamos que toda vida merece ser contada, celebrada e preservada para as gerações futuras.
        </P>
        <P>
          Combinamos tecnologia acessível com um produto físico de alta qualidade — a placa de aço inoxidável com QR Code — para criar uma ponte permanente entre o mundo físico e o digital.
        </P>

        <Divider />
        <H2>Nossa missão</H2>
        <P>
          Oferecer às famílias uma forma digna, acessível e duradoura de preservar a memória de seus entes queridos, com respeito, simplicidade e cuidado em cada etapa do processo.
        </P>

        <Divider />
        <H2>Nossa visão</H2>
        <P>
          Ser a principal plataforma de memoriais digitais do Brasil, reconhecida pela qualidade dos produtos, pelo atendimento humanizado e pelo impacto positivo que geramos nas famílias brasileiras.
        </P>

        <Divider />
        <H2>Nossos valores</H2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px' }}>
          <ValueCard icon="🤍" title="Respeito e empatia" text="Cada memorial é único. Tratamos cada história com o cuidado e a sensibilidade que ela merece." />
          <ValueCard icon="🔒" title="Confiança e segurança" text="Seus dados e o memorial criado são armazenados com segurança e permanecem disponíveis permanentemente." />
          <ValueCard icon="✨" title="Simplicidade" text="Criamos uma experiência simples e intuitiva para que qualquer pessoa possa criar um memorial bonito." />
          <ValueCard icon="🌐" title="Tecnologia com propósito" text="Usamos tecnologia não por tendência, mas para criar algo com significado real para as famílias." />
        </div>

        <Divider />
        <H2>Como funciona</H2>
        <P>
          Qualquer pessoa pode criar um memorial digital gratuitamente em nossa plataforma. Após a criação, o memorial fica salvo como rascunho, permitindo revisões antes da publicação.
        </P>
        <P>
          Quando o cliente estiver satisfeito, pode escolher entre o <strong>Plano Digital</strong> — que publica o memorial online com link e QR Code exclusivos — ou o <strong>Plano Placa QR Code</strong>, que inclui a produção e entrega de uma placa física em aço inox para fixação em túmulos, jazigos ou locais de homenagem.
        </P>

        <Divider />
        <H2>Parceria com funerárias e cemitérios</H2>
        <P>
          Contamos com um programa de affiliatees voltado a funerárias e cemitérios. Parceiros recebem um código exclusivo que oferece desconto aos clientes e gera comissão progressiva sobre as vendas realizadas. Entre em contato para saber mais.
        </P>

        <div style={{ marginTop: '36px', textAlign: 'center' }}>
          <Link to="/create-memorial">
            <button style={{
              borderRadius: '999px',
              padding: '13px 34px',
              background: '#1a2744',
              border: 'none',
              color: 'white',
              fontFamily: '"Georgia", serif',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 18px rgba(26,39,68,0.18)',
            }}>
              Criar memorial gratuito
            </button>
          </Link>
        </div>
      </Section>
    </div>
  );
}