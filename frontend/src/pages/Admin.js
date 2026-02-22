import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Package, Heart, ShoppingBag, Star, Check, X, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Admin = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [memorials, setMemorials] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [statsRes, ordersRes, memorialsRes, reviewsRes] = await Promise.all([
          axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/admin/memorials`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/admin/reviews`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setStats(statsRes.data);
        setOrders(ordersRes.data);
        setMemorials(memorialsRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Erro ao carregar dados administrativos');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAdminData();
  }, [user, token, navigate]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Tem certeza que deseja EXCLUIR este pedido? Esta ação não pode ser desfeita.')) return;
    
    try {
      await axios.delete(
        `${API}/admin/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(orders.filter(order => order.id !== orderId));
      
      // Atualizar stats
      setStats(prev => ({
        ...prev,
        total_orders: (prev?.total_orders || 1) - 1
      }));
      
      toast.success('Pedido excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao excluir pedido');
    }
  };

  const approveReview = async (reviewId) => {
    try {
      await axios.put(
        `${API}/admin/reviews/${reviewId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReviews(reviews.map(review => 
        review.id === reviewId ? { ...review, approved: true } : review
      ));
      
      toast.success('Avaliação aprovada com sucesso!');
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Erro ao aprovar avaliação');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    
    try {
      await axios.delete(
        `${API}/admin/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReviews(reviews.filter(review => review.id !== reviewId));
      
      toast.success('Avaliação excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Erro ao excluir avaliação');
    }
  };

  const pendingReviews = reviews.filter(r => !r.approved).length;

  if (loading) {
    return (
      <div className="pt-32 pb-24" data-testid="admin-loading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1
          className="text-3xl md:text-5xl font-light tracking-tight mb-8 md:mb-12"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
          data-testid="page-title"
        >
          Painel Administrativo
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          <Card className="border border-border/50" data-testid="stat-memorials">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Memoriais</p>
                  <p className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {stats?.total_memorials || 0}
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50" data-testid="stat-orders">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Pedidos</p>
                  <p className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {stats?.total_orders || 0}
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50" data-testid="stat-plaques">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Placas</p>
                  <p className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {stats?.total_plaques || 0}
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50" data-testid="stat-reviews">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Avaliações</p>
                  <p className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {reviews.length}
                  </p>
                  {pendingReviews > 0 && (
                    <p className="text-xs text-orange-600 font-medium">
                      {pendingReviews} pendente{pendingReviews > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="orders" data-testid="tab-orders" className="text-sm">
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="memorials" data-testid="tab-memorials" className="text-sm">
              Memoriais
            </TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews" className="text-sm relative">
              Avaliações
              {pendingReviews > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingReviews}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" data-testid="orders-tab-content">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card className="border border-border/50">
                  <CardContent className="p-8 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum pedido encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="border border-border/50" data-testid={`order-card-${order.id}`}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-base md:text-lg font-medium">Pedido #{order.id.substring(0, 8)}</h3>
                            <Badge variant="secondary" className="capitalize text-xs">
                              {order.plan_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1 break-all">
                            Cliente: {order.user_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="text-left sm:text-right">
                            <p className="text-lg md:text-xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              R$ {order.amount.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-full sm:w-[180px]" data-testid={`select-status-${order.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="approved">Aprovado</SelectItem>
                              <SelectItem value="in_process">Em Produção</SelectItem>
                              <SelectItem value="shipped">Enviado</SelectItem>
                              <SelectItem value="delivered">Entregue</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                            onClick={() => deleteOrder(order.id)}
                            data-testid={`delete-order-${order.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Memorials Tab */}
          <TabsContent value="memorials" data-testid="memorials-tab-content">
            {memorials.length === 0 ? (
              <Card className="border border-border/50">
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum memorial encontrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {memorials.map((memorial) => (
                  <Card key={memorial.id} className="border border-border/50" data-testid={`memorial-card-${memorial.id}`}>
                    <div className="relative h-40 md:h-48 overflow-hidden">
                      {memorial.person_data.photo_url ? (
                        <img
                          src={memorial.person_data.photo_url}
                          alt={memorial.person_data.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                          <Heart className="h-12 w-12 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                        <Badge variant={memorial.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                          {memorial.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${memorial.person_data.public_memorial ? 'bg-green-50' : ''}`}>
                          {memorial.person_data.public_memorial ? 'Público' : 'Privado'}
                        </Badge>
                      </div>
                      <h3 className="text-base md:text-lg font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        {memorial.person_data.full_name}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Criado por: {memorial.responsible.name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" data-testid="reviews-tab-content">
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card className="border border-border/50">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card 
                    key={review.id} 
                    className={`border ${review.approved ? 'border-green-200 bg-green-50/30' : 'border-orange-200 bg-orange-50/30'}`}
                    data-testid={`review-card-${review.id}`}
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          {/* Header com nome e status */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-base md:text-lg font-semibold">{review.user_name}</h3>
                            <Badge 
                              variant={review.approved ? 'default' : 'secondary'}
                              className={`text-xs ${review.approved ? 'bg-green-600' : 'bg-orange-500'}`}
                            >
                              {review.approved ? 'Aprovada' : 'Pendente'}
                            </Badge>
                          </div>
                          
                          {/* Email */}
                          <p className="text-xs text-muted-foreground mb-2 break-all">
                            {review.user_email}
                          </p>
                          
                          {/* Estrelas */}
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="text-sm ml-2 text-muted-foreground">
                              ({review.rating}/5)
                            </span>
                          </div>
                          
                          {/* Título */}
                          {review.title && (
                            <p className="font-medium text-sm md:text-base mb-1">"{review.title}"</p>
                          )}
                          
                          {/* Comentário */}
                          {review.comment && (
                            <p className="text-sm text-muted-foreground">
                              {review.comment}
                            </p>
                          )}
                          
                          {/* Data */}
                          <p className="text-xs text-muted-foreground mt-3">
                            {new Date(review.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        
                        {/* Ações */}
                        <div className="flex gap-2 shrink-0">
                          {!review.approved && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                              onClick={() => approveReview(review.id)}
                              data-testid={`approve-${review.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                            onClick={() => deleteReview(review.id)}
                            data-testid={`delete-${review.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
