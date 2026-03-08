import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Upload, ZoomIn, ZoomOut, RotateCw, Check, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import AuthModal from '../components/AuthModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ─────────────────────────────────────────────────────────────────────────────
// PhotoCropModal — canvas nativo, sem dependências externas
// Suporta arrastar, zoom (slider + scroll) e rotação
// Gera PNG 400×400 recortado em círculo ao confirmar
// ─────────────────────────────────────────────────────────────────────────────
function PhotoCropModal({ imageSrc, onConfirm, onCancel }) {
  const canvasRef    = useRef(null);
  const imgRef       = useRef(null);
  const [scale,     setScale]     = useState(1);
  const [rotation,  setRotation]  = useState(0);
  const [offset,    setOffset]    = useState({ x: 0, y: 0 });
  const [dragging,  setDragging]  = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize,   setImgSize]   = useState({ w: 0, h: 0 });

  const CROP_SIZE   = 300;
  const CANVAS_SIZE = 360;
  const CENTER      = CANVAS_SIZE / 2;

  // Carrega imagem e define escala inicial que cobre o círculo
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      setScale((CROP_SIZE / minDim) * 1.05);
      setOffset({ x: 0, y: 0 });
      setRotation(0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redesenha canvas a cada mudança de estado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current || imgSize.w === 0) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Fundo escuro
    ctx.fillStyle = 'rgba(10, 18, 44, 0.92)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Imagem com transformações
    ctx.save();
    ctx.translate(CENTER + offset.x, CENTER + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(imgRef.current, -imgSize.w / 2, -imgSize.h / 2, imgSize.w, imgSize.h);
    ctx.restore();

    // Overlay escuro fora do círculo
    ctx.save();
    ctx.fillStyle = 'rgba(8, 15, 40, 0.62)';
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.arc(CENTER, CENTER, CROP_SIZE / 2, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    ctx.restore();

    // Borda do círculo
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.88)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Grade de terços
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 3; i++) {
      const x = (CENTER - CROP_SIZE / 2) + (CROP_SIZE / 3) * i;
      const y = (CENTER - CROP_SIZE / 2) + (CROP_SIZE / 3) * i;
      ctx.moveTo(x, CENTER - CROP_SIZE / 2); ctx.lineTo(x, CENTER + CROP_SIZE / 2);
      ctx.moveTo(CENTER - CROP_SIZE / 2, y); ctx.lineTo(CENTER + CROP_SIZE / 2, y);
    }
    ctx.stroke();
    ctx.restore();
  }, [scale, rotation, offset, imgSize]);

  // Drag mouse
  const onMouseDown = (e) => { setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const onMouseMove = useCallback((e) => { if (!dragging) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }, [dragging, dragStart]);
  const onMouseUp   = () => setDragging(false);

  // Drag touch
  const onTouchStart = (e) => { const t = e.touches[0]; setDragging(true); setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y }); };
  const onTouchMove  = useCallback((e) => { if (!dragging) return; const t = e.touches[0]; setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y }); }, [dragging, dragStart]);
  const onTouchEnd   = () => setDragging(false);

  // Wheel zoom
  const onWheel = (e) => { e.preventDefault(); setScale(s => Math.max(0.3, Math.min(5, s + (e.deltaY > 0 ? -0.08 : 0.08)))); };

  // Gera PNG 400×400 recortado em círculo
  const handleConfirm = () => {
    const OUT = 400;
    const out = document.createElement('canvas');
    out.width = out.height = OUT;
    const ctx = out.getContext('2d');
    ctx.beginPath();
    ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
    ctx.clip();
    const ratio = OUT / CROP_SIZE;
    ctx.translate(OUT / 2 + offset.x * ratio, OUT / 2 + offset.y * ratio);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale * ratio, scale * ratio);
    ctx.drawImage(imgRef.current, -imgSize.w / 2, -imgSize.h / 2, imgSize.w, imgSize.h);
    out.toBlob(blob => onConfirm(blob), 'image/png', 0.92);
  };

  const canvasDisplay = Math.min(CANVAS_SIZE, (typeof window !== 'undefined' ? window.innerWidth : 420) - 64);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(6, 12, 30, 0.88)',
      backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
      padding: '16px',
      animation: 'cropIn 0.28s cubic-bezier(.22,1,.36,1) both',
    }}>
      <style>{`
        @keyframes cropIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
        @keyframes cropBtnIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .cc-ctrl {
          width:40px; height:40px; border-radius:50%;
          background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.18);
          color:white; display:flex; align-items:center; justify-content:center;
          cursor:pointer; flex-shrink:0; transition:background 0.18s ease;
          -webkit-tap-highlight-color:transparent;
        }
        .cc-ctrl:active { background:rgba(255,255,255,0.22); }
        .cc-range {
          flex:1; -webkit-appearance:none; appearance:none;
          height:3px; border-radius:99px; background:rgba(255,255,255,0.18); outline:none; cursor:pointer;
        }
        .cc-range::-webkit-slider-thumb {
          -webkit-appearance:none; width:18px; height:18px; border-radius:50%;
          background:white; box-shadow:0 2px 8px rgba(0,0,0,0.3); cursor:pointer;
        }
        .cc-range::-moz-range-thumb {
          width:18px; height:18px; border:none; border-radius:50%;
          background:white; box-shadow:0 2px 8px rgba(0,0,0,0.3);
        }
        .cc-confirm {
          flex:1; display:flex; align-items:center; justify-content:center; gap:8px;
          padding:14px 0; border-radius:999px; background:white; color:#1a2744;
          font-family:"Georgia",serif; font-size:0.88rem; font-weight:700; letter-spacing:0.05em;
          border:none; cursor:pointer; box-shadow:0 4px 20px rgba(255,255,255,0.15);
          transition:transform 0.2s ease;
          animation:cropBtnIn 0.4s cubic-bezier(.22,1,.36,1) 0.18s both;
          -webkit-tap-highlight-color:transparent;
        }
        .cc-confirm:active { transform:scale(0.97); }
        .cc-cancel {
          display:flex; align-items:center; justify-content:center; gap:6px;
          padding:14px 18px; border-radius:999px; background:transparent; color:rgba(255,255,255,0.6);
          font-family:"Georgia",serif; font-size:0.88rem; font-weight:600;
          border:1px solid rgba(255,255,255,0.18); cursor:pointer;
          transition:background 0.18s ease, color 0.18s ease;
          animation:cropBtnIn 0.4s cubic-bezier(.22,1,.36,1) 0.22s both;
          -webkit-tap-highlight-color:transparent;
        }
        .cc-cancel:active { background:rgba(255,255,255,0.1); color:white; }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18, width:'100%', maxWidth:400 }}>

        {/* Header */}
        <div style={{ textAlign:'center' }}>
          <p style={{ fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:6, fontFamily:'"Georgia",serif' }}>
            Foto do memorial
          </p>
          <h3 style={{ fontFamily:'"Georgia",serif', fontSize:'clamp(1rem,4vw,1.2rem)', fontWeight:700, color:'white', lineHeight:1.2, margin:0 }}>
            Ajuste a foto de perfil
          </h3>
          <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', marginTop:5, fontFamily:'"Georgia",serif' }}>
            Arraste · Scroll para zoom · Barra para rotacionar
          </p>
        </div>

        {/* Canvas circular */}
        <div
          style={{ borderRadius:'50%', overflow:'hidden', boxShadow:'0 0 0 3px rgba(255,255,255,0.12), 0 24px 64px rgba(0,0,0,0.55)', cursor:dragging?'grabbing':'grab', userSelect:'none', touchAction:'none', flexShrink:0 }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          onWheel={onWheel}
        >
          <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE}
            style={{ display:'block', width:canvasDisplay, height:canvasDisplay }} />
        </div>

        {/* Zoom */}
        <div style={{ display:'flex', alignItems:'center', gap:10, width:'100%' }}>
          <button className="cc-ctrl" onClick={() => setScale(s => Math.max(0.3, s - 0.12))}><ZoomOut size={15}/></button>
          <input type="range" className="cc-range" min={0.3} max={5} step={0.02}
            value={scale} onChange={e => setScale(parseFloat(e.target.value))} />
          <button className="cc-ctrl" onClick={() => setScale(s => Math.min(5, s + 0.12))}><ZoomIn size={15}/></button>
        </div>

        {/* Rotação */}
        <div style={{ display:'flex', alignItems:'center', gap:8, width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:999, padding:'7px 14px' }}>
          <button className="cc-ctrl" style={{ width:34,height:34 }} onClick={() => setRotation(r => r - 90)}>
            <RotateCw size={13} style={{ transform:'scaleX(-1)' }}/>
          </button>
          <input type="range" className="cc-range" min={-180} max={180} step={1}
            value={rotation} onChange={e => setRotation(parseFloat(e.target.value))} />
          <button className="cc-ctrl" style={{ width:34,height:34 }} onClick={() => setRotation(r => r + 90)}>
            <RotateCw size={13}/>
          </button>
          <span style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.32)', fontFamily:'"Georgia",serif', minWidth:32, textAlign:'right' }}>
            {rotation}°
          </span>
        </div>

        {/* Botões */}
        <div style={{ display:'flex', gap:10, width:'100%' }}>
          <button className="cc-cancel" onClick={onCancel}><X size={13}/>Cancelar</button>
          <button className="cc-confirm" onClick={handleConfirm}><Check size={14}/>Usar esta foto</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CreateMemorial
// ─────────────────────────────────────────────────────────────────────────────
const CreateMemorial = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Crop state
  const [cropSrc,  setCropSrc]  = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  const [personData, setPersonData] = useState({
    full_name: '', relationship: '', birth_date: '', death_date: '',
    birth_city: '', birth_state: '', death_city: '', death_state: '',
    photo_url: null, public_memorial: false
  });

  const [content, setContent] = useState({
    main_phrase: '', biography: '', gallery_urls: [], audio_url: null
  });

  const [responsible, setResponsible] = useState({ name: '', phone: '', email: '' });

  const handleFileUpload = async (file, path) => {
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name || 'file'}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload do arquivo');
      return null;
    }
  };

  // Seleciona foto → abre modal de crop (sem fazer upload ainda)
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = ''; // permite re-selecionar o mesmo arquivo
    const reader = new FileReader();
    reader.onload = (ev) => { setCropSrc(ev.target.result); setShowCrop(true); };
    reader.readAsDataURL(file);
  };

  // Usuário confirmou crop → faz upload do blob resultante
  const handleCropConfirm = async (blob) => {
    setShowCrop(false); setCropSrc(null);
    setLoading(true);
    const file = new File([blob], 'profile.png', { type: 'image/png' });
    const url = await handleFileUpload(file, 'photos');
    if (url) { setPersonData(prev => ({ ...prev, photo_url: url })); toast.success('Foto adicionada com sucesso!'); }
    setLoading(false);
  };

  const handleCropCancel = () => { setShowCrop(false); setCropSrc(null); };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + content.gallery_urls.length > 10) { toast.error('Máximo de 10 fotos na galeria'); return; }
    setLoading(true);
    const urls = [];
    for (const file of files) { const url = await handleFileUpload(file, 'gallery'); if (url) urls.push(url); }
    setContent({ ...content, gallery_urls: [...content.gallery_urls, ...urls] });
    toast.success(`${urls.length} foto(s) adicionada(s)!`);
    setLoading(false);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const url = await handleFileUpload(file, 'audio');
    if (url) { setContent({ ...content, audio_url: url }); toast.success('Áudio enviado com sucesso!'); }
    setLoading(false);
  };

  const handleNext = () => {
    if (step === 1 && (!personData.full_name || !personData.relationship)) { toast.error('Preencha os campos obrigatórios'); return; }
    if (step === 2 && (!content.main_phrase || !content.biography))        { toast.error('Preencha a frase principal e a biografia'); return; }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!user) { setAuthModalOpen(true); return; }
    if (!responsible.name || !responsible.phone || !responsible.email) { toast.error('Preencha todos os dados do responsável'); return; }
    setLoading(true);
    try {
      const response = await axios.post(`${API}/memorials`, { person_data: personData, content, responsible }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Memorial criado com sucesso!');
      navigate(`/preview/${response.data.id}`);
    } catch (error) {
      console.error('Error creating memorial:', error);
      toast.error('Erro ao criar memorial');
    } finally { setLoading(false); }
  };

  return (
    <div className="overflow-x-hidden" data-testid="create-memorial-page"
      style={{ background:'linear-gradient(180deg,#c8e8f5 0%,#ddf0f7 30%,#eef8fb 70%,#eef8fb 100%)', fontFamily:'"Georgia",serif', minHeight:'100vh' }}>

      {/* Crop Modal */}
      {showCrop && cropSrc && <PhotoCropModal imageSrc={cropSrc} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />}

      <style>{`
        @keyframes floatCM1 { 0%,100%{transform:translateY(0) translateX(0);} 45%{transform:translateY(-14px) translateX(8px);} }
        @keyframes floatCM2 { 0%,100%{transform:translateY(0) translateX(0);} 55%{transform:translateY(-10px) translateX(-7px);} }
        @keyframes revealCM { from{opacity:0;transform:translateY(28px);filter:blur(5px);} to{opacity:1;transform:translateY(0);filter:blur(0);} }
        @keyframes slideCard { from{opacity:0;transform:translateY(20px) scale(0.99);} to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        .cm-input {
          width:100%; padding:13px 14px; border-radius:12px; border:1.5px solid rgba(26,39,68,0.12);
          background:rgba(255,255,255,0.7); backdrop-filter:blur(8px);
          font-family:"Georgia",serif; font-size:1rem; color:#1a2744; outline:none;
          transition:border-color 0.25s ease,box-shadow 0.25s ease;
          -webkit-appearance:none; appearance:none; box-sizing:border-box;
        }
        .cm-input:focus { border-color:#5aa8e0; box-shadow:0 0 0 3px rgba(90,168,224,0.15); }
        .cm-input::placeholder { color:rgba(58,80,112,0.4); }
        .cm-textarea {
          width:100%; padding:13px 14px; border-radius:12px; border:1.5px solid rgba(26,39,68,0.12);
          background:rgba(255,255,255,0.7); backdrop-filter:blur(8px);
          font-family:"Georgia",serif; font-size:1rem; color:#1a2744; outline:none; resize:none;
          transition:border-color 0.25s ease,box-shadow 0.25s ease;
          -webkit-appearance:none; appearance:none; box-sizing:border-box;
        }
        .cm-textarea:focus { border-color:#5aa8e0; box-shadow:0 0 0 3px rgba(90,168,224,0.15); }
        .cm-textarea::placeholder { color:rgba(58,80,112,0.4); }
        .cm-upload-zone {
          border-radius:16px; border:1.5px dashed rgba(90,168,224,0.45);
          background:rgba(255,255,255,0.45); transition:background 0.25s ease,border-color 0.25s ease;
          cursor:pointer; display:block;
        }
        .cm-upload-zone:active { background:rgba(255,255,255,0.65); border-color:rgba(90,168,224,0.7); }
        .cm-btn-primary {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:14px 28px; border-radius:999px; background:#1a2744; color:white;
          font-family:"Georgia",serif; font-size:0.9rem; font-weight:700; letter-spacing:0.06em;
          border:none; cursor:pointer; transition:background 0.25s ease,transform 0.25s ease,box-shadow 0.25s ease;
          box-shadow:0 6px 20px rgba(26,39,68,0.18); min-height:48px; -webkit-tap-highlight-color:transparent;
        }
        .cm-btn-primary:active:not(:disabled) { background:#2a3d5e; transform:scale(0.97); }
        .cm-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
        .cm-btn-ghost {
          display:inline-flex; align-items:center; justify-content:center; gap:6px;
          padding:14px 20px; border-radius:999px; background:transparent; color:#3a5070;
          font-family:"Georgia",serif; font-size:0.9rem; font-weight:700; letter-spacing:0.06em;
          border:1.5px solid rgba(26,39,68,0.15); cursor:pointer;
          transition:border-color 0.25s ease,color 0.25s ease,background 0.25s ease;
          min-height:48px; -webkit-tap-highlight-color:transparent;
        }
        .cm-btn-ghost:active { background:rgba(255,255,255,0.5); color:#1a2744; }
        .cm-label {
          display:block; font-family:"Georgia",serif; font-size:0.68rem; font-weight:700;
          letter-spacing:0.2em; text-transform:uppercase; color:#2a3d5e; margin-bottom:8px;
        }
        .cm-check-wrapper {
          display:flex; align-items:center; gap:12px; padding:16px; border-radius:14px;
          background:rgba(255,255,255,0.45); border:1.5px solid rgba(90,168,224,0.2);
          cursor:pointer; -webkit-tap-highlight-color:transparent;
        }
        .cm-step-dot {
          width:34px; height:34px; border-radius:50%; display:flex; align-items:center;
          justify-content:center; font-family:"Georgia",serif; font-size:0.82rem; font-weight:700;
          transition:all 0.5s ease; flex-shrink:0;
        }
        .cm-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .cm-nav {
          display:flex; justify-content:space-between; align-items:center;
          margin-top:28px; padding-top:22px; border-top:1px solid rgba(26,39,68,0.07); gap:12px;
        }
        /* Photo preview */
        .cm-photo-ring {
          position:relative; width:108px; height:108px; border-radius:50%; overflow:hidden;
          flex-shrink:0; box-shadow:0 0 0 3px rgba(90,168,224,0.4),0 8px 28px rgba(26,39,68,0.14);
        }
        .cm-photo-ring img { width:100%; height:100%; object-fit:cover; display:block; }
        .cm-photo-tag {
          display:inline-flex; align-items:center; gap:5px; padding:6px 14px; border-radius:999px;
          background:rgba(255,255,255,0.7); border:1.5px solid rgba(90,168,224,0.3); color:#1a2744;
          font-family:"Georgia",serif; font-size:0.7rem; font-weight:700; letter-spacing:0.08em;
          text-transform:uppercase; cursor:pointer;
          transition:background 0.2s ease,box-shadow 0.2s ease; -webkit-tap-highlight-color:transparent;
        }
        .cm-photo-tag:hover { background:rgba(255,255,255,0.92); box-shadow:0 2px 10px rgba(26,39,68,0.09); }
        .cm-photo-tag-danger { background:rgba(255,240,240,0.7); border-color:rgba(200,60,60,0.22); color:#b83232; }
        .cm-photo-tag-danger:hover { background:rgba(255,235,235,0.9); }
        @media (max-width:480px) {
          .cm-nav { flex-direction:column-reverse; gap:10px; }
          .cm-btn-primary,.cm-btn-ghost { width:100%; font-size:0.88rem; }
          .cm-grid-2 { grid-template-columns:1fr; gap:16px; }
        }
      `}</style>

      {/* Nuvens decorativas */}
      <div className="absolute top-[60px] left-[-60px] w-44 md:w-72 opacity-50 pointer-events-none select-none z-0"
        style={{ animation:'floatCM1 11s ease-in-out infinite' }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width:'100%',height:'auto',display:'block' }}/>
      </div>
      <div className="absolute top-[100px] right-[-50px] w-40 md:w-60 opacity-40 pointer-events-none select-none z-0 hidden md:block"
        style={{ animation:'floatCM2 13s ease-in-out infinite' }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width:'100%',height:'auto',display:'block' }}/>
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 overflow-hidden"
        style={{ paddingTop:'clamp(100px,20vw,192px)', paddingBottom:'clamp(20px,4vw,48px)', animation:'revealCM 0.85s cubic-bezier(.22,1,.36,1) both' }}>
        <div style={{ maxWidth:640, margin:'0 auto', padding:'0 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ height:1, width:28, background:'rgba(42,61,94,0.3)', flexShrink:0 }}/>
            <span style={{ textTransform:'uppercase', letterSpacing:'0.22em', fontSize:'0.62rem', fontWeight:700, color:'#2a3d5e' }}>Uma homenagem eterna</span>
          </div>
          <h1 style={{ fontFamily:'"Georgia",serif', fontSize:'clamp(1.7rem,7vw,3.8rem)', fontWeight:700, color:'#1a2744', lineHeight:1.1, marginBottom:'clamp(20px,4vw,36px)' }}>
            {t('memorial.createTitle')}
          </h1>
          {/* Steps */}
          <div style={{ display:'flex', alignItems:'center' }}>
            {[1,2,3].map((num) => (
              <div key={num} style={{ display:'flex', alignItems:'center' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div className="cm-step-dot" style={{ background:num===step?'#1a2744':num<step?'#5aa8e0':'rgba(255,255,255,0.55)', color:num===step?'white':num<step?'white':'#3a5070', border:num>step?'1.5px solid rgba(26,39,68,0.15)':'none', backdropFilter:'blur(8px)' }}>
                    {num < step ? '✓' : num}
                  </div>
                  <span style={{ fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:num===step?'#1a2744':num<step?'#5aa8e0':'rgba(58,80,112,0.4)', whiteSpace:'nowrap' }}>
                    {num===1?'Dados':num===2?'Conteúdo':'Responsável'}
                  </span>
                </div>
                {num < 3 && <div style={{ height:1.5, width:'clamp(40px,8vw,80px)', marginBottom:22, background:num<step?'#5aa8e0':'rgba(26,39,68,0.1)', transition:'background 0.5s ease', flexShrink:0 }}/>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM CARD ── */}
      <section className="relative z-10" style={{ paddingBottom:'clamp(60px,10vw,144px)' }}>
        <div style={{ maxWidth:640, margin:'0 auto', padding:'0 16px' }}>
          <div style={{ background:'rgba(255,255,255,0.62)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.85)', borderRadius:'clamp(18px,4vw,28px)', boxShadow:'0 20px 70px rgba(26,39,68,0.1)', animation:'slideCard 0.6s cubic-bezier(.22,1,.36,1) 0.15s both', overflow:'hidden' }}>

            {/* Card header */}
            <div style={{ padding:'clamp(20px,4vw,28px) clamp(20px,5vw,36px) clamp(16px,3vw,24px)', borderBottom:'1px solid rgba(26,39,68,0.07)', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:4, height:36, borderRadius:99, background:'linear-gradient(180deg,#5aa8e0 0%,#2a3d5e 100%)', flexShrink:0 }}/>
              <div>
                <span style={{ display:'block', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'#5aa8e0', marginBottom:3 }}>Etapa {step} de 3</span>
                <h2 style={{ fontFamily:'"Georgia",serif', fontSize:'clamp(1rem,3vw,1.25rem)', fontWeight:700, color:'#1a2744', lineHeight:1.2 }}>
                  {step===1&&t('memorial.step1')}{step===2&&t('memorial.step2')}{step===3&&t('memorial.step3')}
                </h2>
              </div>
            </div>

            <div style={{ padding:'clamp(20px,5vw,32px) clamp(20px,5vw,36px)' }}>

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div style={{ display:'flex', flexDirection:'column', gap:18 }} data-testid="step-1">

                  <div>
                    <label className="cm-label" htmlFor="full_name">{t('memorial.fullName')} *</label>
                    <input id="full_name" className="cm-input" value={personData.full_name}
                      onChange={e => setPersonData({...personData, full_name:e.target.value})} data-testid="input-full-name"/>
                  </div>

                  <div>
                    <label className="cm-label" htmlFor="relationship">{t('memorial.relationship')} *</label>
                    <input id="relationship" className="cm-input" placeholder="Ex: Pai, Mãe, Avô, Amigo..."
                      value={personData.relationship} onChange={e => setPersonData({...personData, relationship:e.target.value})} data-testid="input-relationship"/>
                  </div>

                  <div className="cm-grid-2">
                    <div>
                      <label className="cm-label" htmlFor="birth_date">Data de Nascimento</label>
                      <input id="birth_date" type="date" className="cm-input" value={personData.birth_date}
                        onChange={e => setPersonData({...personData, birth_date:e.target.value})} data-testid="input-birth-date"/>
                    </div>
                    <div>
                      <label className="cm-label" htmlFor="death_date">Data de Falecimento</label>
                      <input id="death_date" type="date" className="cm-input" value={personData.death_date}
                        onChange={e => setPersonData({...personData, death_date:e.target.value})} data-testid="input-death-date"/>
                    </div>
                  </div>

                  <div className="cm-grid-2">
                    <div>
                      <label className="cm-label" htmlFor="birth_city">{t('memorial.birthCity')}</label>
                      <input id="birth_city" className="cm-input" value={personData.birth_city}
                        onChange={e => setPersonData({...personData, birth_city:e.target.value})} data-testid="input-birth-city"/>
                    </div>
                    <div>
                      <label className="cm-label" htmlFor="birth_state">{t('memorial.birthState')}</label>
                      <input id="birth_state" className="cm-input" value={personData.birth_state}
                        onChange={e => setPersonData({...personData, birth_state:e.target.value})} data-testid="input-birth-state"/>
                    </div>
                  </div>

                  <div className="cm-grid-2">
                    <div>
                      <label className="cm-label" htmlFor="death_city">{t('memorial.deathCity')}</label>
                      <input id="death_city" className="cm-input" value={personData.death_city}
                        onChange={e => setPersonData({...personData, death_city:e.target.value})} data-testid="input-death-city"/>
                    </div>
                    <div>
                      <label className="cm-label" htmlFor="death_state">{t('memorial.deathState')}</label>
                      <input id="death_state" className="cm-input" value={personData.death_state}
                        onChange={e => setPersonData({...personData, death_state:e.target.value})} data-testid="input-death-state"/>
                    </div>
                  </div>

                  {/* ── Photo com crop ─────────────────────────────────────── */}
                  <div>
                    <label className="cm-label">{t('memorial.photo')}</label>

                    {/* Input sempre presente — permite re-selecionar */}
                    <input type="file" id="photo" accept="image/*"
                      onChange={handlePhotoSelect} className="hidden" data-testid="input-photo"/>

                    {personData.photo_url ? (
                      /* Preview circular + ações */
                      <div style={{ display:'flex', alignItems:'center', gap:18, padding:'18px 20px', borderRadius:16, background:'rgba(255,255,255,0.55)', border:'1.5px solid rgba(90,168,224,0.2)' }}>
                        <div className="cm-photo-ring">
                          <img src={personData.photo_url} alt="Foto do memorial"/>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:8, flex:1 }}>
                          <p style={{ fontFamily:'"Georgia",serif', fontSize:'0.75rem', color:'#3a5070', margin:'0 0 4px', lineHeight:1.4 }}>
                            <span style={{ color:'#3a9e6e', fontWeight:700 }}>✓</span> Foto recortada e pronta
                          </p>
                          <label htmlFor="photo" className="cm-photo-tag">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Trocar foto
                          </label>
                          <button className="cm-photo-tag cm-photo-tag-danger"
                            onClick={() => setPersonData(prev => ({...prev, photo_url:null}))}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                            Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Zona de upload */
                      <label htmlFor="photo" className="cm-upload-zone" style={{ padding:'clamp(20px,5vw,28px)', textAlign:'center' }}>
                        {loading ? (
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                            <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid rgba(90,168,224,0.2)', borderTop:'3px solid #5aa8e0', animation:'spin 0.8s linear infinite' }}/>
                            <span style={{ color:'#3a5070', fontSize:'0.85rem', fontFamily:'"Georgia",serif' }}>Processando...</span>
                          </div>
                        ) : (
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                            <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(90,168,224,0.1)', border:'1.5px dashed rgba(90,168,224,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <Upload size={20} style={{ color:'#5aa8e0' }}/>
                            </div>
                            <span style={{ color:'#3a5070', fontSize:'0.9rem', fontFamily:'"Georgia",serif' }}>Toque para enviar uma foto</span>
                            <span style={{ color:'rgba(58,80,112,0.45)', fontSize:'0.72rem', fontFamily:'"Georgia",serif' }}>Você poderá recortar após selecionar</span>
                            <span style={{ color:'rgba(58,80,112,0.35)', fontSize:'0.68rem' }}>JPG · PNG · WEBP</span>
                          </div>
                        )}
                      </label>
                    )}
                  </div>

                  {/* Público */}
                  <label className="cm-check-wrapper" htmlFor="public_memorial">
                    <Checkbox id="public_memorial" checked={personData.public_memorial}
                      onCheckedChange={checked => setPersonData({...personData, public_memorial:checked})}
                      data-testid="checkbox-public"
                      className="border-[#5aa8e0] data-[state=checked]:bg-[#5aa8e0] data-[state=checked]:border-[#5aa8e0]"/>
                    <span style={{ color:'#3a5070', fontSize:'0.9rem', fontFamily:'"Georgia",serif', lineHeight:1.4 }}>
                      {t('memorial.publicMemorial')}
                    </span>
                  </label>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div style={{ display:'flex', flexDirection:'column', gap:18 }} data-testid="step-2">
                  <div>
                    <label className="cm-label" htmlFor="main_phrase">{t('memorial.mainPhrase')} *</label>
                    <input id="main_phrase" className="cm-input" placeholder="Uma frase especial para homenagear..."
                      value={content.main_phrase} onChange={e => setContent({...content, main_phrase:e.target.value})} data-testid="input-main-phrase"/>
                  </div>
                  <div>
                    <label className="cm-label" htmlFor="biography">{t('memorial.biography')} *</label>
                    <textarea id="biography" className="cm-textarea" rows={6}
                      placeholder="Conte a história de vida, momentos especiais, características marcantes..."
                      value={content.biography} onChange={e => setContent({...content, biography:e.target.value})} data-testid="input-biography"/>
                  </div>
                  <div>
                    <label className="cm-label">{t('memorial.gallery')} (até 10 fotos)</label>
                    <input type="file" id="gallery" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" data-testid="input-gallery"/>
                    <label htmlFor="gallery" className="cm-upload-zone" style={{ padding:'22px', textAlign:'center' }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:'rgba(90,168,224,0.12)', border:'1px solid rgba(90,168,224,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Upload size={18} style={{ color:'#5aa8e0' }}/>
                        </div>
                        <span style={{ color:'#3a5070', fontSize:'0.9rem', fontFamily:'"Georgia",serif' }}>
                          Toque para adicionar fotos ({content.gallery_urls.length}/10)
                        </span>
                      </div>
                    </label>
                    {content.gallery_urls.length > 0 && (
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(64px,1fr))', gap:8, marginTop:12 }}>
                        {content.gallery_urls.map((url,i) => (
                          <img key={i} src={url} alt={`Gallery ${i+1}`} style={{ width:'100%', aspectRatio:'1', objectFit:'cover', borderRadius:10 }}/>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="cm-label">{t('memorial.audio')} (opcional)</label>
                    <input type="file" id="audio" accept="audio/*" onChange={handleAudioUpload} className="hidden" data-testid="input-audio"/>
                    <label htmlFor="audio" className="cm-upload-zone" style={{ padding:'22px', textAlign:'center' }}>
                      {content.audio_url ? (
                        <audio src={content.audio_url} controls style={{ width:'100%' }}/>
                      ) : (
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                          <div style={{ width:44, height:44, borderRadius:12, background:'rgba(90,168,224,0.12)', border:'1px solid rgba(90,168,224,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Upload size={18} style={{ color:'#5aa8e0' }}/>
                          </div>
                          <span style={{ color:'#3a5070', fontSize:'0.9rem', fontFamily:'"Georgia",serif' }}>Toque para enviar um áudio</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* ── STEP 3 ── */}
              {step === 3 && (
                <div style={{ display:'flex', flexDirection:'column', gap:18 }} data-testid="step-3">
                  <div style={{ padding:'14px 16px', borderRadius:14, background:'rgba(90,168,224,0.08)', border:'1px solid rgba(90,168,224,0.2)', display:'flex', alignItems:'flex-start', gap:10 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#5aa8e0', flexShrink:0, marginTop:7 }}/>
                    <p style={{ color:'#3a5070', fontSize:'0.85rem', fontFamily:'"Georgia",serif', lineHeight:1.6, margin:0 }}>
                      Suas informações são tratadas com total privacidade e usadas apenas para contato sobre o memorial.
                    </p>
                  </div>
                  <div>
                    <label className="cm-label" htmlFor="responsible_name">{t('memorial.responsibleName')} *</label>
                    <input id="responsible_name" className="cm-input" value={responsible.name}
                      onChange={e => setResponsible({...responsible, name:e.target.value})} data-testid="input-responsible-name"/>
                  </div>
                  <div>
                    <label className="cm-label" htmlFor="phone">{t('memorial.phone')} *</label>
                    <input id="phone" type="tel" className="cm-input" placeholder="+55 (00) 00000-0000"
                      value={responsible.phone} onChange={e => setResponsible({...responsible, phone:e.target.value})} data-testid="input-phone"/>
                  </div>
                  <div>
                    <label className="cm-label" htmlFor="email">{t('auth.email')} *</label>
                    <input id="email" type="email" className="cm-input" value={responsible.email}
                      onChange={e => setResponsible({...responsible, email:e.target.value})} data-testid="input-email"/>
                  </div>
                </div>
              )}

              {/* ── NAVIGATION ── */}
              <div className="cm-nav">
                {step > 1 ? (
                  <button className="cm-btn-ghost" onClick={() => setStep(step-1)} data-testid="button-back">
                    <ChevronLeft size={15}/>{t('memorial.back')}
                  </button>
                ) : <div/>}
                {step < 3 ? (
                  <button className="cm-btn-primary" onClick={handleNext} disabled={loading} data-testid="button-next">
                    {t('memorial.next')}<ChevronRight size={15}/>
                  </button>
                ) : (
                  <button className="cm-btn-primary" onClick={handleSubmit} disabled={loading} data-testid="button-finish"
                    style={{ background:loading?'rgba(26,39,68,0.5)':'#1a2744' }}>
                    {loading?'Salvando...':t('memorial.finish')}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)}/>
    </div>
  );
};

export default CreateMemorial;