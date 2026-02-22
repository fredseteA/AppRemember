import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { ShoppingCart } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyPurchases = () => {
  const { token } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get(`${API}/payments/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPurchases(response.data);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [token]);

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: { label: 'Aprovado', variant: 'default' },
      pending: { label: 'Pendente', variant: 'secondary' },
      rejected: { label: 'Rejeitado', variant: 'destructive' },
      in_process: { label: 'Processando', variant: 'secondary' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    return (
      <Badge variant={statusInfo.variant} className="capitalize">
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24" data-testid="my-purchases-loading">
        <div className="max-w-5xl mx-auto px-6">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24" data-testid="my-purchases-page">
      <div className="max-w-5xl mx-auto px-6">
        <h1
          className="text-5xl font-light tracking-tight mb-12"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
          data-testid="page-title"
        >
          Minhas Compras
        </h1>

        {purchases.length === 0 ? (
          <div className="text-center py-20" data-testid="no-purchases-message">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              Você ainda não realizou nenhuma compra
            </p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="purchases-list">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="border border-border/50" data-testid={`purchase-card-${purchase.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium">Plano {purchase.plan_type}</h3>
                        {getStatusBadge(purchase.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Pedido #{purchase.id.substring(0, 8)}
                      </p>
                      {purchase.mercadopago_payment_id && (
                        <p className="text-xs text-muted-foreground">
                          ID Mercado Pago: {purchase.mercadopago_payment_id}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        R$ {purchase.amount.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(purchase.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPurchases;