import db from '../src/config/db.js';
import crypto from 'crypto';

const priceUpdates = [
  {
    slugs: ['golden-cumin', 'andhra-pradesh-cumin-seeds'],
    name: 'Jira (Cumin)',
    variants: [
      { weight_label: '100g', price: 41 },
      { weight_label: '250g', price: 102 },
      { weight_label: '500g', price: 203 },
      { weight_label: '1kg', price: 406 }
    ]
  },
  {
    slugs: ['tellicherry-black-pepper'],
    name: 'Marich (Black Pepper)',
    variants: [
      { weight_label: '100g', price: 116 },
      { weight_label: '250g', price: 289 },
      { weight_label: '500g', price: 578 },
      { weight_label: '1kg', price: 1155 }
    ]
  },
  {
    slugs: ['zanzibar-cloves'],
    name: 'Laung (Cloves)',
    variants: [
      { weight_label: '100g', price: 147 },
      { weight_label: '250g', price: 368 },
      { weight_label: '500g', price: 735 },
      { weight_label: '1kg', price: 1470 }
    ]
  },
  {
    slugs: ['jumbo-cashews', 'premium-cashew'],
    name: 'Kaju (Cashew)',
    variants: [
      { weight_label: '100g', price: 130 },
      { weight_label: '250g', price: 326 },
      { weight_label: '500g', price: 651 },
      { weight_label: '1kg', price: 1302 }
    ]
  },
  {
    slugs: ['mamra-almonds'],
    name: 'Badam (Mamra Almonds)',
    variants: [
      { weight_label: '100g', price: 160 },
      { weight_label: '250g', price: 399 },
      { weight_label: '500g', price: 798 },
      { weight_label: '1kg', price: 1596 }
    ]
  },
  {
    slugs: ['pistachios'],
    name: 'Pista (Pistachios)',
    variants: [
      { weight_label: '100g', price: 229 },
      { weight_label: '250g', price: 572 },
      { weight_label: '500g', price: 1145 },
      { weight_label: '1kg', price: 2289 }
    ]
  },
  {
    slugs: ['fox-nuts-makhana'],
    name: 'Makhana (Fox Nuts)',
    variants: [
      { weight_label: '100g', price: 136 },
      { weight_label: '250g', price: 340 },
      { weight_label: '500g', price: 679 },
      { weight_label: '1kg', price: 1358 }
    ]
  }
];

async function updatePrices() {
  console.log('--- Updating Product Prices in MySQL ---');
  
  for (const item of priceUpdates) {
    for (const slug of item.slugs) {
      const [prods] = await db.query('SELECT id, name, slug FROM products WHERE slug = ?', [slug]);
      if (!prods.length) {
        console.warn(`Product not found for slug: ${slug}`);
        continue;
      }
      const prod = prods[0];
      console.log(`\nUpdating product: ${prod.name} (${prod.slug}, ID: ${prod.id})`);

      for (const variant of item.variants) {
        const [existing] = await db.query(
          'SELECT id FROM product_variants WHERE product_id = ? AND weight_label = ?',
          [prod.id, variant.weight_label]
        );

        if (existing.length > 0) {
          await db.query(
            'UPDATE product_variants SET price = ?, compare_at_price = ? WHERE id = ?',
            [variant.price, Math.round(variant.price * 1.15), existing[0].id]
          );
          console.log(`  ✓ Updated ${variant.weight_label} -> ₹${variant.price}`);
        } else {
          const varId = crypto.randomUUID();
          const sku = `${prod.slug}-${variant.weight_label}`;
          await db.query(
            'INSERT INTO product_variants (id, product_id, weight_label, price, compare_at_price, stock, sku) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [varId, prod.id, variant.weight_label, variant.price, Math.round(variant.price * 1.15), 100, sku]
          );
          console.log(`  + Inserted ${variant.weight_label} -> ₹${variant.price}`);
        }
      }
    }
  }

  console.log('\n--- Verification of Updated Prices ---');
  const allSlugs = priceUpdates.flatMap(p => p.slugs);
  const [results] = await db.query(`
    SELECT p.name, p.slug, pv.weight_label, pv.price 
    FROM products p 
    JOIN product_variants pv ON p.id = pv.product_id 
    WHERE p.slug IN (?) 
    ORDER BY p.name, pv.price ASC
  `, [allSlugs]);

  results.forEach(r => {
    console.log(`  [${r.name} - ${r.slug}] ${r.weight_label}: ₹${Math.round(r.price)}`);
  });

  console.log('\n✅ All prices successfully updated in MySQL database.');
  process.exit(0);
}

updatePrices().catch(err => {
  console.error('Error updating prices:', err);
  process.exit(1);
});
