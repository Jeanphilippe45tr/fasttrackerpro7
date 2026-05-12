import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer: React.FC = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="FastTrackerPro" className="h-9 w-9 rounded-lg object-contain bg-card/10" width={36} height={36} />
            <span className="font-bold text-lg">FastTrackerPro</span>
          </div>
          <p className="text-sm opacity-80">Your trusted partner in global logistics and package delivery. Fast, reliable, and transparent shipping solutions across 200+ countries.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <div className="space-y-2 text-sm opacity-80">
            <Link to="/track" className="block hover:opacity-100 transition-opacity">Track Package</Link>
            <Link to="/services" className="block hover:opacity-100 transition-opacity">Services</Link>
            <Link to="/coverage" className="block hover:opacity-100 transition-opacity">Global Coverage</Link>
            <Link to="/pricing" className="block hover:opacity-100 transition-opacity">Pricing</Link>
            <Link to="/reviews" className="block hover:opacity-100 transition-opacity">Reviews</Link>
            <Link to="/faq" className="block hover:opacity-100 transition-opacity">FAQ</Link>
            <Link to="/about" className="block hover:opacity-100 transition-opacity">About Us</Link>
            <Link to="/contact" className="block hover:opacity-100 transition-opacity">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Services</h4>
          <div className="space-y-2 text-sm opacity-80">
            <p>Express Delivery</p>
            <p>Air & Sea Freight</p>
            <p>Warehousing & Fulfillment</p>
            <p>Customs Brokerage</p>
            <p>Last Mile Delivery</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Contact Info</h4>
          <div className="space-y-3 text-sm opacity-80">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@fasttrackerp.com</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> +1 (800) 555-FAST</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> 123 Logistics Ave, NY 10001</div>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-60">
        © {new Date().getFullYear()} FastTrackerPro. All rights reserved. | ISO 9001 & ISO 14001 Certified
      </div>
    </div>
  </footer>
);

export default Footer;
