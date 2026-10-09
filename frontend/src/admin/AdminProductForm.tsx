import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Save, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function AdminProductForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    hindi_name: '',
    slug: '',
    category_id: '',
    origin: '',
    description: '',
    tag: '',
    packaging_key: 'pouch',
    is_active: true,
  });

  const [variants, setVariants] = useState([
    { weight_label: '250g', price: '', compare_at_price: '', sku: '' }
  ]);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const { id } = useParams<{id: string}>();

  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`).then(res => {
        const data = res.data.data;
        if (data) {
          setFormData({
            name: data.name || '',
            hindi_name: data.hindi_name || '',
            slug: data.slug || '',
            category_id: data.category_id || '',
            origin: data.origin || '',
            description: data.description || '',
            tag: data.tag || '',
            packaging_key: data.packaging_key || 'pouch',
            is_active: !!data.is_active,
          });
          if (data.variants && data.variants.length > 0) {
            setVariants(data.variants.map((v: any) => ({
              weight_label: v.weight_label || '',
              price: v.price || '',
              compare_at_price: v.compare_at_price || '',
              sku: v.sku || ''
            })));
          }
        }
      }).catch(err => console.error(err));
    }
  }, [id]);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addVariant = () => {
    setVariants([...variants, { weight_label: '', price: '', compare_at_price: '', sku: '' }]);
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug) {
        alert("URL Slug is required for saving images properly.");
        return;
    }
    setLoading(true);
    try {
      let productId = id;
      if (id) {
        await api.put(`/products/${id}`, formData);
      } else {
        const res = await api.post('/products', formData);
        productId = res.data.data.id;
      }

      // Upload Image
      if (imageFile) {
        const fileData = new FormData();
        fileData.append('image', imageFile);
        fileData.append('slug', formData.slug);
        await api.post('/products/upload', fileData, { headers: { 'Content-Type': 'multipart/form-data' }});
      }

      navigate('/admin/catalog');
    } catch (error) {
      console.error(error);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38243F' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', color: '#38243F', margin: 0 }}>{id ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <button style={{ padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'DM Sans', cursor: 'pointer', fontWeight: 600 }}>
            Save Draft
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#38243F', color: '#FDFBF7', border: 'none', borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer' }}>
            <Save size={16} /> {loading ? 'Saving...' : (id ? 'Update Product' : 'Publish Product')}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Navigation Sidebar */}
        <div style={{ position: 'sticky', top: '88px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
          <button onClick={() => setActiveTab('basic')} style={{ width: '100%', textAlign: 'left', padding: '16px', border: 'none', background: activeTab === 'basic' ? '#f5f5f5' : '#fff', borderLeft: activeTab === 'basic' ? '3px solid #D4AF37' : '3px solid transparent', fontFamily: 'DM Sans', fontWeight: 500, cursor: 'pointer' }}>Basic Information</button>
          <button onClick={() => setActiveTab('images')} style={{ width: '100%', textAlign: 'left', padding: '16px', border: 'none', background: activeTab === 'images' ? '#f5f5f5' : '#fff', borderLeft: activeTab === 'images' ? '3px solid #D4AF37' : '3px solid transparent', borderTop: '1px solid #EAEAEA', fontFamily: 'DM Sans', fontWeight: 500, cursor: 'pointer' }}>Media & Images</button>
          <button onClick={() => setActiveTab('variants')} style={{ width: '100%', textAlign: 'left', padding: '16px', border: 'none', background: activeTab === 'variants' ? '#f5f5f5' : '#fff', borderLeft: activeTab === 'variants' ? '3px solid #D4AF37' : '3px solid transparent', borderTop: '1px solid #EAEAEA', fontFamily: 'DM Sans', fontWeight: 500, cursor: 'pointer' }}>Variants & Pricing</button>
          <button onClick={() => setActiveTab('seo')} style={{ width: '100%', textAlign: 'left', padding: '16px', border: 'none', background: activeTab === 'seo' ? '#f5f5f5' : '#fff', borderLeft: activeTab === 'seo' ? '3px solid #D4AF37' : '3px solid transparent', borderTop: '1px solid #EAEAEA', fontFamily: 'DM Sans', fontWeight: 500, cursor: 'pointer' }}>SEO & Metadata</button>
        </div>

        {/* Form Content */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', padding: '32px' }}>
          
          {activeTab === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '24px', margin: '0 0 16px 0' }}>Basic Information</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Product Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="e.g. Kashmir Saffron" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Hindi Name</label>
                  <input type="text" name="hindi_name" value={formData.hindi_name} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="e.g. केसर" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>URL Slug *</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', backgroundColor: '#f9f9f9' }} placeholder="kashmir-saffron" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Category *</label>
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', background: '#fff' }}>
                    <option value="">Select category...</option>
                    <option value="c0c2eae4-181c-499b-ac87-1b30696785f5">Nuts</option>
                    <option value="114011c5-3582-4a7f-9f8c-0308ada97dfb">Seeds</option>
                    <option value="4f6994cd-5725-4584-8bc8-130ff8333a99">Spices</option>
                    <option value="gifting-category-uuid">Gifting</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Origin Location</label>
                  <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="e.g. Pampore, Kashmir" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Product Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={6} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', resize: 'vertical' }} placeholder="Describe the sourcing, tasting notes, and uses..." />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleInputChange} style={{ width: '18px', height: '18px' }} />
                <label htmlFor="is_active" style={{ fontFamily: 'DM Sans', fontSize: '14px', cursor: 'pointer' }}>Active (Visible on Storefront)</label>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '24px', margin: '0 0 16px 0' }}>Media & Images</h2>
              
              <label style={{ display: 'block', border: '2px dashed #ddd', borderRadius: '8px', padding: '48px 24px', textAlign: 'center', backgroundColor: '#fdfdfd', cursor: 'pointer' }}>
                <UploadCloud size={48} color="#aaa" style={{ marginBottom: '16px' }} />
                <h4 style={{ fontFamily: 'DM Sans', fontSize: '16px', margin: '0 0 8px 0', color: '#38243F' }}>{imageFile ? imageFile.name : 'Click to select image'}</h4>
                <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#888', margin: 0 }}>PNG, JPG, WebP up to 5MB.</p>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                <span style={{ display: 'inline-block', marginTop: '20px', padding: '10px 24px', backgroundColor: '#fff', border: '1px solid #38243F', color: '#38243F', borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer' }}>Browse Files</span>
              </label>
            </div>
          )}

          {activeTab === 'variants' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '24px', margin: '0 0 16px 0' }}>Variants & Pricing</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {variants.map((v, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'end', padding: '16px', border: '1px solid #EAEAEA', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600, color: '#666' }}>Weight / Size</label>
                      <input type="text" value={v.weight_label} onChange={e => handleVariantChange(index, 'weight_label', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="250g" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600, color: '#666' }}>Price (₹)</label>
                      <input type="number" value={v.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600, color: '#666' }}>Compare Price</label>
                      <input type="number" value={v.compare_at_price} onChange={e => handleVariantChange(index, 'compare_at_price', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="Optional" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600, color: '#666' }}>SKU</label>
                      <input type="text" value={v.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="SKU-XYZ" />
                    </div>
                    <button onClick={() => removeVariant(index)} style={{ padding: '10px', background: 'none', border: 'none', color: 'red', cursor: 'pointer', marginBottom: '2px' }}><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>

              <button onClick={addVariant} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'transparent', border: '1px dashed #38243F', color: '#38243F', borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={16} /> Add Variant
              </button>
            </div>
          )}

          {activeTab === 'seo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '24px', margin: '0 0 16px 0' }}>Search Engine Optimization</h2>
              <p style={{ fontFamily: 'DM Sans', color: '#666', fontSize: '14px', margin: '-12px 0 16px 0' }}>Optimize how this product appears on Google and social media.</p>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Meta Title</label>
                <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="Premium Kashmir Saffron | NAAVORI NUTS" />
                <small style={{ color: '#888', display: 'block', marginTop: '4px', fontFamily: 'DM Sans' }}>Recommended: 50-60 characters</small>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Meta Description</label>
                <textarea rows={4} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', resize: 'vertical' }} placeholder="Buy authentic pure Saffron sourced directly from Pampore, Kashmir..." />
                <small style={{ color: '#888', display: 'block', marginTop: '4px', fontFamily: 'DM Sans' }}>Recommended: 150-160 characters</small>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
