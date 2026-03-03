import React from "react";

/**
 * DeliveryAddressPanel
 *
 * Exibe o snapshot do endereço de entrega dentro da página de detalhes do pedido
 * no painel administrativo. Só renderiza para planos físicos.
 *
 * Props:
 *   order — objeto do pedido vindo da API (/admin/orders/:id)
 *
 * Uso:
 *   <DeliveryAddressPanel order={orderData} />
 *
 * O componente detecta automaticamente se é plano físico e se há snapshot.
 */

const PHYSICAL_PLAN_TYPES = new Set(["plaque", "complete", "qrcode_plaque"]);

export default function DeliveryAddressPanel({ order }) {
  if (!order) return null;

  const isPhysical = PHYSICAL_PLAN_TYPES.has(order.plan_type);
  if (!isPhysical) return null;

  const addr = order.delivery_address_snapshot;

  // Plano físico mas sem snapshot (pedido antigo ou incompleto)
  if (!addr) {
    return (
      <div style={styles.card}>
        <SectionHeader />
        <div style={styles.missing}>
          <span style={styles.missingIcon}>⚠️</span>
          <div>
            <strong style={styles.missingTitle}>Endereço não registrado</strong>
            <p style={styles.missingText}>
              Este pedido não possui snapshot de endereço. Pode ter sido criado antes desta funcionalidade
              ou com endereço incompleto. Entre em contato com o cliente para confirmar o endereço de entrega.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fullAddress = [
    `${addr.street}${addr.number ? `, ${addr.number}` : ""}`,
    addr.complement,
    addr.neighborhood,
    `${addr.city} — ${addr.state}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div style={styles.card}>
      <SectionHeader />

      {/* Grid de informações */}
      <div style={styles.grid}>
        <InfoItem
          label="Destinatário"
          value={addr.recipient_name}
          icon="👤"
          highlight
        />
        <InfoItem
          label="Telefone"
          value={addr.phone}
          icon="📱"
        />
        <InfoItem
          label="CEP"
          value={addr.zip_code}
          icon="🗺️"
        />
        <InfoItem
          label="Endereço completo"
          value={fullAddress}
          icon="📍"
          fullWidth
        />
      </div>

      {/* Rodapé — alerta sobre imutabilidade do snapshot */}
      <div style={styles.footer}>
        <span style={styles.footerIcon}>🔒</span>
        <p style={styles.footerText}>
          Endereço registrado no momento da compra. Alterações no perfil do cliente não afetam este pedido.
        </p>
      </div>

      {/* Botão copiar endereço para clipboard */}
      <CopyAddressButton address={addr} />
    </div>
  );
}

// ─── Cabeçalho da seção ─────────────────────────────────────────────────────
function SectionHeader() {
  return (
    <div style={styles.header}>
      <span style={styles.headerBadge}>📦</span>
      <div>
        <h3 style={styles.headerTitle}>Endereço de Entrega</h3>
        <p style={styles.headerSub}>Dados registrados no pedido (snapshot imutável)</p>
      </div>
    </div>
  );
}

// ─── Item de informação ──────────────────────────────────────────────────────
function InfoItem({ label, value, icon, highlight = false, fullWidth = false }) {
  return (
    <div
      style={{
        ...styles.infoItem,
        ...(fullWidth ? styles.infoItemFull : {}),
        ...(highlight ? styles.infoItemHighlight : {}),
      }}
    >
      <div style={styles.infoLabelRow}>
        <span style={styles.infoIcon}>{icon}</span>
        <span style={styles.infoLabel}>{label}</span>
      </div>
      <span
        style={{
          ...styles.infoValue,
          ...(highlight ? styles.infoValueHighlight : {}),
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

// ─── Botão copiar endereço ───────────────────────────────────────────────────
function CopyAddressButton({ address }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = [
      `Destinatário: ${address.recipient_name}`,
      `Telefone: ${address.phone}`,
      `CEP: ${address.zip_code}`,
      `${address.street}, ${address.number}${address.complement ? ` (${address.complement})` : ""}`,
      `${address.neighborhood}`,
      `${address.city} — ${address.state}`,
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button onClick={handleCopy} style={styles.copyBtn}>
      {copied ? "✅ Copiado!" : "📋 Copiar endereço"}
    </button>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 20px",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
  },
  headerBadge: {
    fontSize: 24,
  },
  headerTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
  },
  headerSub: {
    margin: 0,
    fontSize: 12,
    color: "#9ca3af",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 0,
    padding: "4px 0",
  },
  infoItem: {
    flex: "1 1 200px",
    padding: "14px 20px",
    borderBottom: "1px solid #f3f4f6",
  },
  infoItemFull: {
    flex: "1 1 100%",
  },
  infoItemHighlight: {
    background: "#f0f9ff",
  },
  infoLabelRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  infoValue: {
    display: "block",
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.5,
  },
  infoValueHighlight: {
    fontWeight: 700,
    color: "#0369a1",
    fontSize: 15,
  },
  footer: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "10px 20px",
    background: "#fffbeb",
    borderTop: "1px solid #fde68a",
  },
  footerIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  footerText: {
    margin: 0,
    fontSize: 12,
    color: "#92400e",
    lineHeight: 1.5,
  },
  missing: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "20px",
    background: "#fffbeb",
  },
  missingIcon: {
    fontSize: 22,
  },
  missingTitle: {
    display: "block",
    fontSize: 14,
    color: "#92400e",
    marginBottom: 4,
  },
  missingText: {
    margin: 0,
    fontSize: 13,
    color: "#78350f",
    lineHeight: 1.5,
  },
  copyBtn: {
    display: "block",
    margin: "0 20px 16px auto",
    padding: "7px 16px",
    background: "transparent",
    color: "#5B8FB9",
    border: "1px solid #5B8FB9",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};
