import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('NAAVORI render error', error, info); }
  render() {
    if (this.state.error) {
      return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 32, background: '#f4ede4', color: '#38243f', textAlign: 'center' }}><div><h1 style={{ fontFamily: 'DM Sans', fontWeight: 400 }}>A quiet pause.</h1><p style={{ fontFamily: 'DM Sans', }}>The experience is refreshing. Please reload the page.</p><small style={{ display: 'block', maxWidth: 520, margin: '18px auto', fontFamily: 'monospace', fontSize: 11, opacity: .65 }}>{this.state.error.message}</small><button onClick={() => location.reload()} style={{ padding: '12px 18px', border: 0, background: '#38243f', color: '#f4ede4' }}>Reload NAAVORI</button></div></main>;
    }
    return this.props.children;
  }
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/AdminLogin';
import AdminOrders from './admin/AdminOrders';
import AdminOrderDetail from './admin/AdminOrderDetail';
import AdminPackingBoard from './admin/AdminPackingBoard';
import AdminCatalog from './admin/AdminCatalog';
import AdminPricing from './admin/AdminPricing';
import AdminProductForm from './admin/AdminProductForm';
import AdminInventory from './admin/AdminInventory';
import AdminReviews from './admin/AdminReviews';
import AdminCustomers from './admin/AdminCustomers';
import AdminDeliveries from './admin/AdminDeliveries';
import AdminSupport from './admin/AdminSupport';
import AdminCoupons from './admin/AdminCoupons';
import AdminCMS from './admin/AdminCMS';
import AdminSettings from './admin/AdminSettings';
import AdminPlaceholder from './admin/AdminPlaceholder';
import { AuthProvider } from './admin/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="packing" element={<AdminPackingBoard />} />
              <Route path="catalog" element={<AdminCatalog />} />
              <Route path="pricing" element={<AdminPricing />} />
              <Route path="catalog/new" element={<AdminProductForm />} />
              <Route path="catalog/:id" element={<AdminProductForm />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="deliveries" element={<AdminDeliveries />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="cms" element={<AdminCMS />} />
              <Route path="settings" element={<AdminSettings />} />
              {/* Other admin routes will go here */}
            </Route>
            <Route path="*" element={<App />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
