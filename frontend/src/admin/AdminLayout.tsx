import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, PackageOpen, Truck, Users, Tag, Star, 
  Settings, FileText, Bell, Search, LogOut, Menu, X, Ticket, 
  RotateCcw, Headphones, AlertTriangle, CheckCircle2, IndianRupee 
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'payment' | 'return' | 'system';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export default function AdminLayout() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);

  // Real-time Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      if (res.data?.success && res.data.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unread_count || 0);
      }
    } catch (err) {
      // Quiet fallback
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/admin/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    try {
      if (!item.is_read) {
        await api.patch(`/admin/notifications/${item.id}/read`);
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
    setNotifOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

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
    { name: 'Helpdesk', icon: Headphones, path: '/admin/support' },
    { name: 'Catalog', icon: Tag, path: '/admin/catalog' },
    { name: 'Price Manager', icon: IndianRupee, path: '/admin/pricing' },
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
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(0)'
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
            );
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

            {/* Notification Bell with Dropdown Drawer */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
                title="Notifications"
              >
                <Bell size={20} color="#38243F" />
                {unreadCount > 0 && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-6px', 
                    right: '-6px', 
                    background: '#e11d48', 
                    color: '#fff', 
                    fontSize: '10px', 
                    fontWeight: 700,
                    borderRadius: '50%', 
                    width: '18px', 
                    height: '18px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(225,29,72,0.4)'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Popover */}
              {notifOpen && (
                <div style={{
                  position: 'absolute',
                  top: '36px',
                  right: 0,
                  width: '360px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0 12px 36px rgba(56,36,63,0.18)',
                  border: '1px solid #E5DCD0',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    backgroundColor: '#FAF7F2',
                    borderBottom: '1px solid #E5DCD0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'DM Sans', fontSize: '18px', fontWeight: 600, color: '#38243F' }}>
                        Operational Alerts
                      </span>
                      {unreadCount > 0 && (
                        <span style={{ background: '#38243F', color: '#D4AF37', fontSize: '10px', padding: '2px 7px', borderRadius: '10px', fontWeight: 600 }}>
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#B89047',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          textDecoration: 'underline'
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '32px 20px', textAlign: 'center', color: '#888' }}>
                        <CheckCircle2 size={32} color="#D4AF37" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
                        <p style={{ margin: 0, fontSize: '13px' }}>All clear. No operational alerts right now.</p>
                      </div>
                    ) : (
                      notifications.map(item => {
                        const IconComponent = item.type === 'order' ? ShoppingBag 
                          : item.type === 'stock' ? AlertTriangle 
                          : item.type === 'return' ? RotateCcw 
                          : Headphones;
                        
                        const iconColor = item.type === 'order' ? '#16a34a' 
                          : item.type === 'stock' ? '#d97706' 
                          : item.type === 'return' ? '#dc2626' 
                          : '#38243F';

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid #F4EFEA',
                              backgroundColor: item.is_read ? '#FFFFFF' : '#FDFBF7',
                              cursor: 'pointer',
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'flex-start',
                              transition: 'background-color 0.15s ease'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5EFE6')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = item.is_read ? '#FFFFFF' : '#FDFBF7')}
                          >
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              backgroundColor: `${iconColor}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}>
                              <IconComponent size={16} color={iconColor} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', fontWeight: item.is_read ? 500 : 700, color: '#38243F' }}>
                                  {item.title}
                                </span>
                                {!item.is_read && (
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4AF37', display: 'inline-block' }} />
                                )}
                              </div>
                              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#666', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.message}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
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
