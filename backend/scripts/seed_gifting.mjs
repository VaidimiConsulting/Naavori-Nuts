import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Gifting Hampers: ONLY NUTS (No Spices, No Seeds), In Luxury Gift Boxes
// Pricing formula = (Sum of exact rates of constituent nuts) + ₹50 (Gift Box Charge)
const giftingHampersToInsert = [
  {
    id: 'gift-prod-shubh-aarambh',
    name: 'The Shubh Aarambh Trio Nut Box',
    slug: 'gift-shubh-aarambh',
    category_id: 'gifting-category-uuid',
    origin: 'Goa, Kashmir & Maharashtra',
    description: 'A handcrafted rigid luxury presentation box in signature royal plum & gold. Features premium Mamra Almonds (100g), Jumbo Cashews (100g), and sweet Golden Raisins (100g). Includes ₹50 luxury gift box packaging.',
    tag: 'Bestseller Box · Under ₹999',
    rating: '4.9',
    packaging_key: 'gift-shubh-aarambh',
    price: 400 // 130 + 160 + 60 + 50 = 400
  },
  {
    id: 'gift-prod-classic-four',
    name: 'The Classic Four Nuts Hamper Box',
    slug: 'gift-utsav-celebration',
    category_id: 'gifting-category-uuid',
    origin: 'Kashmir, Goa & Bihar',
    description: 'A delightful 4-nut celebration gift box. Premium Pistachios (100g), royal Mamra Almonds (100g), Jumbo Cashews (100g), and sun-dried Raisins (100g) in signature stand-up pouches. Includes ₹50 luxury gift box packaging.',
    tag: 'Celebration Box · Under ₹1200',
    rating: '4.9',
    packaging_key: 'gift-utsav-celebration',
    price: 629 // 130 + 160 + 229 + 60 + 50 = 629
  },
  {
    id: 'gift-prod-corporate',
    name: 'The Executive Corporate Nut Treasury',
    slug: 'gift-corporate',
    category_id: 'gifting-category-uuid',
    origin: 'Goa, Kashmir & Bihar',
    description: 'Specially crafted for executive clientele, boardrooms, and valued corporate partners. 100% pure gourmet nuts: Jumbo Cashews (250g), Mamra Almonds (250g), and Pistachios (250g) in our signature presentation box. Includes ₹50 luxury gift box packaging.',
    tag: 'Corporate Gifting',
    rating: '4.9',
    packaging_key: 'gift-corporate',
    price: 1347 // 326 + 399 + 572 + 50 = 1347
  },
  {
    id: 'gift-prod-wedding',
    name: 'The Royal Shahi Wedding Nut Hamper',
    slug: 'gift-wedding',
    category_id: 'gifting-category-uuid',
    origin: 'Kashmir Valley & Goa',
    description: 'Traditional auspicious gifting for wedding ceremonies and royal receptions. Hand-selected Mamra Almonds (250g), Jumbo Cashews (250g), Royal Snow Walnuts (250g), and Pistachios (250g) nestled in a royal presentation box. Includes ₹50 luxury gift box packaging.',
    tag: 'Wedding Gifting',
    rating: '5.0',
    packaging_key: 'gift-wedding',
    price: 1797 // 399 + 326 + 572 + 450 + 50 = 1797
  },
  {
    id: 'gift-prod-birthday',
    name: 'The Celebration Birthday Nut Box',
    slug: 'gift-birthday',
    category_id: 'gifting-category-uuid',
    origin: 'Bihar, Kashmir & Goa',
    description: 'A wholesome birthday surprise gift box. Crispy roasted Bihar Fox Nuts / Makhana (250g), sweet sun-dried Raisins (250g), royal Mamra Almonds (250g), and Jumbo Cashews (250g). Includes ₹50 luxury gift box packaging.',
    tag: 'Birthday Gifting',
    rating: '4.9',
    packaging_key: 'gift-birthday',
    price: 1265 // 340 + 150 + 399 + 326 + 50 = 1265
  },
  {
    id: 'gift-prod-wellness',
    name: 'The Wellness Nut & Makhana Treasury',
    slug: 'gift-vitality-prana',
    category_id: 'gifting-category-uuid',
    origin: 'Bihar & Kashmir Valley',
    description: 'Pure, nutrient-dense natural nourishment. Light airy Bihar Makhana (250g), dense high-valley Kashmiri Mamra Almonds (250g), and brain-nourishing Snow Walnuts (250g) sealed for freshness in a luxury gift box. Includes ₹50 luxury gift box packaging.',
    tag: 'Wellness Nut Edition',
    rating: '4.8',
    packaging_key: 'gift-vitality-prana',
    price: 1239 // 340 + 399 + 450 + 50 = 1239
  },
  {
    id: 'gift-prod-grand-panchratna',
    name: 'The Grand Panch-Ratna 5-Nuts Royal Chest',
    slug: 'gift-grand-panchratna',
    category_id: 'gifting-category-uuid',
    origin: 'Kashmir, Goa & Bihar',
    description: 'The ultimate 5-nuts royal gift presentation. An extravagant assortment of Mamra Almonds (250g), Jumbo Cashews (250g), Pistachios (250g), Snow Walnuts (250g), and Fox Nuts Makhana (250g) in an opulent keepsake presentation box. Includes ₹50 luxury gift box packaging.',
    tag: 'Grand Luxury · 5 Royal Nuts',
    rating: '5.0',
    packaging_key: 'gift-grand-panchratna',
    price: 2137 // 399 + 326 + 572 + 450 + 340 + 50 = 2137
  }
];

async function seedGifting() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'naavori_nuts'
  });

  // Ensure category exists
  await pool.query(
    `INSERT INTO categories (id, name, slug, description) 
     VALUES ('gifting-category-uuid', 'Gifting', 'gifting', 'Curated luxury dry fruit gift boxes and presentation hampers.')
     ON DUPLICATE KEY UPDATE name=VALUES(name)`
  );

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
       VALUES (?, ?, 'Gift Box', ?, ?, 100, ?)
       ON DUPLICATE KEY UPDATE weight_label=VALUES(weight_label), price=VALUES(price), compare_at_price=VALUES(compare_at_price), stock=VALUES(stock)`,
      [variantId, item.id, item.price, Math.round(item.price * 1.15), 'SKU-' + item.slug.toUpperCase()]
    );
    console.log(`Successfully seeded nut hamper in DB: ${item.name} -> ₹${item.price} (Includes ₹50 Gift Box)`);
  }

  // Remove any legacy hamper that contains spices or seeds (e.g. coastal-harvest)
  await pool.query(
    `DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE slug IN ('gift-coastal-harvest', 'gift-kashmir-treasury'))`
  );
  await pool.query(
    `DELETE FROM products WHERE slug IN ('gift-coastal-harvest', 'gift-kashmir-treasury')`
  );

  console.log('\n✅ All Nut Gift Hampers with exact +₹50 box pricing seeded successfully.');
  process.exit(0);
}

seedGifting().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
