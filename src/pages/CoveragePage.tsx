import React from 'react';
import { Globe2, MapPin } from 'lucide-react';
import LogisticsScene from '@/components/LogisticsScene';
import { useReveal } from '@/hooks/use-reveal';

const regions = [
  { name: 'North America', countries: 23, hubs: ['New York', 'Los Angeles', 'Toronto', 'Mexico City'] },
  { name: 'Europe', countries: 44, hubs: ['London', 'Paris', 'Frankfurt', 'Amsterdam', 'Madrid'] },
  { name: 'Asia Pacific', countries: 38, hubs: ['Tokyo', 'Singapore', 'Hong Kong', 'Sydney', 'Mumbai'] },
  { name: 'Africa', countries: 54, hubs: ['Lagos', 'Nairobi', 'Cape Town', 'Cairo', 'Douala'] },
  { name: 'Middle East', countries: 16, hubs: ['Dubai', 'Riyadh', 'Doha', 'Tel Aviv'] },
  { name: 'South America', countries: 13, hubs: ['São Paulo', 'Buenos Aires', 'Bogotá', 'Lima'] },
];

const CoveragePage: React.FC = () => {
  useReveal();
  return (
    <div className="min-h-screen bg-muted/30">
      <section className="gradient-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div className="reveal">
            <Globe2 className="w-12 h-12 text-secondary mb-4 animate-spin-slow" />
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Global Coverage</h1>
            <p className="opacity-90">From bustling megacities to remote villages — EuroTransit reaches 200+ countries through our integrated air, sea, rail, and road network.</p>
          </div>
          <LogisticsScene />
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((r, i) => (
            <div key={r.name} className="reveal hover-lift p-6 rounded-xl bg-card border border-border shadow-card" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-foreground">{r.name}</h3>
                <span className="text-sm font-semibold text-secondary">{r.countries} countries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.hubs.map(h => (
                  <span key={h} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-medium">
                    <MapPin className="w-3 h-3" /> {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CoveragePage;