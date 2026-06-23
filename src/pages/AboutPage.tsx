import React from 'react';
import { Users, Award, Globe, Target, TrendingUp, Heart } from 'lucide-react';
import { useReveal } from '@/hooks/use-reveal';
import { useLang } from '@/i18n/LanguageContext';
import heroImg from '@/assets/hero-logistics.jpg';

const AboutPage: React.FC = () => {
  useReveal();
  const { t } = useLang();
  return (
  <div className="min-h-screen bg-muted/30">
    {/* Hero */}
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="Global logistics operations" loading="lazy" width={1920} height={1080} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/85" />
      </div>
      <div className="container mx-auto px-4 relative text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4 animate-fade-in">{t('about.hero.title')}</h1>
        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg animate-fade-in" style={{ animationDelay: '120ms' }}>{t('about.hero.subtitle')}</p>
      </div>
    </section>

    <div className="container mx-auto px-4 max-w-5xl py-16">
      {/* Story */}
      <div className="mb-16 reveal">
        <h2 className="text-2xl font-bold text-foreground mb-4">{t('about.story.title')}</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>{t('about.story.p1')}</p>
          <p>{t('about.story.p2')}</p>
          <p>{t('about.story.p3')}</p>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {[
          { icon: Target, k: 'about.val.mission' },
          { icon: Globe, k: 'about.val.reach' },
          { icon: Users, k: 'about.val.team' },
          { icon: Award, k: 'about.val.recognition' },
          { icon: TrendingUp, k: 'about.val.innovation' },
          { icon: Heart, k: 'about.val.sustainability' },
        ].map((item, i) => (
          <div key={i} className="reveal hover-lift flex gap-4 p-6 rounded-xl bg-card border border-border shadow-card" style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <item.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">{t(`${item.k}.t`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`${item.k}.d`)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="gradient-primary rounded-2xl p-8 md:p-12 reveal">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '15+', label: t('about.stat.years') },
            { value: '2M+', label: t('about.stat.deliveries') },
            { value: '200+', label: t('about.stat.countries') },
            { value: '5,000+', label: t('about.stat.team') },
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
