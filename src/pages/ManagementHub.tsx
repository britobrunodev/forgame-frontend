import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Trophy, Calendar, GraduationCap, Users, Receipt } from 'lucide-react';
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
          icon={<Building2 className="h-4 w-4 text-neon-pink sm:h-5 sm:w-5" />}
          label={t('courtManagement')}
          onClick={() => navigate('/management/courts')}
        />
        <QuickAction
          icon={<Trophy className="h-4 w-4 text-neon-cyan sm:h-5 sm:w-5" />}
          label={t('championships')}
          onClick={() => navigate('/management/championships')}
        />
        <QuickAction
          icon={<Calendar className="h-4 w-4 text-neon-cyan sm:h-5 sm:w-5" />}
          label={t('managementClasses')}
          onClick={() => navigate('/management/classes')}
        />
        <QuickAction
          icon={<GraduationCap className="h-4 w-4 text-neon-cyan sm:h-5 sm:w-5" />}
          label={t('students')}
          onClick={() => navigate('/management/students')}
        />
        <QuickAction
          icon={<Users className="h-4 w-4 text-neon-cyan sm:h-5 sm:w-5" />}
          label={t('users')}
          onClick={() => navigate('/management/users')}
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
      </section>
    </div>
  );
};

const QuickAction = ({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-gradient-card p-2.5 text-center transition-smooth hover:border-primary/30 hover:bg-secondary/60 sm:gap-2 sm:p-3"
  >
    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background/40 sm:h-10 sm:w-10">
      {icon}
    </div>
    <span className="line-clamp-2 text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-muted-foreground sm:text-[10px] sm:tracking-[0.15em]">{label}</span>
  </button>
);

export default ManagementHub;
