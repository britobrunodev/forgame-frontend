import { Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';

const PendingApproval = () => {
  const { t } = useLanguage();
  const { currentUser, logout } = useSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-xl">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <Clock className="h-8 w-8 text-neon-cyan" />
            </div>
          </div>

          <h1 className="mb-3 font-display text-2xl font-bold tracking-tight">
            {t('pendingApprovalTitle')}
          </h1>

          <p className="mb-2 text-sm text-muted-foreground">
            {t('pendingApprovalDescription')}
          </p>

          <p className="mb-8 text-sm font-semibold text-neon-cyan">
            {currentUser.email}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-gradient-primary py-3 font-display text-sm font-bold uppercase tracking-widest shadow-neon transition-smooth hover:brightness-110 hover:shadow-glow"
            >
              {t('pendingApprovalCheckStatus')}
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm text-muted-foreground transition-smooth hover:border-primary/30 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
