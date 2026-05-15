import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Building2, CalendarDays, GraduationCap, Receipt, Trophy } from 'lucide-react';
import { useLanguage } from '@/i18n';

const ManagementHub = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-6">
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">Dashboard</p>
        <h1 className="font-display text-2xl font-black">{t('management')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Selecione uma área para gerenciar.</p>
      </header>

      <section className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <QuickAction
          icon={<Trophy className="h-4 w-4 text-neon-cyan sm:h-5 sm:w-5" />}
          label={t('championships')}
          onClick={() => navigate('/management/championships')}
        />
        <QuickAction
          icon={<Receipt className="h-4 w-4 text-neon-pink sm:h-5 sm:w-5" />}
          label={t('managementPayments')}
          onClick={() => navigate('/management/payments')}
        />
        <QuickAction
          icon={<Building2 className="h-4 w-4 text-neon-pink sm:h-5 sm:w-5" />}
          label={t('sportComplexes')}
          onClick={() => navigate('/management/complexes')}
        />
        <QuickAction
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />}
          label={t('courtManagement')}
          disabled
        />
        <QuickAction
          icon={<BookOpen className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />}
          label={t('managementClasses')}
          disabled
        />
        <QuickAction
          icon={<GraduationCap className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />}
          label={t('students')}
          disabled
        />
      </section>
    </div>
  );
};

const QuickAction = ({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-gradient-card p-2.5 text-center transition-smooth sm:gap-2 sm:p-3 ${
      disabled
        ? 'cursor-not-allowed opacity-40 pointer-events-none'
        : 'hover:border-primary/30 hover:bg-secondary/60'
    }`}
  >
    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background/40 sm:h-10 sm:w-10">
      {icon}
    </div>
    <span className="line-clamp-2 text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-muted-foreground sm:text-[10px] sm:tracking-[0.15em]">{label}</span>
  </button>
);

export default ManagementHub;
