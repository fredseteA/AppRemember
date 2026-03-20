import { useState } from "react";

const REQUIRED_FIELDS = [
  "recipient_name",
  "phone",
  "zip_code",
  "street",
  "number",
  "neighborhood",
  "city",
  "state",
];

const EMPTY_ADDRESS = {
  recipient_name: "",
  phone: "",
  zip_code: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

// Verifica se um objeto de endereço está completo
export function isAddressComplete(address) {
  if (!address) return false;
  return REQUIRED_FIELDS.every((f) => address[f] && String(address[f]).trim() !== "");
}

// Formata CEP enquanto digita: 00000-000
function formatZip(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

// Formata telefone: (00) 00000-0000
function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length > 10) {
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  } else if (digits.length > 6) {
    return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  } else if (digits.length > 2) {
    return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  }
  return digits;
}

/**
 * AddressForm
 *
 * Props:
 *   initialData   — objeto de endereço pré-preenchido (pode ser null/undefined)
 *   onSave        — async (addressData) => void   chamado ao confirmar
 *   onCancel      — () => void                     chamado ao cancelar (opcional)
 *   loading       — bool   desabilita formulário durante operação externa
 *   submitLabel   — string  texto do botão de confirmação (padrão: "Salvar endereço")
 *   title         — string  título do card (padrão: "Endereço de entrega")
 */
export default function AddressForm({
  initialData = null,
  onSave,
  onCancel,
  loading = false,
  submitLabel = "Salvar endereço",
  title = "Endereço de entrega",
}) {
  const [form, setForm] = useState({ ...EMPTY_ADDRESS, ...(initialData || {}) });
  const [errors, setErrors] = useState({});
  const [fetchingCep, setFetchingCep] = useState(false);
  const [cepError, setCepError] = useState("");
  const [saving, setSaving] = useState(false);

  // Atualização genérica de campo
  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Busca CEP via ViaCEP
  const handleZipChange = async (raw) => {
    const formatted = formatZip(raw);
    set("zip_code", formatted);
    setCepError("");

    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 8) {
      setFetchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (data.erro) {
          setCepError("CEP não encontrado.");
        } else {
          setForm((prev) => ({
            ...prev,
            street:       data.logradouro || prev.street,
            neighborhood: data.bairro     || prev.neighborhood,
            city:         data.localidade || prev.city,
            state:        data.uf         || prev.state,
            complement:   data.complemento || prev.complement,
          }));
          setErrors((prev) => ({
            ...prev,
            street: "", neighborhood: "", city: "", state: "",
          }));
        }
      } catch {
        setCepError("Erro ao buscar CEP. Preencha manualmente.");
      } finally {
        setFetchingCep(false);
      }
    }
  };

  // Validação local
  const validate = () => {
    const errs = {};
    REQUIRED_FIELDS.forEach((f) => {
      if (!form[f] || String(form[f]).trim() === "") {
        const labels = {
          recipient_name: "Nome do destinatário",
          phone:          "Telefone",
          zip_code:       "CEP",
          street:         "Rua",
          number:         "Número",
          neighborhood:   "Bairro",
          city:           "Cidade",
          state:          "Estado",
        };
        errs[f] = `${labels[f] || f} é obrigatório.`;
      }
    });
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...form });
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = loading || saving || fetchingCep;

  return (
    <div style={styles.card}>
      {/* Cabeçalho */}
      <div style={styles.header}>
        <span style={styles.headerIcon}>📦</span>
        <div>
          <h3 style={styles.headerTitle}>{title}</h3>
          <p style={styles.headerSub}>Informe onde sua placa deve ser entregue</p>
        </div>
      </div>

      {/* Destinatário + Telefone */}
      <div style={styles.row}>
        <Field
          label="Nome do destinatário *"
          placeholder="Nome completo de quem receberá"
          value={form.recipient_name}
          onChange={(v) => set("recipient_name", v)}
          error={errors.recipient_name}
          disabled={isDisabled}
          flex={2}
        />
        <Field
          label="Telefone *"
          placeholder="(00) 00000-0000"
          value={form.phone}
          onChange={(v) => set("phone", formatPhone(v))}
          error={errors.phone}
          disabled={isDisabled}
          flex={1}
        />
      </div>

      {/* CEP */}
      <div style={styles.row}>
        <div style={{ flex: 1, position: "relative" }}>
          <Field
            label="CEP *"
            placeholder="00000-000"
            value={form.zip_code}
            onChange={handleZipChange}
            error={errors.zip_code || cepError}
            disabled={isDisabled}
          />
          {fetchingCep && (
            <span style={styles.cepLoading}>🔍 Buscando...</span>
          )}
        </div>
        <div style={{ flex: 2 }} /> {/* espaço vazio para alinhar */}
      </div>

      {/* Rua + Número + Complemento */}
      <div style={styles.row}>
        <Field
          label="Rua / Logradouro *"
          placeholder="Nome da rua, avenida..."
          value={form.street}
          onChange={(v) => set("street", v)}
          error={errors.street}
          disabled={isDisabled}
          flex={3}
        />
        <Field
          label="Número *"
          placeholder="123"
          value={form.number}
          onChange={(v) => set("number", v)}
          error={errors.number}
          disabled={isDisabled}
          flex={1}
        />
      </div>

      <div style={styles.row}>
        <Field
          label="Complemento"
          placeholder="Apto, bloco, sala... (opcional)"
          value={form.complement}
          onChange={(v) => set("complement", v)}
          disabled={isDisabled}
          flex={2}
        />
        <Field
          label="Bairro *"
          placeholder="Nome do bairro"
          value={form.neighborhood}
          onChange={(v) => set("neighborhood", v)}
          error={errors.neighborhood}
          disabled={isDisabled}
          flex={2}
        />
      </div>

      {/* Cidade + Estado */}
      <div style={styles.row}>
        <Field
          label="Cidade *"
          placeholder="Nome da cidade"
          value={form.city}
          onChange={(v) => set("city", v)}
          error={errors.city}
          disabled={isDisabled}
          flex={3}
        />
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Estado *</label>
          <select
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
            disabled={isDisabled}
            style={{
              ...styles.input,
              ...(errors.state ? styles.inputError : {}),
              background: "#fff",
            }}
          >
            <option value="">UF</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <span style={styles.errorText}>{errors.state}</span>}
        </div>
      </div>

      {/* Botões */}
      <div style={styles.actions}>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isDisabled}
            style={styles.btnSecondary}
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          style={{
            ...styles.btnPrimary,
            opacity: isDisabled ? 0.6 : 1,
            cursor: isDisabled ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Salvando..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

// Campo genérico reutilizável
function Field({ label, placeholder, value, onChange, error, disabled, flex = 1 }) {
  return (
    <div style={{ flex, minWidth: 0 }}>
      <label style={styles.label}>{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          ...styles.input,
          ...(error ? styles.inputError : {}),
          opacity: disabled ? 0.7 : 1,
        }}
      />
      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  headerSub: {
    margin: 0,
    fontSize: 13,
    color: "#6b7280",
  },
  row: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  inputError: {
    borderColor: "#ef4444",
    background: "#fef2f2",
  },
  errorText: {
    display: "block",
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  cepLoading: {
    position: "absolute",
    right: 10,
    top: 32,
    fontSize: 12,
    color: "#6b7280",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
    paddingTop: 16,
    borderTop: "1px solid #f3f4f6",
  },
  btnPrimary: {
    padding: "10px 24px",
    background: "#5B8FB9",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  btnSecondary: {
    padding: "10px 20px",
    background: "transparent",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
};
