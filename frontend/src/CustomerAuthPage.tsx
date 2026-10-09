import { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function CustomerAuthPage({ navigate, setToast }: { navigate: (path: string) => void, setToast: (msg: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    if (email) {
      localStorage.setItem('customer_email', email as string);
    }
    const phone = formData.get('phone');
    if (phone) localStorage.setItem('customer_phone', phone as string);
    const name = formData.get('name');
    if (name) localStorage.setItem('customer_name', name as string);
    
    // Simulate login success
    setToast(isLogin ? 'Welcome back to NAAVORI.' : 'Your account has been created.');
    navigate('/account');
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 160px)', display: 'grid', placeItems: 'center', padding: '120px 24px 60px', backgroundColor: '#f4ede4' }}>
      <div style={{ maxWidth: '440px', width: '100%', backgroundColor: '#fff', padding: '40px', borderRadius: '4px', border: '1px solid #e0d8cc' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '28px', color: '#38243f', margin: '0 0 8px 0', textAlign: 'center' }}>
          {isLogin ? 'Welcome back.' : 'Join the ritual.'}
        </h1>
        <p style={{ fontFamily: 'Arial, sans-serif', color: '#666', fontSize: '14px', margin: '0 0 32px 0', textAlign: 'center' }}>
          {isLogin ? 'Sign in to access your edit and track orders.' : 'Create an account to save your wishlist and track orders.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#38243f' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                  <input required name="name" type="text" placeholder="Your name" style={{ width: '100%', padding: '12px 16px 12px 42px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px', fontFamily: 'Arial, sans-serif' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#38243f' }}>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <input required name="phone" type="tel" placeholder="+91" style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px', fontFamily: 'Arial, sans-serif' }} />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#38243f' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input required name="email" type="email" placeholder="Email" style={{ width: '100%', padding: '12px 16px 12px 42px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px', fontFamily: 'Arial, sans-serif' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#38243f' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input required type="password" placeholder="Password" style={{ width: '100%', padding: '12px 16px 12px 42px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px', fontFamily: 'Arial, sans-serif' }} />
            </div>
          </div>

          <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#38243f', color: '#f4ede4', border: 'none', borderRadius: '4px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '24px' }}>
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#666', margin: 0 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#38243f', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
              {isLogin ? 'Create one.' : 'Sign in.'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
