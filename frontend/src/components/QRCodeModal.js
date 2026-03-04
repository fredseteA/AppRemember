import { useEffect, useRef, useState } from 'react';
import { X, Download, Copy, CheckCircle } from 'lucide-react';

const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;

/**
 * QRCodeModal
 * Props:
 *   slug     — string
 *   name     — string  nome do homenageado
 *   onClose  — () => void
 *   highRes  — bool    true = 1200px para gráfica
 *
 * Layout do canvas (quadrado):
 *   10% margem top  → "Em memória de"  (label)
 *   ~18%            → nome (1 ou 2 linhas, bold)
 *   4% gap
 *   55% do lado     → QR Code (quadrado, centralizado)
 *   4% gap
 *   6%              → URL pequena
 *   3% margem bottom
 */
export default function QRCodeModal({ slug, name, onClose, highRes = false }) {
  const qrContainerRef = useRef(null);
  const plateCanvasRef = useRef(null);
  const [copied, setCopied]   = useState(false);
  const [qrReady, setQrReady] = useState(false);

  const memorialUrl = `${FRONTEND_URL}/memorial/${slug}`;
  const plateSize   = highRes ? 1200 : 600; // canvas real gerado
  const previewSize = 280;                  // tamanho visual na tela (sempre fixo)

  // QR ocupa 58% do canvas
  const qrSize = Math.round(plateSize * 0.58);

  // ─── Quebra texto em linhas ───────────────────────────────────────────────
  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  // ─── Monta canvas da placa ────────────────────────────────────────────────
  const buildPlate = (qrCanvas) => {
    const plate = plateCanvasRef.current;
    if (!plate || !qrCanvas) return;

    plate.width  = plateSize;
    plate.height = plateSize;
    const ctx    = plate.getContext('2d');

    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, plateSize, plateSize);

    const cx      = plateSize / 2;
    const margin  = plateSize * 0.08;
    const inner   = plateSize - margin * 2; // largura útil

    // ── 1. Label "Em memória de" ───────────────────────────────────────────
    const labelSize = Math.round(plateSize * 0.045);
    ctx.font        = `${labelSize}px Georgia, serif`;
    ctx.fillStyle   = '#9ca3af';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'top';
    const labelY    = margin;
    ctx.fillText('Em memória de', cx, labelY);

    // ── 2. Nome (bold, até 2 linhas) ──────────────────────────────────────
    const nameSize   = Math.round(plateSize * 0.075);
    ctx.font         = `bold ${nameSize}px Georgia, serif`;
    ctx.fillStyle    = '#1a2744';
    const lineHeight = Math.round(nameSize * 1.2);
    const nameLines  = wrapText(ctx, name, inner).slice(0, 2);
    const nameBlockH = nameLines.length * lineHeight;
    const nameY      = labelY + labelSize * 1.5;

    nameLines.forEach((l, i) => {
      ctx.fillText(l, cx, nameY + i * lineHeight);
    });

    // ── 3. QR Code ────────────────────────────────────────────────────────
    // Posição Y: logo abaixo do nome + gap
    const gap   = plateSize * 0.04;
    const qrY   = nameY + nameBlockH + gap;
    const qrX   = (plateSize - qrSize) / 2;

    // Desenha QR
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // ── 4. Logo no centro do QR ───────────────────────────────────────────
    const logo       = new Image();
    logo.crossOrigin = 'anonymous';

    const finalize = () => {
      if (logo.complete && logo.naturalWidth > 0) {
        const logoSize = qrSize * 0.18;
        const padding  = logoSize * 0.22;
        const lcx      = qrX + qrSize / 2;
        const lcy      = qrY + qrSize / 2;
        const bgR      = logoSize / 2 + padding;

        // Sombra
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.10)';
        ctx.shadowBlur  = 6;
        ctx.beginPath();
        ctx.arc(lcx, lcy, bgR, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // Fundo branco
        ctx.beginPath();
        ctx.arc(lcx, lcy, bgR, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Logo circular
        ctx.save();
        ctx.beginPath();
        ctx.arc(lcx, lcy, logoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logo, lcx - logoSize / 2, lcy - logoSize / 2, logoSize, logoSize);
        ctx.restore();
      }

      setQrReady(true);
    };

    logo.onload  = finalize;
    logo.onerror = finalize;
    logo.src     = '/logo-transparent.png';
  };

  // ─── Gera QR ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const generate = () => {
      if (!qrContainerRef.current) return;
      const QRCode = window.QRCode;
      if (!QRCode) return;

      qrContainerRef.current.innerHTML = '';
      setQrReady(false);

      new QRCode(qrContainerRef.current, {
        text:         memorialUrl,
        width:        qrSize,
        height:       qrSize,
        colorDark:    '#1a2744',
        colorLight:   '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      });

      setTimeout(() => {
        const canvas = qrContainerRef.current?.querySelector('canvas');
        if (canvas) buildPlate(canvas);
        else setQrReady(true);
      }, 150);
    };

    if (window.QRCode) generate();
    else {
      const s  = document.createElement('script');
      s.src    = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      s.onload = generate;
      document.head.appendChild(s);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memorialUrl, qrSize, plateSize]);

  const handleDownload = () => {
    const c = plateCanvasRef.current;
    if (!c) return;
    const a    = document.createElement('a');
    a.download = `placa-${slug}.png`;
    a.href     = c.toDataURL('image/png');
    a.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(memorialUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={S.overlay}
    >
      <div style={S.modal}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <p style={S.eyebrow}>
              {highRes ? 'QR Code para Impressão' : 'QR Code do Memorial'}
            </p>
            <h3 style={S.title}>{name}</h3>
          </div>
          <button onClick={onClose} style={S.closeBtn}><X size={18} /></button>
        </div>

        {/* Preview */}
        <div style={S.previewWrap}>
          {/* Div oculta da lib */}
          <div ref={qrContainerRef}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', top: -9999, left: -9999 }} />

          {!qrReady && (
            <div style={{ ...S.spinnerWrap, width: previewSize, height: previewSize }}>
              <div style={S.spinner} />
            </div>
          )}

          {/* Canvas quadrado — CSS escala para previewSize */}
          <canvas
            ref={plateCanvasRef}
            style={{
              width:      previewSize,
              height:     previewSize,
              borderRadius: 10,
              border:     '1px solid #e5e7eb',
              boxShadow:  '0 2px 16px rgba(26,39,68,0.08)',
              display:    'block',
              opacity:    qrReady ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
        </div>

        {/* Info */}
        <div style={S.infoBox}>
          {highRes
            ? <span>🖨️ <strong>{plateSize}×{plateSize}px</strong> — pronto para gravação 5×5cm</span>
            : <span>🔍 Preview — admin baixa em alta resolução (1200px)</span>
          }
        </div>

        {/* URL */}
        <div style={S.urlBox}>
          <span style={S.urlText}>{memorialUrl}</span>
        </div>

        {/* Ações */}
        <div style={S.actions}>
          <button onClick={handleCopy} style={S.btnOutline} disabled={!qrReady}>
            {copied
              ? <><CheckCircle size={15} style={{ color: '#16a34a' }} /> Copiado!</>
              : <><Copy size={15} /> Copiar link</>
            }
          </button>
          <button onClick={handleDownload} style={S.btnPrimary} disabled={!qrReady}>
            <Download size={15} />
            {highRes ? 'Baixar para gráfica' : 'Baixar PNG'}
          </button>
        </div>

      </div>
    </div>
  );
}

const S = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 20,
    width: '100%', maxWidth: 380,
    boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
    overflow: 'hidden',
    animation: 'qrFadeIn 0.25s cubic-bezier(.22,1,.36,1)',
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6',
  },
  eyebrow: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 4px',
  },
  title: { fontSize: 17, fontWeight: 700, color: '#1a2744', margin: 0, lineHeight: 1.3 },
  closeBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: '#9ca3af', padding: 4, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  previewWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px 20px 20px', minHeight: 328, position: 'relative',
  },
  spinnerWrap: {
    position: 'absolute',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  spinner: {
    width: 36, height: 36,
    border: '3px solid #e5e7eb', borderTop: '3px solid #1a2744',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  infoBox: {
    margin: '0 20px 10px', padding: '8px 12px',
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 8, fontSize: 12, color: '#15803d',
  },
  urlBox: {
    margin: '0 20px 14px', padding: '10px 14px',
    background: '#f9fafb', border: '1px solid #e5e7eb',
    borderRadius: 10, overflow: 'hidden',
  },
  urlText: { fontSize: 12, color: '#6b7280', wordBreak: 'break-all', display: 'block' },
  actions: { display: 'flex', gap: 10, padding: '0 20px 20px' },
  btnOutline: {
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '11px 16px', borderRadius: 10,
    background: 'transparent', color: '#374151', border: '1.5px solid #d1d5db',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  btnPrimary: {
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '11px 16px', borderRadius: 10,
    background: '#1a2744', color: '#fff', border: 'none',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('qr-modal-styles')) {
  const s = document.createElement('style');
  s.id = 'qr-modal-styles';
  s.textContent = `
    @keyframes qrFadeIn {
      from { opacity:0; transform:scale(0.95) translateY(10px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }
    @keyframes spin { to { transform:rotate(360deg); } }
  `;
  document.head.appendChild(s);
}