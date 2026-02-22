import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Star, Eye, CreditCard, FileText, MessageSquarePlus, User } from 'lucide-react';
import ReviewForm from '../components/ReviewForm';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Avaliações padrão caso não haja avaliações reais
  const defaultReviews = [
    {
      id: 'default-1',
      user_name: "Maria Souza",
      user_photo_url: null,
      rating: 5,
      title: "Super Recomendo",
      comment: "Encontrei por acaso e comprei. Era para preparar a despedida para meu sobrinho. Produto de qualidade e entrega rápida."
    },
    {
      id: 'default-2',
      user_name: "João Carlos",
      user_photo_url: null,
      rating: 5,
      title: "Site confiável",
      comment: "Comprei chegou certinho! Além do ótimo atendimento e preocupação com um assunto tão delicado!"
    },
    {
      id: 'default-3',
      user_name: "Ana Paula",
      user_photo_url: null,
      rating: 5,
      title: "Excelente produto",
      comment: "Além de ser um produto de qualidade tem um atendimento top de linha e empatia. Recomendo!"
    }
  ];

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await axios.get(`${API}/reviews`);
        if (response.data && response.data.length > 0) {
          setReviews(response.data);
        } else {
          setReviews(defaultReviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews(defaultReviews);
      } finally {
        setLoadingReviews(false);
      }
    };
    
    loadReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews`);
      if (response.data && response.data.length > 0) {
        setReviews(response.data);
      } else {
        setReviews(defaultReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(defaultReviews);
    }
  };

  // Componente de Avatar padrão
  const DefaultAvatar = ({ name }) => (
    <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-primary/20 flex items-center justify-center">
      <User className="w-6 h-6 text-gray-400" />
    </div>
  );

  return (
    <div data-testid="home-page" className="bg-white overflow-x-hidden">
      {/* Hero Section with Background */}
      <section 
        className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center bg-cover bg-center px-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1732130318657-c8740c0f5215?q=80&w=2000)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full">
          <h1
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-4 md:mb-6 text-white uppercase"
            data-testid="hero-title"
          >
            TRANSFORME LEMBRANÇAS<br />
            EM HOMENAGENS
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-white mb-6 md:mb-8 max-w-3xl mx-auto px-2">
            Mantenha as histórias de quem você ama vivas,
            acessível a qualquer momento, de qualquer lugar.
          </p>
          <Link to="/create-memorial">
            <Button
              size="lg"
              className="rounded-full px-6 sm:px-8 md:px-12 py-5 md:py-7 text-sm sm:text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 hover:scale-105 shadow-xl transition-all duration-300"
              data-testid="hero-cta-button"
            >
              CRIAR MEMORIAL GRATUITO
            </Button>
          </Link>
        </div>
      </section>

      {/* Como Funciona - 3 Etapas */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
              Como Funciona
            </h2>
            <p className="text-base md:text-xl text-muted-foreground px-4">
              Em apenas 3 passos simples, crie uma homenagem eterna
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Etapa 1 - Crie o memorial */}
            <div className="text-center px-4" data-testid="step-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary" />
              </div>
              <div className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                PASSO 1
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 md:mb-3">Crie o memorial</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Preencha as informações da homenagem: dados pessoais, uma frase especial, biografia, fotos e até um áudio. Tudo de forma simples e carinhosa.
              </p>
            </div>

            {/* Etapa 2 - Veja o resultado */}
            <div className="text-center px-4" data-testid="step-2">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary" />
              </div>
              <div className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                PASSO 2
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 md:mb-3">Veja o resultado</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                O memorial é exibido pronto na tela para você ver como ficou. Ele fica salvo no seu perfil, pronto para ser publicado quando você decidir.
              </p>
            </div>

            {/* Etapa 3 - Escolha um plano */}
            <div className="text-center px-4" data-testid="step-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary" />
              </div>
              <div className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                PASSO 3
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 md:mb-3">Escolha um plano</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Se gostar do resultado, escolha um plano para publicar o memorial online e/ou receber a placa física com QR Code para o túmulo.
              </p>
            </div>
          </div>

          <div className="text-center mt-10 md:mt-16 px-4">
            <p className="text-sm md:text-lg font-medium text-muted-foreground bg-secondary/50 inline-block px-4 sm:px-6 py-3 rounded-full">
              ✨ Criar o memorial é gratuito • Você só paga se quiser publicar
            </p>
          </div>
        </div>
      </section>

      {/* Product Section - Planos */}
      <section className="py-12 md:py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
              Escolha seu Plano
            </h2>
            <p className="text-base md:text-xl text-muted-foreground">
              Duas opções para eternizar a memória de quem você ama
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 max-w-4xl mx-auto">
            {/* Plano Digital */}
            <Card className="border-2 hover:border-primary hover:scale-[1.02] transition-all duration-300 shadow-lg">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4">Plano Digital</h3>
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                  R$ 29,90
                </div>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                  Memorial digital publicado na plataforma
                </p>
                <ul className="space-y-2 mb-4 md:mb-6 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 flex-shrink-0"></div>
                    Memorial digital completo
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 flex-shrink-0"></div>
                    Galeria de até 10 fotos
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 flex-shrink-0"></div>
                    Áudio de homenagem
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 flex-shrink-0"></div>
                    QR Code digital
                  </li>
                </ul>
                <Link to="/create-memorial">
                  <Button className="w-full rounded-full font-semibold hover:scale-105 transition-transform duration-200" variant="outline">
                    ESCOLHER PLANO
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plano Placa QR Code */}
            <Card className="border-2 border-primary hover:scale-[1.02] transition-all duration-300 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 sm:px-4 py-1 text-xs sm:text-sm font-bold">
                Mais Popular
              </div>
              <CardContent className="p-5 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4">Plano Placa QR Code</h3>
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                  R$ 119,90
                </div>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                  Memorial + Placa física de aço inox
                </p>
                <ul className="space-y-2 mb-4 md:mb-6 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 flex-shrink-0"></div>
                    Tudo do Plano Digital
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 flex-shrink-0"></div>
                    Placa física em aço inox
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 flex-shrink-0"></div>
                    QR Code gravado permanente
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 flex-shrink-0"></div>
                    Envio para todo Brasil
                  </li>
                </ul>
                <Link to="/create-memorial">
                  <Button className="w-full rounded-full font-semibold bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200">
                    ESCOLHER PLANO
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm md:text-base font-semibold">Site Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm md:text-base font-semibold">Compra Protegida</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm md:text-base font-semibold">Entrega Garantida</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 uppercase">
            CONTE A HISTÓRIA DELES
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light mb-8 md:mb-10 max-w-3xl mx-auto px-4">
            Nossos entes queridos merecem que sua história seja conhecida, para mostrar ao mundo quem eles eram, para deixar as memórias viverem para sempre.
          </p>
          <Link to="/explore">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-8 sm:px-10 md:px-12 py-5 md:py-7 text-sm sm:text-base md:text-lg font-semibold shadow-xl"
              data-testid="cta-explore"
            >
              EXPLORAR HISTÓRIAS
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials Section - Com Avaliações Reais */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 md:mb-16 gap-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center sm:text-left">
              O que nossos clientes dizem
            </h2>
            {user && (
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="rounded-full"
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                {showReviewForm ? 'Fechar' : 'Avaliar'}
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-10 max-w-xl mx-auto">
              <ReviewForm onSuccess={() => {
                setShowReviewForm(false);
                fetchReviews();
              }} />
            </div>
          )}

          {/* Reviews Grid */}
          {loadingReviews ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {reviews.slice(0, 6).map((review, index) => (
                <Card key={review.id || index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-5 sm:p-6">
                    {/* Avatar e Nome */}
                    <div className="flex items-center gap-3 mb-4">
                      {review.user_photo_url ? (
                        <img 
                          src={review.user_photo_url} 
                          alt={review.user_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                        />
                      ) : (
                        <DefaultAvatar name={review.user_name} />
                      )}
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">{review.user_name}</h4>
                        <div className="flex items-center">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          {[...Array(5 - review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-gray-300" />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.title && (
                      <h3 className="text-lg sm:text-xl font-bold mb-2">{review.title}</h3>
                    )}
                    {review.comment && (
                      <p className="text-sm md:text-base text-muted-foreground">
                        {review.comment}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 md:mb-16">
            Perguntas Frequentes
          </h2>

          <div className="space-y-3 md:space-y-4">
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2">Como funciona o QR Code?</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  O QR Code é gravado em uma placa de aço inox durável. Quando escaneado com um smartphone, ele direciona automaticamente para o memorial digital da pessoa homenageada.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2">O memorial fica disponível para sempre?</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Sim! Após a criação e pagamento, seu memorial fica hospedado permanentemente em nossa plataforma, acessível 24/7 de qualquer lugar do mundo.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2">Posso editar o memorial depois de criado?</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Sim! Você pode solicitar edições por uma taxa de R$ 9,90. Entre em contato com nosso suporte pelo WhatsApp.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2">Quanto tempo demora a entrega da placa?</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  A produção e envio levam de 7 a 15 dias úteis. Você receberá código de rastreamento assim que o pedido for despachado.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2">A placa resiste às condições do tempo?</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Sim! Nossa placa é feita em aço inox de alta qualidade, resistente à chuva, sol e variações de temperatura, garantindo durabilidade por muitos anos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            POR QUE A REMEMBER QRCODE
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto px-4">
            Escolha quem entende a importância de preservar memórias. Oferecemos uma tecnologia única de QR Codes personalizados, que conecta o presente ao passado de forma significativa.
          </p>
          <Link to="/how-it-works">
            <Button size="lg" className="rounded-full px-8 sm:px-10 md:px-12 font-semibold">
              SAIBA MAIS
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
