import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Heart,
  Eye,
  EyeOff,
  Star,
  Search,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const AdminMemorials = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [memorials, setMemorials] = useState([]);
  const [filteredMemorials, setFilteredMemorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMemorials();
  }, [token]);

  useEffect(() => {
    filterMemorials();
  }, [memorials, searchTerm, filter]);

  const fetchMemorials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/memorials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemorials(response.data);
    } catch (error) {
      console.error('Error fetching memorials:', error);
      toast.error('Erro ao carregar memoriais');
    } finally {
      setLoading(false);
    }
  };

  const filterMemorials = () => {
    let filtered = [...memorials];
    
    if (filter === 'published') {
      filtered = filtered.filter(m => m.status === 'published');
    } else if (filter === 'draft') {
      filtered = filtered.filter(m => m.status === 'draft');
    } else if (filter === 'featured') {
      filtered = filtered.filter(m => m.featured);
    } else if (filter === 'inactive') {
      filtered = filtered.filter(m => m.active === false);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.person_data?.full_name?.toLowerCase().includes(term) ||
        m.responsible?.name?.toLowerCase().includes(term) ||
        m.responsible?.email?.toLowerCase().includes(term)
      );
    }
    
    setFilteredMemorials(filtered);
  };

  const toggleActive = async (memorial) => {
    try {
      const response = await axios.put(
        `${API}/admin/memorials/${memorial.id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMemorials(memorials.map(m => 
        m.id === memorial.id ? { ...m, active: response.data.active } : m
      ));
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error toggling memorial:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const toggleFeatured = async (memorial) => {
    try {
      const response = await axios.put(
        `${API}/admin/memorials/${memorial.id}/feature`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMemorials(memorials.map(m => 
        m.id === memorial.id ? { ...m, featured: response.data.featured } : m
      ));
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error featuring memorial:', error);
      toast.error('Erro ao destacar memorial');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" data-testid="memorials-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-[#16202e] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-memorials">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">
          Gestão
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Memoriais</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white placeholder:text-[#94a3b8]/50 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
            data-testid="search-memorials"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'published', label: 'Publicados' },
            { value: 'draft', label: 'Rascunhos' },
            { value: 'featured', label: 'Destacados' },
            { value: 'inactive', label: 'Inativos' }
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
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-4">
          <p className="text-xs text-[#94a3b8] uppercase">Total</p>
          <p className="text-2xl font-bold text-white">{memorials.length}</p>
        </div>
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-4">
          <p className="text-xs text-[#94a3b8] uppercase">Publicados</p>
          <p className="text-2xl font-bold text-[#10b981]">
            {memorials.filter(m => m.status === 'published').length}
          </p>
        </div>
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-4">
          <p className="text-xs text-[#94a3b8] uppercase">Destacados</p>
          <p className="text-2xl font-bold text-[#f59e0b]">
            {memorials.filter(m => m.featured).length}
          </p>
        </div>
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-4">
          <p className="text-xs text-[#94a3b8] uppercase">Rascunhos</p>
          <p className="text-2xl font-bold text-[#94a3b8]">
            {memorials.filter(m => m.status === 'draft').length}
          </p>
        </div>
      </div>

      {/* Grid */}
      {filteredMemorials.length === 0 ? (
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-12 text-center">
          <Heart className="mx-auto mb-4 text-[#94a3b8]" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum memorial encontrado</h3>
          <p className="text-[#94a3b8]">Tente ajustar os filtros de busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredMemorials.map(memorial => (
            <div 
              key={memorial.id}
              className="bg-[#16202e] border border-[#2d3a52] rounded-xl overflow-hidden hover:border-[#3b82f6]/30 transition-all"
              data-testid={`memorial-card-${memorial.id}`}
            >
              {/* Image */}
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
                <div className="absolute top-3 left-3 flex gap-2">
                  {memorial.featured && (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#f59e0b]/20 text-[#f59e0b] backdrop-blur-sm">
                      <Star size={12} className="inline mr-1" />
                      Destaque
                    </span>
                  )}
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm
                    ${memorial.status === 'published' 
                      ? 'bg-[#10b981]/20 text-[#10b981]' 
                      : 'bg-[#94a3b8]/20 text-[#94a3b8]'
                    }
                  `}>
                    {memorial.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
                
                {/* Active indicator */}
                {memorial.active === false && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="px-3 py-1.5 bg-red-500/80 text-white text-sm font-semibold rounded-lg">
                      Desativado
                    </span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-3">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {memorial.person_data?.full_name || 'Sem nome'}
                </h3>
                <p className="text-sm text-[#94a3b8] mb-3">
                  Responsável: {memorial.responsible?.name || '-'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-4">
                  <span>Criado: {formatDate(memorial.created_at)}</span>
                  <span className="capitalize">{memorial.plan_type || 'Sem plano'}</span>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(memorial)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      memorial.active !== false
                        ? 'bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20'
                        : 'bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20'
                    }`}
                    data-testid={`toggle-active-${memorial.id}`}
                  >
                    {memorial.active !== false ? (
                      <>
                        <ToggleRight size={16} />
                        Ativo
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={16} />
                        Inativo
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => toggleFeatured(memorial)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      memorial.featured
                        ? 'bg-[#f59e0b]/10 text-[#f59e0b] hover:bg-[#f59e0b]/20'
                        : 'bg-[#2d3a52] text-[#94a3b8] hover:text-white'
                    }`}
                    data-testid={`toggle-featured-${memorial.id}`}
                  >
                    <Star size={16} className={memorial.featured ? 'fill-current' : ''} />
                    {memorial.featured ? 'Destacado' : 'Destacar'}
                  </button>
                  
                  {memorial.slug && (
                    <a
                      href={`/memorial/${memorial.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-[#2d3a52] text-[#94a3b8] rounded-lg hover:text-white transition-colors"
                      title="Ver memorial"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Summary */}
      <div className="text-sm text-[#94a3b8]">
        Mostrando {filteredMemorials.length} de {memorials.length} memoriais
      </div>
    </div>
  );
};

export default AdminMemorials;
