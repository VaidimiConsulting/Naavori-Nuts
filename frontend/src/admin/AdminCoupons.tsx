import { useState, useEffect } from 'react';
import api from '../services/api';
import { Tag, Plus, Trash2, Power, Percent, CircleDollarSign } from 'lucide-react';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_order_value: '',
    max_discount: '',
    expiry_date: '',
    usage_limit: ''
  });
  const [toast, setToast] = useState('');

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/admin/coupons');
      setCoupons(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', newCoupon);
      setToast('Coupon created successfully!');
      setShowModal(false);
      setNewCoupon({ code: '', type: 'percentage', value: '', min_order_value: '', max_discount: '', expiry_date: '', usage_limit: '' });
      fetchCoupons();
      setTimeout(() => setToast(''), 3000);
    } catch (error: any) {
      setToast(error.response?.data?.message || 'Failed to create coupon.');
    }
  };

  const toggleStatus = async (id: string, currentStatus: number) => {
    try {
      await api.patch(`/admin/coupons/${id}/status`, { is_active: currentStatus ? 0 : 1 });
      fetchCoupons();
    } catch (error) {
      console.error('Failed to toggle status');
    }
  };

  const deleteCoupon = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      try {
        await api.delete(`/admin/coupons/${id}`);
        fetchCoupons();
      } catch (error) {
        console.error('Failed to delete');
      }
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', color: '#38243F', margin: 0 }}>Coupons & Discounts</h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>Manage promo codes and special offers</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ padding: '10px 20px', backgroundColor: '#38243F', color: '#fff', border: 'none', borderRadius: '6px', fontFamily: 'DM Sans', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {toast && <div style={{ padding: '12px', backgroundColor: '#e6f7ff', color: '#1890ff', borderRadius: '6px', marginBottom: '24px', fontFamily: 'DM Sans' }}>{toast}</div>}

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Sans' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDFBF7', borderBottom: '1px solid #EAEAEA', textAlign: 'left' }}>
              <th style={{ padding: '16px', fontWeight: 600, color: '#38243F' }}>Code</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#38243F' }}>Discount</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#38243F' }}>Conditions</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#38243F' }}>Usage</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#38243F' }}>Status</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#38243F', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>Loading coupons...</td></tr> :
             coupons.length === 0 ? <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No coupons found. Create one!</td></tr> :
             coupons.map((coupon) => (
              <tr key={coupon.id} style={{ borderBottom: '1px solid #EAEAEA' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f9f9f9', padding: '6px 12px', borderRadius: '4px', border: '1px dashed #ccc' }}>
                    <Tag size={14} color="#D4AF37" />
                    <strong style={{ fontSize: '15px', color: '#38243F', letterSpacing: '1px' }}>{coupon.code}</strong>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '15px', color: '#52c41a', fontWeight: 'bold' }}>
                    {coupon.type === 'percentage' ? <Percent size={14}/> : <CircleDollarSign size={14}/>}
                    {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#666' }}>
                  Min order: ₹{coupon.min_order_value}<br/>
                  {coupon.max_discount && `Max discount: ₹${coupon.max_discount}`}
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#666' }}>
                  {coupon.used_count} / {coupon.usage_limit || '∞'} times used
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ backgroundColor: coupon.is_active ? '#e6f7ff' : '#f5f5f5', color: coupon.is_active ? '#1890ff' : '#888', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button onClick={() => toggleStatus(coupon.id, coupon.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', marginRight: '12px' }} title="Toggle Status">
                    <Power size={18} color={coupon.is_active ? '#1890ff' : '#888'} />
                  </button>
                  <button onClick={() => deleteCoupon(coupon.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f' }} title="Delete Coupon">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '24px', color: '#38243F', margin: '0 0 24px 0' }}>Create New Coupon</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'DM Sans' }}>
              
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: 500 }}>
                Coupon Code (e.g. DIWALI20)
                <input required type="text" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', textTransform: 'uppercase' }} value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: 500 }}>
                  Discount Type
                  <select style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: 500 }}>
                  Discount Value
                  <input required type="number" step="0.01" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: e.target.value})} />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: 500 }}>
                  Min Order Value (₹)
                  <input type="number" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} value={newCoupon.min_order_value} onChange={e => setNewCoupon({...newCoupon, min_order_value: e.target.value})} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: 500 }}>
                  Max Discount (₹) <small style={{ fontWeight: 'normal', color: '#888' }}>(for percentage)</small>
                  <input type="number" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} value={newCoupon.max_discount} onChange={e => setNewCoupon({...newCoupon, max_discount: e.target.value})} />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: 500 }}>
                  Expiry Date (Optional)
                  <input type="datetime-local" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} value={newCoupon.expiry_date} onChange={e => setNewCoupon({...newCoupon, expiry_date: e.target.value})} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: 500 }}>
                  Usage Limit (Optional)
                  <input type="number" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} placeholder="e.g. 100 uses total" value={newCoupon.usage_limit} onChange={e => setNewCoupon({...newCoupon, usage_limit: e.target.value})} />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', backgroundColor: '#f5f5f5', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#38243F', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
