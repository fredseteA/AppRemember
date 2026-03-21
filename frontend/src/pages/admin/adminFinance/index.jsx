import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import AdminCostSettings from '../adminCostSettings/index.jsx';
import {
  DollarSign, Download, TrendingUp, Calendar,
  Filter, Clock, CheckCircle2, Banknote,
  ChevronDown, ChevronUp, Package, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { fmt, CHART_COLORS } from '../utils';
import { API } from '@/config.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2b3e] border border-[#2d3a52] rounded-lg p-3 shadow-xl">
      <p className="text-white font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>{fmt(entry.value)}</p>
      ))}
    </div>
  );
};

// ─── Painel de comissões disponíveis ─────────────────────────────────────────
const CommissionPanel = ({ token }) => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]       = useState(false);
  const [paying, setPaying]   = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/commissions/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  }, [token]);

  // 3. adicione fetchItems no array
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const markPaid = async (commissionId, partnerName) => {
    if (!window.confirm(`Marcar comissão de ${partnerName} como paga?`)) return;
    setPaying(commissionId);
    try {
      await axios.put(`${API}/admin/commissions/${commissionId}/pay`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Comissão marcada como paga!');
      fetchItems();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erro ao marcar como pago');
    } finally { setPaying(null); }
  };

  const total = items.reduce((s, i) => s + (i.commission_amount || 0), 0);

  return (
    <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#1a2535] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center">
            <CheckCircle2 className="text-[#3b82f6]" size={20} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Comissões Disponíveis para Pagamento</p>
            <p className="text-xs text-[#94a3b8]">{items.length} parceiro{items.length !== 1 ? 's' : ''} · {fmt(total)}</p>
          </div>
        </div>
        {open ? <ChevronUp size={18} className="text-[#94a3b8]" /> : <ChevronDown size={18} className="text-[#94a3b8]" />}
      </button>

      {open && (
        <div className="border-t border-[#2d3a52]">
          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2].map(i => <div key={i} className="h-12 bg-[#0b121b] rounded-lg animate-pulse" />)}
            </div>
          ) : items.length === 0 ? (
            <p className="p-5 text-[#94a3b8] text-sm text-center">Nenhuma comissão disponível no momento.</p>
          ) : (
            <div className="divide-y divide-[#2d3a52]">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-white">{item.partner_name}</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      Pedido #{item.order_id?.substring(0, 8)} · {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-bold text-[#10b981]">{fmt(item.commission_amount)}</p>
                    <button
                      onClick={() => markPaid(item.id, item.partner_name)}
                      disabled={paying === item.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 rounded-lg text-xs font-medium hover:bg-[#10b981]/20 transition-colors disabled:opacity-50"
                    >
                      <Banknote size={12} />
                      {paying === item.id ? 'Aguarde...' : 'Marcar Pago'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Card de lucro por venda ──────────────────────────────────────────────────
const ProfitPerSaleCard = ({ semAfiliado, comAfiliado }) => {
  if (!semAfiliado && !comAfiliado) return null;

  return (
    <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <ArrowUpRight size={18} className="text-[#10b981]" />
        <h3 className="text-lg font-semibold text-white">Lucro Estimado por Venda</h3>
        <span className="text-xs text-[#64748b] ml-1">baseado nos custos configurados</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sem afiliado */}
        {semAfiliado && (
          <div className="rounded-xl p-4 bg-[#10b981]/5 border border-[#10b981]/20">
            <p className="text-xs font-bold uppercase tracking-wider text-[#10b981] mb-3">Sem afiliado</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Receita</span>
                <span className="text-white">{fmt(semAfiliado.preco_produto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Custo produto</span>
                <span className="text-[#ef4444]">- {fmt(semAfiliado.custo_produto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Frete</span>
                <span className="text-[#ef4444]">- {fmt(semAfiliado.frete)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Taxa gateway</span>
                <span className="text-[#ef4444]">- {fmt(semAfiliado.taxa_gateway)}</span>
              </div>
              <div className="border-t border-[#2d3a52] pt-2 flex justify-between font-bold">
                <span className="text-white">Lucro</span>
                <span className="text-[#10b981] text-base">{fmt(semAfiliado.lucro)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b] text-xs">Margem</span>
                <span className="text-[#10b981] text-xs font-semibold">{semAfiliado.margem_pct}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Com afiliado */}
        {comAfiliado && (
          <div className="rounded-xl p-4 bg-[#f59e0b]/5 border border-[#f59e0b]/20">
            <p className="text-xs font-bold uppercase tracking-wider text-[#f59e0b] mb-3">Com afiliado</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Preço original</span>
                <span className="text-white">{fmt(comAfiliado.preco_produto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Desconto cliente</span>
                <span className="text-[#f59e0b]">- {fmt(comAfiliado.desconto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Valor recebido</span>
                <span className="text-white">{fmt(comAfiliado.preco_com_desconto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Custo produto</span>
                <span className="text-[#ef4444]">- {fmt(comAfiliado.custo_produto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Frete</span>
                <span className="text-[#ef4444]">- {fmt(comAfiliado.frete)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Taxa gateway</span>
                <span className="text-[#ef4444]">- {fmt(comAfiliado.taxa_gateway)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Comissão afiliado</span>
                <span className="text-[#f59e0b]">- {fmt(comAfiliado.comissao)}</span>
              </div>
              <div className="border-t border-[#2d3a52] pt-2 flex justify-between font-bold">
                <span className="text-white">Lucro</span>
                <span className="text-[#f59e0b] text-base">{fmt(comAfiliado.lucro)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b] text-xs">Margem</span>
                <span className="text-[#f59e0b] text-xs font-semibold">{comAfiliado.margem_pct}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
const AdminFinance = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  const fetchFinanceData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter.start) params.start_date = dateFilter.start;
      if (dateFilter.end) params.end_date = dateFilter.end;

      const res = await axios.get(`${API}/admin/finance/summary`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setData(res.data);
    } catch {
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }, [token, dateFilter]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const exportToExcel = async () => {
    try {
      const res = await axios.get(`${API}/admin/finance/export`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { start_date: dateFilter.start || undefined, end_date: dateFilter.end || undefined }
      });
      const d = res.data;
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb,
        XLSX.utils.aoa_to_sheet([
          ['Resumo Financeiro'], [''],
          ['Receita Total', d.summary.total_revenue],
          ['Total de Pedidos', d.summary.total_orders],
          ['Ticket Médio', d.summary.avg_ticket],
          ['Custo Total Produto', d.summary.custo_produto_total ?? ''],
          ['Lucro s/ Afiliado (por venda)', d.summary.lucro_sem_afiliado ?? ''],
          ['Lucro c/ Afiliado (por venda)', d.summary.lucro_com_afiliado ?? ''],
          ['Comissões Pendentes', d.summary.pending_commissions],
          ['Comissões Disponíveis', d.summary.available_commissions],
          ['Comissões Pagas', d.summary.total_commissions_paid],
          ['Lucro Estimado Total', d.summary.estimated_profit],
        ]), 'Resumo');

      XLSX.utils.book_append_sheet(wb,
        XLSX.utils.aoa_to_sheet([
          ['Tipo', 'Receita', 'Pedidos'],
          ...d.by_type.map(i => [i.type, i.revenue, i.orders])
        ]), 'Por Tipo');

      XLSX.utils.book_append_sheet(wb,
        XLSX.utils.aoa_to_sheet([
          ['Mês', 'Receita'],
          ...d.by_month.map(i => [i.month, i.revenue])
        ]), 'Por Mês');

      if (d.transactions?.length > 0) {
        XLSX.utils.book_append_sheet(wb,
          XLSX.utils.aoa_to_sheet([
            ['ID', 'Valor Original', 'Desconto', 'Valor Final', 'Tipo', 'Email', 'Código affiliate', 'Comissão', 'Status Comissão', 'Data', 'Status'],
            ...d.transactions.map(tx => [
              tx.id, tx.original_amount, tx.discount_amount, tx.final_amount,
              tx.plan_type, tx.user_email, tx.supporter_code || '',
              tx.commission_amount, tx.commission_status, tx.created_at, tx.status
            ])
          ]), 'Transações');
      }

      XLSX.writeFile(wb, `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Relatório exportado!');
    } catch { toast.error('Erro ao exportar relatório'); }
  };

  const typeChartData = data
    ? Object.entries(data.revenue_by_type).map(([k, v]) => ({
        name: k === 'digital' ? 'Digital' : k === 'plaque' || k === 'qrcode_plaque' ? 'Placa QR' : k === 'complete' ? 'Completo' : k,
        value: v
      }))
    : [];

  const monthChartData = data
    ? Object.entries(data.revenue_by_month)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, revenue]) => ({
          month: month.split('-')[1] + '/' + month.split('-')[0].slice(2),
          revenue
        }))
    : [];

  if (loading) {
    return (
      <div className="space-y-6" data-testid="finance-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-[#16202e] rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-6" data-testid="admin-finance">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">Gestão</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Financeiro</h1>
        </div>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#10b981]/90 transition-colors"
          data-testid="export-excel-btn"
        >
          <Download size={18} /> Exportar Excel
        </button>
      </div>

      {/* Filtro de período */}
      <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#94a3b8]" />
            <span className="text-sm text-[#94a3b8]">Filtrar período:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input type="date" value={dateFilter.start}
              onChange={e => setDateFilter(f => ({ ...f, start: e.target.value }))}
              className="px-3 py-2 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white text-sm focus:border-[#3b82f6] outline-none"
              data-testid="date-start-input" />
            <span className="text-[#94a3b8]">até</span>
            <input type="date" value={dateFilter.end}
              onChange={e => setDateFilter(f => ({ ...f, end: e.target.value }))}
              className="px-3 py-2 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white text-sm focus:border-[#3b82f6] outline-none"
              data-testid="date-end-input" />
            <button onClick={fetchFinanceData}
              className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg text-sm font-medium hover:bg-[#3b82f6]/90 transition-colors"
              data-testid="apply-filter-btn">
              <Filter size={16} />
            </button>
            {(dateFilter.start || dateFilter.end) && (
              <button onClick={() => { setDateFilter({ start: '', end: '' }); setTimeout(fetchFinanceData, 0); }}
                className="px-4 py-2 bg-[#2d3a52] text-white rounded-lg text-sm font-medium hover:bg-[#374763] transition-colors"
                data-testid="clear-filter-btn">
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Métricas principais — 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, color: '#10b981', label: 'Receita Total',       value: fmt(data.total_revenue) },
          { icon: TrendingUp, color: '#3b82f6', label: 'Ticket Médio',        value: fmt(data.avg_ticket) },
          { icon: DollarSign, color: '#8b5cf6', label: 'Lucro Estimado Total', value: fmt(data.estimated_profit) },
          { icon: TrendingUp, color: '#f59e0b', label: '% Vendas c/ Código',  value: `${(data.sales_with_code_pct ?? 0).toFixed(1)}%` },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
                <Icon style={{ color }} size={24} />
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custo total do produto (card extra se disponível) */}
      {data.custo_produto_total != null && (
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#ef4444]/10 border border-[#ef4444]/20">
              <Package style={{ color: '#ef4444' }} size={22} />
            </div>
            <div>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wide">Custo total do produto (físico)</p>
              <p className="text-2xl font-bold text-white">{fmt(data.custo_produto_total)}</p>
              <p className="text-xs text-[#64748b]">placa + caixa + palha + papel + fitilho</p>
            </div>
          </div>
        </div>
      )}

      {/* Comissões — 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Clock,        color: '#f59e0b', label: 'Comissões Pendentes',   value: fmt(data.pending_commissions) },
          { icon: CheckCircle2, color: '#3b82f6', label: 'Comissões Disponíveis', value: fmt(data.available_commissions ?? 0) },
          { icon: Banknote,     color: '#10b981', label: 'Comissões Pagas',       value: fmt(data.total_commissions_paid) },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
                <Icon style={{ color }} size={24} />
              </div>
              <div>
                <p className="text-xs text-[#94a3b8] uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Card de lucro por venda (novo) */}
      <ProfitPerSaleCard
        semAfiliado={data.lucro_por_venda_sem_afiliado}
        comAfiliado={data.lucro_por_venda_com_afiliado}
      />

      {/* Painel de pagamento de comissões */}
      <CommissionPanel token={token} />

      {/* Configurações de custo (novo) */}
      <AdminCostSettings />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6" data-testid="revenue-chart">
          <h3 className="text-lg font-semibold text-white mb-4">Receita por Mês</h3>
          <div className="h-64">
            {monthChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3a52" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={v => `R$${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#94a3b8]">Sem dados</div>
            )}
          </div>
        </div>

        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6" data-testid="type-chart">
          <h3 className="text-lg font-semibold text-white mb-4">Receita por Tipo de Plano</h3>
          <div className="h-64 flex items-center">
            {typeChartData.length > 0 ? (
              <>
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={typeChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {typeChartData.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {typeChartData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                        <span className="text-sm text-[#94a3b8]">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{fmt(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full flex items-center justify-center text-[#94a3b8]">Sem dados</div>
            )}
          </div>
        </div>

        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6 lg:col-span-2" data-testid="orders-by-type-chart">
          <h3 className="text-lg font-semibold text-white mb-4">Pedidos por Tipo</h3>
          <div className="h-48">
            {Object.keys(data.orders_by_type).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(data.orders_by_type).map(([k, v]) => ({
                    type: k === 'digital' ? 'Digital' : k === 'plaque' ? 'Placa QR' : k,
                    orders: v
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3a52" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis type="category" dataKey="type" stroke="#94a3b8" fontSize={12} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e2b3e', border: '1px solid #2d3a52' }} labelStyle={{ color: 'white' }} />
                  <Bar dataKey="orders" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#94a3b8]">Sem dados</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;