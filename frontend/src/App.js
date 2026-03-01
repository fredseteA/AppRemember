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
import Admin from './pages/Admin';
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
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Admin />
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
