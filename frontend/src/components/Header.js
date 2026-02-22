import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Menu, X, User, Globe } from 'lucide-react';
import AuthModal from './AuthModal';

const Header = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'pt' ? 'en' : 'pt');
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/5522992080811', '_blank');
  };

  return (
    <>
      <header data-testid="main-header" className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center" data-testid="logo-link">
              <img 
                src="/logo-transparent.png" 
                alt="Remember QRCode" 
                className="h-14 w-auto"
              />
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                data-testid="nav-home"
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/how-it-works"
                data-testid="nav-how-it-works"
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {t('nav.howItWorks')}
              </Link>
              <Link
                to="/explore"
                data-testid="nav-explore"
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {t('nav.explore')}
              </Link>
              <Link
                to="/create-memorial"
                data-testid="nav-create-memorial"
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {t('nav.createMemorial')}
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                data-testid="language-toggle"
              >
                <Globe className="h-5 w-5" />
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="user-menu-trigger">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel data-testid="user-email">{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" data-testid="nav-dashboard">{t('nav.myAccount')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-memorials" data-testid="nav-my-memorials">{t('nav.myMemorials')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-purchases" data-testid="nav-my-purchases">{t('nav.myPurchases')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openWhatsApp} data-testid="nav-support">
                      {t('nav.support')}
                    </DropdownMenuItem>
                    {user.is_admin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" data-testid="nav-admin">{t('nav.admin')}</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="logout-button">
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setAuthModalOpen(true)}
                  className="rounded-full px-6 bg-primary hover:bg-primary/90 font-semibold"
                  data-testid="login-button"
                >
                  {t('nav.login')}
                </Button>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4 border-t" data-testid="mobile-menu">
              <Link to="/" className="block text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.home')}
              </Link>
              <Link to="/how-it-works" className="block text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.howItWorks')}
              </Link>
              <Link to="/explore" className="block text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.explore')}
              </Link>
              <Link to="/create-memorial" className="block text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.createMemorial')}
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="block text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.myAccount')}
                  </Link>
                  <Link to="/my-memorials" className="block text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.myMemorials')}
                  </Link>
                  <Link to="/my-purchases" className="block text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.myPurchases')}
                  </Link>
                  <button onClick={() => { openWhatsApp(); setMobileMenuOpen(false); }} className="block text-foreground hover:text-primary font-medium w-full text-left">
                    {t('nav.support')}
                  </button>
                  {user.is_admin && (
                    <Link to="/admin" className="block text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block text-foreground hover:text-primary font-medium w-full text-left">
                    {t('nav.logout')}
                  </button>
                </> 
              ) : (
                <Button onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }} className="w-full rounded-full bg-primary hover:bg-primary/90 font-semibold">
                  {t('nav.login')}
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Header;
