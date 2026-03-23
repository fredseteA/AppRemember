import { useState } from "react";
import { useTranslation } from "react-i18next";

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

export default function AddressForm({
  initialData = null,
  onSave,
  onCancel,
  loading = false,
  title = "Endereço de entrega",
}) {
  const [form, setForm] = useState({ ...EMPTY_ADDRESS, ...(initialData || {}) });
  const [errors, setErrors] = useState({});
  const [fetchingCep, setFetchingCep] = useState(false);
  const [cepError, setCepError] = useState("");
  const [saving, setSaving] = useState(false);
  const {t} = useTranslation()
  
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
          setCepError(t('userPages.profile.cepNotFound'));
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
            street: "",
            neighborhood: "",
            city: "",
            state: "",
          }));
        }
      } catch {
        setCepError(t('userPages.profile.cepFetchError'));
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
        errs[f] = t(`userPages.profile.validation.${f}`);
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
          <p style={styles.headerSub}>
            {t('userPages.profile.addressForm.sectionTitle')}
          </p>
        </div>
      </div>

      {/* Destinatário + Telefone */}
      <div style={styles.row}>
        <Field
          label={t('userPages.profile.addressForm.recipientNameLabel')}
          placeholder={t('userPages.profile.addressForm.recipientNamePlaceholder')}
          value={form.recipient_name}
          onChange={(v) => set("recipient_name", v)}
          error={errors.recipient_name}
          disabled={isDisabled}
          flex={2}
        />
        <Field
          label={t('userPages.profile.addressForm.phoneLabel')}
          placeholder={t('userPages.profile.addressForm.phonePlaceholder')}
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
            label={t('userPages.profile.addressForm.zipLabel')}
            placeholder={t('userPages.profile.addressForm.zipPlaceholder')}
            value={form.zip_code}
            onChange={handleZipChange}
            error={errors.zip_code || cepError}
            disabled={isDisabled}
          />
          {fetchingCep && (
            <span style={styles.cepLoading}>
              🔍 {t('userPages.profile.addressForm.searchingCep')}
            </span>
          )}
        </div>
        <div style={{ flex: 2 }} />
      </div>

      {/* Rua + Número */}
      <div style={styles.row}>
        <Field
          label={t('userPages.profile.addressForm.streetLabel')}
          placeholder={t('userPages.profile.addressForm.streetPlaceholder')}
          value={form.street}
          onChange={(v) => set("street", v)}
          error={errors.street}
          disabled={isDisabled}
          flex={3}
        />
        <Field
          label={t('userPages.profile.addressForm.numberLabel')}
          placeholder={t('userPages.profile.addressForm.numberPlaceholder')}
          value={form.number}
          onChange={(v) => set("number", v)}
          error={errors.number}
          disabled={isDisabled}
          flex={1}
        />
      </div>

      <div style={styles.row}>
        <Field
          label={t('userPages.profile.addressForm.complementLabel')}
          placeholder={t('userPages.profile.addressForm.complementPlaceholder')}
          value={form.complement}
          onChange={(v) => set("complement", v)}
          disabled={isDisabled}
          flex={2}
        />
        <Field
          label={t('userPages.profile.addressForm.neighborhoodLabel')}
          placeholder={t('userPages.profile.addressForm.neighborhoodPlaceholder')}
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
          label={t('userPages.profile.addressForm.cityLabel')}
          placeholder={t('userPages.profile.addressForm.cityPlaceholder')}
          value={form.city}
          onChange={(v) => set("city", v)}
          error={errors.city}
          disabled={isDisabled}
          flex={3}
        />
        <div style={{ flex: 1 }}>
          <label style={styles.label}>
            {t('userPages.profile.addressForm.stateLabel')}
          </label>
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
            <option value="">
              {t('userPages.profile.addressForm.statePlaceholder')}
            </option>
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
            {t('userPages.profile.addressForm.cancel')}
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
          {saving
            ? t('userPages.profile.saving')
            : t('userPages.profile.addressForm.saveAddressBtn')}
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
