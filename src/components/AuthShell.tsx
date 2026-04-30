import type { ReactNode } from 'react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/i18n';

type AuthShellProps = {
  mode: 'login' | 'register';
  title: string;
  subtitle: string;
  children: ReactNode;
};

export const AuthShell = ({ mode, title, subtitle, children }: AuthShellProps) => {
  const { t } = useLanguage();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 hex-grid opacity-40" />
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-neon-cyan/5 blur-3xl" />
      <div className="absolute right-4 top-4 z-10">
        <LanguageSelector />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <h1 className="font-display text-3xl font-black tracking-wider neon-text">JOGA JUNTO</h1>
            <div className="mt-1 font-display text-xs font-bold tracking-[0.5em] text-neon-cyan">— 360 —</div>
          </div>
          <p className="mt-3 text-sm font-medium text-muted-foreground">{subtitle}</p>
        </div>

        <div className="auth-card-shell perspective-[1600px]">
          <div className={`auth-card-flip-${mode} flex min-h-[540px] flex-col rounded-2xl border border-border bg-gradient-card p-7 shadow-card backdrop-blur-xl neon-border sm:h-[590px]`}>
            <div className="mb-5 text-center">
              <h2 className="font-display text-2xl font-black uppercase tracking-[0.2em] text-foreground">{title}</h2>
            </div>
            {children}
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          {t('sportsManagement')}
        </p>
      </div>
    </div>
  );
};
