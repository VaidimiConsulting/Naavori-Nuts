import { useState, useEffect } from 'react';
import api from '../services/api';
import { Truck, MapPin, CheckCircle2, Phone, User, Package } from 'lucide-react';

export default function AdminDeliveries() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
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
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      fetchDeliveries(); // Refresh list to move the card
    } catch (error) {
      console.error(`Failed to update to ${newStatus}`, error);
    }
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

  const Column = ({ title, statusKey, ordersList, nextAction, nextStatus }: any) => (
    <div style={{ flex: 1, backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'flex', flexDirection: 'column', border: '1px solid #EAEAEA', minWidth: '300px' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #EAEAEA', backgroundColor: '#fff', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between' }}>
        <strong style={{ fontFamily: 'DM Sans', color: '#38243F' }}>{title}</strong>
        <span style={{ backgroundColor: '#EAEAEA', color: '#666', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{ordersList.length}</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {ordersList.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', fontSize: '14px', marginTop: '40px' }}>No orders in this stage.</div>
        ) : (
          ordersList.map((order: any) => {
            const statusUi = getStatusColor(order.order_status);
            return (
              <div key={order.id} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEAEA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontFamily: 'DM Sans', fontSize: '15px', color: '#38243F' }}>{order.order_number}</strong>
                    <span style={{ backgroundColor: statusUi.bg, color: statusUi.color, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                      {statusUi.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'DM Sans', fontSize: '13px', color: '#666' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={12}/> {order.shipping_name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12}/> {order.shipping_phone || 'No phone'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={12}/> {order.shipping_city}, {order.shipping_pin_code}</span>
                  </div>
                </div>
                {nextAction && (
                  <div style={{ padding: '12px 16px', backgroundColor: '#FDFBF7', borderRadius: '0 0 8px 8px' }}>
                    <button 
                      onClick={() => updateStatus(order.id, nextStatus)}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#38243F', color: '#fff', border: 'none', borderRadius: '4px', fontFamily: 'DM Sans', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                    >
                      {nextAction}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', color: '#38243F', margin: 0 }}>Deliveries Management</h1>
        <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>Track and manage order shipments</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading deliveries...</div>
      ) : (
        <div style={{ flex: 1, display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
          <Column 
            title={<span><Package size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }}/> Ready for Pickup</span>}
            statusKey="packed" 
            ordersList={groupedOrders.packed} 
            nextAction={<>Hand over to Courier <Truck size={14}/></>}
            nextStatus="shipped"
          />
          <Column 
            title={<span><Truck size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }}/> In Transit</span>}
            statusKey="shipped" 
            ordersList={groupedOrders.shipped} 
            nextAction={<>Mark Out for Delivery <MapPin size={14}/></>}
            nextStatus="out_for_delivery"
          />
          <Column 
            title={<span><MapPin size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }}/> Out for Delivery</span>}
            statusKey="out_for_delivery" 
            ordersList={groupedOrders.outForDelivery} 
            nextAction={<>Mark as Delivered <CheckCircle2 size={14}/></>}
            nextStatus="delivered"
          />
        </div>
      )}
    </div>
  );
}
