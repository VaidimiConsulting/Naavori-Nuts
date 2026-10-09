import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const asset = (path: string) => `/assets/${path}`;

export default function GiftingPage({ navigate, addToCart, catalogue }: { navigate: (path: string) => void, addToCart: (product: any) => void, catalogue: any[] }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const dbGifts = catalogue.filter(p => p.category === 'Gifting');

  const giftBoxes = dbGifts.length > 0 ? dbGifts.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    quote: p.tag || '"Considered Gifting."',
    description: p.description,
    image: `compositions/${p.packagingKey}.webp`,
    product: p
  })) : [
    {
      id: 'gift-1',
      name: 'The Signature Assortment',
      price: '₹1,800',
      quote: '"Simple. Beautiful. Considered."',
      description: 'A modern, clean aesthetic gift box featuring our pastel pouches. Includes premium almonds, pistachios, and cashews. No heavy velvet, just pure goodness wrapped in our signature minimal style.',
      image: 'compositions/brand-reference.webp',
      product: null
    },
    {
      id: 'gift-2',
      name: 'The Seed & Spice Box',
      price: '₹1,200',
      quote: '"Thoughtful nourishment for everyday rituals."',
      description: 'An aesthetic combination of our mint and cream pouches. Includes pumpkin seeds, chia, and whole spices in a beautiful, understated kraft-style box.',
      image: 'compositions/category-seeds.webp'
    },
    {
      id: 'gift-3',
      name: 'Custom Curated Edit',
      price: '₹2,500',
      quote: '"Your choice of flavors, wrapped beautifully."',
      description: 'Pick any 4 of our beautiful pastel pouches to be packed in a clean, modern gift box. Perfect for weddings, bulk corporate gifting, or special occasions where aesthetics matter.',
      image: 'compositions/category-nuts.webp'
    }
  ];

  return (
    <div style={{ backgroundColor: '#FDFBF7', color: '#38243F', fontFamily: 'DM Sans, sans-serif' }}>
      <main style={{ paddingBottom: '120px' }}>
        
        {/* Aesthetic Hero Section mimicking "A quieter kind of indulgence" */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '60px 24px 100px 24px', maxWidth: '800px', margin: '0 auto' }}>
          <p className="eyebrow" style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', color: '#888', marginBottom: '24px' }}>The Gifting Collection</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 400, color: '#38243F', margin: '0 0 32px 0', lineHeight: 1.1, fontStyle: 'italic' }}>
            A quieter kind<br/>of gifting.
          </h1>
          <p style={{ fontSize: '18px', color: '#666', lineHeight: 1.6, maxWidth: '600px' }}>
            Move away from loud, heavy boxes. Our gifting collection embraces a modern, pastel aesthetic — letting the pure ingredients and clean packaging speak for themselves.
          </p>
        </section>

        {/* Gift Boxes Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          {giftBoxes.map((box, index) => (
            <div key={box.id} style={{ display: 'flex', flexDirection: index % 2 === 0 ? 'row' : 'row-reverse', gap: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
              
              <div style={{ flex: '1 1 500px', position: 'relative' }}>
                <div style={{ paddingBottom: '75%', position: 'relative', overflow: 'hidden', borderRadius: '4px', backgroundColor: '#EAEAEA' }}>
                  <img src={asset(box.image)} alt={box.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', color: '#38243F', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.3 }}>
                  {box.quote}
                </p>
                <h3 style={{ fontFamily: 'DM Sans', fontSize: '24px', color: '#38243F', fontWeight: 600, margin: '0 0 8px 0' }}>{box.name}</h3>
                <span style={{ fontSize: '16px', color: '#888', marginBottom: '24px', display: 'block' }}>{box.price}</span>
                <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>{box.description}</p>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => { if(box.product) { addToCart(box.product); alert('Added to cart!'); } else { alert('This is a placeholder gift. Please add Gifting products from Admin Panel.'); } }} style={{ backgroundColor: '#38243F', color: '#FDFBF7', padding: '14px 32px', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                    Add to Cart
                  </button>
                  <button onClick={() => navigate('/contact')} style={{ backgroundColor: 'transparent', color: '#38243F', padding: '14px 32px', border: '1px solid #38243F', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                    Enquire Bulk
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
          <button className="line-button" onClick={() => navigate('/shop')} style={{ color: '#38243F', borderBottomColor: '#38243F' }}>
            <ArrowLeft size={15} /> Explore all ingredients
          </button>
        </div>
      </main>

    </div>
  );
}
