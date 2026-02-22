import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle2, FileText, Eye, CreditCard, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: '01',
      icon: FileText,
      title: 'Crie o Memorial',
      description: 'Preencha as informações da pessoa homenageada com carinho: dados pessoais, uma frase especial, biografia, galeria de fotos e até um áudio de homenagem. Tudo de forma simples e guiada, para que você possa expressar todo o amor que sente.',
      image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80',
      highlight: 'Criar é gratuito!'
    },
    {
      number: '02',
      icon: Eye,
      title: 'Veja o Resultado',
      description: 'Assim que você terminar, o memorial será exibido pronto na tela para você visualizar. Veja como ficou a homenagem completa, confira cada detalhe e sinta o resultado. O memorial fica salvo no seu perfil, pronto para quando você decidir publicar.',
      image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80',
      highlight: 'Prévia instantânea'
    },
    {
      number: '03',
      icon: CreditCard,
      title: 'Escolha um Plano',
      description: 'Se gostar do resultado, escolha o plano que melhor atende suas necessidades: o Plano Digital para publicar o memorial online, ou o Plano Placa QR Code para receber também uma placa física de aço inox com QR Code gravado para colocar no túmulo.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
      highlight: 'Pague só se quiser publicar'
    }
  ];

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24 overflow-x-hidden" data-testid="how-it-works-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light tracking-tight leading-tight mb-4 md:mb-6"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            data-testid="page-title"
          >
            Como Funciona
          </h1>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed font-light text-muted-foreground max-w-3xl mx-auto px-4">
            Criar um memorial eterno é simples, rápido e feito com muito respeito. 
            Em apenas 3 passos você homenageia quem você ama.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-16 md:space-y-24">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center`}
                data-testid={`step-${index}`}
              >
                {/* Image */}
                <div className="w-full md:w-1/2">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-56 sm:h-64 md:h-80 object-cover"
                    />
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                      {step.highlight}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2 px-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <div className="text-4xl sm:text-5xl md:text-6xl font-light text-primary/30" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      {step.number}
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 md:mb-4">
                    {step.title}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 md:mt-24">
          <Link to="/create-memorial">
            <Button size="lg" className="rounded-full px-8 sm:px-12 py-5 md:py-7 text-sm sm:text-base md:text-lg font-semibold">
              COMEÇAR AGORA
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* What's Included */}
        <div className="mt-20 md:mt-32">
          <Card className="bg-secondary/30 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 sm:p-8 md:p-12">
              <h2 className="text-2xl sm:text-3xl font-light mb-6 md:mb-8 text-center" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                O que está incluído?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm md:text-base mb-1">Memorial Digital Completo</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Página personalizada com fotos, biografia e áudio</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm md:text-base mb-1">QR Code Único</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Acesso instantâneo ao memorial de qualquer lugar</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm md:text-base mb-1">Galeria de Fotos</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Até 10 imagens para preservar momentos especiais</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm md:text-base mb-1">Placa de Aço Inox (Opcional)</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Durabilidade e elegância para eternizar a homenagem</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm md:text-base mb-1">Hospedagem Eterna</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Seu memorial fica disponível para sempre</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm md:text-base mb-1">Suporte Dedicado</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Atendimento via WhatsApp para qualquer dúvida</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
