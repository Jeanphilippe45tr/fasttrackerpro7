import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useReveal } from '@/hooks/use-reveal';

const faqs = [
  { q: 'How do I track my package?', a: 'Enter your tracking number on the Track page. You will see a live map, every checkpoint, and the estimated arrival time updated in real-time.' },
  { q: 'What happens if my shipment is paused?', a: 'When the admin pauses a shipment, the reason is displayed directly on your tracking page. You can also chat live with our support team for clarification.' },
  { q: 'Can the destination of a package change mid-route?', a: 'Yes. If the destination is updated, a new tracking number will be generated and the route, ETA, and live map will recalculate automatically.' },
  { q: 'Do you ship internationally?', a: 'We deliver to 200+ countries with full customs clearance, documentation handling, and door-to-door tracking.' },
  { q: 'How are tickets and invoices issued?', a: 'Admins can generate professional PDF tickets (paid receipts or pending invoices) including QR codes, taxes, discounts, and payment instructions. Clients can preview and download them from their tracking page.' },
  { q: 'Is my cargo insured?', a: 'All shipments are covered by base liability insurance, and you can opt for full coverage up to €450,000 per shipment.' },
  { q: 'What payment methods do you accept?', a: 'Bank transfer, credit card, and major mobile money providers depending on your region. Payment instructions appear on every invoice.' },
  { q: 'How fast is express delivery?', a: 'Same-day in 50+ major cities and next-day across most of Europe, North America, and Asia.' },
];

const FaqPage: React.FC = () => {
  useReveal();
  return (
    <div className="min-h-screen bg-muted/30">
      <section className="gradient-primary py-16 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-secondary animate-bob" />
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Frequently Asked Questions</h1>
          <p className="opacity-90 max-w-2xl mx-auto">Everything you need to know about shipping, tracking, billing, and our global services.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl reveal">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border rounded-xl px-4 shadow-card">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;