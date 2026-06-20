import React from 'react';
import { Users, Award, Globe, Target, TrendingUp, Heart } from 'lucide-react';
import { useReveal } from '@/hooks/use-reveal';
import heroImg from '@/assets/hero-logistics.jpg';

const AboutPage: React.FC = () => {
  useReveal();
  return (
  <div className="min-h-screen bg-muted/30">
    {/* Hero */}
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="Global logistics operations" loading="lazy" width={1920} height={1080} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/85" />
      </div>
      <div className="container mx-auto px-4 relative text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4 animate-fade-in">About EuroTransit</h1>
        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg animate-fade-in" style={{ animationDelay: '120ms' }}>Your trusted partner in global logistics since 2010. Connecting businesses and people across 200+ countries.</p>
      </div>
    </section>

    <div className="container mx-auto px-4 max-w-5xl py-16">
      {/* Story */}
      <div className="mb-16 reveal">
        <h2 className="text-2xl font-bold text-foreground mb-4">Our Story</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Founded in 2010 by a team of logistics veterans and technology innovators, EuroTransit was born from a simple idea: shipping should be transparent, reliable, and accessible to everyone.</p>
          <p>Starting with a single warehouse in New York, we've grown into a global logistics network spanning 200+ countries with over 10,000 certified partners. Our proprietary GPS tracking technology gives clients unprecedented visibility into their shipments, from pickup to doorstep delivery.</p>
          <p>Today, we serve over 50,000 businesses — from small e-commerce sellers to Fortune 500 companies — delivering more than 2 million packages every month with a 99.8% on-time delivery rate.</p>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {[
          { icon: Target, title: 'Our Mission', desc: 'To revolutionize global logistics with technology-driven solutions that make shipping faster, safer, and more transparent for businesses of all sizes.' },
          { icon: Globe, title: 'Global Reach', desc: 'Operating in 200+ countries with a network of 10,000+ logistics partners, 500+ warehouses, and strategic hub locations on every continent.' },
          { icon: Users, title: 'Our Team', desc: 'A diverse team of 5,000+ logistics professionals, engineers, and customer support specialists committed to excellence in every shipment.' },
          { icon: Award, title: 'Recognition', desc: 'Named "Best Logistics Technology Platform" three years running by Global Supply Chain Awards. ISO 9001 and ISO 14001 certified.' },
          { icon: TrendingUp, title: 'Innovation', desc: 'Investing over $20M annually in R&D. Our AI-powered route optimization reduces transit times by up to 30% while cutting carbon emissions.' },
          { icon: Heart, title: 'Sustainability', desc: 'Committed to carbon-neutral operations by 2028. Electric vehicle fleet deployment in 15+ cities. Eco-friendly packaging programs for all clients.' },
        ].map((item, i) => (
          <div key={i} className="reveal hover-lift flex gap-4 p-6 rounded-xl bg-card border border-border shadow-card" style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <item.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="gradient-primary rounded-2xl p-8 md:p-12 reveal">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '15+', label: 'Years of Experience' },
            { value: '2M+', label: 'Monthly Deliveries' },
            { value: '200+', label: 'Countries' },
            { value: '5,000+', label: 'Team Members' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-secondary">{s.value}</div>
              <div className="text-sm text-primary-foreground/80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};

export default AboutPage;
