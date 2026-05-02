import { Globe } from 'lucide-react';
import { useLanguage } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'pt-BR')}>
      <SelectTrigger
        aria-label={t('languageSelectorAria')}
        className="relative h-9 w-[82px] rounded-lg border-border bg-secondary/60 pl-9 pr-2 text-xs font-semibold tracking-wide text-foreground shadow-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0"
      >
        <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-border bg-gradient-card p-1.5 text-foreground shadow-card backdrop-blur-xl">
        <SelectItem
          value="en"
          className="rounded-lg py-2 pl-8 pr-3 text-xs font-semibold tracking-wide text-foreground focus:bg-primary/15 focus:text-primary-glow"
        >
          EN
        </SelectItem>
        <SelectItem
          value="pt-BR"
          className="rounded-lg py-2 pl-8 pr-3 text-xs font-semibold tracking-wide text-foreground focus:bg-primary/15 focus:text-primary-glow"
        >
          PT
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
