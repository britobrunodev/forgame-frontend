import { Bell, Search } from 'lucide-react';
import { CURRENT_USER } from '@/data/mock';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '@/i18n';

export const TopBar = () => {
  const { t, userTypeLabel } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/60 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:shadow-glow transition-smooth"
        />
      </div>
      <LanguageSelector />
      <button className="relative p-2 rounded-lg hover:bg-secondary/60 transition-smooth">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full shadow-[0_0_8px_hsl(var(--neon-pink))]" />
      </button>
      <div className="flex items-center gap-3 pl-4 border-l border-border">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-bold leading-tight">{CURRENT_USER.name}</div>
          <div className="text-[10px] uppercase tracking-wider text-neon-cyan font-semibold">{userTypeLabel(CURRENT_USER.type)}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-display font-bold text-sm shadow-neon">
          {CURRENT_USER.name.split(' ').map(n => n[0]).join('')}
        </div>
      </div>
    </header>
  );
};
