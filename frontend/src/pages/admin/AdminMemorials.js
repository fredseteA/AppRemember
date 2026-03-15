import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Heart,
  Star,
  Search,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// ── Modal de confirmação de exclusão ─────────────────────────────────────────
function DeleteConfirmModal({ memorial, onConfirm, onCancel, loading }) {
  if (!memorial) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background: '#16202e', border: '1px solid #2d3a52',
        borderRadius: 16, padding: '28px 28px 24px',
        maxWidth: 420, width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={20} color="#ef4444" />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>Ação irreversível</p>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>Deletar memorial</h3>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ background: '#0b121b', borderRadius: 10, padding: '14px 16px', marginBottom: 20, border: '1px solid #2d3a52' }}>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem', margin: '0 0 4px' }}>
            {memorial.person_data?.full_name || 'Memorial sem nome'}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: 0 }}>
            Responsável: {memorial.responsible?.name || '-'} · Criado em {formatDate(memorial.created_at)}
          </p>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 24 }}>
          Esta ação irá <strong style={{ color: '#ef4444' }}>deletar permanentemente</strong> o memorial e todos os seus dados — fotos, histórias e mensagens. Essa operação <strong style={{ color: 'white' }}>não pode ser desfeita</strong>.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#2d3a52', border: 'none', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: loading ? 'rgba(239,68,68,0.4)' : '#ef4444', border: 'none', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
          >
            {loading ? (
              <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Deletando...</>
            ) : (
              <><Trash2 size={15} /> Deletar definitivamente</>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── AdminMemorials ────────────────────────────────────────────────────────────
const AdminMemorials = () => {
  const { token } = useAuth();
  const [loading, setLoading]                   = useState(true);
  const [memorials, setMemorials]               = useState([]);
  const [filteredMemorials, setFilteredMemorials] = useState([]);
  const [searchTerm, setSearchTerm]             = useState('');
  const [filter, setFilter]                     = useState('all');
  const [toDelete, setToDelete]                 = useState(null);   // memorial a deletar
  const [deleting, setDeleting]                 = useState(false);  // loading do delete
  const [togglingId, setTogglingId]             = useState(null);   // id em toggle

  useEffect(() => { fetchMemorials(); }, [token]);

  useEffect(() => { filterMemorials(); }, [memorials, searchTerm, filter]);

  const fetchMemorials = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/admin/memorials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemorials(data);
    } catch {
      toast.error('Erro ao carregar memoriais');
    } finally {
      setLoading(false);
    }
  };

  const filterMemorials = () => {
    let list = [...memorials];
    if (filter === 'published') list = list.filter(m => m.status === 'published');
    else if (filter === 'draft')    list = list.filter(m => m.status === 'draft');
    else if (filter === 'featured') list = list.filter(m => m.featured);
    else if (filter === 'inactive') list = list.filter(m => m.active === false);

    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(m =>
        m.person_data?.full_name?.toLowerCase().includes(t) ||
        m.responsible?.name?.toLowerCase().includes(t) ||
        m.responsible?.email?.toLowerCase().includes(t)
      );
    }
    setFilteredMemorials(list);
  };

  // ── Toggle ativo/inativo ──────────────────────────────────────────────────
  const toggleActive = async (memorial) => {
    if (togglingId === memorial.id) return;
    setTogglingId(memorial.id);
    try {
      const { data } = await axios.put(
        `${API}/admin/memorials/${memorial.id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMemorials(prev => prev.map(m => m.id === memorial.id ? { ...m, active: data.active } : m));
      toast.success(data.message || (data.active ? 'Memorial ativado' : 'Memorial desativado'));
    } catch {
      toast.error('Erro ao alterar status');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Toggle destaque ───────────────────────────────────────────────────────
  const toggleFeatured = async (memorial) => {
    try {
      const { data } = await axios.put(
        `${API}/admin/memorials/${memorial.id}/feature`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMemorials(prev => prev.map(m => m.id === memorial.id ? { ...m, featured: data.featured } : m));
      toast.success(data.message || 'Destaque atualizado');
    } catch {
      toast.error('Erro ao destacar memorial');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/admin/memorials/${toDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemorials(prev => prev.filter(m => m.id !== toDelete.id));
      toast.success(`Memorial de ${toDelete.person_data?.full_name || 'desconhecido'} deletado`);
      setToDelete(null);
    } catch {
      toast.error('Erro ao deletar memorial');
    } finally {
      setDeleting(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6" data-testid="memorials-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-72 bg-[#16202e] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de confirmação */}
      <DeleteConfirmModal
        memorial={toDelete}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />

      <div className="space-y-6" data-testid="admin-memorials">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">Gestão</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Memoriais</h1>
        </div>

        {/* Busca + Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white placeholder:text-[#94a3b8]/50 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none"
              data-testid="search-memorials"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all',       label: 'Todos' },
              { value: 'published', label: 'Publicados' },
              { value: 'draft',     label: 'Rascunhos' },
              { value: 'featured',  label: 'Destacados' },
              { value: 'inactive',  label: 'Inativos' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === opt.value
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#16202e] text-[#94a3b8] hover:text-white border border-[#2d3a52]'
                }`}
                data-testid={`filter-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total',      value: memorials.length,                                       color: 'white' },
            { label: 'Publicados', value: memorials.filter(m => m.status === 'published').length,  color: '#10b981' },
            { label: 'Destacados', value: memorials.filter(m => m.featured).length,                color: '#f59e0b' },
            { label: 'Rascunhos',  value: memorials.filter(m => m.status === 'draft').length,      color: '#94a3b8' },
          ].map(s => (
            <div key={s.label} className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-4">
              <p className="text-xs text-[#94a3b8] uppercase mb-1">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Grid de cards */}
        {filteredMemorials.length === 0 ? (
          <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-12 text-center">
            <Heart className="mx-auto mb-4 text-[#94a3b8]" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">Nenhum memorial encontrado</h3>
            <p className="text-[#94a3b8]">Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredMemorials.map(memorial => {
              const isActive    = memorial.active !== false;
              const isToggling  = togglingId === memorial.id;

              return (
                <div
                  key={memorial.id}
                  className="bg-[#16202e] border border-[#2d3a52] rounded-xl overflow-hidden hover:border-[#3b82f6]/30 transition-all"
                  data-testid={`memorial-card-${memorial.id}`}
                >
                  {/* Foto */}
                  <div className="relative h-28 bg-[#0b121b]">
                    {memorial.person_data?.photo_url ? (
                      <img
                        src={memorial.person_data.photo_url}
                        alt={memorial.person_data.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="text-[#2d3a52]" size={48} />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {memorial.featured && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#f59e0b]/20 text-[#f59e0b] backdrop-blur-sm flex items-center gap-1">
                          <Star size={10} className="fill-current" /> Destaque
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                        memorial.status === 'published'
                          ? 'bg-[#10b981]/20 text-[#10b981]'
                          : 'bg-[#94a3b8]/20 text-[#94a3b8]'
                      }`}>
                        {memorial.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>

                    {/* Overlay inativo */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                        <span className="px-3 py-1 bg-red-500/80 text-white text-xs font-bold rounded-lg tracking-wide">
                          DESATIVADO
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white mb-0.5 truncate">
                      {memorial.person_data?.full_name || 'Sem nome'}
                    </h3>
                    <p className="text-xs text-[#94a3b8] mb-2 truncate">
                      {memorial.responsible?.name || '-'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-3">
                      <span>{formatDate(memorial.created_at)}</span>
                      <span className="capitalize">{memorial.plan_type || '—'}</span>
                    </div>

                    {/* Ações — linha 1: toggle ativo + destaque + ver */}
                    <div className="flex gap-1.5 mb-1.5">
                      {/* Toggle ativo */}
                      <button
                        onClick={() => toggleActive(memorial)}
                        disabled={isToggling}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20'
                            : 'bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20'
                        } ${isToggling ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={isActive ? 'Clique para desativar' : 'Clique para ativar'}
                        data-testid={`toggle-active-${memorial.id}`}
                      >
                        {isToggling ? (
                          <div style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        ) : isActive ? (
                          <ToggleRight size={14} />
                        ) : (
                          <ToggleLeft size={14} />
                        )}
                        {isActive ? 'Ativo' : 'Inativo'}
                      </button>

                      {/* Destaque */}
                      <button
                        onClick={() => toggleFeatured(memorial)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          memorial.featured
                            ? 'bg-[#f59e0b]/10 text-[#f59e0b] hover:bg-[#f59e0b]/20'
                            : 'bg-[#2d3a52] text-[#94a3b8] hover:text-white'
                        }`}
                        title={memorial.featured ? 'Remover destaque' : 'Destacar memorial'}
                        data-testid={`toggle-featured-${memorial.id}`}
                      >
                        <Star size={13} className={memorial.featured ? 'fill-current' : ''} />
                        {memorial.featured ? 'Destaque' : 'Destacar'}
                      </button>

                      {/* Ver */}
                      {memorial.slug && (
                        <a
                          href={`/memorial/${memorial.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1.5 bg-[#2d3a52] text-[#94a3b8] rounded-lg hover:text-white transition-colors flex items-center justify-center"
                          title="Abrir memorial"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    {/* Ação — linha 2: deletar */}
                    <button
                      onClick={() => setToDelete(memorial)}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold bg-[#ef4444]/8 text-[#ef4444]/70 hover:bg-[#ef4444]/15 hover:text-[#ef4444] transition-all"
                      data-testid={`delete-${memorial.id}`}
                    >
                      <Trash2 size={13} />
                      Deletar memorial
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rodapé */}
        <p className="text-sm text-[#94a3b8]">
          Mostrando {filteredMemorials.length} de {memorials.length} memoriais
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default AdminMemorials;