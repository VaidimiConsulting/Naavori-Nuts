import { useState } from 'react';
import type { FormEvent } from 'react';
import { User, Lock, Phone, MapPin, Mail, ArrowUpRight, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';

export type CustomerUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  addresses?: any[];
};

type CustomerAuthProps = {
  onSuccess: (user: CustomerUser) => void;
  navigate?: (path: string) => void;
  defaultTab?: 'login' | 'register';
  isEmbedded?: boolean;
};

export function CustomerAuth({
  onSuccess,
  navigate,
  defaultTab = 'register',
  isEmbedded = false,
}: CustomerAuthProps) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('Uttar Pradesh');
  const [regPin, setRegPin] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Strict Validations
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile number for order delivery coordination.');
      return;
    }

    if (!regAddress.trim() || !regCity.trim() || !regPin.trim()) {
      setError('Complete delivery address, city, and PIN code are required to create an account.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/customer/register', {
        name: regName.trim(),
        phone: cleanPhone,
        email: regEmail.trim(),
        password: regPassword,
        address: regAddress.trim(),
        city: regCity.trim(),
        state: regState.trim(),
        pin_code: regPin.trim(),
      });

      if (res.data.success && res.data.data) {
        setSuccessMsg('Account created successfully! Welcome to NAAVORI.');
        setTimeout(() => {
          onSuccess(res.data.data);
        }, 400);
      } else {
        setError(res.data.message || 'Failed to create account.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Error creating account. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/customer/login', {
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (res.data.success && res.data.data) {
        setSuccessMsg('Signed in successfully.');
        setTimeout(() => {
          onSuccess(res.data.data);
        }, 400);
      } else {
        setError(res.data.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid rgba(56, 36, 63, 0.12)',
    borderRadius: '16px',
    padding: isEmbedded ? '28px 24px' : '40px 36px',
    maxWidth: isEmbedded ? '100%' : '540px',
    margin: isEmbedded ? '0' : '0 auto',
    boxShadow: '0 20px 45px rgba(48, 33, 29, 0.07)',
  };

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px 16px',
    background: isActive ? 'var(--plum, #38243f)' : 'transparent',
    color: isActive ? '#f4ede4' : 'var(--brown-soft, #6a554c)',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '13px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  });

  return (
    <div style={cardStyle}>
      {/* Header Info */}
      <div style={{ textAlign: isEmbedded ? 'left' : 'center', marginBottom: '24px' }}>
        <p className="eyebrow" style={{ color: 'var(--gold, #b78d52)', marginBottom: '8px' }}>
          <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '5px' }} />
          Verified Patron Access
        </p>
        <h2 style={{ fontSize: isEmbedded ? '28px' : '34px', margin: '0 0 10px', lineHeight: 1.1 }}>
          {tab === 'register' ? <>Join the <em>ritual.</em></> : <>Welcome <em>back.</em></>}
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--brown-soft, #6a554c)', lineHeight: 1.5 }}>
          {tab === 'register'
            ? 'Create your Naavori account with verified 10-digit mobile number & address to proceed with orders.'
            : 'Sign in to access saved delivery coordinates, order history, and live tracking.'}
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(56, 36, 63, 0.05)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '24px',
          gap: '4px',
        }}
      >
        <button
          type="button"
          style={tabButtonStyle(tab === 'register')}
          onClick={() => { setTab('register'); setError(''); }}
        >
          Create Account
        </button>
        <button
          type="button"
          style={tabButtonStyle(tab === 'login')}
          onClick={() => { setTab('login'); setError(''); }}
        >
          Sign In
        </button>
      </div>

      {/* Alert Notices */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(198, 40, 40, 0.08)',
            border: '1px solid rgba(198, 40, 40, 0.25)',
            color: '#c62828',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            marginBottom: '20px',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(46, 125, 50, 0.08)',
            border: '1px solid rgba(46, 125, 50, 0.25)',
            color: '#2e7d32',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            marginBottom: '20px',
          }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Register Form */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-soft)', marginBottom: '6px' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="text"
                placeholder="e.g. Yash Vardhan"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  border: '1px solid rgba(56, 36, 63, 0.15)',
                  borderRadius: '9px',
                  fontSize: '14px',
                  background: '#fcfbf9',
                }}
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.45 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-soft)', marginBottom: '6px' }}>
                10-Digit Mobile *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    border: '1px solid rgba(56, 36, 63, 0.15)',
                    borderRadius: '9px',
                    fontSize: '14px',
                    background: '#fcfbf9',
                  }}
                />
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.45 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-soft)', marginBottom: '6px' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  type="email"
                  placeholder="name@domain.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    border: '1px solid rgba(56, 36, 63, 0.15)',
                    borderRadius: '9px',
                    fontSize: '14px',
                    background: '#fcfbf9',
                  }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.45 }} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-soft)', marginBottom: '6px' }}>
              Create Password (min. 6 characters) *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="password"
                placeholder="••••••••"
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  border: '1px solid rgba(56, 36, 63, 0.15)',
                  borderRadius: '9px',
                  fontSize: '14px',
                  background: '#fcfbf9',
                }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.45 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-soft)', marginBottom: '6px' }}>
              Mandatory Delivery Address *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="text"
                placeholder="Flat / House No., Street, Landmark"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  border: '1px solid rgba(56, 36, 63, 0.15)',
                  borderRadius: '9px',
                  fontSize: '14px',
                  background: '#fcfbf9',
                }}
              />
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.45 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-soft)', marginBottom: '6px' }}>
                City *
              </label>
              <input
                required
                type="text"
                placeholder="Varanasi"
                value={regCity}
                onChange={(e) => setRegCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border: '1px solid rgba(56, 36, 63, 0.15)',
                  borderRadius: '9px',
                  fontSize: '14px',
                  background: '#fcfbf9',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-soft)', marginBottom: '6px' }}>
                State *
              </label>
              <input
                required
                type="text"
                placeholder="Uttar Pradesh"
                value={regState}
                onChange={(e) => setRegState(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border: '1px solid rgba(56, 36, 63, 0.15)',
                  borderRadius: '9px',
                  fontSize: '14px',
                  background: '#fcfbf9',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-soft)', marginBottom: '6px' }}>
                PIN *
              </label>
              <input
                required
                type="text"
                maxLength={6}
                placeholder="221001"
                value={regPin}
                onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border: '1px solid rgba(56, 36, 63, 0.15)',
                  borderRadius: '9px',
                  fontSize: '14px',
                  background: '#fcfbf9',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button button--dark"
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {loading ? 'Creating Patron Account...' : 'Create Account & Continue'}
            <ArrowUpRight size={16} />
          </button>
        </form>
      )}

      {/* Login Form */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-soft)', marginBottom: '6px' }}>
              Patron Email *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="email"
                placeholder="you@domain.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  border: '1px solid rgba(56, 36, 63, 0.15)',
                  borderRadius: '9px',
                  fontSize: '14px',
                  background: '#fcfbf9',
                }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.45 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-soft)', marginBottom: '6px' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  border: '1px solid rgba(56, 36, 63, 0.15)',
                  borderRadius: '9px',
                  fontSize: '14px',
                  background: '#fcfbf9',
                }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.45 }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button button--dark"
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In & Continue'}
            <ArrowUpRight size={16} />
          </button>
        </form>
      )}

      {/* Footer note */}
      <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '12px', color: 'var(--brown-soft)', opacity: 0.8 }}>
        🔒 Strictly confidential & protected. NAAVORI never shares your details.
      </div>
    </div>
  );
}
