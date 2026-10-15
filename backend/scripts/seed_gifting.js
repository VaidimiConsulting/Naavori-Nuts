const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' });

const giftingHampersToInsert = [
  {
    id: 'gift-prod-corporate',
    name: 'The Executive Corporate Gifting Pack',
    slug: 'gift-corporate',
    category_id: 'gifting-category-uuid',
    origin: 'Goa, Kashmir & Malabar Coast',
    description: 'Specially crafted for executive clientele, boardrooms, and valued corporate partners. Premium Jumbo Cashews, Mamra Almonds, and Tellicherry Black Pepper in our signature airtight stand-up pouches.',
    tag: 'Corporate Gifting',
    rating: '4.9',
    packaging_key: 'gift-corporate',
    price: 2450
  },
  {
    id: 'gift-prod-wedding',
    name: 'The Royal Shahi Wedding Hamper',
    slug: 'gift-wedding',
    category_id: 'gifting-category-uuid',
    origin: 'Kashmir Valley & Idukki Spice Hills',
    description: 'Traditional auspicious gifting for wedding celebrations and special guests. Hand-selected Mamra Almonds, Royal Kashmir Walnuts, and fresh Idukki Green Cardamom nestled in a royal presentation box.',
    tag: 'Wedding Gifting',
    rating: '5.0',
    packaging_key: 'gift-wedding',
    price: 3650
  },
  {
    id: 'gift-prod-birthday',
    name: 'The Celebration Birthday Hamper',
    slug: 'gift-birthday',
    category_id: 'gifting-category-uuid',
    origin: 'Bihar, Maharashtra & Rajasthan',
    description: 'A wholesome, vibrant birthday surprise box. Crispy roasted Bihar Fox Nuts (Makhana), sweet sun-dried Raisins, and crunchy Rajasthan Pumpkin Seeds in cheerful pastel pouches.',
    tag: 'Birthday Gifting',
    rating: '4.9',
    packaging_key: 'gift-birthday',
    price: 1950
  },
  {
    id: 'gift-prod-kashmir-treasury',
    name: 'The Royal Kashmir Treasury',
    slug: 'gift-kashmir-treasury',
    category_id: 'gifting-category-uuid',
    origin: 'Kashmir Valley',
    description: 'An ode to northern high valleys. Hand-selected Mamra almonds, crisp cracked walnut halves, and crimson saffron.',
    tag: 'Bestseller Hamper',
    rating: '4.9',
    packaging_key: 'gift-kashmir-treasury',
    price: 2450
  },
  {
    id: 'gift-prod-coastal-harvest',
    name: 'The Coastal Indulgence Edit',
    slug: 'gift-coastal-harvest',
    category_id: 'gifting-category-uuid',
    origin: 'Goa & Malabar',
    description: 'Sun-drenched coastal harvests brought together. Generous buttery Goa cashews, fragrant sun-dried Kerala coconut, and bold whole Malabar peppercorns.',
    tag: 'Coastal Harvest',
    rating: '4.8',
    packaging_key: 'gift-coastal-harvest',
    price: 1980
  },
  {
    id: 'gift-prod-vitality-prana',
    name: 'The Vitality Seed & Prana Hamper',
    slug: 'gift-vitality-prana',
    category_id: 'gifting-category-uuid',
    origin: 'Himalayas & Rajasthan',
    description: 'Rich in plant protein and pure minerals. Crisp pumpkin seeds from Rajasthan, mountain-grown chia seeds, and light airy Bihar makhana.',
    tag: 'Plant Powered',
    rating: '4.8',
    packaging_key: 'gift-vitality-prana',
    price: 1680
  }
];

async function seedGifting() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'naavori_nuts'
  });

  for (const item of giftingHampersToInsert) {
    await pool.query(
      `INSERT INTO products (id, category_id, name, slug, origin, description, tag, rating, is_active, packaging_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE 
         name=VALUES(name), origin=VALUES(origin), description=VALUES(description), tag=VALUES(tag), rating=VALUES(rating), packaging_key=VALUES(packaging_key)`,
      [item.id, item.category_id, item.name, item.slug, item.origin, item.description, item.tag, item.rating, item.packaging_key]
    );

    const variantId = 'var-' + item.id;
    await pool.query(
      `INSERT INTO product_variants (id, product_id, weight_label, price, compare_at_price, stock, sku)
       VALUES (?, ?, 'Standard Box', ?, ?, 100, ?)
       ON DUPLICATE KEY UPDATE price=VALUES(price), compare_at_price=VALUES(compare_at_price), stock=VALUES(stock)`,
      [variantId, item.id, item.price, Math.round(item.price * 1.15), 'SKU-' + item.slug.toUpperCase()]
    );
    console.log('Successfully seeded gift hamper in DB:', item.name);
  }

  const [counts] = await pool.query('SELECT c.name as category, COUNT(p.id) as count FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id, c.name');
  console.log('Final counts per category in DB:', counts);

  const [total] = await pool.query('SELECT COUNT(*) as totalProducts FROM products');
  console.log('Total products in database:', total[0].totalProducts);

  process.exit(0);
}

seedGifting().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
