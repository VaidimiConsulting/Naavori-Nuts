import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Printer, Truck, CheckCircle, XCircle, RotateCcw, PackageCheck } from 'lucide-react';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/admin/orders/${id}`);
      setOrder(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      fetchOrder();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleDownloadInvoice = () => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    window.open(`${baseURL}/admin/orders/${id}/invoice`, '_blank');
  };

  if (loading) return <div style={{ padding: '24px', fontFamily: 'DM Sans' }}>Loading order details...</div>;
  if (!order) return <div style={{ padding: '24px', fontFamily: 'DM Sans' }}>Order not found.</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38243F' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '32px', color: '#38243F', margin: 0 }}>
            Order #{order.order_number}
          </h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleDownloadInvoice}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#38243F', color: '#FDFBF7', border: 'none', borderRadius: '6px', fontFamily: 'DM Sans', cursor: 'pointer', fontWeight: 600 }}
          >
            <Printer size={16} /> Download Tax Invoice
          </button>
          <button 
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'DM Sans', cursor: 'pointer' }}
          >
            <Printer size={16} /> Print View
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Items */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', padding: '24px' }}>
            <h3 style={{ fontFamily: 'DM Sans', margin: '0 0 16px 0', fontSize: '16px' }}>Items ({order.items?.length || 0})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '14px' }}>
              <thead>
                <tr style={{ color: '#888', borderBottom: '1px solid #EAEAEA' }}>
                  <th style={{ paddingBottom: '12px', fontWeight: 500 }}>Product</th>
                  <th style={{ paddingBottom: '12px', fontWeight: 500 }}>Price</th>
                  <th style={{ paddingBottom: '12px', fontWeight: 500 }}>Qty</th>
                  <th style={{ paddingBottom: '12px', fontWeight: 500, textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #EAEAEA' }}>
                    <td style={{ padding: '16px 0' }}>
                      <strong>{item.product_name}</strong><br/>
                      <span style={{ color: '#888', fontSize: '13px' }}>{item.weight_label} {item.is_custom ? '(Custom Edit)' : ''}</span>
                    </td>
                    <td style={{ padding: '16px 0' }}>₹{item.price_per_unit}</td>
                    <td style={{ padding: '16px 0' }}>{item.quantity}</td>
                    <td style={{ padding: '16px 0', textAlign: 'right' }}><strong>₹{item.total_price}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', fontFamily: 'DM Sans', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}><span>Subtotal</span> <span>₹{order.subtotal}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}><span>Discount</span> <span>-₹{order.discount}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}><span>Shipping</span> <span>₹{order.shipping_charge}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}><span>GST</span> <span>₹{order.gst_amount}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px', fontWeight: 700, fontSize: '16px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #EAEAEA' }}>
                <span>Total</span> <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', padding: '24px' }}>
            <h3 style={{ fontFamily: 'DM Sans', margin: '0 0 16px 0', fontSize: '16px' }}>Status Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order.history?.map((h: any, i: number) => (
                <div key={h.id} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: i === 0 ? '#38243F' : '#ccc' }} />
                    {i !== order.history.length - 1 && <div style={{ width: '2px', height: '100%', backgroundColor: '#eee', margin: '4px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: '16px', fontFamily: 'DM Sans', fontSize: '14px' }}>
                    <strong style={{ display: 'block', color: i === 0 ? '#38243F' : '#888' }}>{h.status.toUpperCase()}</strong>
                    <span style={{ color: '#888', fontSize: '12px' }}>{new Date(h.created_at).toLocaleString()}</span>
                    {h.note && <p style={{ margin: '4px 0 0 0', color: '#666' }}>{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Actions */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', padding: '24px' }}>
            <h3 style={{ fontFamily: 'DM Sans', margin: '0 0 16px 0', fontSize: '16px' }}>Update Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => updateStatus('confirmed')} disabled={order.order_status !== 'placed'} style={{ padding: '10px', backgroundColor: order.order_status === 'placed' ? '#38243F' : '#f0f0f0', color: order.order_status === 'placed' ? '#fff' : '#aaa', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> Confirm Order
              </button>
              <button onClick={() => updateStatus('packed')} disabled={order.order_status !== 'confirmed'} style={{ padding: '10px', backgroundColor: order.order_status === 'confirmed' ? '#38243F' : '#f0f0f0', color: order.order_status === 'confirmed' ? '#fff' : '#aaa', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <PackageCheck size={16} /> Mark as Packed
              </button>
              <button onClick={() => updateStatus('out_for_delivery')} disabled={order.order_status !== 'packed'} style={{ padding: '10px', backgroundColor: order.order_status === 'packed' ? '#D4AF37' : '#f0f0f0', color: order.order_status === 'packed' ? '#fff' : '#aaa', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <Truck size={16} /> Assign & Ship
              </button>
              <button onClick={() => updateStatus('delivered')} disabled={order.order_status !== 'out_for_delivery'} style={{ padding: '10px', backgroundColor: order.order_status === 'out_for_delivery' ? '#52c41a' : '#f0f0f0', color: order.order_status === 'out_for_delivery' ? '#fff' : '#aaa', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> Mark Delivered
              </button>
              <div style={{ height: '1px', backgroundColor: '#EAEAEA', margin: '8px 0' }} />
              <button onClick={() => updateStatus('cancelled')} style={{ padding: '10px', backgroundColor: 'transparent', color: 'red', border: '1px solid red', borderRadius: '6px', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <XCircle size={16} /> Cancel Order
              </button>
            </div>
          </div>

          {/* Customer */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', padding: '24px' }}>
            <h3 style={{ fontFamily: 'DM Sans', margin: '0 0 16px 0', fontSize: '16px' }}>Customer Details</h3>
            <div style={{ fontFamily: 'DM Sans', fontSize: '14px', lineHeight: '1.6', color: '#38243F' }}>
              <strong>{order.shipping_name}</strong><br/>
              Phone: {order.shipping_phone}<br/>
              Email: {order.guest_email || 'Registered User'}
            </div>
            <div style={{ height: '1px', backgroundColor: '#EAEAEA', margin: '16px 0' }} />
            <h3 style={{ fontFamily: 'DM Sans', margin: '0 0 16px 0', fontSize: '14px', color: '#888' }}>Shipping Address</h3>
            <div style={{ fontFamily: 'DM Sans', fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
              {order.shipping_address_line1}<br/>
              {order.shipping_address_line2 && <>{order.shipping_address_line2}<br/></>}
              {order.shipping_city}, {order.shipping_state}<br/>
              PIN: {order.shipping_pin_code}
            </div>
          </div>

          {/* Payment */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', padding: '24px' }}>
            <h3 style={{ fontFamily: 'DM Sans', margin: '0 0 16px 0', fontSize: '16px' }}>Payment Info</h3>
            <div style={{ fontFamily: 'DM Sans', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Method</span>
                <strong>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Gateway'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Status</span>
                <strong style={{ color: order.payment_status === 'paid' ? '#52c41a' : '#fa8c16' }}>
                  {order.payment_status.toUpperCase()}
                </strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
