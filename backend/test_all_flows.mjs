async function runTests() {
  const base = 'http://localhost:5000/api/v1';
  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Health
  await check('Health Check & DB Connectivity', async () => {
    const res = await fetch(`${base}/health`);
    const data = await res.json();
    if (!data.success || !data.dbConnected) throw new Error('DB not connected');
  });

  // 2. Public Products
  await check('Public Products API', async () => {
    const res = await fetch(`${base}/products`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) throw new Error('No products returned');
  });

  // 3. Admin Login
  let adminCookie = '';
  await check('Admin Login & Session Cookie', async () => {
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@naavorinuts.com', password: 'admin123' })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Admin login failed: ' + data.message);
    adminCookie = res.headers.get('set-cookie');
    if (!adminCookie) throw new Error('No admin auth cookie received');
  });

  // 4. Admin Inventory
  await check('Admin Live Inventory Ledger & Batches', async () => {
    const res = await fetch(`${base}/admin/inventory`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid inventory data');
  });

  // 5. Admin Deliveries
  await check('Admin Delivery & Dispatch Kanban', async () => {
    const res = await fetch(`${base}/admin/deliveries`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success) throw new Error('Invalid deliveries data');
  });

  // 6. Admin Returns
  await check('Admin Returns & Refunds Management', async () => {
    const res = await fetch(`${base}/admin/returns`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success) throw new Error('Invalid returns data');
  });

  // 7. Admin Support Tickets
  await check('Admin Support Tickets / Helpdesk', async () => {
    const res = await fetch(`${base}/support/admin/tickets`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid support tickets');
  });

  // 8. Admin Notifications
  await check('Admin Live Operational Notifications & Drawer', async () => {
    const res = await fetch(`${base}/admin/notifications`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || typeof data.data.unread_count !== 'number') throw new Error('Invalid notifications');
  });

  // 9. Admin Customers CRM
  await check('Admin Unified Customers CRM Directory', async () => {
    const res = await fetch(`${base}/admin/customers`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid customers');
  });

  // 10. Admin Orders List
  let orderId = '';
  await check('Admin Orders List', async () => {
    const res = await fetch(`${base}/admin/orders`, { headers: { cookie: adminCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) throw new Error('No orders found');
    orderId = data.data[0].id;
  });

  // 11. PDF Tax Invoice Generation
  await check('Branded PDF Tax Invoice Generation', async () => {
    if (!orderId) throw new Error('No orderId for PDF test');
    const res = await fetch(`${base}/admin/orders/${orderId}/invoice`, { headers: { cookie: adminCookie } });
    const buf = await res.arrayBuffer();
    if (res.headers.get('content-type') !== 'application/pdf') throw new Error('Not a PDF');
    if (buf.byteLength < 500) throw new Error('PDF too small: ' + buf.byteLength);
  });

  // 12. Customer Auth (Register / Login / Me / Saved Address)
  const testCustomerEmail = 'qa_patron_' + Date.now() + '@naavori.com';
  let customerCookie = '';
  await check('Customer Registration Flow', async () => {
    const res = await fetch(`${base}/auth/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Pooja',
        last_name: 'Verma',
        email: testCustomerEmail,
        phone: '9876543210',
        password: 'Password@123'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Register failed: ' + data.message);
    customerCookie = res.headers.get('set-cookie');
  });

  await check('Customer Session & Profile Validation', async () => {
    const res = await fetch(`${base}/auth/customer/me`, { headers: { cookie: customerCookie } });
    const data = await res.json();
    if (!data.success || data.data.email !== testCustomerEmail) throw new Error('Session invalid');
  });

  let addressId = '';
  await check('Customer Address Book (Add Address)', async () => {
    const res = await fetch(`${base}/auth/customer/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: customerCookie
      },
      body: JSON.stringify({
        recipient_name: 'Pooja Verma',
        phone: '9876543210',
        address_line1: 'B-12, Assi Ghat Road',
        address_line2: 'Near Shivala',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        pin_code: '221005',
        is_default: true
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Add address failed: ' + data.message);
    addressId = data.data?.id;
  });

  await check('Customer Address Book (Retrieve Saved Addresses)', async () => {
    const res = await fetch(`${base}/auth/customer/addresses`, { headers: { cookie: customerCookie } });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) throw new Error('No addresses found');
  });

  // 13. Public Storefront Concierge Ticket
  await check('Public Concierge Support Ticket Submission', async () => {
    const res = await fetch(`${base}/support/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pooja Verma',
        email: testCustomerEmail,
        subject: 'Inquiry regarding FEFO fresh harvest packaging',
        message: 'Could you please confirm the harvest date for Mamra Almonds 500g?'
      })
    });
    const data = await res.json();
    if (!data.success || !data.data?.ticketId) throw new Error('Ticket submission failed: ' + data.message);
  });

  console.log(`\n========================================`);
  console.log(`E2E Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
