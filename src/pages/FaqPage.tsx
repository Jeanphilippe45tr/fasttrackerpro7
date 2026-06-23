import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useReveal } from '@/hooks/use-reveal';
import { useLang } from '@/i18n/LanguageContext';

const FaqPage: React.FC = () => {
  useReveal();
  const { t } = useLang();
  const faqs = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ q: `faq.q${n}`, a: `faq.a${n}` }));
  return (
    <div className="min-h-screen bg-muted/30">
      <section className="gradient-primary py-16 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-secondary animate-bob" />
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('faq.title')}</h1>
          <p className="opacity-90 max-w-2xl mx-auto">{t('faq.subtitle')}</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl reveal">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border rounded-xl px-4 shadow-card">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">{t(f.q)}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{t(f.a)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;