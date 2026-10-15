import { useEffect, useState } from 'react';
import { User, Phone, Mail, MapPin, Package, FileText, LogOut, ArrowUpRight, ShoppingBag, Clock, CheckCircle, RotateCcw } from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';
import type { CustomerUser } from './CustomerAuth';

type CustomerAccountProps = {
  customer: CustomerUser;
  onLogout: () => void;
  navigate: (path: string) => void;
  onReorder?: (items: any[]) => void;
};

export function CustomerAccount({ customer, onLogout, navigate, onReorder }: CustomerAccountProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (customer?.email) {
      setLoadingOrders(true);
      api.get(`/public/orders/${encodeURIComponent(customer.email)}`)
        .then((res) => {
          if (res.data.success && Array.isArray(res.data.data)) {
            setOrders(res.data.data);
          }
        })
        .catch((err) => {
          console.error('Error fetching customer orders:', err);
        })
        .finally(() => {
          setLoadingOrders(false);
        });
    }
  }, [customer?.email]);

  const money = (val: number) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  const getStatusBadge = (status: string) => {
    const s = (status || 'placed').toLowerCase();
    let bg = 'rgba(183, 141, 82, 0.12)';
    let color = '#b78d52';
    if (s === 'delivered') { bg = 'rgba(46, 125, 50, 0.12)'; color = '#2e7d32'; }
    else if (s === 'shipped' || s === 'out_for_delivery') { bg = 'rgba(25, 118, 210, 0.12)'; color = '#1976d2'; }
    else if (s === 'cancelled' || s === 'returned') { bg = 'rgba(198, 40, 40, 0.12)'; color = '#c62828'; }
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: bg,
        color: color,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {s.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* Account Hero Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        padding: '32px 36px',
        background: '#ffffff',
        borderRadius: '18px',
        border: '1px solid rgba(56, 36, 63, 0.1)',
        boxShadow: '0 20px 50px rgba(56, 36, 63, 0.05)',
        marginBottom: '36px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--cream-deep, #e9ddcf)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--plum, #38243f)',
            fontWeight: 700,
            fontSize: '22px'
          }}>
            {customer.name ? customer.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <p className="eyebrow" style={{ color: 'var(--gold, #b78d52)', marginBottom: '4px' }}>NAAVORI Verified Patron</p>
            <h1 style={{ fontSize: '32px', margin: '0 0 6px', lineHeight: 1.1 }}>{customer.name}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--brown-soft, #6a554c)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {customer.email}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> +91 {customer.phone}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/shop')}
            className="button button--dark"
            style={{ padding: '10px 18px', fontSize: '12px' }}
          >
            Explore Collection <ArrowUpRight size={14} />
          </button>
          <button
            onClick={onLogout}
            className="button"
            style={{
              padding: '10px 18px',
              fontSize: '12px',
              background: 'rgba(198, 40, 40, 0.08)',
              color: '#c62828',
              border: '1px solid rgba(198, 40, 40, 0.2)'
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Orders Column */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', margin: 0 }}>Order <em>History</em></h2>
            <span style={{ fontSize: '13px', color: 'var(--brown-soft)' }}>
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Recorded
            </span>
          </div>

          {loadingOrders ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--brown-soft)' }}>
              Loading your live order records...
            </div>
          ) : orders.length === 0 ? (
            <div style={{
              background: '#ffffff',
              padding: '48px 32px',
              borderRadius: '16px',
              border: '1px solid rgba(56, 36, 63, 0.08)',
              textAlign: 'center'
            }}>
              <ShoppingBag size={36} style={{ color: 'var(--gold)', margin: '0 auto 16px', opacity: 0.6 }} />
              <h3 style={{ fontSize: '20px', margin: '0 0 8px' }}>No orders placed yet</h3>
              <p style={{ color: 'var(--brown-soft)', fontSize: '14px', maxWidth: '380px', margin: '0 auto 20px' }}>
                Your order bag is currently awaiting its first selection. Discover our hand-picked nuts, seeds, and spices.
              </p>
              <button className="button button--dark" onClick={() => navigate('/shop')}>
                Explore The Pantry <ArrowUpRight size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map((order) => {
                const dateStr = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });
                return (
                  <div key={order.id} style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid rgba(56, 36, 63, 0.08)',
                    padding: '24px',
                    boxShadow: '0 8px 24px rgba(48, 33, 29, 0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(56, 36, 63, 0.06)', paddingBottom: '16px', marginBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--plum)' }}>
                          Reference #{order.id}
                        </span>
                        <div style={{ fontSize: '12px', color: 'var(--brown-soft)', marginTop: '2px' }}>
                          Placed on {dateStr}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {getStatusBadge(order.status)}
                        <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--plum)' }}>
                          {money(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    {Array.isArray(order.items) && order.items.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--brown-soft)' }}>
                            <span>
                              <strong>{item.product_name}</strong> {item.weight_label && `(${item.weight_label})`} × {item.quantity}
                            </span>
                            <span>{money(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(56, 36, 63, 0.04)', fontSize: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ color: 'var(--brown-soft)' }}>
                        Delivery to: <strong>{order.shipping_city || 'Varanasi'}</strong> ({order.shipping_pin_code || '221001'})
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {onReorder && Array.isArray(order.items) && order.items.length > 0 && (
                          <button
                            onClick={() => onReorder(order.items)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'rgba(212, 175, 55, 0.1)',
                              border: '1px solid rgba(212, 175, 55, 0.4)',
                              color: '#38243F',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontFamily: 'DM Sans'
                            }}
                          >
                            <RotateCcw size={12} color="#D4AF37" /> Re-Order Items
                          </button>
                        )}
                        <a
                          href={`${API_BASE_URL}/public/orders/${order.id}/invoice`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: 'var(--gold)',
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                        >
                          <FileText size={14} /> Tax Invoice ↗
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Addresses & Patron Details Sidebar */}
        <div>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(56, 36, 63, 0.08)',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '18px', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} style={{ color: 'var(--gold)' }} />
              Saved Delivery Address
            </h3>

            {customer.addresses && customer.addresses.length > 0 ? (
              customer.addresses.map((addr: any, i: number) => (
                <div key={i} style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--brown-soft)' }}>
                  <strong>{addr.full_name || customer.name}</strong><br />
                  {addr.address_line1}<br />
                  {addr.address_line2 && <>{addr.address_line2}<br /></>}
                  {addr.city}, {addr.state} - {addr.pin_code}<br />
                  <span style={{ display: 'inline-block', marginTop: '6px' }}>Phone: +91 {addr.phone || customer.phone}</span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--brown-soft)', lineHeight: 1.6 }}>
                Primary address saved with your phone: +91 {customer.phone}. Address will auto-sync upon your next order.
              </div>
            )}
          </div>

          <div style={{
            background: 'rgba(56, 36, 63, 0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(56, 36, 63, 0.08)',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 12px' }}>Patron Concierge</h3>
            <p style={{ fontSize: '13px', color: 'var(--brown-soft)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Have questions regarding custom roast batches, festive hampers, or recurring pantry dispatches?
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="line-button"
              style={{ fontSize: '12px' }}
            >
              Reach Concierge <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
