import { useState, useEffect } from 'react';
import { Users, Mail, MapPin, Search } from 'lucide-react';
import api from '../services/api';

type Customer = {
  email: string;
  name: string;
  phone: string;
  city: string;
  last_order_date: string;
  total_orders: number;
  total_spent: string;
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/customers', { params: { search, limit: 100 } });
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c => 
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="admin-customers" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', color: '#38243F', margin: '0 0 8px 0' }}>Customer Directory</h1>
          <p style={{ color: '#666', margin: 0, fontFamily: 'DM Sans', fontSize: '14px' }}>
            <Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            {customers.length} total customers
          </p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', fontSize: '14px' }} 
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading directory...</div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#F9F9F9', borderBottom: '1px solid #EAEAEA' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#38243F' }}>Customer</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#38243F' }}>Contact</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#38243F' }}>Location</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#38243F' }}>Orders</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#38243F' }}>Total Spent</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#38243F' }}>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #EAEAEA' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {c.name ? c.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <strong style={{ color: '#38243F' }}>{c.name || 'Anonymous'}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#666' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12}/> {c.email}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{c.phone}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#666' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={12}/> {c.city || '-'}</span>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#38243F' }}>{c.total_orders}</td>
                  <td style={{ padding: '16px 24px', color: '#38243F', fontWeight: 500 }}>₹{Number(c.total_spent).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '16px 24px', color: '#666' }}>{new Date(c.last_order_date).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
