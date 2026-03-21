import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  FileText,
  User,
  ShoppingCart,
  Heart,
  Star,
  Users,
  RefreshCw
} from 'lucide-react';
import { formatDateTime } from '@/utils';
import { API } from '@/config';

const ACTION_LABELS = {
  update_status: 'Atualizou status',
  archive_order: 'Arquivou pedido',
  cancel_order: 'Cancelou pedido',
  add_tracking: 'Adicionou rastreio',
  start_production: 'Iniciou produção',
  complete_production: 'Concluiu produção',
  create_partner: 'Criou parceiro',
  update_partner: 'Atualizou parceiro',
  pay_commission: 'Pagou comissão',
  update_memorial: 'Atualizou memorial',
  toggle_memorial: 'Alterou status memorial',
  feature_memorial: 'Alterou destaque memorial',
  approve_review: 'Aprovou avaliação',
  reject_review: 'Reprovou avaliação',
  respond_review: 'Respondeu avaliação',
  delete_review: 'Excluiu avaliação'
};

const ENTITY_ICONS = {
  order: ShoppingCart,
  memorial: Heart,
  review: Star,
  partner: Users
};

const ENTITY_COLORS = {
  order: '#3b82f6',
  memorial: '#8b5cf6',
  review: '#f59e0b',
  partner: '#10b981'
};

const AdminLogs = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.entity_type = filter;
      const response = await axios.get(`${API}/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  }, [token, filter]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const refreshLogs = () => {
    fetchLogs();
    toast.success('Logs atualizados');
  };

  if (loading) {
    return (
      <div className="space-y-6" data-testid="logs-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-16 bg-[#16202e] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-logs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">
            Sistema
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Logs Administrativos</h1>
        </div>
        
        <button
          onClick={refreshLogs}
          className="flex items-center gap-2 px-4 py-2 bg-[#2d3a52] text-white rounded-lg text-sm font-medium hover:bg-[#374763] transition-colors"
          data-testid="refresh-logs-btn"
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Todos', icon: FileText },
          { value: 'order', label: 'Pedidos', icon: ShoppingCart },
          { value: 'memorial', label: 'Memoriais', icon: Heart },
          { value: 'review', label: 'Avaliações', icon: Star },
          { value: 'partner', label: 'Parceiros', icon: Users }
        ].map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-[#16202e] text-[#94a3b8] hover:text-white border border-[#2d3a52]'
              }`}
              data-testid={`filter-${opt.value}`}
            >
              <Icon size={16} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-12 text-center">
          <FileText className="mx-auto mb-4 text-[#94a3b8]" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Sem logs</h3>
          <p className="text-[#94a3b8]">Nenhuma ação administrativa registrada ainda.</p>
        </div>
      ) : (
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1e2b3e]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Data/Hora
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Administrador
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Ação
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Entidade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d3a52]">
                {logs.map(log => {
                  const Icon = ENTITY_ICONS[log.entity_type] || FileText;
                  const color = ENTITY_COLORS[log.entity_type] || '#94a3b8';
                  
                  return (
                    <tr 
                      key={log.id}
                      className="hover:bg-[#1e2b3e]/50 transition-colors"
                      data-testid={`log-row-${log.id}`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm text-[#94a3b8]">
                          {formatDateTime(log.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#3b82f6]/10 flex items-center justify-center">
                            <User size={14} className="text-[#3b82f6]" />
                          </div>
                          <span className="text-sm text-white truncate max-w-[150px]">
                            {log.admin_email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-white">
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <Icon size={14} style={{ color }} />
                          </div>
                          <span className="text-xs text-[#94a3b8] font-mono">
                            {log.entity_id?.substring(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <div className="text-xs text-[#94a3b8] max-w-[200px] truncate">
                            {Object.entries(log.details)
                              .filter(([, v]) => v !== undefined && v !== null)
                              .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                              .join(', ')
                            }
                          </div>
                        ) : (
                          <span className="text-xs text-[#94a3b8]/50">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Summary */}
      <div className="text-sm text-[#94a3b8]">
        Mostrando {logs.length} registros
      </div>
    </div>
  );
};

export default AdminLogs;
