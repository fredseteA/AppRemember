import { useState, useEffect, useMemo, useCallback } from 'react';
import AffiliateLayout from './layouts/AffiliateLayout'
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { ShoppingBag, RefreshCw, Filter, ChevronDown, TrendingUp, Coins, Search, X } from 'lucide-react';
import { API } from '@/config';
import { PLAN_LABELS, STATUS_CONFIG } from './constants/index';
import {StatusBadge, SummaryCard} from './components/index';

function getMonthOptions() {
  const options = [{ value: '', label: 'Todos os meses' }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return options;
}

function maskEmail(email) {
  if (!email) return '—';
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 3)}***@${domain}`;
}

const selectStyle = { padding: '8px 12px', border: '1px solid #e8edf4', borderRadius: 8, fontSize: '0.83rem', color: '#1a2744', fontFamily: '"Georgia", serif', background: '#fff', cursor: 'pointer', minWidth: 160 };

export default function AffiliateSales() {
  const { user, getToken } = useAuth(); 
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const monthOptions = useMemo(() => getMonthOptions(), []);

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken(); 
      const res = await axios.get(`${API}/affiliate/sales`, { headers: { Authorization: `Bearer ${token}` } });
      setSales(res.data?.sales || []);
    } catch (e) {
      console.error('Vendas erro:', e?.response?.data || e.message);
      setError('Não foi possível carregar as vendas.');
    } finally { setLoading(false); setRefreshing(false); }
  }, [getToken]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);
  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const filtered = useMemo(() => sales.filter(s => {
    if (filterStatus && s.status !== filterStatus) return false;
    if (filterPlan && s.plan_type !== filterPlan) return false;
    if (filterMonth) {
      const d = s.created_at ? new Date(s.created_at) : null;
      if (!d) return false;
      if (`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` !== filterMonth) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (!(s.user_email || '').toLowerCase().includes(q) && !(PLAN_LABELS[s.plan_type] || s.plan_type || '').toLowerCase().includes(q)) return false;
    }
    return true;
  }), [sales, filterStatus, filterPlan, filterMonth, search]);

  const totalRevenue = filtered.reduce((a, s) => a + (s.final_amount || s.amount || 0), 0);
  const totalCommission = filtered.reduce((a, s) => a + (s.commission_amount || 0), 0);
  const activeFilters = [filterMonth, filterStatus, filterPlan, search].filter(Boolean).length;
  const clearFilters = () => { setFilterMonth(''); setFilterStatus(''); setFilterPlan(''); setSearch(''); };

  if (loading) return (
    <AffiliateLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center', color: '#7a8aaa' }}>
          <RefreshCw size={26} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '0.88rem', marginTop: 12 }}>Carregando vendas...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AffiliateLayout>
  );

  if (error) return (
    <AffiliateLayout>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', border: '1px solid #fecaca' }}>
        <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>
        <button onClick={handleRefresh} style={{ padding: '10px 24px', background: '#1a2744', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: '"Georgia", serif' }}>Tentar novamente</button>
      </div>
    </AffiliateLayout>
  );

  return (
    <AffiliateLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <ShoppingBag size={22} style={{ color: '#5aa8e0' }} />
              <h1 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.3rem,3vw,1.7rem)', fontWeight: 700, color: '#1a2744', margin: 0 }}>Vendas</h1>
            </div>
            <p style={{ color: '#5a6a8a', fontSize: '0.86rem', margin: 0 }}>{sales.length} venda{sales.length !== 1 ? 's' : ''} no total com seu código</p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#fff', border: '1px solid #e8edf4', borderRadius: 10, cursor: 'pointer', color: '#5a6a8a', fontSize: '0.82rem', fontFamily: '"Georgia", serif' }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Atualizar
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 22 }}>
          <SummaryCard icon={ShoppingBag} label="Vendas (filtro)"  value={filtered.length}                    accent="#5aa8e0" delay={0} />
          <SummaryCard icon={TrendingUp}  label="Total vendido"    value={`R$ ${totalRevenue.toFixed(2)}`}    accent="#16a34a" delay={80} />
          <SummaryCard icon={Coins}       label="Comissão gerada"  value={`R$ ${totalCommission.toFixed(2)}`} accent="#f59e0b" delay={160} />
        </div>

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8edf4', marginBottom: 18, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9aaac0' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por plano ou email..." style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e8edf4', borderRadius: 8, fontSize: '0.83rem', color: '#1a2744', fontFamily: '"Georgia", serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e8edf4', borderRadius: 8, background: showFilters ? '#f0f4f8' : '#fff', cursor: 'pointer', color: '#5a6a8a', fontSize: '0.82rem', fontFamily: '"Georgia", serif', whiteSpace: 'nowrap' }}>
              <Filter size={14} /> Filtros
              {activeFilters > 0 && <span style={{ background: '#5aa8e0', color: '#fff', borderRadius: 99, fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', marginLeft: 2 }}>{activeFilters}</span>}
              <ChevronDown size={13} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>
            {activeFilters > 0 && (
              <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', border: '1px solid #fecaca', borderRadius: 8, background: '#fff5f5', cursor: 'pointer', color: '#ef4444', fontSize: '0.78rem', fontFamily: '"Georgia", serif' }}>
                <X size={13} /> Limpar
              </button>
            )}
          </div>
          {showFilters && (
            <div style={{ display: 'flex', gap: 12, padding: '14px 16px', flexWrap: 'wrap', borderTop: '1px solid #f0f4f8' }}>
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={selectStyle}>
                {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
                <option value="">Todos os status</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} style={selectStyle}>
                <option value="">Todos os planos</option>
                {Object.entries(PLAN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8edf4', boxShadow: '0 2px 12px rgba(26,39,68,0.05)', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9aaac0' }}>
              <ShoppingBag size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem', margin: 0 }}>{sales.length === 0 ? 'Nenhuma venda encontrada. Compartilhe seu código!' : 'Nenhuma venda com esses filtros.'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f0f4f8' }}>
                    {['Comprador', 'Plano', 'Valor da Venda', '% Aplicado', 'Comissão', 'Status', 'Data'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#7a8aaa', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const valor = Number(s.final_amount || s.amount || 0);
                    const comissao = Number(s.commission_amount || 0);
                    const pct = s.commission_rate ? `${(s.commission_rate * 100).toFixed(0)}%` : (valor > 0 ? `${((comissao / valor) * 100).toFixed(0)}%` : '—');
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f4f8', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '13px 16px', color: '#5a6a8a', fontSize: '0.8rem' }}>{maskEmail(s.user_email)}</td>
                        <td style={{ padding: '13px 16px', color: '#1a2744', fontWeight: 500 }}>{PLAN_LABELS[s.plan_type] || s.plan_type || '—'}</td>
                        <td style={{ padding: '13px 16px', color: '#1a2744', fontWeight: 600 }}>R$ {valor.toFixed(2)}</td>
                        <td style={{ padding: '13px 16px' }}><span style={{ background: '#5aa8e018', color: '#5aa8e0', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>{pct}</span></td>
                        <td style={{ padding: '13px 16px', color: '#16a34a', fontWeight: 700 }}>R$ {comissao.toFixed(2)}</td>
                        <td style={{ padding: '13px 16px' }}><StatusBadge status={s.status} /></td>
                        <td style={{ padding: '13px 16px', color: '#7a8aaa', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {filtered.length > 0 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f4f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: '0.78rem', color: '#9aaac0' }}>Exibindo <strong style={{ color: '#1a2744' }}>{filtered.length}</strong> de <strong style={{ color: '#1a2744' }}>{sales.length}</strong> venda{sales.length !== 1 ? 's' : ''}</span>
              <span style={{ fontSize: '0.78rem', color: '#9aaac0' }}>Total de comissões: <strong style={{ color: '#16a34a' }}>R$ {totalCommission.toFixed(2)}</strong></span>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } select:focus { outline: none; border-color: #5aa8e0 !important; } input:focus { border-color: #5aa8e0 !important; }`}</style>
    </AffiliateLayout>
  );
}