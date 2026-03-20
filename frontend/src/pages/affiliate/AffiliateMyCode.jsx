import { useState, useEffect, useRef, useCallback } from 'react';
import AffiliateLayout from './layouts/AffiliateLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { QrCode, Copy, Check, RefreshCw, Link2, BarChart2, Download, Share2 } from 'lucide-react';
import { API, FRONTEND_URL} from '@/config';

function useQRCode(text, size = 200) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!text || !containerRef.current) return;
    const loadQR = () => {
      if (window.QRCode) {
        containerRef.current.innerHTML = '';
        new window.QRCode(containerRef.current, { text, width: size, height: size, colorDark: '#1a2744', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.H });
        setReady(true);
      }
    };
    if (window.QRCode) { loadQR(); } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      script.onload = loadQR;
      document.head.appendChild(script);
    }
  }, [text, size]);
  return { containerRef, ready };
}

function downloadQR(containerRef, filename) {
  if (!containerRef.current) return;
  const canvas = containerRef.current.querySelector('canvas');
  const img = containerRef.current.querySelector('img');
  if (canvas) { const link = document.createElement('a'); link.download = filename; link.href = canvas.toDataURL('image/png'); link.click(); }
  else if (img) { const link = document.createElement('a'); link.download = filename; link.href = img.src; link.click(); }
}

function StatPill({ label, value, accent }) {
  return (
    <div style={{ background: `${accent}10`, border: `1px solid ${accent}30`, borderRadius: 12, padding: '14px 20px', textAlign: 'center', flex: 1, minWidth: 100 }}>
      <p style={{ fontFamily: '"Georgia", serif', fontSize: '1.6rem', fontWeight: 700, color: accent, margin: 0, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '0.73rem', color: '#7a8aaa', margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</p>
    </div>
  );
}

function CopyButton({ text, label = 'Copiar', style: extraStyle = {} }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  return (
    <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: copied ? '#f0fdf4' : '#fff', border: copied ? '1px solid #86efac' : '1px solid #e8edf4', borderRadius: 10, cursor: 'pointer', color: copied ? '#16a34a' : '#5a6a8a', fontSize: '0.83rem', fontFamily: '"Georgia", serif', fontWeight: copied ? 600 : 400, transition: 'all 0.2s', whiteSpace: 'nowrap', ...extraStyle }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copiado!' : label}
    </button>
  );
}

export default function AffiliateMyCode() {
  const { user, getToken } = useAuth(); 
  const [partner, setPartner] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken(); 
      const headers = { Authorization: `Bearer ${token}` };
      const [partnerRes, salesRes] = await Promise.all([
        axios.get(`${API}/affiliate/me`, { headers }),
        axios.get(`${API}/affiliate/sales`, { headers }),
      ]);
      setPartner(partnerRes.data);
      setSales(salesRes.data?.sales || []);
    } catch (e) {
      console.error('MeuCodigo erro:', e?.response?.data || e.message);
      setError('Não foi possível carregar seus dados.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setTimeout(() => setVisible(true), 100);
    }
  }, [getToken]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);
  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const code = partner?.supporter_code || '';
  const referralLink = code ? `${FRONTEND_URL}/?apoio=${code}` : '';
  const { containerRef: qrRef, ready: qrReady } = useQRCode(referralLink, 200);

  const totalUses = sales.filter(s => s.status !== 'cancelled').length;
  const totalRevenue = sales.filter(s => !['cancelled', 'pending'].includes(s.status)).reduce((a, s) => a + (s.final_amount || s.amount || 0), 0);
  const totalCommission = sales.reduce((a, s) => a + (s.commission_amount || 0), 0);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Remember QRCode', text: `Use meu código ${code} e ganhe desconto em memórias eternas ❤️`, url: referralLink }).catch(() => {});
    } else {
      navigator.clipboard.writeText(referralLink);
    }
  };

  if (loading) return (
    <AffiliateLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center', color: '#7a8aaa' }}>
          <RefreshCw size={26} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '0.88rem', marginTop: 12 }}>Carregando...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AffiliateLayout>
  );

  if (error) return (
    <AffiliateLayout>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', border: '1px solid #fecaca' }}>
        <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>
        <button onClick={handleRefresh} style={{ padding: '10px 24px', background: '#1a2744', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: '"Georgia", serif' }}>Tentar novamente</button>
      </div>
    </AffiliateLayout>
  );

  return (
    <AffiliateLayout>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <QrCode size={22} style={{ color: '#5aa8e0' }} />
              <h1 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.3rem,3vw,1.7rem)', fontWeight: 700, color: '#1a2744', margin: 0 }}>Meu Código</h1>
            </div>
            <p style={{ color: '#5a6a8a', fontSize: '0.86rem', margin: 0 }}>Compartilhe seu código e ganhe comissão em cada venda.</p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#fff', border: '1px solid #e8edf4', borderRadius: 10, cursor: 'pointer', color: '#5a6a8a', fontSize: '0.82rem', fontFamily: '"Georgia", serif' }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Atualizar
          </button>
        </div>

        {/* Card principal */}
        <div style={{ background: 'linear-gradient(135deg, #0f1f3d 0%, #1a3461 100%)', borderRadius: 20, padding: 'clamp(24px, 5vw, 40px)', marginBottom: 20, position: 'relative', overflow: 'hidden', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(90,168,224,0.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(90,168,224,0.05)', pointerEvents: 'none' }} />
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Seu código de affiliate</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '16px 28px', flex: 1, minWidth: 140 }}>
              <p style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 700, color: '#5aa8e0', margin: 0, letterSpacing: '0.08em', wordBreak: 'break-all' }}>{code}</p>
            </div>
            <CopyButton text={code} label="Copiar código" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 20px' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <StatPill label="Usos totais"  value={totalUses}                    accent="#5aa8e0" />
            <StatPill label="Vendido"      value={`R$${totalRevenue.toFixed(0)}`}    accent="#34d399" />
            <StatPill label="Comissões"    value={`R$${totalCommission.toFixed(0)}`} accent="#f59e0b" />
          </div>
        </div>

        {/* Link de referência */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8edf4', padding: '22px 24px', marginBottom: 20, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Link2 size={17} style={{ color: '#5aa8e0' }} />
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '1rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>Link de indicação</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', borderRadius: 10, border: '1px solid #e8edf4', padding: '10px 14px', marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ flex: 1, fontSize: '0.82rem', color: '#5a6a8a', fontFamily: 'monospace', wordBreak: 'break-all', minWidth: 0 }}>{referralLink}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <CopyButton text={referralLink} label="Copiar link" />
            <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: '#1a2744', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: '0.83rem', fontFamily: '"Georgia", serif', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <Share2 size={14} /> Compartilhar
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8edf4', padding: '22px 24px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <QrCode size={17} style={{ color: '#5aa8e0' }} />
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '1rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>QR Code do seu link</h2>
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e8edf4', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 240, minHeight: 240, position: 'relative' }}>
              {!qrReady && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw size={20} style={{ color: '#9aaac0', animation: 'spin 1s linear infinite' }} /></div>}
              <div ref={qrRef} style={{ opacity: qrReady ? 1 : 0, transition: 'opacity 0.3s' }} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ color: '#5a6a8a', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 20 }}>Este QR Code leva diretamente ao site com seu código de affiliate já aplicado. Ideal para cartões, posts, panfletos e stories.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => downloadQR(qrRef, `qrcode-affiliate-${code}.png`)} disabled={!qrReady} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', background: qrReady ? '#1a2744' : '#e8edf4', color: qrReady ? '#fff' : '#9aaac0', border: 'none', borderRadius: 10, cursor: qrReady ? 'pointer' : 'not-allowed', fontSize: '0.83rem', fontFamily: '"Georgia", serif', width: 'fit-content' }} onMouseEnter={e => { if (qrReady) e.currentTarget.style.opacity = '0.85'; }} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <Download size={14} /> Baixar QR Code (PNG)
                </button>
                <CopyButton text={referralLink} label="Copiar link do QR" />
              </div>
              <div style={{ marginTop: 20, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: '0.78rem', color: '#3b82f6', margin: 0, lineHeight: 1.5 }}>💡 <strong>Dica:</strong> Compartilhe nas redes sociais, WhatsApp ou imprima para usar offline. Cada scan conta como uso do seu código!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Uso do código */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8edf4', padding: '18px 24px', marginTop: 20, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart2 size={17} style={{ color: '#5aa8e0' }} />
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '1rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>Uso do código</h2>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'Total de usos', value: totalUses, color: '#5aa8e0' },
              { label: 'Usos este mês', value: sales.filter(s => {
                if (!s.created_at || s.status === 'cancelled') return false;
                const d = new Date(s.created_at); const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length, color: '#8b5cf6' },
              { label: 'Cancelamentos', value: sales.filter(s => s.status === 'cancelled').length, color: '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, minWidth: 120, background: `${color}08`, border: `1px solid ${color}25`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ fontFamily: '"Georgia", serif', fontSize: '1.7rem', fontWeight: 700, color, margin: 0 }}>{value}</p>
                <p style={{ fontSize: '0.73rem', color: '#7a8aaa', margin: '5px 0 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AffiliateLayout>
  );
}