import React from 'react';
import { Truck, Globe, Package, Shield, Clock, Plane, Ship, Train, CheckCircle, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useReveal } from '@/hooks/use-reveal';
import { useLang } from '@/i18n/LanguageContext';
import truckImg from '@/assets/delivery-truck.jpg';
import warehouseImg from '@/assets/warehouse.jpg';

const ServicesPage: React.FC = () => {
  useReveal();
  const { t } = useLang();

  const services = [
    { icon: Truck, k: 'svc.express', color: 'text-secondary' },
    { icon: Plane, k: 'svc.air', color: 'text-info' },
    { icon: Ship, k: 'svc.sea', color: 'text-primary' },
    { icon: Train, k: 'svc.rail', color: 'text-success' },
    { icon: MapPin, k: 'svc.relay', color: 'text-secondary' },
    { icon: Package, k: 'svc.warehouse', color: 'text-warning' },
    { icon: Globe, k: 'svc.customs', color: 'text-destructive' },
    { icon: Shield, k: 'svc.insurance', color: 'text-primary' },
    { icon: Clock, k: 'svc.supply', color: 'text-secondary' },
  ];

  const benefits = ['benefit.1', 'benefit.2', 'benefit.3', 'benefit.4', 'benefit.5', 'benefit.6'];

  return (
  <div className="min-h-screen bg-muted/30">
    {/* Hero Banner */}
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img src={truckImg} alt="Logistics fleet" loading="lazy" width={1280} height={720} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/85" />
      </div>
      <div className="container mx-auto px-4 relative text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4 animate-fade-in">{t('services.hero.title')}</h1>
        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg animate-fade-in" style={{ animationDelay: '120ms' }}>{t('services.hero.subtitle')}</p>
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
                <h3 className="font-semibold text-lg text-foreground mb-2">{t(`${s.k}.t`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`${s.k}.d`)}</p>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">{t('services.why.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('services.why.desc')}</p>
            <ul className="space-y-3">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  {t(b)}
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
