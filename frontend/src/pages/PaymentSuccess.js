import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');
  const collectionId = searchParams.get('collection_id');
  const collectionStatus = searchParams.get('collection_status');

  useEffect(() => {
    console.log('=== PAGAMENTO APROVADO ===');
    console.log('Payment ID:', paymentId);
    console.log('Collection ID:', collectionId);
    console.log('Status:', collectionStatus);
  }, [paymentId, collectionId, collectionStatus]);

  return (
    <div className="pt-32 pb-24" data-testid="payment-success-page">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <Card className="border-2 border-green-500">
          <CardContent className="p-12">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4" data-testid="success-title">
              Pagamento Aprovado!
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Seu memorial foi publicado com sucesso e já está disponível.
            </p>

            {collectionId && (
              <p className="text-sm text-muted-foreground mb-6">
                ID do Pagamento: {collectionId}
              </p>
            )}
            
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

export default PaymentSuccess;
