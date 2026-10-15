import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Edit3, ShieldAlert, CheckCircle, 
  Image as ImageIcon, IndianRupee, X, Check, Calculator, Sparkles, Plus, Trash2, ArrowUpRight, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

type VariantDTO = {
  id?: string;
  weight_label: string;
  price: number | string;
  compare_at_price?: number | string | null;
  sku?: string;
  stock?: number;
};

type ProductListDTO = {
  id: string;
  name: string;
  slug: string;
  origin: string;
  category_name: string;
  category_slug?: string;
  category_id?: string;
  is_active: boolean;
  starting_price: number | null;
  total_stock: number | null;
  hindi_name?: string;
  variants?: VariantDTO[];
  image_url?: string;
  packaging_key?: string;
};

type CategoryTabKey = 'all' | 'nuts' | 'spices' | 'seeds' | 'gifting';

export default function AdminPricing() {
  const [products, setProducts] = useState<ProductListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<CategoryTabKey>('all');
  
  // Pricing Modal state
  const [modalProduct, setModalProduct] = useState<ProductListDTO | null>(null);
  const [editVariants, setEditVariants] = useState<VariantDTO[]>([]);
  const [base1kgRate, setBase1kgRate] = useState<string>('');
  const [savingPrices, setSavingPrices] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { search, limit: 100 };
      if (activeTab !== 'all') {
        params.category_id = activeTab;
      }
      const { data } = await api.get('/products', { params });
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 200);
    return () => clearTimeout(timer);
  }, [search, activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Pricing Modal
  const openPricingModal = (product: ProductListDTO) => {
    setModalProduct(product);
    const existing = product.variants && product.variants.length > 0
      ? product.variants.map(v => ({
          id: v.id,
          weight_label: v.weight_label || '',
          price: v.price !== undefined && v.price !== null ? Math.round(Number(v.price)) : '',
          compare_at_price: v.compare_at_price ? Math.round(Number(v.compare_at_price)) : '',
          sku: v.sku || ''
        }))
      : [
          { weight_label: '100g', price: '', compare_at_price: '', sku: `${product.slug}-100g` },
          { weight_label: '250g', price: '', compare_at_price: '', sku: `${product.slug}-250g` },
          { weight_label: '500g', price: '', compare_at_price: '', sku: `${product.slug}-500g` },
          { weight_label: '1kg', price: '', compare_at_price: '', sku: `${product.slug}-1kg` },
        ];
    setEditVariants(existing);

    const v1kg = product.variants?.find(v => v.weight_label.toLowerCase().replace(/\s+/g, '') === '1kg');
    if (v1kg && v1kg.price) {
      setBase1kgRate(String(Math.round(Number(v1kg.price))));
    } else {
      setBase1kgRate('');
    }
  };

  const handleVariantFieldChange = (index: number, field: keyof VariantDTO, val: string) => {
    const updated = [...editVariants];
    updated[index] = { ...updated[index], [field]: val };
    setEditVariants(updated);
  };

  const addVariantRow = () => {
    const slug = modalProduct?.slug || 'item';
    setEditVariants([
      ...editVariants,
      { weight_label: '', price: '', compare_at_price: '', sku: `${slug}-${editVariants.length + 1}` }
    ]);
  };

  const removeVariantRow = (index: number) => {
    setEditVariants(editVariants.filter((_, i) => i !== index));
  };

  // 1 kg Auto-Calculator logic
  const apply1kgAutoCalculation = () => {
    const rate = parseFloat(base1kgRate);
    if (!rate || isNaN(rate) || rate <= 0) {
      alert('Kripya 1 kg ka sahi price ₹ me daalein (e.g. 406 ya 1302)');
      return;
    }
    const slug = modalProduct?.slug || 'item';
    setEditVariants([
      { weight_label: '100g', price: String(Math.round(rate * 0.10)), compare_at_price: String(Math.round(rate * 0.10 * 1.15)), sku: `${slug}-100g` },
      { weight_label: '250g', price: String(Math.round(rate * 0.25)), compare_at_price: String(Math.round(rate * 0.25 * 1.15)), sku: `${slug}-250g` },
      { weight_label: '500g', price: String(Math.round(rate * 0.50)), compare_at_price: String(Math.round(rate * 0.50 * 1.15)), sku: `${slug}-500g` },
      { weight_label: '1kg', price: String(Math.round(rate)), compare_at_price: String(Math.round(rate * 1.15)), sku: `${slug}-1kg` }
    ]);
  };

  // Quick Presets
  const applyPreset = (type: 'nuts-seeds' | 'spices' | 'saffron') => {
    const slug = modalProduct?.slug || 'item';
    if (type === 'nuts-seeds') {
      setEditVariants([
        { weight_label: '100g', price: '', compare_at_price: '', sku: `${slug}-100g` },
        { weight_label: '250g', price: '', compare_at_price: '', sku: `${slug}-250g` },
        { weight_label: '500g', price: '', compare_at_price: '', sku: `${slug}-500g` },
        { weight_label: '1kg', price: '', compare_at_price: '', sku: `${slug}-1kg` }
      ]);
    } else if (type === 'spices') {
      setEditVariants([
        { weight_label: '50g', price: '', compare_at_price: '', sku: `${slug}-50g` },
        { weight_label: '100g', price: '', compare_at_price: '', sku: `${slug}-100g` },
        { weight_label: '250g', price: '', compare_at_price: '', sku: `${slug}-250g` },
        { weight_label: '500g', price: '', compare_at_price: '', sku: `${slug}-500g` }
      ]);
    } else if (type === 'saffron') {
      setEditVariants([
        { weight_label: '1g', price: '', compare_at_price: '', sku: `${slug}-1g` },
        { weight_label: '2g', price: '', compare_at_price: '', sku: `${slug}-2g` },
        { weight_label: '5g', price: '', compare_at_price: '', sku: `${slug}-5g` },
        { weight_label: '10g', price: '', compare_at_price: '', sku: `${slug}-10g` }
      ]);
    }
  };

  // Save Pricing via API
  const handleSavePrices = async () => {
    if (!modalProduct) return;
    const validVariants = editVariants.filter(v => v.price !== '' && !isNaN(Number(v.price)));
    if (validVariants.length === 0) {
      alert('Kripya kam se kam ek pack size ka price set karein.');
      return;
    }

    setSavingPrices(true);
    try {
      await api.patch(`/products/${modalProduct.id}/pricing`, { variants: validVariants });
      showToast(`✅ "${modalProduct.name}" ka price successfully update ho gaya! Website par turant live hai.`);
      setModalProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      alert('Failed to update prices: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingPrices(false);
    }
  };

  const filteredCount = products.length;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: '#38243F',
          color: '#FDFBF7',
          padding: '14px 22px',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          zIndex: 10000,
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid #D4AF37'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '24px', 
        flexWrap: 'wrap', 
        gap: '16px',
        background: 'linear-gradient(135deg, #38243F 0%, #4D3256 100%)',
        padding: '24px 28px',
        borderRadius: '12px',
        color: '#fff',
        boxShadow: '0 4px 20px rgba(56, 36, 63, 0.15)'
      }}>
        <div>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '11.5px', 
            fontWeight: 700, 
            letterSpacing: '1px', 
            textTransform: 'uppercase', 
            color: '#D4AF37', 
            marginBottom: '6px' 
          }}>
            <IndianRupee size={14} /> Naavori Price Control Center
          </span>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '28px', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Live Product Pricing Manager (मूल्य प्रबंधन)
          </h1>
          <p style={{ margin: '6px 0 0 0', opacity: 0.85, fontSize: '13.5px', maxWidth: '640px', lineHeight: 1.5 }}>
            Yahan se aap kisi bhi cheez (Kaju, Badam, Pista, Makhana, Jira, Marich, Cloves aadi) ka 1 kg ya kisi bhi pack size ka rate direct change kar sakte hain. Website par pricing turant update ho jayegi.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={fetchProducts}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <RefreshCw size={14} /> Refresh Prices
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              backgroundColor: '#D4AF37',
              color: '#38243F',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.3)'
            }}
          >
            View Live Website <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Category Tabs: Nuts, Spices, Seeds, Gifting */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px', 
        borderBottom: '1px solid #EAEAEA', 
        paddingBottom: '12px',
        overflowX: 'auto'
      }}>
        {[
          { key: 'all' as CategoryTabKey, label: 'All Products (सभी उत्पाद)', icon: '🧺' },
          { key: 'nuts' as CategoryTabKey, label: 'Nuts (काजू, बादाम, अखरोट, पिस्ता)', icon: '🥜' },
          { key: 'spices' as CategoryTabKey, label: 'Spices (जीरा, मिर्च, लौंग, मसाले)', icon: '🌶️' },
          { key: 'seeds' as CategoryTabKey, label: 'Seeds (कद्दू, अलसी, चिया बीज)', icon: '🌱' },
          { key: 'gifting' as CategoryTabKey, label: 'Gifting Hampers', icon: '🎁' },
        ].map(tab => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: isSelected ? '1px solid #38243F' : '1px solid #EAEAEA',
                backgroundColor: isSelected ? '#38243F' : '#fff',
                color: isSelected ? '#FDFBF7' : '#555',
                fontFamily: 'DM Sans',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {isSelected && (
                <span style={{ 
                  backgroundColor: 'rgba(212, 175, 55, 0.25)', 
                  color: '#D4AF37', 
                  fontSize: '11px', 
                  padding: '2px 7px', 
                  borderRadius: '12px',
                  fontWeight: 700 
                }}>
                  {filteredCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div style={{ 
        background: '#fff', 
        borderRadius: '10px', 
        border: '1px solid #EAEAEA', 
        overflow: 'hidden', 
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)' 
      }}>
        
        {/* Search Toolbar */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid #EAEAEA', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '12px',
          backgroundColor: '#FCFCFB'
        }}>
          <div style={{ position: 'relative', width: '380px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search by name: e.g. Jira, Kaju, Badam, Pepper..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '9px 12px 9px 38px', 
                borderRadius: '6px', 
                border: '1px solid #ddd', 
                fontFamily: 'DM Sans', 
                fontSize: '13.5px' 
              }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#666' }}>
              Showing <strong>{products.length}</strong> items ready for price edit
            </span>
          </div>
        </div>

        {/* Pricing List Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '13.5px' }}>
            <thead style={{ backgroundColor: '#FAF8F5', color: '#444', borderBottom: '1px solid #EAEAEA' }}>
              <tr>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Product Name (नाम)</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, minWidth: '320px' }}>Current Prices by Pack Size (100g, 250g, 500g, 1kg)</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading product prices...</td></tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '50px 20px', textAlign: 'center', color: '#888' }}>
                    <p style={{ margin: 0, fontSize: '15px' }}>No products found matching &ldquo;{search}&rdquo;.</p>
                  </td>
                </tr>
              ) : (
                products.map(product => {
                  const categoryName = product.category_name || 'Item';
                  const variants = product.variants || [];
                  const v1kg = variants.find(v => v.weight_label.toLowerCase().replace(/\s+/g, '') === '1kg');

                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid #EAEAEA', transition: 'background 0.15s ease' }}>
                      {/* Product Name */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '44px', height: '44px', backgroundColor: '#f5f3f0', 
                            borderRadius: '6px', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', color: '#aaa', overflow: 'hidden', flexShrink: 0,
                            border: '1px solid #eee'
                          }}>
                            {(() => {
                              const img = product.image_url 
                                ? (product.image_url.startsWith('http') ? product.image_url : `http://localhost:5000${product.image_url}`)
                                : `/assets/${product.category_name === 'Spices' ? 'products-spices' : product.category_name === 'Seeds' ? 'products-seeds' : 'products-official'}/${product.slug === 'kashmir-walnut' ? 'snow-walnuts' : product.slug === 'premium-cashew' ? 'jumbo-cashews' : product.packaging_key || product.slug || 'mamra-almonds'}-250g.webp`;
                              return (
                                <img
                                  src={img}
                                  alt={product.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/assets/products-official/mamra-almonds-250g.webp';
                                  }}
                                />
                              );
                            })()}
                          </div>
                          <div>
                            <strong style={{ display: 'block', color: '#38243F', fontSize: '15px' }}>
                              {product.name}
                              {product.hindi_name && (
                                <span style={{ marginLeft: '6px', fontSize: '13.5px', color: '#8c5825', fontWeight: 600 }}>
                                  ({product.hindi_name})
                                </span>
                              )}
                            </strong>
                            <span style={{ fontSize: '11.5px', color: '#888' }}>slug: {product.slug} · {product.origin || 'India'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ 
                          padding: '3px 9px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                          backgroundColor: categoryName.toLowerCase() === 'nuts' ? '#fdf4ea' : categoryName.toLowerCase() === 'spices' ? '#fff1f0' : categoryName.toLowerCase() === 'seeds' ? '#f6ffed' : '#f5f5f5',
                          color: categoryName.toLowerCase() === 'nuts' ? '#d46b08' : categoryName.toLowerCase() === 'spices' ? '#cf1322' : categoryName.toLowerCase() === 'seeds' ? '#389e0d' : '#555',
                          display: 'inline-block'
                        }}>
                          {categoryName}
                        </span>
                      </td>

                      {/* Current Prices List */}
                      <td style={{ padding: '14px 18px' }}>
                        {variants.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            {variants.map((v, i) => (
                              <span 
                                key={i} 
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: v.weight_label.toLowerCase().includes('1kg') ? '#fff9e6' : '#f7f6f4',
                                  border: v.weight_label.toLowerCase().includes('1kg') ? '1px solid #D4AF37' : '1px solid #e5dfd8',
                                  fontSize: '12.5px',
                                  fontFamily: 'DM Sans',
                                  color: '#38243F',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <strong>{v.weight_label}:</strong>
                                <span style={{ color: '#8c5825', fontWeight: 700 }}>₹{Math.round(Number(v.price))}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#fa8c16', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldAlert size={14} /> Price not configured
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button 
                          onClick={() => openPricingModal(product)}
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            padding: '8px 14px', 
                            borderRadius: '6px',
                            border: '1px solid #38243F', 
                            backgroundColor: '#38243F',
                            color: '#FDFBF7', 
                            fontSize: '13px', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(56, 36, 63, 0.2)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Edit3 size={14} /> Edit Price (मूल्य बदलें)
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── LIVE PRICE EDIT MODAL ─── */}
      {modalProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(56, 36, 63, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            position: 'relative',
            border: '1px solid rgba(183, 141, 82, 0.3)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #EAEAEA', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ 
                  display: 'inline-block', fontSize: '11px', fontWeight: 700, 
                  textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D4AF37', marginBottom: '4px' 
                }}>
                  Live Pricing · {modalProduct.category_name}
                </span>
                <h2 style={{ fontFamily: 'DM Sans', fontSize: '24px', color: '#38243F', margin: 0 }}>
                  {modalProduct.name}
                  {modalProduct.hindi_name && (
                    <span style={{ fontSize: '18px', fontWeight: 500, color: '#8c5825', marginLeft: '8px' }}>
                      ({modalProduct.hindi_name})
                    </span>
                  )}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666', fontFamily: 'DM Sans' }}>
                  1 kg ka rate daalkar Auto-Calculate karein ya har ek pack size ka price apni marzi se daalein.
                </p>
              </div>
              <button 
                onClick={() => setModalProduct(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* 1 kg Auto-Calculator Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(244, 237, 228, 0.7), rgba(255, 255, 255, 0.95))',
              border: '1px solid rgba(183, 141, 82, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calculator size={16} color="#8c5825" />
                    <strong style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F' }}>
                      1 kg Base Rate Auto-Calculator
                    </strong>
                  </div>
                  <small style={{ color: '#666', fontFamily: 'DM Sans', display: 'block', marginTop: '2px' }}>
                    1 kg ka rate enter karein, 100g (10%), 250g (25%), 500g (50%) khud calculate ho jayenge.
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontWeight: 600, fontSize: '13px' }}>₹</span>
                    <input 
                      type="number"
                      placeholder="e.g. 1596"
                      value={base1kgRate}
                      onChange={(e) => setBase1kgRate(e.target.value)}
                      style={{
                        padding: '8px 10px 8px 24px',
                        width: '120px',
                        borderRadius: '6px',
                        border: '1px solid #c9b08f',
                        fontSize: '14px',
                        fontWeight: 700,
                        fontFamily: 'DM Sans'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={apply1kgAutoCalculation}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#38243F',
                      color: '#FDFBF7',
                      border: 'none',
                      borderRadius: '6px',
                      fontFamily: 'DM Sans',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={14} color="#D4AF37" /> Auto-Calculate
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 600, fontFamily: 'DM Sans' }}>Quick Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('nuts-seeds')}
                style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', fontSize: '11.5px', cursor: 'pointer', fontFamily: 'DM Sans' }}
              >
                🥜 Nuts / Seeds (100g, 250g, 500g, 1kg)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('spices')}
                style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', fontSize: '11.5px', cursor: 'pointer', fontFamily: 'DM Sans' }}
              >
                🌶️ Spices (50g, 100g, 250g, 500g)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('saffron')}
                style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', fontSize: '11.5px', cursor: 'pointer', fontFamily: 'DM Sans' }}
              >
                ✨ Saffron (1g, 2g, 5g, 10g)
              </button>
            </div>

            {/* Editable Variant Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr 40px', gap: '10px', padding: '0 6px', fontSize: '12px', fontWeight: 600, color: '#666', fontFamily: 'DM Sans' }}>
                <span>Weight / Size *</span>
                <span>Selling Price (₹) *</span>
                <span>MRP / Strike (₹)</span>
                <span>SKU Code</span>
                <span></span>
              </div>

              {editVariants.map((v, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr 40px', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. 250g" 
                    value={v.weight_label}
                    onChange={(e) => handleVariantFieldChange(idx, 'weight_label', e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', fontSize: '13px' }}
                  />
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '12px' }}>₹</span>
                    <input 
                      type="number" 
                      placeholder="Price" 
                      value={v.price}
                      onChange={(e) => handleVariantFieldChange(idx, 'price', e.target.value)}
                      style={{ padding: '8px 10px 8px 20px', width: '100%', borderRadius: '6px', border: '1px solid #c9b08f', fontFamily: 'DM Sans', fontSize: '13px', fontWeight: 700, color: '#38243F' }}
                    />
                  </div>
                  <input 
                    type="number" 
                    placeholder="Optional" 
                    value={v.compare_at_price || ''}
                    onChange={(e) => handleVariantFieldChange(idx, 'compare_at_price', e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', fontSize: '13px' }}
                  />
                  <input 
                    type="text" 
                    placeholder="SKU" 
                    value={v.sku || ''}
                    onChange={(e) => handleVariantFieldChange(idx, 'sku', e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', fontSize: '12px', color: '#555' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => removeVariantRow(idx)}
                    style={{ background: 'none', border: 'none', color: '#cf1322', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Remove this pack size"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Variant Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <button 
                type="button" 
                onClick={addVariantRow}
                style={{ 
                  background: 'none', 
                  border: '1px dashed #aaa', 
                  borderRadius: '6px', 
                  padding: '7px 12px', 
                  color: '#38243F', 
                  cursor: 'pointer', 
                  fontSize: '12.5px', 
                  fontWeight: 600,
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontFamily: 'DM Sans'
                }}
              >
                <Plus size={14} /> + Add Another Weight / Size
              </button>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #EAEAEA', paddingTop: '18px' }}>
              <button
                type="button"
                onClick={() => setModalProduct(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  color: '#666',
                  fontFamily: 'DM Sans',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingPrices}
                onClick={handleSavePrices}
                style={{
                  padding: '10px 22px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#38243F',
                  color: '#FDFBF7',
                  fontFamily: 'DM Sans',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: savingPrices ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(56, 36, 63, 0.25)'
                }}
              >
                {savingPrices ? 'Saving...' : <>
                  <Check size={16} color="#D4AF37" /> Save & Update Live Website
                </>}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
