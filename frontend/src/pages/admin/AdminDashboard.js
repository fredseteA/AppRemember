import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  DollarSign,
  ShoppingCart,
  Heart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock
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

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, subtitle }) => (
  <div 
    className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6 hover:border-[#3b82f6]/30 transition-all duration-300"
    data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-2">
          {title}
        </p>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-[#94a3b8]">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{Math.abs(trend)}% este mês</span>
          </div>
        )}
      </div>
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
    </div>
  </div>
);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e2b3e] border border-[#2d3a52] rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('Receita') ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`${API}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        toast.error('Erro ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6" data-testid="dashboard-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-[#16202e] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-80 bg-[#16202e] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">
          Visão Geral
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Faturamento Total"
          value={formatCurrency(data.total_revenue)}
          icon={DollarSign}
          color="#10b981"
          subtitle={`Mensal: ${formatCurrency(data.monthly_revenue)}`}
        />
        <StatCard
          title="Total de Pedidos"
          value={data.total_orders}
          icon={ShoppingCart}
          color="#3b82f6"
          subtitle={`${data.monthly_orders} este mês`}
        />
        <StatCard
          title="Ticket Médio"
          value={formatCurrency(data.avg_ticket)}
          icon={TrendingUp}
          color="#f59e0b"
          subtitle={`Mensal: ${formatCurrency(data.monthly_avg_ticket)}`}
        />
        <StatCard
          title="Memoriais"
          value={data.total_memorials}
          icon={Heart}
          color="#8b5cf6"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Placas QR Code"
          value={data.total_plaques}
          icon={Package}
          color="#f59e0b"
          subtitle={`${data.monthly_plaques} este mês`}
        />
        <StatCard
          title="Parceiros Ativos"
          value={data.total_partners}
          icon={Users}
          color="#3b82f6"
        />
        <StatCard
          title="Comissões Pendentes"
          value={formatCurrency(data.pending_commissions)}
          icon={Clock}
          color="#ef4444"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6" data-testid="sales-chart">
          <h3 className="text-lg font-semibold text-white mb-4">Vendas por Mês</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sales_chart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                  name="Receita"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type Chart */}
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6" data-testid="type-chart">
          <h3 className="text-lg font-semibold text-white mb-4">Vendas por Tipo</h3>
          <div className="h-72 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.type_chart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.type_chart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-3">
              {data.type_chart.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index] }}
                    />
                    <span className="text-sm text-[#94a3b8]">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{item.value}</p>
                    <p className="text-xs text-[#94a3b8]">{formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders by Month Bar Chart */}
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6 lg:col-span-2" data-testid="orders-chart">
          <h3 className="text-lg font-semibold text-white mb-4">Pedidos por Mês</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sales_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a52" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="Pedidos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
