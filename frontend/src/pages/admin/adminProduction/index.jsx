import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import axios from 'axios';
import { toast } from 'sonner';
import { Package, Smartphone } from 'lucide-react';
import { PhysicalTab, DigitalTab, TabBadge } from './components/index.js';
import { API } from '@/config.js';

const AdminProduction = () => {
  const { token } = useAuth();
  const [loading, setLoading]     = useState(true);
  const [queue, setQueue]         = useState([]);
  const [activeTab, setActiveTab] = useState('physical');

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/production-queue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueue(res.data);
    } catch (err) {
      console.error('Error fetching queue:', err);
      toast.error('Erro ao carregar fila de produção');
    } finally {
      setLoading(false);
    }
  }, [token]);
  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const handleAction = async (orderId, action, trackingCode = null) => {
    try {
      let endpoint = '';
      let data     = {};
      switch (action) {
        case 'start':          endpoint = `${API}/admin/production/${orderId}/start`; break;
        case 'complete':       endpoint = `${API}/admin/production/${orderId}/complete`; break;
        case 'ship_correios':  endpoint = `${API}/admin/orders/${orderId}/tracking`; data = { tracking_code: trackingCode, delivery_type: 'correios' }; break;
        case 'ship_local':     endpoint = `${API}/admin/orders/${orderId}/tracking`; data = { tracking_code: 'ENTREGA_LOCAL', delivery_type: 'local' }; break;
        case 'deliver':        endpoint = `${API}/admin/orders/${orderId}/status`; data = { status: 'entregue' }; break;
        case 'cancel':         endpoint = `${API}/admin/orders/${orderId}/cancel`; break;
        default: return;
      }
      await axios.put(endpoint, data, { headers: { Authorization: `Bearer ${token}` } });
      setQueue(prev => prev.map(order => {
        if (order.id !== orderId) return order;
        const statusMap = { start: 'in_production', complete: 'produced', ship_correios: 'shipped', ship_local: 'shipped', deliver: 'entregue', cancel: 'cancelled' };
        return {
          ...order,
          status: statusMap[action] || order.status,
          tracking_code: trackingCode || order.tracking_code,
          delivery_type: action === 'ship_local' ? 'local' : action === 'ship_correios' ? 'correios' : order.delivery_type,
        };
      }));
      const messages = {
        start: '✅ Produção iniciada!', complete: '✅ Produção concluída!',
        ship_correios: '✅ Pedido enviado!', ship_local: '✅ Entrega local confirmada!',
        deliver: '✅ Pedido entregue!', cancel: '✅ Pedido cancelado.',
      };
      toast.success(messages[action] || 'Ação realizada!');
    } catch (err) {
      console.error('Error performing action:', err);
      toast.error('Erro ao realizar ação');
    }
  };

  const physicalOrders = queue.filter(o => o.is_physical);
  const digitalOrders  = queue.filter(o => !o.is_physical);
  const physicalPending = physicalOrders.filter(o => o.status !== 'cancelled' && o.status !== 'entregue').length;
  const digitalPending  = digitalOrders.filter(o => o.status !== 'cancelled').length;

  if (loading) {
    return (
      <div className="space-y-6" data-testid="production-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-[#16202e] rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-production">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">Gestão</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Fila de Produção</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#94a3b8]">
          <span>{physicalOrders.filter(o => o.status !== 'cancelled').length} físicos ativos</span>
          <span>·</span>
          <span>{digitalOrders.filter(o => o.status !== 'cancelled').length} digitais ativos</span>
        </div>
      </div>

      <div className="flex gap-1 bg-[#0b121b] rounded-xl p-1 w-fit border border-[#2d3a52]">
        <button onClick={() => setActiveTab('physical')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'physical' ? 'bg-[#3b82f6] text-white shadow' : 'text-[#94a3b8] hover:text-white hover:bg-[#16202e]'
          }`}>
          <Package size={15} />
          Físicos
          <TabBadge count={physicalPending} />
        </button>
        <button onClick={() => setActiveTab('digital')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'digital' ? 'bg-[#3b82f6] text-white shadow' : 'text-[#94a3b8] hover:text-white hover:bg-[#16202e]'
          }`}>
          <Smartphone size={15} />
          Digitais
          <TabBadge count={digitalPending} />
        </button>
      </div>

      {activeTab === 'physical'
        ? <PhysicalTab queue={physicalOrders} onAction={handleAction} />
        : <DigitalTab  queue={digitalOrders}  onAction={handleAction} />
      }
    </div>
  );
};

export default AdminProduction;