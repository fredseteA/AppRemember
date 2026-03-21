import { useState, useEffect, useCallback } from "react";
import AddressForm, { isAddressComplete } from "./AddressForm";
import SecurityBadge from "../shared/SecurityBadge";

export default function AddressCheckStep({ authToken, apiBase, onAddressReady, onBack }) {
  const [phase, setPhase]               = useState("loading");
  const [savedAddress, setSavedAddress] = useState(null);
  const [editing, setEditing]           = useState(false);
  const [error, setError]               = useState("");

  const fetchAddress = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const res = await fetch(`${apiBase}/auth/me/address`, {
        headers: { Authorization: `Bearer ${typeof authToken === 'function' ? await authToken() : authToken}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar endereço.");
      const data = await res.json();
      if (data.has_address && isAddressComplete(data.address)) {
        setSavedAddress(data.address);
        setPhase("confirm");
      } else {
        setPhase("form");
      }
    } catch (e) {
      setError(e.message || "Erro ao verificar endereço.");
      setPhase("form");
    }
  }, [authToken, apiBase]);

  useEffect(() => { fetchAddress(); }, [fetchAddress]);

  const saveAddressAndContinue = async (addressData) => {
    setError("");
    try {
      const res = await fetch(`${apiBase}/auth/me/address`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${typeof authToken === 'function' ? await authToken() : authToken}`,
        },
        body: JSON.stringify(addressData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Erro ao salvar endereço.");
      }
      onAddressReady(addressData);
    } catch (e) {
      setError(e.message || "Erro ao salvar endereço.");
      throw e;
    }
  };

  const confirmExistingAddress = () => { onAddressReady(savedAddress); };

  if (phase === "loading") {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Verificando endereço salvo...</p>
      </div>
    );
  }

  if (phase === "confirm" && !editing) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.infoBanner}>
          <span style={styles.infoBannerIcon}>✅</span>
          <div>
            <strong style={styles.infoBannerTitle}>Endereço encontrado</strong>
            <p style={styles.infoBannerSub}>
              Encontramos o endereço salvo no seu perfil. Confirme ou edite antes de continuar.
            </p>
          </div>
        </div>

        <div style={styles.addressCard}>
          <div style={styles.addressCardHeader}>
            <span style={{ fontSize: 20 }}>📦</span>
            <span style={styles.addressCardTitle}>Endereço de entrega</span>
          </div>
          <AddressRow icon="👤" label="Destinatário"  value={savedAddress.recipient_name} />
          <AddressRow icon="📱" label="Telefone"       value={savedAddress.phone} />
          <AddressRow
            icon="📍"
            label="Endereço"
            value={[
              `${savedAddress.street}, ${savedAddress.number}`,
              savedAddress.complement,
              savedAddress.neighborhood,
              `${savedAddress.city} — ${savedAddress.state}`,
              `CEP: ${savedAddress.zip_code}`,
            ].filter(Boolean).join(", ")}
          />
        </div>

        {error && <p style={styles.errorMsg}>{error}</p>}

        <SecurityBadge variant="card" />

        <div style={styles.actions}>
          {onBack && (
            <button onClick={onBack} style={styles.btnBack}>← Voltar</button>
          )}
          <button onClick={() => setEditing(true)} style={styles.btnEdit}>✏️ Editar endereço</button>
          <button onClick={confirmExistingAddress} style={styles.btnConfirm}>Confirmar e continuar →</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {editing ? (
        <div style={{ ...styles.infoBanner, background: "#fffbeb", borderColor: "#fcd34d" }}>
          <span style={styles.infoBannerIcon}>✏️</span>
          <div>
            <strong style={styles.infoBannerTitle}>Editando endereço</strong>
            <p style={styles.infoBannerSub}>
              Ao salvar, o endereço será atualizado no seu perfil e usado neste pedido.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ ...styles.infoBanner, background: "#fef2f2", borderColor: "#fca5a5" }}>
          <span style={styles.infoBannerIcon}>📋</span>
          <div>
            <strong style={styles.infoBannerTitle}>Endereço de entrega necessário</strong>
            <p style={styles.infoBannerSub}>
              Preencha o endereço para receber sua placa. Ele será salvo no seu perfil para futuras compras.
            </p>
          </div>
        </div>
      )}

      {error && <p style={styles.errorMsg}>{error}</p>}

      <SecurityBadge variant="card" />

      <AddressForm
        initialData={editing ? savedAddress : null}
        onSave={saveAddressAndContinue}
        onCancel={editing ? () => setEditing(false) : onBack}
        submitLabel={editing ? "Salvar e continuar →" : "Salvar endereço e continuar →"}
        title={editing ? "Editar endereço de entrega" : "Novo endereço de entrega"}
      />
    </div>
  );
}

function AddressRow({ icon, label, value }) {
  return (
    <div style={styles.addressRow}>
      <span style={styles.addressRowIcon}>{icon}</span>
      <div>
        <span style={styles.addressRowLabel}>{label}</span>
        <span style={styles.addressRowValue}>{value}</span>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: 16 },
  centered: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", gap: 12 },
  spinner: { width: 32, height: 32, border: "3px solid #e5e7eb", borderTop: "3px solid #5B8FB9", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingText: { color: "#6b7280", fontSize: 14, margin: 0 },
  infoBanner: { display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10 },
  infoBannerIcon: { fontSize: 20, lineHeight: 1, marginTop: 2 },
  infoBannerTitle: { display: "block", fontSize: 14, color: "#111827", marginBottom: 2 },
  infoBannerSub: { margin: 0, fontSize: 13, color: "#4b5563" },
  addressCard: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px", display: "flex", flexDirection: "column", gap: 12 },
  addressCardHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
  addressCardTitle: { fontWeight: 700, fontSize: 15, color: "#111827" },
  addressRow: { display: "flex", alignItems: "flex-start", gap: 10 },
  addressRowIcon: { fontSize: 16, marginTop: 1 },
  addressRowLabel: { display: "block", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 1 },
  addressRowValue: { display: "block", fontSize: 14, color: "#374151", lineHeight: 1.5 },
  errorMsg: { background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", color: "#dc2626", fontSize: 13, margin: 0 },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", paddingTop: 4 },
  btnBack: { padding: "10px 16px", background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, cursor: "pointer", marginRight: "auto" },
  btnEdit: { padding: "10px 18px", background: "transparent", color: "#5B8FB9", border: "1px solid #5B8FB9", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnConfirm: { padding: "10px 24px", background: "#5B8FB9", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" },
};