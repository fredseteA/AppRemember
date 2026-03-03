import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Copy,
  Check,
  X,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Edit2,
  Trash2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const AdminPartners = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commission_rate: 0.10
  });

  useEffect(() => {
    fetchPartners();
  }, [token]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPartners(response.data);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Erro ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPartner) {
        await axios.put(
          `${API}/admin/partners/${editingPartner.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Parceiro atualizado!');
      } else {
        const response = await axios.post(
          `${API}/admin/partners`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPartners([response.data, ...partners]);
        toast.success('Parceiro criado!');
      }
      
      setShowModal(false);
      setEditingPartner(null);
      setFormData({ name: '', email: '', phone: '', commission_rate: 0.10 });
      fetchPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Erro ao salvar parceiro');
    }
  };

  const toggleStatus = async (partner) => {
    try {
      const newStatus = partner.status === 'active' ? 'inactive' : 'active';
      await axios.put(
        `${API}/admin/partners/${partner.id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPartners(partners.map(p => 
        p.id === partner.id ? { ...p, status: newStatus } : p
      ));
      toast.success(`Parceiro ${newStatus === 'active' ? 'ativado' : 'desativado'}!`);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const payCommission = async (partner) => {
    if (!window.confirm(`Confirma o pagamento de comissão para ${partner.name}?`)) return;
    
    try {
      const response = await axios.post(
        `${API}/admin/partners/${partner.id}/pay-commission`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Comissão de ${formatCurrency(response.data.amount)} paga!`);
      fetchPartners();
    } catch (error) {
      console.error('Error paying commission:', error);
      toast.error(error.response?.data?.detail || 'Erro ao pagar comissão');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      email: partner.email,
      phone: partner.phone || '',
      commission_rate: partner.commission_rate
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6" data-testid="partners-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-[#16202e] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-partners">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">
            Gestão
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Parceiros</h1>
        </div>
        
        <button
          onClick={() => {
            setEditingPartner(null);
            setFormData({ name: '', email: '', phone: '', commission_rate: 0.10 });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3b82f6] text-white rounded-lg font-medium hover:bg-[#3b82f6]/90 transition-colors"
          data-testid="add-partner-btn"
        >
          <Plus size={18} />
          Novo Parceiro
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center">
              <Users className="text-[#3b82f6]" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{partners.length}</p>
              <p className="text-xs text-[#94a3b8]">Total de Parceiros</p>
            </div>
          </div>
        </div>
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
              <Check className="text-[#10b981]" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {partners.filter(p => p.status === 'active').length}
              </p>
              <p className="text-xs text-[#94a3b8]">Parceiros Ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center">
              <DollarSign className="text-[#f59e0b]" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(partners.reduce((sum, p) => sum + (p.total_revenue_all_time || 0), 0))}
              </p>
              <p className="text-xs text-[#94a3b8]">Vendas Totais</p>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      {partners.length === 0 ? (
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-12 text-center">
          <Users className="mx-auto mb-4 text-[#94a3b8]" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum parceiro</h3>
          <p className="text-[#94a3b8]">Crie seu primeiro parceiro para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map(partner => (
            <div 
              key={partner.id}
              className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-5 hover:border-[#3b82f6]/30 transition-all"
              data-testid={`partner-card-${partner.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{partner.name}</h3>
                  <p className="text-sm text-[#94a3b8]">{partner.email}</p>
                </div>
                <span className={`
                  px-2.5 py-1 rounded-full text-xs font-semibold
                  ${partner.status === 'active' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-red-500/10 text-red-500'
                  }
                `}>
                  {partner.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              {/* Code */}
              <div className="bg-[#0b121b] rounded-lg px-4 py-3 mb-4">
                <p className="text-xs text-[#94a3b8] mb-1">Código do Parceiro</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg text-[#3b82f6]">{partner.code}</span>
                  <button
                    onClick={() => copyCode(partner.code)}
                    className="p-1.5 rounded hover:bg-[#2d3a52] transition-colors"
                    data-testid={`copy-code-${partner.id}`}
                  >
                    {copiedCode === partner.code ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} className="text-[#94a3b8]" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-[#94a3b8]">Comissão</p>
                  <p className="text-lg font-semibold text-white">
                    {(partner.commission_rate * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#94a3b8]">Vendas Mês</p>
                  <p className="text-lg font-semibold text-white">
                    {partner.total_sales_month || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#94a3b8]">Total Vendido</p>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(partner.total_revenue_all_time || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#94a3b8]">Vendas Mês (R$)</p>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(partner.total_revenue_month || 0)}
                  </p>
                </div>
              </div>
              
              {/* Bonus indicator */}
              {partner.total_sales_month > 10 && (
                <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#f59e0b]" />
                  <span className="text-xs text-[#f59e0b]">Bônus ativo: 15% de comissão!</span>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(partner)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#2d3a52] text-white rounded-lg text-sm hover:bg-[#374763] transition-colors"
                  data-testid={`edit-partner-${partner.id}`}
                >
                  <Edit2 size={14} />
                  Editar
                </button>
                <button
                  onClick={() => toggleStatus(partner)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    partner.status === 'active'
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  }`}
                  data-testid={`toggle-partner-${partner.id}`}
                >
                  {partner.status === 'active' ? <X size={14} /> : <Check size={14} />}
                  {partner.status === 'active' ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => payCommission(partner)}
                  className="px-3 py-2 bg-[#10b981]/10 text-[#10b981] rounded-lg text-sm hover:bg-[#10b981]/20 transition-colors"
                  title="Pagar Comissão"
                  data-testid={`pay-commission-${partner.id}`}
                >
                  <DollarSign size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-[#2d3a52]">
              <h2 className="text-lg font-semibold text-white">
                {editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPartner(null);
                }}
                className="p-2 rounded-lg hover:bg-[#2d3a52] text-[#94a3b8] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                  data-testid="partner-name-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                  data-testid="partner-email-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                  data-testid="partner-phone-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                  Comissão
                </label>
                <select
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white focus:border-[#3b82f6]"
                  data-testid="partner-commission-select"
                >
                  <option value={0.10}>10%</option>
                  <option value={0.15}>15%</option>
                  <option value={0.20}>20%</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPartner(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-[#2d3a52] text-white rounded-lg font-medium hover:bg-[#374763] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#3b82f6] text-white rounded-lg font-medium hover:bg-[#3b82f6]/90 transition-colors"
                  data-testid="save-partner-btn"
                >
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
