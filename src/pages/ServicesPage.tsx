import React from 'react';
import { Truck, Globe, Package, Shield, Clock, Plane, Ship, Train, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useReveal } from '@/hooks/use-reveal';
import truckImg from '@/assets/delivery-truck.jpg';
import warehouseImg from '@/assets/warehouse.jpg';

const services = [
  { icon: Truck, title: 'Express Delivery', desc: 'Same-day and next-day delivery services for time-critical shipments. Available in 50+ major cities worldwide with guaranteed delivery windows.', color: 'text-secondary' },
  { icon: Plane, title: 'Air Freight', desc: 'Fast and reliable air cargo services for international shipments. Door-to-door and airport-to-airport options with priority customs clearance.', color: 'text-info' },
  { icon: Ship, title: 'Sea Freight', desc: 'Cost-effective ocean shipping for large volumes. Full Container Load (FCL) and Less than Container Load (LCL) options with competitive transit times.', color: 'text-primary' },
  { icon: Train, title: 'Rail Freight', desc: 'Eco-friendly rail transport connecting major trade routes across Europe, Asia, and North America. Ideal for heavy and bulk cargo.', color: 'text-success' },
  { icon: Package, title: 'Warehousing & Fulfillment', desc: 'Strategic warehouse locations in 30+ countries. Complete fulfillment services including storage, inventory management, and order processing.', color: 'text-warning' },
  { icon: Globe, title: 'Customs Brokerage', desc: 'Expert customs clearance ensuring smooth cross-border shipments. We handle documentation, duties, taxes, and compliance requirements.', color: 'text-destructive' },
  { icon: Shield, title: 'Cargo Insurance', desc: 'Comprehensive insurance coverage up to $500,000 for all types of shipments. Protection against loss, damage, and delays.', color: 'text-primary' },
  { icon: Clock, title: 'Supply Chain Solutions', desc: 'End-to-end supply chain management including procurement logistics, vendor management, and distribution optimization.', color: 'text-secondary' },
];

const benefits = [
  'Real-time GPS tracking on every shipment',
  'Dedicated account manager for business clients',
  'Automated customs documentation',
  'Carbon-neutral shipping options',
  'Flexible payment terms for enterprises',
  '99.8% on-time delivery guarantee',
];

const ServicesPage: React.FC = () => {
  useReveal();
  return (
  <div className="min-h-screen bg-muted/30">
    {/* Hero Banner */}
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img src={truckImg} alt="Logistics fleet" loading="lazy" width={1280} height={720} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/85" />
      </div>
      <div className="container mx-auto px-4 relative text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4 animate-fade-in">Our Services</h1>
        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg animate-fade-in" style={{ animationDelay: '120ms' }}>Comprehensive logistics solutions tailored to your business needs. From express parcels to full container loads, we deliver everywhere.</p>
      </div>
    </section>

    {/* Services Grid */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <Card key={i} className="reveal hover-lift group" style={{ transitionDelay: `${i * 70}ms` }}>
              <CardContent className="pt-6">
                <s.icon className={`w-10 h-10 ${s.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="font-semibold text-lg text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Why Us Section */}
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="reveal">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Businesses Choose Us</h2>
            <p className="text-muted-foreground mb-6">We combine cutting-edge technology with decades of logistics expertise to deliver a service that's fast, reliable, and transparent.</p>
            <ul className="space-y-3">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal rounded-xl overflow-hidden shadow-card">
            <img src={warehouseImg} alt="Modern warehouse facility" loading="lazy" width={1280} height={720} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  </div>
  );
};

export default ServicesPage;
