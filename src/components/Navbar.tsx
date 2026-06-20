import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { useLang } from '@/i18n/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import logo from '@/assets/logo.png';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAdminLoggedIn, logoutAdmin, messages } = useApp();
  const { t } = useLang();
  const location = useLocation();
  const adminUnread = messages.filter(m => m.sender === 'client' && !m.readByAdmin).length;

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/track', label: t('nav.track') },
    { path: '/services', label: t('nav.services') },
    { path: '/coverage', label: t('nav.coverage') },
    { path: '/pricing', label: t('nav.pricing') },
    { path: '/reviews', label: t('nav.reviews') },
    { path: '/faq', label: t('nav.faq') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="FastTrackerPro" className="h-9 w-9 rounded-lg object-contain" width={36} height={36} />
            <span className="font-bold text-lg text-foreground">Fast<span className="text-secondary">Tracker</span>Pro</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            {isAdminLoggedIn ? (
              <>
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Shield className="w-4 h-4" /> {t('nav.dashboard')}
                  </Button>
                </Link>
                <Link to="/admin/chat">
                  <Button variant="outline" size="sm" className="gap-1">
                    <MessageSquare className="w-4 h-4" /> {t('nav.chat')}
                    {adminUnread > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                        {adminUnread}
                      </span>
                    )}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logoutAdmin}>{t('nav.logout')}</Button>
              </>
            ) : (
              <Link to="/admin/login">
                <Button size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Shield className="w-4 h-4" /> {t('nav.admin')}
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            <LanguageSwitcher />
            <button className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-border space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.path) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border space-y-1">
              {isAdminLoggedIn ? (
                <>
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-muted-foreground">{t('nav.dashboard')}</Link>
                  <button onClick={() => { logoutAdmin(); setMobileOpen(false); }} className="block px-3 py-2 text-sm font-medium text-muted-foreground">{t('nav.logout')}</button>
                </>
              ) : (
                <Link to="/admin/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-muted-foreground">{t('nav.adminLogin')}</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
