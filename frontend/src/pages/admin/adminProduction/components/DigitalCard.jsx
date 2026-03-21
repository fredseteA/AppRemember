import { useState } from 'react';
import { ExternalLink,XCircle, Smartphone, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils';
import { CancelModal } from './index';
import { formatDate } from '@/utils';

const DIGITAL_STATUS = {
  approved:  { label: 'Ativo',     color: 'green' },
  paid:      { label: 'Ativo',     color: 'green' },
  cancelled: { label: 'Cancelado', color: 'red'   },
};

const DigitalCard = ({ order, onAction }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const statusConfig = DIGITAL_STATUS[order.status] || DIGITAL_STATUS.approved;
  const isCancelled  = order.status === 'cancelled';

  return (
    <>
      {showCancelModal && (
        <CancelModal orderId={order.id} onConfirm={onAction} onClose={() => setShowCancelModal(false)} />
      )}
      <div
        className={`bg-[#16202e] border rounded-xl p-5 transition-all ${
          isCancelled ? 'border-red-500/30 opacity-70' : 'border-[#2d3a52] hover:border-[#3b82f6]/30'
        }`}
        data-testid={`digital-card-${order.id}`}
      >
        {order.cancel_requested && !isCancelled && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 mb-4">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <p className="text-xs text-amber-400 font-medium">
              Cliente solicitou cancelamento em {formatDate(order.cancel_requested_at)}
            </p>
          </div>
        )}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-[#94a3b8] mb-1">Pedido #{order.id?.substring(0, 8)}</p>
            <h3 className="text-lg font-semibold text-white">{order.person_name || 'Memorial'}</h3>
          </div>
          <span className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
            bg-${statusConfig.color}-500/10 text-${statusConfig.color}-500 border border-${statusConfig.color}-500/20
          `}>
            {statusConfig.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[#2d3a52]">
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wide">Cliente</p>
            <p className="text-sm text-white font-medium mt-1 truncate">{order.user_email}</p>
          </div>
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wide">Valor</p>
            <p className="text-sm text-white font-medium mt-1">{formatCurrency(order.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wide">Plano</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Smartphone size={13} className="text-[#3b82f6]" />
              <p className="text-sm text-white font-medium">Digital</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wide">Data</p>
            <p className="text-sm text-white font-medium mt-1">{formatDate(order.created_at)}</p>
          </div>
        </div>
        {order.memorial_slug && (
          <div className="mb-4">
            <a href={`/memorial/${order.memorial_slug}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#3b82f6] hover:underline">
              <ExternalLink size={13} />
              Ver memorial
            </a>
          </div>
        )}
        {!isCancelled && (
          <button onClick={() => setShowCancelModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/5 border border-red-500/20 text-red-400 rounded-lg font-medium text-xs hover:bg-red-500/10 transition-colors"
            data-testid={`cancel-digital-${order.id}`}>
            <XCircle size={14} />
            Cancelar Pedido
          </button>
        )}
      </div>
    </>
  );
};

export default DigitalCard;