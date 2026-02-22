import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import QRCode from 'react-qr-code';
import { CheckCircle2, Clock } from 'lucide-react';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const { qrCode, qrCodeBase64, amount } = location.state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      setPaymentStatus('approved');
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (paymentStatus === 'approved') {
    return (
      <div className="pt-32 pb-24" data-testid="payment-success-page">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Card className="border border-border/50">
            <CardContent className="p-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1
                className="text-4xl font-light tracking-tight mb-4"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                data-testid="success-title"
              >
                Pagamento Aprovado!
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Seu memorial foi publicado com sucesso e já está disponível.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/my-memorials')} data-testid="button-view-memorials">
                  Ver Meus Memoriais
                </Button>
                <Button variant="outline" onClick={() => navigate('/')} data-testid="button-home">
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24" data-testid="payment-page">
      <div className="max-w-2xl mx-auto px-6">
        <Card className="border border-border/50">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1
                className="text-4xl font-light tracking-tight mb-4"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                data-testid="payment-title"
              >
                Finalize seu Pagamento
              </h1>
              <p className="text-lg text-muted-foreground">
                Escaneie o QR Code do Pix para pagar
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-inner mb-8 flex justify-center">
              {qrCodeBase64 ? (
                <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code PIX" className="max-w-xs" data-testid="qr-code-image" />
              ) : qrCode ? (
                <QRCode value={qrCode} size={256} data-testid="qr-code" />
              ) : (
                <div className="text-center text-muted-foreground">QR Code não disponível</div>
              )}
            </div>

            <div className="text-center mb-8">
              <p className="text-3xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                R$ {amount ? amount.toFixed(2).replace('.', ',') : '0,00'}
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 animate-pulse" />
                <span>Aguardando confirmação do pagamento...</span>
              </div>
            </div>

            <div className="bg-secondary/20 rounded-lg p-6 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Instruções:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abra o aplicativo do seu banco</li>
                <li>Escolha a opção Pix</li>
                <li>Escaneie o QR Code acima</li>
                <li>Confirme o pagamento</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;