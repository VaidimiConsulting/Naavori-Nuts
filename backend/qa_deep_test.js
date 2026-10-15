import pool from './src/config/db.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runDeepTests() {
  console.log('====================================================');
  console.log('🧪 DEEP INTEGRATION & BUSINESS FLOW TEST SUITE');
  console.log('====================================================\n');

  const results = [];
  function record(testName, passed, details = '') {
    results.push({ testName, passed, details });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${testName} ${details ? '(' + details + ')' : ''}`);
  }

  // --- TEST 1: Customer Registration Validation (Negative Test: Invalid phone) ---
  try {
    const res = await fetch(`${BASE_URL}/auth/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `invalid_phone_${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test Customer',
        phone: '12345', // Only 5 digits
        address: 'Test Address',
        city: 'Varanasi',
        pin_code: '221001'
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      record('Customer Register rejects < 10 digit phone', true, data.message);
    } else {
      record('Customer Register rejects < 10 digit phone', false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    record('Customer Register rejects < 10 digit phone', false, err.message);
  }

  // --- TEST 2: Customer Registration (Positive Test: Valid 10-digit phone) ---
  const testEmail = `patron_qa_${Date.now()}@naavoritest.com`;
  const testPhone = '9876543210';
  let customerCookie = '';
  let customerUser = null;

  try {
    const res = await fetch(`${BASE_URL}/auth/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassword123!',
        name: 'Vaidik Sharma',
        phone: testPhone,
        address: 'B-14 Assi Ghat Road',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        pin_code: '221005'
      })
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) customerCookie = setCookie;
    const data = await res.json();
    if (res.status === 201 && data.success) {
      customerUser = data.data;
      record('Customer Register with valid 10-digit phone & address', true, `User ID: ${customerUser.id}`);
    } else {
      record('Customer Register with valid 10-digit phone & address', false, JSON.stringify(data));
    }
  } catch (err) {
    record('Customer Register with valid 10-digit phone & address', false, err.message);
  }

  // --- TEST 3: Customer Login ---
  try {
    const res = await fetch(`${BASE_URL}/auth/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassword123!'
      })
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) customerCookie = setCookie;
    const data = await res.json();
    if (res.status === 200 && data.success) {
      record('Customer Login succeeds with credentials', true, `Token received`);
    } else {
      record('Customer Login succeeds with credentials', false, JSON.stringify(data));
    }
  } catch (err) {
    record('Customer Login succeeds with credentials', false, err.message);
  }

  // --- TEST 4: Pricing Accuracy on Requested Items ---
  try {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await res.json();
    if (data.success && data.data) {
      const pumpkin = data.data.find(p => p.slug?.includes('pumpkin'));
      const cloves = data.data.find(p => p.slug?.includes('cloves'));
      const pepper = data.data.find(p => p.slug?.includes('pepper'));
      const greenCardamom = data.data.find(p => p.slug?.includes('idukki') || p.slug?.includes('green-cardamom'));
      const blackCardamom = data.data.find(p => p.slug?.includes('black-cardamom'));

      let pricingOk = true;
      const details = [];

      if (pumpkin) {
        const v1kg = pumpkin.variants?.find(v => v.weight_label === '1kg');
        if (v1kg && Math.round(v1kg.price) === 800) {
          details.push('Pumpkin 1kg=₹800');
        } else {
          pricingOk = false;
          details.push(`Pumpkin 1kg expected 800 got ${v1kg?.price}`);
        }
      }

      if (cloves) {
        const v1kg = cloves.variants?.find(v => v.weight_label === '1kg');
        if (v1kg && Math.round(v1kg.price) === 1400) {
          details.push('Cloves 1kg=₹1400');
        } else {
          pricingOk = false;
          details.push(`Cloves 1kg expected 1400 got ${v1kg?.price}`);
        }
      }

      if (pepper) {
        const v1kg = pepper.variants?.find(v => v.weight_label === '1kg');
        if (v1kg && Math.round(v1kg.price) === 1400) {
          details.push('Black Pepper 1kg=₹1400');
        } else {
          pricingOk = false;
          details.push(`Pepper 1kg expected 1400 got ${v1kg?.price}`);
        }
      }

      if (greenCardamom) {
        const v1kg = greenCardamom.variants?.find(v => v.weight_label === '1kg');
        if (v1kg && Math.round(v1kg.price) === 4700) {
          details.push('Green Cardamom 1kg=₹4700');
        } else {
          pricingOk = false;
          details.push(`Green Cardamom 1kg expected 4700 got ${v1kg?.price}`);
        }
      }

      if (blackCardamom) {
        const v1kg = blackCardamom.variants?.find(v => v.weight_label === '1kg');
        if (v1kg && Math.round(v1kg.price) === 1500) {
          details.push('Black Cardamom 1kg=₹1500');
        } else {
          pricingOk = false;
          details.push(`Black Cardamom 1kg expected 1500 got ${v1kg?.price}`);
        }
      }

      record('Catalog variant pricing for spices & pumpkin seeds', pricingOk, details.join(', '));
    } else {
      record('Catalog variant pricing for spices & pumpkin seeds', false, 'Products API returned unsuccessful');
    }
  } catch (err) {
    record('Catalog variant pricing for spices & pumpkin seeds', false, err.message);
  }

  // --- TEST 5: Order Placement API with Authenticated Customer ---
  let createdOrderId = null;
  try {
    const res = await fetch(`${BASE_URL}/public/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': customerCookie,
        'Authorization': `Bearer ${customerUser?.token || ''}`
      },
      body: JSON.stringify({
        shipping_name: 'Vaidik Sharma',
        shipping_email: testEmail,
        shipping_phone: testPhone,
        shipping_address: 'B-14 Assi Ghat Road, Near Ganga Mahal',
        shipping_city: 'Varanasi',
        shipping_state: 'Uttar Pradesh',
        shipping_pin_code: '221005',
        subtotal: 1000,
        shipping_fee: 0, // Free shipping for >= 999
        tax: 50,
        total: 1050,
        payment_method: 'cod',
        payment_status: 'pending',
        items: [
          {
            product_name: 'Rajasthan Pumpkin Seeds',
            weight_label: '1kg',
            price: 800,
            quantity: 1
          },
          {
            product_name: 'Rajasthan Pumpkin Seeds',
            weight_label: '250g',
            price: 200,
            quantity: 1
          }
        ]
      })
    });

    const data = await res.json();
    if (res.status === 201 && data.success) {
      createdOrderId = data.data.orderId;
      record('Order creation with 10-digit phone & Varanasi address', true, `Order ID: ${createdOrderId}`);
    } else {
      record('Order creation with 10-digit phone & Varanasi address', false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    record('Order creation with 10-digit phone & Varanasi address', false, err.message);
  }

  // Verify created order in database:
  if (createdOrderId) {
    try {
      const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [createdOrderId]);
      const [itemRows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [createdOrderId]);
      const [historyRows] = await pool.query('SELECT * FROM order_status_history WHERE order_id = ?', [createdOrderId]);

      const verified = orderRows.length === 1 && itemRows.length === 2 && historyRows.length >= 1;
      record(
        'Database persistence of order, items, and audit history',
        verified,
        `Order: ${orderRows[0]?.order_number}, Items count: ${itemRows.length}, Status: ${orderRows[0]?.order_status}`
      );
    } catch (err) {
      record('Database persistence of order, items, and audit history', false, err.message);
    }
  }

  // --- TEST 6: Admin Login & Orders Filtering (Date-wise & Location Breakdown) ---
  let adminCookie = '';
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@naavorinuts.com',
        password: 'admin123'
      })
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) adminCookie = setCookie;
    const data = await res.json();
    if (res.status === 200 && data.success) {
      record('Admin authentication with store owner credentials', true, `Role: ${data.data.role}`);
    } else {
      // Let's check password hash if it fails
      record('Admin authentication with store owner credentials', false, `Status ${res.status}: ${data.message}`);
    }
  } catch (err) {
    record('Admin authentication with store owner credentials', false, err.message);
  }

  // --- TEST 7: Admin Orders API with City and Date filter ---
  try {
    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(`${BASE_URL}/admin/orders?date=${today}`, {
      headers: { 'Cookie': adminCookie }
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      const locBreakdown = data.summary?.location_breakdown || [];
      record(
        'Admin Orders Date-wise & Location Breakdown aggregation',
        true,
        `Orders today: ${data.summary?.total_orders}, Locations: ${locBreakdown.map(l => `${l.city} (${l.order_count})`).join(', ')}`
      );
    } else {
      record('Admin Orders Date-wise & Location Breakdown aggregation', false, `Status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    record('Admin Orders Date-wise & Location Breakdown aggregation', false, err.message);
  }

  // --- TEST 8: Contact Us / Support Ticket Submission ---
  try {
    const res = await fetch(`${BASE_URL}/support/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Gaurav Mishra',
        email: 'gaurav.mishra@example.com',
        subject: 'Corporate Gifting Inquiry for Diwali',
        message: 'Looking for 50 custom gift boxes with assorted nuts and spices.'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success) {
      record('Contact Us / Concierge support ticket submission', true, `Ticket ID: ${data.data?.ticketId}`);
    } else {
      record('Contact Us / Concierge support ticket submission', false, JSON.stringify(data));
    }
  } catch (err) {
    record('Contact Us / Concierge support ticket submission', false, err.message);
  }

  // --- TEST 9: Review Submission API ---
  try {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': customerCookie
      },
      body: JSON.stringify({
        rating: 5,
        title: 'Outstanding Freshness & Aroma',
        customer_name: 'Vaidik Sharma',
        comment: 'Tellicherry pepper and cloves are exceptionally fresh. Beautiful glass jar packaging!'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success) {
      record('Patron review submission and approval', true, `Review ID: ${data.data?.id}`);
    } else {
      record('Patron review submission and approval', false, JSON.stringify(data));
    }
  } catch (err) {
    record('Patron review submission and approval', false, err.message);
  }

  // Summary
  console.log('\n====================================================');
  console.log('📊 FINAL TEST SUMMARY');
  console.log('====================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`Total Tests Run: ${results.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);

  process.exit(failedCount === 0 ? 0 : 1);
}

runDeepTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
