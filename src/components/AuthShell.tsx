import type { ReactNode } from 'react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/i18n';

type AuthShellProps = {
  mode: 'login' | 'register';
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  children: ReactNode;
};

export const AuthShell = ({ mode, title, subtitle, isLoading, children }: AuthShellProps) => {
  const { t } = useLanguage();

  return (
    <div
      className="relative flex min-h-screen items-start justify-center overflow-hidden p-4 sm:items-center sm:pt-4"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 4rem)' }}
    >
      <div className="absolute inset-0 hex-grid opacity-40" />
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-neon-cyan/5 blur-3xl" />
      {isLoading && (
        <div className="fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden">
          <div className="animate-loading-bar h-full bg-gradient-primary" />
        </div>
      )}
      <div className="absolute right-4 z-10" style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}>
        <LanguageSelector />
      </div>

      <div className="relative w-full max-w-[26rem]">
        <div className="mb-5 text-center">
          <Logo className="mx-auto h-[4.8rem]" />
          {subtitle ? <p className="mt-2 text-sm font-medium text-muted-foreground">{subtitle}</p> : null}
        </div>

        <div className="auth-card-shell perspective-[1600px]">
          <div className={`auth-card-flip-${mode} flex min-h-[34rem] flex-col rounded-2xl border border-border bg-gradient-card p-5 shadow-card backdrop-blur-xl neon-border sm:min-h-[35rem] sm:p-6`}>
            <div className="mb-4 text-center">
              <h2 className="font-display text-2xl font-black uppercase tracking-[0.2em] text-foreground">{title}</h2>
            </div>
            {children}
          </div>
        </div>

        <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          {t('sportsManagement')}
        </p>
      </div>
    </div>
  );
};
