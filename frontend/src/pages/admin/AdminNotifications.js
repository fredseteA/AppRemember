import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Bell,
  Check,
  CheckCheck,
  ShoppingCart,
  Package,
  Users,
  AlertCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NOTIFICATION_ICONS = {
  new_order: ShoppingCart,
  production_pending: Package,
  partner_milestone: Users,
  default: Bell
};

const NOTIFICATION_COLORS = {
  new_order: '#10b981',
  production_pending: '#f59e0b',
  partner_milestone: '#3b82f6',
  default: '#94a3b8'
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `há ${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `há ${days} dia${days !== 1 ? 's' : ''}`;
  }
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const AdminNotifications = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${API}/admin/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${API}/admin/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Erro ao marcar notificações');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="space-y-6" data-testid="notifications-loading">
        <div className="h-10 w-48 bg-[#16202e] rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-[#16202e] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-notifications">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6] mb-1">
            Sistema
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Notificações</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="px-3 py-1.5 bg-[#3b82f6]/10 text-[#3b82f6] rounded-full text-sm font-medium">
              {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
            </span>
          )}
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-[#2d3a52] text-white rounded-lg text-sm font-medium hover:bg-[#374763] transition-colors"
              data-testid="mark-all-read-btn"
            >
              <CheckCheck size={16} />
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-12 text-center">
          <Bell className="mx-auto mb-4 text-[#94a3b8]" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Sem notificações</h3>
          <p className="text-[#94a3b8]">Você não tem notificações no momento.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notification => {
            const Icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default;
            const color = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.default;
            
            return (
              <div 
                key={notification.id}
                className={`
                  flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer
                  ${notification.read 
                    ? 'bg-[#16202e] border border-[#2d3a52]' 
                    : 'bg-[#16202e] border border-[#3b82f6]/30 shadow-lg shadow-[#3b82f6]/5'
                  }
                `}
                onClick={() => !notification.read && markAsRead(notification.id)}
                data-testid={`notification-${notification.id}`}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-semibold ${notification.read ? 'text-[#94a3b8]' : 'text-white'}`}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-[#3b82f6] flex-shrink-0 mt-2" />
                    )}
                  </div>
                  <p className="text-sm text-[#94a3b8] mt-1">{notification.message}</p>
                  <p className="text-xs text-[#94a3b8]/60 mt-2">{formatDate(notification.created_at)}</p>
                </div>
                
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className="p-2 rounded-lg hover:bg-[#2d3a52] text-[#94a3b8] hover:text-white transition-colors"
                    title="Marcar como lida"
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
