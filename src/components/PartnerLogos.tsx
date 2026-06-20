import React from 'react';

const partners = [
  { name: 'FedEx', tag: 'Express', bg: '#4D148C', accent: '#FF6600' },
  { name: 'DHL', tag: 'Worldwide', bg: '#FFCC00', accent: '#D40511', dark: true },
  { name: 'UPS', tag: 'Logistics', bg: '#351C15', accent: '#FFB500' },
  { name: 'Maersk', tag: 'Shipping', bg: '#42B0D5', accent: '#FFFFFF' },
  { name: 'TNT', tag: 'Express', bg: '#FF6600', accent: '#FFFFFF' },
  { name: 'USPS', tag: 'Postal', bg: '#004B87', accent: '#DA292E' },
  { name: 'Aramex', tag: 'Courier', bg: '#E2231A', accent: '#FFFFFF' },
  { name: 'DB Schenker', tag: 'Freight', bg: '#EC0016', accent: '#FFFFFF' },
  { name: 'Hapag-Lloyd', tag: 'Maritime', bg: '#FF6B00', accent: '#FFFFFF' },
  { name: 'CMA CGM', tag: 'Container', bg: '#003B71', accent: '#E2231A' },
  { name: 'Royal Mail', tag: 'Postal', bg: '#E10000', accent: '#FFD700' },
  { name: 'La Poste', tag: 'France', bg: '#003DA5', accent: '#FFCC00' },
];

const PartnerLogos: React.FC = () => (
  <section className="py-16 bg-muted/40">
    <div className="container mx-auto px-4">
      <div className="text-center mb-10">
        <p className="text-sm font-medium text-secondary mb-2 uppercase tracking-wider">Global Network</p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Integrated With Top Carriers Worldwide</h2>
        <p className="text-muted-foreground mt-2 text-sm max-w-2xl mx-auto">EuroTransit connects to 100+ carriers globally so your shipments move seamlessly across networks.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {partners.map(p => (
          <div key={p.name}
            className="aspect-[16/9] rounded-xl flex flex-col items-center justify-center shadow-card hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden"
            style={{ background: p.bg }}>
            <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 30% 30%, ${p.accent}, transparent)` }} />
            <span className="font-extrabold text-lg md:text-xl tracking-tight relative z-10" style={{ color: p.accent }}>{p.name}</span>
            <span className="text-[10px] md:text-xs uppercase tracking-widest relative z-10 mt-0.5" style={{ color: p.dark ? '#000' : 'rgba(255,255,255,0.85)' }}>{p.tag}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PartnerLogos;
