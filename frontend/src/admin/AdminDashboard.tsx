import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ShoppingBag, PackageOpen, Truck, RotateCcw, Headphones, 
  Users, AlertTriangle, ArrowUpRight, CheckCircle2, TrendingUp,
  Tag, Star, Ticket, FileText, Settings, RefreshCw, Calendar
} from 'lucide-react';

interface DashboardStats {
  grossSales: number;
  totalOrders: number;
  pendingPacking: number;
  outForDelivery: number;
  totalDelivered: number;
  unassignedDeliveries: number;
  openTickets: number;
  lowStockCount: number;
  totalCustomers: number;
  recentOrders: any[];
  chartData: { date: string; daily_sales: number; order_count?: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    grossSales: 0,
    totalOrders: 0,
    pendingPacking: 0,
    outForDelivery: 0,
    totalDelivered: 0,
    unassignedDeliveries: 0,
    openTickets: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    recentOrders: [],
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute maximum sales for chart scaling
  const maxSales = Math.max(...(stats.chartData?.map(d => Number(d.daily_sales) || 0) || [1000]), 1000);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '36px', color: '#38243F', margin: '0 0 6px 0', fontWeight: 600 }}>
            Executive Operations Center
          </h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: 0, fontSize: '14px' }}>
            Live status of NAAVORI pantry orders, dispatches, inventory, and patron service
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={fetchStats}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', 
              backgroundColor: '#fff', border: '1px solid #EAEAEA', borderRadius: '6px', 
              fontFamily: 'DM Sans', cursor: 'pointer', fontWeight: 600, color: '#38243F', fontSize: '13px' 
            }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh Data
          </button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: 'rgba(212, 175, 55, 0.12)', borderRadius: '20px', color: '#997316', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#52c41a', display: 'inline-block' }} />
            Live Sync Active
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <MetricCard 
          title="Gross Sales (All Time)" 
          value={`₹${stats.grossSales.toLocaleString('en-IN')}`} 
          subtext="Processed revenue"
          icon={TrendingUp}
          color="#16a34a"
          link="/admin/orders"
        />
        <MetricCard 
          title="Total Orders" 
          value={stats.totalOrders.toString()} 
          subtext={`${stats.totalDelivered || 0} delivered`}
          icon={ShoppingBag}
          color="#38243F"
          link="/admin/orders"
        />
        <MetricCard 
          title="Pending Packing" 
          value={stats.pendingPacking.toString()} 
          subtext="Orders awaiting pack"
          icon={PackageOpen}
          color={stats.pendingPacking > 0 ? '#d97706' : '#666'}
          alert={stats.pendingPacking > 0}
          link="/admin/packing"
        />
        <MetricCard 
          title="Out For Delivery" 
          value={stats.outForDelivery.toString()} 
          subtext={`${stats.unassignedDeliveries || 0} unassigned`}
          icon={Truck}
          color="#2563eb"
          link="/admin/deliveries"
        />
      </div>

      {/* Secondary Operational Alerts Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <SecondaryCard 
          title="Patron Reviews" 
          value="Live" 
          unit="ratings & words"
          icon={Star} 
          color="#d4af37" 
          link="/admin/reviews"
        />
        <SecondaryCard 
          title="Helpdesk Tickets" 
          value={stats.openTickets} 
          unit="open queries"
          icon={Headphones} 
          color="#7c3aed" 
          link="/admin/support"
          alert={stats.openTickets > 0}
        />
        <SecondaryCard 
          title="Inventory Low Stock" 
          value={stats.lowStockCount} 
          unit="items ≤ 10 units"
          icon={AlertTriangle} 
          color="#ea580c" 
          link="/admin/inventory"
          alert={stats.lowStockCount > 0}
        />
        <SecondaryCard 
          title="Registered Patrons" 
          value={stats.totalCustomers} 
          unit="accounts"
          icon={Users} 
          color="#0891b2" 
          link="/admin/customers"
        />
      </div>

      {/* Main Grid: Live Trend Chart & Urgent Action Items */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Live 7-Day Sales Trend Chart */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #EAEAEA', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontFamily: 'DM Sans', fontSize: '17px', margin: '0 0 4px 0', color: '#38243F', fontWeight: 600 }}>
                Revenue & Demand Pulse (Last 7 Days)
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#888', fontFamily: 'DM Sans' }}>
                Daily sales totals aggregated from live order checkouts
              </p>
            </div>
            <span style={{ fontSize: '13px', color: '#D4AF37', fontWeight: 600, fontFamily: 'DM Sans' }}>
              ✦ Daily Breakdown
            </span>
          </div>

          {stats.chartData && stats.chartData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '220px', gap: '16px', padding: '16px 0', borderBottom: '1px solid #eee' }}>
                {stats.chartData.map((item, idx) => {
                  const sales = Number(item.daily_sales) || 0;
                  const heightPercent = Math.max(12, Math.round((sales / maxSales) * 100));
                  const formattedDate = new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#38243F', fontFamily: 'DM Sans' }}>
                        ₹{sales.toLocaleString('en-IN')}
                      </span>
                      <div 
                        style={{ 
                          width: '100%', 
                          maxWidth: '44px',
                          height: `${heightPercent}%`, 
                          backgroundColor: '#38243F', 
                          borderRadius: '6px 6px 0 0',
                          background: 'linear-gradient(180deg, #D4AF37 0%, #38243F 100%)',
                          transition: 'height 0.4s ease',
                          cursor: 'pointer'
                        }}
                        title={`${formattedDate}: ₹${sales} (${item.order_count || 1} orders)`}
                      />
                      <span style={{ fontSize: '11px', color: '#888', fontFamily: 'DM Sans' }}>
                        {formattedDate}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', fontFamily: 'DM Sans' }}>
                <span>✦ Highest Day: ₹{maxSales.toLocaleString('en-IN')}</span>
                <Link to="/admin/orders" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>
                  View All Orders &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf7f2', borderRadius: '8px', color: '#888', fontFamily: 'DM Sans' }}>
              <Calendar size={32} color="#D4AF37" style={{ marginBottom: '8px', opacity: 0.8 }} />
              <p style={{ margin: 0, fontSize: '14px' }}>No orders recorded in the last 7 days yet.</p>
              <small style={{ color: '#aaa', marginTop: '4px' }}>New customer orders placed will automatically populate here.</small>
            </div>
          )}
        </div>

        {/* Priority Action Items */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #EAEAEA', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'DM Sans', fontSize: '17px', margin: '0 0 16px 0', color: '#38243F', fontWeight: 600 }}>
            Operational Checklist
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            
            <ActionRow 
              label="Orders Awaiting Packing" 
              count={stats.pendingPacking} 
              link="/admin/packing"
              actionText="Open Packing Board"
              urgent={stats.pendingPacking > 0}
            />

            <ActionRow 
              label="Deliveries to Dispatch" 
              count={stats.unassignedDeliveries} 
              link="/admin/deliveries"
              actionText="Assign Partners"
              urgent={stats.unassignedDeliveries > 0}
            />

            <ActionRow 
              label="Open Helpdesk Inquiries" 
              count={stats.openTickets} 
              link="/admin/support"
              actionText="Reply to Patrons"
              urgent={stats.openTickets > 0}
            />

            <ActionRow 
              label="Low Stock Variants" 
              count={stats.lowStockCount} 
              link="/admin/inventory"
              actionText="Add Purchase Entry"
              urgent={stats.lowStockCount > 0}
            />

          </ul>
        </div>

      </div>

      {/* Recent Orders Pipeline Preview */}
      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EAEAEA', overflow: 'hidden', marginBottom: '32px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #EAEAEA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'DM Sans', fontSize: '17px', margin: '0 0 4px 0', color: '#38243F', fontWeight: 600 }}>
              Recent Patron Orders
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#888', fontFamily: 'DM Sans' }}>
              Latest purchase transactions from storefront and checkout
            </p>
          </div>
          <Link to="/admin/orders" style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>
            View Full Pipeline &rarr;
          </Link>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#FAF7F2', color: '#666', borderBottom: '1px solid #EAEAEA' }}>
            <tr>
              <th style={{ padding: '14px 24px', fontWeight: 600 }}>Order Number</th>
              <th style={{ padding: '14px 24px', fontWeight: 600 }}>Customer</th>
              <th style={{ padding: '14px 24px', fontWeight: 600 }}>Amount</th>
              <th style={{ padding: '14px 24px', fontWeight: 600 }}>Payment</th>
              <th style={{ padding: '14px 24px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 24px', fontWeight: 600, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {!stats.recentOrders || stats.recentOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#888' }}>
                  No recent orders found.
                </td>
              </tr>
            ) : (
              stats.recentOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #EAEAEA' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <strong style={{ color: '#38243F' }}>#{order.order_number}</strong>
                    <div style={{ fontSize: '11px', color: '#888' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {order.shipping_name || 'Valued Patron'}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#38243F' }}>
                    ₹{Number(order.total).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#666', textTransform: 'uppercase', fontSize: '12px' }}>
                    {order.payment_method || 'COD'}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                      backgroundColor: order.order_status === 'delivered' ? '#f6ffed' 
                        : order.order_status === 'packed' ? '#e6f7ff' 
                        : order.order_status === 'out_for_delivery' ? '#fff7e6' 
                        : '#f5f5f5',
                      color: order.order_status === 'delivered' ? '#52c41a' 
                        : order.order_status === 'packed' ? '#1890ff' 
                        : order.order_status === 'out_for_delivery' ? '#fa8c16' 
                        : '#666'
                    }}>
                      {(order.order_status || 'PLACED').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <Link to={`/admin/orders/${order.id}`} style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Inspect <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Launchpad to all 12 modules */}
      <div>
        <h3 style={{ fontFamily: 'DM Sans', fontSize: '24px', color: '#38243F', margin: '0 0 16px 0' }}>
          Management Modules Launchpad
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <LaunchCard name="Packing Board" path="/admin/packing" icon={PackageOpen} />
          <LaunchCard name="Deliveries" path="/admin/deliveries" icon={Truck} />
          <LaunchCard name="Helpdesk Support" path="/admin/support" icon={Headphones} />
          <LaunchCard name="Inventory Ledger" path="/admin/inventory" icon={PackageOpen} />
          <LaunchCard name="Product Catalog" path="/admin/catalog" icon={Tag} />
          <LaunchCard name="Customers" path="/admin/customers" icon={Users} />
          <LaunchCard name="Coupons & Offers" path="/admin/coupons" icon={Ticket} />
          <LaunchCard name="Reviews" path="/admin/reviews" icon={Star} />
          <LaunchCard name="CMS Content" path="/admin/cms" icon={FileText} />
          <LaunchCard name="Store Settings" path="/admin/settings" icon={Settings} />
        </div>
      </div>

    </div>
  );
}

function MetricCard({ title, value, subtext, icon: Icon, color, link, alert }: { title: string; value: string; subtext: string; icon: any; color: string; link: string; alert?: boolean }) {
  return (
    <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ 
        background: '#fff', padding: '22px', borderRadius: '10px', border: alert ? '1px solid #fecaca' : '1px solid #EAEAEA',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#777', fontWeight: 500 }}>{title}</span>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={color} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: '30px', fontWeight: 700, color: alert ? '#dc2626' : '#38243F', fontFamily: 'DM Sans' }}>
            {value}
          </div>
          <span style={{ fontSize: '12px', color: '#888', fontFamily: 'DM Sans', marginTop: '4px', display: 'block' }}>
            {subtext}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SecondaryCard({ title, value, unit, icon: Icon, color, link, alert }: { title: string; value: number | string; unit: string; icon: any; color: string; link: string; alert?: boolean }) {
  return (
    <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ 
        background: '#fff', padding: '16px 20px', borderRadius: '8px', border: alert ? `1px solid ${color}` : '1px solid #EAEAEA',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color={color} />
          </div>
          <div>
            <div style={{ fontFamily: 'DM Sans', fontSize: '13px', fontWeight: 600, color: '#38243F' }}>{title}</div>
            <div style={{ fontSize: '11px', color: '#888', fontFamily: 'DM Sans' }}>{unit}</div>
          </div>
        </div>
        <strong style={{ fontSize: '20px', color: alert ? color : '#38243F', fontFamily: 'DM Sans' }}>
          {value}
        </strong>
      </div>
    </Link>
  );
}

function ActionRow({ label, count, link, actionText, urgent }: { label: string; count: number; link: string; actionText: string; urgent: boolean }) {
  return (
    <li style={{ 
      padding: '12px 14px', borderRadius: '6px', 
      backgroundColor: urgent ? '#FDFBF7' : '#fafafa', 
      border: urgent ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid #eee',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div>
        <span style={{ fontSize: '13px', fontFamily: 'DM Sans', color: '#38243F', fontWeight: urgent ? 600 : 400 }}>{label}</span>
        {count > 0 && (
          <span style={{ marginLeft: '8px', backgroundColor: urgent ? '#38243F' : '#eee', color: urgent ? '#D4AF37' : '#666', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
            {count}
          </span>
        )}
      </div>
      <Link to={link} style={{ fontSize: '12px', color: '#D4AF37', textDecoration: 'none', fontWeight: 600, fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {actionText} <ArrowUpRight size={13} />
      </Link>
    </li>
  );
}

function LaunchCard({ name, path, icon: Icon }: { name: string; path: string; icon: any }) {
  return (
    <Link to={path} style={{ textDecoration: 'none' }}>
      <div style={{ 
        backgroundColor: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #EAEAEA',
        display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s ease', cursor: 'pointer'
      }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(56,36,63,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color="#38243F" />
        </div>
        <span style={{ fontFamily: 'DM Sans', fontSize: '13px', fontWeight: 600, color: '#38243F' }}>{name}</span>
      </div>
    </Link>
  );
}
