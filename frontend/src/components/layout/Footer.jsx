import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, MessageCircle, Shield, Truck, Headphones } from 'lucide-react';

const PHONE_HREF = 'https://wa.me/5522992080811';
const INSTAGRAM_HREF = 'https://www.instagram.com/remember.qrcode?igsh=bmVsZHliOXl3bWh4';
const EMAIL = 'rememberqrcode@gmail.com';

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const footerStyles = `
  @keyframes floatFoot1 {
    0%,100% { transform: translateY(0) translateX(0); }
    45%     { transform: translateY(-12px) translateX(7px); }
  }
  @keyframes floatFoot2 {
    0%,100% { transform: translateY(0) translateX(0); }
    55%     { transform: translateY(-9px) translateX(-6px); }
  }

  /* ── Nav link com underline deslizante ── */
  .footer-link {
    color: #4a6080;
    font-family: "Georgia", serif;
    font-size: 0.83rem;
    text-decoration: none;
    position: relative;
    display: inline-block;
    line-height: 1.5;
    transition: color 0.18s ease;
  }
  .footer-link::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0; right: 0;
    height: 1px; border-radius: 1px;
    background: #1a2744;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.22s cubic-bezier(.22,1,.36,1);
  }
  .footer-link:hover { color: #1a2744; }
  .footer-link:hover::after { transform: scaleX(1); }

  /* ── Links legais do rodapé ── */
  .footer-link-sm {
    color: rgba(58,80,112,0.55);
    font-family: "Georgia", serif;
    font-size: 0.71rem;
    text-decoration: none;
    position: relative;
    display: inline-block;
    transition: color 0.18s ease;
  }
  .footer-link-sm::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0; right: 0;
    height: 1px; border-radius: 1px;
    background: #3a5070;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.22s cubic-bezier(.22,1,.36,1);
  }
  .footer-link-sm:hover { color: #1a2744; }
  .footer-link-sm:hover::after { transform: scaleX(1); }

  /* ── Botões sociais ── */
  .footer-social-btn {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(255,255,255,0.45);
    border: 1px solid rgba(255,255,255,0.72);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 1px 6px rgba(26,39,68,0.07);
    color: #2a3d5e; text-decoration: none; flex-shrink: 0;
    transition: background 0.22s ease, transform 0.22s cubic-bezier(.22,1,.36,1),
      box-shadow 0.22s ease, color 0.22s ease, border-color 0.22s ease;
  }
  .footer-social-btn:hover {
    transform: translateY(-2px) scale(1.08);
    box-shadow: 0 6px 16px rgba(26,39,68,0.13);
  }
  .footer-social-btn.whatsapp:hover  { background: #25D366; color: white; border-color: #25D366; }
  .footer-social-btn.instagram:hover {
    background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4);
    color: white; border-color: transparent;
  }

  /* ── Coluna heading ── */
  .footer-col-heading {
    font-family: "Georgia", serif;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #1a2744;
    margin-bottom: 18px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(26,39,68,0.1);
  }

  /* ── Divider ── */
  .footer-divider {
    border: none;
    border-top: 1px solid rgba(26,39,68,0.1);
    margin: 0;
  }

  /* ── Garantia badge ── */
  .footer-guarantee-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 10px;
    background: rgba(255,255,255,0.35);
    border: 1px solid rgba(255,255,255,0.65);
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }
  .footer-guarantee-item:hover {
    background: rgba(255,255,255,0.55);
    box-shadow: 0 3px 12px rgba(26,39,68,0.07);
  }

  /* ── Suporte link row ── */
  .footer-contact-row {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(26,39,68,0.06);
  }
  .footer-contact-row:last-child { border-bottom: none; }
  .footer-contact-icon {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(90,168,224,0.12);
    flex-shrink: 0; margin-top: 1px;
  }

  @media (max-width: 767px) {
    .footer-cloud-l, .footer-cloud-r { display: none !important; }
  }
`;

const Footer = ({ startColor = '#eef8fb' }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: '/',                 label: t('nav.home') },
    { to: '/how-it-works',    label: t('nav.howItWorks') },
    { to: '/explore',         label: t('nav.explore') },
    { to: '/create-memorial', label: t('nav.createMemorial') },
  ];

  const institutionalLinks = [
    { to: '/about',                  label: 'Sobre a Remember QRCode' },
    { to: '/responsibility-policy',  label: 'Política de Responsabilidade' },
    { to: '/privacy-policy',         label: 'Política de Privacidade' },
    { to: '/return-policy',          label: 'Troca, Devolução e Reembolso' },
    { to: '/terms-and-conditions',   label: 'Termos e Condições' },
    { to: '/delivery-policy',        label: 'Política de Entrega' },
  ];

  const guarantees = [
    { label: 'Compra Segura',       icon: <Shield  size={13} strokeWidth={2} style={{ color: '#5aa8e0' }} /> },
    { label: 'Entrega Rastreável',  icon: <Truck   size={13} strokeWidth={2} style={{ color: '#5aa8e0' }} /> },
    { label: 'Suporte Dedicado',    icon: <Headphones size={13} strokeWidth={2} style={{ color: '#5aa8e0' }} /> },
  ];

  const companyLinks = [
    { to: '/about',                                  label: 'Sobre nós' },
    { to: '/privacy-policy',                          label: 'Privacidade' },
    { to: '/terms-and-conditions',                   label: 'Termos e Condições' },
    { to: '/delivery-policy',                         label: 'Política de Entrega' },
    { to: '/return-policy', label: 'Cancelamento e Reembolso' },
  ];

  return (
    <footer
      data-testid="main-footer"
      style={{
        background: `linear-gradient(180deg, ${startColor} 0%, #ddf0f7 30%, #c8e8f5 60%, #a8d8f0 100%)`,
        marginTop: 0,
        borderTop: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{footerStyles}</style>

      {/* Nuvens decorativas */}
      <div className="footer-cloud-l absolute top-[-10px] left-[-50px] w-44 md:w-60 opacity-60 pointer-events-none select-none hidden md:block"
        style={{ animation: 'floatFoot1 10s ease-in-out infinite' }}>
        <img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="footer-cloud-r absolute bottom-[15%] right-[-40px] w-40 md:w-52 opacity-50 pointer-events-none select-none"
        style={{ animation: 'floatFoot2 12s ease-in-out infinite' }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* ── Linha superior separadora ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(26,39,68,0.12) 30%, rgba(26,39,68,0.18) 50%, rgba(26,39,68,0.12) 70%, transparent 100%)',
      }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-14 pt-16 md:pt-24 pb-8">

        {/* ══ Grid principal — 5 colunas ══ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '40px 32px',
            marginBottom: '56px',
          }}
          className="footer-main-grid"
        >
          <style>{`
            @media (min-width: 640px) {
              .footer-main-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
            @media (min-width: 1024px) {
              .footer-main-grid { grid-template-columns: 1.8fr 1fr 1.2fr 1.1fr 1fr !important; gap: 40px 48px !important; }
            }
          `}</style>

          {/* ── Col 1: Marca ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <img
              src="/logo-transparent.svg"
              alt="Remember QRCode"
              style={{ height: 52, width: 'auto', marginBottom: 14, objectFit: 'contain', objectPosition: 'left' }}
            />
            <p style={{
              color: '#4a6080',
              fontSize: '0.84rem',
              lineHeight: 1.72,
              fontFamily: '"Georgia", serif',
              maxWidth: 210,
              marginBottom: 24,
            }}>
              Memoriais digitais para preservar histórias e homenagear vidas.
            </p>

            {/* Redes sociais */}
            <p style={{
              fontFamily: '"Georgia", serif', fontSize: '0.62rem', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#1a2744', opacity: 0.5, marginBottom: 10,
            }}>
              Siga-nos
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer"
                className="footer-social-btn instagram" aria-label="Instagram" title="Instagram">
                <InstagramIcon size={15} />
              </a>
              <a href={PHONE_HREF} target="_blank" rel="noopener noreferrer"
                className="footer-social-btn whatsapp" aria-label="WhatsApp" title="WhatsApp">
                <WhatsAppIcon size={15} />
              </a>
            </div>
          </div>

          {/* ── Col 2: Produto ── */}
          <div>
            <p className="footer-col-heading">Produto</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="footer-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Empresa ── */}
          <div>
            <p className="footer-col-heading">Empresa</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
              {companyLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="footer-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Suporte ── */}
          <div>
            <p className="footer-col-heading">Suporte</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div className="footer-contact-row">
                <div className="footer-contact-icon">
                  <Mail size={13} strokeWidth={2} style={{ color: '#5aa8e0' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.67rem', color: 'rgba(26,39,68,0.4)', fontFamily: '"Georgia", serif', marginBottom: 2, letterSpacing: '0.05em' }}>
                    E-mail
                  </p>
                  <a href={'mailto:' + EMAIL} className="footer-link"
                    style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    {EMAIL}
                  </a>
                </div>
              </div>
              <div className="footer-contact-row">
                <div className="footer-contact-icon">
                  <MessageCircle size={13} strokeWidth={2} style={{ color: '#5aa8e0' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.67rem', color: 'rgba(26,39,68,0.4)', fontFamily: '"Georgia", serif', marginBottom: 2, letterSpacing: '0.05em' }}>
                    Chat
                  </p>
                  <a href={PHONE_HREF} target="_blank" rel="noopener noreferrer"
                    className="footer-link" style={{ fontSize: '0.8rem' }}>
                    Falar no WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── Col 5: Garantias ── */}
          <div>
            <p className="footer-col-heading">Garantias</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {guarantees.map(({ label, icon }) => (
                <div key={label} className="footer-guarantee-item">
                  {icon}
                  <span style={{
                    color: '#3a5070',
                    fontSize: '0.8rem',
                    fontFamily: '"Georgia", serif',
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ══ Rodapé final ══ */}
        <hr className="footer-divider" />

        <div style={{
          paddingTop: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
        }}>
          {/* Copyright + logo mini */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/logo-transparent.svg"
              alt="Remember QRCode"
              style={{ height: 22, width: 'auto', opacity: 0.4 }}
            />
            <p style={{
              color: 'rgba(58,80,112,0.6)',
              fontSize: '0.75rem',
              fontFamily: '"Georgia", serif',
            }}>
              {'© ' + currentYear + ' Remember QRCode · Todos os direitos reservados.'}
            </p>
          </div>

          {/* Links legais separados por ponto */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 0',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {institutionalLinks.map(({ to, label }, i) => (
              <span key={to} style={{ display: 'flex', alignItems: 'center' }}>
                <Link to={to} className="footer-link-sm" style={{ padding: '0 10px' }}>{label}</Link>
                {i < institutionalLinks.length - 1 && (
                  <span style={{ color: 'rgba(58,80,112,0.25)', fontSize: '0.65rem', userSelect: 'none' }}>·</span>
                )}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
