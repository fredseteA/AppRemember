const TrustBadgesSection = () => {
  return (
    <section
    className="trust-section relative py-8 md:py-10 overflow-hidden"
    style={{
      background: "linear-gradient(180deg, #8ecce8 0%, #7bbde8 100%)",
      marginTop: 0,
      borderTop: "none",
    }}
    >
      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <div className="trust-badges flex flex-wrap justify-center items-center gap-5 sm:gap-8 md:gap-12">
          {[{ label: "Site Seguro" }, { label: "Compra pelo Mercado Pago" }, { label: "Entrega Rastreável" }].map(({ label }) => (
            <div
              key={label}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 18px", borderRadius: "999px",
                background: "rgba(255,255,255,0.52)",
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.75)",
                boxShadow: "0 2px 12px rgba(26,39,68,0.07)",
              }}
            >
              <svg style={{ width: 16, height: 16, color: "#3a9e6e", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span style={{ fontFamily: '"Georgia", serif', fontSize: "clamp(0.72rem, 3vw, 0.82rem)", fontWeight: 600, color: "#1a2744" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustBadgesSection;
