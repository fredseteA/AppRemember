import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Skeleton } from '../../components/ui/skeleton';
import { Heart } from 'lucide-react';
import { API } from '@/config';
import { useTranslation } from 'react-i18next';
import skyCard from '@/assets/sky-card.jpg';

const PAGE_SIZE = 12;

const MemorialCard = ({ memorial, index }) => (
  <Link key={memorial.id} to={`/memorial/${memorial.slug || memorial.id}`} data-testid={`memorial-card-${memorial.id}`}>
    <div
      className="exp-card group relative rounded-3xl overflow-hidden h-full flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(255,255,255,0.82)',
        boxShadow: '0 6px 28px rgba(26,39,68,0.10)',
        animation: `revealCard 0.5s cubic-bezier(.22,1,.36,1) ${Math.min(index * 0.06, 0.3)}s both`,
      }}
    >
      {/* ── Banner topo com logo Remember ── */}
      <div
        className="relative flex-shrink-0"
        style={{
          height: '90px',
          overflow: 'visible',
        }}
      >
        {/* Background sky-card.jpg */}
        <img
          src={skyCard}
          alt=""
          aria-hidden
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />

        {/* Logo transparent.svg centralizada */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ paddingBottom: '30px', zIndex: 1 }}
        >
          <img
            src="/logo-transparent.svg"
            alt="Remember"
            style={{
              height: '60px',
              width: 'auto',
              opacity: 0.55,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* Foto circular na divisa banner/card */}
        <div
          style={{
            position: 'absolute',
            bottom: '-36px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: '3px solid #fff',
              boxShadow: '0 4px 16px rgba(26,39,68,0.18)',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #b8e0f5 0%, #7bbde8 100%)',
            }}
          >
            {memorial.person_data.photo_url ? (
              <img
                src={memorial.person_data.photo_url}
                alt={memorial.person_data.full_name}
                className="exp-card-img"
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  display: 'block',
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart style={{ width: '28px', height: '28px', color: 'rgba(255,255,255,0.7)' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div
        className="flex flex-col flex-1 text-center"
        style={{
          paddingTop: '44px',
          paddingBottom: '20px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        {/* Nome */}
        <h3
          className="exp-card-name"
          style={{
            fontFamily: '"Georgia", serif',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
            fontWeight: 700,
            color: '#1a2744',
            marginBottom: '4px',
            lineHeight: 1.2,
          }}
        >
          {memorial.person_data.full_name}
        </h3>

        {/* Cidade */}
        <p
          className="exp-card-city"
          style={{
            fontSize: '0.62rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#5aa8e0',
            fontFamily: '"Georgia", serif',
            marginBottom: '12px',
          }}
        >
          {memorial.person_data.birth_city}, {memorial.person_data.birth_state}
        </p>

        {/* Frase */}
        {memorial.content?.main_phrase && (
          <p
            className="exp-card-phrase"
            style={{
              fontFamily: '"Georgia", serif',
              fontSize: '0.82rem',
              fontStyle: 'italic',
              color: '#3a5070',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: '0',
            }}
          >
            "{memorial.content.main_phrase}"
          </p>
        )}

        {/* CTA */}
        <div
          className="exp-card-cta flex items-center gap-2 mt-auto pt-4"
          style={{ borderTop: '1px solid rgba(26,39,68,0.08)', marginTop: '16px' }}
        >
          <span style={{
            fontSize: '0.62rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#2a3d5e',
            fontFamily: '"Georgia", serif',
            fontWeight: 700,
          }}>
            Ver memorial
          </span>
          <div style={{ height: 1, flex: 1, background: 'rgba(26,39,68,0.1)' }} />
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(90,168,224,0.12)',
              border: '1px solid rgba(90,168,224,0.25)',
            }}
          >
            <svg className="w-2.5 h-2.5" style={{ color: '#5aa8e0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

const Explore = () => {
  const [allMemorials, setAllMemorials] = useState([]);
  const [visible, setVisible]           = useState(PAGE_SIZE);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const { t }                           = useTranslation();

  useEffect(() => {
    const fetchMemorials = async () => {
      try {
        const response = await axios.get(`${API}/memorials/explore`);
        setAllMemorials(response.data);
      } catch (error) {
        console.error('Error fetching memorials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMemorials();
  }, []);

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisible(v => v + PAGE_SIZE);
      setLoadingMore(false);
    }, 150);
  }, []);

  const memorials = allMemorials.slice(0, visible);
  const hasMore   = visible < allMemorials.length;

  if (loading) {
    return (
      <div
        className="pt-32 pb-24"
        data-testid="explore-page-loading"
        style={{ background: 'linear-gradient(180deg, #dbeef7 0%, #eef8fb 100%)', minHeight: '100vh' }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Skeleton className="h-12 w-64 mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-hidden"
      data-testid="explore-page"
      style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 30%, #eef8fb 65%, #eef8fb 100%)',
        fontFamily: '"Georgia", serif',
        minHeight: '100vh',
      }}
    >
      <style>{`
        @keyframes floatExp1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-14px) translateX(8px); }
        }
        @keyframes floatExp2 {
          0%,100% { transform: translateY(0) translateX(0); }
          55%     { transform: translateY(-10px) translateX(-6px); }
        }
        @keyframes revealHero {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes revealCard {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .exp-card {
          transition: transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s ease;
          will-change: transform;
        }
        .exp-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 60px rgba(26,39,68,0.15) !important;
        }
        .exp-card:hover .exp-card-img {
          transform: scale(1.08);
        }
        .exp-card-img {
          transition: transform 0.6s cubic-bezier(.22,1,.36,1);
          will-change: transform;
        }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .explore-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .exp-card {
            border-radius: 16px !important;
          }
          .exp-card-name {
            font-size: 0.78rem !important;
          }
          .exp-card-city {
            font-size: 0.58rem !important;
            margin-bottom: 6px !important;
          }
          .exp-card-phrase {
            display: none !important;
          }
          .exp-card-cta {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Nuvem esquerda ── */}
      <div
        className="absolute top-[60px] left-[-60px] w-52 md:w-72 opacity-60 pointer-events-none select-none z-0"
        style={{ animation: 'floatExp1 11s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud1.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* ── Nuvem direita ── */}
      <div
        className="absolute top-[80px] right-[-50px] w-48 md:w-64 opacity-50 pointer-events-none select-none z-0 hidden md:block"
        style={{ animation: 'floatExp2 13s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud2.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* ── HERO ── */}
      <section className="relative pt-36 md:pt-48 pb-20 md:pb-28 overflow-hidden z-10">
        <div
          className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10"
          style={{ animation: 'revealHero 0.75s cubic-bezier(.22,1,.36,1) both' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div style={{ height: 1, width: 36, background: 'rgba(42,61,94,0.3)' }} />
            <span style={{
              textTransform: 'uppercase', letterSpacing: '0.26em',
              fontSize: '0.65rem', fontWeight: 700, color: '#2a3d5e',
              fontFamily: '"Georgia", serif',
            }}>
              {t('explore.eyebrow')}
            </span>
          </div>

          <h1 style={{
            fontFamily: '"Georgia", serif',
            fontSize: 'clamp(2.4rem, 7vw, 5rem)',
            fontWeight: 700, color: '#1a2744',
            lineHeight: 1.08, marginBottom: '20px',
            whiteSpace: 'pre-line',
          }}>
            {t('explore.title')}
          </h1>

          <p style={{
            color: '#3a5070',
            fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
            lineHeight: 1.72, maxWidth: '480px',
            fontFamily: '"Georgia", serif',
          }}>
            {t('explore.titleItalic')}
          </p>
        </div>
      </section>

      {/* ── CONTEÚDO ── */}
      <section className="relative z-10 pb-28 md:pb-36">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16">

          {allMemorials.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-28 text-center"
              data-testid="no-memorials-message"
              style={{ animation: 'revealHero 0.8s cubic-bezier(.22,1,.36,1) 0.2s both' }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 4px 20px rgba(26,39,68,0.08)',
                }}
              >
                <Heart className="h-9 w-9" style={{ color: '#5aa8e0' }} />
              </div>
              <h2 style={{
                fontFamily: '"Georgia", serif',
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                fontWeight: 700, color: '#1a2744', marginBottom: '12px',
              }}>
                Ainda não há memoriais
              </h2>
              <p style={{
                color: '#3a5070', fontSize: '0.9rem',
                lineHeight: 1.7, maxWidth: '340px',
                fontFamily: '"Georgia", serif',
              }}>
                Seja o primeiro a criar um memorial e compartilhar uma história de vida.
              </p>
            </div>
          ) : (
            <>
              <div
                className="explore-grid grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-7"
                data-testid="memorials-grid"
              >
                {memorials.map((memorial, index) => (
                  <MemorialCard key={memorial.id} memorial={memorial} index={index} />
                ))}
              </div>

              {/* ── Load More ── */}
              {hasMore && (
                <div className="flex justify-center mt-14">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    style={{
                      fontFamily: '"Georgia", serif',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#2a3d5e',
                      background: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(26,39,68,0.15)',
                      borderRadius: 999,
                      padding: '13px 36px',
                      cursor: loadingMore ? 'wait' : 'pointer',
                      transition: 'all 0.25s ease',
                      opacity: loadingMore ? 0.6 : 1,
                    }}
                  >
                    {loadingMore ? t('explore.loading') : t('explore.loadMore', { count: allMemorials.length - visible })}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Explore;