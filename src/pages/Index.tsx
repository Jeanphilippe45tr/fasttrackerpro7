import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Truck, Globe, Clock, Shield, ArrowRight, MapPin, CheckCircle, Headphones, Plane, Ship, Train, Warehouse, Boxes, Snowflake, Wallet, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PartnerLogos from '@/components/PartnerLogos';
import LogisticsScene from '@/components/LogisticsScene';
import { useReveal } from '@/hooks/use-reveal';
import { useLang } from '@/i18n/LanguageContext';
import heroImg from '@/assets/hero-logistics.jpg';
import warehouseImg from '@/assets/warehouse.jpg';
import truckImg from '@/assets/delivery-truck.jpg';

const Index: React.FC = () => {
  const [tracking, setTracking] = useState('');
  const navigate = useNavigate();
  useReveal();
  const { t } = useLang();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (tracking.trim()) {
      navigate(`/track?id=${encodeURIComponent(tracking.trim())}`);
    }
  };

  const features = [
    { icon: Truck, k: 'feat.express' },
    { icon: Globe, k: 'feat.coverage' },
    { icon: Clock, k: 'feat.tracking' },
    { icon: Shield, k: 'feat.secure' },
    { icon: Package, k: 'feat.warehousing' },
    { icon: MapPin, k: 'feat.lastmile' },
  ];

  const freightModes = [
    { icon: Plane, k: 'freight.air' },
    { icon: Truck, k: 'freight.road' },
    { icon: Ship, k: 'freight.sea' },
    { icon: Train, k: 'freight.rail' },
    { icon: Warehouse, k: 'freight.warehouse' },
    { icon: Boxes, k: 'freight.multimodal' },
    { icon: Globe, k: 'freight.customs' },
    { icon: Snowflake, k: 'freight.cold' },
    { icon: Shield, k: 'freight.heavy' },
  ];

  const relayFeatures = [
    { icon: Wallet, k: 'relay.feat1' },
    { icon: Clock, k: 'relay.feat2' },
    { icon: Leaf, k: 'relay.feat3' },
    { icon: MapPin, k: 'relay.feat4' },
  ];
  const relayStats = [
    { n: 'relay.stat1.n', l: 'relay.stat1.l' },
    { n: 'relay.stat2.n', l: 'relay.stat2.l' },
    { n: 'relay.stat3.n', l: 'relay.stat3.l' },
    { n: 'relay.stat4.n', l: 'relay.stat4.l' },
  ];

  const testimonials = [
    { name: 'Sophie Laurent', role: 'test.1.role', text: 'test.1.text' },
    { name: 'Marco Rossi', role: 'test.2.role', text: 'test.2.text' },
    { name: 'Lukas Müller', role: 'test.3.role', text: 'test.3.text' },
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
              <Package className="w-4 h-4" /> {t('hero.badge')}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '120ms' }}>
              {t('hero.title1')} <br /><span className="text-secondary">{t('hero.title2')}</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl lg:mx-0 mx-auto animate-fade-in" style={{ animationDelay: '240ms' }}>
              {t('hero.subtitle')}
            </p>

            <form onSubmit={handleTrack} className="max-w-xl lg:mx-0 mx-auto flex gap-2 animate-fade-in" style={{ animationDelay: '360ms' }}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={tracking}
                  onChange={e => setTracking(e.target.value)}
                  placeholder={t('hero.placeholder')}
                  className="pl-10 h-12 bg-card text-foreground border-0 shadow-lg"
                />
              </div>
              <Button type="submit" className="h-12 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold hover-lift">
                {t('hero.track')} <ArrowRight className="w-4 h-4 ml-1" />
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
            <h2 className="text-3xl font-bold text-foreground mb-3">{t('freight.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('freight.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freightModes.map((f, i) => (
              <div key={i} className="reveal hover-lift p-6 rounded-xl bg-card border border-border shadow-card group" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{t(`${f.k}.t`)}</h3>
                <p className="text-muted-foreground text-sm">{t(`${f.k}.d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mondial Relay */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 text-secondary mb-4 text-sm font-medium border border-secondary/30">
              <Package className="w-4 h-4" /> {t('relay.badge')}
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">{t('relay.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('relay.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {relayStats.map((s, i) => (
              <div key={i} className="reveal text-center p-5 rounded-xl bg-muted/40 border border-border" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="text-2xl md:text-3xl font-bold text-gradient">{t(s.n)}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{t(s.l)}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {relayFeatures.map((f, i) => (
              <div key={i} className="reveal hover-lift p-6 rounded-xl bg-muted/30 border border-border" style={{ transitionDelay: `${i * 80}ms` }}>
                <f.icon className="w-9 h-9 text-secondary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{t(`${f.k}.t`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`${f.k}.d`)}</p>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder={t('relay.placeholder')} className="pl-10 h-12" />
            </div>
            <Button type="submit" className="h-12 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
              {t('relay.search')}
            </Button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl font-bold text-foreground mb-3">{t('features.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="reveal hover-lift p-6 rounded-xl bg-card border border-border shadow-card group" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{t(`${f.k}.t`)}</h3>
                <p className="text-muted-foreground text-sm">{t(`${f.k}.d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works with images */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl font-bold text-foreground mb-3">{t('how.title')}</h2>
            <p className="text-muted-foreground">{t('how.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative mb-6 rounded-xl overflow-hidden shadow-card aspect-video">
                <img src={warehouseImg} alt="Package collection at warehouse" loading="lazy" width={1280} height={720} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-lg">1</div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{t('how.step1.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('how.step1.desc')}</p>
            </div>
            <div className="text-center">
              <div className="relative mb-6 rounded-xl overflow-hidden shadow-card aspect-video">
                <img src={truckImg} alt="Delivery truck in transit" loading="lazy" width={1280} height={720} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-lg">2</div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{t('how.step2.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('how.step2.desc')}</p>
            </div>
            <div className="text-center">
              <div className="relative mb-6 rounded-xl overflow-hidden shadow-card aspect-video bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <CheckCircle className="w-20 h-20 text-secondary" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-lg">3</div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{t('how.step3.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('how.step3.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '200+', label: t('stats.countries') },
              { value: '50K+', label: t('stats.clients') },
              { value: '99.8%', label: t('stats.ontime') },
              { value: '24/7', label: t('stats.support') },
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
            <h2 className="text-3xl font-bold text-foreground mb-3">{t('testimonials.title')}</h2>
            <p className="text-muted-foreground">{t('testimonials.subtitle')}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">{t('cta.title')}</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">{t('cta.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/contact')} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 px-8 font-semibold">
                {t('cta.quote')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/services')} className="h-12 px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                {t('cta.explore')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
