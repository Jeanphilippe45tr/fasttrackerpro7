import React from 'react';
import { Star, Quote } from 'lucide-react';
import CustomerReviews from '@/components/CustomerReviews';
import PartnerLogos from '@/components/PartnerLogos';
import { useLang } from '@/i18n/LanguageContext';

const ReviewsPage: React.FC = () => {
  const { t } = useLang();
  return (
  <div className="min-h-screen">
    <section className="gradient-primary py-16 text-center text-primary-foreground">
      <div className="container mx-auto px-4">
        <Quote className="w-12 h-12 mx-auto mb-4 text-secondary" />
        <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('reviews.title')}</h1>
        <p className="max-w-2xl mx-auto opacity-90">{t('reviews.subtitle')}</p>
        <div className="flex items-center justify-center gap-1 mt-6">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-7 h-7 fill-secondary text-secondary" />)}
          <span className="ml-3 text-2xl font-bold">4.9 / 5</span>
        </div>
        <p className="text-sm opacity-75 mt-2">{t('reviews.based')}</p>
      </div>
    </section>
    <CustomerReviews />
    <PartnerLogos />
  </div>
  );
};

export default ReviewsPage;