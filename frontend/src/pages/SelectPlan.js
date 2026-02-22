import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { Check, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SelectPlan = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [memorial, setMemorial] = useState(null);

  useEffect(() => {
    const fetchMemorial = async () => {
      try {
        const response = await axios.get(`${API}/memorials/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMemorial(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (user) fetchMemorial();
  }, [id, user, token]);

  const plans = [
    {
      id: 'digital',
      name: 'Plano Digital',
      price: 29.90,
      features: [
        'Memorial digital completo',
        'Galeria de até 10 fotos',
        'Áudio de homenagem',
        'QR Code digital',
        'Publicação instantânea',
        'Hospedagem eterna'
      ]
    },
    {
      id: 'plaque',
      name: 'Plano Placa QR Code',
      price: 119.90,
      features: [
        'Tudo do Plano Digital',
        'Placa física em aço inox',
        'QR Code gravado permanente',
        'Envio para todo Brasil',
        'Suporte prioritário',
        'Rastreamento de entrega'
      ],
      highlighted: true
    }
  ];

  const handleSelectPlan = async (plan) => {
    if (!user) {
      toast.error('Faça login para continuar');
      return;
    }

    setLoading(true);

    try {
      console.log('=== INICIANDO PROCESSO DE PAGAMENTO ===');
      console.log('Plano selecionado:', plan.id);
      console.log('Memorial ID:', id);
      console.log('Usuário:', user.email);

      const payload = {
        memorial_id: id,
        plan_type: plan.id,
        transaction_amount: plan.price,
        description: `${plan.name} - Memorial de ${memorial?.person_data?.full_name || 'homenageado'}`,
        payer_email: user.email,
        payment_method_id: 'account_money'
      };

      console.log('Enviando requisição para backend:', payload);

      const response = await axios.post(
        `${API}/payments/create-checkout`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('✅ Resposta do backend:', response.data);

      if (response.data.success && response.data.checkout_url) {
        console.log('Redirecionando para checkout:', response.data.checkout_url);
        toast.success('Redirecionando para o pagamento...');
        
        // Redirecionar para o checkout do Mercado Pago
        window.location.href = response.data.checkout_url;
      } else {
        console.error('❌ Resposta inválida do backend:', response.data);
        toast.error('Erro ao criar checkout. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ ERRO AO PROCESSAR PAGAMENTO');
      console.error('Erro completo:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Dados:', error.response.data);
        console.error('Headers:', error.response.headers);
        
        const errorMessage = error.response.data?.detail || 'Erro ao processar pagamento';
        toast.error(errorMessage);
      } else if (error.request) {
        console.error('Nenhuma resposta recebida do servidor');
        console.error('Request:', error.request);
        toast.error('Erro de conexão com o servidor');
      } else {
        console.error('Erro ao configurar requisição:', error.message);
        toast.error('Erro inesperado: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24" data-testid="select-plan-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h1
            className="text-5xl md:text-6xl font-light tracking-tight leading-tight mb-6"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            data-testid="page-title"
          >
            Escolha seu Plano
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            Selecione o plano ideal para eternizar as memórias
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`border overflow-hidden shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.15)] transition-all duration-700 ${
                plan.highlighted ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'
              }`}
              data-testid={`plan-card-${plan.id}`}
            >
              <CardContent className="p-8">
                {plan.highlighted && (
                  <div className="text-xs font-medium tracking-widest uppercase text-primary mb-4">
                    RECOMENDADO
                  </div>
                )}
                <h3 className="text-2xl font-medium mb-2">{plan.name}</h3>
                <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  R$ {plan.price.toFixed(2).replace('.', ',')}
                </div>
                <p className="text-sm text-muted-foreground mb-6">Pagamento único</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full rounded-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loading}
                  data-testid={`button-select-${plan.id}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Selecionar Plano'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectPlan;
