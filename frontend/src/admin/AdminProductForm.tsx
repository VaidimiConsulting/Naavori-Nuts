import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Save, Plus, Trash2, Sparkles, Calculator, Check } from 'lucide-react';
import api from '../services/api';

type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
};

export default function AdminProductForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryDTO[]>([
    { id: 'c0c2eae4-181c-499b-ac87-1b30696785f5', name: 'Nuts', slug: 'nuts' },
    { id: '4f6994cd-5725-4584-8bc8-130ff8333a99', name: 'Spices', slug: 'spices' },
    { id: '114011c5-3582-4a7f-9f8c-0308ada97dfb', name: 'Seeds', slug: 'seeds' }
  ]);

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
  const [base1kgRate, setBase1kgRate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { id } = useParams<{id: string}>();

  // Load dynamic categories
  useEffect(() => {
    api.get('/public/categories')
      .then(res => {
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setCategories(res.data.data);
          // Preselect from URL query if creating new product
          if (!id) {
            const queryParam = new URLSearchParams(location.search).get('category')?.toLowerCase();
            if (queryParam) {
              const matched = res.data.data.find((c: CategoryDTO) => c.slug.toLowerCase() === queryParam || c.name.toLowerCase() === queryParam);
              if (matched) {
                setFormData(prev => ({ ...prev, category_id: matched.id }));
              }
            }
          }
        }
      })
      .catch(err => console.warn('Categories fetch fallback to defaults:', err));
  }, [id, location.search]);

  // Load product if editing
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
            const v1kg = data.variants.find((v: any) => v.weight_label?.toLowerCase() === '1kg');
            if (v1kg) setBase1kgRate(String(v1kg.price));
          }
        }
      }).catch(err => console.error(err));
    }
  }, [id]);

  // Auto slug generation on name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: !id && (!prev.slug || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : prev.slug
    }));
  };

  const autoGenerateVariantsFrom1kg = () => {
    const rate = parseFloat(base1kgRate);
    if (!rate || isNaN(rate) || rate <= 0) {
      alert('Please enter a valid 1 kg rate in ₹');
      return;
    }
    const slugPrefix = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'item';
    const p100 = Math.round(rate * 0.10);
    const p250 = Math.round(rate * 0.25);
    const p500 = Math.round(rate * 0.50);
    const p1000 = Math.round(rate);

    setVariants([
      { weight_label: '100g', price: String(p100), compare_at_price: '', sku: `${slugPrefix}-100g` },
      { weight_label: '250g', price: String(p250), compare_at_price: '', sku: `${slugPrefix}-250g` },
      { weight_label: '500g', price: String(p500), compare_at_price: '', sku: `${slugPrefix}-500g` },
      { weight_label: '1kg', price: String(p1000), compare_at_price: '', sku: `${slugPrefix}-1kg` }
    ]);
  };

  const applyPresetWeights = (type: 'nuts-seeds' | 'spices' | 'saffron') => {
    const slugPrefix = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'item';
    if (type === 'nuts-seeds') {
      setVariants([
        { weight_label: '100g', price: '', compare_at_price: '', sku: `${slugPrefix}-100g` },
        { weight_label: '250g', price: '', compare_at_price: '', sku: `${slugPrefix}-250g` },
        { weight_label: '500g', price: '', compare_at_price: '', sku: `${slugPrefix}-500g` },
        { weight_label: '1kg', price: '', compare_at_price: '', sku: `${slugPrefix}-1kg` }
      ]);
    } else if (type === 'spices') {
      setVariants([
        { weight_label: '50g', price: '', compare_at_price: '', sku: `${slugPrefix}-50g` },
        { weight_label: '100g', price: '', compare_at_price: '', sku: `${slugPrefix}-100g` },
        { weight_label: '250g', price: '', compare_at_price: '', sku: `${slugPrefix}-250g` },
        { weight_label: '500g', price: '', compare_at_price: '', sku: `${slugPrefix}-500g` }
      ]);
    } else if (type === 'saffron') {
      setVariants([
        { weight_label: '1g', price: '', compare_at_price: '', sku: `${slugPrefix}-1g` },
        { weight_label: '2g', price: '', compare_at_price: '', sku: `${slugPrefix}-2g` },
        { weight_label: '5g', price: '', compare_at_price: '', sku: `${slugPrefix}-5g` },
        { weight_label: '10g', price: '', compare_at_price: '', sku: `${slugPrefix}-10g` }
      ]);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addVariant = () => {
    const slugPrefix = formData.slug || 'item';
    setVariants([...variants, { weight_label: '', price: '', compare_at_price: '', sku: `${slugPrefix}-${variants.length + 1}` }]);
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
    if (!formData.name.trim()) {
      alert("Product name is required.");
      return;
    }
    if (!formData.category_id) {
      alert("Please select a Category (Nuts, Spices, or Seeds).");
      return;
    }
    const cleanSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!cleanSlug) {
      alert("URL Slug is required.");
      return;
    }

    const validVariants = variants
      .filter(v => v.price !== '' && !isNaN(Number(v.price)))
      .map(v => ({
        ...v,
        sku: v.sku?.trim() || `${cleanSlug.toUpperCase().slice(0, 4)}-${(v.weight_label || '250g').replace(/\s+/g, '')}`
      }));

    if (validVariants.length === 0) {
      alert("Please add at least one package weight and price (₹) under the 'Variants & Pricing' tab.");
      setActiveTab('variants');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        slug: cleanSlug,
        packaging_key: formData.packaging_key || cleanSlug,
        variants: validVariants
      };

      let productId = id;
      if (id) {
        await api.put(`/products/${id}`, payload);
      } else {
        const res = await api.post('/products', payload);
        productId = res.data.data.id;
      }

      // Upload Image if selected
      if (imageFile) {
        const fileData = new FormData();
        fileData.append('image', imageFile);
        fileData.append('slug', cleanSlug);
        if (productId) fileData.append('product_id', productId);
        await api.post('/products/upload', fileData, { headers: { 'Content-Type': 'multipart/form-data' }});
      }

      navigate('/admin/catalog');
    } catch (error: any) {
      console.error(error);
      alert('Failed to save product: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryName = categories.find(c => c.id === formData.category_id)?.name || '';

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38243F', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '32px', color: '#38243F', margin: 0 }}>
            {id ? 'Edit Product & Pricing' : 'Add New Product (Nuts, Spices, Seeds)'}
          </h1>
          <p style={{ margin: '2px 0 0 0', color: '#666', fontFamily: 'DM Sans', fontSize: '13px' }}>
            Configure name, provenance, packaging sizes and retail prices
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <button 
            type="button"
            onClick={() => navigate('/admin/catalog')}
            style={{ padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'DM Sans', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px' }}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit} 
            disabled={loading} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', 
              backgroundColor: '#38243F', color: '#FDFBF7', border: 'none', borderRadius: '6px', 
              fontFamily: 'DM Sans', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(56,36,63,0.18)' 
            }}
          >
            <Save size={16} color="#D4AF37" /> {loading ? 'Saving...' : (id ? 'Update Product' : 'Publish Product & Prices')}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Navigation Sidebar */}
        <div style={{ position: 'sticky', top: '88px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
          <button onClick={() => setActiveTab('basic')} style={{ width: '100%', textAlign: 'left', padding: '16px', border: 'none', background: activeTab === 'basic' ? '#f5f5f5' : '#fff', borderLeft: activeTab === 'basic' ? '3px solid #D4AF37' : '3px solid transparent', fontFamily: 'DM Sans', fontWeight: 500, cursor: 'pointer' }}>1. Basic Information</button>
          <button onClick={() => setActiveTab('variants')} style={{ width: '100%', textAlign: 'left', padding: '16px', border: 'none', background: activeTab === 'variants' ? '#f5f5f5' : '#fff', borderLeft: activeTab === 'variants' ? '3px solid #D4AF37' : '3px solid transparent', borderTop: '1px solid #EAEAEA', fontFamily: 'DM Sans', fontWeight: 600, color: '#8c5825', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>2. Weights & Prices (₹)</span>
            <span style={{ fontSize: '11px', backgroundColor: '#fffbf5', border: '1px solid #c9b08f', borderRadius: '10px', padding: '2px 6px' }}>Key</span>
          </button>
          <button onClick={() => setActiveTab('images')} style={{ width: '100%', textAlign: 'left', padding: '16px', border: 'none', background: activeTab === 'images' ? '#f5f5f5' : '#fff', borderLeft: activeTab === 'images' ? '3px solid #D4AF37' : '3px solid transparent', borderTop: '1px solid #EAEAEA', fontFamily: 'DM Sans', fontWeight: 500, cursor: 'pointer' }}>3. Media & Photo</button>
          <button onClick={() => setActiveTab('seo')} style={{ width: '100%', textAlign: 'left', padding: '16px', border: 'none', background: activeTab === 'seo' ? '#f5f5f5' : '#fff', borderLeft: activeTab === 'seo' ? '3px solid #D4AF37' : '3px solid transparent', borderTop: '1px solid #EAEAEA', fontFamily: 'DM Sans', fontWeight: 500, cursor: 'pointer' }}>4. SEO & Metadata</button>
        </div>

        {/* Form Content */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontFamily: 'DM Sans', fontSize: '24px', margin: '0 0 16px 0', color: '#38243F' }}>Basic Information</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Product Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleNameChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="e.g. Premium Mamra Almonds" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Hindi Name (हिंदी नाम)</label>
                  <input type="text" name="hindi_name" value={formData.hindi_name} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="e.g. मामरा बादाम / केसर" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>URL Slug *</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', backgroundColor: '#fcfcfc' }} placeholder="mamra-almonds" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 600, color: '#38243F' }}>Category * (Nuts, Spices, Seeds)</label>
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #c9b08f', fontFamily: 'DM Sans', background: '#fff', fontSize: '14px', fontWeight: 500 }}>
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name === 'Nuts' ? '🥜 Nuts (काजू, बादाम, अखरोट)' : cat.name === 'Spices' ? '🌶️ Spices (मसाले, केसर, इलायची)' : cat.name === 'Seeds' ? '🌱 Seeds (बीज, चिया, कद्दू)' : cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Origin Location</label>
                  <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="e.g. Kashmir Valley, Goa, Rajasthan" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Product Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', resize: 'vertical' }} placeholder="Describe the sourcing, tasting notes, and uses..." />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleInputChange} style={{ width: '18px', height: '18px' }} />
                <label htmlFor="is_active" style={{ fontFamily: 'DM Sans', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>Active (Visible on Storefront)</label>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setActiveTab('variants')} style={{ padding: '10px 20px', backgroundColor: '#38243F', color: '#fff', border: 'none', borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer' }}>
                  Next: Configure Weights & Pricing →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VARIANTS & PRICING */}
          {activeTab === 'variants' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontFamily: 'DM Sans', fontSize: '24px', margin: '0 0 4px 0', color: '#38243F' }}>Weights & Pricing (₹)</h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666', fontFamily: 'DM Sans' }}>
                    Configure weights (100g, 250g, 500g, 1kg) and prices for {selectedCategoryName || 'this ingredient'}.
                  </p>
                </div>
              </div>

              {/* 1 kg Base Rate Auto-Calculator Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(244, 237, 228, 0.9), rgba(255, 255, 255, 0.95))',
                border: '1px solid rgba(183, 141, 82, 0.35)',
                padding: '18px 22px',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 4px 15px rgba(56, 36, 63, 0.04)'
              }}>
                <div style={{ maxWidth: '420px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calculator size={18} color="#8c5825" />
                    <strong style={{ fontFamily: 'DM Sans', fontSize: '14.5px', color: '#38243F' }}>
                      1 kg Rate Auto-Calculator
                    </strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#6a554c', fontFamily: 'DM Sans', lineHeight: 1.5 }}>
                    Enter 1 kg base rate (₹) to automatically compute <strong>100g (10%)</strong>, <strong>250g (25%)</strong>, <strong>500g (50%)</strong>, and <strong>1kg (100%)</strong>.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontWeight: 600, fontSize: '14px' }}>₹</span>
                    <input
                      type="number"
                      value={base1kgRate}
                      onChange={(e) => setBase1kgRate(e.target.value)}
                      placeholder="e.g. 1950"
                      style={{
                        padding: '10px 14px 10px 28px',
                        width: '140px',
                        borderRadius: '7px',
                        border: '1px solid #c9b08f',
                        fontFamily: 'DM Sans',
                        fontSize: '14px',
                        fontWeight: 600,
                        backgroundColor: '#fff'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={autoGenerateVariantsFrom1kg}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: '#38243F',
                      color: '#f4ede4',
                      border: 'none',
                      borderRadius: '7px',
                      fontFamily: 'DM Sans',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sparkles size={14} color="#D4AF37" /> Auto-Calculate Variants
                  </button>
                </div>
              </div>

              {/* Quick Presets based on ingredient category */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12.5px', color: '#666', fontWeight: 600, fontFamily: 'DM Sans' }}>Load Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPresetWeights('nuts-seeds')}
                  style={{ padding: '6px 12px', borderRadius: '5px', border: '1px solid #ddd', backgroundColor: '#fcfcfc', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500 }}
                >
                  🥜 Nuts & Seeds (100g, 250g, 500g, 1kg)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetWeights('spices')}
                  style={{ padding: '6px 12px', borderRadius: '5px', border: '1px solid #ddd', backgroundColor: '#fcfcfc', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500 }}
                >
                  🌶️ Spices (50g, 100g, 250g, 500g)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetWeights('saffron')}
                  style={{ padding: '6px 12px', borderRadius: '5px', border: '1px solid #ddd', backgroundColor: '#fcfcfc', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500 }}
                >
                  ✨ Saffron / Precious (1g, 2g, 5g, 10g)
                </button>
              </div>
              
              {/* Variant Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {variants.map((v, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr auto', gap: '16px', alignItems: 'end', padding: '16px', border: '1px solid #EAEAEA', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600, color: '#666' }}>Weight / Size *</label>
                      <input type="text" value={v.weight_label} onChange={e => handleVariantChange(index, 'weight_label', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="250g" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600, color: '#666' }}>Price in ₹ *</label>
                      <input type="number" value={v.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #c9b08f', fontFamily: 'DM Sans', fontWeight: 600 }} placeholder="e.g. 400" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600, color: '#666' }}>Compare MRP (₹)</label>
                      <input type="number" value={v.compare_at_price} onChange={e => handleVariantChange(index, 'compare_at_price', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder="Optional" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600, color: '#666' }}>SKU Code</label>
                      <input type="text" value={v.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', fontSize: '12px' }} placeholder="Auto-generated if empty" />
                    </div>
                    <button type="button" onClick={() => removeVariant(index)} style={{ padding: '10px', background: 'none', border: 'none', color: '#cf1322', cursor: 'pointer', marginBottom: '2px' }}>
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addVariant} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'transparent', border: '1px dashed #38243F', color: '#38243F', borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={16} /> Add Variant Size
              </button>
            </div>
          )}

          {/* TAB 3: MEDIA & IMAGES */}
          {activeTab === 'images' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontFamily: 'DM Sans', fontSize: '24px', margin: '0 0 16px 0', color: '#38243F' }}>Media & Images</h2>
              
              <label style={{ display: 'block', border: '2px dashed #ddd', borderRadius: '8px', padding: '48px 24px', textAlign: 'center', backgroundColor: '#fdfdfd', cursor: 'pointer' }}>
                <UploadCloud size={48} color="#aaa" style={{ marginBottom: '16px' }} />
                <h4 style={{ fontFamily: 'DM Sans', fontSize: '16px', margin: '0 0 8px 0', color: '#38243F' }}>{imageFile ? imageFile.name : 'Click to select image'}</h4>
                <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#888', margin: 0 }}>PNG, JPG, WebP up to 5MB.</p>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                <span style={{ display: 'inline-block', marginTop: '20px', padding: '10px 24px', backgroundColor: '#fff', border: '1px solid #38243F', color: '#38243F', borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer' }}>Browse Files</span>
              </label>
            </div>
          )}

          {/* TAB 4: SEO & METADATA */}
          {activeTab === 'seo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontFamily: 'DM Sans', fontSize: '24px', margin: '0 0 16px 0', color: '#38243F' }}>Search Engine Optimization</h2>
              <p style={{ fontFamily: 'DM Sans', color: '#666', fontSize: '14px', margin: '-12px 0 16px 0' }}>Optimize how this product appears on Google and social media.</p>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Meta Title</label>
                <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} placeholder={`${formData.name || 'Premium Nuts'} | NAAVORI NUTS`} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Meta Description</label>
                <textarea rows={4} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', resize: 'vertical' }} placeholder="Buy authentic pure harvest sourced directly from origin..." />
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
