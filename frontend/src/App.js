import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';
//Components & utils
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import ScrollToTop from '@/components/shared/ScrollToTop';
import ErrorBoundary from "@/components/shared/ErrorBoundary";
//Pages
import Home from '@/pages/home/index.jsx';
import HowItWorks from '@/pages/howitworks/index.jsx';
import WhyPreserveMemories from '@/pages/whyPreserveMemories/index.jsx';
import Explore from '@/pages/memorial/Explore.jsx';
import SelectPlan from '@/pages/payments/SelectPlan.jsx';
//Memorial Pages
import CreateMemorial from '@/pages/memorial/createMemorial/index.jsx';
import MemorialView from '@/pages/memorial/MemorialView.jsx';
import PreviewMemorial from '@/pages/memorial/PreviewMemorial.jsx';
import EditMemorial from '@/pages/memorial/EditMemorial.jsx';
//Payment Pages
import PaymentSuccess from '@/pages/payments/PaymentSuccess.jsx';
import PaymentFailure from '@/pages/payments/PaymentFailure.jsx';
import PaymentPending from '@/pages/payments/PaymentPending.jsx';
import Payment from '@/pages/payments/Payment.jsx';
//User Pages
import Dashboard from '@/pages/userPages/Dashboard.jsx';
import Profile from '@/pages/userPages/Profile.jsx';
import MyMemorials from '@/pages/userPages/MyMemorials.jsx';
import MyPurchases from '@/pages/userPages/MyPurchases.jsx';
//Institutional Pages
import AboutPage from '@/pages/institutional/AboutPage.jsx';
import ResponsibilityPolicyPage from '@/pages/institutional/ResponsibilityPolicyPage.jsx';
import PrivacyPolicyPage from '@/pages/institutional/PrivacyPolicyPage.jsx';
import ReturnPolicyPage from '@/pages/institutional/ReturnPolicyPage.jsx';
import TermsAndConditionsPage from '@/pages/institutional/TermsAndConditionsPage.jsx';
import DeliveryPolicyPage from '@/pages/institutional/DeliveryPolicyPage.jsx';
//Protected Routes
import AffiliateRoute from '@/routes/AffiliateRoute';
import AdminRoute from '@/routes/AdminRoute';
import ProtectedRoute from '@/routes/ProtectedRoute';
//Affiliate Pages
import { AffiliateSales, AffiliateCommissions, AffiliateMyCode, AffiliateDashboard } from '@/pages/affiliate';
//Admin Pages
import AdminLayout from '@/pages/admin/components/AdminLayout.jsx';
import AdminDashboard from '@/pages/admin/adminDashboard/index.jsx';
import AdminOrders from '@/pages/admin/adminOrders/index.jsx';
import AdminProduction from '@/pages/admin/adminProduction/index.jsx';
import AdminPartners from '@/pages/admin/adminPartners/index.jsx';
import AdminFinance from '@/pages/admin/adminFinance/index.jsx';
import AdminMemorials from '@/pages/admin/adminMemorials/index.jsx';
import AdminReviews from '@/pages/admin/adminReviews/index.jsx';
import AdminNotifications from '@/pages/admin/adminNotification/index.jsx';
import AdminLogs from '@/pages/admin/adminLogs/index.jsx';

import './lib/i18n';
import './App.css';

const FOOTER_START_COLOR = {
  '/':                  '#eef8fb',
  '/how-it-works':      '#eef8fb',
  '/explore':           '#eef8fb',
  '/create-memorial':   '#eef8fb',
  '/dashboard':         '#eef8fb',
  '/my-memorials':      '#eef8fb',
  '/my-purchases':      '#eef8fb',
  '/profile':           '#eef8fb',
  '/payment/:id':       '#eef8fb',
  '/select-plan/:id':   '#eef8fb',
};

const DEFAULT_FOOTER_COLOR = '#ffffff';

const AppLayout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const apoio = params.get('apoio');
    if (apoio) sessionStorage.setItem('apoio_code', apoio.toUpperCase());
  }, []);

  const isMemorialPage  = location.pathname.startsWith('/memorial/');
  const isAdminPage     = location.pathname.startsWith('/admin');
  const isAffiliatePage = location.pathname.startsWith('/affiliate');

  if (isAdminPage || isAffiliatePage) {
    return (
      <div className="App min-h-screen">
        {children}
        <Toaster position="top-right" />
      </div>
    );
  }

  const footerStartColor = FOOTER_START_COLOR[location.pathname] ?? DEFAULT_FOOTER_COLOR;

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
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/why-preserve-memories" element={<WhyPreserveMemories />} />
              <Route path="/explore" element={<Explore />} />

              {/* Institutional Routes */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/responsibility-policy" element={<ResponsibilityPolicyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/return-policy" element={<ReturnPolicyPage />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
              <Route path="/delivery-policy" element={<DeliveryPolicyPage />} />

              {/* Memorial Routes */}
              <Route path="/create-memorial" element={<CreateMemorial />} />
              <Route path="/memorial/:id" element={<MemorialView />} />
              <Route path="/preview/:id" element={
                <ProtectedRoute><PreviewMemorial /></ProtectedRoute>
              } />
              <Route path="/edit-memorial/:id" element={
                <ProtectedRoute><EditMemorial /></ProtectedRoute>
              } />

              {/* Payment Routes */}
              <Route path="/select-plan/:id" element={
                <ProtectedRoute><SelectPlan /></ProtectedRoute>
              } />
              <Route path="/payment/:id" element={
                <ProtectedRoute><Payment /></ProtectedRoute>
              } />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failure" element={<PaymentFailure />} />
              <Route path="/payment/pending" element={<PaymentPending />} />

              {/* User Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              <Route path="/my-memorials" element={
                <ProtectedRoute><MyMemorials /></ProtectedRoute>
              } />
              <Route path="/my-purchases" element={
                <ProtectedRoute><MyPurchases /></ProtectedRoute>
              } />

              {/* Affiliate Routes */}
              <Route path="/affiliate" element={
                <AffiliateRoute><AffiliateDashboard /></AffiliateRoute>
              } />
              <Route path="/affiliate/sales" element={
                <AffiliateRoute><AffiliateSales /></AffiliateRoute>
              } />
              <Route path="/affiliate/commissions" element={
                <AffiliateRoute><AffiliateCommissions /></AffiliateRoute>
              } />
              <Route path="/affiliate/my-code" element={
                <AffiliateRoute><AffiliateMyCode /></AffiliateRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>
              } />
              <Route path="/admin/orders" element={
                <AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>
              } />
              <Route path="/admin/production" element={
                <AdminRoute><AdminLayout><AdminProduction /></AdminLayout></AdminRoute>
              } />
              <Route path="/admin/partners" element={
                <AdminRoute><AdminLayout><AdminPartners /></AdminLayout></AdminRoute>
              } />
              <Route path="/admin/finance" element={
                <AdminRoute><AdminLayout><AdminFinance /></AdminLayout></AdminRoute>
              } />
              <Route path="/admin/memorials" element={
                <AdminRoute><AdminLayout><AdminMemorials /></AdminLayout></AdminRoute>
              } />
              <Route path="/admin/reviews" element={
                <AdminRoute><AdminLayout><AdminReviews /></AdminLayout></AdminRoute>
              } />
              <Route path="/admin/notifications" element={
                <AdminRoute><AdminLayout><AdminNotifications /></AdminLayout></AdminRoute>
              } />
              <Route path="/admin/logs" element={
                <AdminRoute><AdminLayout><AdminLogs /></AdminLayout></AdminRoute>
              } />
            </Routes>
          </AppLayout>
          <Analytics />
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;