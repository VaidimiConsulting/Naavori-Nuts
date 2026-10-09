import { useState, useEffect } from 'react';
import api from '../services/api';
import { Square, PackageCheck, AlertCircle, Inbox, CheckCircle2 } from 'lucide-react';

export default function AdminPackingBoard() {
  const [toPack, setToPack] = useState<any[]>([]);
  const [packed, setPacked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPackingQueue = async () => {
    try {
      const { data } = await api.get('/admin/orders'); 
      const ordersToPack = data.data.filter((o: any) => o.order_status === 'placed' || o.order_status === 'confirmed');
      const ordersPacked = data.data.filter((o: any) => o.order_status === 'packed');
      
      const fetchDetails = async (orders: any[]) => Promise.all(
        orders.map(async (order: any) => {
          const res = await api.get(`/admin/orders/${order.id}`);
          return res.data.data;
        })
      );
      
      const detailedToPack = await fetchDetails(ordersToPack);
      const detailedPacked = await fetchDetails(ordersPacked);
      
      setToPack(detailedToPack);
      setPacked(detailedPacked);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackingQueue();
    const interval = setInterval(fetchPackingQueue, 15000); 
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
    } catch (error) {
      console.error(`Failed to update to ${newStatus}`, error);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string, source: 'toPack' | 'packed') => {
    e.dataTransfer.setData('orderId', id);
    e.dataTransfer.setData('source', source);
  };

  const handleDrop = (e: React.DragEvent, target: 'toPack' | 'packed') => {
    e.preventDefault();
    const id = e.dataTransfer.getData('orderId');
    const source = e.dataTransfer.getData('source');

    if (source === target) return;

    if (source === 'toPack' && target === 'packed') {
      const order = toPack.find(o => o.id === id);
      if (order) {
        setToPack(prev => prev.filter(o => o.id !== id));
        setPacked(prev => [order, ...prev]);
        updateOrderStatus(id, 'packed');
      }
    } else if (source === 'packed' && target === 'toPack') {
      const order = packed.find(o => o.id === id);
      if (order) {
        setPacked(prev => prev.filter(o => o.id !== id));
        setToPack(prev => [...prev, order]);
        updateOrderStatus(id, 'confirmed');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const OrderCard = ({ order, source, isPriority = false }: { order: any, source: 'toPack' | 'packed', isPriority?: boolean }) => (
    <div 
      draggable 
      onDragStart={(e) => handleDragStart(e, order.id, source)}
      style={{ 
        backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', 
        display: 'flex', flexDirection: 'column', cursor: 'grab', marginBottom: '16px',
        boxShadow: isPriority ? '0 4px 12px rgba(212, 175, 55, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
      }}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEAEA', backgroundColor: isPriority ? '#FDFBF7' : '#fff', borderRadius: '8px 8px 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <strong style={{ fontFamily: 'DM Sans', fontSize: '15px', color: '#38243F' }}>{order.order_number}</strong>
          {isPriority && <span style={{ backgroundColor: '#fff2e8', color: '#fa541c', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={10}/> PRIORITY</span>}
        </div>
        <div style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#666' }}>{order.shipping_name} • {order.shipping_city}</div>
      </div>
      <div style={{ padding: '12px 16px' }}>
        {order.items && order.items.map((item: any) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
            <span style={{ color: source === 'packed' ? '#52c41a' : '#ddd', marginTop: '2px' }}>{source === 'packed' ? <CheckCircle2 size={16}/> : <Square size={16} />}</span>
            <div style={{ fontFamily: 'DM Sans', fontSize: '13px' }}>
              <strong style={{ color: '#38243F' }}>{item.product_name}</strong><br/>
              <span style={{ color: '#888', fontSize: '12px' }}>{item.weight_label} • Qty: {item.quantity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', color: '#38243F', margin: 0 }}>Packing Board</h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>Drag and drop to pack orders.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#52c41a', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: '#52c41a', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Live Queue Active
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '24px', overflow: 'hidden' }}>
        
        {/* TO PACK COLUMN */}
        <div 
          onDrop={(e) => handleDrop(e, 'toPack')} 
          onDragOver={handleDragOver}
          style={{ flex: 1, backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'flex', flexDirection: 'column', border: '1px dashed #ddd' }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #EAEAEA', backgroundColor: '#fff', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ fontFamily: 'DM Sans', color: '#38243F', display: 'flex', alignItems: 'center', gap: '8px' }}><Inbox size={18} /> TO PACK</strong>
            <span style={{ backgroundColor: '#EAEAEA', color: '#666', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{toPack.length}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {loading && toPack.length === 0 ? <div style={{ color: '#888', textAlign: 'center', fontSize: '14px' }}>Loading...</div> : 
             toPack.length === 0 ? <div style={{ color: '#888', textAlign: 'center', fontSize: '14px', marginTop: '40px' }}>All caught up!</div> : 
             toPack.map((order, idx) => <OrderCard key={order.id} order={order} source="toPack" isPriority={idx === 0} />)}
          </div>
        </div>

        {/* PACKED COLUMN */}
        <div 
          onDrop={(e) => handleDrop(e, 'packed')} 
          onDragOver={handleDragOver}
          style={{ flex: 1, backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'flex', flexDirection: 'column', border: '1px dashed #ddd' }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #EAEAEA', backgroundColor: '#fff', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ fontFamily: 'DM Sans', color: '#52c41a', display: 'flex', alignItems: 'center', gap: '8px' }}><PackageCheck size={18} /> PACKED</strong>
            <span style={{ backgroundColor: '#EAEAEA', color: '#666', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{packed.length}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {loading && packed.length === 0 ? <div style={{ color: '#888', textAlign: 'center', fontSize: '14px' }}>Loading...</div> : 
             packed.length === 0 ? <div style={{ color: '#888', textAlign: 'center', fontSize: '14px', marginTop: '40px' }}>Drop packed orders here.</div> : 
             packed.map((order) => <OrderCard key={order.id} order={order} source="packed" />)}
          </div>
        </div>

      </div>
    </div>
  );
}
