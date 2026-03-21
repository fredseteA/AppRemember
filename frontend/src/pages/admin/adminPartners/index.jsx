import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Users, Plus, X,
  Clock, CheckCircle2, Banknote
} from 'lucide-react';
import { API } from '@/config.js';
import { PartnerCard, ReportModal, ViewAsaffiliateModal   }from './components/index';
import { fmt } from '../utils';


const AdminPartners = () => {
  const { token } = useAuth();
  const [loading, setLoading]               = useState(true);
  const [partners, setPartners]             = useState([]);
  const [showModal, setShowModal]           = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [copiedCode, setCopiedCode]         = useState(null);
  const [reportPartner, setReportPartner]   = useState(null);
  const [viewAsPartner, setViewAsPartner]   = useState(null);
  const [submitting, setSubmitting]         = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    supporter_code: '',
    password: '',
    commission_rate: 0.10,
    monthly_goal: 10,
  });
  const [codeError, setCodeError] = useState('');
  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPartners(res.data);
    } catch { toast.error('Erro ao carregar parceiros'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

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
    setSubmitting(true);
    try {
      if (editingPartner) {
        await axios.put(`${API}/admin/partners/${editingPartner.id}`,
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            commission_rate: formData.commission_rate,
            monthly_goal: formData.monthly_goal || 10,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Parceiro atualizado!');
      } else {
        // Criação: parceiro + acesso Firebase em um só endpoint
        const res = await axios.post(`${API}/admin/partners`,
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            supporter_code: formData.supporter_code,
            password: formData.password,
            commission_rate: formData.commission_rate,
            monthly_goal: formData.monthly_goal || 10,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPartners(p => [res.data, ...p]);
        toast.success(`Parceiro criado! Login: ${formData.email}`);
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
    } finally {
      setSubmitting(false);
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
      name: partner.name,
      email: partner.email,
      phone: partner.phone || '',
      supporter_code: partner.supporter_code || partner.code || '',
      password: '',
      commission_rate: partner.commission_rate,
      monthly_goal: partner.monthly_goal || 10,
    });
    setCodeError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPartner(null);
    setFormData({ name: '', email: '', phone: '', supporter_code: '', password: '', commission_rate: 0.10, monthly_goal: 10 });
    setCodeError('');
  };

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

      {/* Modais */}
      {reportPartner && (
        <ReportModal partner={reportPartner} token={token} onClose={() => setReportPartner(null)} />
      )}
      {viewAsPartner && (
        <ViewAsaffiliateModal partner={viewAsPartner} onClose={() => setViewAsPartner(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">Gestão</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Parceiros</h1>
        </div>
        <button
          onClick={() => {
            setEditingPartner(null);
            setFormData({ name: '', email: '', phone: '', supporter_code: '', password: '', commission_rate: 0.10, monthly_goal: 10 });
            setCodeError('');
            setShowModal(true);
          }}
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
          { icon: Users,        color: '#3b82f6', label: 'Total Parceiros',     value: partners.length },
          { icon: Clock,        color: '#f59e0b', label: 'Comissão Pendente',   value: fmt(totalPending) },
          { icon: CheckCircle2, color: '#3b82f6', label: 'Comissão Disponível', value: fmt(totalAvailable) },
          { icon: Banknote,     color: '#10b981', label: 'Comissão Paga',       value: fmt(totalPaid) },
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
          {partners.map(partner => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              copiedCode={copiedCode}
              token={token}
              onCopy={copyCode}
              onEdit={openEditModal}
              onToggle={toggleStatus}
              onReport={setReportPartner}
              onViewAs={setViewAsPartner}
            />
          ))}
        </div>
      )}

      {/* Modal criar/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl w-full max-w-md my-8">
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

              {/* Senha — apenas na criação */}
              {!editingPartner && (
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                    Senha de acesso <span className="text-xs text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white focus:border-[#3b82f6] outline-none"
                  />
                  <p className="text-[#94a3b8]/60 text-xs mt-1">
                    O affiliate usará este email e senha para acessar o painel.
                  </p>
                </div>
              )}

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
                    Código do affiliate
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

              {/* Meta mensal */}
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Meta mensal de vendas</label>
                <input type="number" min={1} max={999} value={formData.monthly_goal}
                  onChange={e => setFormData(f => ({ ...f, monthly_goal: parseInt(e.target.value) || 10 }))}
                  className="w-full px-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white focus:border-[#3b82f6] outline-none"
                  data-testid="partner-goal-input" />
                <p className="text-[#94a3b8]/60 text-xs mt-1">Número de vendas para a barra de progresso.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-[#2d3a52] text-white rounded-lg font-medium hover:bg-[#374763] transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-[#3b82f6] text-white rounded-lg font-medium hover:bg-[#3b82f6]/90 transition-colors disabled:opacity-50"
                  data-testid="save-partner-btn">
                  {submitting ? 'Salvando...' : editingPartner ? 'Salvar' : 'Criar Parceiro'}
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