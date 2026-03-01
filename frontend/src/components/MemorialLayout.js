import { useState } from 'react';
import { Share2, Image, Music, BookOpen } from 'lucide-react';

const MemorialLayout = ({ memorial, isPreview = false, onShare }) => {
  const [activeTab, setActiveTab] = useState('historia');

  if (!memorial) return null;

  const { person_data, content, responsible } = memorial;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      let date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        const [year, month, day] = dateString.split('-');
        date = new Date(year, month - 1, day);
      }
      const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else if (navigator.share) {
      navigator.share({
        title: `Memorial de ${person_data.full_name}`,
        text: `Homenagem a ${person_data.full_name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 30%, #eef8fb 65%, #eef8fb 100%)',
        fontFamily: '"Georgia", serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes floatML1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-16px) translateX(9px); }
        }
        @keyframes floatML2 {
          0%,100% { transform: translateY(0) translateX(0); }
          55%     { transform: translateY(-11px) translateX(-7px); }
        }
        @keyframes floatML3 {
          0%,100% { transform: translateY(0) translateX(0); }
          40%     { transform: translateY(-8px) translateX(5px); }
        }
        @keyframes revealML {
          from { opacity: 0; transform: translateY(24px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes fadeTab {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes photoReveal {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }

        .ml-card {
          background: rgba(255,255,255,0.68);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: clamp(22px, 4vw, 32px);
          box-shadow: 0 24px 80px rgba(26,39,68,0.1), 0 4px 16px rgba(26,39,68,0.05);
          overflow: hidden;
          animation: revealML 0.85s cubic-bezier(.22,1,.36,1) 0.1s both;
        }

        .ml-tab-btn {
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          padding: 10px 18px;
          border: none; background: transparent; cursor: pointer;
          transition: color 0.25s ease;
          font-family: "Georgia", serif;
          color: rgba(58,80,112,0.45);
          position: relative;
          -webkit-tap-highlight-color: transparent;
          border-radius: 12px;
        }
        .ml-tab-btn:hover { color: rgba(58,80,112,0.75); background: rgba(90,168,224,0.06); }
        .ml-tab-btn.active { color: #1a2744; }
        .ml-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0; left: 50%; transform: translateX(-50%);
          width: 20px; height: 2.5px;
          border-radius: 999px;
          background: #5aa8e0;
        }

        .ml-gallery-item {
          aspect-ratio: 1;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(26,39,68,0.1);
        }
        .ml-gallery-item img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.55s cubic-bezier(.22,1,.36,1);
        }
        .ml-gallery-item:hover img { transform: scale(1.07); }

        .ml-share-btn {
          position: absolute; top: 14px; right: 14px;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 4px 14px rgba(26,39,68,0.12);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.25s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .ml-share-btn:hover { background: white; transform: scale(1.08); }
      `}</style>

      {/* ── Nuvens decorativas ── */}
      <div className="absolute top-[-20px] left-[-60px] w-52 md:w-80 opacity-60 pointer-events-none select-none"
        style={{ animation: 'floatML1 12s ease-in-out infinite' }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="absolute top-[6%] right-[-50px] w-40 md:w-64 opacity-45 pointer-events-none select-none hidden md:block"
        style={{ animation: 'floatML2 9s ease-in-out infinite' }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="absolute top-[45%] left-[-30px] w-28 opacity-30 pointer-events-none select-none hidden lg:block"
        style={{ animation: 'floatML3 14s ease-in-out infinite' }}>
        <img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div
        className="relative z-10"
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: '0 16px',
          paddingTop: isPreview ? 'clamp(16px, 3vw, 24px)' : 'clamp(72px, 12vw, 100px)',
          paddingBottom: 'clamp(48px, 8vw, 80px)',
        }}
      >

        {/* Logo — só quando não é preview */}
        {!isPreview && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28, animation: 'revealML 0.6s cubic-bezier(.22,1,.36,1) both' }}>
            <img src="/logo-transparent.png" alt="Remember QRCode" style={{ height: 60, width: 'auto' }} />
          </div>
        )}

        {/* ── Card principal ── */}
        <div className="ml-card">

          {/* Capa + foto de perfil */}
          <div style={{ position: 'relative' }}>

            {/* Foto de capa */}
            <div style={{ height: 'clamp(160px, 30vw, 220px)', overflow: 'hidden', position: 'relative' }}>
              {content.gallery_urls && content.gallery_urls.length > 0 ? (
                <img src={content.gallery_urls[0]} alt="Capa"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #b8e0f5 0%, #7bbde8 50%, #5aa8e0 100%)' }} />
              )}
              {/* Gradient overlay na capa */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(26,39,68,0.05) 0%, rgba(26,39,68,0.35) 100%)',
              }} />
            </div>

            {/* Foto de perfil */}
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              bottom: -52,
            }}>
              <div style={{
                width: 104, height: 104, borderRadius: '50%',
                border: '4px solid rgba(255,255,255,0.95)',
                boxShadow: '0 8px 32px rgba(26,39,68,0.18)',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #c8e8f5, #a8d8f0)',
                animation: 'photoReveal 0.7s cubic-bezier(.22,1,.36,1) 0.3s both',
              }}>
                {person_data.photo_url ? (
                  <img src={person_data.photo_url} alt={person_data.full_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    data-testid="memorial-photo" />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: '"Georgia", serif',
                    fontSize: '2.5rem', fontWeight: 700, color: 'rgba(26,39,68,0.35)',
                  }}>
                    {person_data.full_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
            </div>

            {/* Botão compartilhar */}
            <button className="ml-share-btn" onClick={handleShare} title="Compartilhar">
              <Share2 size={17} style={{ color: '#2a3d5e' }} />
            </button>
          </div>

          {/* Informações do homenageado */}
          <div style={{
            paddingTop: 68,
            paddingBottom: 24,
            paddingLeft: 'clamp(20px, 5vw, 36px)',
            paddingRight: 'clamp(20px, 5vw, 36px)',
            textAlign: 'center',
            animation: 'revealML 0.7s cubic-bezier(.22,1,.36,1) 0.2s both',
          }}>

            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ height: 1, width: 20, background: 'rgba(42,61,94,0.25)' }} />
              <span style={{
                textTransform: 'uppercase', letterSpacing: '0.2em',
                fontSize: '0.58rem', fontWeight: 700, color: '#5aa8e0',
              }}>
                Em memória de
              </span>
              <div style={{ height: 1, width: 20, background: 'rgba(42,61,94,0.25)' }} />
            </div>

            {/* Nome */}
            <h1
              data-testid="memorial-name"
              style={{
                fontFamily: '"Georgia", serif',
                fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
                fontWeight: 700, color: '#1a2744',
                lineHeight: 1.15, marginBottom: 10,
              }}
            >
              {person_data.full_name}
            </h1>

            {/* Datas */}
            <p style={{
              fontFamily: '"Georgia", serif',
              fontSize: '0.85rem', color: 'rgba(58,80,112,0.65)',
              letterSpacing: '0.05em', marginBottom: 16,
            }}>
              {person_data.birth_date ? formatDate(person_data.birth_date) : '...'}
              <span style={{ margin: '0 10px', color: 'rgba(90,168,224,0.6)' }}>✦</span>
              {person_data.death_date ? formatDate(person_data.death_date) : '...'}
            </p>

            {/* Frase principal */}
            {content.main_phrase && (
              <div style={{
                margin: '0 auto',
                maxWidth: 380,
                padding: '14px 20px',
                borderRadius: 14,
                background: 'rgba(90,168,224,0.07)',
                border: '1px solid rgba(90,168,224,0.18)',
              }}>
                <p style={{
                  fontFamily: '"Georgia", serif',
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                  color: '#2a3d5e', fontStyle: 'italic', lineHeight: 1.7,
                  margin: 0,
                }}>
                  "{content.main_phrase}"
                </p>
              </div>
            )}
          </div>

          {/* Divisor */}
          <div style={{ height: 1, background: 'rgba(26,39,68,0.07)', margin: '0 clamp(20px, 5vw, 36px)' }} />

          {/* ── Tabs ── */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            padding: '14px clamp(16px, 4vw, 28px)',
          }}>
            {[
              { key: 'historia', label: 'História', icon: BookOpen },
              { key: 'memorias', label: 'Memórias', icon: Image },
              { key: 'audio',    label: 'Áudio',    icon: Music },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`ml-tab-btn ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                <Icon size={18} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Divisor */}
          <div style={{ height: 1, background: 'rgba(26,39,68,0.07)' }} />

          {/* ── Conteúdo das tabs ── */}
          <div style={{ padding: 'clamp(20px, 5vw, 32px)', animation: 'fadeTab 0.35s ease both' }}>

            {/* História */}
            {activeTab === 'historia' && (
              <div data-testid="memorial-biography">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ height: 1, flex: 1, background: 'rgba(26,39,68,0.08)' }} />
                  <span style={{
                    textTransform: 'uppercase', letterSpacing: '0.18em',
                    fontSize: '0.6rem', fontWeight: 700, color: '#5aa8e0',
                  }}>
                    História de Vida
                  </span>
                  <div style={{ height: 1, flex: 1, background: 'rgba(26,39,68,0.08)' }} />
                </div>
                <p style={{
                  fontFamily: '"Georgia", serif',
                  fontSize: 'clamp(0.88rem, 2.5vw, 0.97rem)',
                  color: '#2a3d5e', lineHeight: 1.9,
                  whiteSpace: 'pre-wrap',
                }}>
                  {content.biography || (
                    <span style={{ color: 'rgba(58,80,112,0.4)', fontStyle: 'italic' }}>
                      Nenhuma história cadastrada.
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Memórias */}
            {activeTab === 'memorias' && (
              <div data-testid="memorial-gallery">
                {content.gallery_urls && content.gallery_urls.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 10,
                  }}>
                    {content.gallery_urls.map((url, index) => (
                      <div key={index} className="ml-gallery-item">
                        <img src={url} alt={`Memória ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center', padding: '40px 24px',
                    borderRadius: 18,
                    background: 'rgba(90,168,224,0.05)',
                    border: '1px dashed rgba(90,168,224,0.25)',
                  }}>
                    <Image size={36} style={{ color: 'rgba(90,168,224,0.35)', margin: '0 auto 10px' }} />
                    <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.88rem', color: 'rgba(58,80,112,0.5)' }}>
                      Nenhuma foto na galeria
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Áudio */}
            {activeTab === 'audio' && (
              <div data-testid="memorial-audio">
                {content.audio_url ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                      <div style={{ height: 1, flex: 1, background: 'rgba(26,39,68,0.08)' }} />
                      <span style={{
                        textTransform: 'uppercase', letterSpacing: '0.18em',
                        fontSize: '0.6rem', fontWeight: 700, color: '#5aa8e0',
                      }}>
                        Mensagem de Homenagem
                      </span>
                      <div style={{ height: 1, flex: 1, background: 'rgba(26,39,68,0.08)' }} />
                    </div>
                    <div style={{
                      borderRadius: 16, padding: '20px',
                      background: 'rgba(90,168,224,0.06)',
                      border: '1px solid rgba(90,168,224,0.18)',
                    }}>
                      <audio src={content.audio_url} controls style={{ width: '100%', borderRadius: 8 }} />
                    </div>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center', padding: '40px 24px',
                    borderRadius: 18,
                    background: 'rgba(90,168,224,0.05)',
                    border: '1px dashed rgba(90,168,224,0.25)',
                  }}>
                    <Music size={36} style={{ color: 'rgba(90,168,224,0.35)', margin: '0 auto 10px' }} />
                    <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.88rem', color: 'rgba(58,80,112,0.5)' }}>
                      Nenhum áudio cadastrado
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ── Rodapé ── */}
        <div style={{
          textAlign: 'center', marginTop: 28,
          animation: 'revealML 0.7s cubic-bezier(.22,1,.36,1) 0.4s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ height: 1, width: 24, background: 'rgba(42,61,94,0.2)' }} />
            <p style={{
              fontFamily: '"Georgia", serif',
              fontSize: '0.78rem', color: 'rgba(58,80,112,0.55)',
              fontStyle: 'italic',
            }}>
              Criado com amor por {responsible?.name}
            </p>
            <div style={{ height: 1, width: 24, background: 'rgba(42,61,94,0.2)' }} />
          </div>
          <img src="/logo-transparent.png" alt="Remember QRCode"
            style={{ height: 36, width: 'auto', opacity: 0.4, margin: '0 auto' }} />
        </div>

      </div>
    </div>
  );
};

export default MemorialLayout;