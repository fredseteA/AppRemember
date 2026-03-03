import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Users, Plus, Copy, Check, X, DollarSign,
  Edit2, FileText, ChevronDown, ChevronUp,
  AlertCircle, Clock, CheckCircle2, Banknote
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

// ─── Modal de relatório individual ───────────────────────────────────────────
const ReportModal = ({ partner, token, onClose }) => {
  const [sales, setSales]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ start: '', end: '' });

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/partners/${partner.id}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { start_date: filter.start || undefined, end_date: filter.end || undefined }
      });
      setSales(res.data.sales || []);
    } catch { toast.error('Erro ao carregar vendas'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSales(); }, []);

  const STATUS_LABEL = {
    pending:   { label: 'Pendente',    color: '#f59e0b' },
    available: { label: 'Disponível',  color: '#3b82f6' },
    paid:      { label: 'Pago',        color: '#10b981' },
    canceled:  { label: 'Cancelado',   color: '#ef4444' },
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl w-full max-w-3xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2d3a52]">
          <div>
            <h2 className="text-lg font-semibold text-white">Relatório — {partner.name}</h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">Código: <span className="font-mono text-[#3b82f6]">{partner.supporter_code}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2d3a52] text-[#94a3b8] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Filtros */}
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

        {/* Tabela */}
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

// ─── Página principal ─────────────────────────────────────────────────────────
const AdminPartners = () => {
  const { token } = useAuth();
  const [loading, setLoading]           = useState(true);
  const [partners, setPartners]         = useState([]);
  const [showModal, setShowModal]       = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [copiedCode, setCopiedCode]     = useState(null);
  const [reportPartner, setReportPartner] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    supporter_code: '',       // novo — definido manualmente
    commission_rate: 0.10,
  });
  const [codeError, setCodeError] = useState('');

  useEffect(() => { fetchPartners(); }, [token]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPartners(res.data);
    } catch { toast.error('Erro ao carregar parceiros'); }
    finally { setLoading(false); }
  };

  // Validação local do código (uppercase, sem espaços, alfanumérico)
  const validateCode = (code) => {
    if (!code) return 'Código obrigatório';
    if (/\s/.test(code)) return 'Sem espaços';
    if (!/^[A-Z0-9_-]+$/.test(code)) return 'Apenas letras maiúsculas, números, _ e -';
    if (code.length < 3 || code.length > 20) return 'Entre 3 e 20 caracteres';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingPartner) {
      const err = validateCode(formData.supporter_code);
      if (err) { setCodeError(err); return; }
    }

    try {
      if (editingPartner) {
        await axios.put(`${API}/admin/partners/${editingPartner.id}`,
          { name: formData.name, email: formData.email, phone: formData.phone, commission_rate: formData.commission_rate },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Parceiro atualizado!');
      } else {
        const res = await axios.post(`${API}/admin/partners`, formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPartners(p => [res.data, ...p]);
        toast.success('Parceiro criado!');
      }
      closeModal();
      fetchPartners();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erro ao salvar parceiro';
      if (msg.toLowerCase().includes('código') || msg.toLowerCase().includes('code')) {
        setCodeError(msg);
      } else {
        toast.error(msg);
      }
    }
  };

  const toggleStatus = async (partner) => {
    const newStatus = partner.status === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`${API}/admin/partners/${partner.id}`, { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPartners(ps => ps.map(p => p.id === partner.id ? { ...p, status: newStatus } : p));
      toast.success(`Parceiro ${newStatus === 'active' ? 'ativado' : 'desativado'}!`);
    } catch { toast.error('Erro ao alterar status'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name, email: partner.email,
      phone: partner.phone || '',
      supporter_code: partner.supporter_code || partner.code || '',
      commission_rate: partner.commission_rate,
    });
    setCodeError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPartner(null);
    setFormData({ name: '', email: '', phone: '', supporter_code: '', commission_rate: 0.10 });
    setCodeError('');
  };

  // Totais do header
  const totalPending   = partners.reduce((s, p) => s + (p.commission_pending   || 0), 0);
  const totalAvailable = partners.reduce((s, p) => s + (p.commission_available || 0), 0);
  const totalPaid      = partners.reduce((s, p) => s + (p.commission_paid      || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6" data-testid="partners-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-[#16202e] rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-partners">

      {/* Modal de relatório */}
      {reportPartner && (
        <ReportModal partner={reportPartner} token={token} onClose={() => setReportPartner(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">Gestão</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Parceiros</h1>
        </div>
        <button
          onClick={() => { setEditingPartner(null); setFormData({ name: '', email: '', phone: '', supporter_code: '', commission_rate: 0.10 }); setCodeError(''); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3b82f6] text-white rounded-lg font-medium hover:bg-[#3b82f6]/90 transition-colors"
          data-testid="add-partner-btn"
        >
          <Plus size={18} />
          Novo Parceiro
        </button>
      </div>

      {/* Stats resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users,      color: '#3b82f6', label: 'Total Parceiros',     value: partners.length },
          { icon: Clock,      color: '#f59e0b', label: 'Comissão Pendente',   value: fmt(totalPending) },
          { icon: CheckCircle2, color: '#3b82f6', label: 'Comissão Disponível', value: fmt(totalAvailable) },
          { icon: Banknote,   color: '#10b981', label: 'Comissão Paga',       value: fmt(totalPaid) },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-xs text-[#94a3b8]">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid de cards */}
      {partners.length === 0 ? (
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-12 text-center">
          <Users className="mx-auto mb-4 text-[#94a3b8]" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum parceiro</h3>
          <p className="text-[#94a3b8]">Crie seu primeiro parceiro para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map(partner => {
            const code = partner.supporter_code || partner.code;
            return (
              <div key={partner.id}
                className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5 hover:border-[#3b82f6]/30 transition-all"
                data-testid={`partner-card-${partner.id}`}
              >
                {/* Cabeçalho */}
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

                {/* Código */}
                <div className="bg-[#0b121b] rounded-lg px-4 py-3 mb-4">
                  <p className="text-xs text-[#94a3b8] mb-1">Código do Apoiador</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg text-[#3b82f6]">{code}</span>
                    <button onClick={() => copyCode(code)}
                      className="p-1.5 rounded hover:bg-[#2d3a52] transition-colors"
                      data-testid={`copy-code-${partner.id}`}>
                      {copiedCode === code
                        ? <Check size={16} className="text-green-500" />
                        : <Copy size={16} className="text-[#94a3b8]" />
                      }
                    </button>
                  </div>
                </div>

                {/* Comissões detalhadas */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'Pendente',    value: partner.commission_pending,   color: '#f59e0b' },
                    { label: 'Disponível',  value: partner.commission_available, color: '#3b82f6' },
                    { label: 'Pago',        value: partner.commission_paid,      color: '#10b981' },
                    { label: 'Vendas Mês',  value: partner.total_sales_month,    color: '#94a3b8', isCurrency: false },
                  ].map(({ label, value, color, isCurrency = true }) => (
                    <div key={label} className="bg-[#0b121b] rounded-lg px-3 py-2">
                      <p className="text-xs text-[#94a3b8]">{label}</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color }}>
                        {isCurrency ? fmt(value) : (value || 0)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Comissão % */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <p className="text-xs text-[#94a3b8]">Taxa de comissão</p>
                  <p className="text-sm font-semibold text-white">{(partner.commission_rate * 100).toFixed(0)}%</p>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(partner)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2d3a52] text-white rounded-lg text-sm hover:bg-[#374763] transition-colors"
                    data-testid={`edit-partner-${partner.id}`}>
                    <Edit2 size={13} /> Editar
                  </button>
                  <button onClick={() => toggleStatus(partner)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      partner.status === 'active'
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    }`}
                    data-testid={`toggle-partner-${partner.id}`}>
                    {partner.status === 'active' ? <X size={13} /> : <Check size={13} />}
                    {partner.status === 'active' ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => setReportPartner(partner)}
                    className="px-3 py-2 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg text-sm hover:bg-[#3b82f6]/20 transition-colors"
                    title="Ver Relatório"
                    data-testid={`report-partner-${partner.id}`}>
                    <FileText size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal criar/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-[#2d3a52]">
              <h2 className="text-lg font-semibold text-white">
                {editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}
              </h2>
              <button onClick={closeModal}
                className="p-2 rounded-lg hover:bg-[#2d3a52] text-[#94a3b8] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Nome</label>
                <input type="text" required value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white focus:border-[#3b82f6] outline-none"
                  data-testid="partner-name-input" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Email</label>
                <input type="email" required value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white focus:border-[#3b82f6] outline-none"
                  data-testid="partner-email-input" />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Telefone</label>
                <input type="tel" value={formData.phone}
                  onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white focus:border-[#3b82f6] outline-none"
                  data-testid="partner-phone-input" />
              </div>

              {/* Código — apenas na criação */}
              {!editingPartner && (
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                    Código do Apoiador
                    <span className="text-xs text-[#94a3b8]/60 ml-2">(único, definido por você)</span>
                  </label>
                  <input type="text" required
                    value={formData.supporter_code}
                    onChange={e => {
                      setFormData(f => ({ ...f, supporter_code: e.target.value.toUpperCase() }));
                      setCodeError('');
                    }}
                    placeholder="Ex: JOAO2024"
                    maxLength={20}
                    className={`w-full px-4 py-2.5 bg-[#0b121b] border rounded-lg text-white font-mono tracking-wider focus:outline-none uppercase ${
                      codeError ? 'border-red-500' : 'border-[#2d3a52] focus:border-[#3b82f6]'
                    }`}
                    data-testid="partner-code-input"
                  />
                  {codeError && <p className="text-red-400 text-xs mt-1">{codeError}</p>}
                  <p className="text-[#94a3b8]/60 text-xs mt-1">
                    Letras maiúsculas, números, _ e -. Não pode ser alterado depois.
                  </p>
                </div>
              )}

              {/* Comissão */}
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Taxa de Comissão</label>
                <select value={formData.commission_rate}
                  onChange={e => setFormData(f => ({ ...f, commission_rate: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white focus:border-[#3b82f6] outline-none"
                  data-testid="partner-commission-select">
                  <option value={0.05}>5%</option>
                  <option value={0.10}>10%</option>
                  <option value={0.15}>15%</option>
                  <option value={0.20}>20%</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-[#2d3a52] text-white rounded-lg font-medium hover:bg-[#374763] transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#3b82f6] text-white rounded-lg font-medium hover:bg-[#3b82f6]/90 transition-colors"
                  data-testid="save-partner-btn">
                  {editingPartner ? 'Salvar' : 'Criar Parceiro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPartners;