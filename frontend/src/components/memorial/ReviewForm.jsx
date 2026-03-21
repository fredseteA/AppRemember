import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Star, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config';

const ReviewForm = ({ onSuccess }) => {
  const { user, token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Por favor, selecione uma nota de 1 a 5 estrelas');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/reviews`, {
        rating,
        title: title || null,
        comment: comment || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmitted(true);
      toast.success('Obrigado pela sua avaliação! Ela será revisada pela nossa equipe.');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Erro ao enviar avaliação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = { 1: 'Ruim', 2: 'Regular', 3: 'Bom', 4: 'Muito bom!', 5: 'Excelente!' };

  const sharedCardStyle = {
    background: 'rgba(255,255,255,0.65)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    border: '1px solid rgba(255,255,255,0.88)',
    borderRadius: 24,
    boxShadow: '0 12px 44px rgba(26,39,68,0.09)',
    fontFamily: '"Georgia", serif',
    position: 'relative',
    overflow: 'hidden',
  };

  const styles = `
    @keyframes floatRF1 {
      0%,100% { transform: translateY(0) translateX(0); }
      45%     { transform: translateY(-12px) translateX(7px); }
    }
    @keyframes floatRF2 {
      0%,100% { transform: translateY(0) translateX(0); }
      55%     { transform: translateY(-8px) translateX(-5px); }
    }
    @keyframes revealRF {
      from { opacity: 0; transform: translateY(16px); filter: blur(4px); }
      to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
    }
    .rf-input {
      width: 100%; padding: 12px 14px; border-radius: 12px;
      border: 1.5px solid rgba(26,39,68,0.12);
      background: rgba(255,255,255,0.7); backdrop-filter: blur(8px);
      font-family: "Georgia", serif; font-size: 1rem; color: #1a2744;
      outline: none; transition: border-color 0.25s ease, box-shadow 0.25s ease;
      -webkit-appearance: none; appearance: none; box-sizing: border-box;
    }
    .rf-input:focus {
      border-color: #5aa8e0;
      box-shadow: 0 0 0 3px rgba(90,168,224,0.15);
    }
    .rf-input::placeholder { color: rgba(58,80,112,0.4); }
    .rf-textarea {
      width: 100%; padding: 12px 14px; border-radius: 12px;
      border: 1.5px solid rgba(26,39,68,0.12);
      background: rgba(255,255,255,0.7); backdrop-filter: blur(8px);
      font-family: "Georgia", serif; font-size: 1rem; color: #1a2744;
      outline: none; resize: none;
      transition: border-color 0.25s ease, box-shadow 0.25s ease;
      -webkit-appearance: none; appearance: none; box-sizing: border-box;
    }
    .rf-textarea:focus {
      border-color: #5aa8e0;
      box-shadow: 0 0 0 3px rgba(90,168,224,0.15);
    }
    .rf-textarea::placeholder { color: rgba(58,80,112,0.4); }
    .rf-label {
      display: block; font-family: "Georgia", serif;
      font-size: 0.65rem; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: #2a3d5e; margin-bottom: 8px;
    }
    .rf-star-btn {
      background: none; border: none; cursor: pointer; padding: 2px;
      transition: transform 0.2s cubic-bezier(.22,1,.36,1);
      -webkit-tap-highlight-color: transparent;
      line-height: 1;
    }
    .rf-star-btn:hover { transform: scale(1.2); }
    .rf-btn {
      width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 14px 24px; border-radius: 999px; background: #1a2744; color: white;
      font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 700;
      letter-spacing: 0.06em; border: none; cursor: pointer;
      transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
      box-shadow: 0 6px 20px rgba(26,39,68,0.18); min-height: 50px;
      -webkit-tap-highlight-color: transparent;
    }
    .rf-btn:hover:not(:disabled) { background: #2a3d5e; transform: translateY(-1px); }
    .rf-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  /* ── Not logged in ── */
  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div style={{ ...sharedCardStyle, padding: 'clamp(28px, 5vw, 40px)', textAlign: 'center', animation: 'revealRF 0.6s cubic-bezier(.22,1,.36,1) both' }}>
          {/* Nuvem esquerda */}
          <div className="absolute top-[-8px] left-[-24px] w-28 opacity-45 pointer-events-none select-none"
            style={{ animation: 'floatRF1 10s ease-in-out infinite' }}>
            <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
            background: 'rgba(90,168,224,0.1)', border: '1px solid rgba(90,168,224,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={24} style={{ color: '#5aa8e0' }} />
          </div>
          <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.92rem', color: '#3a5070', lineHeight: 1.6 }}>
            Faça login para deixar sua avaliação
          </p>
        </div>
      </>
    );
  }

  /* ── Submitted ── */
  if (submitted) {
    return (
      <>
        <style>{styles}</style>
        <div style={{ ...sharedCardStyle, padding: 'clamp(28px, 5vw, 40px)', textAlign: 'center', animation: 'revealRF 0.6s cubic-bezier(.22,1,.36,1) both' }}>
          {/* Nuvem esquerda */}
          <div className="absolute top-[-8px] left-[-24px] w-28 opacity-45 pointer-events-none select-none"
            style={{ animation: 'floatRF1 10s ease-in-out infinite' }}>
            <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
            background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle size={32} style={{ color: '#15803d' }} />
          </div>
          <h3 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 700, color: '#1a2744', marginBottom: 10 }}>
            Avaliação enviada com sucesso!
          </h3>
          <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.85rem', color: '#3a5070', lineHeight: 1.7 }}>
            Obrigado pelo seu feedback. Sua avaliação será revisada e publicada em breve.
          </p>
        </div>
      </>
    );
  }

  /* ── Form ── */
  return (
    <>
      <style>{styles}</style>
      <div style={{ ...sharedCardStyle, animation: 'revealRF 0.6s cubic-bezier(.22,1,.36,1) both' }}>

        {/* Nuvem esquerda */}
        <div className="absolute top-[-8px] left-[-24px] w-28 opacity-45 pointer-events-none select-none"
          style={{ animation: 'floatRF1 10s ease-in-out infinite' }}>
          <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        {/* Nuvem direita */}
        <div className="absolute top-[5px] right-[-18px] w-20 opacity-30 pointer-events-none select-none hidden md:block"
          style={{ animation: 'floatRF2 13s ease-in-out infinite' }}>
          <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* Header */}
        <div style={{
          padding: 'clamp(20px, 4vw, 28px) clamp(20px, 5vw, 32px) clamp(14px, 3vw, 20px)',
          borderBottom: '1px solid rgba(26,39,68,0.07)',
          display: 'flex', alignItems: 'center', gap: 12,
          position: 'relative', zIndex: 1,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(90,168,224,0.12)', border: '1px solid rgba(90,168,224,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={16} style={{ color: '#5aa8e0' }} />
          </div>
          <div>
            <span style={{
              display: 'block', fontSize: '0.58rem', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5aa8e0', marginBottom: 2,
            }}>
              Avaliação
            </span>
            <h3 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', fontWeight: 700, color: '#1a2744' }}>
              Deixe sua Avaliação
            </h3>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: 'clamp(20px, 4vw, 28px) clamp(20px, 5vw, 32px)', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 1 }}>

          {/* Estrelas */}
          <div>
            <label className="rf-label">Sua nota *</label>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="rf-star-btn"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    size={30}
                    style={{
                      fill: star <= (hoverRating || rating) ? '#fbbf24' : 'transparent',
                      color: star <= (hoverRating || rating) ? '#fbbf24' : 'rgba(58,80,112,0.25)',
                      transition: 'fill 0.18s ease, color 0.18s ease',
                    }}
                  />
                </button>
              ))}
              {(hoverRating || rating) > 0 && (
                <span style={{
                  fontFamily: '"Georgia", serif',
                  fontSize: '0.78rem', fontWeight: 700,
                  color: '#d97706', marginLeft: 6,
                  letterSpacing: '0.04em',
                }}>
                  {ratingLabels[hoverRating || rating]}
                </span>
              )}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="rf-label" htmlFor="review-title">Título (opcional)</label>
            <input
              id="review-title"
              className="rf-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Excelente serviço!"
              maxLength={100}
            />
          </div>

          {/* Comentário */}
          <div>
            <label className="rf-label" htmlFor="review-comment">Comentário (opcional)</label>
            <textarea
              id="review-comment"
              className="rf-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte sua experiência com a plataforma..."
              rows={3}
              maxLength={500}
            />
            <p style={{
              fontFamily: '"Georgia", serif',
              fontSize: '0.68rem', color: 'rgba(58,80,112,0.45)',
              marginTop: 5, textAlign: 'right',
            }}>
              {comment.length}/500
            </p>
          </div>

          {/* Botão */}
          <button type="submit" className="rf-btn" disabled={loading || rating === 0}>
            {loading ? (
              <>
                <div style={{
                  width: 15, height: 15, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  animation: 'spin 0.8s linear infinite',
                  flexShrink: 0,
                }} />
                Enviando...
              </>
            ) : (
              <>
                <Send size={15} />
                Enviar Avaliação
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default ReviewForm;