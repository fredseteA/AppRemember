import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import {
  ChevronLeft, Upload, Trash2, Loader2, X, Check, Globe, Lock
} from 'lucide-react';
import { API } from '@/config';

const EditMemorial = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [memorial, setMemorial]   = useState(null);

  const [personData, setPersonData] = useState({
    full_name: '', relationship: '', birth_date: '', death_date: '',
    birth_city: '', birth_state: '', death_city: '', death_state: '',
    photo_url: null, public_memorial: false,
  });

  const [content, setContent] = useState({
    main_phrase: '', biography: '', gallery_urls: [], audio_url: null,
  });

  // ─── Carrega memorial ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/memorials/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const m = res.data;
        setMemorial(m);
        setPersonData({
          full_name:       m.person_data?.full_name       || '',
          relationship:    m.person_data?.relationship    || '',
          birth_date:      m.person_data?.birth_date      || '',
          death_date:      m.person_data?.death_date      || '',
          birth_city:      m.person_data?.birth_city      || '',
          birth_state:     m.person_data?.birth_state     || '',
          death_city:      m.person_data?.death_city      || '',
          death_state:     m.person_data?.death_state     || '',
          photo_url:       m.person_data?.photo_url       || null,
          public_memorial: m.person_data?.public_memorial ?? false,
        });
        setContent({
          main_phrase:  m.content?.main_phrase  || '',
          biography:    m.content?.biography    || '',
          gallery_urls: m.content?.gallery_urls || [],
          audio_url:    m.content?.audio_url    || null,
        });
      } catch {
        toast.error('Erro ao carregar memorial');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, token]);

  // ─── Upload genérico ──────────────────────────────────────────────────────
  const uploadFile = async (file, path) => {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  // ─── Upload foto de perfil ────────────────────────────────────────────────
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, 'photos');
      setPersonData(p => ({ ...p, photo_url: url }));
      toast.success('Foto atualizada!');
    } catch { toast.error('Erro ao enviar foto'); }
    finally { setUploading(false); }
  };

  // ─── Upload galeria ───────────────────────────────────────────────────────
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + content.gallery_urls.length > 10) {
      toast.error('Máximo de 10 fotos na galeria'); return;
    }
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadFile(f, 'gallery')));
      setContent(c => ({ ...c, gallery_urls: [...c.gallery_urls, ...urls] }));
      toast.success(`${urls.length} foto(s) adicionada(s)!`);
    } catch { toast.error('Erro ao enviar fotos'); }
    finally { setUploading(false); }
  };

  const removeGalleryPhoto = (index) => {
    setContent(c => ({ ...c, gallery_urls: c.gallery_urls.filter((_, i) => i !== index) }));
  };

  // ─── Upload áudio ─────────────────────────────────────────────────────────
  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, 'audio');
      setContent(c => ({ ...c, audio_url: url }));
      toast.success('Áudio atualizado!');
    } catch { toast.error('Erro ao enviar áudio'); }
    finally { setUploading(false); }
  };

  // ─── Salvar ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!personData.full_name.trim()) {
      toast.error('Nome é obrigatório'); return;
    }
    setSaving(true);
    try {
      await axios.put(
        `${API}/memorials/${id}`,
        { person_data: personData, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Memorial atualizado com sucesso!');
      navigate(`/memorial/${memorial.slug || id}`);
    } catch {
      toast.error('Erro ao salvar memorial');
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid rgba(90,168,224,0.2)',
          borderTopColor: '#5aa8e0',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isPublished = memorial?.status === 'published';

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 35%, #eef8fb 100%)',
        fontFamily: '"Georgia", serif',
        minHeight: '100vh',
      }}
    >
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes reveal  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .em-input {
          width: 100%; padding: 12px 14px; border-radius: 12px;
          border: 1.5px solid rgba(26,39,68,0.12);
          background: rgba(255,255,255,0.7); backdrop-filter: blur(8px);
          font-family: "Georgia", serif; font-size: 1rem; color: #1a2744;
          outline: none; transition: border-color .25s, box-shadow .25s;
          box-sizing: border-box;
        }
        .em-input:focus { border-color: #5aa8e0; box-shadow: 0 0 0 3px rgba(90,168,224,0.15); }
        .em-input::placeholder { color: rgba(58,80,112,0.4); }
        .em-textarea {
          width: 100%; padding: 12px 14px; border-radius: 12px;
          border: 1.5px solid rgba(26,39,68,0.12);
          background: rgba(255,255,255,0.7); backdrop-filter: blur(8px);
          font-family: "Georgia", serif; font-size: 1rem; color: #1a2744;
          outline: none; resize: vertical; min-height: 140px;
          transition: border-color .25s, box-shadow .25s; box-sizing: border-box;
        }
        .em-textarea:focus { border-color: #5aa8e0; box-shadow: 0 0 0 3px rgba(90,168,224,0.15); }
        .em-label {
          display: block; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #2a3d5e; margin-bottom: 8px;
        }
        .em-card {
          background: rgba(255,255,255,0.62); backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.85); border-radius: 24px;
          box-shadow: 0 10px 40px rgba(26,39,68,0.08);
          overflow: hidden; margin-bottom: 18px;
          animation: reveal 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        .em-card-header {
          padding: 20px 28px 16px; border-bottom: 1px solid rgba(26,39,68,0.07);
          display: flex; align-items: center; gap: 12px;
        }
        .em-card-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 18px; }
        .em-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .em-upload-zone {
          border-radius: 14px; border: 1.5px dashed rgba(90,168,224,0.4);
          background: rgba(255,255,255,0.4); cursor: pointer;
          display: block; transition: background .2s, border-color .2s;
          padding: 20px; text-align: center;
        }
        .em-upload-zone:hover { background: rgba(255,255,255,0.6); border-color: rgba(90,168,224,0.7); }
        .em-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 28px; border-radius: 999px; background: #1a2744; color: white;
          font-family: "Georgia", serif; font-size: 0.9rem; font-weight: 700;
          border: none; cursor: pointer; min-height: 48px;
          transition: background .25s, transform .25s, box-shadow .25s;
          box-shadow: 0 6px 20px rgba(26,39,68,0.18);
        }
        .em-btn-primary:hover:not(:disabled) { background: #2a3d5e; transform: translateY(-2px); }
        .em-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .em-btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 999px; background: transparent;
          color: #3a5070; font-family: "Georgia", serif; font-size: 0.82rem; font-weight: 700;
          border: 1.5px solid rgba(26,39,68,0.15); cursor: pointer;
          transition: all .25s; min-height: 40px; text-decoration: none;
        }
        .em-btn-ghost:hover { border-color: rgba(90,168,224,0.5); color: #1a2744; background: rgba(90,168,224,0.06); }
        .em-gallery-item {
          position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden;
          box-shadow: 0 2px 8px rgba(26,39,68,0.1);
        }
        .em-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .em-gallery-remove {
          position: absolute; top: 6px; right: 6px;
          width: 26px; height: 26px; border-radius: 50%;
          background: rgba(239,68,68,0.9); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: white; transition: background .2s;
        }
        .em-gallery-remove:hover { background: #dc2626; }

        /* Toggle visibilidade */
        .em-visibility-toggle {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 18px; border-radius: 16px; cursor: pointer;
          border: 1.5px solid transparent;
          transition: background .25s, border-color .25s;
        }
        .em-visibility-toggle.public {
          background: rgba(34,197,94,0.07);
          border-color: rgba(34,197,94,0.25);
        }
        .em-visibility-toggle.private {
          background: rgba(148,163,184,0.1);
          border-color: rgba(148,163,184,0.25);
        }
        .em-toggle-track {
          width: 46px; height: 26px; border-radius: 999px;
          position: relative; flex-shrink: 0;
          transition: background .3s;
        }
        .em-toggle-track.on  { background: #22c55e; }
        .em-toggle-track.off { background: rgba(148,163,184,0.5); }
        .em-toggle-thumb {
          position: absolute; top: 3px;
          width: 20px; height: 20px; border-radius: 50%;
          background: white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: left .3s cubic-bezier(.22,1,.36,1);
        }
        .em-toggle-thumb.on  { left: 23px; }
        .em-toggle-thumb.off { left: 3px; }

        @media (max-width: 480px) {
          .em-grid-2 { grid-template-columns: 1fr; }
          .em-card-body { padding: 20px; }
          .em-card-header { padding: 16px 20px 14px; }
        }
      `}</style>

      {/* Nuvem esquerda */}
      <div className="absolute top-[60px] left-[-50px] w-44 md:w-64 opacity-50 pointer-events-none select-none z-0"
        style={{ animation: 'floatEM1 11s ease-in-out infinite' }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto' }} />
      </div>

      <div className="relative z-10" style={{
        maxWidth: 680, margin: '0 auto', padding: '0 20px',
        paddingTop: 'clamp(96px, 16vw, 140px)',
        paddingBottom: 'clamp(60px, 10vw, 100px)',
      }}>

        {/* Header */}
        <div style={{ marginBottom: 'clamp(24px, 4vw, 36px)', animation: 'reveal 0.6s cubic-bezier(.22,1,.36,1) both' }}>
          <button className="em-btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
            <ChevronLeft size={14} /> Voltar
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ height: 1, width: 28, background: 'rgba(42,61,94,0.3)' }} />
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '0.62rem', fontWeight: 700, color: '#2a3d5e' }}>
              Editar memorial
            </span>
            {/* Badge de status */}
            <span style={{
              padding: '3px 10px', borderRadius: 999,
              fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: isPublished ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.18)',
              color: isPublished ? '#15803d' : '#92400e',
              border: isPublished ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(251,191,36,0.35)',
            }}>
              {isPublished ? 'Publicado' : 'Rascunho'}
            </span>
          </div>
          <h1 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.6rem, 5vw, 2.6rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.1 }}>
            {personData.full_name || 'Memorial'}
          </h1>
        </div>

        {/* ── Card: Foto de Perfil ── */}
        <div className="em-card" style={{ animationDelay: '0.05s' }}>
          <div className="em-card-header">
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(90,168,224,0.12)', border: '1px solid rgba(90,168,224,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15 }}>📷</span>
            </div>
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '1rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>Foto do Homenageado</h2>
          </div>
          <div className="em-card-body">
            <input type="file" id="photo" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            <label htmlFor="photo" className="em-upload-zone">
              {personData.photo_url ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <img src={personData.photo_url} alt="Foto" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(90,168,224,0.3)' }} />
                  <span style={{ fontSize: '0.82rem', color: '#5aa8e0', fontFamily: '"Georgia", serif' }}>
                    {uploading ? 'Enviando...' : 'Clique para trocar a foto'}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(90,168,224,0.12)', border: '1px solid rgba(90,168,224,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={20} style={{ color: '#5aa8e0' }} />
                  </div>
                  <span style={{ color: '#3a5070', fontSize: '0.9rem' }}>Clique para enviar foto</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* ── Card: Dados Pessoais ── */}
        <div className="em-card" style={{ animationDelay: '0.1s' }}>
          <div className="em-card-header">
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(90,168,224,0.12)', border: '1px solid rgba(90,168,224,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15 }}>👤</span>
            </div>
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '1rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>Dados Pessoais</h2>
          </div>
          <div className="em-card-body">
            <div>
              <label className="em-label">Nome Completo *</label>
              <input className="em-input" value={personData.full_name}
                onChange={e => setPersonData(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Nome do homenageado" />
            </div>
            <div>
              <label className="em-label">Relacionamento</label>
              <input className="em-input" value={personData.relationship}
                onChange={e => setPersonData(p => ({ ...p, relationship: e.target.value }))}
                placeholder="Ex: Pai, Mãe, Avô..." />
            </div>
            <div className="em-grid-2">
              <div>
                <label className="em-label">Data de Nascimento</label>
                <input type="date" className="em-input" value={personData.birth_date}
                  onChange={e => setPersonData(p => ({ ...p, birth_date: e.target.value }))} />
              </div>
              <div>
                <label className="em-label">Data de Falecimento</label>
                <input type="date" className="em-input" value={personData.death_date}
                  onChange={e => setPersonData(p => ({ ...p, death_date: e.target.value }))} />
              </div>
            </div>
            <div className="em-grid-2">
              <div>
                <label className="em-label">Cidade de Nascimento</label>
                <input className="em-input" value={personData.birth_city}
                  onChange={e => setPersonData(p => ({ ...p, birth_city: e.target.value }))} />
              </div>
              <div>
                <label className="em-label">Estado</label>
                <input className="em-input" value={personData.birth_state}
                  onChange={e => setPersonData(p => ({ ...p, birth_state: e.target.value }))}
                  placeholder="Ex: SP" maxLength={2} />
              </div>
            </div>
            <div className="em-grid-2">
              <div>
                <label className="em-label">Cidade de Falecimento</label>
                <input className="em-input" value={personData.death_city}
                  onChange={e => setPersonData(p => ({ ...p, death_city: e.target.value }))} />
              </div>
              <div>
                <label className="em-label">Estado</label>
                <input className="em-input" value={personData.death_state}
                  onChange={e => setPersonData(p => ({ ...p, death_state: e.target.value }))}
                  placeholder="Ex: SP" maxLength={2} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Card: Visibilidade (apenas publicados) ── */}
        {isPublished && (
          <div className="em-card" style={{ animationDelay: '0.13s' }}>
            <div className="em-card-header">
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(90,168,224,0.12)', border: '1px solid rgba(90,168,224,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 15 }}>🌐</span>
              </div>
              <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '1rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>Visibilidade no Explorar</h2>
            </div>
            <div className="em-card-body">
              <div
                className={`em-visibility-toggle ${personData.public_memorial ? 'public' : 'private'}`}
                onClick={() => setPersonData(p => ({ ...p, public_memorial: !p.public_memorial }))}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setPersonData(p => ({ ...p, public_memorial: !p.public_memorial }))}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: personData.public_memorial
                      ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background .3s',
                  }}>
                    {personData.public_memorial
                      ? <Globe size={18} style={{ color: '#16a34a' }} />
                      : <Lock size={18} style={{ color: '#64748b' }} />
                    }
                  </div>
                  <div>
                    <p style={{
                      fontFamily: '"Georgia", serif', fontSize: '0.9rem',
                      fontWeight: 700, color: '#1a2744', margin: 0, lineHeight: 1.3,
                    }}>
                      {personData.public_memorial ? 'Visível no Explorar' : 'Oculto do Explorar'}
                    </p>
                    <p style={{
                      fontFamily: '"Georgia", serif', fontSize: '0.75rem',
                      color: '#64748b', margin: 0, marginTop: 2, lineHeight: 1.5,
                    }}>
                      {personData.public_memorial
                        ? 'Qualquer pessoa pode encontrar este memorial'
                        : 'Somente quem tiver o link pode acessar'
                      }
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <div
                  className={`em-toggle-track ${personData.public_memorial ? 'on' : 'off'}`}
                  style={{ flexShrink: 0 }}
                >
                  <div className={`em-toggle-thumb ${personData.public_memorial ? 'on' : 'off'}`} />
                </div>
              </div>

              {/* Nota informativa */}
              <div style={{
                padding: '10px 14px', borderRadius: 12,
                background: 'rgba(90,168,224,0.06)',
                border: '1px solid rgba(90,168,224,0.15)',
              }}>
                <p style={{
                  fontFamily: '"Georgia", serif', fontSize: '0.75rem',
                  color: '#3a5070', margin: 0, lineHeight: 1.6,
                }}>
                  💡 Independente desta configuração, qualquer pessoa com o link direto do memorial poderá visitá-lo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Card: Conteúdo ── */}
        <div className="em-card" style={{ animationDelay: '0.15s' }}>
          <div className="em-card-header">
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(90,168,224,0.12)', border: '1px solid rgba(90,168,224,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15 }}>✍️</span>
            </div>
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '1rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>Conteúdo do Memorial</h2>
          </div>
          <div className="em-card-body">
            <div>
              <label className="em-label">Frase Principal</label>
              <input className="em-input" value={content.main_phrase}
                onChange={e => setContent(c => ({ ...c, main_phrase: e.target.value }))}
                placeholder="Uma frase especial para homenagear..." />
            </div>
            <div>
              <label className="em-label">Biografia / História de Vida</label>
              <textarea className="em-textarea" value={content.biography}
                onChange={e => setContent(c => ({ ...c, biography: e.target.value }))}
                placeholder="Conte a história de vida, momentos especiais..."
                rows={8} />
            </div>
          </div>
        </div>

        {/* ── Card: Galeria ── */}
        <div className="em-card" style={{ animationDelay: '0.2s' }}>
          <div className="em-card-header">
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(90,168,224,0.12)', border: '1px solid rgba(90,168,224,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15 }}>🖼️</span>
            </div>
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '1rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>
              Galeria de Memórias
              <span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#94a3b8', marginLeft: 8 }}>
                ({content.gallery_urls.length}/10)
              </span>
            </h2>
          </div>
          <div className="em-card-body">
            {content.gallery_urls.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
                {content.gallery_urls.map((url, i) => (
                  <div key={i} className="em-gallery-item">
                    <img src={url} alt={`Memória ${i + 1}`} />
                    <button className="em-gallery-remove" onClick={() => removeGalleryPhoto(i)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {content.gallery_urls.length < 10 && (
              <>
                <input type="file" id="gallery" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                <label htmlFor="gallery" className="em-upload-zone">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(90,168,224,0.12)', border: '1px solid rgba(90,168,224,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={16} style={{ color: '#5aa8e0' }} />
                    </div>
                    <span style={{ color: '#3a5070', fontSize: '0.85rem' }}>
                      {uploading ? 'Enviando...' : 'Adicionar fotos à galeria'}
                    </span>
                  </div>
                </label>
              </>
            )}
          </div>
        </div>

        {/* ── Card: Áudio ── */}
        <div className="em-card" style={{ animationDelay: '0.25s' }}>
          <div className="em-card-header">
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(90,168,224,0.12)', border: '1px solid rgba(90,168,224,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15 }}>🎵</span>
            </div>
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '1rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>Áudio de Homenagem</h2>
          </div>
          <div className="em-card-body">
            {content.audio_url ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <audio src={content.audio_url} controls style={{ width: '100%', borderRadius: 8 }} />
                <button
                  onClick={() => setContent(c => ({ ...c, audio_url: null }))}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', width: 'fit-content' }}
                >
                  <Trash2 size={13} /> Remover áudio
                </button>
              </div>
            ) : (
              <>
                <input type="file" id="audio" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                <label htmlFor="audio" className="em-upload-zone">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(90,168,224,0.12)', border: '1px solid rgba(90,168,224,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={16} style={{ color: '#5aa8e0' }} />
                    </div>
                    <span style={{ color: '#3a5070', fontSize: '0.85rem' }}>
                      {uploading ? 'Enviando...' : 'Enviar áudio de homenagem'}
                    </span>
                  </div>
                </label>
              </>
            )}
          </div>
        </div>

        {/* ── Botões de ação ── */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="em-btn-ghost" onClick={() => navigate(-1)}>
            <X size={14} /> Cancelar
          </button>
          <button
            className="em-btn-primary"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving
              ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Salvando...</>
              : <><Check size={16} /> Salvar alterações</>
            }
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditMemorial;