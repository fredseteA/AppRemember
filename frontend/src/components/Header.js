import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Menu, X, User, Globe } from 'lucide-react';
import AuthModal from './AuthModal';

const Header = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'pt' ? 'en' : 'pt');
  const handleLogout = async () => { await logout(); window.location.href = '/'; };
  const openWhatsApp = () => window.open('https://wa.me/5522992080811', '_blank');
  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
      <style>{`
        @keyframes headerFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mobileMenuSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .header-root { animation: headerFadeIn 0.6s cubic-bezier(.22,1,.36,1) both; }

        .header-transparent { background: transparent; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; }
        .header-floating {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(18px) saturate(1.6);
          -webkit-backdrop-filter: blur(18px) saturate(1.6);
          box-shadow: 0 2px 24px rgba(26,39,68,0.08), 0 1px 0 rgba(255,255,255,0.6) inset;
          margin: 10px 20px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.55);
        }
        .header-inner {
          transition: background 0.45s cubic-bezier(.22,1,.36,1),
            box-shadow 0.45s cubic-bezier(.22,1,.36,1),
            border-radius 0.45s cubic-bezier(.22,1,.36,1),
            margin 0.45s cubic-bezier(.22,1,.36,1),
            border-color 0.45s cubic-bezier(.22,1,.36,1),
            backdrop-filter 0.45s ease;
        }

        .nav-link {
          position: relative;
          text-decoration: none;
          transition: color 0.18s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -3px; left: 0; right: 0;
          height: 1.5px; border-radius: 2px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.22s cubic-bezier(.22,1,.36,1);
        }
        .nav-link:hover::after { transform: scaleX(1); }

        .header-transparent .nav-link { color: rgba(255,255,255,0.82) !important; }
        .header-transparent .nav-link:hover {
          color: white !important;
          text-shadow: 0 0 18px rgba(255,255,255,0.55);
        }
        .header-transparent .nav-link::after { background: rgba(255,255,255,0.85); }

        .header-floating .nav-link { color: #2a3d5e !important; }
        .header-floating .nav-link:hover {
          color: #1a2744 !important;
          text-shadow: 0 1px 8px rgba(26,39,68,0.18);
        }
        .header-floating .nav-link::after { background: #1a2744; }

        .header-transparent .header-icon { color: rgba(255,255,255,0.9); }
        .header-floating    .header-icon { color: #2a3d5e; }

        .header-transparent .header-login-btn {
          background: rgba(255,255,255,0.18) !important;
          border: 1.5px solid rgba(255,255,255,0.7) !important;
          color: white !important; backdrop-filter: blur(8px);
          transition: all 0.25s ease;
        }
        .header-transparent .header-login-btn:hover {
          background: rgba(255,255,255,0.28) !important;
          box-shadow: 0 0 16px rgba(255,255,255,0.2);
        }
        .header-floating .header-login-btn {
          background: #1a2744 !important; border: none !important;
          color: white !important; transition: all 0.25s ease;
        }
        .header-floating .header-login-btn:hover {
          background: #2a3d5e !important;
          box-shadow: 0 4px 16px rgba(26,39,68,0.22);
        }

        .header-transparent .header-logo { filter: brightness(0) invert(1); }
        .header-floating    .header-logo { filter: none; }
        .header-logo { transition: filter 0.4s ease; }

        .header-transparent .mobile-toggle { color: white; }
        .header-floating    .mobile-toggle { color: #1a2744; }

        @media (max-width: 767px) {
          .header-floating {
            margin: 0 !important; border-radius: 0 !important;
            border-left: none !important; border-right: none !important;
            border-top: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.25) !important;
          }
          .header-bar { height: 52px !important; }
          .header-logo { height: 36px !important; }
        }

        .mobile-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          z-index: 49;
          background: rgba(200,232,245,0.97);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          overflow-y: auto;
          animation: mobileMenuSlide 0.28s cubic-bezier(.22,1,.36,1) both;
        }
        .mobile-overlay-inner {
          padding: 80px 28px 48px;
          display: flex; flex-direction: column; min-height: 100%;
        }
        .mobile-nav-link {
          display: block; padding: 15px 0;
          font-family: "Georgia", serif; font-size: 1.05rem; font-weight: 600;
          color: #1a2744; text-decoration: none;
          border-bottom: 1px solid rgba(26,39,68,0.09);
          transition: color 0.18s ease, padding-left 0.2s ease;
          background: none; border-top: none; border-left: none; border-right: none;
          width: 100%; text-align: left; cursor: pointer;
        }
        .mobile-nav-link:hover { color: #5aa8e0; padding-left: 6px; }
        .mobile-nav-link:last-child { border-bottom: none; }
        .mobile-nav-secondary {
          display: block; padding: 12px 0;
          font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 500;
          color: #3a5070; text-decoration: none;
          border-bottom: 1px solid rgba(26,39,68,0.06);
          background: none; border-top: none; border-left: none; border-right: none;
          width: 100%; text-align: left; cursor: pointer;
          transition: color 0.18s ease, padding-left 0.2s ease;
        }
        .mobile-nav-secondary:hover { color: #1a2744; padding-left: 4px; }
        .mobile-section-label {
          font-family: "Georgia", serif; font-size: 0.6rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #5aa8e0; margin-top: 24px; margin-bottom: 4px;
        }
      `}</style>

      <header data-testid="main-header" className="header-root fixed top-0 left-0 right-0 z-50">
        <div className={`header-inner ${scrolled ? 'header-floating' : 'header-transparent'}`}>
          <div className="max-w-7xl mx-auto px-4 md:px-10">
            <div className="header-bar flex items-center justify-between h-16">

              <Link to="/" className="flex items-center" data-testid="logo-link" onClick={closeMobile}>
                <img src="/logo-transparent.svg" alt="Remember QRCode" className="header-logo h-11 w-auto" />
              </Link>

              <nav className="hidden md:flex items-center space-x-7">
                {[
                  { to: '/',                          label: t('nav.home'),              testId: 'nav-home' },
                  { to: '/how-it-works',              label: t('nav.howItWorks'),        testId: 'nav-how-it-works' },
                  { to: '/why-preserve-memories', label: 'Por que preservar?',      testId: 'nav-por-que-preservar' },
                  { to: '/explore',                   label: t('nav.explore'),           testId: 'nav-explore' },
                  { to: '/create-memorial',           label: t('nav.createMemorial'),    testId: 'nav-create-memorial' },
                ].map(({ to, label, testId }) => (
                  <Link key={to} to={to} data-testid={testId}
                    className="nav-link text-sm font-medium"
                    style={{ fontFamily: '"Georgia", serif' }}>
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="hidden md:flex items-center space-x-3">
                <Button variant="ghost" size="icon" onClick={toggleLanguage}
                  data-testid="language-toggle"
                  className="header-icon rounded-full w-8 h-8 transition-colors duration-300"
                  style={{ background: 'transparent', border: 'none' }}>
                  <Globe className="h-4 w-4" />
                </Button>

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid="user-menu-trigger"
                        className="header-icon rounded-full w-8 h-8"
                        style={{ background: 'transparent', border: 'none' }}>
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border border-white/60 bg-white/90 backdrop-blur-xl">
                      <DropdownMenuLabel data-testid="user-email" className="text-xs text-slate-500">{user.email}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><Link to="/dashboard" data-testid="nav-dashboard">{t('nav.myAccount')}</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to="/my-memorials" data-testid="nav-my-memorials">{t('nav.myMemorials')}</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to="/my-purchases" data-testid="nav-my-purchases">{t('nav.myPurchases')}</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={openWhatsApp} data-testid="nav-support">{t('nav.support')}</DropdownMenuItem>
                      {user.is_admin && (
                        <><DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link to="/admin" data-testid="nav-admin">{t('nav.admin')}</Link></DropdownMenuItem></>
                      )}
                      {user.role === 'apoiador' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/apoiador" data-testid="nav-apoiador">Painel do Apoiador</Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} data-testid="logout-button">{t('nav.logout')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button onClick={() => setAuthModalOpen(true)} data-testid="login-button"
                    className="header-login-btn rounded-full px-5 py-2 text-sm font-semibold"
                    style={{ fontFamily: '"Georgia", serif', letterSpacing: '0.03em' }}>
                    {t('nav.login')}
                  </button>
                )}
              </div>

              <div className="flex md:hidden items-center gap-1">
                <button onClick={toggleLanguage} className="mobile-toggle p-2 transition-colors duration-300"
                  style={{ background: 'transparent', border: 'none' }} aria-label="Trocar idioma">
                  <Globe className="h-4 w-4" />
                </button>
                <button className="mobile-toggle p-2 transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(prev => !prev)}
                  data-testid="mobile-menu-toggle"
                  aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                  style={{ background: 'transparent', border: 'none' }}>
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-overlay md:hidden" data-testid="mobile-menu">
          <div className="mobile-overlay-inner">
            <nav style={{ marginBottom: 8 }}>
              <Link to="/" className="mobile-nav-link" onClick={closeMobile}>{t('nav.home')}</Link>
              <Link to="/how-it-works" className="mobile-nav-link" onClick={closeMobile}>{t('nav.howItWorks')}</Link>
              <Link to="/por-que-preservar-memorias" className="mobile-nav-link" onClick={closeMobile}>Por que preservar?</Link>
              <Link to="/explore" className="mobile-nav-link" onClick={closeMobile}>{t('nav.explore')}</Link>
              <Link to="/create-memorial" className="mobile-nav-link" onClick={closeMobile}>{t('nav.createMemorial')}</Link>
            </nav>

            {user ? (
              <div style={{ marginTop: 8 }}>
                <p className="mobile-section-label">Minha conta</p>
                <Link to="/dashboard" className="mobile-nav-secondary" onClick={closeMobile}>
                  {t('nav.myAccount')}
                </Link>
                <Link to="/my-memorials" className="mobile-nav-secondary" onClick={closeMobile}>
                  {t('nav.myMemorials')}
                </Link>
                <Link to="/my-purchases" className="mobile-nav-secondary" onClick={closeMobile}>
                  {t('nav.myPurchases')}
                </Link>
                <button
                  className="mobile-nav-secondary"
                  onClick={() => { openWhatsApp(); closeMobile(); }}
                >
                  {t('nav.support')}
                </button>
                {user.is_admin && (
                  <Link to="/admin" className="mobile-nav-secondary" onClick={closeMobile}>
                    {t('nav.admin')}
                  </Link>
                )}
                {user.role === 'apoiador' && (
                  <Link to="/apoiador" className="mobile-nav-secondary" onClick={closeMobile}>
                    Painel do Apoiador
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); closeMobile(); }}
                  style={{
                    marginTop: 24, width: '100%', borderRadius: '999px',
                    padding: '13px 0', background: 'rgba(26,39,68,0.08)',
                    border: '1.5px solid rgba(26,39,68,0.15)', color: '#1a2744',
                    fontFamily: '"Georgia", serif', fontSize: '0.88rem',
                    fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
                  }}
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <button onClick={() => { setAuthModalOpen(true); closeMobile(); }}
                data-testid="login-button"
                style={{ marginTop: 24, width: '100%', borderRadius: '999px', padding: '14px 0',
                  background: '#1a2744', border: 'none', color: 'white',
                  fontFamily: '"Georgia", serif', fontSize: '0.95rem',
                  fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
                  boxShadow: '0 4px 18px rgba(26,39,68,0.18)' }}>
                {t('nav.login')}
              </button>
            )}
          </div>
        </div>
      )}

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Header;