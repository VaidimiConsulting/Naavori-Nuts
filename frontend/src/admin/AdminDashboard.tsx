import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ grossSales: 0, totalOrders: 0, pendingPacking: 0, outForDelivery: 0 });
  
  useEffect(() => {
    api.get('/admin/dashboard/stats')
      .then(res => {
        if (res.data.success) {
          setStats(res.data.data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', marginBottom: '24px', color: '#38243F' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard title="Gross Sales (All Time)" value={`₹${stats.grossSales.toLocaleString('en-IN')}`} trend="Live" positive={true} />
        <StatCard title="Total Orders" value={stats.totalOrders.toString()} trend="Live" positive={true} />
        <StatCard title="Pending Packing" value={stats.pendingPacking.toString()} alert={stats.pendingPacking > 0} />
        <StatCard title="Out for Delivery" value={stats.outForDelivery.toString()} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #EAEAEA' }}>
          <h3 style={{ fontFamily: 'DM Sans', fontSize: '16px', marginBottom: '16px' }}>Sales Trend</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', color: '#888' }}>
            [Live Chart Data Connection Pending]
          </div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #EAEAEA' }}>
          <h3 style={{ fontFamily: 'DM Sans', fontSize: '16px', marginBottom: '16px' }}>Action Items</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '12px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <span>New Orders to Confirm</span>
              <strong style={{ color: '#D4AF37' }}>{stats.pendingPacking}</strong>
            </li>
            <li style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>Unassigned Deliveries</span>
              <strong>0</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, positive, alert }: { title: string, value: string, trend?: string, positive?: boolean, alert?: boolean }) {
  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #EAEAEA' }}>
      <h3 style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#666', fontWeight: 500, margin: '0 0 8px 0' }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '28px', fontWeight: 600, color: alert ? 'red' : '#38243F' }}>{value}</span>
        {trend && (
          <span style={{ fontSize: '14px', fontWeight: 500, color: positive ? 'green' : 'red' }}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
