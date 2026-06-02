import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Truck, Globe, Clock, Shield, ArrowRight, MapPin, CheckCircle, Headphones, Plane, Ship, Train, Warehouse, Boxes, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PartnerLogos from '@/components/PartnerLogos';
import LogisticsScene from '@/components/LogisticsScene';
import { useReveal } from '@/hooks/use-reveal';
import heroImg from '@/assets/hero-logistics.jpg';
import warehouseImg from '@/assets/warehouse.jpg';
import truckImg from '@/assets/delivery-truck.jpg';

const Index: React.FC = () => {
  const [tracking, setTracking] = useState('');
  const navigate = useNavigate();
  useReveal();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (tracking.trim()) {
      navigate(`/track?id=${encodeURIComponent(tracking.trim())}`);
    }
  };

  const features = [
    { icon: Truck, title: 'Express Delivery', desc: 'Same-day and next-day delivery options across 50+ major cities. Priority handling ensures your urgent shipments arrive on time, every time.' },
    { icon: Globe, title: 'Global Coverage', desc: 'Ship to 200+ countries through our network of 10,000+ certified logistics partners. Seamless cross-border solutions with customs clearance included.' },
    { icon: Clock, title: 'Real-Time Tracking', desc: 'Monitor your packages live on an interactive map with GPS precision. Get instant notifications at every checkpoint with accurate ETA predictions.' },
    { icon: Shield, title: 'Secure Shipping', desc: 'Full end-to-end cargo insurance up to $500,000. Temperature-controlled and hazardous material handling available.' },
    { icon: Package, title: 'Warehousing & Fulfillment', desc: 'Strategic warehouse locations in 30+ countries. Inventory management, pick-and-pack, and same-day dispatch services.' },
    { icon: MapPin, title: 'Last Mile Delivery', desc: 'Reliable last-mile delivery with proof of delivery photos, signature capture, and flexible rescheduling options for recipients.' },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'Supply Chain Director, TechCorp', text: 'FastTrackerPro transformed our shipping operations. Real-time tracking reduced our customer inquiries by 60%.' },
    { name: 'Marco Rossi', role: 'CEO, EuroGoods', text: 'The most reliable logistics partner we\'ve worked with. Their global network is unmatched.' },
    { name: 'Amina Diallo', role: 'Operations Manager, AfriTrade', text: 'From customs clearance to last-mile delivery, FastTrackerPro handles everything seamlessly.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero with background image */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Global logistics port" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-primary/80" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left animate-fade-in-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 text-secondary mb-6 text-sm font-medium border border-secondary/30 animate-fade-in">
              <Package className="w-4 h-4" /> Trusted by 50,000+ businesses globally
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '120ms' }}>
              Ship Faster. <br />Track <span className="text-secondary">Smarter.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl lg:mx-0 mx-auto animate-fade-in" style={{ animationDelay: '240ms' }}>
              FastTrackerPro delivers end-to-end logistics solutions with real-time GPS tracking, intelligent route optimization, and 24/7 dedicated support across 200+ countries.
            </p>

            <form onSubmit={handleTrack} className="max-w-xl lg:mx-0 mx-auto flex gap-2 animate-fade-in" style={{ animationDelay: '360ms' }}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={tracking}
                  onChange={e => setTracking(e.target.value)}
                  placeholder="Enter tracking number..."
                  className="pl-10 h-12 bg-card text-foreground border-0 shadow-lg"
                />
              </div>
              <Button type="submit" className="h-12 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold hover-lift">
                Track <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
            </div>
            <div className="block mt-8 lg:mt-0 animate-fade-in-right">
              <LogisticsScene />
            </div>
          </div>
        </div>
      </section>

      <PartnerLogos />

      {/* Freight Modes */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl font-bold text-foreground mb-3">Freight & Transport Solutions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Every mode of transport under one roof — we move your cargo by air, road, rail and sea with full multimodal coordination.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freightModes.map((f, i) => (
              <div key={i} className="reveal hover-lift p-6 rounded-xl bg-card border border-border shadow-card group" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl font-bold text-foreground mb-3">Why Choose FastTrackerPro?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From pickup to delivery, we provide comprehensive logistics solutions designed for modern businesses of all sizes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="reveal hover-lift p-6 rounded-xl bg-card border border-border shadow-card group" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works with images */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to ship your packages worldwide</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative mb-6 rounded-xl overflow-hidden shadow-card aspect-video">
                <img src={warehouseImg} alt="Package collection at warehouse" loading="lazy" width={1280} height={720} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-lg">1</div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Book & Collect</h3>
              <p className="text-sm text-muted-foreground">Schedule a pickup online or drop off at any of our 5,000+ collection points. We handle packaging and labeling.</p>
            </div>
            <div className="text-center">
              <div className="relative mb-6 rounded-xl overflow-hidden shadow-card aspect-video">
                <img src={truckImg} alt="Delivery truck in transit" loading="lazy" width={1280} height={720} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-lg">2</div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Ship & Track</h3>
              <p className="text-sm text-muted-foreground">Your package travels via the optimal route. Track every movement in real-time on our interactive GPS map.</p>
            </div>
            <div className="text-center">
              <div className="relative mb-6 rounded-xl overflow-hidden shadow-card aspect-video bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <CheckCircle className="w-20 h-20 text-secondary" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-lg">3</div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Deliver & Confirm</h3>
              <p className="text-sm text-muted-foreground">Receive your package with proof of delivery. Rate your experience and access delivery history anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '200+', label: 'Countries Served' },
              { value: '50K+', label: 'Active Clients' },
              { value: '99.8%', label: 'On-Time Delivery' },
              { value: '24/7', label: 'Customer Support' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold text-gradient">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">What Our Clients Say</h2>
            <p className="text-muted-foreground">Trusted by businesses across the globe</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border shadow-card">
                <p className="text-muted-foreground text-sm mb-4 italic">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="gradient-primary rounded-2xl p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to Ship Worldwide?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">Join 50,000+ businesses that trust FastTrackerPro for reliable, transparent, and fast global logistics.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/contact')} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 px-8 font-semibold">
                Get a Free Quote
              </Button>
              <Button variant="outline" onClick={() => navigate('/services')} className="h-12 px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Explore Services
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
