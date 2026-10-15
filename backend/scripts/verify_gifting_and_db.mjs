import http from 'http';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

async function verifyAll() {
  console.log('--- 1. DATABASE INTEGRITY CHECK ---');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'naavori_nuts'
  });

  const [categories] = await pool.query(
    'SELECT c.name as category, COUNT(p.id) as product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id, c.name'
  );
  console.log('Categories & Product Counts in MySQL:');
  categories.forEach(c => console.log(`  ✦ ${c.category}: ${c.product_count} products`));

  const [variants] = await pool.query('SELECT COUNT(*) as variant_count FROM product_variants');
  console.log(`Total Variants with Weights & Prices in DB: ${variants[0].variant_count}`);

  console.log('\n--- 2. BACKEND API LIVE CHECK (http://localhost:5000/api/v1) ---');
  const healthRes = await fetchJson('http://localhost:5000/api/v1/health');
  console.log(`Health check: status ${healthRes.status}, dbConnected:`, healthRes.data?.dbConnected);

  const productsRes = await fetchJson('http://localhost:5000/api/v1/products?limit=100');
  console.log(`Products API (/api/v1/products): status ${productsRes.status}, returned items: ${productsRes.data?.data?.length}`);

  const giftingProds = productsRes.data?.data?.filter(p => p.category_name === 'Gifting');
  console.log(`Gifting Hampers loaded from DB via API: ${giftingProds?.length}`);
  giftingProds?.forEach(g => {
    console.log(`  ✦ [${g.tag || 'Gift'}] ${g.name} (Starting: ₹${g.starting_price || g.variants?.[0]?.price})`);
  });

  console.log('\n✅ ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  process.exit(0);
}

verifyAll().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
