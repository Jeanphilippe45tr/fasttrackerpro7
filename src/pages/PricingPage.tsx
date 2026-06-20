import React from 'react';
import { Check, Zap, Building2, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReveal } from '@/hooks/use-reveal';
import { useLang } from '@/i18n/LanguageContext';

const plans = [
  {
    name: 'Starter', icon: Zap, price: '€29', highlight: false,
    desc: 'Perfect for small businesses sending up to 100 shipments per month.',
    features: ['Up to 100 shipments / mo', 'Real-time GPS tracking', 'Email notifications', 'Standard support', 'Basic invoicing'],
  },
  {
    name: 'Business', icon: Building2, price: '€99', highlight: true,
    desc: 'For growing operations with multi-region deliveries and dedicated support.',
    features: ['Up to 1,000 shipments / mo', 'Advanced route optimization', 'Live chat with support', 'PDF tickets & invoices', 'Customs documentation', 'Priority handling'],
  },
  {
    name: 'Enterprise', icon: Rocket, price: 'custom', highlight: false,
    desc: 'Tailored logistics for high-volume shippers and global supply chains.',
    features: ['Unlimited shipments', 'Dedicated account manager', 'API & ERP integration', 'Custom SLAs & insurance', 'White-label tracking', '24/7 phone support'],
  },
];

const PricingPage: React.FC = () => {
  useReveal();
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-muted/30">
      <section className="gradient-primary py-16 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('pricing.title')}</h1>
          <p className="opacity-90 max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <Card key={p.name} className={`reveal hover-lift relative ${p.highlight ? 'border-secondary border-2 shadow-lg' : ''}`} style={{ transitionDelay: `${i * 100}ms` }}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider">{t('pricing.popular')}</div>
              )}
              <CardContent className="pt-8 pb-6">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <p.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{p.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gradient">{p.price === 'custom' ? t('pricing.custom') : p.price}</span>
                  {p.price !== 'custom' && <span className="text-muted-foreground text-sm">{t('pricing.perMonth')}</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${p.highlight ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : ''}`}>
                  {p.name === 'Enterprise' ? t('pricing.contactSales') : t('pricing.getStarted')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PricingPage;