// "15 mar 2024" — usado em MemorialView e páginas de memorial
export const formatDateShort = (dateString) => {
  if (!dateString) return '';
  try {
    let date;
    if (dateString.includes('T')) {
      date = new Date(dateString);
    } else {
      const [year, month, day] = dateString.split('-');
      date = new Date(year, month - 1, day);
    }
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch { return dateString; }
};

// "15/03/2024" — usado na maioria das páginas admin
export const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

// "15/03/2024 14:30" — usado em AdminOrders, AdminLogs, AdminReviews
export const formatDateTime = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// "há 5 minutos" / "há 2 horas" / "há 3 dias" — usado em AdminNotifications
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (diff < 3600000)  return `há ${mins} minuto${mins !== 1 ? 's' : ''}`;
  if (diff < 86400000) return `há ${hours} hora${hours !== 1 ? 's' : ''}`;
  if (diff < 604800000) return `há ${days} dia${days !== 1 ? 's' : ''}`;
  return formatDate(dateString);
};

