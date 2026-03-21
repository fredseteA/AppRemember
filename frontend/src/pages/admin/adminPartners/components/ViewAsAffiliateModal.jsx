import { Eye, X } from 'lucide-react';
import { fmt } from '../utils';
import { FRONTEND_URL } from '@/config';

const ViewAsaffiliateModal = ({ partner, onClose }) => {
  const code = partner.supporter_code || partner.code;
  const referralLink = `${FRONTEND_URL}/?apoio=${code}`;
  const monthSales = partner.total_sales_month || 0;
  const LEVELS = [
    { min: 0,  max: 9,        rate: 10, label: 'Iniciante', color: '#64748b' },
    { min: 10, max: 19,       rate: 15, label: 'Crescendo', color: '#3b82f6' },
    { min: 20, max: Infinity, rate: 20, label: 'Expert',    color: '#f59e0b' },
  ];
  const level = LEVELS.find(l => monthSales >= l.min && monthSales <= l.max) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.findIndex(l => monthSales >= l.min && monthSales <= l.max) + 1];
  const barPct = nextLevel
    ? Math.min(((monthSales - level.min) / (nextLevel.min - level.min)) * 100, 100)
    : 100;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-5 border-b border-[#2d3a52]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Eye size={16} className="text-[#3b82f6]" />
              <h2 className="text-base font-semibold text-white">Visualizar como affiliate</h2>
            </div>
            <p className="text-xs text-[#94a3b8]">Simulação do painel de <span className="text-white font-medium">{partner.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2d3a52] text-[#94a3b8] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Vendido no Mês',      value: fmt(partner.total_sold_month || 0),    color: '#10b981' },
              { label: 'Comissão do Mês',     value: fmt(partner.commission_month || 0),     color: '#f59e0b' },
              { label: 'Comissão Disponível', value: fmt(partner.commission_available || 0), color: '#8b5cf6' },
              { label: 'Percentual Atual',    value: `${level.rate}%`,                       color: level.color },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#0b121b] border border-[#2d3a52] rounded-xl p-4">
                <p className="text-xs text-[#94a3b8] uppercase tracking-wide mb-2">{label}</p>
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#0b121b] border border-[#2d3a52] rounded-xl p-4">
            <div className="mb-3">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wide mb-1">Nível Atual</p>
              <span className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: `${level.color}20`, color: level.color }}>
                {level.label} — {level.rate}%
              </span>
            </div>
            <div className="h-2.5 bg-[#16202e] rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full"
                style={{ width: `${barPct}%`, background: `linear-gradient(90deg, ${level.color}88, ${level.color})` }} />
            </div>
            <div className="flex justify-between text-xs text-[#94a3b8]">
              <span><strong className="text-white">{monthSales}</strong> vendas este mês</span>
              {nextLevel && <span>Faltam <strong style={{ color: nextLevel.color }}>{nextLevel.min - monthSales}</strong> para {nextLevel.rate}%</span>}
            </div>
          </div>
          <div className="bg-[#0b121b] border border-[#2d3a52] rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-[#94a3b8] mb-1">Código</p>
              <p className="font-mono text-2xl text-[#3b82f6] font-bold">{code}</p>
            </div>
            <div>
              <p className="text-xs text-[#94a3b8] mb-1">Link de indicação</p>
              <p className="text-xs font-mono text-[#94a3b8] break-all">{referralLink}</p>
            </div>
          </div>
          <p className="text-xs text-[#94a3b8]/60 text-center">
            ⚠️ Esta é apenas uma simulação. Dados reais no painel do affiliate.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewAsaffiliateModal;