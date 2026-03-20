import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import DeliveryAddressPanel from '@/components/address/DeliveryAddressPanel.jsx';
import {
  Search,
  Archive,
  X,
  Truck,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  History
} from 'lucide-react';
import { API } from '@/config.js';
import { formatCurrency } from '../utils';

const STATUS_CONFIG = {
  pending: { label: 'Aguardando Pagamento', color: 'yellow', icon: Clock },
  approved: { label: 'Pago', color: 'green', icon: CheckCircle },
  paid: { label: 'Pago', color: 'green', icon: CheckCircle },
  in_production: { label: 'Em Produção', color: 'purple', icon: Package },
  produced: { label: 'Produzido', color: 'blue', icon: Package },
  shipped: { label: 'Enviado', color: 'orange', icon: Truck },
  delivered: { label: 'Entregue', color: 'emerald', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'red', icon: XCircle },
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Aguardando Pagamento' },
  { value: 'approved', label: 'Pago' },
  { value: 'in_production', label: 'Em Produção' },
  { value: 'produced', label: 'Produzido' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        bg-${config.color}-500/10 text-${config.color}-500 border border-${config.color}-500/20
      `}
      data-testid={`status-badge-${status}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AdminOrders = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showHistory, setShowHistory] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { archived: showArchived }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, [token, showArchived]);

  const filterOrders = useCallback(() => {
    let filtered = [...orders];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.id?.toLowerCase().includes(term) ||
        o.user_email?.toLowerCase().includes(term) ||
        o.memorial_id?.toLowerCase().includes(term)
      );
    }
    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { filterOrders(); }, [filterOrders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const archiveOrder = async (orderId) => {
    if (!window.confirm('Tem certeza que deseja arquivar este pedido?')) return;
    
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/archive`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(orders.filter(o => o.id !== orderId));
      toast.success('Pedido arquivado!');
    } catch (error) {
      console.error('Error archiving order:', error);
      toast.error('Erro ao arquivar pedido');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) return;
    
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ));
      toast.success('Pedido cancelado!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Erro ao cancelar pedido');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" data-testid="orders-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-[#16202e] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-orders">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">
            Gestão
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Pedidos</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-[#94a3b8] cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-[#2d3a52] bg-[#0b121b] text-[#3b82f6]"
              data-testid="show-archived-checkbox"
            />
            Mostrar arquivados
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
          <input
            type="text"
            placeholder="Buscar por ID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white placeholder:text-[#94a3b8]/50 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors"
            data-testid="search-input"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#3b82f6] text-white'
                : 'bg-[#16202e] text-[#94a3b8] hover:text-white border border-[#2d3a52]'
            }`}
            data-testid="filter-all"
          >
            Todos ({orders.length})
          </button>
          {STATUS_OPTIONS.slice(0, 4).map(opt => {
            const count = orders.filter(o => o.status === opt.value).length;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#16202e] text-[#94a3b8] hover:text-white border border-[#2d3a52]'
                }`}
                data-testid={`filter-${opt.value}`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e2b3e]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Pedido
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Data
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3a52]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <AlertCircle className="mx-auto mb-3 text-[#94a3b8]" size={32} />
                    <p className="text-[#94a3b8]">Nenhum pedido encontrado</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <>
                    <tr 
                      key={order.id} 
                      className="hover:bg-[#1e2b3e]/50 transition-colors"
                      data-testid={`order-row-${order.id}`}
                    >
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-white">
                          #{order.id?.substring(0, 8)}
                        </p>
                        <p className="text-xs text-[#94a3b8] mt-0.5">
                          {order.memorial_id?.substring(0, 8)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-white truncate max-w-[200px]">
                          {order.user_email}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`
                          inline-flex px-2 py-1 rounded text-xs font-medium
                          ${order.plan_type?.includes('plaque') || order.plan_type === 'complete'
                            ? 'bg-[#f59e0b]/10 text-[#f59e0b]'
                            : 'bg-[#3b82f6]/10 text-[#3b82f6]'
                          }
                        `}>
                          {order.plan_type === 'digital' ? 'Digital' : 
                          order.plan_type === 'plaque' || order.plan_type === 'qrcode_plaque' ? 'Placa QR' :
                          order.plan_type === 'complete' ? 'Completo' : order.plan_type}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(order.amount)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-[#94a3b8]">
                          {formatDate(order.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Status Dropdown */}
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              className="appearance-none bg-[#0b121b] border border-[#2d3a52] rounded-lg px-3 py-1.5 pr-8 text-sm text-white cursor-pointer focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                              data-testid={`status-select-${order.id}`}
                            >
                              {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" size={14} />
                          </div>
                          
                          {/* History Button */}
                          <button
                            onClick={() => setShowHistory(showHistory === order.id ? null : order.id)}
                            className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#2d3a52] transition-colors"
                            title="Histórico"
                            data-testid={`history-btn-${order.id}`}
                          >
                            <History size={16} />
                          </button>
                          
                          {['plaque', 'complete', 'qrcode_plaque'].includes(order.plan_type) && (
                            <button
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                expandedOrder === order.id
                                  ? 'text-[#3b82f6] bg-[#3b82f6]/10'
                                  : 'text-[#94a3b8] hover:text-[#3b82f6] hover:bg-[#3b82f6]/10'
                              }`}
                              title="Ver endereço de entrega"
                            >
                              <Package size={16} />
                            </button>
                          )}

                          {/* Archive Button */}
                          {!order.archived && (
                            <button
                              onClick={() => archiveOrder(order.id)}
                              className="p-2 rounded-lg text-[#94a3b8] hover:text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-colors"
                              title="Arquivar"
                              data-testid={`archive-btn-${order.id}`}
                            >
                              <Archive size={16} />
                            </button>
                          )}
                          
                          {/* Cancel Button */}
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button
                              onClick={() => cancelOrder(order.id)}
                              className="p-2 rounded-lg text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
                              title="Cancelar"
                              data-testid={`cancel-btn-${order.id}`}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                        
                        {/* History Panel */}
                        {showHistory === order.id && order.status_history?.length > 0 && (
                          <div className="absolute right-4 mt-2 w-72 bg-[#1e2b3e] border border-[#2d3a52] rounded-lg shadow-xl z-10 p-4">
                            <h4 className="text-sm font-semibold text-white mb-3">Histórico de Status</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {order.status_history.map((entry, idx) => (
                                <div key={idx} className="text-xs border-l-2 border-[#3b82f6] pl-3 py-1">
                                  <p className="text-white">
                                    {STATUS_CONFIG[entry.from_status]?.label || entry.from_status} → {STATUS_CONFIG[entry.to_status]?.label || entry.to_status}
                                  </p>
                                  <p className="text-[#94a3b8] mt-0.5">{entry.changed_by}</p>
                                  <p className="text-[#94a3b8]">{formatDate(entry.changed_at)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                    {/* Linha expansível com endereço — só para planos físicos */}
                    {['plaque', 'complete', 'qrcode_plaque'].includes(order.plan_type) && 
                    expandedOrder === order.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: '0 16px 16px' }}>
                          <DeliveryAddressPanel order={order} />
                        </td>
                      </tr>
                    )}
                 </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-[#94a3b8]">
        <p>Mostrando {filteredOrders.length} de {orders.length} pedidos</p>
      </div>
    </div>
  );
};

export default AdminOrders;
