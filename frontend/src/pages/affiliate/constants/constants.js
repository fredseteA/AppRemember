const COMMISSION_STATUS = {
  pending:   { label: 'Pendente',   color: '#f59e0b', desc: 'Aguardando entrega do pedido' },
  available: { label: 'Disponível', color: '#8b5cf6', desc: 'Pronta para recebimento' },
  paid:      { label: 'Paga',       color: '#16a34a', desc: 'Já recebida' },
  canceled:  { label: 'Cancelada',  color: '#ef4444', desc: 'Pedido cancelado' },
};

const PLAN_LABELS = { digital: 'Digital', plaque: 'Placa QR', qrcode_plaque: 'Placa QR', complete: 'Completo' };

const STATUS_CONFIG = {
  approved:      { label: 'Aprovado',  color: '#16a34a' },
  paid:          { label: 'Pago',      color: '#16a34a' },
  in_production: { label: 'Produção',  color: '#8b5cf6' },
  produced:      { label: 'Produzido', color: '#3b82f6' },
  shipped:       { label: 'Enviado',   color: '#f59e0b' },
  entregue:      { label: 'Entregue',  color: '#16a34a' },
  cancelled:     { label: 'Cancelado', color: '#ef4444' },
  pending:       { label: 'Pendente',  color: '#9aaac0' },
};

const LEVELS = [
  { min: 0,  max: 9,        rate: 10, label: 'Iniciante', color: '#64748b' },
  { min: 10, max: 19,       rate: 15, label: 'Crescendo', color: '#3b82f6' },
  { min: 20, max: Infinity, rate: 20, label: 'Expert',    color: '#f59e0b' },
];

export default { COMMISSION_STATUS, PLAN_LABELS, STATUS_CONFIG, LEVELS };
