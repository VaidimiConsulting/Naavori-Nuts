import pool from '../config/db.js';
import crypto from 'crypto';

const categories = [
  { id: crypto.randomUUID(), name: 'Nuts', slug: 'nuts', description: 'The quiet luxury of a good crunch.' },
  { id: crypto.randomUUID(), name: 'Seeds', slug: 'seeds', description: 'Small ingredients. Considered nourishment.' },
  { id: crypto.randomUUID(), name: 'Spices', slug: 'spices', description: 'A little warmth changes everything.' }
];

const sampleProducts = [
  { name: 'Kashmir Walnut', categoryName: 'Nuts', origin: 'Kashmir', price: 850, weights: ['250g', '500g'] },
  { name: 'Premium Cashew', categoryName: 'Nuts', origin: 'Goa', price: 900, weights: ['250g', '500g'] },
  { name: 'Pumpkin Seeds', categoryName: 'Seeds', origin: 'Rajasthan', price: 350, weights: ['100g', '250g'] },
  { name: 'Kashmir Saffron', categoryName: 'Spices', origin: 'Kashmir', price: 500, weights: ['1g', '2g', '5g'] },
];

async function seed() {
  console.log('Seeding database...');
  try {
    // 1. Seed Categories
    for (const cat of categories) {
      await pool.query('INSERT IGNORE INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)', [cat.id, cat.name, cat.slug, cat.description]);
    }
    
    // 2. Fetch Category IDs mapping
    const [catRows] = await pool.query('SELECT id, name FROM categories');
    const catMap = catRows.reduce((acc, row) => ({ ...acc, [row.name]: row.id }), {});

    // 3. Seed Products and Variants
    for (const prod of sampleProducts) {
      const prodId = crypto.randomUUID();
      const slug = prod.name.toLowerCase().replace(/\s+/g, '-');
      
      await pool.query(
        'INSERT IGNORE INTO products (id, category_id, name, slug, origin, description, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [prodId, catMap[prod.categoryName], prod.name, slug, prod.origin, 'A premium selection from NAAVORI.', true]
      );

      for (let i = 0; i < prod.weights.length; i++) {
        const weight = prod.weights[i];
        const multiplier = i === 0 ? 1 : i === 1 ? 1.9 : 3.5;
        const finalPrice = Math.round(prod.price * multiplier);
        
        await pool.query(
          'INSERT IGNORE INTO product_variants (id, product_id, weight_label, price, sku, stock) VALUES (?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), prodId, weight, finalPrice, `${slug.substring(0,4).toUpperCase()}-${weight}`, 50]
        );
      }
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
