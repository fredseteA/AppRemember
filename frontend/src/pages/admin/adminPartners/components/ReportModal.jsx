import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { fmtDate, fmt } from '../utils';
import { API } from '@/config';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const ReportModal = ({ partner, token, onClose }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ start: '', end: '' });

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/partners/${partner.id}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { start_date: filter.start || undefined, end_date: filter.end || undefined }
      });
      setSales(res.data.sales || []);
    } catch { toast.error('Erro ao carregar vendas'); }
    finally { setLoading(false); }
  }, [partner.id, token, filter]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const STATUS_LABEL = {
    pending:   { label: 'Pendente',   color: '#f59e0b' },
    available: { label: 'Disponível', color: '#3b82f6' },
    paid:      { label: 'Pago',       color: '#10b981' },
    canceled:  { label: 'Cancelado',  color: '#ef4444' },
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-[#2d3a52]">
          <div>
            <h2 className="text-lg font-semibold text-white">Relatório — {partner.name}</h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">Código: <span className="font-mono text-[#3b82f6]">{partner.supporter_code}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2d3a52] text-[#94a3b8] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 border-b border-[#2d3a52] flex flex-wrap gap-3 items-end">
          <div>
            <p className="text-xs text-[#94a3b8] mb-1">De</p>
            <input type="date" value={filter.start}
              onChange={e => setFilter(f => ({ ...f, start: e.target.value }))}
              className="px-3 py-2 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white text-sm focus:border-[#3b82f6] outline-none" />
          </div>
          <div>
            <p className="text-xs text-[#94a3b8] mb-1">Até</p>
            <input type="date" value={filter.end}
              onChange={e => setFilter(f => ({ ...f, end: e.target.value }))}
              className="px-3 py-2 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white text-sm focus:border-[#3b82f6] outline-none" />
          </div>
          <button onClick={fetchSales}
            className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg text-sm font-medium hover:bg-[#3b82f6]/90 transition-colors">
            Filtrar
          </button>
          {(filter.start || filter.end) && (
            <button onClick={() => { setFilter({ start: '', end: '' }); setTimeout(fetchSales, 0); }}
              className="px-4 py-2 bg-[#2d3a52] text-white rounded-lg text-sm hover:bg-[#374763] transition-colors">
              Limpar
            </button>
          )}
        </div>
        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-[#0b121b] rounded-lg animate-pulse" />)}
            </div>
          ) : sales.length === 0 ? (
            <p className="text-center text-[#94a3b8] py-8">Nenhuma venda encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2d3a52]">
                    {['Pedido', 'Data', 'Original', 'Desconto', 'Final', 'Comissão', 'Status'].map(h => (
                      <th key={h} className="text-left text-xs text-[#94a3b8] uppercase tracking-wide pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sales.map(s => {
                    const cfg = STATUS_LABEL[s.commission_status] || STATUS_LABEL.pending;
                    return (
                      <tr key={s.id} className="border-b border-[#2d3a52]/50 hover:bg-[#0b121b]/50 transition-colors">
                        <td className="py-3 pr-4 font-mono text-[#94a3b8] text-xs">#{s.id?.substring(0, 8)}</td>
                        <td className="py-3 pr-4 text-white">{fmtDate(s.created_at)}</td>
                        <td className="py-3 pr-4 text-white">{fmt(s.original_amount)}</td>
                        <td className="py-3 pr-4 text-green-400">-{fmt(s.discount_amount)}</td>
                        <td className="py-3 pr-4 text-white font-medium">{fmt(s.final_amount)}</td>
                        <td className="py-3 pr-4 text-[#f59e0b] font-medium">{fmt(s.commission_amount)}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;