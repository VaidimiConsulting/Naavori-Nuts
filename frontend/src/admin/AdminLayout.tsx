import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, PackageOpen, Truck, Users, Tag, Star, Settings, FileText, Bell, Search, LogOut, Menu, X, Ticket } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function AdminLayout() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38243F' }}>Loading NAAVORI Admin...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  const menu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'Packing Board', icon: PackageOpen, path: '/admin/packing' },
    { name: 'Deliveries', icon: Truck, path: '/admin/deliveries' },
    { name: 'Catalog', icon: Tag, path: '/admin/catalog' },
    { name: 'Inventory', icon: PackageOpen, path: '/admin/inventory' },
    { name: 'Customers', icon: Users, path: '/admin/customers' },
    { name: 'Reviews', icon: Star, path: '/admin/reviews' },
    { name: 'Coupons', icon: Ticket, path: '/admin/coupons' },
    { name: 'CMS', icon: FileText, path: '/admin/cms' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FDFBF7', color: '#38243F' }}>
      
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ 
        width: '260px', 
        backgroundColor: '#38243F', 
        color: '#FDFBF7',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 50,
        transition: 'transform 0.3s ease',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(0)' /* will handle mobile via CSS later */
      }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/assets/naavori-logo-transparent.png" alt="NAAVORI" style={{ height: '48px', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#D4AF37', marginTop: '4px' }}>Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="mobile-only" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20}/></button>
        </div>
        
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          {menu.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.name} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px',
                color: active ? '#D4AF37' : '#FDFBF7',
                textDecoration: 'none',
                backgroundColor: active ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                borderLeft: active ? '4px solid #D4AF37' : '4px solid transparent',
                fontFamily: 'DM Sans, sans-serif'
              }}>
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: '#FDFBF7', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '14px'
          }}>
            <LogOut size={16} /> Logout ({user.name})
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main" style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', width: 'calc(100% - 260px)' }}>
        
        {/* Topbar */}
        <header style={{ 
          height: '64px', backgroundColor: '#fff', borderBottom: '1px solid #EAEAEA',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-only" onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Menu size={20}/></button>
            <div style={{ position: 'relative', width: '300px' }} className="desktop-only">
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input type="text" placeholder="Search orders, products, customers..." style={{
                width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '14px' }}>
              <input type="checkbox" checked={storeOpen} onChange={(e) => setStoreOpen(e.target.checked)} />
              {storeOpen ? 'Store Open' : 'Store Closed'}
            </label>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
              <Bell size={20} color="#38243F" />
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'red', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

    </div>
  );
}
