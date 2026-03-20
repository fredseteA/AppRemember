import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Coins, RefreshCw, Clock, Wallet, CheckCircle, ChevronDown, Filter, X } from 'lucide-react';
import { API } from '@/config';
import { COMMISSION_STATUS } from './constants/index';
import {StatusBadge, SummaryCard} from './components/index';
import AffiliateLayout from './layouts/AffiliateLayout';


function groupByMonth(commissions) {
  const groups = {};
  commissions.forEach(c => {
    const d = c.created_at ? new Date(c.created_at) : null;
    if (!d) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = { key, label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }), total: 0, paid: 0, pending: 0, available: 0, count: 0, items: [] };
    groups[key].total += c.commission_amount || 0;
    groups[key].count += 1;
    groups[key].items.push(c);
    if (c.commission_status === 'paid')      groups[key].paid      += c.commission_amount || 0;
    if (c.commission_status === 'pending')   groups[key].pending   += c.commission_amount || 0;
    if (c.commission_status === 'available') groups[key].available += c.commission_amount || 0;
  });
  return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
}

function PeriodRow({ group }) {
  const [expanded, setExpanded] = useState(false);
  const label = group.label.charAt(0).toUpperCase() + group.label.slice(1);
  return (
    <>
      <tr onClick={() => setExpanded(!expanded)} style={{ borderBottom: expanded ? 'none' : '1px solid #f0f4f8', cursor: 'pointer', background: expanded ? '#f8fafc' : 'transparent', transition: 'background 0.15s' }}
        onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = '#f8fafc'; }}
        onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = 'transparent'; }}
      >
        <td style={{ padding: '13px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ChevronDown size={14} style={{ color: '#9aaac0', transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            <span style={{ fontFamily: '"Georgia", serif', fontWeight: 600, color: '#1a2744', fontSize: '0.88rem' }}>{label}</span>
          </div>
        </td>
        <td style={{ padding: '13px 16px', color: '#1a2744', fontWeight: 600, fontSize: '0.88rem' }}>R$ {group.total.toFixed(2)}</td>
        <td style={{ padding: '13px 16px' }}>
          {group.paid > 0 ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16a34a', fontWeight: 600, fontSize: '0.82rem' }}><CheckCircle size={14} /> Sim — R$ {group.paid.toFixed(2)}</span>
            : group.available > 0 ? <span style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.82rem' }}>Disponível</span>
            : <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.82rem' }}>Pendente</span>}
        </td>
        <td style={{ padding: '13px 16px', color: '#7a8aaa', fontSize: '0.8rem' }}>{group.count} venda{group.count !== 1 ? 's' : ''}</td>
      </tr>
      {expanded && group.items.map((item, i) => (
        <tr key={i} style={{ background: '#f8fafc', borderBottom: i === group.items.length - 1 ? '2px solid #e8edf4' : '1px solid #eef2f8' }}>
          <td style={{ padding: '10px 16px 10px 40px', color: '#5a6a8a', fontSize: '0.8rem' }}>{item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '—'}</td>
          <td style={{ padding: '10px 16px', color: '#16a34a', fontWeight: 600, fontSize: '0.8rem' }}>R$ {Number(item.commission_amount || 0).toFixed(2)}</td>
          <td style={{ padding: '10px 16px' }}><StatusBadge status={item.commission_status} /></td>
          <td style={{ padding: '10px 16px', color: '#9aaac0', fontSize: '0.78rem' }}>
            {item.commission_status === 'paid' && item.paid_at ? `Pago em ${new Date(item.paid_at).toLocaleDateString('pt-BR')}` : COMMISSION_STATUS[item.commission_status]?.desc || '—'}
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AffiliateCommissions() {
  const { user, getToken } = useAuth(); // ← CORRIGIDO
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken(); 
      const res = await axios.get(`${API}/affiliate/commissions`, { headers: { Authorization: `Bearer ${token}` } });
      setCommissions(res.data?.commissions || []);
    } catch (e) {
      console.error('Comissões erro:', e?.response?.data || e.message);
      setError('Não foi possível carregar as comissões.');
    } finally { setLoading(false); setRefreshing(false); }
  }, [getToken]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);
  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const totalPending   = commissions.filter(c => c.commission_status === 'pending').reduce((a, c) => a + (c.commission_amount || 0), 0);
  const totalAvailable = commissions.filter(c => c.commission_status === 'available').reduce((a, c) => a + (c.commission_amount || 0), 0);
  const totalPaid      = commissions.filter(c => c.commission_status === 'paid').reduce((a, c) => a + (c.commission_amount || 0), 0);
  const filtered = useMemo(() => !filterStatus ? commissions : commissions.filter(c => c.commission_status === filterStatus), [commissions, filterStatus]);
  const groups = useMemo(() => groupByMonth(filtered), [filtered]);

  if (loading) return (
    <AffiliateLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center', color: '#7a8aaa' }}>
          <RefreshCw size={26} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '0.88rem', marginTop: 12 }}>Carregando comissões...</p>
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
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Coins size={22} style={{ color: '#5aa8e0' }} />
              <h1 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.3rem,3vw,1.7rem)', fontWeight: 700, color: '#1a2744', margin: 0 }}>Comissões</h1>
            </div>
            <p style={{ color: '#5a6a8a', fontSize: '0.86rem', margin: 0 }}>Acompanhe suas comissões pendentes, disponíveis e pagas.</p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#fff', border: '1px solid #e8edf4', borderRadius: 10, cursor: 'pointer', color: '#5a6a8a', fontSize: '0.82rem', fontFamily: '"Georgia", serif' }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Atualizar
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <SummaryCard icon={Clock}       label="Comissão Pendente"   value={`R$ ${totalPending.toFixed(2)}`}   sub="Aguardando entrega dos pedidos" accent="#f59e0b" delay={0} />
          <SummaryCard icon={Wallet}      label="Comissão Disponível" value={`R$ ${totalAvailable.toFixed(2)}`} sub="Pronta para recebimento"         accent="#8b5cf6" delay={80} />
          <SummaryCard icon={CheckCircle} label="Comissão Paga"       value={`R$ ${totalPaid.toFixed(2)}`}      sub="Total já recebido"               accent="#16a34a" delay={160} />
        </div>

        <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 18px', marginBottom: 22, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ fontSize: '1rem', marginTop: 1 }}>ℹ️</div>
          <div>
            <p style={{ fontWeight: 600, color: '#1e40af', fontSize: '0.82rem', margin: '0 0 3px' }}>Como funciona?</p>
            <p style={{ color: '#3b82f6', fontSize: '0.78rem', margin: 0, lineHeight: 1.5 }}>Comissões ficam <strong>pendentes</strong> até a entrega do pedido. Após a entrega, ficam <strong>disponíveis</strong> e serão pagas pelo administrador via PIX ou transferência.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <Filter size={15} style={{ color: '#9aaac0' }} />
          <span style={{ fontSize: '0.78rem', color: '#9aaac0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filtrar por:</span>
          {[{ value: '', label: 'Todos' }, { value: 'pending', label: 'Pendente' }, { value: 'available', label: 'Disponível' }, { value: 'paid', label: 'Pago' }, { value: 'canceled', label: 'Cancelado' }].map(opt => (
            <button key={opt.value} onClick={() => setFilterStatus(opt.value)} style={{ padding: '6px 14px', borderRadius: 20, border: filterStatus === opt.value ? 'none' : '1px solid #e8edf4', background: filterStatus === opt.value ? '#1a2744' : '#fff', color: filterStatus === opt.value ? '#fff' : '#5a6a8a', fontSize: '0.78rem', fontWeight: filterStatus === opt.value ? 700 : 400, cursor: 'pointer', fontFamily: '"Georgia", serif', transition: 'all 0.15s' }}>{opt.label}</button>
          ))}
          {filterStatus && <button onClick={() => setFilterStatus('')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', border: '1px solid #fecaca', borderRadius: 20, background: '#fff5f5', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', fontFamily: '"Georgia", serif' }}><X size={11} /> Limpar</button>}
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8edf4', boxShadow: '0 2px 12px rgba(26,39,68,0.05)', overflow: 'hidden' }}>
          {groups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9aaac0' }}>
              <Coins size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem', margin: 0 }}>{commissions.length === 0 ? 'Nenhuma comissão ainda. Comece a vender!' : 'Nenhuma comissão com esse filtro.'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f0f4f8' }}>
                    {['Período', 'Total Gerado', 'Pago?', 'Detalhes'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#7a8aaa', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{groups.map(group => <PeriodRow key={group.key} group={group} />)}</tbody>
              </table>
            </div>
          )}
          {groups.length > 0 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f4f8', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: '0.78rem', color: '#9aaac0' }}><strong style={{ color: '#1a2744' }}>{groups.length}</strong> período{groups.length !== 1 ? 's' : ''}</span>
              <span style={{ fontSize: '0.78rem', color: '#9aaac0' }}>Total acumulado: <strong style={{ color: '#1a2744' }}>R$ {commissions.reduce((a, c) => a + (c.commission_amount || 0), 0).toFixed(2)}</strong></span>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AffiliateLayout>
  );
}