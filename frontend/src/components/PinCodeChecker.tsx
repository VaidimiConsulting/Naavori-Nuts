import { useState } from 'react';
import { MapPin, Truck, Check, AlertCircle, Sparkles } from 'lucide-react';

export function PinCodeChecker() {
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<{
    tested: boolean;
    valid: boolean;
    city?: string;
    timeline?: string;
    note?: string;
  }>({ tested: false, valid: false });

  const handleCheck = () => {
    const cleanPin = pincode.trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setStatus({
        tested: true,
        valid: false,
        note: 'Please enter a valid 6-digit Indian PIN code.'
      });
      return;
    }

    const prefix2 = cleanPin.slice(0, 2);
    let city = 'All India Express';
    let timeline = 'Delivery in 3 – 5 Business Days';
    let note = 'Hand-sealed batch dispatched directly from Varanasi facility.';

    if (prefix2 === '22' || prefix2 === '23') {
      city = 'Varanasi & Purvanchal (Local Express)';
      timeline = 'Delivery in 24 – 48 Hours';
      note = 'Same/Next day direct dispatch from our Bhoot Bhairav facility.';
    } else if (prefix2 === '20' || prefix2 === '21' || prefix2 === '24' || prefix2 === '26' || prefix2 === '27' || prefix2 === '28') {
      city = 'Uttar Pradesh & NCR';
      timeline = 'Delivery in 2 – 3 Business Days';
      note = 'Fast surface express courier directly from Varanasi.';
    } else if (prefix2 === '11') {
      city = 'Delhi NCR';
      timeline = 'Delivery in 2 – 3 Business Days';
      note = 'Air Express delivery via Bluedart / Courier.';
    } else if (prefix2 === '40' || prefix2 === '41') {
      city = 'Mumbai & Pune';
      timeline = 'Delivery in 2 – 3 Business Days';
      note = 'Priority Express Air dispatch.';
    } else if (prefix2 === '56' || prefix2 === '50' || prefix2 === '60' || prefix2 === '70') {
      city = 'Metro Hub (Bengaluru / Hyd / Kol / Chn)';
      timeline = 'Delivery in 2 – 3 Business Days';
      note = 'Air Express courier delivery.';
    }

    setStatus({
      tested: true,
      valid: true,
      city,
      timeline,
      note
    });
  };

  return (
    <div
      style={{
        margin: '18px 0',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#fbf9f5',
        border: '1px solid rgba(56, 36, 63, 0.08)',
        fontFamily: 'DM Sans, sans-serif'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <MapPin size={15} color="#D4AF37" />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#38243F' }}>
          Check Delivery Serviceability & Date
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', maxWidth: '360px' }}>
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder="Enter 6-digit PIN (e.g. 221001)"
          onKeyDown={(e) => { if (e.key === 'Enter') handleCheck(); }}
          style={{
            flex: 1,
            padding: '9px 12px',
            fontSize: '13px',
            borderRadius: '8px',
            border: '1px solid rgba(56, 36, 63, 0.2)',
            backgroundColor: '#ffffff',
            color: '#38243F',
            outline: 'none',
            fontFamily: 'DM Sans'
          }}
        />
        <button
          type="button"
          onClick={handleCheck}
          style={{
            backgroundColor: '#38243F',
            color: '#ffffff',
            border: 'none',
            padding: '9px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Check
        </button>
      </div>

      {status.tested && (
        <div style={{ marginTop: '12px' }}>
          {status.valid ? (
            <div
              style={{
                backgroundColor: 'rgba(82, 196, 26, 0.08)',
                border: '1px solid rgba(82, 196, 26, 0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#237804'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '2px' }}>
                <Check size={14} /> {status.timeline} ({status.city})
              </div>
              <div style={{ color: '#38243F', fontSize: '11.5px', marginTop: '2px' }}>
                {status.note}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '11px', color: '#666' }}>
                <span>✦ Free shipping above ₹999</span>
                <span>✦ Cold-sealed freshness guaranteed</span>
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: 'rgba(255, 77, 79, 0.08)',
                border: '1px solid rgba(255, 77, 79, 0.25)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#cf1322',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertCircle size={14} /> {status.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
