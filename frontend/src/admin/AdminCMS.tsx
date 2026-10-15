import { useState, useEffect } from 'react';
import api from '../services/api';
import { Save, FileText, Image, LayoutTemplate, Megaphone } from 'lucide-react';

export default function AdminCMS() {
  const [cms, setCms] = useState({
    hero_headline: 'Pure origins. Real goodness.',
    hero_subheadline: 'A considered collection of nuts, seeds and spices — selected from India\'s richest regions.',
    announcement_bar: 'Pan-India delivery from Varanasi. Flat ₹80 shipping',
    about_text: 'We believe the best pantry staples carry a sense of place. In the way a walnut remembers a cold valley, or pepper holds the damp green air of the coast.',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/admin/config/cms').then(({ data }) => {
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        // CMS content might be nested JSON depending on how we saved it, but for simplicity we flatten it here
        const flatCms: any = {};
        for (const [key, value] of Object.entries(data.data)) {
           // We stored content as JSON string in DB, but api returns it parsed if DB driver does it, or string.
           let parsed = value;
           if (typeof value === 'string') {
             try { parsed = JSON.parse(value); } catch (e) {}
           }
           flatCms[key] = parsed;
        }
        setCms(prev => ({ ...prev, ...flatCms }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCms({ ...cms, [e.target.name]: e.target.value });
  };

  const handleSave = async (sectionKey: string, contentValue: any) => {
    setSaving(true);
    try {
      await api.post('/admin/config/cms', { section_key: sectionKey, content: contentValue });
      setToast('Content updated successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (error) {
      setToast('Failed to update content.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(cms)) {
        await api.post('/admin/config/cms', { section_key: key, content: value });
      }
      setToast('All content saved successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (error) {
      setToast('Failed to save some content.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '32px', color: '#38243F', margin: 0 }}>Content Management</h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>Manage website text, banners, and announcements</p>
        </div>
        <button 
          onClick={handleSaveAll} 
          disabled={saving}
          style={{ padding: '12px 24px', backgroundColor: '#D4AF37', color: '#fff', border: 'none', borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Publish All Changes'}
        </button>
      </div>

      {toast && <div style={{ padding: '12px', backgroundColor: '#e6f7ff', color: '#1890ff', borderRadius: '6px', marginBottom: '24px', fontFamily: 'DM Sans' }}>{toast}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top Announcement Bar */}
        <section style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAEAEA', backgroundColor: '#FDFBF7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={18} color="#D4AF37" /> <strong style={{ fontFamily: 'DM Sans', color: '#38243F' }}>Announcement Bar</strong>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', fontWeight: 500 }}>
              Promo Text
              <input type="text" name="announcement_bar" value={cms.announcement_bar} onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} />
              <small style={{ color: '#888' }}>This appears at the very top of the website on all pages.</small>
            </label>
          </div>
        </section>

        {/* Homepage Hero */}
        <section style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAEAEA', backgroundColor: '#FDFBF7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutTemplate size={18} color="#D4AF37" /> <strong style={{ fontFamily: 'DM Sans', color: '#38243F' }}>Homepage Hero Section</strong>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', fontWeight: 500 }}>
              Headline
              <input type="text" name="hero_headline" value={cms.hero_headline} onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', fontWeight: 500 }}>
              Sub-headline
              <textarea name="hero_subheadline" value={cms.hero_subheadline} onChange={handleChange} rows={3} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', resize: 'vertical' }} />
            </label>
          </div>
        </section>

        {/* About Section */}
        <section style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAEAEA', backgroundColor: '#FDFBF7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#D4AF37" /> <strong style={{ fontFamily: 'DM Sans', color: '#38243F' }}>"A Note from NAAVORI" Section</strong>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', fontWeight: 500 }}>
              Manifesto Paragraph
              <textarea name="about_text" value={cms.about_text} onChange={handleChange} rows={4} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', resize: 'vertical' }} />
            </label>
          </div>
        </section>

      </div>
    </div>
  );
}
