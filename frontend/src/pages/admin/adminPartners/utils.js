export const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '-';

export const LEVELS = [
  { min: 0,  max: 9,        rate: 10, label: 'Iniciante', color: '#64748b' },
  { min: 10, max: 19,       rate: 15, label: 'Crescendo', color: '#3b82f6' },
  { min: 20, max: Infinity, rate: 20, label: 'Expert',    color: '#f59e0b' },
];

export const STATUS_LABEL = {
  pending:   { label: 'Pendente',   color: '#f59e0b' },
  available: { label: 'Disponível', color: '#3b82f6' },
  paid:      { label: 'Pago',       color: '#10b981' },
  canceled:  { label: 'Cancelado',  color: '#ef4444' },
};

