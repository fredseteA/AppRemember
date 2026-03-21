import { useState, useMemo } from 'react';
import { Package, Search } from 'lucide-react';
import { Section } from '../utils';
import { ProductionCard } from './index';

const getQueueTime = (createdAt) => {
  if (!createdAt) return null;
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days >= 1) return { text: `há ${days} dia${days > 1 ? 's' : ''}`, days };
  if (hours >= 1) return { text: `há ${hours}h`, days: 0 };
  return { text: `há ${mins}min`, days: 0 };
};
const getPriority = (order) => {
  if (order.status !== 'approved' && order.status !== 'paid') return 'normal';
  const days = getQueueTime(order.created_at)?.days ?? 0;
  if (days >= 3) return 'urgent';
  if (days >= 2) return 'late';
  return 'normal';
};
// ─── Etapa 3: Filtros e busca ─────────────────────────────────────────────────
const FILTER_OPTIONS = [
  { key: 'all',           label: 'Todos'        },
  { key: 'approved',      label: 'Aguardando'   },
  { key: 'in_production', label: 'Em Produção'  },
  { key: 'produced',      label: 'Pronto'       },
  { key: 'shipped',       label: 'Enviado'      },
  { key: 'entregue',      label: 'Entregue'     },
];

const KANBAN_COLUMNS = [
  { id: 'waiting',   title: 'Aguardando Produção',          color: 'bg-yellow-500',  statuses: ['approved', 'paid'] },
  { id: 'producing', title: 'Em Produção',                  color: 'bg-purple-500',  statuses: ['in_production']    },
  { id: 'produced',  title: 'Produzidos — Aguardando Envio', color: 'bg-blue-500',   statuses: ['produced']         },
  { id: 'shipped',   title: 'Enviados — Aguardando Confirm.',color: 'bg-green-500',  statuses: ['shipped']          },
  { id: 'delivered', title: 'Entregues',                    color: 'bg-emerald-500', statuses: ['entregue'],  limit: 6 },
  { id: 'cancelled', title: 'Cancelados',                   color: 'bg-red-500',     statuses: ['cancelled'], limit: 6 },
];

const PhysicalTab = ({ queue, onAction }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch]             = useState('');

  // Filtragem mantida igual à Etapa 3
  const filtered = useMemo(() => {
    let q = queue;
    if (filterStatus !== 'all') q = q.filter(o => o.status === filterStatus);
    if (search.trim()) {
      const s = search.toLowerCase();
      q = q.filter(o =>
        o.person_name?.toLowerCase().includes(s) ||
        o.user_email?.toLowerCase().includes(s) ||
        o.id?.toLowerCase().includes(s)
      );
    }
    return q;
  }, [queue, filterStatus, search]);

  // Monta colunas a partir de KANBAN_COLUMNS — estrutura pronta para Kanban
  const columns = useMemo(() =>
    KANBAN_COLUMNS.map(col => ({
      ...col,
      orders: filtered
        .filter(o => col.statuses.includes(o.status))
        .slice(0, col.limit ?? Infinity),
    })).filter(col => col.orders.length > 0),
  [filtered]);

  const activeCount  = queue.filter(o => o.status !== 'cancelled').length;
  const urgentCount  = queue.filter(o => getPriority(o) === 'urgent').length;
  const lateCount    = queue.filter(o => getPriority(o) === 'late').length;

  return (
    <div className="space-y-6">

      {/* Alertas de prioridade — Etapa 4 */}
      {(urgentCount > 0 || lateCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {urgentCount > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
              <span className="text-red-400 font-semibold text-sm">🔴 {urgentCount} urgente{urgentCount > 1 ? 's' : ''}</span>
              <span className="text-red-400/70 text-xs">aguardando há +3 dias</span>
            </div>
          )}
          {lateCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2.5">
              <span className="text-amber-400 font-semibold text-sm">⚠ {lateCount} atrasado{lateCount > 1 ? 's' : ''}</span>
              <span className="text-amber-400/70 text-xs">aguardando há +2 dias</span>
            </div>
          )}
        </div>
      )}

      {/* Filtros + Busca — Etapa 3 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Buscar nome, email, pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white text-sm placeholder:text-[#94a3b8]/50 focus:border-[#3b82f6] outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilterStatus(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === opt.key
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-[#16202e] text-[#94a3b8] border border-[#2d3a52] hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      {activeCount === 0 ? (
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-12 text-center">
          <Package className="mx-auto mb-4 text-[#94a3b8]" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Fila vazia</h3>
          <p className="text-[#94a3b8]">Não há pedidos de placas aguardando produção.</p>
        </div>
      ) : columns.length === 0 ? (
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-8 text-center">
          <Search className="mx-auto mb-3 text-[#94a3b8]" size={32} />
          <p className="text-[#94a3b8] text-sm">Nenhum pedido encontrado para este filtro.</p>
        </div>
      ) : (
        // ── Layout atual: seções empilhadas ──────────────────────────────────
        // Para ativar Kanban: troque "space-y-8" por "flex gap-4 overflow-x-auto items-start"
        // e em Section adicione "min-w-[320px] flex-shrink-0"
        <div className="space-y-8">
          {columns.map(col => (
            <Section key={col.id} title={col.title} color={col.color} count={col.orders.length}>
              {col.orders.map(o => (
                <ProductionCard key={o.id} order={o} onAction={onAction} />
              ))}
            </Section>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhysicalTab 