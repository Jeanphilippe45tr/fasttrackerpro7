import React from 'react';
import { Mail, Phone, MapPin, Clock, Globe, Headphones } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useLang } from '@/i18n/LanguageContext';

const ContactPage: React.FC = () => {
  const { t } = useLang();
  const channels = [
    { icon: Mail, title: t('contact.email.t'), info: 'support@eurotransit.eu', sub: t('contact.email.sub') },
    { icon: Phone, title: t('contact.call.t'), info: 'EuroTransit', sub: t('contact.call.sub') },
    { icon: MapPin, title: t('contact.hq.t'), info: 'Berlin, Germany', sub: t('contact.hq.sub') },
    { icon: Clock, title: t('contact.hours.t'), info: t('contact.hours.info'), sub: t('contact.hours.sub') },
    { icon: Globe, title: t('contact.regional.t'), info: 'London • Paris • Madrid • Amsterdam', sub: t('contact.regional.sub') },
    { icon: Headphones, title: t('contact.chat.t'), info: t('contact.chat.info'), sub: t('contact.chat.sub') },
  ];
  return (
  <div className="min-h-screen bg-muted/30 py-16">
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-3">{t('contact.title')}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t('contact.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {channels.map((c, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <c.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{c.title}</h3>
                <p className="text-sm text-foreground">{c.info}</p>
                <p className="text-xs text-muted-foreground">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <Card className="shadow-card">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('contact.form.title')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium text-foreground">{t('contact.form.name')}</label><Input placeholder={t('contact.form.namePh')} className="mt-1" /></div>
              <div><label className="text-sm font-medium text-foreground">{t('contact.form.email')}</label><Input type="email" placeholder={t('contact.form.emailPh')} className="mt-1" /></div>
            </div>
            <div><label className="text-sm font-medium text-foreground">{t('contact.form.company')}</label><Input placeholder={t('contact.form.companyPh')} className="mt-1" /></div>
            <div><label className="text-sm font-medium text-foreground">{t('contact.form.subject')}</label><Input placeholder={t('contact.form.subjectPh')} className="mt-1" /></div>
            <div><label className="text-sm font-medium text-foreground">{t('contact.form.message')}</label><Textarea placeholder={t('contact.form.messagePh')} rows={4} className="mt-1" /></div>
            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">{t('contact.form.send')}</Button>
            <p className="text-xs text-muted-foreground text-center">{t('contact.form.note')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  );
};

export default ContactPage;
