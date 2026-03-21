import { useState, useEffect } from 'react';
import { Check, Copy, Edit2, X, FileText, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { fmt, fmtDate } from '../utils';
import { API } from '@/config';
import axios from 'axios';

const PartnerHistory = ({ partnerId, token }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/admin/partners/${partnerId}/sales`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSales((res.data.sales || []).slice(0, 8));
      } catch {
        setSales([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [partnerId, token]);

  const STATUS_LABEL = {
    pending:   { label: 'Pendente',   color: '#f59e0b' },
    available: { label: 'Disponível', color: '#3b82f6' },
    paid:      { label: 'Pago',       color: '#10b981' },
    canceled:  { label: 'Cancelado',  color: '#ef4444' },
  };

  return (
    <div className="border-t border-[#2d3a52] px-5 py-4">
      <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Últimas vendas</p>
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-8 bg-[#0b121b] rounded animate-pulse" />)}
        </div>
      ) : sales.length === 0 ? (
        <p className="text-xs text-[#94a3b8] text-center py-4">Nenhuma venda registrada.</p>
      ) : (
        <div className="space-y-2">
          {sales.map((s, i) => {
            const cfg = STATUS_LABEL[s.commission_status] || STATUS_LABEL.pending;
            return (
              <div key={i} className="flex items-center justify-between bg-[#0b121b] rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#94a3b8]">{fmtDate(s.created_at)}</span>
                  <span className="text-xs text-white font-medium">{fmt(s.final_amount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#f59e0b] font-semibold">{fmt(s.commission_amount)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${cfg.color}18`, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ProgressBar = ({ value, max, color = '#3b82f6', label }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#94a3b8]">{label}</span>
        <span className="text-xs font-semibold" style={{ color }}>
          {value} / {max} ({pct.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 bg-[#0b121b] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
    </div>
  );
};

const PartnerCard = ({partner, copiedCode, onCopy, onEdit, onToggle, onReport, onViewAs, token}) => {
  const [expanded, setExpanded] = useState(false);
  const code           = partner.supporter_code || partner.code;
  const metaMensal     = partner.monthly_goal  || 10;
  const vendasMes      = partner.total_sales_month || 0;
  const totalAcum      = partner.total_sales_all   || 0;
  const totalSoldMonth = partner.total_sold_month  || 0;

  return (
    <div
      className="bg-[#16202e] border border-[#2d3a52] rounded-xl transition-all hover:border-[#3b82f6]/30"
      data-testid={`partner-card-${partner.id}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{partner.name}</h3>
            <p className="text-sm text-[#94a3b8]">{partner.email}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            partner.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {partner.status === 'active' ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <div className="bg-[#0b121b] rounded-lg px-4 py-3 mb-4">
          <p className="text-xs text-[#94a3b8] mb-1">Código do affiliate</p>
          <div className="flex items-center justify-between">
            <span className="font-mono text-lg text-[#3b82f6]">{code}</span>
            <button onClick={() => onCopy(code)}
              className="p-1.5 rounded hover:bg-[#2d3a52] transition-colors"
              data-testid={`copy-code-${partner.id}`}>
              {copiedCode === code
                ? <Check size={16} className="text-green-500" />
                : <Copy size={16} className="text-[#94a3b8]" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Pendente',   value: partner.commission_pending,   color: '#f59e0b' },
            { label: 'Disponível', value: partner.commission_available, color: '#3b82f6' },
            { label: 'Pago',       value: partner.commission_paid,      color: '#10b981' },
            { label: 'Vendas Mês', value: vendasMes,                    color: '#94a3b8', isCurrency: false },
          ].map(({ label, value, color, isCurrency = true }) => (
            <div key={label} className="bg-[#0b121b] rounded-lg px-3 py-2">
              <p className="text-xs text-[#94a3b8]">{label}</p>
              <p className="text-sm font-semibold mt-0.5" style={{ color }}>
                {isCurrency ? fmt(value) : (value || 0)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-xs text-[#94a3b8]">Taxa de comissão</p>
          <p className="text-sm font-semibold text-white">{(partner.commission_rate * 100).toFixed(0)}%</p>
        </div>

        <div className="bg-[#0b121b] rounded-lg px-4 py-3 mb-4 space-y-3">
          <ProgressBar value={vendasMes} max={metaMensal} color="#3b82f6" label="Progresso da meta mensal" />
          <div className="flex justify-between text-xs text-[#94a3b8] pt-1">
            <span>Total vendido mês: <strong className="text-white">{fmt(totalSoldMonth)}</strong></span>
            <span>Total acumulado: <strong className="text-white">{totalAcum} vendas</strong></span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onEdit(partner)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2d3a52] text-white rounded-lg text-sm hover:bg-[#374763] transition-colors"
            data-testid={`edit-partner-${partner.id}`}>
            <Edit2 size={13} /> Editar
          </button>
          <button onClick={() => onToggle(partner)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              partner.status === 'active'
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
            }`}
            data-testid={`toggle-partner-${partner.id}`}>
            {partner.status === 'active' ? <X size={13} /> : <Check size={13} />}
            {partner.status === 'active' ? 'Desativar' : 'Ativar'}
          </button>
          <button onClick={() => onReport(partner)}
            className="px-3 py-2 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg text-sm hover:bg-[#3b82f6]/20 transition-colors"
            title="Ver Relatório"
            data-testid={`report-partner-${partner.id}`}>
            <FileText size={14} />
          </button>
          <button onClick={() => onViewAs(partner)}
            className="px-3 py-2 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-lg text-sm hover:bg-[#8b5cf6]/20 transition-colors"
            title="Visualizar como affiliate"
            data-testid={`viewas-partner-${partner.id}`}>
            <Eye size={14} />
          </button>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-[#2d3a52] text-xs text-[#94a3b8] hover:text-white hover:bg-[#2d3a52]/30 transition-colors rounded-b-xl"
      >
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {expanded ? 'Ocultar histórico' : 'Ver histórico detalhado'}
      </button>

      {expanded && <PartnerHistory partnerId={partner.id} token={token} />}
    </div>
  );
};

export default PartnerCard;