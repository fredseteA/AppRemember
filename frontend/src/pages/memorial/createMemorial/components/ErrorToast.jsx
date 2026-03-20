import { RefreshCw, X, AlertTriangle, WifiOff, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const parseSubmitError = (error) => {
  // Sem resposta do servidor = problema de rede ou timeout
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        icon: <Clock size={18} />,
        title: 'O servidor demorou para responder',
        detail: 'Sua conexão está lenta ou o servidor está sobrecarregado.',
        action: 'Aguarde alguns segundos e tente novamente.',
        canRetry: true,
        type: 'timeout',
      };
    }
    if (!navigator.onLine) {
      return {
        icon: <WifiOff size={18} />,
        title: 'Sem conexão com a internet',
        detail: 'Verifique sua conexão Wi-Fi ou dados móveis.',
        action: 'Reconecte-se e tente novamente. Seus dados foram preservados.',
        canRetry: true,
        type: 'offline',
      };
    }
    return {
      icon: <WifiOff size={18} />,
      title: 'Não foi possível conectar ao servidor',
      detail: 'O servidor pode estar temporariamente fora do ar.',
      action: 'Aguarde alguns minutos e tente novamente.',
      canRetry: true,
      type: 'network',
    };
  }

  const status = error.response?.status;
  const detail = error.response?.data?.detail;

  // 401 — token expirado ou inválido
  if (status === 401) {
    return {
      icon: <AlertTriangle size={18} />,
      title: 'Sua sessão expirou',
      detail: 'Você ficou muito tempo sem atividade e sua sessão foi encerrada.',
      action: 'Faça login novamente. Seus dados do formulário foram preservados.',
      canRetry: false,
      type: 'auth',
    };
  }

  // 403 — sem permissão
  if (status === 403) {
    return {
      icon: <AlertTriangle size={18} />,
      title: 'Acesso não autorizado',
      detail: 'Você não tem permissão para realizar esta ação.',
      action: 'Tente sair e entrar novamente na sua conta.',
      canRetry: false,
      type: 'forbidden',
    };
  }

  // 422 — validação do Pydantic (dados inválidos enviados)
  if (status === 422) {
    // detail pode ser string ou lista de erros do Pydantic
    let fieldErrors = '';
    if (Array.isArray(detail)) {
      fieldErrors = detail.map(e => {
        const field = e.loc?.slice(-1)[0] || 'campo';
        return `• ${field}: ${e.msg}`;
      }).join('\n');
    }
    return {
      icon: <AlertTriangle size={18} />,
      title: 'Dados inválidos',
      detail: fieldErrors || 'Alguns campos do formulário contêm informações inválidas.',
      action: 'Revise os dados preenchidos e tente novamente.',
      canRetry: false,
      type: 'validation',
    };
  }

  // 429 — rate limit
  if (status === 429) {
    return {
      icon: <Clock size={18} />,
      title: 'Muitas tentativas',
      detail: 'Você fez muitas requisições em pouco tempo.',
      action: 'Aguarde 1 minuto antes de tentar novamente.',
      canRetry: true,
      type: 'ratelimit',
    };
  }

  // 500+ — erro interno do servidor
  if (status >= 500) {
    return {
      icon: <AlertTriangle size={18} />,
      title: 'Erro interno no servidor',
      detail: 'Ocorreu um erro inesperado no nosso sistema.',
      action: 'Aguarde alguns minutos e tente novamente. Se persistir, entre em contato com o suporte.',
      canRetry: true,
      type: 'server',
    };
  }

  // Fallback genérico com detalhe do backend se disponível
  return {
    icon: <AlertTriangle size={18} />,
    title: 'Erro ao criar memorial',
    detail: typeof detail === 'string' ? detail : 'Ocorreu um erro inesperado.',
    action: 'Tente novamente. Se o problema persistir, entre em contato com o suporte.',
    canRetry: true,
    type: 'unknown',
  };
}

export const showErrorToast = (error, onRetry) => {
  const parsed = parseSubmitError(error);

  toast.custom((id) => (
    <div style={{
      background: 'white',
      border: '1px solid rgba(239,68,68,0.2)',
      borderLeft: '4px solid #ef4444',
      borderRadius: 14,
      padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      maxWidth: 400,
      width: '100%',
      fontFamily: '"Georgia", serif',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#ef4444',
        }}>
          {parsed.icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: '#1a2744', fontSize: '0.88rem', margin: '0 0 3px', lineHeight: 1.3 }}>
            {parsed.title}
          </p>
          {parsed.detail && (
            <p style={{ color: '#6b7f99', fontSize: '0.75rem', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {parsed.detail}
            </p>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, flexShrink: 0 }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Ação */}
      <div style={{
        background: 'rgba(239,68,68,0.05)',
        borderRadius: 8,
        padding: '8px 10px',
        marginBottom: parsed.canRetry && onRetry ? 10 : 0,
      }}>
        <p style={{ color: '#374151', fontSize: '0.73rem', margin: 0, lineHeight: 1.55 }}>
          <strong>O que fazer:</strong> {parsed.action}
        </p>
      </div>

      {/* Botão de retry */}
      {parsed.canRetry && onRetry && (
        <button
          onClick={() => { toast.dismiss(id); onRetry(); }}
          style={{
            width: '100%', marginTop: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 0', borderRadius: 8,
            background: '#1a2744', color: 'white', border: 'none',
            fontFamily: '"Georgia", serif', fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.05em', cursor: 'pointer',
          }}
        >
          <RefreshCw size={12} /> Tentar novamente
        </button>
      )}
    </div>
  ), { duration: parsed.canRetry ? 8000 : 12000 });
}

