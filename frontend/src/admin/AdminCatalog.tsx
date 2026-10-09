import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, ShieldAlert, CheckCircle, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

type ProductListDTO = {
  id: string;
  name: string;
  slug: string;
  origin: string;
  category_name: string;
  is_active: boolean;
  starting_price: number | null;
  total_stock: number | null;
  hindi_name?: string;
};

export default function AdminCatalog() {
  const [products, setProducts] = useState<ProductListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { search } });
      setProducts(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error(error);
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', color: '#38243F', margin: 0 }}>Product Catalog</h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>Manage listings, pricing, and variants</p>
        </div>
        <Link to="/admin/catalog/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#38243F', color: '#FDFBF7', textDecoration: 'none', borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600 }}>
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAEAEA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search by product name or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans' }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'DM Sans' }}>Import CSV</button>
            <button style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'DM Sans' }}>Export CSV</button>
          </div>
        </div>

        {/* List */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#f9f9f9', color: '#666', borderBottom: '1px solid #EAEAEA' }}>
            <tr>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Product Name</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Category & Origin</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Base Price</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Stock Level</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Listing Health</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>Loading catalog...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No products found.</td></tr>
            ) : (
              products.map(product => {
                const stock = Number(product.total_stock) || 0;
                const isLowStock = stock > 0 && stock <= 10;
                const isOutOfStock = stock === 0;

                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid #EAEAEA' }}>
                    <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                        <ImageIcon size={20} />
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: '#38243F' }}>{product.name}{product.hindi_name && ` (${product.hindi_name})`}</strong>
                        <span style={{ fontSize: '12px', color: '#888' }}>/{product.slug}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {product.category_name || 'Uncategorized'}<br/>
                      <span style={{ fontSize: '12px', color: '#888' }}>{product.origin}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {product.starting_price ? `₹${product.starting_price} (starts at)` : 'No variants'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <strong style={{ color: isOutOfStock ? 'red' : isLowStock ? '#fa8c16' : '#52c41a' }}>
                        {stock} units
                      </strong>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {product.total_stock === null ? (
                         <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fa8c16', fontSize: '12px', fontWeight: 500 }}><ShieldAlert size={14}/> Needs Variants</span>
                      ) : (
                         <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#52c41a', fontSize: '12px', fontWeight: 500 }}><CheckCircle size={14}/> Excellent</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: product.is_active ? '#e6f7ff' : '#f5f5f5',
                        color: product.is_active ? '#1890ff' : '#888'
                      }}>
                        {product.is_active ? 'ACTIVE' : 'DRAFT'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Link to={`/admin/catalog/${product.id}`} style={{ color: '#D4AF37' }}><Edit size={16} /></Link>
                        <button onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', padding: 0 }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
