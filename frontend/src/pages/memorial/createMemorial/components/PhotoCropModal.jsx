import { useState, useEffect, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Check, X } from 'lucide-react';

const PhotoCropModal = ({ imageSrc, onConfirm, onCancel }) => {
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current || imgSize.w === 0) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = 'rgba(10, 18, 44, 0.92)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.save();
    ctx.translate(CENTER + offset.x, CENTER + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(imgRef.current, -imgSize.w / 2, -imgSize.h / 2, imgSize.w, imgSize.h);
    ctx.restore();
    ctx.save();
    ctx.fillStyle = 'rgba(8, 15, 40, 0.62)';
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.arc(CENTER, CENTER, CROP_SIZE / 2, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.88)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
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
  }, [scale, rotation, offset, imgSize, CANVAS_SIZE, CENTER, CROP_SIZE]);

  const onMouseDown = (e) => { setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const onMouseMove = useCallback((e) => { if (!dragging) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }, [dragging, dragStart]);
  const onMouseUp   = () => setDragging(false);
  const onTouchStart = (e) => { const t = e.touches[0]; setDragging(true); setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y }); };
  const onTouchMove  = useCallback((e) => { if (!dragging) return; const t = e.touches[0]; setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y }); }, [dragging, dragStart]);
  const onTouchEnd   = () => setDragging(false);
  const onWheel = (e) => { e.preventDefault(); setScale(s => Math.max(0.3, Math.min(5, s + (e.deltaY > 0 ? -0.08 : 0.08)))); };

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
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(6, 12, 30, 0.88)', backdropFilter:'blur(22px)', WebkitBackdropFilter:'blur(22px)', padding:'16px', animation:'cropIn 0.28s cubic-bezier(.22,1,.36,1) both' }}>
      <style>{`
        @keyframes cropIn { from{opacity:0;transform:scale(0.93);}to{opacity:1;transform:scale(1);} }
        @keyframes cropBtnIn { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
        .cc-ctrl { width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background 0.18s ease;-webkit-tap-highlight-color:transparent; }
        .cc-ctrl:active { background:rgba(255,255,255,0.22); }
        .cc-range { flex:1;-webkit-appearance:none;appearance:none;height:3px;border-radius:99px;background:rgba(255,255,255,0.18);outline:none;cursor:pointer; }
        .cc-range::-webkit-slider-thumb { -webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer; }
        .cc-confirm { flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 0;border-radius:999px;background:white;color:#1a2744;font-family:"Georgia",serif;font-size:0.88rem;font-weight:700;letter-spacing:0.05em;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(255,255,255,0.15);transition:transform 0.2s ease;animation:cropBtnIn 0.4s cubic-bezier(.22,1,.36,1) 0.18s both;-webkit-tap-highlight-color:transparent; }
        .cc-confirm:active { transform:scale(0.97); }
        .cc-cancel { display:flex;align-items:center;justify-content:center;gap:6px;padding:14px 18px;border-radius:999px;background:transparent;color:rgba(255,255,255,0.6);font-family:"Georgia",serif;font-size:0.88rem;font-weight:600;border:1px solid rgba(255,255,255,0.18);cursor:pointer;transition:background 0.18s ease,color 0.18s ease;animation:cropBtnIn 0.4s cubic-bezier(.22,1,.36,1) 0.22s both;-webkit-tap-highlight-color:transparent; }
        .cc-cancel:active { background:rgba(255,255,255,0.1);color:white; }
      `}</style>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18, width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:6, fontFamily:'"Georgia",serif' }}>Foto do memorial</p>
          <h3 style={{ fontFamily:'"Georgia",serif', fontSize:'clamp(1rem,4vw,1.2rem)', fontWeight:700, color:'white', lineHeight:1.2, margin:0 }}>Ajuste a foto de perfil</h3>
          <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', marginTop:5, fontFamily:'"Georgia",serif' }}>Arraste · Scroll para zoom · Barra para rotacionar</p>
        </div>
        <div style={{ borderRadius:'50%', overflow:'hidden', boxShadow:'0 0 0 3px rgba(255,255,255,0.12),0 24px 64px rgba(0,0,0,0.55)', cursor:dragging?'grabbing':'grab', userSelect:'none', touchAction:'none', flexShrink:0 }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onWheel={onWheel}>
          <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} style={{ display:'block', width:canvasDisplay, height:canvasDisplay }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, width:'100%' }}>
          <button className="cc-ctrl" onClick={() => setScale(s => Math.max(0.3, s - 0.12))}><ZoomOut size={15}/></button>
          <input type="range" className="cc-range" min={0.3} max={5} step={0.02} value={scale} onChange={e => setScale(parseFloat(e.target.value))}/>
          <button className="cc-ctrl" onClick={() => setScale(s => Math.min(5, s + 0.12))}><ZoomIn size={15}/></button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:999, padding:'7px 14px' }}>
          <button className="cc-ctrl" style={{ width:34,height:34 }} onClick={() => setRotation(r => r - 90)}><RotateCw size={13} style={{ transform:'scaleX(-1)' }}/></button>
          <input type="range" className="cc-range" min={-180} max={180} step={1} value={rotation} onChange={e => setRotation(parseFloat(e.target.value))}/>
          <button className="cc-ctrl" style={{ width:34,height:34 }} onClick={() => setRotation(r => r + 90)}><RotateCw size={13}/></button>
          <span style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.32)', fontFamily:'"Georgia",serif', minWidth:32, textAlign:'right' }}>{rotation}°</span>
        </div>
        <div style={{ display:'flex', gap:10, width:'100%' }}>
          <button className="cc-cancel" onClick={onCancel}><X size={13}/>Cancelar</button>
          <button className="cc-confirm" onClick={handleConfirm}><Check size={14}/>Usar esta foto</button>
        </div>
      </div>
    </div>
  );
}

export default PhotoCropModal;
