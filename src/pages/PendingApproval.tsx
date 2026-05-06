import { Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';

const SUPPORT_EMAIL = 'contato@forgame.com.br';

const PendingApproval = () => {
  const { t } = useLanguage();
  const { logout } = useSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl">
          <div className="mb-5 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <Clock className="h-7 w-7 text-neon-cyan" />
            </div>
          </div>

          <h1 className="mb-3 font-display text-2xl font-bold tracking-tight">
            {t('pendingApprovalTitle')}
          </h1>

          <p className="mb-2 text-sm text-muted-foreground">
            {t('pendingApprovalDescription')}
          </p>

          <p className="mb-6 text-sm font-semibold text-neon-cyan">
            {SUPPORT_EMAIL}
          </p>

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
  );
};

export default PendingApproval;
