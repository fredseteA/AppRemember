import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Star,
  Check,
  X,
  MessageSquare,
  Send,
  AlertCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <Star
        key={star}
        size={14}
        className={star <= rating ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-[#2d3a52]'}
      />
    ))}
    <span className="text-sm text-[#94a3b8] ml-1">{rating}/5</span>
  </div>
);

const AdminReviews = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [token]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (reviewId) => {
    try {
      await axios.put(
        `${API}/admin/reviews/${reviewId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, approved: true } : r
      ));
      toast.success('Avaliação aprovada!');
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Erro ao aprovar avaliação');
    }
  };

  const rejectReview = async (reviewId) => {
    try {
      await axios.put(
        `${API}/admin/reviews/${reviewId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, approved: false } : r
      ));
      toast.success('Avaliação reprovada!');
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Erro ao reprovar avaliação');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    
    try {
      await axios.delete(
        `${API}/admin/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReviews(reviews.filter(r => r.id !== reviewId));
      toast.success('Avaliação excluída!');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Erro ao excluir avaliação');
    }
  };

  const respondToReview = async (reviewId) => {
    if (!responseText.trim()) return;
    
    try {
      await axios.post(
        `${API}/admin/reviews/${reviewId}/respond`,
        { response: responseText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReviews(reviews.map(r => 
        r.id === reviewId ? { 
          ...r, 
          admin_response: responseText,
          response_date: new Date().toISOString()
        } : r
      ));
      
      setRespondingTo(null);
      setResponseText('');
      toast.success('Resposta enviada!');
    } catch (error) {
      console.error('Error responding to review:', error);
      toast.error('Erro ao enviar resposta');
    }
  };

  const filteredReviews = filter === 'all' 
    ? reviews 
    : filter === 'pending' 
      ? reviews.filter(r => !r.approved)
      : reviews.filter(r => r.approved);

  const pendingCount = reviews.filter(r => !r.approved).length;

  if (loading) {
    return (
      <div className="space-y-6" data-testid="reviews-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-[#16202e] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-reviews">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">
            Gestão
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Avaliações</h1>
        </div>
        
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg">
            <AlertCircle size={18} className="text-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b]">{pendingCount} pendente{pendingCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: `Todas (${reviews.length})` },
          { value: 'pending', label: `Pendentes (${pendingCount})` },
          { value: 'approved', label: `Aprovadas (${reviews.length - pendingCount})` }
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

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-12 text-center">
          <MessageSquare className="mx-auto mb-4 text-[#94a3b8]" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhuma avaliação</h3>
          <p className="text-[#94a3b8]">
            {filter === 'pending' ? 'Não há avaliações pendentes.' : 'Não há avaliações ainda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div 
              key={review.id}
              className={`
                bg-[#16202e] border rounded-xl p-5 transition-all
                ${review.approved 
                  ? 'border-[#2d3a52] hover:border-[#3b82f6]/30' 
                  : 'border-[#f59e0b]/30'
                }
              `}
              data-testid={`review-card-${review.id}`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* User info & content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {review.user_photo_url ? (
                      <img 
                        src={review.user_photo_url} 
                        alt={review.user_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
                        <span className="text-[#3b82f6] font-semibold">
                          {review.user_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">{review.user_name}</p>
                      <p className="text-xs text-[#94a3b8]">{review.user_email}</p>
                    </div>
                    <span className={`
                      ml-auto px-2.5 py-1 rounded-full text-xs font-semibold
                      ${review.approved 
                        ? 'bg-[#10b981]/10 text-[#10b981]' 
                        : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                      }
                    `}>
                      {review.approved ? 'Aprovada' : 'Pendente'}
                    </span>
                  </div>
                  
                  <StarRating rating={review.rating} />
                  
                  {review.title && (
                    <h4 className="text-lg font-semibold text-white mt-3">
                      "{review.title}"
                    </h4>
                  )}
                  
                  {review.comment && (
                    <p className="text-[#94a3b8] mt-2 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  
                  <p className="text-xs text-[#94a3b8]/60 mt-3">
                    {formatDate(review.created_at)}
                  </p>
                  
                  {/* Admin Response */}
                  {review.admin_response && (
                    <div className="mt-4 pl-4 border-l-2 border-[#3b82f6]">
                      <p className="text-xs text-[#3b82f6] font-semibold mb-1">Resposta do Admin</p>
                      <p className="text-sm text-[#94a3b8]">{review.admin_response}</p>
                      <p className="text-xs text-[#94a3b8]/60 mt-1">
                        {formatDate(review.response_date)}
                      </p>
                    </div>
                  )}
                  
                  {/* Response Form */}
                  {respondingTo === review.id && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Digite sua resposta..."
                        className="flex-1 px-4 py-2 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white text-sm focus:border-[#3b82f6]"
                        data-testid={`response-input-${review.id}`}
                      />
                      <button
                        onClick={() => respondToReview(review.id)}
                        disabled={!responseText.trim()}
                        className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg font-medium text-sm hover:bg-[#3b82f6]/90 transition-colors disabled:opacity-50"
                        data-testid={`send-response-${review.id}`}
                      >
                        <Send size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setRespondingTo(null);
                          setResponseText('');
                        }}
                        className="px-4 py-2 bg-[#2d3a52] text-white rounded-lg text-sm hover:bg-[#374763] transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex md:flex-col gap-2">
                  {!review.approved && (
                    <button
                      onClick={() => approveReview(review.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#10b981]/10 text-[#10b981] rounded-lg text-sm font-medium hover:bg-[#10b981]/20 transition-colors"
                      data-testid={`approve-${review.id}`}
                    >
                      <ThumbsUp size={16} />
                      Aprovar
                    </button>
                  )}
                  
                  {review.approved && (
                    <button
                      onClick={() => rejectReview(review.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b]/10 text-[#f59e0b] rounded-lg text-sm font-medium hover:bg-[#f59e0b]/20 transition-colors"
                      data-testid={`reject-${review.id}`}
                    >
                      <ThumbsDown size={16} />
                      Reprovar
                    </button>
                  )}
                  
                  {!review.admin_response && respondingTo !== review.id && (
                    <button
                      onClick={() => setRespondingTo(review.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg text-sm font-medium hover:bg-[#3b82f6]/20 transition-colors"
                      data-testid={`respond-${review.id}`}
                    >
                      <MessageSquare size={16} />
                      Responder
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ef4444]/10 text-[#ef4444] rounded-lg text-sm font-medium hover:bg-[#ef4444]/20 transition-colors"
                    data-testid={`delete-${review.id}`}
                  >
                    <X size={16} />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
