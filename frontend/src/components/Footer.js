import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer data-testid="main-footer" className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Logo e Descrição */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src="/logo-white.png" 
                alt="Remember QRCode" 
                className="h-16 md:h-20 w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Preservando memórias e homenageando vidas com amor e respeito.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-bold mb-3 md:mb-4 text-base md:text-lg">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-primary transition-colors">
                  {t('nav.howItWorks')}
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-400 hover:text-primary transition-colors">
                  {t('nav.explore')}
                </Link>
              </li>
              <li>
                <Link to="/create-memorial" className="text-gray-400 hover:text-primary transition-colors">
                  {t('nav.createMemorial')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="font-bold mb-3 md:mb-4 text-base md:text-lg">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <a href="https://wa.me/5522992080811" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors break-all">
                  +55 22 99208-0811
                </a>
              </li>
              <li className="flex items-start text-gray-400">
                <Mail className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <a href="mailto:rememberqrcode@gmail.com" className="hover:text-primary transition-colors break-all">
                  rememberqrcode@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Garantias */}
          <div>
            <h4 className="font-bold mb-3 md:mb-4 text-base md:text-lg">Garantias</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                Compra Segura
              </li>
              <li className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                Entrega Rastreável
              </li>
              <li className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                Suporte Dedicado
              </li>
            </ul>
          </div>
        </div>

        {/* Rodapé Final */}
        <div className="pt-6 md:pt-8 border-t border-gray-800 text-center">
          <div className="flex items-center justify-center mb-3">
            <img 
              src="/logo-white.png" 
              alt="Remember QRCode" 
              className="h-8 md:h-10 w-auto opacity-80"
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-400 px-2">
            © {currentYear} Remember QRCode. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
