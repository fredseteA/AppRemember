function PhotoCard({ image, title, subtitle, badge, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        aspectRatio: '2 / 2',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
      }}
    >
      {/* Foto de fundo */}
      <img
        src={image}
        alt={title}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      {/* Badge — só renderiza se `badge` for passado */}
      {badge && (
        <div style={{
          position: 'absolute',
          top: 14,
          left: 14,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.35)',
          borderRadius: 99,
          padding: '5px 12px',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          lineHeight: 1,
          zIndex: 2,
        }}>
          {badge}
        </div>
      )}

      {/* Gradiente base → texto */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 38%, transparent 62%)',
        zIndex: 1,
      }} />

      {/* Texto */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '18px 18px 20px',
        zIndex: 2,
      }}>
        <h2 style={{
          margin: '0 0 4px',
          fontFamily: '"Georgia", serif',
          fontWeight: 700,
          fontSize: 'clamp(2rem, 4vw, 2rem)',
          color: '#fff',
          lineHeight: 1.5,
          textShadow: '0 1px 6px rgba(0,0,0,0.4)',
        }}>
          {title}
        </h2>
        <p style={{
          margin: 0,
          fontFamily: '"Georgia", serif',
          fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
          color: 'rgba(255,255,255,0.78)',
          lineHeight: 1.5,
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default PhotoCard;