import { useState } from 'react';
import { Phone, X, Sparkles, Building2, Clock, CheckCircle2 } from 'lucide-react';

export function WhatsAppIcon({ size = 30, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export function FloatingConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const ownerPhone = '+918318819334';
  const ownerPhoneDisplay = '+91 83188 19334';
  const directPhone = '+918448170969';
  const directPhoneDisplay = '+91 84481 70969';

  const whatsappUrl = `https://wa.me/918318819334?text=${encodeURIComponent(
    'Namaste NAAVORI NUTS, I would like to inquire about your ingredients / order assistance.'
  )}`;

  return (
    <>
      {/* Floating Trigger Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9990,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        {!isOpen && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {/* Tooltip on hover */}
            <div
              style={{
                position: 'absolute',
                right: 'calc(100% + 14px)',
                backgroundColor: '#201424',
                color: '#ffffff',
                padding: '7px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateX(0)' : 'translateX(8px)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Chat on WhatsApp</span>
              <span style={{ color: 'var(--gold, #b78d52)' }}>✦</span>
            </div>

            {/* Circular WhatsApp Button */}
            <button
              onClick={() => setIsOpen(true)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              aria-label="Chat with Concierge on WhatsApp"
              title="Chat on WhatsApp"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#25D366',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(37, 211, 102, 0.45), 0 4px 12px rgba(36, 23, 37, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                outline: 'none',
                position: 'relative',
                transform: isHovered ? 'translateY(-3px) scale(1.08)' : 'translateY(0) scale(1)',
              }}
            >
              <WhatsAppIcon size={32} color="#ffffff" />
              {/* Active online dot badge */}
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#128C7E',
                  }}
                />
              </span>
            </button>
          </div>
        )}

        {/* Modal / Card */}
        {isOpen && (
          <div
            style={{
              width: '340px',
              maxWidth: 'calc(100vw - 32px)',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 24px 60px rgba(56, 36, 63, 0.25), 0 4px 16px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              overflow: 'hidden',
              animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #38243F 0%, #201424 100%)',
                color: '#F4EDE4',
                padding: '20px 20px 18px',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close concierge"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    color: 'var(--gold-light, #d9bd91)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles size={11} /> NAAVORI HOUSE
                </span>
                <span style={{ fontSize: '11px', color: '#52c41a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#52c41a' }} /> Online
                </span>
              </div>

              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>
                Heritage Concierge
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(244, 237, 228, 0.8)', lineHeight: 1.4 }}>
                Direct assistance from Varanasi for fresh batches, sourcing & order assistance.
              </p>
            </div>

            {/* Body Actions */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                  transition: 'background 0.2s ease',
                }}
              >
                <WhatsAppIcon size={22} color="#ffffff" />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ lineHeight: 1.2 }}>WhatsApp Concierge</div>
                  <small style={{ fontSize: '11px', opacity: 0.9, fontWeight: 400 }}>Immediate replies · {ownerPhoneDisplay}</small>
                </div>
                <span style={{ fontSize: '14px' }}>↗</span>
              </a>

              {/* Direct Call to Owner */}
              <a
                href={`tel:${ownerPhone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#fcfaf6',
                  color: '#38243F',
                  border: '1px solid rgba(56, 36, 63, 0.12)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  transition: 'all 0.2s ease',
                }}
              >
                <Phone size={18} color="#D4AF37" />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ lineHeight: 1.2 }}>Call Store Owner</div>
                  <small style={{ fontSize: '11px', color: '#7a6a7c', fontWeight: 400 }}>{ownerPhoneDisplay}</small>
                </div>
                <span style={{ color: 'var(--gold, #b78d52)', fontSize: '13px' }}>📞</span>
              </a>

              {/* Direct Secondary Line */}
              <a
                href={`tel:${directPhone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#fcfaf6',
                  color: '#38243F',
                  border: '1px solid rgba(56, 36, 63, 0.12)',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '12.5px',
                }}
              >
                <Phone size={16} color="#7a6a7c" />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ lineHeight: 1.2 }}>Direct Desk</div>
                  <small style={{ fontSize: '11px', color: '#7a6a7c', fontWeight: 400 }}>{directPhoneDisplay}</small>
                </div>
                <span style={{ color: '#7a6a7c', fontSize: '12px' }}>📞</span>
              </a>

              {/* Corporate & Bulk Info */}
              <div
                style={{
                  backgroundColor: 'rgba(56, 36, 63, 0.04)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  color: '#55425c',
                  lineHeight: 1.45,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <Building2 size={15} color="#D4AF37" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Bulk & Institutional Orders:</strong> Custom packaging & wholesale pricing available for 25+ units.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                backgroundColor: '#faf7f2',
                padding: '10px 16px',
                borderTop: '1px solid rgba(56, 36, 63, 0.06)',
                fontSize: '11px',
                color: '#8a7a8d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> 9:00 AM – 9:00 PM IST
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#52c41a' }}>
                <CheckCircle2 size={12} /> Varanasi HQ
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
