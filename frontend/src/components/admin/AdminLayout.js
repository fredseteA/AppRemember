import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Factory,
  Users,
  DollarSign,
  Heart,
  Star,
  Bell,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
  { path: '/admin/production', icon: Factory, label: 'Produção' },
  { path: '/admin/partners', icon: Users, label: 'Parceiros' },
  { path: '/admin/finance', icon: DollarSign, label: 'Financeiro' },
  { path: '/admin/memorials', icon: Heart, label: 'Memoriais' },
  { path: '/admin/reviews', icon: Star, label: 'Avaliações' },
  { path: '/admin/notifications', icon: Bell, label: 'Notificações' },
  { path: '/admin/logs', icon: FileText, label: 'Logs' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1824] flex" data-testid="admin-layout">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#16202e] border border-[#2d3a52] text-white"
        data-testid="mobile-menu-btn"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-[#0b121b] border-r border-[#1e2b3e]
          flex flex-col transition-all duration-300 ease-in-out
        `}
        data-testid="admin-sidebar"
      >
        {/* Logo */}
        <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'px-4'} border-b border-[#1e2b3e]`}>
          {collapsed ? (
            <Heart className="text-[#3b82f6]" size={24} />
          ) : (
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <Heart className="text-[#3b82f6]" size={24} />
              <span className="font-semibold text-white text-lg tracking-tight">Remember</span>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive(item)
                      ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20'
                      : 'text-[#94a3b8] hover:bg-[#16202e] hover:text-white'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  title={collapsed ? item.label : ''}
                >
                  <item.icon size={20} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Collapse */}
        <div className="border-t border-[#1e2b3e] p-3">
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
                <span className="text-[#3b82f6] text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin</p>
                <p className="text-xs text-[#94a3b8] truncate">{user?.email}</p>
              </div>
            </div>
          )}
          
          <div className={`flex ${collapsed ? 'flex-col' : ''} gap-2`}>
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg
                text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10
                transition-colors ${collapsed ? 'justify-center' : 'flex-1'}
              `}
              data-testid="logout-btn"
              title="Sair"
            >
              <LogOut size={18} />
              {!collapsed && <span className="text-sm">Sair</span>}
            </button>
            
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#16202e] transition-colors"
              data-testid="collapse-btn"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        <div className="p-6 md:p-8 lg:pl-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
