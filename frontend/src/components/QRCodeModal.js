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

  // ─── Monta canvas da placa ────────────────────────────────────────────────
  // CORREÇÃO: removido o redesenho manual dos finder patterns.
  // A lib qrcodejs já gera os finder patterns corretamente no canvas.
  // Redesenhá-los por cima (com coordenadas aproximadas) corrompía a leitura.
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

    const labelSize = Math.round(plateSize * 0.05);
    ctx.font         = `italic ${labelSize}px Georgia, serif`;
    ctx.fillStyle    = '#1a2744';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    const labelY     = margin;
    ctx.fillText('Uma vida, muitas memórias.', cx, labelY);

    const gap = plateSize * 0.05;
    const qrY = labelY + labelSize * 1.8 + gap;
    const qrX = (plateSize - qrSize) / 2;

    // Desenha o QR code gerado pela lib — sem modificações nos finder patterns
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // ─── Logo centralizada sobre o QR ────────────────────────────────────
    const logo       = new Image();
    logo.crossOrigin = 'anonymous';
    const finalize   = () => {
      if (logo.complete && logo.naturalWidth > 0) {
        const logoSize = qrSize * 0.17;
        const padding  = logoSize * 0.10;
        const lcx      = qrX + qrSize / 2;
        const lcy      = qrY + qrSize / 2;
        const bgR      = logoSize / 2 + padding;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur  = 10;
        ctx.beginPath();
        ctx.arc(lcx, lcy, bgR, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(lcx, lcy, bgR, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

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
    logo.src     = '/logo-transparent.svg';
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
        colorDark:    '#000000',   // CORREÇÃO: preto puro para máxima legibilidade
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

  // ─── Download SVG ─────────────────────────────────────────────────────────
  const handleDownloadSvg = () => {
    const doGenerate = () => {
      const qr = window.qrcode(0, 'H');
      qr.addData(memorialUrl);
      qr.make();

      const moduleCount = qr.getModuleCount();
      const docW    = 50;
      const margin  = 3.5;
      const qrAreaW = docW - margin * 2;
      const cell    = qrAreaW / moduleCount;
      const qrAreaH = cell * moduleCount;
      const titleH  = 8.5;
      const urlH    = 5.0;
      const qrTop   = titleH;
      const qrLeft  = margin;
      const docH    = titleH + qrAreaH + urlH;

      const darkColor = '#1a2744';
      const grayColor = '#9ca3af';

      const esc = (s) => s.replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
      );

      const finderZones = [
        { row: 0, col: 0 },
        { row: 0, col: moduleCount - 7 },
        { row: moduleCount - 7, col: 0 },
      ];
      const isInFinder = (r, c) => finderZones.some(z =>
        r >= z.row && r < z.row + 7 && c >= z.col && c < z.col + 7
      );

      const makeFinder = (x, y, s) => {
        const r1 = s * 0.9;
        const r2 = s * 0.45;
        const r3 = s * 0.3;
        return `
  <rect x="${x.toFixed(3)}" y="${y.toFixed(3)}" width="${(s*7).toFixed(3)}" height="${(s*7).toFixed(3)}" rx="${r1.toFixed(3)}" fill="${darkColor}"/>
  <rect x="${(x+s).toFixed(3)}" y="${(y+s).toFixed(3)}" width="${(s*5).toFixed(3)}" height="${(s*5).toFixed(3)}" rx="${r2.toFixed(3)}" fill="#ffffff"/>
  <rect x="${(x+s*2).toFixed(3)}" y="${(y+s*2).toFixed(3)}" width="${(s*3).toFixed(3)}" height="${(s*3).toFixed(3)}" rx="${r3.toFixed(3)}" fill="${darkColor}"/>`;
      };

      const logoDiameter = cell * moduleCount * 0.17;  // círculo — mantido
      const logoPad      = logoDiameter * 0.12;
      const logoR        = logoDiameter / 2 + logoPad;
      const logoCX       = qrLeft + qrAreaW / 2;
      const logoCY       = qrTop  + qrAreaW / 2;

      const LOGO_OX         = 505.75;
      const LOGO_OY         = 427.9;
      const LOGO_BASE_SCALE = 0.00552;  
      const LOGO_BASE_D     = 5.2;
      const logoFinalScale  = (logoR * 2 / LOGO_BASE_D) * LOGO_BASE_SCALE;
      const logoTransform   = `translate(${logoCX},${logoCY - logoR * 0.04}) scale(${logoFinalScale.toFixed(6)}) translate(${-LOGO_OX},${-LOGO_OY})`;

      const LOGO_PATHS = `<g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)"
fill="#1a2744" stroke="none">
<path d="M4395 8025 c-149 -33 -254 -93 -356 -203 -204 -221 -231 -510 -73
-783 46 -79 131 -164 389 -389 110 -96 218 -191 240 -211 190 -174 429 -374
473 -395 81 -41 55 -58 510 339 605 528 657 579 722 712 59 118 73 188 68 320
-4 87 -11 126 -33 185 -85 232 -280 390 -531 430 -93 15 -182 5 -284 -34 -117
-44 -214 -111 -314 -217 l-84 -89 -83 85 c-139 143 -265 217 -425 250 -87 18
-138 18 -219 0z m240 -129 c120 -32 201 -88 350 -242 138 -143 131 -144 295
24 106 109 137 134 205 168 111 57 157 67 267 62 104 -6 174 -28 254 -81 176
-116 265 -309 236 -510 -24 -162 -91 -259 -331 -472 -86 -77 -198 -176 -247
-220 -77 -70 -478 -415 -527 -454 -18 -14 -37 -6 -82 35 -11 11 -101 89 -200
173 -309 266 -597 522 -680 605 -127 128 -185 258 -185 413 0 226 166 439 390
499 61 17 193 17 255 0z"/>
<path d="M5095 7418 c-40 -23 -44 -40 -45 -160 l0 -118 -110 0 c-62 0 -120 -5
-135 -12 -46 -21 -46 -95 0 -116 15 -7 73 -12 135 -12 l110 0 0 -196 c0 -118
4 -203 11 -215 19 -37 76 -44 121 -15 1 0 4 96 7 211 l6 210 121 5 c101 4 126
8 143 24 28 25 27 67 -2 94 -21 20 -34 22 -145 22 l-122 0 0 119 0 119 -31 26
c-35 29 -36 30 -64 14z"/>
<path d="M8820 5893 c-168 -89 -274 -221 -313 -389 -20 -83 -13 -92 57 -77 83
18 125 41 192 108 98 98 163 222 179 343 7 51 6 52 -19 52 -14 0 -57 -17 -96
-37z"/>
<path d="M1295 5909 c-4 -6 -4 -35 0 -66 8 -63 63 -178 124 -257 69 -90 189
-166 264 -169 l42 -2 0 56 c-1 133 -143 319 -312 407 -84 43 -107 50 -118 31z"/>
<path d="M1755 5736 c-18 -13 -18 -19 -7 -91 25 -159 137 -331 254 -389 80
-40 88 -37 88 32 0 77 -24 164 -65 237 -38 69 -141 172 -202 204 -50 25 -45
24 -68 7z"/>
<path d="M8437 5730 c-71 -22 -203 -154 -247 -248 -23 -49 -50 -166 -50 -219
0 -35 1 -35 32 -29 97 19 196 114 263 251 39 78 68 181 63 223 -3 29 -18 35
-61 22z"/>
<path d="M4385 5600 c-33 -5 -148 -29 -255 -53 -335 -78 -430 -90 -571 -72
-51 6 -58 5 -72 -15 -15 -22 -12 -48 9 -83 35 -60 304 -48 607 28 337 84 487
85 717 1 127 -45 225 -60 363 -54 96 5 129 11 232 46 174 59 233 72 323 72 85
0 251 -28 355 -60 168 -52 471 -84 577 -61 67 14 90 34 90 77 0 49 -36 70 -93
56 -84 -21 -97 -22 -212 -7 -122 16 -199 33 -435 93 -138 35 -153 37 -300 36
-166 -1 -175 -3 -375 -74 -108 -38 -231 -49 -327 -30 -35 6 -115 29 -178 50
-167 56 -298 70 -455 50z"/>
<path d="M2111 5571 c-12 -8 -13 -18 -2 -68 19 -82 68 -209 106 -269 46 -72
163 -154 220 -154 22 0 25 4 25 38 0 105 -73 265 -158 349 -79 77 -162 122
-191 104z"/>
<path d="M8045 5547 c-75 -41 -165 -128 -197 -192 -36 -71 -68 -179 -68 -231
0 -41 2 -44 28 -44 40 1 100 31 153 78 58 52 121 173 155 301 35 134 29 142
-71 88z"/>
<path d="M2493 5374 c-15 -41 21 -191 70 -289 32 -65 124 -149 184 -169 39
-13 57 -15 72 -7 18 10 19 14 5 73 -25 107 -54 184 -87 225 -56 71 -120 130
-169 154 -67 34 -67 34 -75 13z"/>
<path d="M8561 5374 c-61 -16 -142 -58 -167 -85 -14 -16 -15 -21 -3 -35 22
-27 113 -63 190 -76 122 -21 293 19 379 89 21 18 23 23 10 38 -57 69 -274 106
-409 69z"/>
<path d="M1405 5362 c-126 -33 -161 -65 -116 -106 31 -29 153 -73 235 -86 132
-22 289 18 321 81 15 27 14 29 -19 54 -63 48 -131 68 -246 71 -78 3 -123 -1
-175 -14z"/>
<path d="M7655 5351 c-71 -40 -130 -109 -175 -202 -39 -80 -79 -223 -67 -235
12 -13 65 -6 109 14 87 38 164 144 207 286 30 99 27 166 -8 166 -9 0 -39 -13
-66 -29z"/>
<path d="M2873 5164 c-25 -66 88 -327 179 -410 113 -103 393 -214 543 -214 51
0 55 2 55 23 0 36 -31 57 -109 73 -94 20 -207 57 -296 98 l-72 33 -5 52 c-10
105 -117 269 -217 333 -51 32 -69 35 -78 12z"/>
<path d="M7294 5154 c-116 -77 -208 -215 -229 -341 -6 -40 -10 -44 -68 -71
-77 -36 -164 -65 -286 -95 -76 -18 -98 -28 -114 -49 -17 -23 -18 -30 -7 -43
18 -21 63 -19 173 10 240 62 405 149 482 255 85 117 155 308 126 344 -18 22
-32 20 -77 -10z"/>
<path d="M4340 5163 c-19 -3 -41 -9 -47 -15 -20 -16 -15 -62 10 -99 l23 -34
154 -1 c163 -2 184 -5 390 -71 77 -24 100 -27 245 -27 170 -1 178 1 400 70 82
25 104 28 247 28 180 1 187 4 195 78 8 70 0 73 -206 73 l-176 0 -155 -53
c-260 -88 -337 -89 -585 -7 -71 24 -157 48 -189 54 -57 11 -232 12 -306 4z"/>
<path d="M8123 5160 c-45 -10 -118 -44 -128 -60 -17 -27 102 -107 213 -144
121 -40 211 -52 280 -38 57 12 102 37 110 61 11 32 -159 142 -263 170 -60 15
-164 21 -212 11z"/>
<path d="M1900 5137 c-80 -27 -141 -63 -200 -115 -38 -34 -43 -43 -34 -59 29
-48 183 -68 299 -38 111 29 291 130 282 159 -7 21 -67 54 -118 65 -78 17 -157
13 -229 -12z"/>
<path d="M2330 4971 c-116 -37 -270 -143 -270 -185 0 -33 186 -57 280 -37 78
17 188 73 239 123 l43 42 -26 23 c-32 27 -115 53 -170 52 -23 0 -66 -8 -96
-18z"/>
<path d="M7720 4981 c-47 -15 -90 -41 -90 -55 0 -20 77 -82 151 -121 148 -78
334 -88 392 -22 17 19 17 21 0 40 -33 36 -124 98 -191 130 -56 26 -81 32 -152
34 -47 1 -96 -1 -110 -6z"/>
<path d="M7340 4814 c-67 -14 -115 -41 -115 -64 0 -19 113 -94 182 -120 73
-29 215 -38 319 -20 87 15 95 30 37 77 -142 113 -287 157 -423 127z"/>
<path d="M2722 4806 c-80 -20 -194 -82 -242 -131 l-44 -44 40 -17 c24 -11 78
-19 140 -22 107 -5 177 9 258 50 59 30 147 99 143 112 -7 20 -121 59 -182 62
-33 2 -84 -3 -113 -10z"/>
<path d="M1390 3897 c0 -9 9 -18 19 -22 11 -3 31 -15 45 -26 l26 -20 0 -319
c0 -345 2 -333 -57 -349 -15 -4 -29 -15 -31 -24 -3 -15 13 -17 167 -17 164 0
171 1 171 20 0 14 -7 20 -22 20 -13 0 -38 9 -55 20 l-33 20 0 325 0 325 58 0
c109 0 167 -52 167 -149 0 -94 -55 -154 -180 -197 -19 -6 -18 -7 5 -13 20 -5
39 -33 95 -142 39 -75 81 -151 95 -168 33 -42 88 -60 183 -61 70 0 77 2 77 20
0 11 -5 20 -12 20 -36 0 -98 45 -135 98 -37 53 -133 216 -133 226 0 2 21 19
48 38 75 55 113 149 92 230 -15 55 -58 100 -124 129 -47 21 -69 24 -258 27
-182 4 -208 2 -208 -11z"/>
<path d="M2300 3898 c0 -7 21 -24 48 -38 l47 -25 3 -320 c2 -316 2 -320 -19
-337 -12 -10 -30 -18 -40 -18 -12 0 -19 -7 -19 -20 0 -20 7 -20 279 -20 l279
0 6 45 c3 25 9 65 12 90 4 25 2 45 -2 45 -5 0 -25 -21 -44 -47 -48 -64 -92
-81 -215 -85 l-100 -3 0 165 0 165 77 0 c85 0 106 -11 110 -58 1 -17 8 -27 18
-27 13 0 15 17 15 108 -1 109 -11 140 -28 87 -17 -52 -24 -55 -113 -55 l-85 0
3 148 3 147 113 -1 c131 -1 149 -11 159 -83 10 -74 30 -49 36 46 3 49 3 91 0
95 -2 5 -125 8 -274 8 -208 0 -269 -3 -269 -12z"/>
<path d="M3140 3898 c0 -7 12 -19 28 -25 15 -7 40 -23 55 -35 l28 -23 -11
-300 c-10 -261 -14 -303 -29 -325 -10 -14 -28 -26 -40 -28 -13 -2 -21 -11 -21
-23 0 -18 8 -19 115 -19 108 0 115 1 115 20 0 11 -6 20 -14 20 -7 0 -25 9 -40
21 l-26 20 1 237 c1 130 5 248 9 262 4 14 8 19 9 12 1 -8 8 -28 16 -45 8 -18
45 -104 83 -192 153 -352 155 -356 175 -353 17 3 92 162 207 438 10 25 33 77
52 115 l33 70 6 -130 c9 -174 10 -410 3 -429 -3 -8 -21 -18 -40 -22 -25 -4
-34 -12 -34 -25 0 -19 8 -19 147 -17 107 2 147 6 151 16 2 7 -11 19 -30 27
-19 7 -40 21 -47 29 -9 11 -14 95 -18 309 -6 295 -6 295 17 327 12 17 33 36
47 41 14 5 23 15 20 22 -2 8 -36 13 -110 15 l-107 3 -11 -28 c-6 -15 -63 -147
-127 -292 l-117 -264 -19 44 c-11 24 -67 154 -125 289 l-106 245 -123 3 c-94
2 -122 0 -122 -10z"/>
<path d="M4370 3897 c0 -6 20 -24 45 -39 l45 -28 0 -319 c0 -319 0 -320 -22
-335 -12 -9 -33 -16 -45 -16 -16 0 -23 -6 -23 -20 0 -20 7 -20 279 -20 l279 0
5 33 c14 79 19 147 10 147 -5 0 -25 -22 -45 -48 -47 -64 -82 -79 -205 -87
l-103 -7 0 171 0 171 66 0 c91 0 124 -19 124 -72 0 -18 5 -28 15 -28 21 0 22
225 1 233 -10 4 -15 -6 -20 -33 -7 -46 -17 -50 -112 -50 l-74 0 0 150 0 150
73 0 c147 -1 197 -26 197 -97 0 -27 4 -34 18 -31 14 3 17 17 20 96 l3 92 -266
0 c-206 0 -265 -3 -265 -13z"/>
<path d="M5180 3896 c0 -8 10 -16 23 -20 12 -3 37 -18 55 -33 l34 -28 -10
-302 c-10 -330 -15 -353 -67 -353 -18 0 -25 -5 -25 -20 0 -19 7 -20 120 -20
113 0 120 1 120 20 0 13 -7 20 -19 20 -10 0 -30 9 -45 21 l-26 20 0 183 c0
101 3 217 6 260 l7 76 89 -202 c49 -112 107 -242 128 -290 22 -47 40 -91 40
-97 0 -6 8 -11 19 -11 18 0 40 40 89 165 11 28 57 131 102 230 45 99 84 188
87 198 16 51 22 -9 25 -245 2 -145 0 -271 -5 -281 -4 -10 -21 -20 -38 -24 -20
-4 -29 -11 -29 -24 0 -18 10 -19 145 -19 133 0 145 1 145 18 0 12 -13 23 -36
31 -21 8 -39 22 -45 38 -13 34 -12 599 1 624 6 10 24 26 40 34 17 9 30 22 30
30 0 12 -19 15 -105 15 l-105 0 -11 -27 c-6 -16 -21 -52 -35 -80 -13 -29 -58
-128 -98 -220 -41 -93 -83 -187 -94 -211 l-19 -43 -70 163 c-39 90 -95 220
-124 290 l-54 128 -122 0 c-99 0 -123 -3 -123 -14z"/>
<path d="M6400 3901 c0 -7 10 -15 23 -20 12 -5 32 -19 45 -30 22 -22 22 -23
22 -340 0 -347 2 -335 -58 -347 -23 -5 -32 -12 -32 -26 0 -19 7 -20 228 -16
184 4 236 8 272 22 87 33 140 104 140 189 0 108 -67 188 -179 212 l-34 7 29
13 c109 46 157 177 95 264 -12 16 -42 40 -69 53 -44 22 -60 23 -264 26 -155 3
-218 0 -218 -7z m379 -66 c68 -35 89 -117 48 -189 -28 -51 -77 -79 -149 -86
l-58 -6 0 147 c0 108 3 149 13 153 22 10 114 -2 146 -19z m36 -369 c98 -58
109 -170 25 -247 -47 -43 -98 -58 -169 -51 l-51 5 0 165 0 165 74 -5 c57 -4
85 -11 121 -32z"/>
<path d="M7255 3899 c-4 -6 -5 -11 -4 -13 2 -1 25 -12 52 -25 l47 -24 0 -327
0 -327 -25 -11 c-14 -7 -32 -12 -40 -12 -8 0 -15 -9 -15 -20 0 -20 7 -20 279
-20 319 0 286 -12 297 108 4 40 3 72 -2 72 -5 0 -22 -19 -39 -41 -16 -23 -41
-49 -55 -59 -26 -18 -146 -40 -221 -40 l-39 0 0 170 0 170 63 0 c76 0 109 -16
123 -58 19 -59 29 -34 32 78 2 93 0 110 -13 110 -9 0 -15 -9 -15 -24 0 -44
-24 -56 -111 -56 l-80 0 3 148 3 147 99 -2 c55 -1 109 -4 121 -7 25 -6 45 -39
49 -81 2 -18 10 -31 20 -33 14 -3 16 9 16 92 l0 96 -269 0 c-180 0 -272 -4
-276 -11z"/>
<path d="M8110 3896 c0 -8 18 -25 40 -37 l40 -23 0 -321 c0 -299 -1 -323 -18
-338 -10 -10 -28 -17 -40 -17 -15 0 -22 -6 -22 -20 0 -19 7 -20 165 -20 158 0
165 1 165 20 0 14 -7 20 -22 20 -29 0 -88 35 -89 52 0 7 -1 154 -2 325 l-2
313 59 0 c79 0 138 -28 161 -77 25 -51 16 -123 -21 -175 -30 -43 -102 -87
-141 -88 -13 0 -23 -4 -23 -9 0 -5 10 -11 23 -13 17 -2 37 -33 95 -142 105
-203 132 -226 267 -226 67 0 75 2 75 19 0 14 -9 21 -31 26 -46 10 -106 79
-176 203 -35 60 -63 114 -63 118 0 5 18 20 40 34 23 14 51 41 64 60 93 138 28
283 -142 319 -29 6 -132 11 -227 11 -145 0 -175 -2 -175 -14z"/>
</g>`;

      let modulePaths = '';
      const rModule = cell * 0.12;
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (!qr.isDark(r, c)) continue;
          if (isInFinder(r, c)) continue;
          const mx  = qrLeft + c * cell;
          const my  = qrTop  + r * cell;
          const mcx = mx + cell / 2;
          const mcy = my + cell / 2;
          if (Math.sqrt((mcx - logoCX) ** 2 + (mcy - logoCY) ** 2) < logoR) continue;
          modulePaths += `<rect x="${mx.toFixed(3)}" y="${my.toFixed(3)}" width="${cell.toFixed(3)}" height="${cell.toFixed(3)}" rx="${rModule.toFixed(3)}" fill="${darkColor}"/>`;
        }
      }

      const fp1 = makeFinder(qrLeft,                             qrTop,                             cell);
      const fp2 = makeFinder(qrLeft + (moduleCount - 7) * cell,  qrTop,                             cell);
      const fp3 = makeFinder(qrLeft,                             qrTop + (moduleCount - 7) * cell,  cell);

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${docW}mm" height="${docH.toFixed(3)}mm" viewBox="0 0 ${docW} ${docH.toFixed(3)}">
  <rect width="${docW}" height="${docH.toFixed(3)}" fill="#ffffff"/>
  <text x="${(docW/2).toFixed(3)}" y="6.2"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="3.2" font-style="italic" font-weight="bold"
    fill="${darkColor}" text-anchor="middle">Uma vida, muitas mem&#243;rias.</text>
  ${modulePaths}
  ${fp1}${fp2}${fp3}
  <circle cx="${logoCX.toFixed(3)}" cy="${logoCY.toFixed(3)}" r="${(logoR + 0.3).toFixed(3)}" fill="#ffffff"/>
  <circle cx="${logoCX.toFixed(3)}" cy="${logoCY.toFixed(3)}" r="${logoR.toFixed(3)}" fill="#ffffff"/>
  <defs>
    <clipPath id="logoClip">
      <circle cx="${logoCX.toFixed(3)}" cy="${logoCY.toFixed(3)}" r="${logoR.toFixed(3)}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#logoClip)">
    <g transform="${logoTransform}">${LOGO_PATHS}</g>
  </g>
  <text x="${(docW/2).toFixed(3)}" y="${(qrTop + qrAreaH + urlH * 0.65).toFixed(3)}"
    font-family="'Courier New', Courier, monospace"
    font-size="1.6" fill="${grayColor}" text-anchor="middle">${esc(memorialUrl)}</text>
</svg>`;

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.download = `placa-${slug}-vetorizado.svg`;
      a.href     = url;
      a.click();
      URL.revokeObjectURL(url);
    };

    if (window.qrcode) {
      doGenerate();
    } else {
      const s2 = document.createElement('script');
      s2.src    = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
      s2.onload = doGenerate;
      document.head.appendChild(s2);
    }
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