import pool from './src/config/db.js';

async function runQATests() {
  console.log('====================================================');
  console.log('🧪 NAAVORI NUTS - SENIOR QA TEST SUITE RUNNER');
  console.log('====================================================\n');

  const issues = [];
  const passes = [];

  // 1. Check DB Tables
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`✅ [DB] Connected successfully. Found ${tableNames.length} tables:`, tableNames.join(', '));
    passes.push('Database connectivity and table presence');
  } catch (err) {
    issues.push({ severity: 'CRITICAL', area: 'DB', message: 'Failed to query database tables: ' + err.message });
  }

  // 2. Check Users & Admin Roles
  try {
    const [users] = await pool.query('SELECT id, email, role, first_name, last_name, phone FROM users');
    console.log(`\n📋 [Users] Found ${users.length} users:`);
    users.forEach(u => console.log(`   - ${u.email} | Role: ${u.role} | Name: ${u.first_name} ${u.last_name || ''}`));
    
    const adminUser = users.find(u => u.role === 'admin' || u.role === 'owner' || u.role === 'manager');
    if (!adminUser) {
      issues.push({ severity: 'HIGH', area: 'Auth', message: 'No admin/owner/manager user found in database.' });
    } else {
      passes.push(`Admin/Manager role exists: ${adminUser.email} (${adminUser.role})`);
    }

    // Check requireRole vs 'admin'
    // Note: productRoutes checks requireRole(['owner', 'manager'])
    // If user has role 'admin', does requireRole(['owner', 'manager']) allow 'admin'?
    console.log(`\n🔍 Checking role compatibility for admin routes...`);
    const rolesPresent = [...new Set(users.map(u => u.role))];
    console.log('   Roles present in DB:', rolesPresent);
  } catch (err) {
    issues.push({ severity: 'HIGH', area: 'Users', message: 'Error querying users: ' + err.message });
  }

  // 3. Check Products & Variants
  try {
    const [products] = await pool.query(`
      SELECT p.id, p.name, p.slug, p.category_id, c.name as category_name, COUNT(pv.id) as variant_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      GROUP BY p.id, p.name, p.slug, p.category_id, c.name
    `);
    console.log(`\n📦 [Products] Found ${products.length} products:`);
    let productsWithNoVariants = 0;
    products.forEach(p => {
      if (p.variant_count === 0) productsWithNoVariants++;
    });
    if (productsWithNoVariants > 0) {
      issues.push({ severity: 'MEDIUM', area: 'Catalog', message: `${productsWithNoVariants} products have no variants.` });
    } else {
      passes.push(`All ${products.length} products have active variants configured.`);
    }

    // Check specific requested products:
    const targetProducts = ['pumpkin', 'cloves', 'black-pepper', 'cardamom'];
    for (const target of targetProducts) {
      const [rows] = await pool.query(`
        SELECT p.name, pv.weight_label, pv.price, pv.stock 
        FROM products p 
        JOIN product_variants pv ON p.id = pv.product_id 
        WHERE p.slug LIKE ? OR p.name LIKE ?
        ORDER BY pv.weight_label
      `, [`%${target}%`, `%${target}%`]);
      console.log(`   🔎 Product variant check for '${target}':`);
      rows.forEach(r => console.log(`      - ${r.name} [${r.weight_label}]: ₹${r.price} (Stock: ${r.stock})`));
    }
  } catch (err) {
    issues.push({ severity: 'HIGH', area: 'Products', message: 'Error checking products: ' + err.message });
  }

  // 4. Check Orders & Constraints
  try {
    const [orderCount] = await pool.query('SELECT COUNT(*) as count FROM orders');
    console.log(`\n🛒 [Orders] Total orders in system: ${orderCount[0].count}`);
    passes.push(`Orders table functional (${orderCount[0].count} orders)`);
  } catch (err) {
    issues.push({ severity: 'HIGH', area: 'Orders', message: 'Error querying orders: ' + err.message });
  }

  // 5. Test Live HTTP APIs via fetch
  console.log(`\n🌐 [API Endpoints Testing on http://localhost:5000]`);
  const endpoints = [
    { name: 'Health Check', url: 'http://localhost:5000/api/v1/health', method: 'GET', expectedStatus: 200 },
    { name: 'Categories List', url: 'http://localhost:5000/api/v1/public/categories', method: 'GET', expectedStatus: 200 },
    { name: 'Products Catalog', url: 'http://localhost:5000/api/v1/products', method: 'GET', expectedStatus: 200 },
    { name: 'Reviews List', url: 'http://localhost:5000/api/v1/reviews', method: 'GET', expectedStatus: 200 },
    { name: 'Admin Orders (unauth check)', url: 'http://localhost:5000/api/v1/admin/orders', method: 'GET', expectedStatus: 401 },
    { name: 'Non-Return Policy Check', url: 'http://localhost:5000/api/v1/public/returns', method: 'POST', expectedStatus: 400 },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, { method: ep.method, headers: { 'Content-Type': 'application/json' } });
      if (res.status === ep.expectedStatus) {
        console.log(`   ✅ [${ep.name}] Status ${res.status} matches expected ${ep.expectedStatus}`);
        passes.push(`API Endpoint: ${ep.name} returned HTTP ${res.status}`);
      } else {
        issues.push({ severity: 'MEDIUM', area: 'API', message: `${ep.name} returned HTTP ${res.status}, expected ${ep.expectedStatus}` });
      }
    } catch (fetchErr) {
      issues.push({ severity: 'HIGH', area: 'API', message: `${ep.name} failed with fetch error: ${fetchErr.message}` });
    }
  }

  // Print Summary
  console.log('\n====================================================');
  console.log('📊 QA AUDIT SUMMARY');
  console.log('====================================================');
  console.log(`Passes: ${passes.length}`);
  console.log(`Issues Found: ${issues.length}`);
  if (issues.length > 0) {
    console.log('\nIssues Detail:');
    issues.forEach((iss, idx) => console.log(`  ${idx + 1}. [${iss.severity}] [${iss.area}]: ${iss.message}`));
  }

  process.exit(0);
}

runQATests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
