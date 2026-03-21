import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Coins,
  QrCode,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Heart
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/affiliate',           label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/affiliate/vendas',    label: 'Vendas',      icon: ShoppingBag     },
  { path: '/affiliate/comissoes', label: 'Comissões',   icon: Coins           },
  { path: '/affiliate/meu-codigo',label: 'Meu Código',  icon: QrCode          },
];

export default function AffiliateLayout({ children }) {
  const { user, logout } = useAuth(); // ← CORRIGIDO: era currentUser
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Nome de exibição — tenta displayName, depois name do Firestore, depois email
  const displayName = user?.displayName || user?.name || user?.email || 'affiliate';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', fontFamily: '"Georgia", serif' }}>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: 'linear-gradient(180deg, #0f1f3d 0%, #1a3461 100%)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 50,
          transition: 'transform 0.3s ease',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        }}
        className={`ap-sidebar${sidebarOpen ? ' open' : ''}`}
      >

        {/* Logo */}
        <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Heart size={20} style={{ color: '#5aa8e0' }} fill="#5aa8e0" />
            <span style={{ fontFamily: '"Georgia", serif', fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>
              Remember
            </span>
          </div>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Painel do affiliate
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 10, marginBottom: 4,
                  textDecoration: 'none',
                  background: active ? 'rgba(90,168,224,0.15)' : 'transparent',
                  color: active ? '#5aa8e0' : 'rgba(255,255,255,0.65)',
                  fontFamily: '"Georgia", serif', fontSize: '0.88rem',
                  fontWeight: active ? 600 : 400, transition: 'all 0.18s',
                  borderLeft: active ? '3px solid #5aa8e0' : '3px solid transparent',
                }}
              >
                <Icon size={17} />
                <span style={{ flex: 1 }}>{label}</span>
                {active && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px 16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ marginBottom: 12 }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
              Conectado como
            </p>
            <p style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '9px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: 'rgba(255,255,255,0.6)',
              fontSize: '0.82rem', cursor: 'pointer',
              fontFamily: '"Georgia", serif', transition: 'all 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,80,80,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="ap-main">

        {/* Topbar mobile */}
        <header
          style={{
            display: 'none', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px', background: '#fff',
            borderBottom: '1px solid #e8edf4',
            position: 'sticky', top: 0, zIndex: 30,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
          className="ap-topbar"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Heart size={18} style={{ color: '#5aa8e0' }} fill="#5aa8e0" />
            <span style={{ fontFamily: '"Georgia", serif', fontWeight: 700, color: '#1a2744', fontSize: '1rem' }}>Remember</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a2744' }}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 'clamp(20px, 4vw, 36px)' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ap-sidebar { transform: translateX(-100%) !important; }
          .ap-sidebar.open { transform: translateX(0) !important; }
          .ap-main { margin-left: 0 !important; }
          .ap-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}