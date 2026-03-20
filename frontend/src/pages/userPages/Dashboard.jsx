import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, ShoppingCart, User, MessageCircle } from 'lucide-react';
import { userPageStyles, pageBackground } from './shared/userPageStyles.js'

const Dashboard = () => {
  const { user } = useAuth();

  const openWhatsApp = () => {
    window.open('https://wa.me/5522992080811', '_blank');
  };

  const menuItems = [
    {
      title: 'Meus Memoriais',
      description: 'Visualize e gerencie seus memoriais',
      icon: Heart,
      link: '/my-memorials',
      testId: 'nav-my-memorials',
      color: '#5aa8e0',
    },
    {
      title: 'Minhas Compras',
      description: 'Histórico de pedidos e pagamentos',
      icon: ShoppingCart,
      link: '/my-purchases',
      testId: 'nav-my-purchases',
      color: '#7bbde8',
    },
    {
      title: 'Minha Conta',
      description: 'Configurações de perfil',
      icon: User,
      link: '/profile',
      testId: 'nav-profile',
      color: '#a8d8f0',
    }
  ];

  return (
    <div
      className="min-h-screen overflow-hidden"
      data-testid="dashboard-page"
      style={{
        background: pageBackground,
      }}
    >
      <style>{userPageStyles}</style>

      {/* Nuvens decorativas */}
      <div className="dash-cloud-left absolute top-0 left-[-40px] w-52 md:w-72 opacity-90 pointer-events-none select-none"
        style={{ animation: 'floatD1 9s ease-in-out infinite' }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="dash-cloud-right absolute top-[8%] right-[-40px] w-44 md:w-64 opacity-85 pointer-events-none select-none hidden md:block"
        style={{ animation: 'floatD2 11s ease-in-out infinite' }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="dash-cloud-base absolute bottom-[8%] left-[5%] w-28 opacity-60 pointer-events-none select-none hidden lg:block"
        style={{ animation: 'floatD3 7s ease-in-out infinite' }}>
        <img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12"
        style={{
          paddingTop: 'clamp(96px, 14vw, 140px)',
          paddingBottom: 'clamp(48px, 8vw, 80px)',
        }}
      >

        {/* Saudação */}
        <div
          style={{
            animation: 'dashReveal 0.75s cubic-bezier(.22,1,.36,1) both',
            marginBottom: 'clamp(32px, 6vw, 56px)',
          }}
        >
          <p style={{
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'rgba(26,39,68,0.55)',
            marginBottom: 12,
          }}>
            Painel do usuário
          </p>
          <h1
            data-testid="page-title"
            style={{
              fontFamily: '"Georgia", serif',
              fontSize: 'clamp(1.7rem, 5vw, 3rem)',
              fontWeight: 700,
              color: '#1a2744',
              lineHeight: 1.18,
              marginBottom: 10,
            }}
          >
            Bem-vindo,<br className="hidden sm:block" /> {user?.displayName || user?.name || 'Usuário'}
          </h1>
          <p style={{
            fontFamily: '"Georgia", serif',
            fontSize: 'clamp(0.88rem, 2.5vw, 1rem)',
            color: '#2a3d5e',
            lineHeight: 1.65,
          }}>
            Gerencie seus memoriais e homenagens
          </p>
        </div>

        {/* Cards de navegação */}
        <div
          className="dash-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(12px, 2vw, 20px)',
            marginBottom: 'clamp(16px, 3vw, 24px)',
          }}
        >
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              data-testid={item.testId}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="dash-card"
                style={{
                  borderRadius: 22,
                  padding: 'clamp(22px, 3vw, 32px)',
                  background: 'rgba(255,255,255,0.58)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 10px 36px rgba(26,39,68,0.09), inset 0 1px 0 rgba(255,255,255,0.9)',
                  height: '100%',
                  animation: `cardReveal 0.65s cubic-bezier(.22,1,.36,1) ${0.1 + index * 0.12}s both`,
                }}
              >
                {/* Ícone */}
                <div style={{
                  width: 52, height: 52,
                  borderRadius: '50%',
                  background: `${item.color}22`,
                  border: `1.5px solid ${item.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                  transition: 'transform 0.3s ease',
                }}>
                  <item.icon size={22} style={{ color: item.color }} />
                </div>

                <h3 style={{
                  fontFamily: '"Georgia", serif',
                  fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                  fontWeight: 700,
                  color: '#1a2744',
                  marginBottom: 8,
                  lineHeight: 1.25,
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontFamily: '"Georgia", serif',
                  fontSize: 'clamp(0.78rem, 1.8vw, 0.85rem)',
                  color: '#3a5070',
                  lineHeight: 1.6,
                }}>
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Card suporte WhatsApp */}
        <div
          style={{
            borderRadius: 22,
            padding: 'clamp(20px, 3vw, 32px)',
            background: 'rgba(26,39,68,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(90,168,224,0.3)',
            boxShadow: '0 16px 48px rgba(26,39,68,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
            animation: 'cardReveal 0.65s cubic-bezier(.22,1,.36,1) 0.46s both',
          }}
        >
          <div className="dash-support" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{
                width: 52, height: 52,
                borderRadius: '50%',
                background: 'rgba(90,168,224,0.18)',
                border: '1.5px solid rgba(90,168,224,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <MessageCircle size={22} style={{ color: '#7bbde8' }} />
              </div>
              <div>
                <h3 style={{
                  fontFamily: '"Georgia", serif',
                  fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: 4,
                }}>
                  Precisa de Ajuda?
                </h3>
                <p style={{
                  fontFamily: '"Georgia", serif',
                  fontSize: 'clamp(0.78rem, 1.8vw, 0.85rem)',
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.55,
                }}>
                  Entre em contato com nosso suporte via WhatsApp
                </p>
              </div>
            </div>

            <button
              onClick={openWhatsApp}
              className="dash-whatsapp-btn"
              data-testid="button-whatsapp"
            >
              Falar no WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;