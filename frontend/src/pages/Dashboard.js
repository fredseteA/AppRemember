import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, ShoppingCart, User, MessageCircle } from 'lucide-react';

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
      testId: 'nav-my-memorials'
    },
    {
      title: 'Minhas Compras',
      description: 'Histórico de pedidos e pagamentos',
      icon: ShoppingCart,
      link: '/my-purchases',
      testId: 'nav-my-purchases'
    },
    {
      title: 'Minha Conta',
      description: 'Configurações de perfil',
      icon: User,
      link: '/profile',
      testId: 'nav-profile'
    }
  ];

  return (
    <div className="pt-32 pb-24" data-testid="dashboard-page">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <h1
            className="text-5xl md:text-6xl font-light tracking-tight leading-tight mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            data-testid="page-title"
          >
            Bem-vindo, {user?.displayName || user?.name || 'Usuário'}
          </h1>
          <p className="text-lg text-muted-foreground">
            Gerencie seus memoriais e homenagens
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.link} data-testid={item.testId}>
              <Card className="border border-border/50 hover:border-primary hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.15)] transition-all duration-700 h-full">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="bg-secondary/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">Precisa de Ajuda?</h3>
                  <p className="text-sm text-muted-foreground">
                    Entre em contato com nosso suporte via WhatsApp
                  </p>
                </div>
              </div>
              <Button onClick={openWhatsApp} className="rounded-full" data-testid="button-whatsapp">
                Falar no WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;