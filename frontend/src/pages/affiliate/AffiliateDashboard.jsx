import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  LayoutDashboard, TrendingUp, Coins, Wallet, Percent, Star, ArrowUpRight, RefreshCw,
} from 'lucide-react';
import { API } from '@/config';
import { PLAN_LABELS, LEVELS } from './constants/index';
import AffiliateLayout from './layouts/AffiliateLayout';

function getLevel(sales) { return LEVELS.find(l => sales >= l.min && sales <= l.max) || LEVELS[0]; }
function getNextLevel(sales) { const idx = LEVELS.findIndex(l => sales >= l.min && sales <= l.max); return LEVELS[idx + 1] || null; }

function StatCard({ icon: Icon, label, value, sub, accent = '#5aa8e0', delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e8edf4', boxShadow: '0 2px 12px rgba(26,39,68,0.05)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.45s ease, transform 0.45s ease', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.73rem', color: '#7a8aaa', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
      </div>
      <div>
        <p style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 700, color: '#1a2744', margin: 0, lineHeight: 1.1 }}>{value}</p>
        {sub && <p style={{ fontSize: '0.76rem', color: '#9aaac0', marginTop: 4 }}>{sub}</p>}
      </div>
    </div>
  );
}

function ProgressCard({ sales, level, nextLevel, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setBarWidth(nextLevel ? Math.min(((sales - level.min) / (nextLevel.min - level.min)) * 100, 100) : 100);
    }, 200);
    return () => clearTimeout(t);
  }, [visible, sales, level, nextLevel]);
  const salesNeeded = nextLevel ? nextLevel.min - sales : 0;
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e8edf4', boxShadow: '0 2px 12px rgba(26,39,68,0.05)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.45s ease, transform 0.45s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: '0.73rem', color: '#7a8aaa', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Progresso de Nível</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: `${level.color}18`, color: level.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{level.label}</span>
            <span style={{ color: '#9aaac0', fontSize: '0.75rem' }}>{level.rate}% comissão</span>
          </div>
        </div>
        <Star size={20} style={{ color: level.color }} fill={level.color} />
      </div>
      <div style={{ height: 10, background: '#f0f4f8', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${barWidth}%`, background: `linear-gradient(90deg, ${level.color}88, ${level.color})`, borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: '#5a6a8a' }}>
          {nextLevel ? <><strong style={{ color: '#1a2744' }}>{sales}</strong> / <strong style={{ color: '#1a2744' }}>{nextLevel.min}</strong> vendas este mês</> : <strong style={{ color: level.color }}>Nível máximo atingido! 🏆</strong>}
        </span>
        {nextLevel && <span style={{ fontSize: '0.75rem', color: '#9aaac0' }}>Faltam <strong style={{ color: nextLevel.color }}>{salesNeeded}</strong> para {nextLevel.rate}%</span>}
      </div>
    </div>
  );
}

function RecentSales({ sales }) {
  const STATUS_COLORS = { approved: '#16a34a', paid: '#16a34a', in_production: '#8b5cf6', produced: '#3b82f6', shipped: '#f59e0b', entregue: '#16a34a', cancelled: '#ef4444', pending: '#9aaac0' };
  const STATUS_LABELS = { approved: 'Aprovado', paid: 'Pago', in_production: 'Produção', produced: 'Produzido', shipped: 'Enviado', entregue: 'Entregue', cancelled: 'Cancelado', pending: 'Pendente' };
  if (!sales.length) return <div style={{ textAlign: 'center', padding: '40px 0', color: '#9aaac0', fontSize: '0.88rem' }}>Nenhuma venda ainda. Compartilhe seu código! 🚀</div>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f0f4f8' }}>
            {['Plano', 'Valor', 'Comissão', 'Status', 'Data'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#7a8aaa', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sales.slice(0, 5).map((s, i) => {
            const status = s.status || 'pending';
            return (
              <tr key={i} style={{ borderBottom: '1px solid #f0f4f8' }}>
                <td style={{ padding: '12px 14px', color: '#1a2744', fontWeight: 500 }}>{PLAN_LABELS[s.plan_type] || s.plan_type}</td>
                <td style={{ padding: '12px 14px', color: '#1a2744' }}>R$ {Number(s.final_amount || s.amount || 0).toFixed(2)}</td>
                <td style={{ padding: '12px 14px', color: '#16a34a', fontWeight: 600 }}>R$ {Number(s.commission_amount || 0).toFixed(2)}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ background: `${STATUS_COLORS[status] || '#9aaac0'}18`, color: STATUS_COLORS[status] || '#9aaac0', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>{STATUS_LABELS[status] || status}</span>
                </td>
                <td style={{ padding: '12px 14px', color: '#7a8aaa', whiteSpace: 'nowrap' }}>{s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AffiliateDashboard() {
  const { user, getToken } = useAuth(); 
  const [partner, setPartner] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken(); 
      const headers = { Authorization: `Bearer ${token}` };
      const partnerRes = await axios.get(`${API}/affiliate/me`, { headers });
      setPartner(partnerRes.data);
      const salesRes = await axios.get(`${API}/affiliate/sales`, { headers });
      setSales(salesRes.data?.sales || []);
    } catch (e) {
      console.error('Dashboard erro:', e?.response?.data || e.message);
      setError('Não foi possível carregar seus dados. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);
  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const now = new Date();
  const salesThisMonth = sales.filter(s => {
    if (!s.created_at) return false;
    const d = new Date(s.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && s.status !== 'cancelled';
  });
  const monthSalesCount = salesThisMonth.length;
  const level = getLevel(monthSalesCount);
  const nextLevel = getNextLevel(monthSalesCount);
  const monthRevenue = salesThisMonth.reduce((acc, s) => acc + (s.final_amount || s.amount || 0), 0);
  const monthCommission = salesThisMonth.reduce((acc, s) => acc + (s.commission_amount || 0), 0);
  const availableCommission = sales.reduce((acc, s) => acc + (s.commission_status === 'available' ? (s.commission_amount || 0) : 0), 0);

  if (loading) return (
    <AffiliateLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center', color: '#7a8aaa' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p style={{ fontSize: '0.88rem', marginTop: 12 }}>Carregando seu painel...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AffiliateLayout>
  );

  if (error) return (
    <AffiliateLayout>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', border: '1px solid #fecaca' }}>
        <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>
        <button onClick={handleRefresh} style={{ padding: '10px 24px', background: '#1a2744', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: '"Georgia", serif', fontSize: '0.88rem' }}>Tentar novamente</button>
      </div>
    </AffiliateLayout>
  );

  return (
    <AffiliateLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <LayoutDashboard size={22} style={{ color: '#5aa8e0' }} />
              <h1 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 700, color: '#1a2744', margin: 0 }}>
                Olá, {partner?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'affiliate'} 👋
              </h1>
            </div>
            <p style={{ color: '#5a6a8a', fontSize: '0.86rem', margin: 0 }}>
              {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}{' — Código: '}
              <strong style={{ color: '#1a2744' }}>{partner?.supporter_code}</strong>
            </p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#fff', border: '1px solid #e8edf4', borderRadius: 10, cursor: 'pointer', color: '#5a6a8a', fontSize: '0.82rem', fontFamily: '"Georgia", serif', transition: 'all 0.18s' }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Atualizar
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
          <StatCard icon={TrendingUp} label="Vendido no mês"      value={`R$ ${monthRevenue.toFixed(2)}`}        sub={`${monthSalesCount} venda${monthSalesCount !== 1 ? 's' : ''} este mês`} accent="#16a34a" delay={0} />
          <StatCard icon={Coins}      label="Comissão do mês"     value={`R$ ${monthCommission.toFixed(2)}`}     sub={`${level.rate}% aplicado este mês`}                                   accent="#f59e0b" delay={80} />
          <StatCard icon={Wallet}     label="Comissão disponível" value={`R$ ${availableCommission.toFixed(2)}`} sub="Pronta para recebimento"                                              accent="#8b5cf6" delay={160} />
          <StatCard icon={Percent}    label="Percentual atual"    value={`${level.rate}%`}                       sub={`Nível: ${level.label}`}                                              accent={level.color} delay={240} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <ProgressCard sales={monthSalesCount} level={level} nextLevel={nextLevel} delay={320} />
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8edf4', boxShadow: '0 2px 12px rgba(26,39,68,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '1rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>Vendas Recentes</h2>
              <p style={{ fontSize: '0.75rem', color: '#9aaac0', margin: '3px 0 0' }}>Últimas 5 vendas com seu código</p>
            </div>
            <ArrowUpRight size={18} style={{ color: '#9aaac0' }} />
          </div>
          <RecentSales sales={sales} />
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AffiliateLayout>
  );
}