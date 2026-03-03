import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  DollarSign,
  Download,
  TrendingUp,
  Calendar,
  Filter,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e2b3e] border border-[#2d3a52] rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdminFinance = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchFinanceData();
  }, [token]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter.start) params.start_date = dateFilter.start;
      if (dateFilter.end) params.end_date = dateFilter.end;
      
      const response = await axios.get(`${API}/admin/finance/summary`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = () => {
    fetchFinanceData();
  };

  const clearFilter = () => {
    setDateFilter({ start: '', end: '' });
    fetchFinanceData();
  };

  const exportToExcel = async () => {
    try {
      const response = await axios.get(`${API}/admin/finance/export`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start_date: dateFilter.start || undefined,
          end_date: dateFilter.end || undefined
        }
      });
      
      const exportData = response.data;
      
      // Criar workbook
      const wb = XLSX.utils.book_new();
      
      // Aba Resumo
      const summaryData = [
        ['Resumo Financeiro'],
        [''],
        ['Receita Total', exportData.summary.total_revenue],
        ['Total de Pedidos', exportData.summary.total_orders],
        ['Ticket Médio', exportData.summary.avg_ticket],
        ['Comissões Pendentes', exportData.summary.pending_commissions],
        ['Lucro Estimado', exportData.summary.estimated_profit]
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');
      
      // Aba Por Tipo
      const typeHeaders = ['Tipo', 'Receita', 'Pedidos'];
      const typeData = exportData.by_type.map(item => [item.type, item.revenue, item.orders]);
      const wsType = XLSX.utils.aoa_to_sheet([typeHeaders, ...typeData]);
      XLSX.utils.book_append_sheet(wb, wsType, 'Por Tipo');
      
      // Aba Por Mês
      const monthHeaders = ['Mês', 'Receita'];
      const monthData = exportData.by_month.map(item => [item.month, item.revenue]);
      const wsMonth = XLSX.utils.aoa_to_sheet([monthHeaders, ...monthData]);
      XLSX.utils.book_append_sheet(wb, wsMonth, 'Por Mês');
      
      // Aba Transações
      if (exportData.transactions.length > 0) {
        const txHeaders = ['ID', 'Valor', 'Tipo', 'Email', 'Data', 'Status'];
        const txData = exportData.transactions.map(tx => [
          tx.id,
          tx.amount,
          tx.plan_type,
          tx.user_email,
          tx.created_at,
          tx.status
        ]);
        const wsTx = XLSX.utils.aoa_to_sheet([txHeaders, ...txData]);
        XLSX.utils.book_append_sheet(wb, wsTx, 'Transações');
      }
      
      // Download
      const fileName = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Preparar dados do gráfico de pizza por tipo
  const typeChartData = data ? Object.entries(data.revenue_by_type).map(([key, value]) => ({
    name: key === 'digital' ? 'Digital' : 
          key === 'plaque' || key === 'qrcode_plaque' ? 'Placa QR' :
          key === 'complete' ? 'Completo' : key,
    value: value
  })) : [];

  // Preparar dados do gráfico de barras por mês
  const monthChartData = data ? Object.entries(data.revenue_by_month)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, revenue]) => ({
      month: month.split('-')[1] + '/' + month.split('-')[0].slice(2),
      revenue
    })) : [];

  if (loading) {
    return (
      <div className="space-y-6" data-testid="finance-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-[#16202e] rounded-xl animate-pulse" />
          ))}
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
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">
            Gestão
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Financeiro</h1>
        </div>
        
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#10b981]/90 transition-colors"
          data-testid="export-excel-btn"
        >
          <Download size={18} />
          Exportar Excel
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#94a3b8]" />
            <span className="text-sm text-[#94a3b8]">Filtrar período:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
              className="px-3 py-2 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white text-sm focus:border-[#3b82f6]"
              data-testid="date-start-input"
            />
            <span className="text-[#94a3b8]">até</span>
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
              className="px-3 py-2 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white text-sm focus:border-[#3b82f6]"
              data-testid="date-end-input"
            />
            <button
              onClick={applyDateFilter}
              className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg text-sm font-medium hover:bg-[#3b82f6]/90 transition-colors"
              data-testid="apply-filter-btn"
            >
              <Filter size={16} />
            </button>
            {(dateFilter.start || dateFilter.end) && (
              <button
                onClick={clearFilter}
                className="px-4 py-2 bg-[#2d3a52] text-white rounded-lg text-sm font-medium hover:bg-[#374763] transition-colors"
                data-testid="clear-filter-btn"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
              <DollarSign className="text-[#10b981]" size={24} />
            </div>
            <div>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wide">Receita Total</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.total_revenue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center">
              <TrendingUp className="text-[#3b82f6]" size={24} />
            </div>
            <div>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wide">Ticket Médio</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.avg_ticket)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
              <PieChartIcon className="text-[#f59e0b]" size={24} />
            </div>
            <div>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wide">Comissões Pendentes</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.pending_commissions)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center">
              <DollarSign className="text-[#8b5cf6]" size={24} />
            </div>
            <div>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wide">Lucro Estimado</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.estimated_profit)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6" data-testid="revenue-chart">
          <h3 className="text-lg font-semibold text-white mb-4">Receita por Mês</h3>
          <div className="h-64">
            {monthChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3a52" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `R$${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#94a3b8]">
                Sem dados para o período
              </div>
            )}
          </div>
        </div>

        {/* Revenue by Type */}
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6" data-testid="type-chart">
          <h3 className="text-lg font-semibold text-white mb-4">Receita por Tipo de Plano</h3>
          <div className="h-64 flex items-center">
            {typeChartData.length > 0 ? (
              <>
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {typeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {typeChartData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="text-sm text-[#94a3b8]">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full flex items-center justify-center text-[#94a3b8]">
                Sem dados para o período
              </div>
            )}
          </div>
        </div>

        {/* Orders by Type */}
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6 lg:col-span-2" data-testid="orders-by-type-chart">
          <h3 className="text-lg font-semibold text-white mb-4">Pedidos por Tipo</h3>
          <div className="h-48">
            {Object.keys(data.orders_by_type).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={Object.entries(data.orders_by_type).map(([key, value]) => ({
                    type: key === 'digital' ? 'Digital' : 
                          key === 'plaque' || key === 'qrcode_plaque' ? 'Placa QR' :
                          key === 'complete' ? 'Completo' : key,
                    orders: value
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3a52" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis type="category" dataKey="type" stroke="#94a3b8" fontSize={12} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e2b3e', border: '1px solid #2d3a52' }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Bar dataKey="orders" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#94a3b8]">
                Sem dados para o período
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Commission Summary */}
      <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Resumo de Comissões</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wide mb-1">Comissões Pendentes</p>
            <p className="text-2xl font-bold text-[#f59e0b]">{formatCurrency(data.pending_commissions)}</p>
          </div>
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wide mb-1">Comissões Pagas</p>
            <p className="text-2xl font-bold text-[#10b981]">{formatCurrency(data.total_commissions_paid)}</p>
          </div>
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wide mb-1">Total de Pedidos</p>
            <p className="text-2xl font-bold text-white">{data.total_orders}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;
