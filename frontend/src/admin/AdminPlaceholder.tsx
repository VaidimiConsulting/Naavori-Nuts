import React from 'react';
import { Construction } from 'lucide-react';

export default function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', color: '#38243F' }}>
      <Construction size={48} color="#D4AF37" style={{ marginBottom: '16px' }} />
      <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', margin: '0 0 8px 0' }}>{title}</h1>
      <p style={{ fontFamily: 'DM Sans', color: '#666' }}>This module is currently under development.</p>
    </div>
  );
}
