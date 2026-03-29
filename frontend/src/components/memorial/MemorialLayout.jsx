import { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Image, Music, BookOpen, X, ChevronLeft, ChevronRight, ZoomIn, Heart, Send, MessageCircle, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { formatDateShort } from '@/utils';
import { API } from '@/config';
import { useTranslation } from 'react-i18next';
import skyCard from '@/assets/sky-card.jpg';

function CondolenceCard({ msg, index }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isLong = msg.message.length > 160;
  const relations = t('condolences.relations', { returnObjects: true });
  const relationLabel = relations[msg.relation] || msg.relation;

  return (
    <div style={{ borderRadius: 18, background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.88)', boxShadow: '0 4px 18px rgba(26,39,68,0.06)', padding: '18px 20px', animation: `condolenceIn 0.45s cubic-bezier(.22,1,.36,1) ${index * 0.07}s both`, transition: 'box-shadow 0.25s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: msg.anonymous ? 'rgba(90,168,224,0.12)' : 'linear-gradient(135deg, rgba(90,168,224,0.2) 0%, rgba(42,61,94,0.15) 100%)', border: '1.5px solid rgba(90,168,224,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {msg.anonymous
            ? <User size={16} style={{ color: 'rgba(90,168,224,0.7)' }} />
            : <span style={{ fontFamily: '"Georgia", serif', fontSize: '0.95rem', fontWeight: 700, color: '#2a3d5e' }}>{msg.sender_name?.charAt(0)?.toUpperCase() || '?'}</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: '"Georgia", serif', fontSize: '0.88rem', fontWeight: 700, color: '#1a2744' }}>
              {msg.anonymous ? t('condolences.anonymous') : msg.sender_name}
            </span>
            {msg.relation && (
              <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999, background: 'rgba(90,168,224,0.12)', color: '#3a7fb5', border: '1px solid rgba(90,168,224,0.2)' }}>
                {relationLabel}
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'rgba(58,80,112,0.45)', fontFamily: '"Georgia", serif' }}>
            {new Date(msg.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <Heart size={14} style={{ color: 'rgba(90,168,224,0.45)', flexShrink: 0, marginTop: 4 }} />
      </div>

      <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.88rem', color: '#2a3d5e', lineHeight: 1.75, margin: 0, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        "{msg.message}"
      </p>
      {isLong && (
        <button onClick={() => setExpanded(e => !e)} style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: '"Georgia", serif', fontSize: '0.72rem', color: '#5aa8e0', fontWeight: 700, letterSpacing: '0.06em' }}>
          {expanded ? t('condolences.showLess') : t('condolences.showMore')}
        </button>
      )}
    </div>
  );
}

function CondolenceForm({ memorialId, onSuccess }) {
  const { t } = useTranslation();
  const presets = t('condolences.presets', { returnObjects: true });
  const relations = t('condolences.relations', { returnObjects: true });

  const PRESET_MESSAGES = [
    { id: 1, emoji: '🕊️', ...presets[0] },
    { id: 2, emoji: '💙', ...presets[1] },
    { id: 3, emoji: '🙏', ...presets[2] },
    { id: 4, emoji: '⭐', ...presets[3] },
    { id: 5, emoji: '🌸', ...presets[4] },
    { id: 6, emoji: '✨', ...presets[5] },
  ];

  const RELATIONS = Object.entries(relations).map(([value, label]) => ({ value, label }));

  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customText, setCustomText]         = useState('');
  const [anonymous, setAnonymous]           = useState(false);
  const [senderName, setSenderName]         = useState('');
  const [relation, setRelation]             = useState('');
  const [sending, setSending]               = useState(false);
  const textareaRef = useRef(null);

  const isCustom    = selectedPreset?.id === 6;
  const messageText = isCustom ? customText : selectedPreset?.text || '';
  const canProceed  = selectedPreset && (isCustom ? customText.trim().length >= 10 : true);
  const canSend     = canProceed && (anonymous || senderName.trim().length >= 2);

  useEffect(() => {
    if (isCustom && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isCustom]);

  const handleSubmit = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      await axios.post(`${API}/memorials/${memorialId}/condolences`, {
        message: messageText,
        sender_name: anonymous ? null : senderName.trim(),
        relation: relation || null,
        anonymous,
      });
      toast.success('Sua mensagem foi enviada ✨');
      onSuccess();
    } catch {
      toast.error('Não foi possível enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5aa8e0', marginBottom: 14 }}>
          {t('condolences.step1')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PRESET_MESSAGES.map(preset => (
            <button key={preset.id}
              onClick={() => { setSelectedPreset(preset); if (preset.id !== 6) setCustomText(''); }}
              style={{ textAlign: 'left', width: '100%', padding: '12px 16px', borderRadius: 14, border: selectedPreset?.id === preset.id ? '1.5px solid rgba(90,168,224,0.6)' : '1.5px solid rgba(26,39,68,0.09)', background: selectedPreset?.id === preset.id ? 'rgba(90,168,224,0.08)' : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.22s ease', display: 'flex', alignItems: 'flex-start', gap: 12, WebkitTapHighlightColor: 'transparent' }}
            >
              <span style={{ fontSize: '1.05rem', flexShrink: 0, marginTop: 1 }}>{preset.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.78rem', fontWeight: 700, color: '#1a2744', marginBottom: preset.text ? 3 : 0 }}>{preset.short}</p>
                {preset.text && (
                  <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.75rem', color: '#3a5070', lineHeight: 1.55, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{preset.text}</p>
                )}
              </div>
              {selectedPreset?.id === preset.id && (
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#5aa8e0', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {isCustom && (
          <div style={{ marginTop: 10 }}>
            <textarea ref={textareaRef} value={customText} onChange={e => setCustomText(e.target.value)}
              placeholder={t('condolences.writeMessage')} rows={5}
              style={{ width: '100%', padding: '13px 15px', borderRadius: 14, boxSizing: 'border-box', border: '1.5px solid rgba(90,168,224,0.35)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', fontFamily: '"Georgia", serif', fontSize: '0.9rem', color: '#1a2744', lineHeight: 1.75, outline: 'none', resize: 'none', transition: 'border-color 0.25s ease, box-shadow 0.25s ease' }}
              onFocus={e => { e.target.style.borderColor = '#5aa8e0'; e.target.style.boxShadow = '0 0 0 3px rgba(90,168,224,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(90,168,224,0.35)'; e.target.style.boxShadow = 'none'; }}
            />
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <span style={{ fontSize: '0.65rem', color: customText.length < 10 ? '#e07a5f' : 'rgba(58,80,112,0.4)', fontFamily: '"Georgia", serif' }}>
                {t('condolences.minChars', { count: customText.length })}
              </span>
            </div>
          </div>
        )}
      </div>

      {canProceed && (
        <div style={{ animation: 'condolenceFormIn 0.35s cubic-bezier(.22,1,.36,1) both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(26,39,68,0.08)' }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5aa8e0' }}>
              {t('condolences.step2')}
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(26,39,68,0.08)' }} />
          </div>

          <button onClick={() => setAnonymous(a => !a)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, border: anonymous ? '1.5px solid rgba(90,168,224,0.5)' : '1.5px solid rgba(26,39,68,0.09)', background: anonymous ? 'rgba(90,168,224,0.07)' : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.22s ease', marginBottom: 12, textAlign: 'left', WebkitTapHighlightColor: 'transparent' }}
          >
            <div style={{ width: 42, height: 24, borderRadius: 999, flexShrink: 0, background: anonymous ? '#5aa8e0' : 'rgba(26,39,68,0.12)', position: 'relative', transition: 'background 0.25s ease' }}>
              <div style={{ position: 'absolute', top: 3, left: anonymous ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', transition: 'left 0.25s cubic-bezier(.22,1,.36,1)' }} />
            </div>
            <div>
              <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.82rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>{t('condolences.sendAnonymous')}</p>
              <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.7rem', color: 'rgba(58,80,112,0.55)', margin: 0 }}>{t('condolences.anonymousDesc')}</p>
            </div>
          </button>

          {!anonymous && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'condolenceFormIn 0.3s ease both' }}>
              <div>
                <label style={{ display: 'block', fontFamily: '"Georgia", serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2a3d5e', marginBottom: 6 }}>
                  {t('condolences.yourName')}
                </label>
                <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)}
                  placeholder={t('condolences.yourNamePlaceholder')}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, boxSizing: 'border-box', border: '1.5px solid rgba(26,39,68,0.12)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', fontFamily: '"Georgia", serif', fontSize: '0.9rem', color: '#1a2744', outline: 'none', transition: 'border-color 0.25s ease, box-shadow 0.25s ease', WebkitAppearance: 'none', appearance: 'none' }}
                  onFocus={e => { e.target.style.borderColor = '#5aa8e0'; e.target.style.boxShadow = '0 0 0 3px rgba(90,168,224,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(26,39,68,0.12)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: '"Georgia", serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2a3d5e', marginBottom: 8 }}>
                  {t('condolences.youAre')}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {RELATIONS.map(r => (
                    <button key={r.value} onClick={() => setRelation(rel => rel === r.value ? '' : r.value)}
                      style={{ padding: '6px 14px', borderRadius: 999, border: relation === r.value ? '1.5px solid rgba(90,168,224,0.6)' : '1.5px solid rgba(26,39,68,0.1)', background: relation === r.value ? 'rgba(90,168,224,0.1)' : 'rgba(255,255,255,0.6)', fontFamily: '"Georgia", serif', fontSize: '0.75rem', fontWeight: 700, color: relation === r.value ? '#2a5f8a' : '#3a5070', cursor: 'pointer', transition: 'all 0.2s ease', WebkitTapHighlightColor: 'transparent' }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {canProceed && (
        <button onClick={handleSubmit} disabled={!canSend || sending}
          style={{ width: '100%', padding: '14px 0', borderRadius: 999, background: canSend && !sending ? '#1a2744' : 'rgba(26,39,68,0.3)', border: 'none', color: 'white', fontFamily: '"Georgia", serif', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.06em', cursor: canSend && !sending ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: canSend && !sending ? '0 6px 20px rgba(26,39,68,0.18)' : 'none', transition: 'all 0.28s cubic-bezier(.22,1,.36,1)', animation: 'condolenceFormIn 0.4s cubic-bezier(.22,1,.36,1) 0.1s both' }}
        >
          {sending ? (
            <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.7s linear infinite' }} />{t('condolences.sending')}</>
          ) : (
            <><Send size={15} />{t('condolences.sendBtn')}</>
          )}
        </button>
      )}
    </div>
  );
}

function CondolencesTab({ memorialId, deceasedName }) {
  const { t } = useTranslation();
  const [view, setView]               = useState('list');
  const [condolences, setCondolences] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [submitted, setSubmitted]     = useState(false);

  const fetchCondolences = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/memorials/${memorialId}/condolences`);
      setCondolences(res.data || []);
    } catch (error) {
      console.error('Error fetching condolences:', error);
    } finally {
      setLoading(false);
    }
  }, [memorialId]);

  useEffect(() => { fetchCondolences(); }, [fetchCondolences]);

  const handleSuccess = () => { setSubmitted(true); setView('list'); fetchCondolences(); };

  return (
    <div data-testid="memorial-condolences">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ height: 1, flex: 1, background: 'rgba(26,39,68,0.08)' }} />
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.6rem', fontWeight: 700, color: '#5aa8e0' }}>
          {t('condolences.title')}
        </span>
        <div style={{ height: 1, flex: 1, background: 'rgba(26,39,68,0.08)' }} />
      </div>

      {submitted && view === 'list' && (
        <div style={{ marginBottom: 18, padding: '14px 18px', borderRadius: 14, background: 'rgba(90,168,224,0.08)', border: '1px solid rgba(90,168,224,0.25)', display: 'flex', alignItems: 'center', gap: 10, animation: 'condolenceIn 0.4s cubic-bezier(.22,1,.36,1) both' }}>
          <span style={{ fontSize: '1.1rem' }}>✨</span>
          <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.82rem', color: '#2a5f8a', margin: 0, lineHeight: 1.5 }}>
            {t('condolences.thankYou')} <strong>{deceasedName}</strong>.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setView('list')}
          style={{ flex: 1, padding: '10px 0', borderRadius: 999, border: view === 'list' ? '1.5px solid rgba(26,39,68,0.22)' : '1.5px solid rgba(26,39,68,0.09)', background: view === 'list' ? '#1a2744' : 'rgba(255,255,255,0.55)', fontFamily: '"Georgia", serif', fontSize: '0.78rem', fontWeight: 700, color: view === 'list' ? 'white' : '#3a5070', cursor: 'pointer', transition: 'all 0.22s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, WebkitTapHighlightColor: 'transparent' }}
        >
          <MessageCircle size={14} />
          {t('condolences.viewMessages')} {condolences.length > 0 && `(${condolences.length})`}
        </button>
        <button onClick={() => setView('form')}
          style={{ flex: 1, padding: '10px 0', borderRadius: 999, border: view === 'form' ? '1.5px solid rgba(90,168,224,0.5)' : '1.5px solid rgba(26,39,68,0.09)', background: view === 'form' ? 'rgba(90,168,224,0.1)' : 'rgba(255,255,255,0.55)', fontFamily: '"Georgia", serif', fontSize: '0.78rem', fontWeight: 700, color: view === 'form' ? '#1a5f8a' : '#3a5070', cursor: 'pointer', transition: 'all 0.22s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, WebkitTapHighlightColor: 'transparent' }}
        >
          <Heart size={14} />
          {t('condolences.sendCondolence')}
        </button>
      </div>

      {view === 'list' && (
        <div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2].map(i => (
                <div key={i} style={{ height: 90, borderRadius: 18, background: 'rgba(255,255,255,0.4)', animation: 'skimmer 1.8s ease-in-out infinite', backgroundSize: '600px 100%', backgroundImage: 'linear-gradient(90deg,rgba(255,255,255,0.25) 25%,rgba(255,255,255,0.55) 50%,rgba(255,255,255,0.25) 75%)' }} />
              ))}
            </div>
          ) : condolences.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px', borderRadius: 18, background: 'rgba(90,168,224,0.05)', border: '1px dashed rgba(90,168,224,0.25)' }}>
              <Heart size={32} style={{ color: 'rgba(90,168,224,0.35)', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.9rem', fontWeight: 700, color: '#1a2744', marginBottom: 6 }}>
                {t('condolences.noMessages')}
              </p>
              <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.8rem', color: 'rgba(58,80,112,0.55)', lineHeight: 1.6, marginBottom: 16 }}>
                {t('condolences.beFirst', { name: deceasedName })}
              </p>
              <button onClick={() => setView('form')}
                style={{ padding: '9px 22px', borderRadius: 999, background: '#1a2744', border: 'none', color: 'white', fontFamily: '"Georgia", serif', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(26,39,68,0.18)' }}>
                <Heart size={13} /> {t('condolences.sendCondolence')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {condolences.map((msg, i) => <CondolenceCard key={msg.id} msg={msg} index={i} />)}
            </div>
          )}
        </div>
      )}

      {view === 'form' && (
        <div style={{ animation: 'condolenceFormIn 0.35s cubic-bezier(.22,1,.36,1) both' }}>
          <CondolenceForm memorialId={memorialId} onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  );
}

const MemorialLayout = ({ memorial, isPreview = false, onShare }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('historia');
  const [lightbox, setLightbox]   = useState(null);

  if (!memorial) return null;

  const { person_data, content, responsible } = memorial;

  const handleShare = () => {
    if (onShare) { onShare(); }
    else if (navigator.share) {
      navigator.share({ title: `Memorial de ${person_data.full_name}`, text: `Homenagem a ${person_data.full_name}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  const openLightbox  = (images, index) => setLightbox({ images, index });
  const closeLightbox = () => setLightbox(null);
  const lightboxPrev  = () => setLightbox(l => ({ ...l, index: (l.index - 1 + l.images.length) % l.images.length }));
  const lightboxNext  = () => setLightbox(l => ({ ...l, index: (l.index + 1) % l.images.length }));
  const handleBackdropClick = (e) => { if (e.target === e.currentTarget) closeLightbox(); };
  const handleKeyDown = (e) => {
    if (!lightbox) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'ArrowRight') lightboxNext();
  };

  const galleryImages = content.gallery_urls || [];

  // ── Mudança 1: background transparente para herdar o sky-bg do html ──
  const wrapperStyle = isPreview ? {
    fontFamily: '"Georgia", serif', position: 'relative', outline: 'none',
  } : {
    minHeight: '100vh',
    background: 'transparent',
    fontFamily: '"Georgia", serif', position: 'relative', overflow: 'hidden', outline: 'none',
  };

  const TABS = [
    { key: 'historia',    label: t('memorial.tab_historia',    { defaultValue: 'História' }),    icon: BookOpen },
    { key: 'memorias',    label: t('memorial.tab_memorias',    { defaultValue: 'Memórias' }),    icon: Image },
    { key: 'audio',       label: t('memorial.tab_audio',       { defaultValue: 'Áudio' }),       icon: Music },
    ...(!isPreview ? [{ key: 'condolencias', label: t('memorial.tab_condolencias', { defaultValue: 'Condolências' }), icon: Heart }] : []),
  ];

  const BANNER_HEIGHT = 150;
  const PHOTO_SIZE    = 110;

  return (
    <div onKeyDown={handleKeyDown} tabIndex={-1} style={wrapperStyle}>
      <style>{`
        @keyframes floatML1 { 0%,100%{transform:translateY(0) translateX(0);} 45%{transform:translateY(-16px) translateX(9px);} }
        @keyframes floatML2 { 0%,100%{transform:translateY(0) translateX(0);} 55%{transform:translateY(-11px) translateX(-7px);} }
        @keyframes floatML3 { 0%,100%{transform:translateY(0) translateX(0);} 40%{transform:translateY(-8px) translateX(5px);} }
        @keyframes revealML { from{opacity:0;transform:translateY(24px);filter:blur(4px);} to{opacity:1;transform:translateY(0);filter:blur(0);} }
        @keyframes fadeTab  { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
        @keyframes photoReveal { from{opacity:0;transform:scale(0.88);} to{opacity:1;transform:scale(1);} }
        @keyframes lbFadeIn  { from{opacity:0;} to{opacity:1;} }
        @keyframes lbImgIn   { from{opacity:0;transform:scale(0.92);} to{opacity:1;transform:scale(1);} }
        @keyframes condolenceIn     { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        @keyframes condolenceFormIn { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        @keyframes skimmer { 0%{background-position:-600px 0;} 100%{background-position:600px 0;} }
        @keyframes spin { to{transform:rotate(360deg);} }

        .ml-card { background: rgba(255,255,255,0.68); backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px); border: 1px solid rgba(255,255,255,0.9); border-radius: clamp(22px, 4vw, 32px); box-shadow: 0 24px 80px rgba(26,39,68,0.1), 0 4px 16px rgba(26,39,68,0.05); overflow: hidden; animation: revealML 0.85s cubic-bezier(.22,1,.36,1) 0.1s both; }
        .ml-tab-btn { display: flex; flex-direction: column; align-items: center; gap: 4; padding: 10px clamp(8px, 2.5vw, 16px); border: none; background: transparent; cursor: pointer; transition: color 0.25s ease; font-family: "Georgia", serif; color: rgba(58,80,112,0.45); position: relative; -webkit-tap-highlight-color: transparent; border-radius: 12px; flex: 1; }
        .ml-tab-btn:hover { color: rgba(58,80,112,0.75); background: rgba(90,168,224,0.06); }
        .ml-tab-btn.active { color: #1a2744; }
        .ml-tab-btn.active::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 20px; height: 2.5px; border-radius: 999px; background: #5aa8e0; }
        .ml-tab-btn.active-heart { color: #c0392b !important; }
        .ml-tab-btn.active-heart::after { background: #e07a9f !important; }
        .ml-gallery-item { aspect-ratio:1; border-radius:16px; overflow:hidden; box-shadow:0 4px 16px rgba(26,39,68,0.1); cursor:pointer; position:relative; }
        .ml-gallery-item img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.55s cubic-bezier(.22,1,.36,1); }
        .ml-gallery-item:hover img { transform:scale(1.07); }
        .ml-gallery-item .ml-zoom-overlay { position:absolute; inset:0; background:rgba(26,39,68,0); display:flex; align-items:center; justify-content:center; transition:background 0.25s ease; border-radius:16px; }
        .ml-gallery-item:hover .ml-zoom-overlay { background:rgba(26,39,68,0.22); }
        .ml-gallery-item .ml-zoom-overlay svg { opacity:0; transform:scale(0.7); transition:opacity 0.25s ease,transform 0.25s ease; color:white; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.3)); }
        .ml-gallery-item:hover .ml-zoom-overlay svg { opacity:1; transform:scale(1); }
        .ml-share-btn { position:absolute; top:14px; right:14px; width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.85); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.9); box-shadow:0 4px 14px rgba(26,39,68,0.12); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.25s ease,transform 0.25s ease; -webkit-tap-highlight-color:transparent; }
        .ml-share-btn:hover { background:white; transform:scale(1.08); }
        .ml-lightbox { position:fixed; inset:0; z-index:9999; background:rgba(10,16,28,0.92); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; animation:lbFadeIn 0.25s ease both; padding:20px; }
        .ml-lightbox-img { max-width:min(90vw,800px); max-height:85vh; object-fit:contain; border-radius:16px; box-shadow:0 32px 80px rgba(0,0,0,0.5); animation:lbImgIn 0.3s cubic-bezier(.22,1,.36,1) both; display:block; }
        .ml-lb-btn { position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s ease,transform 0.2s ease; -webkit-tap-highlight-color:transparent; backdrop-filter:blur(8px); }
        .ml-lb-btn:hover { background:rgba(255,255,255,0.2); transform:scale(1.08); }
        .ml-lb-close { top:16px; right:16px; }
        .ml-lb-prev  { left:16px; top:50%; transform:translateY(-50%); }
        .ml-lb-next  { right:16px; top:50%; transform:translateY(-50%); }
        .ml-lb-prev:hover { transform:translateY(-50%) scale(1.08); }
        .ml-lb-next:hover { transform:translateY(-50%) scale(1.08); }
        .ml-lb-counter { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); font-family:"Georgia",serif; font-size:0.75rem; color:rgba(255,255,255,0.5); letter-spacing:0.12em; }
        .ml-condolence-badge { position: absolute; top: -4px; right: -4px; width: 8px; height: 8px; border-radius: 50%; background: #e07a9f; border: 1.5px solid white; }
      `}</style>

      {lightbox && (
        <div className="ml-lightbox" onClick={handleBackdropClick}>
          <button className="ml-lb-btn ml-lb-close" onClick={closeLightbox}><X size={18}/></button>
          {lightbox.images.length > 1 && <button className="ml-lb-btn ml-lb-prev" onClick={lightboxPrev}><ChevronLeft size={22}/></button>}
          <img key={lightbox.index} src={lightbox.images[lightbox.index]} alt="" className="ml-lightbox-img"/>
          {lightbox.images.length > 1 && <button className="ml-lb-btn ml-lb-next" onClick={lightboxNext}><ChevronRight size={22}/></button>}
          {lightbox.images.length > 1 && <span className="ml-lb-counter">{lightbox.index + 1} / {lightbox.images.length}</span>}
        </div>
      )}

      {!isPreview && (
        <>
          <div className="absolute top-[-20px] left-[-60px] w-52 md:w-80 opacity-60 pointer-events-none select-none" style={{ animation:'floatML1 12s ease-in-out infinite' }}>
            <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width:'100%',height:'auto',display:'block' }}/>
          </div>
          <div className="absolute top-[6%] right-[-50px] w-40 md:w-64 opacity-45 pointer-events-none select-none hidden md:block" style={{ animation:'floatML2 9s ease-in-out infinite' }}>
            <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width:'100%',height:'auto',display:'block' }}/>
          </div>
          <div className="absolute top-[45%] left-[-30px] w-28 opacity-30 pointer-events-none select-none hidden lg:block" style={{ animation:'floatML3 14s ease-in-out infinite' }}>
            <img src="/clouds/cloud3.png" alt="" draggable={false} style={{ width:'100%',height:'auto',display:'block' }}/>
          </div>
        </>
      )}

      <div className="relative z-10" style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px', paddingTop: isPreview ? 'clamp(16px,3vw,24px)' : 'clamp(72px,12vw,100px)', paddingBottom: 'clamp(48px,8vw,80px)' }}>

        <div className="ml-card">

          {/* ── Banner: sky-card + logo grande + foto no canto esquerdo ── */}
          <div
            className="relative flex-shrink-0"
            style={{ height: `${BANNER_HEIGHT}px`, overflow: 'visible' }}
          >
            {/* Background sky-card */}
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

            {/* Overlay sutil */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(26,39,68,0.06) 0%, rgba(26,39,68,0.18) 100%)',
              pointerEvents: 'none',
            }} />

            {/* Logo grande centralizada no banner*/}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <img
                src="/logo-transparent.svg"
                alt="Remember"
                style={{
                  height: '96px',
                  width: 'auto',
                  opacity: 0.55,
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'saturate(0.3) brightness(1.4) sepia(0.3) hue-rotate(180deg) drop-shadow(0 2px 8px rgba(90,168,224,0.2))',
                }}
              />
            </div>

            {/* Botão compartilhar */}
            <button className="ml-share-btn" onClick={handleShare} title="Compartilhar" style={{ zIndex: 2 }}>
              <Share2 size={17} style={{ color:'#2a3d5e' }}/>
            </button>

            {/* ── Foto no canto inferior esquerdo ── */}
            <div
              style={{
                position: 'absolute',
                bottom: `-${PHOTO_SIZE / 2}px`,
                left: '20px',
                zIndex: 10,
                animation: 'photoReveal 0.7s cubic-bezier(.22,1,.36,1) 0.3s both',
              }}
            >
              <div
                style={{
                  width: `${PHOTO_SIZE}px`,
                  height: `${PHOTO_SIZE}px`,
                  borderRadius: '50%',
                  border: '3.5px solid rgba(255,255,255,0.95)',
                  boxShadow: '0 6px 24px rgba(26,39,68,0.18)',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #c8e8f5, #a8d8f0)',
                }}
              >
                {person_data.photo_url ? (
                  <img
                    src={person_data.photo_url}
                    alt={person_data.full_name}
                    data-testid="memorial-photo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'"Georgia",serif', fontSize:'2rem', fontWeight:700, color:'rgba(26,39,68,0.35)' }}>
                    {person_data.full_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* /banner */}

          {/* ── Info do memorial — alinhada à esquerda, respeitando a foto no canto ── */}
          <div style={{
            paddingTop: `${PHOTO_SIZE / 2 + 12}px`,
            paddingBottom: 24,
            paddingLeft: 'clamp(20px,5vw,36px)',
            paddingRight: 'clamp(20px,5vw,36px)',
            textAlign: 'left',
            animation: 'revealML 0.7s cubic-bezier(.22,1,.36,1) 0.2s both',
          }}>
            <span style={{ textTransform:'uppercase', letterSpacing:'0.2em', fontSize:'0.58rem', fontWeight:700, color:'#5aa8e0', display:'block', marginBottom:8 }}>
              {t('memorial.inMemoryOf')}
            </span>
            <h1 data-testid="memorial-name" style={{ fontFamily:'"Georgia",serif', fontSize:'clamp(1.4rem,5vw,2rem)', fontWeight:700, color:'#1a2744', lineHeight:1.15, marginBottom:8 }}>
              {person_data.full_name}
            </h1>
            <p style={{ fontFamily:'"Georgia",serif', fontSize:'0.85rem', color:'rgba(58,80,112,0.65)', letterSpacing:'0.05em', marginBottom: content.main_phrase ? 16 : 0 }}>
              {person_data.birth_date ? formatDateShort(person_data.birth_date) : '...'}
              <span style={{ margin:'0 10px', color:'rgba(90,168,224,0.6)' }}>✦</span>
              {person_data.death_date ? formatDateShort(person_data.death_date) : '...'}
            </p>
            {content.main_phrase && (
              <div style={{ padding:'13px 18px', borderRadius:14, background:'rgba(90,168,224,0.07)', border:'1px solid rgba(90,168,224,0.18)' }}>
                <p style={{ fontFamily:'"Georgia",serif', fontSize:'clamp(0.83rem,2.5vw,0.92rem)', color:'#2a3d5e', fontStyle:'italic', lineHeight:1.7, margin:0 }}>
                  "{content.main_phrase}"
                </p>
              </div>
            )}
          </div>

          <div style={{ height:1, background:'rgba(26,39,68,0.07)', margin:'0 clamp(20px,5vw,36px)' }}/>

          <div style={{ display:'flex', justifyContent:'center', padding:'12px clamp(8px,2vw,16px) 0' }}>
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} className={`ml-tab-btn ${activeTab === key ? (key === 'condolencias' ? 'active active-heart' : 'active') : ''}`} onClick={() => setActiveTab(key)}>
                <div style={{ position:'relative' }}><Icon size={17}/></div>
                <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{label}</span>
              </button>
            ))}
          </div>

          <div style={{ height:1, background:'rgba(26,39,68,0.07)', marginTop:12 }}/>

          <div key={activeTab} style={{ padding:'clamp(20px,5vw,32px)', animation:'fadeTab 0.35s ease both' }}>

            {activeTab === 'historia' && (
              <div data-testid="memorial-biography">
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                  <div style={{ height:1, flex:1, background:'rgba(26,39,68,0.08)' }}/>
                  <span style={{ textTransform:'uppercase', letterSpacing:'0.18em', fontSize:'0.6rem', fontWeight:700, color:'#5aa8e0' }}>
                    {t('memorial.lifeStory')}
                  </span>
                  <div style={{ height:1, flex:1, background:'rgba(26,39,68,0.08)' }}/>
                </div>
                <p style={{ fontFamily:'"Georgia",serif', fontSize:'clamp(0.88rem,2.5vw,0.97rem)', color:'#2a3d5e', lineHeight:1.9, whiteSpace:'pre-wrap' }}>
                  {content.biography || <span style={{ color:'rgba(58,80,112,0.4)', fontStyle:'italic' }}>{t('memorial.noStory')}</span>}
                </p>
              </div>
            )}

            {activeTab === 'memorias' && (
              <div data-testid="memorial-gallery">
                {galleryImages.length > 0 ? (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10 }}>
                    {galleryImages.map((url, index) => (
                      <div key={index} className="ml-gallery-item" onClick={() => openLightbox(galleryImages, index)}>
                        <img src={url} alt={`Memória ${index+1}`}/>
                        <div className="ml-zoom-overlay"><ZoomIn size={22}/></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign:'center', padding:'40px 24px', borderRadius:18, background:'rgba(90,168,224,0.05)', border:'1px dashed rgba(90,168,224,0.25)' }}>
                    <Image size={36} style={{ color:'rgba(90,168,224,0.35)', margin:'0 auto 10px' }}/>
                    <p style={{ fontFamily:'"Georgia",serif', fontSize:'0.88rem', color:'rgba(58,80,112,0.5)' }}>
                      {t('memorial.noPhotos')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'audio' && (
              <div data-testid="memorial-audio">
                {content.audio_url ? (
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                      <div style={{ height:1, flex:1, background:'rgba(26,39,68,0.08)' }}/>
                      <span style={{ textTransform:'uppercase', letterSpacing:'0.18em', fontSize:'0.6rem', fontWeight:700, color:'#5aa8e0' }}>
                        {t('memorial.tributeMessage')}
                      </span>
                      <div style={{ height:1, flex:1, background:'rgba(26,39,68,0.08)' }}/>
                    </div>
                    <div style={{ borderRadius:16, padding:'20px', background:'rgba(90,168,224,0.06)', border:'1px solid rgba(90,168,224,0.18)' }}>
                      <audio src={content.audio_url} controls style={{ width:'100%', borderRadius:8 }}/>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign:'center', padding:'40px 24px', borderRadius:18, background:'rgba(90,168,224,0.05)', border:'1px dashed rgba(90,168,224,0.25)' }}>
                    <Music size={36} style={{ color:'rgba(90,168,224,0.35)', margin:'0 auto 10px' }}/>
                    <p style={{ fontFamily:'"Georgia",serif', fontSize:'0.88rem', color:'rgba(58,80,112,0.5)' }}>
                      {t('memorial.noAudio')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'condolencias' && !isPreview && (
              <CondolencesTab memorialId={memorial.id} deceasedName={person_data.full_name} />
            )}
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:28, animation:'revealML 0.7s cubic-bezier(.22,1,.36,1) 0.4s both' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:6 }}>
            <div style={{ height:1, width:24, background:'rgba(42,61,94,0.2)' }}/>
            <p style={{ fontFamily:'"Georgia",serif', fontSize:'0.78rem', color:'rgba(58,80,112,0.55)', fontStyle:'italic' }}>
              {t('memorial.createdWithLove', { name: responsible?.name })}
            </p>
            <div style={{ height:1, width:24, background:'rgba(42,61,94,0.2)' }}/>
          </div>
          <img src="/logo-transparent.svg" alt="Remember QRCode" style={{ height:36, width:'auto', opacity:0.4, margin:'0 auto' }}/>
        </div>
      </div>
    </div>
  );
};

export default MemorialLayout;