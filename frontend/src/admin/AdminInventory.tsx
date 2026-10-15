import { useState, useEffect } from 'react';
import { Search, Plus, AlertTriangle, ArrowDown, ArrowUp, Calendar, Check, X, Loader2, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function AdminInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'expiring_soon'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    variant_id: '',
    batch_no: '',
    quantity: 50,
    cost_per_unit: 0,
    expiry_date: '',
    supplier_id: '',
    invoice_number: ''
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (filter !== 'all') params.filter = filter;

      const { data } = await api.get('/admin/inventory', { params });
      setInventory(data.data || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  // Load dropdowns on modal open
  useEffect(() => {
    if (showAddModal) {
      api.get('/admin/inventory/variants')
        .then(res => setVariants(res.data.data || []))
        .catch(console.error);

      api.get('/admin/inventory/suppliers')
        .then(res => setSuppliers(res.data.data || []))
        .catch(console.error);
    }
  }, [showAddModal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleAdjustStock = async (variantId: string, delta: number) => {
    try {
      setActionLoading(variantId);
      await api.patch(`/admin/inventory/variants/${variantId}/stock`, { delta });
      // Update local state smoothly
      setInventory(prev => prev.map(item => {
        if (item.variant_id === variantId) {
          const newQty = Math.max(0, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      }));
    } catch (err) {
      console.error('Failed to adjust stock:', err);
      alert('Failed to update stock');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.variant_id || !formData.quantity) {
      return alert('Please select a product variant and quantity');
    }

    try {
      setSubmitting(true);
      await api.post('/admin/inventory/purchase', formData);
      setShowAddModal(false);
      setFormData({
        variant_id: '',
        batch_no: '',
        quantity: 50,
        cost_per_unit: 0,
        expiry_date: '',
        supplier_id: '',
        invoice_number: ''
      });
      fetchInventory();
    } catch (err) {
      console.error('Failed to record purchase entry:', err);
      alert('Failed to save purchase entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '32px', color: '#38243F', margin: 0 }}>Inventory Ledger</h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>Manage live stock, batch tracking (FEFO), and restock alerts</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={fetchInventory}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'DM Sans', cursor: 'pointer', fontWeight: 600, color: '#555' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#38243F', color: '#FDFBF7', border: 'none', borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer' }}
          >
            <Plus size={18} /> Add Purchase Entry
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAEAEA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search by SKU, Batch, or Product..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }} 
            />
          </form>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setFilter('all')}
              style={{ padding: '6px 14px', borderRadius: '20px', border: filter === 'all' ? '1px solid #38243F' : '1px solid #ddd', background: filter === 'all' ? '#38243F' : '#fff', color: filter === 'all' ? '#fff' : '#555', fontFamily: 'DM Sans', fontSize: '13px', cursor: 'pointer' }}
            >
              All Items
            </button>
            <button 
              onClick={() => setFilter('low_stock')}
              style={{ padding: '6px 14px', borderRadius: '20px', border: filter === 'low_stock' ? '1px solid #cf1322' : '1px solid #ddd', background: filter === 'low_stock' ? '#fff1f0' : '#fff', color: filter === 'low_stock' ? '#cf1322' : '#555', fontFamily: 'DM Sans', fontSize: '13px', cursor: 'pointer', fontWeight: filter === 'low_stock' ? 600 : 400 }}
            >
              Low Stock (&le; 20)
            </button>
            <button 
              onClick={() => setFilter('expiring_soon')}
              style={{ padding: '6px 14px', borderRadius: '20px', border: filter === 'expiring_soon' ? '1px solid #fa8c16' : '1px solid #ddd', background: filter === 'expiring_soon' ? '#fff7e6' : '#fff', color: filter === 'expiring_soon' ? '#fa8c16' : '#555', fontFamily: 'DM Sans', fontSize: '13px', cursor: 'pointer', fontWeight: filter === 'expiring_soon' ? 600 : 400 }}
            >
              Expiring Soon (FEFO)
            </button>
          </div>
        </div>

        {/* List Table */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#888', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Loader2 size={20} className="spin" /> Loading inventory ledger...
          </div>
        ) : inventory.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888', fontFamily: 'DM Sans' }}>
            No inventory records found matching your filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '14px' }}>
              <thead style={{ backgroundColor: '#f9f9f9', color: '#666', borderBottom: '1px solid #EAEAEA' }}>
                <tr>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Product & SKU</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Variant</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Batch No.</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Expiry Date</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Qty on Hand</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Quick Adjust</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => {
                  const isLow = item.qty <= (item.threshold || 20);
                  const expiryDate = item.expiry ? new Date(item.expiry) : null;
                  const isExpiringSoon = expiryDate && (expiryDate.getTime() - Date.now() < 60 * 24 * 60 * 60 * 1000);

                  return (
                    <tr key={item.variant_id} style={{ borderBottom: '1px solid #EAEAEA', backgroundColor: isLow ? '#fffbfa' : 'transparent' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <strong style={{ display: 'block', color: '#38243F' }}>{item.name}</strong>
                        <span style={{ fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>{item.sku}</span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#555' }}>
                        <span style={{ background: '#f5f5f5', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {item.weight_label || 'Standard'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: '#555' }}>{item.batch || '—'}</td>
                      <td style={{ padding: '16px 20px', color: isExpiringSoon ? '#d46b08' : '#555' }}>
                        {expiryDate ? expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <strong style={{ color: isLow ? '#cf1322' : '#38243F', fontSize: '16px' }}>{item.qty}</strong>
                        <span style={{ color: '#888', fontSize: '11px', display: 'block' }}>Min: {item.threshold || 20}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {isLow ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#cf1322', backgroundColor: '#fff1f0', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            <AlertTriangle size={12} /> LOW STOCK
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', color: '#389e0d', backgroundColor: '#f6ffed', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            HEALTHY
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button 
                            disabled={actionLoading === item.variant_id}
                            onClick={() => handleAdjustStock(item.variant_id, -1)} 
                            title="Deduct 1"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', color: '#cf1322' }}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button 
                            disabled={actionLoading === item.variant_id}
                            onClick={() => handleAdjustStock(item.variant_id, 1)} 
                            title="Add 1"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', color: '#389e0d' }}
                          >
                            <ArrowUp size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Purchase Entry Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', maxWidth: '520px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'DM Sans', fontSize: '24px', margin: 0, color: '#38243F' }}>Record Purchase & Stock Batch</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20}/></button>
            </div>

            <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#38243F', marginBottom: '6px' }}>Select Product Variant *</label>
                <select 
                  required
                  value={formData.variant_id}
                  onChange={(e) => setFormData({ ...formData, variant_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }}
                >
                  <option value="">-- Choose Product Variant --</option>
                  {variants.map(v => (
                    <option key={v.variant_id} value={v.variant_id}>
                      {v.product_name} - {v.weight_label} ({v.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#38243F', marginBottom: '6px' }}>Batch Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. B-2412"
                    value={formData.batch_no}
                    onChange={(e) => setFormData({ ...formData, batch_no: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#38243F', marginBottom: '6px' }}>Quantity Received *</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#38243F', marginBottom: '6px' }}>Cost Per Unit (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#38243F', marginBottom: '6px' }}>Expiry Date (FEFO)</label>
                  <input 
                    type="date" 
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#38243F', marginBottom: '6px' }}>Supplier</label>
                  <select 
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }}
                  >
                    <option value="">-- Direct / In-house --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#38243F', marginBottom: '6px' }}>Invoice No.</label>
                  <input 
                    type="text" 
                    placeholder="e.g. INV-904"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontFamily: 'DM Sans' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#38243F', color: '#fff', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans' }}
                >
                  {submitting ? 'Saving...' : 'Add to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
