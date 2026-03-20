import { useState, useEffect, useRef, useCallback } from 'react';
/*import { useTranslation } from 'react-i18next';*/
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Star, MessageSquarePlus, User} from 'lucide-react';
import ReviewForm from '@/components/memorial/ReviewForm.jsx';
import axios from 'axios';

const defaultReviews = [
  {
    id: 'default-1',
    user_name: "Maria Souza",
    user_photo_url: null,
    rating: 5,
    title: "Super Recomendo",
    comment: "Encontrei por acaso e comprei. Era para preparar a despedida para meu sobrinho. Produto de qualidade e entrega rápida."
  },
  {
    id: 'default-2',
    user_name: "João Carlos",
    user_photo_url: null,
    rating: 5,
    title: "Site confiável",
    comment: "Comprei chegou certinho! Além do ótimo atendimento e preocupação com um assunto tão delicado!"
  },
  {
    id: 'default-3',
    user_name: "Ana Paula",
    user_photo_url: null,
    rating: 5,
    title: "Excelente produto",
    comment: "Além de ser um produto de qualidade tem um atendimento top de linha e empatia. Recomendo!"
  }
];

// ── ReviewCard ──────────────────────────────────────────────────────────────
function ReviewCard({ review, featured = false }) {
  return (
    <div style={{
      borderRadius: "22px",
      padding: featured ? "clamp(22px,3vw,32px)" : "20px 24px",
      background: featured ? "rgba(255,255,255,0.62)" : "rgba(255,255,255,0.38)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: "1px solid rgba(255,255,255,0.8)",
      boxShadow: featured
        ? "0 16px 48px rgba(26,39,68,0.14), inset 0 1px 0 rgba(255,255,255,0.9)"
        : "0 6px 20px rgba(26,39,68,0.07)",
      transition: "all 0.35s ease",
    }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={featured ? 15 : 13}
            className={i < (review.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
      {review.title && (
        <h3 style={{
          fontFamily: '"Georgia", serif',
          fontSize: featured ? "clamp(1rem, 2vw, 1.25rem)" : "0.95rem",
          fontWeight: 700, color: "#1a2744",
          marginBottom: "8px", lineHeight: 1.3,
        }}>
          "{review.title}"
        </h3>
      )}
      {review.comment && (
        <p style={{
          color: "#3a5070",
          fontSize: featured ? "0.9rem" : "0.82rem",
          lineHeight: 1.68, marginBottom: "18px",
          fontFamily: '"Georgia", serif',
        }}>
          {review.comment}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {review.user_photo_url ? (
          <img
            src={review.user_photo_url}
            alt={review.user_name}
            style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(90,168,224,0.3)" }}
          />
        ) : (
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(26,39,68,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <User size={16} style={{ color: "#3a5070" }} />
          </div>
        )}
        <div>
          <p style={{ fontFamily: '"Georgia", serif', fontSize: "0.82rem", fontWeight: 700, color: "#1a2744" }}>
            {review.user_name}
          </p>
          <p style={{ fontSize: "0.68rem", color: "#5aa8e0", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
            Cliente
          </p>
        </div>
      </div>
    </div>
  );
}

const TestimonialsSection = () => {
  const { user } = useAuth();                                    
  {/*const { t } = useTranslation();*/}
  const [active, setActive] = useState(0);
  const [animDir, setAnimDir] = useState('next');
  const [animating, setAnimating] = useState(false);
  const [reviews, setReviews] = useState(defaultReviews);       
  const [loadingReviews, setLoadingReviews] = useState(false);  
  const [showReviewForm, setShowReviewForm] = useState(false);  

  const timerRef = useRef(null);
  const list = reviews.slice(0, 6);

  const fetchReviews = useCallback(async () => {               
    try {
      setLoadingReviews(true);
      const { data } = await axios.get('/api/reviews');
      const reviewsArray = Array.isArray(data) ? data : (data?.reviews ?? []);
      setReviews(reviewsArray.length > 0 ? reviewsArray : defaultReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(defaultReviews);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const startCarouselTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setAnimDir('next');
      setAnimating(true);
      setTimeout(() => {
        setActive(prev => (prev + 1) % list.length);
        setAnimating(false);
      }, 380);
    }, 5000);
  }, [list.length]);

  const goTo = useCallback((idx, dir = 'next') => {
    if (animating) return;
    clearInterval(timerRef.current);
    setAnimDir(dir);
    setAnimating(true);
    setTimeout(() => {
      setActive(idx);
      setAnimating(false);
      startCarouselTimer();
    }, 380);
  }, [animating, startCarouselTimer]);

  useEffect(() => {
    if (list.length > 0) startCarouselTimer();
    return () => clearInterval(timerRef.current);
  }, [list.length, startCarouselTimer]);

  const prev = () => goTo(active === 0 ? list.length - 1 : active - 1, 'prev');
  const next = () => goTo((active + 1) % list.length, 'next');

  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #b8e0f5 0%, #a8d8f0 18%, #8ecce8 40%, #a8d8f0 75%, #b8e0f5 100%)",
        marginTop: 0,
        borderTop: "none",
      }}
    >
      <style>{`
        @keyframes floatT1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-14px) translateX(8px); }
        }
        @keyframes floatT2 {
          0%,100% { transform: translateY(0) translateX(0); }
          55%     { transform: translateY(-10px) translateX(-7px); }
        }
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(60px) scale(0.97); filter: blur(4px); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    filter: blur(0);   }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-60px) scale(0.97); filter: blur(4px); }
          to   { opacity: 1; transform: translateX(0)     scale(1);    filter: blur(0);   }
        }
        @keyframes slideOutToLeft {
          from { opacity: 1; transform: translateX(0);     filter: blur(0);   }
          to   { opacity: 0; transform: translateX(-60px); filter: blur(4px); }
        }
        @keyframes slideOutToRight {
          from { opacity: 1; transform: translateX(0);    filter: blur(0);   }
          to   { opacity: 0; transform: translateX(60px); filter: blur(4px); }
        }
        .testi-enter-next { animation: slideInFromRight 0.38s cubic-bezier(.22,1,.36,1) both; }
        .testi-enter-prev { animation: slideInFromLeft  0.38s cubic-bezier(.22,1,.36,1) both; }
        .testi-leave-next { animation: slideOutToLeft   0.38s cubic-bezier(.22,1,.36,1) both; }
        .testi-leave-prev { animation: slideOutToRight  0.38s cubic-bezier(.22,1,.36,1) both; }
        .testi-dot {
          width: 8px; height: 8px;
          border-radius: 999px;
          background: rgba(26,39,68,0.2);
          border: none; cursor: pointer;
          transition: all 0.35s cubic-bezier(.22,1,.36,1);
          padding: 0;
        }
        .testi-dot.testi-dot-active {
          width: 24px;
          background: rgba(26,39,68,0.55);
        }
        .testi-arrow {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.45);
          border: 1.5px solid rgba(255,255,255,0.8);
          color: #1a2744;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(26,39,68,0.08);
        }
        .testi-arrow:hover {
          background: rgba(255,255,255,0.7);
          transform: scale(1.08);
          box-shadow: 0 4px 16px rgba(26,39,68,0.12);
        }
        @media (max-width: 767px) {
          .testi-cloud-left  { width: 120px !important; left: -20px !important; }
          .testi-cloud-right { display: none !important; }
        }
      `}</style>

      <div className="testi-cloud-left absolute top-0 left-[-60px] w-44 md:w-60 opacity-70 pointer-events-none select-none"
        style={{ animation: "floatT1 10s ease-in-out infinite" }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="testi-cloud-right absolute bottom-0 right-[-40px] w-40 md:w-52 opacity-60 pointer-events-none select-none hidden md:block"
        style={{ animation: "floatT2 12s ease-in-out infinite" }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-12">

        <div className="text-center mb-10 md:mb-14">
          <p style={{ textTransform: "uppercase", letterSpacing: "0.22em", fontSize: "0.68rem", fontWeight: 700, color: "rgba(42,61,94,0.55)", marginBottom: "12px" }}>
            Avaliações
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(1.3rem, 5vw, 2.6rem)", fontWeight: 700, color: "#1a2744", lineHeight: 1.2 }}>
              O que nossos clientes dizem
            </h2>
            {user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                style={{
                  borderRadius: "999px", padding: "8px 18px",
                  background: "rgba(255,255,255,0.45)", backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,0.75)",
                  color: "#1a2744", fontSize: "0.78rem", fontWeight: 600,
                  fontFamily: '"Georgia", serif', cursor: "pointer",
                  transition: "all 0.25s ease", display: "flex", alignItems: "center", gap: "6px",
                  boxShadow: "0 2px 10px rgba(26,39,68,0.07)",
                }}
              >
                <MessageSquarePlus size={14} />
                {showReviewForm ? 'Fechar' : 'Avaliar'}
              </button>
            )}
          </div>
        </div>

        {showReviewForm && (
          <div className="mb-10 max-w-xl mx-auto">
            <ReviewForm onSuccess={() => { setShowReviewForm(false); fetchReviews(); }} />
          </div>
        )}

        {loadingReviews ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60" />
          </div>
        ) : list.length === 0 ? null : (
          <>
            <div className="hidden md:flex items-center justify-center gap-6 mb-10" style={{ minHeight: 280 }}>
              <div style={{ flex: "0 0 300px", maxWidth: 300, opacity: 0.38, transform: "scale(0.9)", pointerEvents: "none", userSelect: "none" }}>
                <ReviewCard review={list[(active - 1 + list.length) % list.length]} featured={false} />
              </div>
              <div
                key={active}
                className={animating
                  ? (animDir === 'next' ? 'testi-leave-next' : 'testi-leave-prev')
                  : (animDir === 'next' ? 'testi-enter-next' : 'testi-enter-prev')
                }
                style={{ flex: "0 0 400px", maxWidth: 400, zIndex: 2 }}
              >
                <ReviewCard review={list[active]} featured />
              </div>
              <div style={{ flex: "0 0 300px", maxWidth: 300, opacity: 0.38, transform: "scale(0.9)", pointerEvents: "none", userSelect: "none" }}>
                <ReviewCard review={list[(active + 1) % list.length]} featured={false} />
              </div>
            </div>

            <div className="md:hidden mb-8 px-2">
              <div
                key={`mob-${active}`}
                className={animating
                  ? (animDir === 'next' ? 'testi-leave-next' : 'testi-leave-prev')
                  : (animDir === 'next' ? 'testi-enter-next' : 'testi-enter-prev')
                }
              >
                <ReviewCard review={list[active]} featured />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button className="testi-arrow" onClick={prev} aria-label="Anterior">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a2744" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div className="flex items-center gap-2">
                {list.map((_, i) => (
                  <button key={i} className={`testi-dot${active === i ? ' testi-dot-active' : ''}`}
                    onClick={() => goTo(i, i > active ? 'next' : 'prev')} aria-label={`Avaliação ${i + 1}`} />
                ))}
              </div>
              <button className="testi-arrow" onClick={next} aria-label="Próximo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a2744" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default TestimonialsSection;
