import {XCircle} from 'lucide-react';

// ─── Modal cancelamento ───────────────────────────────────────────────────────
const CancelModal = ({ orderId, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-[#16202e] border border-red-500/30 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <XCircle className="text-red-400" size={24} />
        <h3 className="text-lg font-semibold text-white">Cancelar Pedido</h3>
      </div>
      <p className="text-[#94a3b8] text-sm mb-6">
        Tem certeza que deseja cancelar este pedido? Um email será enviado ao cliente
        informando o cancelamento e o reembolso em até 7 dias úteis.
        <br /><br />
        <span className="text-red-400 font-medium">Esta ação não pode ser desfeita.</span>
      </p>
      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-[#2d3a52] text-[#94a3b8] rounded-lg text-sm font-medium hover:bg-[#3d4a62] transition-colors">
          Voltar
        </button>
        <button onClick={() => { onConfirm(orderId, 'cancel'); onClose(); }}
          className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
          Confirmar Cancelamento
        </button>
      </div>
    </div>
  </div>
);

export default CancelModal;