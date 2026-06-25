import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import logo from '@/assets/logo.png';

const Footer: React.FC = () => {
  const { t } = useLang();
  return (
  <footer className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="EuroTransit" className="h-9 w-9 rounded-lg object-contain bg-card/10" width={36} height={36} />
            <span className="font-bold text-lg">EuroTransit</span>
          </div>
          <p className="text-sm opacity-80">{t('footer.tagline')}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
          <div className="space-y-2 text-sm opacity-80">
            <Link to="/track" className="block hover:opacity-100 transition-opacity">{t('nav.track')}</Link>
            <Link to="/services" className="block hover:opacity-100 transition-opacity">{t('nav.services')}</Link>
            <Link to="/coverage" className="block hover:opacity-100 transition-opacity">{t('nav.coverage')}</Link>
            <Link to="/pricing" className="block hover:opacity-100 transition-opacity">{t('nav.pricing')}</Link>
            <Link to="/reviews" className="block hover:opacity-100 transition-opacity">{t('nav.reviews')}</Link>
            <Link to="/faq" className="block hover:opacity-100 transition-opacity">{t('nav.faq')}</Link>
            <Link to="/about" className="block hover:opacity-100 transition-opacity">{t('nav.about')}</Link>
            <Link to="/contact" className="block hover:opacity-100 transition-opacity">{t('nav.contact')}</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">{t('footer.services')}</h4>
          <div className="space-y-2 text-sm opacity-80">
            <p>Express Delivery</p>
            <p>Air & Sea Freight</p>
            <p>Warehousing & Fulfillment</p>
            <p>Customs Brokerage</p>
            <p>Last Mile Delivery</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">{t('footer.contactInfo')}</h4>
          <div className="space-y-3 text-sm opacity-80">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Logistikstraße 12, 10115 Berlin, DE</div>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-60">
        © {new Date().getFullYear()} EuroTransit. {t('footer.rights')}
      </div>
    </div>
  </footer>
  );
};

export default Footer;
