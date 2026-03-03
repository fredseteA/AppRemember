import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from "./components/ErrorBoundary";
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Explore from './pages/Explore';
import CreateMemorial from './pages/CreateMemorial';
import MemorialView from './pages/MemorialView';
import PreviewMemorial from './pages/PreviewMemorial';
import SelectPlan from './pages/SelectPlan';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PaymentPending from './pages/PaymentPending';
import Payment from './pages/Payment';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyMemorials from './pages/MyMemorials';
import MyPurchases from './pages/MyPurchases';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProduction from './pages/admin/AdminProduction';
import AdminPartners from './pages/admin/AdminPartners';
import AdminFinance from './pages/admin/AdminFinance';
import AdminMemorials from './pages/admin/AdminMemorials';
import AdminReviews from './pages/admin/AdminReviews';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminLogs from './pages/admin/AdminLogs';

import './lib/i18n';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user && user.is_admin ? children : <Navigate to="/" replace />;
};

// Layout wrapper component that conditionally shows header/footer
const FOOTER_START_COLOR = {
  '/':             '#eef8fb', 
  '/how-it-works': '#eef8fb', 
  '/explore':      '#eef8fb',
  '/create-memorial': '#eef8fb',
  '/dashboard': '#eef8fb',
  '/my-memorials': '#eef8fb',
  '/my-purchases': '#eef8fb',
  '/profile': '#eef8fb',
  '/payment/:id': '#eef8fb',
  '/select-plan/:id': '#eef8fb',
};

const DEFAULT_FOOTER_COLOR = '#ffffff'; // fallback para demais páginas

// Layout wrapper component that conditionally shows header/footer
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isMemorialPage = location.pathname.startsWith('/memorial/');
  const isAdminPage = location.pathname.startsWith('/admin');

  // Admin pages have their own layout
  if (isAdminPage) {
    return (
      <div className="App min-h-screen">
        {children}
        <Toaster position="top-right" />
      </div>
    );
  }

  const footerStartColor =
    FOOTER_START_COLOR[location.pathname] ?? DEFAULT_FOOTER_COLOR;

  return (
    <div className="App min-h-screen flex flex-col">
      {!isMemorialPage && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!isMemorialPage && <Footer startColor={footerStartColor} />}
      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <AppLayout>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/create-memorial" element={<CreateMemorial />} />
              <Route path="/memorial/:id" element={<MemorialView />} />
              <Route
                  path="/preview/:id"
                  element={
                    <ProtectedRoute>
                      <PreviewMemorial />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/select-plan/:id"
                  element={
                    <ProtectedRoute>
                      <SelectPlan />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment/:id"
                  element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  }
                />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failure" element={<PaymentFailure />} />
                <Route path="/payment/pending" element={<PaymentPending />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-memorials"
                  element={
                    <ProtectedRoute>
                      <MyMemorials />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-purchases"
                  element={
                    <ProtectedRoute>
                      <MyPurchases />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout><AdminDashboard /></AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <AdminLayout><AdminOrders /></AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/production"
                  element={
                    <AdminRoute>
                      <AdminLayout><AdminProduction /></AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/partners"
                  element={
                    <AdminRoute>
                      <AdminLayout><AdminPartners /></AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/finance"
                  element={
                    <AdminRoute>
                      <AdminLayout><AdminFinance /></AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/memorials"
                  element={
                    <AdminRoute>
                      <AdminLayout><AdminMemorials /></AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/reviews"
                  element={
                    <AdminRoute>
                      <AdminLayout><AdminReviews /></AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <AdminRoute>
                      <AdminLayout><AdminNotifications /></AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/logs"
                  element={
                    <AdminRoute>
                      <AdminLayout><AdminLogs /></AdminLayout>
                    </AdminRoute>
                  }
                />
              </Routes>
          </AppLayout>
          <Analytics />
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
