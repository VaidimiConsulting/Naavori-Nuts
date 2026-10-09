import { useEffect, useState } from 'react';
import api from './services/api';
import { Package, Heart, ShoppingBag, LogOut } from 'lucide-react';

export default function CustomerAccountPage({ navigate, wishlist, cart }: { navigate: (path: string) => void, wishlist: string[], cart: any[] }) {
  const [orders, setOrders] = useState<any[]>([]);
  const email = localStorage.getItem('customer_email');

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }
    api.get(`/public/orders/${email}`)
      .then(res => setOrders(res.data.data))
      .catch(console.error);
  }, [email, navigate]);

  const logout = () => {
    localStorage.removeItem('customer_email');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('customer_phone');
    navigate('/login');
  };

  if (!email) return null;
  const name = localStorage.getItem('customer_name') || 'Customer';
  const phone = localStorage.getItem('customer_phone') || 'Not provided';

  return (
    <main className="section-pad" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '120px', minHeight: 'calc(100vh - 160px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '40px', color: '#38243F', marginBottom: '8px' }}>Your Account</h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666' }}>Welcome back, {name}</p>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid #ddd', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'DM Sans', color: '#38243F' }}>
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', color: '#38243F', margin: '0 0 16px 0' }}>My Profile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div><p style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', color: '#888' }}>Name</p><p style={{ margin: '4px 0 0', fontFamily: 'DM Sans' }}>{name}</p></div>
          <div><p style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', color: '#888' }}>Email</p><p style={{ margin: '4px 0 0', fontFamily: 'DM Sans' }}>{email}</p></div>
          <div><p style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', color: '#888' }}>Mobile Number</p><p style={{ margin: '4px 0 0', fontFamily: 'DM Sans' }}>{phone}</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '24px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #EAEAEA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Heart size={24} color="#38243F" />
            <h3 style={{ fontFamily: 'DM Sans', fontSize: '18px', margin: 0 }}>Wishlist</h3>
          </div>
          <p style={{ fontFamily: 'DM Sans', color: '#666', marginBottom: '20px' }}>You have {wishlist.length} items saved.</p>
          <button onClick={() => navigate('/wishlist')} style={{ background: 'none', border: 'none', color: '#D4AF37', fontWeight: 600, cursor: 'pointer', padding: 0 }}>View Wishlist &rarr;</button>
        </div>
        
        <div style={{ padding: '24px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #EAEAEA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <ShoppingBag size={24} color="#38243F" />
            <h3 style={{ fontFamily: 'DM Sans', fontSize: '18px', margin: 0 }}>Current Cart</h3>
          </div>
          <p style={{ fontFamily: 'DM Sans', color: '#666', marginBottom: '20px' }}>You have {cart.length} items in your bag.</p>
          <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', color: '#D4AF37', fontWeight: 600, cursor: 'pointer', padding: 0 }}>View Cart &rarr;</button>
        </div>
      </div>

      <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', color: '#38243F', marginBottom: '24px' }}>Order History</h2>
      {orders.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #EAEAEA' }}>
          <Package size={32} style={{ color: '#aaa', marginBottom: '16px' }} />
          <p style={{ fontFamily: 'DM Sans', color: '#666' }}>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => (
            <div key={order.id} style={{ border: '1px solid #EAEAEA', borderRadius: '8px', padding: '24px', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontFamily: 'DM Sans', fontSize: '16px' }}>Order #{order.order_number}</h4>
                  <small style={{ color: '#888', fontFamily: 'DM Sans' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                    backgroundColor: order.order_status === 'delivered' ? '#f6ffed' : '#e6f7ff',
                    color: order.order_status === 'delivered' ? '#52c41a' : '#1890ff',
                    textTransform: 'uppercase'
                  }}>
                    {order.order_status}
                  </span>
                  <div style={{ marginTop: '8px', fontFamily: 'DM Sans', fontWeight: 600 }}>₹{order.total}</div>
                </div>
              </div>
              <div>
                {order.items?.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Sans', fontSize: '14px', marginBottom: '8px', color: '#555' }}>
                    <span>{item.quantity}x {item.product_name} ({item.weight_label})</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
