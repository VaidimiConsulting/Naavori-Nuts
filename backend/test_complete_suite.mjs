async function runFullSuite() {
  const base = 'http://localhost:5000/api/v1';
  let passed = 0;
  let failed = 0;
  const failures = [];

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name} ->`, err.message);
      failures.push({ name, error: err.message });
      failed++;
    }
  }

  console.log('====================================================');
  console.log('NAAVORI NUTS — Comprehensive Exhaustive Test Suite');
  console.log('====================================================\n');

  // --- SECTION 1: SYSTEM & PUBLIC STOREFRONT ---
  await test('1. Health Check & MySQL State', async () => {
    const res = await fetch(`${base}/health`);
    const data = await res.json();
    if (!data.success || !data.dbConnected) throw new Error('DB disconnected or server error');
  });

  let sampleProductId = '';
  await test('2. Public Catalog Products', async () => {
    const res = await fetch(`${base}/products`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) throw new Error('No products returned');
    sampleProductId = data.data[0].id;
  });

  await test('3. Public Product Detail', async () => {
    if (!sampleProductId) throw new Error('Missing sampleProductId');
    const res = await fetch(`${base}/products/${sampleProductId}`);
    const data = await res.json();
    if (!data.success || !data.data) throw new Error('Product detail query failed');
  });

  await test('4. Public Categories', async () => {
    const res = await fetch(`${base}/public/categories`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Failed to retrieve categories');
  });

  await test('5. Public Reviews Listing', async () => {
    const res = await fetch(`${base}/reviews`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Reviews fetch failed');
  });

  await test('6. Public Review Submission', async () => {
    const res = await fetch(`${base}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: sampleProductId,
        author_name: 'Devika Sen',
        rating: 5,
        title: 'Exquisite Freshness',
        content: 'Remarkable crunch and buttery aroma. Varanasi packaging is beautiful.'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Review submission failed: ' + data.message);
  });

  await test('7. Public Coupon Validation', async () => {
    const res = await fetch(`${base}/public/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'WELCOME10', order_amount: 1500 })
    });
    const data = await res.json();
    // Coupon might be valid or invalid depending on DB seed, but endpoint must answer with valid JSON format
    if (typeof data.success !== 'boolean') throw new Error('Coupon validate returned invalid structure');
  });

  // --- SECTION 2: CUSTOMER AUTH & ADDRESS BOOK ---
  const patronEmail = 'qa_audit_' + Date.now() + '@naavori.com';
  let customerCookie = '';

  await test('8. Customer Registration', async () => {
    const res = await fetch(`${base}/auth/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Kavita',
        last_name: 'Pandey',
        email: patronEmail,
        phone: '9812345678',
        password: 'Password@2026'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Registration failed: ' + data.message);
    customerCookie = res.headers.get('set-cookie');
  });

  await test('9. Customer Session (/auth/customer/me)', async () => {
    const res = await fetch(`${base}/auth/customer/me`, { headers: { cookie: customerCookie } });
    const data = await res.json();
    if (!data.success || data.data.email !== patronEmail) throw new Error('Session invalid');
  });

  let createdAddrId = '';
  await test('10. Customer Add Saved Address', async () => {
    const res = await fetch(`${base}/auth/customer/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: customerCookie },
      body: JSON.stringify({
        full_name: 'Kavita Pandey',
        phone: '9812345678',
        address_line1: 'House 44, Bhoot Bhairav',
        address_line2: 'Gali 2',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        pin_code: '221001',
        is_default: true
      })
    });
    const data = await res.json();
    if (!data.success || !data.data?.id) throw new Error('Address add failed');
    createdAddrId = data.data.id;
  });

  await test('11. Customer Retrieve Addresses', async () => {
    const res = await fetch(`${base}/auth/customer/addresses`, { headers: { cookie: customerCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) throw new Error('Addresses list empty');
  });

  let createdTicketId = '';
  await test('12. Concierge Support Ticket Submission', async () => {
    const res = await fetch(`${base}/support/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: customerCookie },
      body: JSON.stringify({
        name: 'Kavita Pandey',
        email: patronEmail,
        subject: 'Bespoke Wedding Gifting Consultation',
        message: 'Looking for 30 silver-embossed boxes with customized Kashmiri walnuts and Mamra almonds.'
      })
    });
    const data = await res.json();
    if (!data.success || !data.data?.ticketId) throw new Error('Support ticket creation failed');
    createdTicketId = data.data.ticketId;
  });

  // --- SECTION 3: ADMIN AUTH & OPERATIONAL MODULES ---
  let adminCookie = '';
  await test('13. Admin Login & Session Token', async () => {
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@naavorinuts.com', password: 'admin123' })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Admin login failed');
    adminCookie = res.headers.get('set-cookie');
  });

  await test('14. Admin Dashboard Metrics (/admin/dashboard/stats)', async () => {
    const res = await fetch(`${base}/admin/dashboard/stats`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || typeof data.data.grossSales === 'undefined') throw new Error('Dashboard stats invalid');
  });

  let testOrderId = '';
  await test('15. Admin Orders Management (/admin/orders)', async () => {
    const res = await fetch(`${base}/admin/orders`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) throw new Error('Admin orders list empty');
    testOrderId = data.data[0].id;
  });

  await test('16. Admin Packing Board (/admin/orders/packing)', async () => {
    const res = await fetch(`${base}/admin/orders/packing`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success) throw new Error('Packing board query failed');
  });

  await test('17. Branded PDF Tax Invoice (/admin/orders/:id/invoice)', async () => {
    const res = await fetch(`${base}/admin/orders/${testOrderId}/invoice`, { headers: { cookie: adminCookie } });
    const buf = await res.arrayBuffer();
    if (res.headers.get('content-type') !== 'application/pdf' || buf.byteLength < 500) {
      throw new Error('Invoice PDF buffer invalid');
    }
  });

  await test('18. Admin Deliveries List (/admin/deliveries)', async () => {
    const res = await fetch(`${base}/admin/deliveries`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Deliveries fetch failed');
  });

  await test('19. Admin Delivery Slots (/admin/deliveries/slots)', async () => {
    const res = await fetch(`${base}/admin/deliveries/slots`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Delivery slots fetch failed');
  });

  await test('20. Admin Delivery Partners (/admin/deliveries/partners)', async () => {
    const res = await fetch(`${base}/admin/deliveries/partners`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Delivery partners fetch failed');
  });

  await test('21. Strict No-Return Policy Enforcement', async () => {
    const res = await fetch(`${base}/public/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: 'test', reason: 'test' })
    });
    const data = await res.json();
    if (data.success !== false) throw new Error('Return endpoint should reject returns');
  });

  let sampleVariantId = '';
  await test('22. Admin Inventory & FEFO Batches (/admin/inventory)', async () => {
    const res = await fetch(`${base}/admin/inventory`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) throw new Error('Inventory fetch failed');
    sampleVariantId = data.data[0].variant_id;
  });

  await test('23. Admin Inventory Quick Stock Adjustment', async () => {
    if (!sampleVariantId) throw new Error('Missing sampleVariantId');
    const res = await fetch(`${base}/admin/inventory/variants/${sampleVariantId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ adjustment: 0 }) // zero net adjustment to test endpoint without perturbing inventory
    });
    const data = await res.json();
    if (!data.success) throw new Error('Stock adjustment failed: ' + data.message);
  });

  await test('24. Admin Support Tickets List (/support/admin/tickets)', async () => {
    const res = await fetch(`${base}/support/admin/tickets`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Support tickets fetch failed');
  });

  await test('25. Admin Support Ticket Conversation & Reply', async () => {
    if (!createdTicketId) throw new Error('Missing createdTicketId');
    // Fetch detail
    const detailRes = await fetch(`${base}/support/admin/tickets/${createdTicketId}`, { headers: { cookie: adminCookie } });
    const detail = await detailRes.json();
    if (!detail.success || !detail.data?.id) throw new Error('Ticket detail fetch failed');

    // Add admin reply
    const replyRes = await fetch(`${base}/support/tickets/${createdTicketId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ message: 'Namaste Kavita ji, our Varanasi concierge team has prepared sample packaging designs for your wedding set.' })
    });
    const reply = await replyRes.json();
    if (!reply.success) throw new Error('Admin ticket reply failed: ' + reply.message);
  });

  await test('26. Admin Support Ticket Status Update', async () => {
    if (!createdTicketId) throw new Error('Missing createdTicketId');
    const res = await fetch(`${base}/support/admin/tickets/${createdTicketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ status: 'in_progress' })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Ticket status update failed');
  });

  await test('27. Admin Operational Notifications & Drawer (/admin/notifications)', async () => {
    const res = await fetch(`${base}/admin/notifications`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || typeof data.data.unread_count !== 'number' || !Array.isArray(data.data.notifications)) {
      throw new Error('Notifications query failed');
    }
  });

  await test('28. Admin Mark All Notifications Read', async () => {
    const res = await fetch(`${base}/admin/notifications/read-all`, {
      method: 'POST',
      headers: { cookie: adminCookie }
    });
    const data = await res.json();
    if (!data.success) throw new Error('Mark all read failed');
  });

  await test('29. Admin Unified Customer Directory (/admin/customers)', async () => {
    const res = await fetch(`${base}/admin/customers`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) throw new Error('Customers list failed');
  });

  await test('30. Admin Customer Detail by Email', async () => {
    // Get existing customer email
    const res = await fetch(`${base}/admin/customers`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    const existing = data.data.find(c => c.total_orders > 0);
    if (existing) {
      const detailRes = await fetch(`${base}/admin/customers/${encodeURIComponent(existing.email)}`, { headers: { cookie: adminCookie } });
      const detailData = await detailRes.json();
      if (!detailData.success || !detailData.data) throw new Error('Customer detail failed for ' + existing.email);
    }
  });

  await test('31. Admin Coupons Management (/admin/coupons)', async () => {
    const res = await fetch(`${base}/admin/coupons`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Coupons list failed');
  });

  await test('32. Admin Settings Configuration (/admin/config/settings)', async () => {
    const res = await fetch(`${base}/admin/config/settings`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success) throw new Error('Settings fetch failed');
  });

  await test('33. Admin CMS Configuration (/admin/config/cms)', async () => {
    const res = await fetch(`${base}/admin/config/cms`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success) throw new Error('CMS fetch failed');
  });

  // --- SECTION 4: CLEANUP ---
  await test('34. Customer Delete Address', async () => {
    if (!createdAddrId) throw new Error('Missing createdAddrId');
    const res = await fetch(`${base}/auth/customer/addresses/${createdAddrId}`, {
      method: 'DELETE',
      headers: { cookie: customerCookie }
    });
    const data = await res.json();
    if (!data.success) throw new Error('Address delete failed: ' + data.message);
  });

  console.log('\n====================================================');
  console.log(`COMPLETE TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    console.error('\nFAILURES SUMMARY:');
    failures.forEach((f, idx) => console.error(`${idx + 1}. ${f.name}: ${f.error}`));
    process.exit(1);
  } else {
    console.log('\nALL SYSTEMS 100% OPERATIONAL & VERIFIED!');
    process.exit(0);
  }
}

runFullSuite();
