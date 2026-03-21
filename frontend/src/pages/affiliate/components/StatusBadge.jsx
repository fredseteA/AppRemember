import { COMMISSION_STATUS } from "../constants/index";

function StatusBadge({ status }) {
  const cfg = COMMISSION_STATUS[status] || { label: status, color: '#9aaac0' };
  return <span style={{ background: `${cfg.color}18`, color: cfg.color, padding: '4px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{cfg.label}</span>;
}

export default StatusBadge;