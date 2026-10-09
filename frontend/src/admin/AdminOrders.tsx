import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, PackageOpen, Truck } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

type Order = {
  id: string;
  order_number: string;
  shipping_name: string;
  shipping_city: string;
  total: string;
  payment_method: string;
  order_status: string;
  created_at: string;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders', {
        params: { status: statusFilter, search }
      });
      setOrders(data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const tabs = [
    { label: 'All', value: '' },
    { label: 'New', value: 'placed' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Packing', value: 'packed' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', color: '#38243F', margin: 0 }}>Orders Pipeline</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAEAEA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {tabs.map(tab => (
              <button 
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                style={{ 
                  padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500,
                  backgroundColor: statusFilter === tab.value ? '#38243F' : '#f0f0f0',
                  color: statusFilter === tab.value ? '#FDFBF7' : '#666'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search order no, phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} 
            />
          </div>
        </div>

        {/* Data Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#f9f9f9', color: '#666', borderBottom: '1px solid #EAEAEA' }}>
            <tr>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Order ID</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Customer</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Date</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Amount</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No orders found for this criteria.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #EAEAEA' }}>
                  <td style={{ padding: '16px 20px' }}><strong>{order.order_number}</strong></td>
                  <td style={{ padding: '16px 20px' }}>{order.shipping_name}<br/><span style={{ color: '#888', fontSize: '12px' }}>{order.shipping_city}</span></td>
                  <td style={{ padding: '16px 20px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 20px' }}>₹{order.total} <small>({order.payment_method})</small></td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: order.order_status === 'placed' ? '#e6f7ff' : '#f6ffed',
                      color: order.order_status === 'placed' ? '#1890ff' : '#52c41a'
                    }}>
                      {order.order_status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <Link to={`/admin/orders/${order.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#D4AF37', textDecoration: 'none', fontWeight: 500 }}>
                      <Eye size={16} /> View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}
