import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Phone,
  User,
  Package,
  Calendar,
  Clock,
  X,
  Loader2,
  RefreshCw,
  Navigation,
  MessageSquare,
  Compass,
  Check,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export default function AdminDeliveries() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [assignModalOrder, setAssignModalOrder] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [viewMode, setViewMode] = useState<'pipeline' | 'rider'>('pipeline');
  const [riderFilter, setRiderFilter] = useState<'all' | 'out_for_delivery' | 'shipped'>('all');

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/orders');
      // Fetch orders that are packed (ready to ship), shipped, or out for delivery
      const deliveryOrders = data.data.filter((o: any) => 
        ['packed', 'shipped', 'out_for_delivery'].includes(o.order_status)
      );
      setOrders(deliveryOrders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    api.get('/admin/deliveries/partners').then(res => setPartners(res.data.data || [])).catch(console.error);
    api.get('/admin/deliveries/slots').then(res => setSlots(res.data.data || [])).catch(console.error);
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      fetchDeliveries();
    } catch (error) {
      console.error(`Failed to update to ${newStatus}`, error);
    }
  };

  const handleAssignDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalOrder || !selectedPartner) return;

    try {
      setSubmittingAssign(true);
      await api.post('/admin/deliveries/assign', {
        order_id: assignModalOrder.id,
        partner_id: selectedPartner,
        slot_id: selectedSlot || null
      });
      setAssignModalOrder(null);
      fetchDeliveries();
    } catch (err) {
      console.error('Failed to assign delivery partner:', err);
      alert('Failed to assign delivery partner');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const getNavigationUrl = (order: any) => {
    const line1 = order.shipping_address_line1 || '';
    const line2 = order.shipping_address_line2 || '';
    const gpsMatch = line1.match(/\[GPS:\s*([0-9.-]+),\s*([0-9.-]+)\]/i);
    if (gpsMatch) {
      return `https://www.google.com/maps/dir/?api=1&destination=${gpsMatch[1]},${gpsMatch[2]}`;
    }
    const fullAddress = `${line1} ${line2}, ${order.shipping_city || ''}, ${order.shipping_state || ''} ${order.shipping_pin_code || ''}, India`.trim();
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'packed': return { bg: '#e6f7ff', color: '#1890ff', label: 'Ready for Pickup' };
      case 'shipped': return { bg: '#fff7e6', color: '#fa8c16', label: 'Shipped (In Transit)' };
      case 'out_for_delivery': return { bg: '#f6ffed', color: '#52c41a', label: 'Out for Delivery' };
      default: return { bg: '#f5f5f5', color: '#595959', label: status };
    }
  };

  const groupedOrders = {
    packed: orders.filter(o => o.order_status === 'packed'),
    shipped: orders.filter(o => o.order_status === 'shipped'),
    outForDelivery: orders.filter(o => o.order_status === 'out_for_delivery')
  };

  const riderFilteredOrders = orders.filter(o => {
    if (riderFilter === 'all') return true;
    return o.order_status === riderFilter;
  });

  const Column = ({ title, ordersList, nextAction, nextStatus, showAssign }: any) => (
    <div style={{ flex: 1, backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'flex', flexDirection: 'column', border: '1px solid #EAEAEA', minWidth: '340px' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #EAEAEA', backgroundColor: '#fff', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontFamily: 'DM Sans', color: '#38243F' }}>{title}</strong>
        <span style={{ backgroundColor: '#EAEAEA', color: '#666', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{ordersList.length}</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {ordersList.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', fontSize: '14px', marginTop: '40px', fontFamily: 'DM Sans' }}>No orders in this stage.</div>
        ) : (
          ordersList.map((order: any) => {
            const statusUi = getStatusColor(order.order_status);
            const navUrl = getNavigationUrl(order);
            const hasGps = (order.shipping_address_line1 || '').includes('[GPS:');
            return (
              <div key={order.id} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #EAEAEA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontFamily: 'DM Sans', fontSize: '15px', color: '#38243F' }}>#{order.order_number}</strong>
                    <span style={{ backgroundColor: statusUi.bg, color: statusUi.color, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                      {statusUi.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '13px', color: '#555' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={13}/> <strong>{order.shipping_name}</strong></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13}/> 
                      <a href={`tel:${order.shipping_phone}`} style={{ color: '#38243F', textDecoration: 'none', fontWeight: 500 }}>
                        +91 {order.shipping_phone || 'No phone'}
                      </a>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <MapPin size={13} style={{ marginTop: '3px', flexShrink: 0, color: '#b78d52' }}/> 
                      <span>
                        {order.shipping_address_line1} {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ''}<br />
                        <strong>{order.shipping_city}</strong>, {order.shipping_state} - {order.shipping_pin_code}
                      </span>
                    </span>
                    {hasGps && (
                      <span style={{ fontSize: '11px', color: '#2e7d32', backgroundColor: '#edf7ed', padding: '3px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                        <Compass size={11}/> Exact GPS Pinned
                      </span>
                    )}
                  </div>

                  {/* Direct GPS Navigation & Call Bar */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        backgroundColor: '#edf7ed',
                        color: '#1b5e20',
                        border: '1px solid #c8e6c9',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                      }}
                    >
                      <Navigation size={13} /> Live GPS Route
                    </a>
                    {order.shipping_phone && (
                      <a
                        href={`https://wa.me/91${order.shipping_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.shipping_name}, your Naavori Nuts order #${order.order_number} is out for delivery!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '7px 10px',
                          backgroundColor: '#f6ffed',
                          color: '#52c41a',
                          border: '1px solid #b7eb8f',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare size={13} />
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', backgroundColor: '#FDFBF7', borderRadius: '0 0 8px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {showAssign && (
                    <button 
                      onClick={() => {
                        setAssignModalOrder(order);
                        setSelectedPartner('');
                        setSelectedSlot('');
                      }}
                      style={{ width: '100%', padding: '7px', backgroundColor: '#fff', color: '#38243F', border: '1px solid #d4af37', borderRadius: '4px', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                    >
                      <User size={13} /> Assign Rider / Partner
                    </button>
                  )}

                  {nextAction && (
                    <button 
                      onClick={() => updateStatus(order.id, nextStatus)}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#38243F', color: '#fff', border: 'none', borderRadius: '4px', fontFamily: 'DM Sans', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: 500 }}
                    >
                      {nextAction}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '32px', color: '#38243F', margin: 0 }}>Deliveries & Dispatch</h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>Track live shipments, exact customer GPS navigation, and rider dispatch</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', backgroundColor: '#eee', borderRadius: '6px', padding: '3px' }}>
            <button
              onClick={() => setViewMode('pipeline')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: viewMode === 'pipeline' ? '#fff' : 'transparent',
                color: viewMode === 'pipeline' ? '#38243F' : '#666',
                fontWeight: 600,
                fontSize: '12px',
                fontFamily: 'DM Sans',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Package size={14} /> Pipeline Kanban
            </button>
            <button
              onClick={() => setViewMode('rider')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: viewMode === 'rider' ? '#38243F' : 'transparent',
                color: viewMode === 'rider' ? '#fff' : '#666',
                fontWeight: 600,
                fontSize: '12px',
                fontFamily: 'DM Sans',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Smartphone size={14} /> 🏍️ Rider GPS App Mode
            </button>
          </div>

          <button 
            onClick={fetchDeliveries}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'DM Sans', cursor: 'pointer', fontWeight: 600, color: '#555', fontSize: '13px' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#666', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Loader2 size={20} className="spin" /> Loading deliveries pipeline...
        </div>
      ) : viewMode === 'pipeline' ? (
        <div style={{ flex: 1, display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px' }}>
          <Column 
            title={<span><Package size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }}/> Ready for Pickup</span>}
            ordersList={groupedOrders.packed} 
            showAssign={true}
            nextAction={<>Hand over to Courier <Truck size={14}/></>}
            nextStatus="shipped"
          />
          <Column 
            title={<span><Truck size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }}/> In Transit</span>}
            ordersList={groupedOrders.shipped} 
            nextAction={<>Mark Out for Delivery <MapPin size={14}/></>}
            nextStatus="out_for_delivery"
          />
          <Column 
            title={<span><MapPin size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }}/> Out for Delivery</span>}
            ordersList={groupedOrders.outForDelivery} 
            nextAction={<>Confirm Delivery <CheckCircle2 size={14}/></>}
            nextStatus="delivered"
          />
        </div>
      ) : (
        /* Dedicated Rider / Delivery Driver App View */
        <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Rider App Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #38243F 0%, #5a3866 100%)',
            color: '#fff',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(56,36,63,0.15)',
          }}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#d4af37', fontWeight: 600 }}>Active Rider Console</span>
              <h2 style={{ fontFamily: 'DM Sans', fontSize: '20px', margin: '4px 0 0 0' }}>Live Delivery Route & GPS Assistant</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.85 }}>Tap any destination to open Google Maps Turn-by-Turn GPS navigation directly to customer.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#d4af37' }}>{orders.length}</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>Pending Shipments</div>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setRiderFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: riderFilter === 'all' ? '1px solid #38243F' : '1px solid #ddd',
                backgroundColor: riderFilter === 'all' ? '#38243F' : '#fff',
                color: riderFilter === 'all' ? '#fff' : '#555',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              All Active ({orders.length})
            </button>
            <button
              onClick={() => setRiderFilter('out_for_delivery')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: riderFilter === 'out_for_delivery' ? '1px solid #2e7d32' : '1px solid #ddd',
                backgroundColor: riderFilter === 'out_for_delivery' ? '#2e7d32' : '#fff',
                color: riderFilter === 'out_for_delivery' ? '#fff' : '#555',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Out for Delivery ({groupedOrders.outForDelivery.length})
            </button>
            <button
              onClick={() => setRiderFilter('shipped')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: riderFilter === 'shipped' ? '1px solid #fa8c16' : '1px solid #ddd',
                backgroundColor: riderFilter === 'shipped' ? '#fa8c16' : '#fff',
                color: riderFilter === 'shipped' ? '#fff' : '#555',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              In Transit ({groupedOrders.shipped.length})
            </button>
          </div>

          {/* Deliveries List */}
          {riderFilteredOrders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', color: '#888' }}>
              No deliveries matching this filter.
            </div>
          ) : (
            riderFilteredOrders.map((order) => {
              const navUrl = getNavigationUrl(order);
              const statusUi = getStatusColor(order.order_status);
              const hasGps = (order.shipping_address_line1 || '').includes('[GPS:');
              return (
                <div key={order.id} style={{
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '18px', color: '#38243F', fontFamily: 'DM Sans' }}>#{order.order_number}</strong>
                      <span style={{ marginLeft: '10px', backgroundColor: statusUi.bg, color: statusUi.color, padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        {statusUi.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#38243F' }}>
                      ₹{Math.round(Number(order.total) || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div style={{ backgroundColor: '#fcfcfc', borderRadius: '8px', padding: '12px 14px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#38243F' }}>
                      <User size={15} color="#38243F" /> {order.shipping_name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '13px', color: '#555' }}>
                      <MapPin size={15} color="#b78d52" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        {order.shipping_address_line1} {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ''}<br />
                        <strong>{order.shipping_city}</strong>, {order.shipping_state} - {order.shipping_pin_code}
                      </div>
                    </div>
                    {hasGps && (
                      <div style={{ fontSize: '11px', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Compass size={12}/> High-precision customer GPS coordinates included in route.
                      </div>
                    )}
                  </div>

                  {/* Big Touch Action Buttons for Delivery Rider */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#1b5e20',
                        color: '#fff',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 6px rgba(27, 94, 32, 0.25)',
                      }}
                    >
                      <Navigation size={16} /> 🗺️ Start Google Maps GPS
                    </a>

                    {order.shipping_phone && (
                      <a
                        href={`tel:${order.shipping_phone}`}
                        style={{
                          padding: '12px 16px',
                          backgroundColor: '#38243F',
                          color: '#fff',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: 600,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Phone size={16} /> Call (+91 {order.shipping_phone})
                      </a>
                    )}
                  </div>

                  {/* Delivery Status Progression */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                    {order.order_status === 'shipped' && (
                      <button
                        onClick={() => updateStatus(order.id, 'out_for_delivery')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: '#fa8c16',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Truck size={15} /> Mark Out for Delivery
                      </button>
                    )}

                    {order.order_status === 'out_for_delivery' && (
                      <button
                        onClick={() => {
                          if (confirm(`Confirm successful delivery for Order #${order.order_number}?`)) {
                            updateStatus(order.id, 'delivered');
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: '#2e7d32',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <CheckCircle2 size={15} /> ✅ Confirm Delivered to Customer
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Assign Partner Modal */}
      {assignModalOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', maxWidth: '440px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'DM Sans', fontSize: '24px', margin: 0, color: '#38243F' }}>
                Assign Delivery Partner
              </h2>
              <button onClick={() => setAssignModalOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20}/></button>
            </div>
            <p style={{ fontFamily: 'DM Sans', color: '#666', fontSize: '13px', margin: '0 0 20px 0' }}>
              Order #{assignModalOrder.order_number} to {assignModalOrder.shipping_city}
            </p>

            <form onSubmit={handleAssignDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#38243F', marginBottom: '6px', fontFamily: 'DM Sans' }}>Select Delivery Partner / Staff *</label>
                <select 
                  required
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }}
                >
                  <option value="">-- Choose Rider / Partner --</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.phone || p.email})</option>
                  ))}
                  {partners.length === 0 && (
                    <option value="default-partner">Store Dispatch Rider 1</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#38243F', marginBottom: '6px', fontFamily: 'DM Sans' }}>Preferred Delivery Slot</label>
                <select 
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }}
                >
                  <option value="">-- Any Time / Immediate --</option>
                  {slots.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  {slots.length === 0 && (
                    <>
                      <option value="slot-morning">Morning Slot (09:00 AM - 12:00 PM)</option>
                      <option value="slot-evening">Evening Slot (04:00 PM - 07:00 PM)</option>
                    </>
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setAssignModalOrder(null)}
                  style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontFamily: 'DM Sans' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingAssign}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#38243F', color: '#fff', fontWeight: 600, cursor: submittingAssign ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans' }}
                >
                  {submittingAssign ? 'Assigning...' : 'Assign & Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
