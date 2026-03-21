import { useState, useEffect } from 'react';

function SummaryCard({ icon: Icon, label, value, sub, accent, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e8edf4', boxShadow: '0 2px 12px rgba(26,39,68,0.05)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '0.73rem', color: '#7a8aaa', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} style={{ color: accent }} /></div>
      </div>
      <p style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 700, color: '#1a2744', margin: 0, lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: '#9aaac0', marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

export default SummaryCard;