import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Bell, Check, CheckCheck, ShoppingCart, Package, Users, XCircle } from 'lucide-react';
import { formatRelativeTime } from '@/utils';
import { API } from '@/config';

const NOTIFICATION_ICONS = {
  new_order: ShoppingCart,
  production_pending: Package,
  partner_milestone: Users,
  cancellation_request: XCircle,
  default: Bell,
};

const NOTIFICATION_COLORS = {
  new_order: '#10b981',
  production_pending: '#f59e0b',
  partner_milestone: '#3b82f6',
  cancellation_request: '#ef4444',
  default: '#94a3b8',
};

const AdminNotifications = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch {
      toast.error('Erro ao carregar notificacoes');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/admin/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API}/admin/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('Todas as notificacoes marcadas como lidas');
    } catch {
      toast.error('Erro ao marcar notificacoes');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const cancelRequests = notifications.filter(n => n.type === 'cancellation_request' && !n.read).length;

  if (loading) {
    return (
      <div className="space-y-6" data-testid="notifications-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-[#16202e] rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-notifications">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">Sistema</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Notificacoes</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {cancelRequests > 0 && (
            <span className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-sm font-medium">
              {cancelRequests} cancelamento{cancelRequests > 1 ? 's' : ''} pendente{cancelRequests > 1 ? 's' : ''}
            </span>
          )}
          {unreadCount > 0 && (
            <span className="px-3 py-1.5 bg-[#3b82f6]/10 text-[#3b82f6] rounded-full text-sm font-medium">
              {unreadCount} nao lida{unreadCount > 1 ? 's' : ''}
            </span>
          )}
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center gap-2 px-4 py-2 bg-[#2d3a52] text-white rounded-lg text-sm font-medium hover:bg-[#374763] transition-colors" data-testid="mark-all-read-btn">
              <CheckCheck size={16} />
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-12 text-center">
          <Bell className="mx-auto mb-4 text-[#94a3b8]" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Sem notificacoes</h3>
          <p className="text-[#94a3b8]">Voce nao tem notificacoes no momento.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notification => {
            const Icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default;
            const color = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.default;
            const isCancelRequest = notification.type === 'cancellation_request';

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                  !notification.read
                    ? isCancelRequest
                      ? 'bg-[#16202e] border border-red-500/30 shadow-lg shadow-red-500/5'
                      : 'bg-[#16202e] border border-[#3b82f6]/30 shadow-lg shadow-[#3b82f6]/5'
                    : 'bg-[#16202e] border border-[#2d3a52]'
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
                data-testid={`notification-${notification.id}`}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={20} style={{ color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-semibold ${notification.read ? 'text-[#94a3b8]' : 'text-white'}`}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: color }} />
                    )}
                  </div>
                  <p className="text-sm text-[#94a3b8] mt-1">{notification.message}</p>

                  {isCancelRequest && notification.details && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {notification.details.user_email && (
                        <span className="text-xs bg-[#2d3a52] text-[#94a3b8] px-2 py-1 rounded-md">
                          {notification.details.user_email}
                        </span>
                      )}
                      {notification.details.plan_type && (
                        <span className="text-xs bg-[#2d3a52] text-[#94a3b8] px-2 py-1 rounded-md">
                          Plano {notification.details.plan_type}
                        </span>
                      )}
                      {notification.details.amount && (
                        <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-md">
                          R$ {Number(notification.details.amount).toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-[#94a3b8]/60 mt-2">{formatRelativeTime(notification.created_at)}</p>
                </div>

                {!notification.read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                    className="p-2 rounded-lg hover:bg-[#2d3a52] text-[#94a3b8] hover:text-white transition-colors"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;