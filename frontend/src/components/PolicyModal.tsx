import { X, ShieldAlert, Truck, FileText } from 'lucide-react';

export type PolicyType = 'no-return' | 'shipping' | 'terms';

interface PolicyModalProps {
  type: PolicyType;
  onClose: () => void;
}

export function PolicyModal({ type, onClose }: PolicyModalProps) {
  const content = {
    'no-return': {
      title: 'Strict No-Return & No-Refund Policy',
      icon: <ShieldAlert size={24} color="#8c5825" />,
      tag: 'Food Safety & Hygiene Standard',
      body: (
        <>
          <p>
            At <strong>NAAVORI NUTS</strong>, every batch of nuts, seeds, and spices is a 100% natural, perishable food item, packaged in hermetically sealed food-grade glass jars and multilayer pouches at our Varanasi facility.
          </p>
          <h4>1. Non-Returnable Perishable Goods</h4>
          <p>
            As a standard hygiene protocol for perishable gourmet food items, items once dispatched and received are <strong>strictly non-returnable and non-refundable</strong>.
          </p>
          <h4>2. Reasons for Policy</h4>
          <ul>
            <li>To prevent temperature abuse, contamination, and cross-exposure.</li>
            <li>To guarantee that every patron receives an uncompromised, virgin batch directly from source.</li>
          </ul>
          <h4>3. Transit Damage or Wrong Item</h4>
          <p>
            If your package arrives physically broken or unsealed due to courier transit damage, please WhatsApp our Concierge at <strong>+91 83188 29334</strong> within <strong>24 hours of delivery</strong> with an unboxing photograph. Our team will verify and dispatch an immediate complimentary replacement.
          </p>
        </>
      ),
    },
    'shipping': {
      title: 'Shipping & Delivery Policy',
      icon: <Truck size={24} color="#D4AF37" />,
      tag: 'Dispatched from Varanasi, UP',
      body: (
        <>
          <h4>1. Dispatch Timeline</h4>
          <p>
            All confirmed orders are freshly assembled, weighed, quality-checked, and dispatched within <strong>24 hours</strong> directly from our Varanasi facility (K63/112, Nakkash, Bhoot Bhairav).
          </p>
          <h4>2. Shipping Charges</h4>
          <ul>
            <li><strong>Complimentary Free Shipping:</strong> On all orders of ₹999 and above across India.</li>
            <li><strong>Standard Shipping Fee:</strong> ₹99 flat for orders below ₹999.</li>
          </ul>
          <h4>3. Delivery Timelines by Region</h4>
          <ul>
            <li><strong>Varanasi & Purvanchal:</strong> 24 – 48 Hours</li>
            <li><strong>Uttar Pradesh & Delhi NCR:</strong> 2 – 3 Business Days</li>
            <li><strong>Metro Hubs (Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad):</strong> 2 – 3 Business Days</li>
            <li><strong>Rest of India:</strong> 3 – 5 Business Days</li>
          </ul>
          <p>
            Live tracking updates and AWB tracking numbers are shared directly via SMS and WhatsApp.
          </p>
        </>
      ),
    },
    'terms': {
      title: 'Terms of Service & Privacy',
      icon: <FileText size={24} color="#38243F" />,
      tag: 'Customer Data Confidentiality',
      body: (
        <>
          <h4>1. Privacy Assurance</h4>
          <p>
            We respect your privacy deeply. Your 10-digit mobile number, email, and address are collected strictly for order processing, courier dispatch, and live delivery updates. We never sell, lease, or share customer data with third-party advertisers.
          </p>
          <h4>2. Payment Policy</h4>
          <p>
            We offer convenient <strong>Cash on Delivery (COD)</strong> across all serviceable locations in India. You may pay with cash or your preferred UPI app directly to our delivery courier upon parcel handover.
          </p>
          <h4>3. Contact & Concierge</h4>
          <p>
            For any queries or assistance, contact store ownership directly at <strong>+91 83188 29334</strong> or <strong>info@naavori.in</strong>.
          </p>
        </>
      ),
    },
  }[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(56, 36, 63, 0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
          fontFamily: 'DM Sans, sans-serif',
          color: '#38243F',
          padding: '32px 28px',
          position: 'relative',
          animation: 'fadeInUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(56, 36, 63, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#38243F',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          {content.icon}
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
              color: 'var(--gold, #b78d52)',
            }}
          >
            {content.tag}
          </span>
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '4px 0 16px', color: '#38243F' }}>
          {content.title}
        </h2>

        <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#4a3b4f' }}>
          {content.body}
        </div>

        <button
          onClick={onClose}
          className="button button--dark button--full"
          style={{ marginTop: '24px' }}
        >
          Understood & Close
        </button>
      </div>
    </div>
  );
}
