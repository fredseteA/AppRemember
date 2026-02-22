import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { XCircle } from 'lucide-react';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    console.log('=== PAGAMENTO FALHOU ===');
    console.log('Payment ID:', paymentId);
  }, [paymentId]);

  return (
    <div className="pt-32 pb-24" data-testid="payment-failure-page">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <Card className="border-2 border-red-500">
          <CardContent className="p-12">
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4" data-testid="failure-title">
              Pagamento Não Realizado
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              O pagamento não foi concluído. Você pode tentar novamente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/my-memorials')} 
                data-testid="button-try-again"
                className="rounded-full"
              >
                Tentar Novamente
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

export default PaymentFailure;
