import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Clock } from 'lucide-react';

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    console.log('=== PAGAMENTO PENDENTE ===');
    console.log('Payment ID:', paymentId);
  }, [paymentId]);

  return (
    <div className="pt-32 pb-24" data-testid="payment-pending-page">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <Card className="border-2 border-yellow-500">
          <CardContent className="p-12">
            <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4" data-testid="pending-title">
              Pagamento Pendente
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Estamos aguardando a confirmação do seu pagamento. Assim que for aprovado, seu memorial será publicado automaticamente.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <p className="text-sm text-yellow-800">
                Você receberá uma notificação quando o pagamento for confirmado. Isso pode levar alguns minutos.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/my-memorials')} 
                data-testid="button-view-memorials"
                className="rounded-full"
              >
                Ver Meus Memoriais
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                onClick={() => navigate('/')} 
                data-testid="button-home"
                className="rounded-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPending;
