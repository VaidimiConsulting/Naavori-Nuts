import React, { useState, useEffect } from 'react';

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    // Basic local storage simulation for cart
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(storedCart);
  }, []);

  const removeItem = (index: number) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center' }}>
          <p>Your cart is empty.</p>
          <button onClick={() => window.location.href = '/'} style={btnStyle}>Go Shopping</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {cartItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{item.name}</h3>
                  <p style={{ margin: '5px 0 0', color: '#666' }}>Quantity: {item.quantity}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</span>
                  <button onClick={() => removeItem(idx)} style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'right' }}>
            <h2>Subtotal: ₹{subtotal}</h2>
            <p style={{ color: '#7f8c8d' }}>Shipping & taxes calculated at checkout.</p>
            <button onClick={() => window.location.href = '/checkout'} style={{...btnStyle, background: '#e67e22', marginTop: '15px'}}>Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
};

const btnStyle = {
  padding: '12px 25px',
  background: '#3498db',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  fontSize: '16px',
  cursor: 'pointer'
};

export default CartPage;
