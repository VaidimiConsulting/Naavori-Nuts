import React, { useState, useEffect } from 'react';

const CheckoutPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Assuming cart is stored in localStorage for now
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(storedCart);
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 80;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) return alert('Cart is empty!');
    setLoading(true);

    try {
      // 1. Create order on backend
      const res = await fetch('http://localhost:5000/api/v1/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });
      const data = await res.json();
      if (!data.success) throw new Error('Failed to create order');

      // 2. Load script
      const resScript = await loadRazorpayScript();
      if (!resScript) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      // 3. Open Razorpay Widget
      const options = {
        key: 'YOUR_RAZORPAY_KEY', // Normally dynamic
        amount: data.order.amount,
        currency: 'INR',
        name: 'Naavori Nuts',
        description: 'Premium Dry Fruits Purchase',
        order_id: data.order.id,
        handler: async function (response: any) {
          // 4. Verify Payment on backend
          const verifyRes = await fetch('http://localhost:5000/api/v1/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: data.order.receipt, // Internal DB receipt id mapping
              userEmail: formData.email
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert('Payment Successful! Check your email for receipt.');
            localStorage.removeItem('cart');
            window.location.href = '/';
          } else {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#3399cc'
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert('Something went wrong during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 500px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Shipping Details</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required style={inputStyle} />
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required style={inputStyle} />
          <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required style={inputStyle} />
          <input type="text" name="address" placeholder="Complete Address" onChange={handleChange} required style={inputStyle} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" name="city" value={formData.city} readOnly placeholder="City" style={{...inputStyle, flex: 1, backgroundColor: '#eee'}} />
            <input type="text" name="state" value={formData.state} readOnly placeholder="State" style={{...inputStyle, flex: 1, backgroundColor: '#eee'}} />
          </div>
          <p style={{ color: '#e74c3c', fontSize: '13px', marginTop: '-5px', marginBottom: '5px' }}>* Delivery is currently only available within Varanasi, Uttar Pradesh.</p>
          <input type="text" name="pincode" placeholder="Pincode" onChange={handleChange} required style={inputStyle} />
        </form>
      </div>

      <div style={{ flex: '1 1 350px', background: '#f9f9f9', padding: '25px', borderRadius: '10px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Order Summary</h2>
        {cartItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>{item.name} (x{item.quantity})</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <hr style={{ margin: '20px 0', borderTop: '1px solid #ddd' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: shipping === 0 ? 'green' : 'black' }}>
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
        </div>
        
        <hr style={{ margin: '20px 0', borderTop: '1px solid #ddd' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 'bold', fontSize: '18px' }}>
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        <button 
          onClick={handlePayment} 
          disabled={loading || total === 0}
          style={{ width: '100%', padding: '15px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
          {loading ? 'Processing...' : `Pay ₹${total} via Razorpay`}
        </button>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: '12px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  fontSize: '15px'
};

export default CheckoutPage;
