import { useState } from 'react';
import { Search, Plus, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

export default function AdminInventory() {
  // Mocking inventory for UI layout, will fetch from /api/v1/inventory later
  const [search, setSearch] = useState('');
  
  const inventory = [
    { id: 1, name: 'Premium Dry Coconut', hindi_name: 'सूखा नारियल', sku: 'COCO-250G', batch: 'B-2410', expiry: '2025-10-01', qty: 15, threshold: 20 },
    { id: 2, name: 'Jumbo Cashews', hindi_name: 'काजू', sku: 'CASH-500G', batch: 'B-2412', expiry: '2025-12-15', qty: 45, threshold: 20 },
    { id: 3, name: 'Kashmir Saffron', hindi_name: 'कश्मीरी केसर', sku: 'SAFF-2G', batch: 'B-2408', expiry: '2026-01-10', qty: 3, threshold: 10 },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', color: '#38243F', margin: 0 }}>Inventory Ledger</h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>Manage stock batches, expiry dates (FEFO), and alerts</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'DM Sans', cursor: 'pointer', fontWeight: 600 }}>
            Bulk Update CSV
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#38243F', color: '#FDFBF7', border: 'none', borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={18} /> Add Purchase Entry
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAEAEA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search by SKU, Batch, or Product..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd', background: '#fff', fontFamily: 'DM Sans', fontSize: '13px' }}>Low Stock</button>
             <button style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd', background: '#fff', fontFamily: 'DM Sans', fontSize: '13px' }}>Expiring Soon</button>
          </div>
        </div>

        {/* List */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#f9f9f9', color: '#666', borderBottom: '1px solid #EAEAEA' }}>
            <tr>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Product & SKU</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Batch No.</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Expiry Date</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Qty on Hand</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '16px 20px', fontWeight: 500, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => {
              const isLow = item.qty <= item.threshold;
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #EAEAEA', backgroundColor: isLow ? '#fffbfa' : 'transparent' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <strong style={{ display: 'block', color: '#38243F' }}>{item.name}{item.hindi_name && ` (${item.hindi_name})`}</strong>
                    <span style={{ fontSize: '12px', color: '#888' }}>{item.sku}</span>
                  </td>
                  <td style={{ padding: '16px 20px', fontFamily: 'monospace' }}>{item.batch}</td>
                  <td style={{ padding: '16px 20px' }}>{new Date(item.expiry).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <strong style={{ color: isLow ? 'red' : '#38243F', fontSize: '16px' }}>{item.qty}</strong>
                    <span style={{ color: '#888', fontSize: '12px', display: 'block' }}>Min: {item.threshold}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {isLow ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'red', fontSize: '12px', fontWeight: 600 }}>
                        <AlertTriangle size={14} /> LOW STOCK
                      </span>
                    ) : (
                      <span style={{ color: '#52c41a', fontSize: '12px', fontWeight: 600 }}>HEALTHY</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', color: 'red' }} aria-label="Deduct"><ArrowDown size={14}/></button>
                      <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', color: 'green' }} aria-label="Add"><ArrowUp size={14}/></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
