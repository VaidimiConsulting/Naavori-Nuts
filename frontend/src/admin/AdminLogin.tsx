import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from '../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        login(response.data.data);
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#38243F', color: '#FDFBF7' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#fff', color: '#38243F', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '32px', margin: '0 0 8px 0', color: '#38243F' }}>NAAVORI</h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#666', margin: 0 }}>Admin Portal Access</p>
        </div>
        
        {error && (
          <div style={{ padding: '12px', marginBottom: '20px', backgroundColor: '#FFF0F0', color: 'red', borderRadius: '6px', fontSize: '14px', textAlign: 'center', fontFamily: 'DM Sans' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500 }}>Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', fontSize: '14px' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#38243F', color: '#FDFBF7', border: 'none', borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
            Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
