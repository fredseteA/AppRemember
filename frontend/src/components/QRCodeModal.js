import { useEffect, useRef, useState } from 'react';
import { X, Download, Copy, CheckCircle, FileCode } from 'lucide-react';

const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;

export default function QRCodeModal({ slug, name, onClose, highRes = false, adminOnly = false }) {
  const qrContainerRef = useRef(null);
  const plateCanvasRef = useRef(null);
  const [copied, setCopied]             = useState(false);
  const [qrReady, setQrReady]           = useState(false);
  const [activeFormat, setActiveFormat] = useState('png');

  const memorialUrl = `${FRONTEND_URL}/memorial/${slug}`;
  const plateSize   = highRes ? 1200 : 600;
  const previewSize = 280;
  const qrSize      = Math.round(plateSize * 0.58);

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

  // ─── Desenha finder pattern (canto) arredondado e colorido ───────────────
  const drawFinderPattern = (ctx, x, y, moduleSize, color = '#1a2744') => {
    const outer = moduleSize * 7;
    const r     = moduleSize * 1.2; // raio do arredondamento

    // Quadrado externo preenchido
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, outer, outer, r);
    ctx.fill();

    // Quadrado branco interno (separação)
    const sep = moduleSize;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(x + sep, y + sep, outer - sep * 2, outer - sep * 2, r * 0.5);
    ctx.fill();

    // Quadrado escuro central
    const innerSize = moduleSize * 3;
    const innerOff  = moduleSize * 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + innerOff, y + innerOff, innerSize, innerSize, r * 0.4);
    ctx.fill();
  };

  // ─── Monta canvas da placa ────────────────────────────────────────────────
  const buildPlate = (qrCanvas) => {
    const plate = plateCanvasRef.current;
    if (!plate || !qrCanvas) return;

    plate.width  = plateSize;
    plate.height = plateSize;
    const ctx    = plate.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, plateSize, plateSize);

    const cx     = plateSize / 2;
    const margin = plateSize * 0.08;
    const inner  = plateSize - margin * 2;

    // Label
    const labelSize = Math.round(plateSize * 0.045);
    ctx.font         = `${labelSize}px Georgia, serif`;
    ctx.fillStyle    = '#9ca3af';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    const labelY     = margin;
    ctx.fillText('Em memória de', cx, labelY);

    // Nome
    const nameSize   = Math.round(plateSize * 0.075);
    ctx.font         = `bold ${nameSize}px Georgia, serif`;
    ctx.fillStyle    = '#1a2744';
    const lineHeight = Math.round(nameSize * 1.2);
    const nameLines  = wrapText(ctx, name, inner).slice(0, 2);
    const nameBlockH = nameLines.length * lineHeight;
    const nameY      = labelY + labelSize * 1.5;
    nameLines.forEach((l, i) => ctx.fillText(l, cx, nameY + i * lineHeight));

    // QR Code
    const gap = plateSize * 0.04;
    const qrY = nameY + nameBlockH + gap;
    const qrX = (plateSize - qrSize) / 2;
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // ── Finder patterns coloridos sobre o QR ─────────────────────────────
    // Calcula tamanho de módulo baseado no qrSize renderizado
    const moduleSize = qrSize / (qrCanvas.width / (qrCanvas.width / 33));
    // Abordagem mais robusta: detecta via pixels
    const tempCtx  = qrCanvas.getContext('2d');
    const imgData  = tempCtx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
    const pixels   = imgData.data;
    let mod = 1;
    for (let x = 0; x < qrCanvas.width; x++) {
      if (pixels[(0 * qrCanvas.width + x) * 4] < 128) { mod = x; break; }
    }
    if (mod < 1) mod = Math.round(qrCanvas.width / 33);
    const scale    = qrSize / qrCanvas.width; // fator de escala canvas→plate
    const modPx    = mod * scale;             // tamanho de módulo em pixels do plate

    // Canto superior esquerdo
    drawFinderPattern(ctx, qrX, qrY, modPx);
    // Canto superior direito
    drawFinderPattern(ctx, qrX + qrSize - modPx * 7, qrY, modPx);
    // Canto inferior esquerdo
    drawFinderPattern(ctx, qrX, qrY + qrSize - modPx * 7, modPx);

    // ── Logo centralizada maior com anel branco espesso ───────────────────
    const logo       = new Image();
    logo.crossOrigin = 'anonymous';
    const finalize   = () => {
      if (logo.complete && logo.naturalWidth > 0) {
        const logoSize = qrSize * 0.28;  //logo width 
        const padding  = logoSize * 0.18;
        const lcx      = qrX + qrSize / 2;
        const lcy      = qrY + qrSize / 2;
        const bgR      = logoSize / 2 + padding;

        // Sombra suave
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur  = 10;
        ctx.beginPath();
        ctx.arc(lcx, lcy, bgR, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // Círculo branco (sem sombra, limpo)
        ctx.beginPath();
        ctx.arc(lcx, lcy, bgR, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Logo recortada em círculo
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

  // ─── Download PNG ─────────────────────────────────────────────────────────
  const handleDownloadPng = () => {
    const c = plateCanvasRef.current;
    if (!c) return;
    const a    = document.createElement('a');
    a.download = `placa-${slug}.png`;
    a.href     = c.toDataURL('image/png');
    a.click();
  };

  // ─── Download PDF ─────────────────────────────────────────────────────────
  const handleDownloadPdf = () => {
    const c = plateCanvasRef.current;
    if (!c) return;

    // Carrega jsPDF dinamicamente
    const loadAndGenerate = () => {
      const { jsPDF } = window.jspdf;
      const pdf       = new jsPDF({ unit: 'mm', format: [50, 50], orientation: 'portrait' });
      const imgData   = c.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 50, 50);
      pdf.save(`placa-${slug}.pdf`);
    };

    if (window.jspdf) {
      loadAndGenerate();
    } else {
      const s  = document.createElement('script');
      s.src    = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = loadAndGenerate;
      document.head.appendChild(s);
    }
  };

  // ─── Download SVG vetorizado ──────────────────────────────────────────────
  const handleDownloadSvg = () => {
    const qrCanvas = qrContainerRef.current?.querySelector('canvas');
    if (!qrCanvas) return;

    const ctx     = qrCanvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
    const pixels  = imgData.data;
    const cw      = qrCanvas.width;

    let mod = 1;
    for (let x = 0; x < cw; x++) {
      if (pixels[(0 * cw + x) * 4] < 128) { mod = x; break; }
    }
    if (mod < 1) mod = Math.round(cw / 33);

    const cols    = Math.round(cw / mod);
    const rows    = cols;
    const svgSize = 500;
    const cell    = svgSize / cols;

    const nameSafe = name.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const urlSafe  = memorialUrl.replace(/&/g, '&amp;');

    const topMargin    = svgSize * 0.06;
    const labelFs      = svgSize * 0.035;
    const nameFs       = svgSize * 0.058;
    const urlFs        = svgSize * 0.025;
    const gap          = svgSize * 0.03;
    const totalH       = topMargin + labelFs * 1.4 + nameFs * 1.5 + gap + svgSize + gap + urlFs + svgSize * 0.05;
    const cx           = svgSize / 2;
    const qrOffY       = topMargin + labelFs * 1.4 + nameFs * 1.5 + gap;

    // Finder pattern SVG arredondado colorido
    const fp = (fx, fy, m) => {
      const outer = m * 7; const r = m * 1.2; const sep = m; const inn = m * 3; const ioff = m * 2;
      return `
        <rect x="${fx}" y="${fy}" width="${outer}" height="${outer}" rx="${r}" ry="${r}" fill="#1a2744"/>
        <rect x="${fx+sep}" y="${fy+sep}" width="${outer-sep*2}" height="${outer-sep*2}" rx="${r*0.5}" ry="${r*0.5}" fill="#ffffff"/>
        <rect x="${fx+ioff}" y="${fy+ioff}" width="${inn}" height="${inn}" rx="${r*0.4}" ry="${r*0.4}" fill="#1a2744"/>
      `;
    };

    // Módulos do QR (excluindo regiões dos finder patterns)
    let rects = '';
    const fpZones = [
      { r0: 0, r1: 8, c0: 0,        c1: 8        }, // superior esquerdo
      { r0: 0, r1: 8, c0: cols - 8, c1: cols      }, // superior direito
      { r0: rows - 8, r1: rows, c0: 0, c1: 8      }, // inferior esquerdo
    ];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const inFP = fpZones.some(z => row >= z.r0 && row < z.r1 && col >= z.c0 && col < z.c1);
        if (inFP) continue;
        const px   = Math.floor((col + 0.5) * mod);
        const py   = Math.floor((row + 0.5) * mod);
        const idx  = (py * cw + px) * 4;
        if (pixels[idx] < 128) {
          rects += `<rect x="${(col*cell).toFixed(2)}" y="${(qrOffY+row*cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="#1a2744"/>`;
        }
      }
    }

    // Logo como círculo branco centralizado (sem imagem externa no SVG)
    const logoR    = svgSize * 0.22 * 0.5 + svgSize * 0.22 * 0.35;
    const logoCX   = cx;
    const logoCY   = qrOffY + svgSize / 2;
    const logoCirc = `<circle cx="${logoCX}" cy="${logoCY}" r="${logoR}" fill="#ffffff"/>
    <text x="${logoCX}" y="${(logoCY + svgSize*0.018).toFixed(2)}" font-family="Georgia,serif" font-size="${(svgSize*0.04).toFixed(2)}" fill="#1a2744" text-anchor="middle" font-weight="bold">R</text>`;

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${totalH.toFixed(2)}" viewBox="0 0 ${svgSize} ${totalH.toFixed(2)}">
  <rect width="${svgSize}" height="${totalH.toFixed(2)}" fill="#ffffff"/>
  <text x="${cx}" y="${(topMargin+labelFs).toFixed(2)}" font-family="Georgia,serif" font-size="${labelFs.toFixed(2)}" fill="#9ca3af" text-anchor="middle">Em memória de</text>
  <text x="${cx}" y="${(topMargin+labelFs*1.4+nameFs).toFixed(2)}" font-family="Georgia,serif" font-size="${nameFs.toFixed(2)}" font-weight="bold" fill="#1a2744" text-anchor="middle">${nameSafe}</text>
  ${rects}
  ${fp(0, qrOffY, cell)}
  ${fp(svgSize - cell*7, qrOffY, cell)}
  ${fp(0, qrOffY + svgSize - cell*7, cell)}
  ${logoCirc}
  <text x="${cx}" y="${(qrOffY+svgSize+gap+urlFs).toFixed(2)}" font-family="monospace" font-size="${urlFs.toFixed(2)}" fill="#6b7280" text-anchor="middle">${urlSafe}</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.download = `placa-${slug}-vetorizado.svg`;
    a.href     = url;
    a.click();
    URL.revokeObjectURL(url);
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
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={S.overlay}>
      <div style={S.modal}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <p style={S.eyebrow}>{highRes ? 'QR Code para Impressão' : 'QR Code do Memorial'}</p>
            <h3 style={S.title}>{name}</h3>
          </div>
          <button onClick={onClose} style={S.closeBtn}><X size={18} /></button>
        </div>

        {/* Seletor de formato */}
        {adminOnly && (
          <div style={{ display: 'flex', gap: 8, padding: '0 20px 4px' }}>
            {[
              { key: 'png', label: 'PNG (alta resolução)' },
              { key: 'pdf', label: 'PDF (5×5cm — gráfica)' },
              { key: 'svg', label: 'SVG (vetorizado)' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFormat(f.key)}
                style={{
                  flex: 1, padding: '8px 6px', borderRadius: 8,
                  border: activeFormat === f.key ? '2px solid #1a2744' : '1.5px solid #e5e7eb',
                  background: activeFormat === f.key ? '#1a2744' : 'transparent',
                  color: activeFormat === f.key ? '#fff' : '#6b7280',
                  fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Preview */}
        <div style={S.previewWrap}>
          <div ref={qrContainerRef}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', top: -9999, left: -9999 }} />

          {!qrReady && (
            <div style={{ ...S.spinnerWrap, width: previewSize, height: previewSize }}>
              <div style={S.spinner} />
            </div>
          )}

          <canvas
            ref={plateCanvasRef}
            style={{
              width: previewSize, height: previewSize,
              borderRadius: 10, border: '1px solid #e5e7eb',
              boxShadow: '0 2px 16px rgba(26,39,68,0.08)',
              display: 'block',
              opacity: qrReady ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
        </div>

        {/* Info */}
        <div style={S.infoBox}>
          {activeFormat === 'svg'
            ? <span>📐 <strong>SVG vetorizado</strong> — escala infinita, ideal para gráfica</span>
            : activeFormat === 'pdf'
            ? <span>📄 <strong>PDF 50×50mm</strong> — pronto para enviar à gráfica</span>
            : highRes
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

          {activeFormat === 'png' && (
            <button onClick={handleDownloadPng} style={S.btnPrimary} disabled={!qrReady}>
              <Download size={15} />
              {highRes ? 'Baixar PNG (1200px)' : 'Baixar PNG'}
            </button>
          )}
          {activeFormat === 'pdf' && (
            <button onClick={handleDownloadPdf} style={{ ...S.btnPrimary, background: '#dc2626' }} disabled={!qrReady}>
              <Download size={15} />
              Baixar PDF (50×50mm)
            </button>
          )}
          {activeFormat === 'svg' && (
            <button onClick={handleDownloadSvg} style={{ ...S.btnPrimary, background: '#1e40af' }} disabled={!qrReady}>
              <FileCode size={15} />
              Baixar SVG (gráfica)
            </button>
          )}
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
    width: '100%', maxWidth: 420,
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
    padding: '20px 20px 16px', minHeight: 312, position: 'relative',
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