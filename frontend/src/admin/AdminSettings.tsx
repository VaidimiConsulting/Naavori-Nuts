import { useState, useEffect } from 'react';
import api from '../services/api';
import { Save, Store, Mail, ShieldCheck } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    store_name: 'NAAVORI NUTS',
    support_email: 'info@naavori.in',
    support_phone: '+91 83188 19334 / +91 84481 70969',
    owner_phone: '+91 83188 19334, +91 84481 70969',
    currency: 'INR',
    tax_rate: '5',
    free_shipping_threshold: '',
    flat_shipping_rate: '80',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/admin/config/settings').then(({ data }) => {
      if (data.success && Object.keys(data.data).length > 0) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/config/settings', settings);
      setToast('Settings saved successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (error) {
      setToast('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '32px', color: '#38243F', margin: 0 }}>Store Settings</h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>Configure global store preferences</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{ padding: '12px 24px', backgroundColor: '#38243F', color: '#fff', border: 'none', borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {toast && <div style={{ padding: '12px', backgroundColor: '#e6f7ff', color: '#1890ff', borderRadius: '6px', marginBottom: '24px', fontFamily: 'DM Sans' }}>{toast}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* General Info */}
        <section style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAEAEA', backgroundColor: '#FDFBF7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={18} color="#D4AF37" /> <strong style={{ fontFamily: 'DM Sans', color: '#38243F' }}>General Information</strong>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', fontWeight: 500 }}>
              Store Name
              <input type="text" name="store_name" value={settings.store_name} onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', fontWeight: 500 }}>
                Support Email
                <input type="email" name="support_email" value={settings.support_email} onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', fontWeight: 500 }}>
                Support Phone
                <input type="text" name="support_phone" value={settings.support_phone} onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} />
              </label>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', fontWeight: 500 }}>
              Owner Direct Phone Numbers
              <input type="text" name="owner_phone" value={settings.owner_phone} onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="+91 83188 19334, +91 84481 70969" />
              <small style={{ color: '#888' }}>Official contact numbers displayed on contact page and invoices.</small>
            </label>
          </div>
        </section>

        {/* E-commerce Settings */}
        <section style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAEAEA', backgroundColor: '#FDFBF7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#D4AF37" /> <strong style={{ fontFamily: 'DM Sans', color: '#38243F' }}>Commerce & Shipping</strong>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', fontWeight: 500 }}>
                Currency
                <input type="text" name="currency" value={settings.currency} onChange={handleChange} disabled style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', backgroundColor: '#f5f5f5' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', fontWeight: 500 }}>
                Default Tax Rate (%)
                <input type="number" name="tax_rate" value={settings.tax_rate} onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', fontWeight: 500 }}>
                Flat Shipping Rate (₹)
                <input type="number" name="flat_shipping_rate" value={settings.flat_shipping_rate} onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', fontWeight: 500 }}>
                Free Shipping Threshold (₹)
                <input type="number" name="free_shipping_threshold" value={settings.free_shipping_threshold} onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} />
                <small style={{ color: '#888' }}>Orders above this amount get free shipping.</small>
              </label>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
