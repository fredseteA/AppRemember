import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from "react-i18next";

const BackButton = () => {

    const navigate  = useNavigate();
    const { t }     = useTranslation();

    return (
        <button
        onClick={() => navigate(-1)}
        style={{
            position: 'fixed',
            top: 'clamp(14px, 3vw, 20px)',
            left: 'clamp(14px, 3vw, 20px)',
            zIndex: 50,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 16px 9px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.88)',
            boxShadow: '0 4px 18px rgba(26,39,68,0.12)',
            cursor: 'pointer',
            fontFamily: '"Georgia", serif',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#2a3d5e',
            letterSpacing: '0.05em',
            transition: 'background 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease',
            WebkitTapHighlightColor: 'transparent',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.92)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 22px rgba(26,39,68,0.16)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.72)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(26,39,68,0.12)';
        }}
        >
        <ArrowLeft size={15} style={{ flexShrink: 0 }} />
        {t('memorial.back')}
        </button>
    )
};

export default BackButton;