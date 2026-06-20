import React from 'react';
import { Truck, Plane, Ship, MapPin, Package } from 'lucide-react';

/**
 * Animated transport & logistics scene used as a decorative hero element.
 * Features: dashed route line, moving truck/plane/ship, pulsing pickup & destination pins.
 */
const LogisticsScene: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/70 border border-primary-foreground/10 shadow-card ${className}`}>
    {/* grid backdrop */}
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage:
          'linear-gradient(hsl(var(--primary-foreground)/0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)/0.15) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    />

    {/* SVG route */}
    <svg viewBox="0 0 600 320" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="routeGrad" x1="0" x2="1">
          <stop offset="0" stopColor="hsl(var(--secondary))" />
          <stop offset="1" stopColor="hsl(var(--primary-foreground))" />
        </linearGradient>
      </defs>
      <path
        d="M40 240 C 160 80, 280 320, 400 160 S 560 60, 560 80"
        stroke="hsl(var(--primary-foreground)/0.25)"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M40 240 C 160 80, 280 320, 400 160 S 560 60, 560 80"
        stroke="url(#routeGrad)"
        strokeWidth="3"
        fill="none"
        strokeDasharray="10 10"
        className="animate-dash-flow"
      />
    </svg>

    {/* Origin pin */}
    <div className="absolute left-[5%] top-[70%] -translate-y-1/2 flex items-center gap-2">
      <div className="relative">
        <span className="absolute inset-0 rounded-full bg-secondary animate-ping-soft" />
        <span className="relative block w-3 h-3 rounded-full bg-secondary ring-2 ring-primary-foreground" />
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/80">Origin</div>
    </div>

    {/* Destination pin */}
    <div className="absolute right-[5%] top-[22%] -translate-y-1/2 flex items-center gap-2">
      <MapPin className="w-4 h-4 text-secondary" />
      <div className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/80">Destination</div>
    </div>

    {/* Truck driving */}
    <div className="absolute bottom-6 left-0 w-full">
      <div className="animate-drive-x">
        <div className="animate-bob inline-flex items-center gap-1 px-2 py-1 rounded-md bg-card text-foreground shadow-card">
          <Truck className="w-4 h-4 text-secondary" />
          <span className="text-[10px] font-bold">EuroTransit</span>
        </div>
      </div>
    </div>

    {/* Plane flying */}
    <div className="absolute top-6 left-0 w-full">
      <div className="animate-fly-x">
        <Plane className="w-6 h-6 text-primary-foreground/90 -rotate-12" />
      </div>
    </div>

    {/* Ship sailing */}
    <div className="absolute top-1/2 left-0 w-full -translate-y-1/2">
      <div className="animate-sail-x">
        <Ship className="w-5 h-5 text-primary-foreground/70" />
      </div>
    </div>

    {/* Floating package badge */}
    <div className="absolute bottom-4 right-4 animate-bob">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/95 backdrop-blur shadow-card">
        <Package className="w-4 h-4 text-secondary" />
        <div className="text-[11px]">
          <div className="font-bold text-foreground">In Transit</div>
          <div className="text-muted-foreground">ETA 2h 14m</div>
        </div>
      </div>
    </div>
  </div>
);

export default LogisticsScene;