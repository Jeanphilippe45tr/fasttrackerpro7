import React from 'react';
import { Mail, Phone, MapPin, Clock, Globe, Headphones } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const ContactPage: React.FC = () => (
  <div className="min-h-screen bg-muted/30 py-16">
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-3">Get In Touch</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Have a question about your shipment? Need a custom logistics solution? Our team of experts is ready to help you 24/7.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {[
            { icon: Mail, title: 'Email Us', info: 'support@fasttrackerp.com', sub: 'We respond within 2 hours' },
            { icon: Phone, title: 'Call Us', info: 'Fast-Tracker Pro', sub: 'Toll-free, available 24/7' },
            { icon: MapPin, title: 'Headquarters', info: 'World Wide Europe', sub: 'Open Mon-Fri, 8AM-6PM EST' },
            { icon: Clock, title: 'Business Hours', info: 'Monday - Friday: 8AM - 8PM EST', sub: '24/7 online tracking available' },
            { icon: Globe, title: 'Regional Offices', info: 'London • Dubai • Singapore • São Paulo', sub: 'Local support in your timezone' },
            { icon: Headphones, title: 'Live Chat', info: 'Available on every page', sub: 'Average response time: 30 seconds' },
          ].map((c, i) => (
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
            <h3 className="text-lg font-semibold text-foreground mb-2">Send Us a Message</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium text-foreground">Name</label><Input placeholder="Your name" className="mt-1" /></div>
              <div><label className="text-sm font-medium text-foreground">Email</label><Input type="email" placeholder="Your email" className="mt-1" /></div>
            </div>
            <div><label className="text-sm font-medium text-foreground">Company (Optional)</label><Input placeholder="Your company name" className="mt-1" /></div>
            <div><label className="text-sm font-medium text-foreground">Subject</label><Input placeholder="How can we help?" className="mt-1" /></div>
            <div><label className="text-sm font-medium text-foreground">Message</label><Textarea placeholder="Tell us about your shipping needs..." rows={4} className="mt-1" /></div>
            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">Send Message</Button>
            <p className="text-xs text-muted-foreground text-center">We'll get back to you within 2 business hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default ContactPage;
