import React from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLang } from '@/i18n/LanguageContext';
import { LANGUAGES } from '@/i18n/translations';

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { lang, setLang } = useLang();
  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-1.5 ${className ?? ''}`}>
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{current.flag}</span>
          <span className="uppercase text-xs font-semibold">{current.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover z-50">
        {LANGUAGES.map(l => (
          <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} className="gap-2 cursor-pointer">
            <span>{l.flag}</span>
            <span className="flex-1">{l.label}</span>
            {l.code === lang && <Check className="w-4 h-4 text-secondary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;